using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MissionsController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public MissionsController(BudgetBounderDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<Mission>> GetUserMissions(int userId)
        {
            StaticMissionService.GenerateStaticMissions(userId, _context);

            var now = DateTime.UtcNow;
            var missions = _context.Missions
                .Where(m => m.UserId == userId && !m.IsCompleted && m.ExpiresAt > now)
                .ToList();
            return Ok(missions);
        }

        [HttpPost("generate/{userId}")]
        public async Task<ActionResult<List<Mission>>> GenerateMissions(int userId)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            var transactions = _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .Take(30)
                .ToList();

            var txSummary = transactions.Count > 0
                ? string.Join("\n", transactions.Select(t =>
                    $"- {t.Date:yyyy-MM-dd}: {t.Title} ({t.Category}) {(t.Type == TransactionType.Income ? "+" : "-")}${t.Amount:F2}"))
                : "No transactions yet.";

            var apiKey = _configuration["Groq:ApiKey"]?.Trim();

            var body = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content =
                            "You are a financial mission generator for BudgetBounder, a personal finance app.\n" +
                            "Rules:\n" +
                            "- Respond with ONLY a valid JSON array. No markdown fences, no extra text, nothing before or after the JSON.\n" +
                            "- Each object must have exactly these fields:\n" +
                            "  title (string), description (string), xpReward (integer 50-200), difficulty (\"Easy\"|\"Medium\"|\"Hard\"),\n" +
                            "  missionType (\"LogExpenses\"|\"StayUnderBudget\"|\"SavingGoal\"|\"DailyStreak\"), targetValue (number)\n" +
                            "- Make missions specific to the user's spending patterns."
                    },
                    new
                    {
                        role = "user",
                        content =
                            $"Based on the user's last {transactions.Count} transactions below, generate exactly 3 personalized financial missions.\n\n" +
                            $"User transactions:\n{txSummary}"
                    }
                },
                max_tokens = 512,
                temperature = 0.7
            };

            string rawText;
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", apiKey);

                var json = JsonSerializer.Serialize(body);
                var httpContent = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    httpContent);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Groq error {(int)response.StatusCode}: {responseBody}");
                    return StatusCode((int)response.StatusCode, responseBody);
                }

                using var doc = JsonDocument.Parse(responseBody);
                rawText = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Groq call failed: {ex.Message}");
                return StatusCode(500, ex.Message);
            }

            // Strip any markdown code fences the model may have added despite instructions
            rawText = rawText.Trim();
            if (rawText.StartsWith("```"))
            {
                var firstNewline = rawText.IndexOf('\n');
                var lastFence = rawText.LastIndexOf("```");
                if (firstNewline >= 0 && lastFence > firstNewline)
                    rawText = rawText[(firstNewline + 1)..lastFence].Trim();
            }

            List<Mission> missions;
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var dtos = JsonSerializer.Deserialize<List<MissionDto>>(rawText, options)
                           ?? throw new Exception("Deserialized to null");

                var now = DateTime.UtcNow;
                var existingTypes = _context.Missions
                    .Where(m => m.UserId == userId && !m.IsCompleted && m.ExpiresAt > now)
                    .Select(m => m.MissionType)
                    .ToHashSet();

                missions = dtos
                    .Where(dto => !existingTypes.Contains(dto.MissionType))
                    .Select(dto => new Mission
                    {
                        UserId = userId,
                        Title = dto.Title,
                        Description = dto.Description,
                        XPReward = dto.XpReward,
                        Difficulty = dto.Difficulty,
                        MissionType = dto.MissionType,
                        TargetValue = dto.TargetValue,
                        CurrentProgress = 0,
                        CreatedAt = now,
                        ExpiresAt = now.AddDays(7)
                    }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Mission parse failed: {ex.Message}\nRaw: {rawText}");
                return StatusCode(500, $"Failed to parse Groq response: {ex.Message}");
            }

            try
            {
                _context.Missions.AddRange(missions);
                _context.SaveChanges();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                Console.WriteLine($"Duplicate mission skipped: {ex.InnerException?.Message ?? ex.Message}");
            }

            return Ok(missions);
        }

        [HttpPost("{id}/complete")]
        public ActionResult<object> CompleteMission(int id)
        {
            var mission = _context.Missions.Find(id);
            if (mission == null) return NotFound();
            if (mission.IsCompleted) return BadRequest("Mission already completed");

            mission.IsCompleted = true;
            mission.CompletedAt = DateTime.UtcNow;

            var user = _context.Users.Find(mission.UserId);
            if (user != null)
            {
                user.XP += mission.XPReward;
                user.Level = LevelService.CalculateLevel(user.XP);
            }

            _context.SaveChanges();

            return Ok(new { mission, xp = user?.XP, level = user?.Level });
        }
    }

    public class MissionDto
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public int XpReward { get; set; }
        public string Difficulty { get; set; } = "Easy";
        public string MissionType { get; set; } = "";
        public double TargetValue { get; set; }
    }
}

using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
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
    public class AiController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public AiController(BudgetBounderDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<string>> Chat([FromBody] AiChatRequest request)
        {
            var transactions = _context.Transactions
                .Where(t => t.UserId == request.UserId)
                .OrderByDescending(t => t.Date)
                .Take(20)
                .ToList();

            var txSummary = transactions.Count > 0
                ? string.Join("\n", transactions.Select(t =>
                    $"- {t.Date:yyyy-dd-MM}: {t.Title} ({t.Category}) — {(t.Type == TransactionType.Income ? "+" : "-")}${t.Amount:F2}"))
                : "No transactions found.";

            var apiKey = _configuration["Groq:ApiKey"]?.Trim();

            var body = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content = $"You are a helpful personal finance assistant for BudgetBounder. Answer concisely and practically.\n\nThe user's last {transactions.Count} transactions:\n{txSummary}"
                    },
                    new
                    {
                        role = "user",
                        content = request.Message
                    }
                },
                max_tokens = 512,
                temperature = 0.7
            };

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", apiKey);

                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    content);

                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Groq error {(int)response.StatusCode}: {responseBody}");
                    return StatusCode((int)response.StatusCode, responseBody);
                }

                using var doc = JsonDocument.Parse(responseBody);
                var text = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return Ok(text);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Groq call failed: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }
    }

    public class AiChatRequest
    {
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}

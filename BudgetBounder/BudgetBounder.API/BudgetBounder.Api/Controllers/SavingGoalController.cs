using System.Linq;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetBounder.Api.Authorization;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SavingGoalsController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public SavingGoalsController(BudgetBounderDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public ActionResult<List<SavingGoal>> GetSavingGoals()
        {
            return _context.SavingGoals.ToList();
        }

        [HttpPost]
        public ActionResult<SavingGoal> CreateSavingGoal(SavingGoal goal)
        {
            if (_currentUser.UserId is not int userId) return Unauthorized();
            goal.UserId = userId;
            if (goal.TargetAmount <= 0 || goal.Deadline <= DateTime.UtcNow) return BadRequest("A positive target and future deadline are required.");
            _context.SavingGoals.Add(goal);
            _context.SaveChanges();
            return goal;
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<SavingGoal>> GetUserGoals(int userId)
        {
            if (_currentUser.UserId != userId && !_currentUser.IsAdmin) return Forbid();
            var userSavingGoals = _context.SavingGoals
                .Where(t => t.UserId == userId)
                .ToList();

            return userSavingGoals;
        }
        [HttpGet("user/{userId}/progress")]
        public ActionResult<object> PeriodProgress(int userId)
        {
            if (_currentUser.UserId != userId && !_currentUser.IsAdmin) return Forbid();
            var today = DateTime.UtcNow.Date;
            var week = today.AddDays(-((int)today.DayOfWeek + 6) % 7);
            var month = new DateTime(today.Year, today.Month, 1);
            var query = _context.SavingContributions.Where(c => c.UserId == userId);
            return Ok(new { weekStart = week, monthStart = month,
                weeklyAmount = query.Where(c => c.CreatedAt >= week).Sum(c => (double?)c.Amount) ?? 0,
                monthlyAmount = query.Where(c => c.CreatedAt >= month).Sum(c => (double?)c.Amount) ?? 0,
                history = query.OrderByDescending(c => c.CreatedAt).Take(30).ToList() });
        }

        [HttpPut("{id}/progress")]
        public ActionResult<SavingGoal> UpdateSavingProgress(int id, double amountToAdd)
        {
            var goal = _context.SavingGoals.FirstOrDefault(g => g.Id == id);
            if (goal == null)
            {
                return NotFound();
            }
            if (_currentUser.UserId != goal.UserId && !_currentUser.IsAdmin) return Forbid();

            if (!double.IsFinite(amountToAdd) || amountToAdd <= 0)
            {
                return BadRequest("Amount to add must be greater than 0.");
            }

            bool wasCompleted = goal.IsCompleted;

            goal.CurrentAmount += amountToAdd;
            _context.SavingContributions.Add(new SavingContribution { UserId = goal.UserId, SavingGoalId = goal.Id, Amount = amountToAdd });

            if (goal.CurrentAmount >= goal.TargetAmount)
            {
                goal.IsCompleted = true;
            }

            if (!wasCompleted && goal.IsCompleted)
            {
                var user = _context.Users.FirstOrDefault(u => u.Id == goal.UserId);

                if (user != null)
                {
                    ProgressionService.AwardXp(user, 100);
                }
            }

            // Auto-complete active SavingGoal mission on any progress update
            var now = DateTime.UtcNow;
            var savingMissions = _context.Missions
                .Where(m => m.UserId == goal.UserId
                                  && m.MissionType == "SavingGoal"
                                  && m.ReviewStatus == "Approved"
                                  && !m.IsCompleted
                                  && m.ExpiresAt > now).ToList();

            foreach (var savingMission in savingMissions)
            {
                savingMission.CurrentProgress += 1;
                if (savingMission.CurrentProgress >= savingMission.TargetValue)
                {
                    savingMission.IsCompleted = true;
                    savingMission.CompletedAt = now;
                    // Find returns the tracked instance if already loaded above, or queries fresh
                    var missionUser = _context.Users.Find(goal.UserId);
                    if (missionUser != null)
                    {
                        ProgressionService.AwardXp(missionUser, savingMission.XPReward);
                    }
                }
            }

            _context.SaveChanges();
            return goal;
        }
    }
}

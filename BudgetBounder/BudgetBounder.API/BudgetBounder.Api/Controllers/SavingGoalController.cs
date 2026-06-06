using System.Linq;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SavingGoalsController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;

        public SavingGoalsController(BudgetBounderDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<List<SavingGoal>> GetSavingGoals()
        {
            return _context.SavingGoals.ToList();
        }

        [HttpPost]
        public ActionResult<SavingGoal> CreateSavingGoal(SavingGoal goal)
        {
            _context.SavingGoals.Add(goal);
            _context.SaveChanges();
            return goal;
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<SavingGoal>> GetUserGoals(int userId)
        {
            var userSavingGoals = _context.SavingGoals
                .Where(t => t.UserId == userId)
                .ToList();

            return userSavingGoals;
        }
        [HttpPut("{id}/progress")]
        public ActionResult<SavingGoal> UpdateSavingProgress(int id, double amountToAdd)
        {
            var goal = _context.SavingGoals.FirstOrDefault(g => g.Id == id);
            if (goal == null)
            {
                return NotFound();
            }

            if (amountToAdd <= 0)
            {
                return BadRequest("Amount to add must be greater than 0.");
            }

            bool wasCompleted = goal.IsCompleted;

            goal.CurrentAmount += amountToAdd;

            if (goal.CurrentAmount >= goal.TargetAmount)
            {
                goal.IsCompleted = true;
            }

            if (!wasCompleted && goal.IsCompleted)
            {
                var user = _context.Users.FirstOrDefault(u => u.Id == goal.UserId);

                if (user != null)
                {
                    user.XP += 100;
                    user.Level = LevelService.CalculateLevel(user.XP);
                }
            }

            // Auto-complete active SavingGoal mission on any progress update
            var now = DateTime.UtcNow;
            var savingMission = _context.Missions
                .FirstOrDefault(m => m.UserId == goal.UserId
                                  && m.MissionType == "SavingGoal"
                                  && !m.IsCompleted
                                  && m.ExpiresAt > now);

            if (savingMission != null)
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
                        missionUser.XP += savingMission.XPReward;
                        missionUser.Level = LevelService.CalculateLevel(missionUser.XP);
                    }
                }
            }

            _context.SaveChanges();
            return goal;
        }
    }
}
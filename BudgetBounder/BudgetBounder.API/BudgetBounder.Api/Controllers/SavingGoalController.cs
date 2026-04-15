using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        [HttpPut("saving goals/{id}/progress")]
        public ActionResult<List<SavingGoal>> GetSavingProgress()
        {
            
        }
    }
}
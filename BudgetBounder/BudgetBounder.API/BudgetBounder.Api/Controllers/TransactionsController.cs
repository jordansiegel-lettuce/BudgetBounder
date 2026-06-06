using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;

        public TransactionsController(BudgetBounderDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<List<Transaction>> GetTransactions()
        {
            return _context.Transactions.ToList();
        }

        [HttpPost]
        public ActionResult<Transaction> ReceiveTransaction(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            AutoCompleteMission(transaction.UserId, transaction.Type);
            _context.SaveChanges();
            return transaction;
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<Transaction>> GetUserTransactions(int userId)
        {
            var userTransactions = _context.Transactions
                .Where(t => t.UserId == userId)
                .ToList();
            return userTransactions;
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteTransaction(int id)
        {
            var transaction = _context.Transactions.Find(id);
            if (transaction == null) return NotFound();
            _context.Transactions.Remove(transaction);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("complete")]
        public ActionResult<object> CompleteTransaction([FromBody] CompleteTransactionRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == request.UserId);
            if (user == null) return NotFound("User not found");

            var transaction = new Transaction
            {
                Title = request.Title,
                Amount = request.Amount,
                Type = TransactionType.Expense,
                Category = request.Category,
                Date = DateTime.UtcNow,
                UserId = request.UserId
            };

            _context.Transactions.Add(transaction);

            user.XP += 10;
            user.Level = LevelService.CalculateLevel(user.XP);

            AutoCompleteMission(request.UserId, TransactionType.Expense);

            _context.SaveChanges();

            return Ok(new { transaction, user.XP, user.Level });
        }

        private void AutoCompleteMission(int userId, TransactionType type)
        {
            var missionType = type == TransactionType.Income ? "LogIncome" : "LogExpenses";
            var now = DateTime.UtcNow;

            var mission = _context.Missions
                .FirstOrDefault(m => m.UserId == userId
                                  && m.MissionType == missionType
                                  && !m.IsCompleted
                                  && m.ExpiresAt > now);

            if (mission == null) return;

            mission.CurrentProgress += 1;
            if (mission.CurrentProgress >= mission.TargetValue)
            {
                mission.IsCompleted = true;
                mission.CompletedAt = now;

                // _context.Users.Find returns the already-tracked instance if loaded, or queries fresh
                var user = _context.Users.Find(userId);
                if (user != null)
                {
                    user.XP += mission.XPReward;
                    user.Level = LevelService.CalculateLevel(user.XP);
                }
            }
        }
    }

    public class CompleteTransactionRequest
    {
        public int UserId { get; set; }
        public double Amount { get; set; }
        public string Title { get; set; } = "Expense";
        public string Category { get; set; } = "General";
    }
}

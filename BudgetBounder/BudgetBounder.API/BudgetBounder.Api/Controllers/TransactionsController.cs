using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using BudgetBounder.Api.Authorization;
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
        private readonly ICurrentUserService _currentUser;

        public TransactionsController(BudgetBounderDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public ActionResult<List<Transaction>> GetTransactions()
        {
            return _context.Transactions.ToList();
        }

        [HttpPost]
        public ActionResult<Transaction> ReceiveTransaction(Transaction transaction)
        {
            if (_currentUser.UserId is not int userId) return Unauthorized();
            transaction.UserId = userId;
            if (transaction.Amount <= 0) return BadRequest("Amount must be greater than zero.");
            if (transaction.Latitude is < -90 or > 90 || transaction.Longitude is < -180 or > 180)
                return BadRequest("Merchant coordinates are invalid.");
            if (transaction.ReceiptImageDataUrl?.Length > 7_000_000)
                return BadRequest("Receipt image is too large.");
            var user = _context.Users.Find(userId);
            if (user == null) return NotFound("User not found.");
            _context.Transactions.Add(transaction);
            ProgressionService.AwardXp(user, 10);
            ProgressionService.UpdateStreak(user, DateOnly.FromDateTime(DateTime.UtcNow));
            AutoCompleteMission(userId, transaction.Type);
            _context.SaveChanges();
            return transaction;
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<Transaction>> GetUserTransactions(int userId)
        {
            if (_currentUser.UserId != userId && !_currentUser.IsAdmin) return Forbid();
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
            if (_currentUser.UserId != transaction.UserId && !_currentUser.IsAdmin) return Forbid();
            _context.Transactions.Remove(transaction);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("complete")]
        public ActionResult<object> CompleteTransaction([FromBody] CompleteTransactionRequest request)
        {
            if (_currentUser.UserId is not int userId) return Unauthorized();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            var transaction = new Transaction
            {
                Title = request.Title,
                Amount = request.Amount,
                Type = TransactionType.Expense,
                Category = request.Category,
                Date = DateTime.UtcNow,
                UserId = userId
            };

            _context.Transactions.Add(transaction);

            ProgressionService.AwardXp(user, 10);
            ProgressionService.UpdateStreak(user, DateOnly.FromDateTime(DateTime.UtcNow));

            AutoCompleteMission(userId, TransactionType.Expense);

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

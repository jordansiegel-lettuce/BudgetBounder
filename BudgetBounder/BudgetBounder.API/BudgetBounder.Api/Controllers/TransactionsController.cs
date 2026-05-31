using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
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
            _context.SaveChanges();
            return transaction;
        }
        [HttpGet("user/{userId}")]
        public ActionResult<List<Transaction>> GetUserTransactions( int userId)
        {
            var userTransactions = _context.Transactions
           .Where(t => t.UserId == userId)
           .ToList();
            return userTransactions;
        }
    }
}
using BudgetBounder.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Data
{
    public class BudgetBounderDbContext : DbContext
    {
        public BudgetBounderDbContext(DbContextOptions<BudgetBounderDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<SavingGoal> SavingGoals { get; set; }
    }
}
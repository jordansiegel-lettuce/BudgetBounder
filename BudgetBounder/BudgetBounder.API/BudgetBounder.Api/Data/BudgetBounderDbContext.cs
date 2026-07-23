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
        public DbSet<Mission> Missions { get; set; }
        public DbSet<MonthlyBudget> MonthlyBudgets { get; set; }
        public DbSet<AdminAuditLog> AdminAuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Mission>()
                .HasIndex(m => new { m.UserId, m.MissionType, m.ExpiresAt })
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<MonthlyBudget>()
                .HasIndex(b => new { b.UserId, b.Month })
                .IsUnique();

            modelBuilder.Entity<Transaction>()
                .HasIndex(t => new { t.UserId, t.Date });

            modelBuilder.Entity<SavingGoal>()
                .HasIndex(g => new { g.UserId, g.Deadline });

            modelBuilder.Entity<AdminAuditLog>()
                .HasOne(a => a.AdminUser)
                .WithMany()
                .HasForeignKey(a => a.AdminUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

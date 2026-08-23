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
        public DbSet<ReminderPreferences> ReminderPreferences { get; set; }
        public DbSet<AiRecommendation> AiRecommendations { get; set; }
        public DbSet<GameSession> GameSessions { get; set; }
        public DbSet<RewardDefinition> RewardDefinitions { get; set; }
        public DbSet<UserReward> UserRewards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Mission>()
                .HasIndex(m => new { m.UserId, m.MissionType, m.ExpiresAt })
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email);

            modelBuilder.Entity<MonthlyBudget>()
                .HasIndex(b => new { b.UserId, b.Month })
                .IsUnique();

            modelBuilder.Entity<Transaction>()
                .HasIndex(t => new { t.UserId, t.Date });

            modelBuilder.Entity<SavingGoal>()
                .HasIndex(g => new { g.UserId, g.Deadline });

            modelBuilder.Entity<ReminderPreferences>()
                .HasIndex(p => p.UserId)
                .IsUnique();

            modelBuilder.Entity<AdminAuditLog>()
                .HasOne(a => a.AdminUser)
                .WithMany()
                .HasForeignKey(a => a.AdminUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AiRecommendation>()
                .HasIndex(r => new { r.Status, r.CreatedAt });
            modelBuilder.Entity<AiRecommendation>()
                .HasOne(r => r.ReviewedByAdmin)
                .WithMany()
                .HasForeignKey(r => r.ReviewedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GameSession>()
                .HasIndex(s => new { s.UserId, s.ClientResultId })
                .IsUnique();
            modelBuilder.Entity<GameSession>()
                .HasIndex(s => new { s.UserId, s.SubmittedAt });

            modelBuilder.Entity<RewardDefinition>()
                .HasIndex(r => r.Code)
                .IsUnique();
            modelBuilder.Entity<UserReward>()
                .HasIndex(r => new { r.UserId, r.RewardDefinitionId })
                .IsUnique();
        }
    }
}

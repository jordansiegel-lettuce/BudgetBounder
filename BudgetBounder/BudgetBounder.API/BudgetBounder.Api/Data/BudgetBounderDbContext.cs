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
        public DbSet<SavingContribution> SavingContributions { get; set; }
        public DbSet<LevelHistory> LevelHistory { get; set; }

        private void RecordProgress()
        {
            ChangeTracker.DetectChanges();
            foreach (var entry in ChangeTracker.Entries<User>().Where(e => e.State == EntityState.Modified).ToList())
            {
                if (entry.Property(u => u.XP).OriginalValue == entry.Entity.XP && entry.Property(u => u.Level).OriginalValue == entry.Entity.Level) continue;
                if (!LevelHistory.Local.Any(h => h.UserId == entry.Entity.Id && Entry(h).State == EntityState.Added))
                    LevelHistory.Add(new LevelHistory { UserId = entry.Entity.Id, XP = entry.Entity.XP, Level = entry.Entity.Level });
            }
        }
        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            RecordProgress();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }
        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            RecordProgress();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }
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
            modelBuilder.Entity<SavingContribution>().HasIndex(c => new { c.UserId, c.CreatedAt });
            modelBuilder.Entity<LevelHistory>().HasIndex(h => new { h.UserId, h.RecordedAt });

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

using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Services;

public class AdminDashboardServiceTests
{
    [Fact]
    public async Task OverviewReturnsOperationalAggregateCounts()
    {
        await using var db = new BudgetBounderDbContext(
            new DbContextOptionsBuilder<BudgetBounderDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);
        db.Users.AddRange(
            new User { FullName = "Active", Email = "active@example.com", PasswordHash = "x", IsActive = true, LastActiveAt = DateTime.UtcNow },
            new User { FullName = "Inactive", Email = "inactive@example.com", PasswordHash = "x", IsActive = false });
        db.Transactions.Add(new Transaction { UserId = 1, Title = "Food", Amount = 20, Category = "Food", Date = DateTime.UtcNow });
        db.Missions.Add(new Mission { UserId = 1, Title = "Done", IsCompleted = true, ExpiresAt = DateTime.UtcNow.AddDays(1), MissionType = "Test" });
        db.SavingGoals.Add(new SavingGoal { UserId = 1, Title = "Laptop", TargetAmount = 1000, Deadline = DateTime.UtcNow.AddMonths(2) });
        await db.SaveChangesAsync();

        var overview = await new AdminDashboardService(db).GetOverviewAsync();

        Assert.Equal(2, overview.TotalUsers);
        Assert.Equal(1, overview.ActiveUsers);
        Assert.Equal(1, overview.InactiveUsers);
        Assert.Equal(1, overview.TransactionsLogged);
        Assert.Equal(1, overview.MissionsCompleted);
        Assert.Equal(1, overview.SavingsGoalsCreated);
    }
}

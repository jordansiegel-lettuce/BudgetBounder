using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;
namespace BudgetBounder.Api.Tests.Services;
public class AdminAnalyticsTests
{
    [Fact]
    public async Task FiltersCohortAndInclusiveEventDatesIndependentlyOfRegistration()
    {
        await using var db = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Users.AddRange(new User { Id = 1, FullName = "One", Email = "one@test", PasswordHash = "x", CreatedAt = new DateTime(2020,1,1), IsActive = true }, new User { Id = 2, FullName = "Two", Email = "two@test", PasswordHash = "x", IsActive = false });
        db.Transactions.AddRange(new Transaction { UserId = 1, Date = new DateTime(2026,9,5,23,59,59) }, new Transaction { UserId = 1, Date = new DateTime(2026,9,6) }, new Transaction { UserId = 2, Date = new DateTime(2026,9,5) });
        db.Missions.Add(new Mission { UserId = 1, CreatedAt = new DateTime(2026,8,1), CompletedAt = new DateTime(2026,9,5), IsCompleted = true, XPReward = 20 });
        await db.SaveChangesAsync();
        var result = await new AdminDashboardService(db).GetAnalyticsAsync(new AdminAnalyticsFilter { StartDate = new(2026,9,5), EndDate = new(2026,9,5), IsActive = true });
        Assert.Equal(1, result.Summary.TotalUsers);
        Assert.Equal(0, result.Summary.NewRegistrations);
        Assert.Equal(1, result.Summary.TransactionsLogged);
        Assert.Equal(1, result.Summary.MissionsCompleted);
        Assert.Equal(20, Assert.Single(result.Trend).MissionXp);
    }
    [Fact]
    public async Task RecordsRealLevelChangesWithoutDuplicatingUnchangedSaves()
    {
        await using var db = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var user = new User { FullName="User",Email="user@test",PasswordHash="x",Level=1 }; db.Users.Add(user); await db.SaveChangesAsync();
        ProgressionService.AwardXp(user,100); await db.SaveChangesAsync(); await db.SaveChangesAsync();
        var history=Assert.Single(db.LevelHistory); Assert.Equal(2,history.Level); Assert.Equal(100,history.XP);
        var analytics=await new AdminDashboardService(db).GetAnalyticsAsync(new AdminAnalyticsFilter {UserId=user.Id}); Assert.Equal(2,Assert.Single(analytics.LevelHistory).Level);
    }
    [Fact]
    public async Task RejectsReversedDatesAndInvalidUser()
    {
        await using var db = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var service = new AdminDashboardService(db);
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetAnalyticsAsync(new AdminAnalyticsFilter { StartDate = new(2026,9,6), EndDate = new(2026,9,5) }));
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetAnalyticsAsync(new AdminAnalyticsFilter { UserId = -1 }));
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetAnalyticsAsync(new AdminAnalyticsFilter { UserId = 999 }));
    }
}

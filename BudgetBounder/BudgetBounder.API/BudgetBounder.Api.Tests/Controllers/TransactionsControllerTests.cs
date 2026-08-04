using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class TransactionsControllerTests
{
    [Fact]
    public void ReceiveTransaction_AwardsBaseXpUpdatesStreakAndCompletesMatchingMission()
    {
        using var context = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(nameof(ReceiveTransaction_AwardsBaseXpUpdatesStreakAndCompletesMatchingMission)).Options);
        var user = new User { Id = 7, FullName = "Player", Email = "player@example.com", PasswordHash = "unused" };
        var mission = new Mission
        {
            UserId = user.Id,
            Title = "Log an expense",
            Description = "Record one expense",
            MissionType = "LogExpenses",
            TargetValue = 1,
            XPReward = 15,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        context.AddRange(user, mission);
        context.SaveChanges();
        var controller = new TransactionsController(context, new CurrentUser(user.Id));

        controller.ReceiveTransaction(new Transaction { Amount = 20, Title = "Cafe", Type = TransactionType.Expense, Date = DateTime.UtcNow });

        Assert.Equal(25, user.XP);
        Assert.Equal(1, user.CurrentStreak);
        Assert.True(mission.IsCompleted);
        Assert.Equal(1, mission.CurrentProgress);
    }

    [Fact]
    public void ReceiveTransaction_RejectsInvalidMerchantCoordinates()
    {
        using var context = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(nameof(ReceiveTransaction_RejectsInvalidMerchantCoordinates)).Options);
        var controller = new TransactionsController(context, new CurrentUser(3));

        var result = controller.ReceiveTransaction(new Transaction { Amount = 20, Title = "Cafe", Latitude = 120, Longitude = 34 });

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(context.Transactions);
    }

    private sealed record CurrentUser(int Id) : ICurrentUserService
    {
        public int? UserId => Id;
        public bool IsAdmin => false;
    }
}

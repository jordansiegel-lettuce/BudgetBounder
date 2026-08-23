using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Data;

public class AdminPersistenceTests
{
    [Fact]
    public void UserReward_HasUniqueUserAndRewardIndex()
    {
        using var context = CreateContext();

        var entity = context.Model.FindEntityType(typeof(UserReward));

        Assert.NotNull(entity);
        Assert.Contains(entity.GetIndexes(), index =>
            index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(UserReward.UserId), nameof(UserReward.RewardDefinitionId)]));
    }

    [Fact]
    public void GameSession_HasUniqueClientResultPerUserIndex()
    {
        using var context = CreateContext();

        var entity = context.Model.FindEntityType(typeof(GameSession));

        Assert.NotNull(entity);
        Assert.Contains(entity.GetIndexes(), index =>
            index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(GameSession.UserId), nameof(GameSession.ClientResultId)]));
    }

    private static BudgetBounderDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BudgetBounderDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BudgetBounderDbContext(options);
    }
}

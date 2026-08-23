using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class AdminRewardsTests
{
    [Fact]
    public async Task Create_RejectsFinancialRewardType()
    {
        await using var context = CreateContext();
        var controller = new AdminRewardsController(context, new TestCurrentUser(1));

        var result = await controller.Create(new AdminRewardCreateRequest("gold", "Gold", "Cash prize", "Cash"), default);

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(context.RewardDefinitions);
    }

    [Fact]
    public async Task Create_NormalizesCodeAndWritesAuditEntry()
    {
        await using var context = CreateContext();
        var controller = new AdminRewardsController(context, new TestCurrentUser(1));

        var result = await controller.Create(new AdminRewardCreateRequest("  First Saver ", "First Saver", "Badge", "Badge"), default);

        var created = Assert.IsType<CreatedResult>(result.Result);
        Assert.NotNull(created.Value);
        Assert.Equal("first-saver", context.RewardDefinitions.Single().Code);
        Assert.Contains(context.AdminAuditLogs, entry => entry.Action == "CreateRewardDefinition");
    }

    private static BudgetBounderDbContext CreateContext() => new(
        new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed record TestCurrentUser(int Id) : ICurrentUserService
    {
        public int? UserId => Id;
        public bool IsAdmin => true;
    }
}

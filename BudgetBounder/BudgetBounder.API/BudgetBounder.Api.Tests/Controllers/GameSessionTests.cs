using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class GameSessionTests
{
    [Fact]
    public async Task Submit_DuplicateClientResult_DoesNotDoubleAwardXp()
    {
        await using var context = CreateContext();
        context.Users.Add(new User { Id = 4, FullName = "Player", Email = "p@example.com", PasswordHash = "hash", Level = 1 });
        await context.SaveChangesAsync();
        var controller = new GameSessionsController(context, new TestCurrentUser(4));
        var request = new GameSessionSubmitRequest(Guid.NewGuid(), 1200, 95, 20, 3);

        var first = await controller.Submit(request, CancellationToken.None);
        var xpAfterFirst = context.Users.Single().XP;
        var second = await controller.Submit(request, CancellationToken.None);

        Assert.IsType<OkObjectResult>(first.Result);
        Assert.IsType<OkObjectResult>(second.Result);
        Assert.Single(context.GameSessions);
        Assert.Equal(xpAfterFirst, context.Users.Single().XP);
    }

    [Fact]
    public void Validate_FlagsImpossibleScore()
    {
        var result = GameResultValidator.Validate(new GameSessionSubmitRequest(Guid.NewGuid(), 100_001, 60, 1, 1));
        Assert.Equal(GameSessionValidationStates.Flagged, result.State);
        Assert.Equal(0, result.AwardedXp);
    }

    private static BudgetBounderDbContext CreateContext() => new(
        new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed record TestCurrentUser(int Id) : ICurrentUserService
    {
        public int? UserId => Id;
        public bool IsAdmin => false;
    }
}

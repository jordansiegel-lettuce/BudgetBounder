using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class AdminAiControllerTests
{
    [Fact]
    public async Task Review_RecordsAuthenticatedAdminAndDecision()
    {
        await using var context = CreateContext();
        context.AiRecommendations.Add(new AiRecommendation { Id = 7, UserId = 3, Title = "Save", Content = "Try a weekly transfer" });
        await context.SaveChangesAsync();
        var controller = new AdminAiController(context, new TestCurrentUser(9));

        var result = await controller.Review(7, new AdminAiReviewRequest("Approved"), CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
        var recommendation = context.AiRecommendations.Single();
        Assert.Equal(AiRecommendationStatuses.Approved, recommendation.Status);
        Assert.Equal(9, recommendation.ReviewedByAdminId);
        Assert.NotNull(recommendation.ReviewedAt);
        Assert.Contains(context.AdminAuditLogs, entry => entry.Action == "ReviewAiRecommendation" && entry.AdminUserId == 9);
    }

    [Fact]
    public async Task Review_RejectsSecondDecision()
    {
        await using var context = CreateContext();
        context.AiRecommendations.Add(new AiRecommendation { Id = 7, UserId = 3, Title = "Save", Content = "Transfer", Status = AiRecommendationStatuses.Rejected });
        await context.SaveChangesAsync();
        var controller = new AdminAiController(context, new TestCurrentUser(9));

        var result = await controller.Review(7, new AdminAiReviewRequest("Approved"), CancellationToken.None);

        Assert.IsType<ConflictObjectResult>(result);
    }

    private static BudgetBounderDbContext CreateContext() => new(
        new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed record TestCurrentUser(int Id) : ICurrentUserService
    {
        public int? UserId => Id;
        public bool IsAdmin => true;
    }
}

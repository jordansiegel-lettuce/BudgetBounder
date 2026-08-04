using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class MissionsControllerTests
{
    [Fact]
    public void GetUserMissions_IncludesMissionsCompletedToday()
    {
        using var context = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(nameof(GetUserMissions_IncludesMissionsCompletedToday)).Options);
        context.Missions.Add(new Mission
        {
            UserId = 4,
            Title = "Completed expense mission",
            Description = "Finished",
            MissionType = "LogExpenses",
            TargetValue = 1,
            CurrentProgress = 1,
            XPReward = 15,
            IsCompleted = true,
            CompletedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        });
        context.SaveChanges();
        var controller = new MissionsController(context, new HttpClientFactory(), new ConfigurationBuilder().Build(), new CurrentUser(4));

        var result = controller.GetUserMissions(4);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var missions = Assert.IsAssignableFrom<IEnumerable<Mission>>(ok.Value);
        Assert.Contains(missions, mission => mission.IsCompleted && mission.Title == "Completed expense mission");
    }

    private sealed class HttpClientFactory : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new();
    }

    private sealed record CurrentUser(int Id) : ICurrentUserService
    {
        public int? UserId => Id;
        public bool IsAdmin => false;
    }
}

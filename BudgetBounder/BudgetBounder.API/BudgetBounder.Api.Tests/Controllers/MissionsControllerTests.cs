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

    [Theory]
    [InlineData(false, 0)]
    [InlineData(true, 1)]
    public void CompleteMission_DeniesUnearnedOrExpired(bool expired, double progress)
    {
        using var context = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var mission = new Mission { UserId = 4, TargetValue = 1, CurrentProgress = progress, ExpiresAt = DateTime.UtcNow.AddDays(expired ? -1 : 1) };
        context.Missions.Add(mission);
        context.SaveChanges();
        var controller = new MissionsController(context, new HttpClientFactory(), new ConfigurationBuilder().Build(), new CurrentUser(4));
        Assert.IsType<BadRequestObjectResult>(controller.CompleteMission(mission.Id).Result);
        Assert.False(mission.IsCompleted);
    }

    [Theory]
    [InlineData("Draft")]
    [InlineData("Rejected")]
    public void UnapprovedMissionIsHiddenAndCannotBeClaimed(string status)
    {
        using var db = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var mission = new Mission { UserId = 4, Title = "Unreviewed", IsAiGenerated = true, ReviewStatus = status, TargetValue = 1, CurrentProgress = 1, ExpiresAt = DateTime.UtcNow.AddDays(3) };
        db.Missions.Add(mission); db.SaveChanges();
        var controller = new MissionsController(db, new HttpClientFactory(), new ConfigurationBuilder().Build(), new CurrentUser(4));
        var list = Assert.IsAssignableFrom<IEnumerable<Mission>>(Assert.IsType<OkObjectResult>(controller.GetUserMissions(4).Result).Value);
        Assert.DoesNotContain(list, m => m.Id == mission.Id);
        Assert.IsType<BadRequestObjectResult>(controller.CompleteMission(mission.Id).Result);
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

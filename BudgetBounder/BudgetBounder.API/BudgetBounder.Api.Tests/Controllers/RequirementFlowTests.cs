using System.Net;
using System.Text.Json;
using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;
namespace BudgetBounder.Api.Tests.Controllers;
public class RequirementFlowTests
{
    private static BudgetBounderDbContext Db() => new(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private sealed record Actor(int Id) : ICurrentUserService { public int? UserId => Id; public bool IsAdmin => false; }
    private sealed class FakeHttp : HttpMessageHandler, IHttpClientFactory
    {
        public int Calls;
        public HttpClient CreateClient(string name) => new(this);
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            Calls++;
            var missions=Enumerable.Range(1,3).Select(i=>new {title="Log "+i,description="Record expenses",xpReward=50,difficulty="Easy",missionType="LogExpenses",targetValue=2,durationDays=7});
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content=new StringContent(JsonSerializer.Serialize(new {choices=new[]{new {message=new {content=JsonSerializer.Serialize(missions)}}}})) });
        }
    }
    [Fact]
    public async Task GenerationCreatesHiddenDraftsAndReusesPendingBatchWithoutDeletingApprovedMission()
    {
        using var db=Db();db.Users.Add(new User {Id=2,FullName="User",Email="a@test",PasswordHash="x"});
        db.Missions.Add(new Mission {UserId=2,Title="Approved existing",IsAiGenerated=true,ReviewStatus="Approved",ExpiresAt=DateTime.UtcNow.AddDays(2)});db.SaveChanges();
        var http=new FakeHttp();var config=new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?>{{"Groq:ApiKey","test-only"}}).Build();
        var controller=new MissionsController(db,http,config,new Actor(2));
        var first=Assert.IsType<OkObjectResult>((await controller.GenerateMissions(2)).Result);Assert.Empty(Assert.IsAssignableFrom<IEnumerable<Mission>>(first.Value));
        Assert.Equal(3,db.Missions.Count(m=>m.ReviewStatus=="Draft"));Assert.Single(db.Missions.Where(m=>m.ReviewStatus=="Approved"));
        await controller.GenerateMissions(2);Assert.Equal(1,http.Calls);Assert.Equal(4,db.Missions.Count());
    }
    [Fact]
    public async Task UnconfiguredGenerationPreservesApprovedMissions()
    {
        using var db=Db();db.Users.Add(new User {Id=2,FullName="User",Email="a@test",PasswordHash="x"});db.Missions.Add(new Mission {UserId=2,Title="Keep",IsAiGenerated=true,ExpiresAt=DateTime.UtcNow.AddDays(1)});db.SaveChanges();
        var result=await new MissionsController(db,new FakeHttp(),new ConfigurationBuilder().Build(),new Actor(2)).GenerateMissions(2);
        Assert.Equal(503,Assert.IsType<ObjectResult>(result.Result).StatusCode);Assert.Single(db.Missions);
    }
    [Fact]
    public void StreakCountsDistinctDatesNotRepeatedEntries()
    {
        using var db=Db(); var now=DateTime.UtcNow;
        var mission=new Mission {UserId=2,Title="Streak",MissionType="DailyStreak",CreatedAt=now.AddDays(-5),ExpiresAt=now.AddDays(3),TargetValue=5};db.Missions.Add(mission);
        db.Transactions.AddRange(new Transaction {UserId=2,Type=TransactionType.Expense,Date=now.AddDays(-1)},new Transaction {UserId=2,Type=TransactionType.Expense,Date=now.AddDays(-1)},new Transaction {UserId=2,Type=TransactionType.Expense,Date=now});db.SaveChanges();
        new MissionsController(db,new FakeHttp(),new ConfigurationBuilder().Build(),new Actor(2)).GetUserMissions(2);
        Assert.Equal(2,mission.CurrentProgress);Assert.False(mission.IsCompleted);
    }
    [Fact]
    public async Task MilestoneAwardsAreIdempotentAndRespectInactiveDefinitions()
    {
        using var db=Db();db.Users.Add(new User {Id=2,FullName="User",Email="a@test",PasswordHash="x",Level=5});
        db.Transactions.Add(new Transaction {UserId=2});db.RewardDefinitions.AddRange(new RewardDefinition {Code="first-entry",Name="First",Description="First entry"},new RewardDefinition {Code="level-five",Name="Five",Description="Level 5",IsActive=false});db.SaveChanges();
        var controller=new AchievementsController(db,new Actor(2));await controller.Sync(default);await controller.Sync(default);
        Assert.Single(db.UserRewards);Assert.Equal("first-entry",db.UserRewards.Include(r=>r.RewardDefinition).Single().RewardDefinition!.Code);
    }
}

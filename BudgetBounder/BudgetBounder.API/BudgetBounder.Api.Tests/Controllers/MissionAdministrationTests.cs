using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
namespace BudgetBounder.Api.Tests.Controllers;
public class MissionAdministrationTests
{
    private static BudgetBounderDbContext Database() => new(new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private sealed record Actor(int Id) : ICurrentUserService { public int? UserId => Id; public bool IsAdmin => true; }
    [Fact]
    public async Task ConcurrentProgressBlocksAnEditBasedOnStaleProgress()
    {
        var options=new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        using var seed=new BudgetBounderDbContext(options);seed.Missions.Add(new Mission {UserId=2,Title="Before",TargetValue=3,ExpiresAt=DateTime.UtcNow.AddDays(2)});seed.SaveChanges();
        using var edit=new BudgetBounderDbContext(options);using var progress=new BudgetBounderDbContext(options);
        var stale=edit.Missions.Single();var live=progress.Missions.Single();live.CurrentProgress=1;progress.SaveChanges();stale.Title="After";
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(()=>edit.SaveChangesAsync());
    }
    [Fact]
    public async Task ApprovingThenEditingAiMissionReturnsItToDraftWithAudit()
    {
        using var db = Database(); var mission = new Mission { UserId = 2, Title = "Log entries", Description = "Log two expenses", MissionType = "LogExpenses", Difficulty = "Easy", XPReward = 50, TargetValue = 2, ExpiresAt = DateTime.UtcNow.AddDays(2), IsAiGenerated = true, ReviewStatus = "Draft" };
        db.Missions.Add(mission); db.SaveChanges(); var controller = new AdminMissionsController(db, new Actor(1));
        Assert.IsType<NoContentResult>(await controller.Review(mission.Id, new("Approved"), default));
        Assert.Equal("Approved", mission.ReviewStatus); Assert.Equal(1, mission.ReviewedByAdminId);
        Assert.IsType<NoContentResult>(await controller.Edit(mission.Id, new(2,"Edited","Description","Easy",60,"LogExpenses",3,DateTime.UtcNow.AddDays(3)), default));
        Assert.Equal("Draft", mission.ReviewStatus); Assert.Null(mission.ReviewedAt); Assert.Equal(2, db.AdminAuditLogs.Count());
    }
    [Fact]
    public async Task GeneralMissionOnlyTargetsActiveUsers()
    {
        using var db = Database(); db.Users.AddRange(new User { Id=2, FullName="Active",Email="a@test",PasswordHash="x" }, new User { Id=3,FullName="Frozen",Email="b@test",PasswordHash="x",IsActive=false }); db.SaveChanges();
        var controller = new AdminMissionsController(db,new Actor(1));
        Assert.IsType<OkObjectResult>(await controller.Create(new(0,"Daily log","Record expense","Easy",50,"LogExpenses",1,DateTime.UtcNow.AddDays(1)), default));
        Assert.Equal(2, Assert.Single(db.Missions).UserId);
    }
    [Fact]
    public void TransactionDoesNotProgressUnapprovedMissionsAndProgressesAllApproved()
    {
        using var db = Database(); db.Users.Add(new User { Id=2,FullName="User",Email="a@test",PasswordHash="x" });
        foreach (var status in new[] { "Draft", "Rejected", "Approved", "Approved" }) db.Missions.Add(new Mission { UserId=2,Title="Log",MissionType="LogExpenses",ReviewStatus=status,TargetValue=2,XPReward=50,ExpiresAt=DateTime.UtcNow.AddDays(1) }); db.SaveChanges();
        new TransactionsController(db,new Actor(2)).ReceiveTransaction(new Transaction { Title="Bus ticket",Category="Auto",Amount=5,Type=TransactionType.Expense,Date=DateTime.UtcNow });
        Assert.All(db.Missions.Where(m=>m.ReviewStatus!="Approved"),m=>Assert.Equal(0,m.CurrentProgress));
        Assert.All(db.Missions.Where(m=>m.ReviewStatus=="Approved"),m=>Assert.Equal(1,m.CurrentProgress));
        Assert.Equal("Transport",Assert.Single(db.Transactions).Category);
    }
    [Fact]
    public void SavingContributionCreatesDatedHistoryAndIgnoresDraftMissions()
    {
        using var db = Database(); db.Users.Add(new User { Id=2,FullName="User",Email="a@test",PasswordHash="x" });
        var goal=new SavingGoal { UserId=2,Title="Vault",TargetAmount=1000,Deadline=DateTime.UtcNow.AddMonths(2) };db.SavingGoals.Add(goal);
        var mission=new Mission { UserId=2,Title="Save",MissionType="SavingGoal",ReviewStatus="Draft",TargetValue=1,XPReward=50,ExpiresAt=DateTime.UtcNow.AddDays(1) };db.Missions.Add(mission);db.SaveChanges();
        new SavingGoalsController(db,new Actor(2)).UpdateSavingProgress(goal.Id,20);
        Assert.Equal(20,Assert.Single(db.SavingContributions).Amount);Assert.False(mission.IsCompleted);Assert.Equal(0,mission.CurrentProgress);
    }
}

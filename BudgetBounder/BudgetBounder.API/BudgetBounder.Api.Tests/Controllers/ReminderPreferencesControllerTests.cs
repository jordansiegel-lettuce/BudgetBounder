using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class ReminderPreferencesControllerTests
{
    [Fact]
    public async Task GetMine_CreatesDefaultsForTheAuthenticatedUser()
    {
        await using var context = CreateContext(nameof(GetMine_CreatesDefaultsForTheAuthenticatedUser));
        var controller = new ReminderPreferencesController(context, new TestCurrentUser(7));

        var result = await controller.GetMine(CancellationToken.None);

        var preferences = Assert.IsType<ReminderPreferences>(Assert.IsType<OkObjectResult>(result.Result).Value);
        Assert.Equal(7, preferences.UserId);
        Assert.True(preferences.DailyLogEnabled);
        Assert.Equal(80, preferences.BudgetThresholdPercent);
        Assert.Single(context.ReminderPreferences);
    }

    [Fact]
    public async Task UpdateMine_UpdatesOnlyTheAuthenticatedUsersPreferences()
    {
        await using var context = CreateContext(nameof(UpdateMine_UpdatesOnlyTheAuthenticatedUsersPreferences));
        context.ReminderPreferences.Add(new ReminderPreferences { UserId = 8, DailyLogHour = 9 });
        await context.SaveChangesAsync();
        var controller = new ReminderPreferencesController(context, new TestCurrentUser(7));

        var result = await controller.UpdateMine(new ReminderPreferencesRequest(
            false, 21, true, 90, true, 1, 19, false), CancellationToken.None);

        var preferences = Assert.IsType<ReminderPreferences>(Assert.IsType<OkObjectResult>(result.Result).Value);
        Assert.Equal(7, preferences.UserId);
        Assert.False(preferences.DailyLogEnabled);
        Assert.Equal(90, preferences.BudgetThresholdPercent);
        Assert.Equal(9, context.ReminderPreferences.Single(item => item.UserId == 8).DailyLogHour);
    }

    private static BudgetBounderDbContext CreateContext(string name) => new(
        new DbContextOptionsBuilder<BudgetBounderDbContext>().UseInMemoryDatabase(name).Options);

    private sealed record TestCurrentUser(int Id) : ICurrentUserService
    {
        public int? UserId => Id;
        public bool IsAdmin => false;
    }
}

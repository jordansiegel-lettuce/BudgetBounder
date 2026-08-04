using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/reminder-preferences")]
[Authorize]
public class ReminderPreferencesController(BudgetBounderDbContext context, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<ReminderPreferences>> GetMine(CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        var preferences = await GetOrCreate(userId, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return Ok(preferences);
    }

    [HttpPut("me")]
    public async Task<ActionResult<ReminderPreferences>> UpdateMine(
        [FromBody] ReminderPreferencesRequest request,
        CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        if (request.DailyLogHour is < 0 or > 23 || request.GoalReminderHour is < 0 or > 23 ||
            request.GoalReminderWeekday is < 0 or > 6 || request.BudgetThresholdPercent is < 50 or > 100)
            return BadRequest("Reminder hours, weekday, or threshold are outside the supported range.");

        var preferences = await GetOrCreate(userId, cancellationToken);
        preferences.DailyLogEnabled = request.DailyLogEnabled;
        preferences.DailyLogHour = request.DailyLogHour;
        preferences.BudgetAlertsEnabled = request.BudgetAlertsEnabled;
        preferences.BudgetThresholdPercent = request.BudgetThresholdPercent;
        preferences.GoalRemindersEnabled = request.GoalRemindersEnabled;
        preferences.GoalReminderWeekday = request.GoalReminderWeekday;
        preferences.GoalReminderHour = request.GoalReminderHour;
        preferences.MissionAlertsEnabled = request.MissionAlertsEnabled;
        preferences.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Ok(preferences);
    }

    private async Task<ReminderPreferences> GetOrCreate(int userId, CancellationToken cancellationToken)
    {
        var preferences = await context.ReminderPreferences.SingleOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (preferences is not null) return preferences;
        preferences = new ReminderPreferences { UserId = userId };
        context.ReminderPreferences.Add(preferences);
        return preferences;
    }
}

public sealed record ReminderPreferencesRequest(
    bool DailyLogEnabled,
    int DailyLogHour,
    bool BudgetAlertsEnabled,
    int BudgetThresholdPercent,
    bool GoalRemindersEnabled,
    int GoalReminderWeekday,
    int GoalReminderHour,
    bool MissionAlertsEnabled);

using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(
    ICurrentUserService currentUser,
    FinancialSummaryService summaries,
    BudgetBounderDbContext context) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult> GetMine([FromQuery] DateOnly? month, CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        var selectedMonth = month ?? DateOnly.FromDateTime(DateTime.UtcNow);
        selectedMonth = new DateOnly(selectedMonth.Year, selectedMonth.Month, 1);
        var user = await context.Users.FindAsync([userId], cancellationToken);
        if (user is null) return NotFound();

        var summary = await summaries.GetMonthlySummaryAsync(userId, selectedMonth, cancellationToken);
        var mission = await context.Missions
            .Where(m => m.UserId == userId && !m.IsCompleted && m.ExpiresAt > DateTime.UtcNow)
            .OrderBy(m => m.ExpiresAt)
            .Select(m => new { m.Id, m.Title, m.Description, m.XPReward, m.CurrentProgress, m.TargetValue, m.ExpiresAt })
            .FirstOrDefaultAsync(cancellationToken);
        var goal = await context.SavingGoals
            .Where(g => g.UserId == userId && !g.IsCompleted)
            .OrderBy(g => g.Deadline)
            .Select(g => new { g.Id, g.Title, g.CurrentAmount, g.TargetAmount, g.Deadline })
            .FirstOrDefaultAsync(cancellationToken);
        var recent = await context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(5)
            .Select(t => new { t.Id, t.Title, t.Amount, t.Type, t.Category, t.Date })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            user = new { user.Id, user.FullName, user.Level, user.XP, user.CurrentStreak },
            finance = summary,
            mission,
            goal,
            recentTransactions = recent
        });
    }
}

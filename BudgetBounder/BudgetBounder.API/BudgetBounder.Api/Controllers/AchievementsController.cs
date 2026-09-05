using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace BudgetBounder.Api.Controllers;
[ApiController, Route("api/achievements"), Authorize]
public class AchievementsController(BudgetBounderDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost("sync")]
    public async Task<ActionResult> Sync(CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        var user = await db.Users.FindAsync([userId], cancellationToken);
        if (user == null || !user.IsActive) return Unauthorized();
        var codes = new List<string>();
        if (await db.Transactions.AnyAsync(t => t.UserId == userId, cancellationToken)) codes.Add("first-entry");
        if (await db.Missions.AnyAsync(m => m.UserId == userId && m.IsCompleted, cancellationToken)) codes.Add("first-mission");
        if (await db.SavingGoals.AnyAsync(g => g.UserId == userId && g.IsCompleted, cancellationToken)) codes.Add("first-vault");
        if (user.Level >= 5) codes.Add("level-five");
        if (await db.GameSessions.AnyAsync(g => g.UserId == userId && g.ValidationState == "Valid", cancellationToken)) codes.Add("tower-explorer");
        var existing = await db.UserRewards.Where(r => r.UserId == userId).Select(r => r.RewardDefinitionId).ToListAsync(cancellationToken);
        var earned = await db.RewardDefinitions.Where(r => r.IsActive && codes.Contains(r.Code) && !existing.Contains(r.Id)).ToListAsync(cancellationToken);
        foreach (var reward in earned) db.UserRewards.Add(new UserReward { UserId = userId, RewardDefinitionId = reward.Id });
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException) { return Conflict("Achievements are being refreshed. Please retry."); }
        return Ok(await db.UserRewards.AsNoTracking().Where(r => r.UserId == userId && r.RewardDefinition!.IsActive)
            .Select(r => new { r.Id, r.RewardDefinition!.Name, r.RewardDefinition.Description, r.UnlockedAt }).ToListAsync(cancellationToken));
    }
}

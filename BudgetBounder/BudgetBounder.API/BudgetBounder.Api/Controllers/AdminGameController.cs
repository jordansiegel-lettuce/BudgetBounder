using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/admin/game-sessions")]
[Authorize(Policy = "AdminOnly")]
public class AdminGameController(BudgetBounderDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<GameSessionDto>>> List(CancellationToken cancellationToken) =>
        Ok(await context.GameSessions.AsNoTracking().OrderByDescending(item => item.SubmittedAt).Take(200)
            .Select(item => new GameSessionDto(item.Id, item.UserId, item.ClientResultId, item.Score,
                item.Coins, item.SavingsStars, item.DurationSeconds, item.AwardedXp,
                item.ValidationState, item.ValidationReason, item.SubmittedAt))
            .ToListAsync(cancellationToken));
}

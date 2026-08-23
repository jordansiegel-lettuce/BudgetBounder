using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/game-sessions")]
[Authorize]
public class GameSessionsController(BudgetBounderDbContext context, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<GameSessionDto>> Submit(GameSessionSubmitRequest request, CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        var existing = await context.GameSessions.AsNoTracking()
            .SingleOrDefaultAsync(item => item.UserId == userId && item.ClientResultId == request.ClientResultId, cancellationToken);
        if (existing is not null) return Ok(ToDto(existing));

        var user = await context.Users.FindAsync([userId], cancellationToken);
        if (user is null || !user.IsActive) return Unauthorized();
        var validation = GameResultValidator.Validate(request);
        var session = new GameSession
        {
            UserId = userId,
            ClientResultId = request.ClientResultId,
            Score = request.Score,
            DurationSeconds = request.DurationSeconds,
            Coins = request.Coins,
            SavingsStars = request.SavingsStars,
            AwardedXp = validation.AwardedXp,
            ValidationState = validation.State,
            ValidationReason = validation.Reason
        };
        if (validation.AwardedXp > 0) ProgressionService.AwardXp(user, validation.AwardedXp);
        context.GameSessions.Add(session);
        await context.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(session));
    }

    internal static GameSessionDto ToDto(GameSession item) => new(
        item.Id, item.UserId, item.ClientResultId, item.Score, item.Coins, item.SavingsStars,
        item.DurationSeconds, item.AwardedXp, item.ValidationState, item.ValidationReason, item.SubmittedAt);
}

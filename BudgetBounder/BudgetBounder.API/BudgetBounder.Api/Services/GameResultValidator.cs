using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;

namespace BudgetBounder.Api.Services;

public sealed record GameResultValidation(string State, int AwardedXp, string? Reason);

public static class GameResultValidator
{
    public static GameResultValidation Validate(GameSessionSubmitRequest request)
    {
        if (request.ClientResultId == Guid.Empty)
            return Flagged("Missing client result ID.");
        if (request.DurationSeconds is < 1 or > 7200)
            return Flagged("Duration is outside the accepted range.");
        if (request.Score is < 0 or > 100_000 || request.Coins is < 0 or > 10_000 || request.SavingsStars is < 0 or > 1_000)
            return Flagged("One or more result values are outside accepted limits.");

        var awardedXp = Math.Clamp(request.Score / 20 + request.Coins + request.SavingsStars * 10, 1, 500);
        return new GameResultValidation(GameSessionValidationStates.Valid, awardedXp, null);
    }

    private static GameResultValidation Flagged(string reason) =>
        new(GameSessionValidationStates.Flagged, 0, reason);
}

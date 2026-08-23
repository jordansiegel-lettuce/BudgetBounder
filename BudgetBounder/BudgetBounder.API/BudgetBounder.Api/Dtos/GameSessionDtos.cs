namespace BudgetBounder.Api.Dtos;

public sealed record GameSessionSubmitRequest(
    Guid ClientResultId, int Score, int DurationSeconds, int Coins, int SavingsStars);
public sealed record GameSessionDto(
    int Id, int UserId, Guid ClientResultId, int Score, int Coins, int SavingsStars,
    int DurationSeconds, int AwardedXp, string ValidationState, string? ValidationReason,
    DateTime SubmittedAt);

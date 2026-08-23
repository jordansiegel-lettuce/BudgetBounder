using System.ComponentModel.DataAnnotations;

namespace BudgetBounder.Api.Models;

public static class GameSessionValidationStates
{
    public const string Valid = "Valid";
    public const string Flagged = "Flagged";
}

public class GameSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public Guid ClientResultId { get; set; }
    public int Score { get; set; }
    public int Coins { get; set; }
    public int SavingsStars { get; set; }
    public int DurationSeconds { get; set; }
    public int AwardedXp { get; set; }
    [Required, MaxLength(20)] public string ValidationState { get; set; } = GameSessionValidationStates.Valid;
    [MaxLength(500)] public string? ValidationReason { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}

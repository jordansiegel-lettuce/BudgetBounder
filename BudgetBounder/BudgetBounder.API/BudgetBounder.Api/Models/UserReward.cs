namespace BudgetBounder.Api.Models;

public class UserReward
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int RewardDefinitionId { get; set; }
    public RewardDefinition? RewardDefinition { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}

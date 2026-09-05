namespace BudgetBounder.Api.Models;
public class SavingContribution
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int SavingGoalId { get; set; }
    public double Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

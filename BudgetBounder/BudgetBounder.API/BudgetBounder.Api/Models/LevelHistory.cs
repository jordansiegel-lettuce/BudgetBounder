namespace BudgetBounder.Api.Models;
public class LevelHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Level { get; set; }
    public double XP { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}

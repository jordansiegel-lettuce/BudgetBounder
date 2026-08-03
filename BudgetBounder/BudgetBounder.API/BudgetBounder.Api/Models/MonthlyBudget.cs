using System.ComponentModel.DataAnnotations;

namespace BudgetBounder.Api.Models;

public class MonthlyBudget
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public DateTime Month { get; set; }
    [Range(0.01, double.MaxValue)]
    public double Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

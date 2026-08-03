namespace BudgetBounder.Api.Models;

public class AdminAuditLog
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public User? AdminUser { get; set; }
    public string Action { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

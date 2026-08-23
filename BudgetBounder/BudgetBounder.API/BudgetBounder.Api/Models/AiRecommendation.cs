using System.ComponentModel.DataAnnotations;

namespace BudgetBounder.Api.Models;

public static class AiRecommendationStatuses
{
    public const string Draft = "Draft";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}

public class AiRecommendation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    [Required, MaxLength(160)] public string Title { get; set; } = "";
    [Required, MaxLength(2000)] public string Content { get; set; } = "";
    [Required, MaxLength(20)] public string Status { get; set; } = AiRecommendationStatuses.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? ReviewedByAdminId { get; set; }
    public User? ReviewedByAdmin { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

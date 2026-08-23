using System.ComponentModel.DataAnnotations;

namespace BudgetBounder.Api.Models;

public static class CosmeticTypes
{
    public static readonly string[] Allowed = ["Badge", "Theme", "AvatarFrame"];
}

public class RewardDefinition
{
    public int Id { get; set; }
    [Required, MaxLength(50)] public string Code { get; set; } = "";
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [Required, MaxLength(500)] public string Description { get; set; } = "";
    [Required, MaxLength(30)] public string CosmeticType { get; set; } = "Badge";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<UserReward> Unlocks { get; set; } = [];
}

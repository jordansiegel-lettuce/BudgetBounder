using System.ComponentModel.DataAnnotations;

namespace BudgetBounder.Api.Models
{
    public class Mission
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public int XPReward { get; set; }
        public string Difficulty { get; set; } = "Easy";
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        [MaxLength(50)]
        public string MissionType { get; set; } = "";
        public double TargetValue { get; set; }
        public double CurrentProgress { get; set; }
    }
}

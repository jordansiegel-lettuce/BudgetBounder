using System.ComponentModel.DataAnnotations;

namespace BudgetBounder.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required]
        [MinLength(2)]
        public string? FullName { get; set; } 
        [Required]
        [EmailAddress]
        public string? Email { get; set; } 
        [Required]
        [MinLength(3)]
        public string? PasswordHash { get; set; }
        public int Level { get; set; }
        public double XP { get; set; }
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = Authorization.UserRoles.User;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastActiveAt { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateOnly? LastActivityDate { get; set; }
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
        public List<MonthlyBudget> MonthlyBudgets { get; set; } = new();
    }
}

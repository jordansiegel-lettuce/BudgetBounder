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
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}

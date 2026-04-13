namespace BudgetBounder.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public int Level { get; set; }
        public double XP { get; set; }
    }
}

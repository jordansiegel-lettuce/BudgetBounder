namespace BudgetBounder.Api.Models
{
    public class SavingGoal
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public double TargetAmount { get; set; }
        public double CurrentAmount { get; set; }
        public DateTime Deadline { get; set; }
        public bool IsCompleted { get; set; }

        public int UserId { get; set; }
    }
}

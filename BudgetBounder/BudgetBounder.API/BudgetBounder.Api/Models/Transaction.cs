namespace BudgetBounder.Api.Models
{
    public enum TransactionType
    {
        Income,
        Expense
    }
    public class Transaction
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public double Amount { get; set; }
        public TransactionType Type { get; set; }
        public string Category { get; set; } = "";
        public DateTime Date { get; set; }
        public User? User { get; set; }
        public int UserId { get; set; }
    }
}

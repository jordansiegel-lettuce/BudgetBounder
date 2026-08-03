using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Services;

public class FinancialSummaryServiceTests
{
    [Fact]
    public async Task MonthlySummarySeparatesIncomeExpensesAndCategories()
    {
        await using var db = CreateDb();
        db.MonthlyBudgets.Add(new MonthlyBudget
        {
            UserId = 7,
            Month = new DateTime(2026, 7, 1),
            Amount = 5000
        });
        db.Transactions.AddRange(
            new Transaction { UserId = 7, Title = "Salary", Amount = 12000, Type = TransactionType.Income, Category = "Income", Date = new DateTime(2026, 7, 1) },
            new Transaction { UserId = 7, Title = "Groceries", Amount = 800, Type = TransactionType.Expense, Category = "Food", Date = new DateTime(2026, 7, 2) },
            new Transaction { UserId = 7, Title = "Bus", Amount = 200, Type = TransactionType.Expense, Category = "Transport", Date = new DateTime(2026, 7, 3) },
            new Transaction { UserId = 8, Title = "Other user", Amount = 9999, Type = TransactionType.Expense, Category = "Food", Date = new DateTime(2026, 7, 3) },
            new Transaction { UserId = 7, Title = "Previous month", Amount = 400, Type = TransactionType.Expense, Category = "Food", Date = new DateTime(2026, 6, 30) });
        await db.SaveChangesAsync();

        var result = await new FinancialSummaryService(db).GetMonthlySummaryAsync(7, new DateOnly(2026, 7, 1));

        Assert.Equal(12000, result.Income);
        Assert.Equal(1000, result.Spent);
        Assert.Equal(4000, result.RemainingBudget);
        Assert.Equal(800, result.CategorySpending["Food"]);
        Assert.Equal(200, result.CategorySpending["Transport"]);
    }

    private static BudgetBounderDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<BudgetBounderDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BudgetBounderDbContext(options);
    }
}

using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Services;

public sealed record MonthlyFinancialSummary(
    DateOnly Month,
    double Budget,
    double Income,
    double Spent,
    double RemainingBudget,
    IReadOnlyDictionary<string, double> CategorySpending);

public sealed class FinancialSummaryService(BudgetBounderDbContext context)
{
    public async Task<MonthlyFinancialSummary> GetMonthlySummaryAsync(
        int userId,
        DateOnly month,
        CancellationToken cancellationToken = default)
    {
        var monthStart = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonth = monthStart.AddMonths(1);
        var transactions = await context.Transactions
            .Where(t => t.UserId == userId && t.Date >= monthStart && t.Date < nextMonth)
            .ToListAsync(cancellationToken);
        var budget = await context.MonthlyBudgets
            .Where(b => b.UserId == userId && b.Month == monthStart)
            .Select(b => (double?)b.Amount)
            .SingleOrDefaultAsync(cancellationToken) ?? 0;
        var income = transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);
        var expenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .ToList();
        var spent = expenses.Sum(t => t.Amount);
        var categories = expenses
            .GroupBy(t => t.Category)
            .ToDictionary(group => group.Key, group => group.Sum(t => t.Amount));

        return new MonthlyFinancialSummary(
            DateOnly.FromDateTime(monthStart),
            budget,
            income,
            spent,
            budget - spent,
            categories);
    }
}

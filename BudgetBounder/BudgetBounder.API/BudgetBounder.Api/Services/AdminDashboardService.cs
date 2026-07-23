using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Services;

public sealed class AdminDashboardService(BudgetBounderDbContext context)
{
    public async Task<AdminOverviewDto> GetOverviewAsync(CancellationToken cancellationToken = default)
    {
        var since = DateTime.UtcNow.AddDays(-30);
        return new AdminOverviewDto(
            await context.Users.CountAsync(cancellationToken),
            await context.Users.CountAsync(u => u.IsActive, cancellationToken),
            await context.Users.CountAsync(u => !u.IsActive, cancellationToken),
            await context.Users.CountAsync(u => u.CreatedAt >= since, cancellationToken),
            await context.Transactions.CountAsync(cancellationToken),
            await context.Missions.CountAsync(m => m.IsCompleted, cancellationToken),
            await context.Users.Select(u => (double?)u.Level).AverageAsync(cancellationToken) ?? 0,
            await context.SavingGoals.CountAsync(cancellationToken),
            await context.Missions.CountAsync(m => m.IsAiGenerated, cancellationToken));
    }
}

using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Services;

public sealed class AdminDashboardService(BudgetBounderDbContext context)
{
    public async Task<AdminAnalyticsDto> GetAnalyticsAsync(AdminAnalyticsFilter filters, CancellationToken cancellationToken = default)
    {
        if (filters.UserId is <= 0 || filters.EndDate == DateOnly.MaxValue ||
            (filters.StartDate.HasValue && filters.EndDate.HasValue && filters.StartDate > filters.EndDate))
            throw new ArgumentException("Choose a valid user and date range.");
        if (filters.UserId.HasValue && !await context.Users.AnyAsync(u => u.Id == filters.UserId, cancellationToken))
            throw new ArgumentException("The selected user does not exist.");
        var start = filters.StartDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue;
        var end = filters.EndDate?.AddDays(1).ToDateTime(TimeOnly.MinValue) ?? DateTime.MaxValue;
        var users = context.Users.AsNoTracking().Where(u =>
            (!filters.UserId.HasValue || u.Id == filters.UserId) &&
            (!filters.IsActive.HasValue || u.IsActive == filters.IsActive));
        var ids = users.Select(u => u.Id);
        var cohort = await users.ToListAsync(cancellationToken);
        var transactions = await context.Transactions.AsNoTracking()
            .Where(t => ids.Contains(t.UserId) && t.Date >= start && t.Date < end)
            .Select(t => t.Date).ToListAsync(cancellationToken);
        var completed = await context.Missions.AsNoTracking()
            .Where(m => ids.Contains(m.UserId) && m.IsCompleted && m.CompletedAt >= start && m.CompletedAt < end)
            .Select(m => new { Date = m.CompletedAt!.Value, Xp = m.XPReward }).ToListAsync(cancellationToken);
        var games = await context.GameSessions.AsNoTracking()
            .Where(g => ids.Contains(g.UserId) && g.SubmittedAt >= start && g.SubmittedAt < end)
            .Select(g => new { Date = g.SubmittedAt, Xp = g.AwardedXp }).ToListAsync(cancellationToken);
        var registrations = cohort.Where(u => u.CreatedAt >= start && u.CreatedAt < end).ToList();
        var summary = new AdminOverviewDto(cohort.Count, cohort.Count(u => u.IsActive), cohort.Count(u => !u.IsActive),
            registrations.Count, transactions.Count, completed.Count, cohort.Count == 0 ? 0 : cohort.Average(u => u.Level),
            await context.SavingGoals.CountAsync(g => ids.Contains(g.UserId), cancellationToken),
            await context.Missions.CountAsync(m => ids.Contains(m.UserId) && m.IsAiGenerated && m.CreatedAt >= start && m.CreatedAt < end, cancellationToken));
        var txDays = transactions.GroupBy(DateOnly.FromDateTime).ToDictionary(g => g.Key, g => g.Count());
        var missionDays = completed.GroupBy(m => DateOnly.FromDateTime(m.Date)).ToDictionary(g => g.Key, g => (Count: g.Count(), Xp: g.Sum(m => m.Xp)));
        var gameDays = games.GroupBy(g => DateOnly.FromDateTime(g.Date)).ToDictionary(g => g.Key, g => g.Sum(m => m.Xp));
        var userDays = registrations.GroupBy(u => DateOnly.FromDateTime(u.CreatedAt)).ToDictionary(g => g.Key, g => g.Count());
        var dates = txDays.Keys.Concat(missionDays.Keys).Concat(gameDays.Keys).Concat(userDays.Keys).Distinct().Order();
        var trend = dates.Select(d => new AdminAnalyticsPoint(d, txDays.GetValueOrDefault(d), missionDays.GetValueOrDefault(d).Count,
            userDays.GetValueOrDefault(d), missionDays.GetValueOrDefault(d).Xp, gameDays.GetValueOrDefault(d))).ToList();
        var levels = await context.LevelHistory.AsNoTracking().Where(h => ids.Contains(h.UserId) && h.RecordedAt >= start && h.RecordedAt < end)
            .OrderBy(h => h.RecordedAt).Select(h => new AdminLevelPoint(h.UserId, h.RecordedAt, h.Level, h.XP)).ToListAsync(cancellationToken);
        return new AdminAnalyticsDto(filters, summary, trend, levels);
    }

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

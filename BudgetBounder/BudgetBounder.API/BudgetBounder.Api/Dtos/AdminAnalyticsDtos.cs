namespace BudgetBounder.Api.Dtos;
public sealed class AdminAnalyticsFilter
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? UserId { get; set; }
    public bool? IsActive { get; set; }
}
public sealed record AdminAnalyticsPoint(DateOnly Date, int Transactions, int MissionsCompleted, int NewUsers, int MissionXp, int GameXp);
public sealed record AdminLevelPoint(int UserId, DateTime RecordedAt, int Level, double XP);
public sealed record AdminAnalyticsDto(AdminAnalyticsFilter Filters, AdminOverviewDto Summary, IReadOnlyList<AdminAnalyticsPoint> Trend, IReadOnlyList<AdminLevelPoint> LevelHistory);

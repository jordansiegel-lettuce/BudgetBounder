namespace BudgetBounder.Api.Models;

public class ReminderPreferences
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public bool DailyLogEnabled { get; set; } = true;
    public int DailyLogHour { get; set; } = 20;
    public bool BudgetAlertsEnabled { get; set; } = true;
    public int BudgetThresholdPercent { get; set; } = 80;
    public bool GoalRemindersEnabled { get; set; } = true;
    public int GoalReminderWeekday { get; set; } = 0;
    public int GoalReminderHour { get; set; } = 18;
    public bool MissionAlertsEnabled { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

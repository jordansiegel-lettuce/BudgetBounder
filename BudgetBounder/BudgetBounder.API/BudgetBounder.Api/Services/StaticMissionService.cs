using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Services
{
    public static class StaticMissionService
    {
        public static void GenerateStaticMissions(int userId, BudgetBounderDbContext context)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var tomorrowStart = today.AddDays(1);
            var todayEnd = tomorrowStart.AddTicks(-1);

            var daysToSunday = ((int)DayOfWeek.Sunday - (int)now.DayOfWeek + 7) % 7;
            var weekEnd = today.AddDays(daysToSunday + 1).AddTicks(-1);

            // Query the DB directly each time so concurrent requests don't both see an empty list
            bool HasDailyMission(string type) =>
                context.Missions.Any(m => m.UserId == userId
                                       && m.MissionType == type
                                       && m.ExpiresAt >= today
                                       && m.ExpiresAt < tomorrowStart);

            bool HasWeeklyMission(string type) =>
                context.Missions.Any(m => m.UserId == userId
                                       && m.MissionType == type
                                       && m.ExpiresAt >= today
                                       && m.ExpiresAt <= weekEnd);

            var toAdd = new List<Mission>();

            if (!HasDailyMission("LogExpenses"))
                toAdd.Add(new Mission
                {
                    UserId = userId,
                    Title = "Log an Expense",
                    Description = "Record an expense transaction today.",
                    XPReward = 15,
                    Difficulty = "Easy",
                    MissionType = "LogExpenses",
                    TargetValue = 1,
                    CurrentProgress = 0,
                    CreatedAt = now,
                    ExpiresAt = todayEnd
                });

            if (!HasDailyMission("LogIncome"))
                toAdd.Add(new Mission
                {
                    UserId = userId,
                    Title = "Log an Income",
                    Description = "Record an income transaction today.",
                    XPReward = 15,
                    Difficulty = "Easy",
                    MissionType = "LogIncome",
                    TargetValue = 1,
                    CurrentProgress = 0,
                    CreatedAt = now,
                    ExpiresAt = todayEnd
                });

            if (!HasWeeklyMission("SavingGoal"))
                toAdd.Add(new Mission
                {
                    UserId = userId,
                    Title = "Update a Saving Goal",
                    Description = "Add progress to one of your saving goals this week.",
                    XPReward = 30,
                    Difficulty = "Easy",
                    MissionType = "SavingGoal",
                    TargetValue = 1,
                    CurrentProgress = 0,
                    CreatedAt = now,
                    ExpiresAt = weekEnd
                });

            if (!HasWeeklyMission("DailyStreak"))
                toAdd.Add(new Mission
                {
                    UserId = userId,
                    Title = "Log Expenses 5 Days This Week",
                    Description = "Log at least one expense on 5 different days this week.",
                    XPReward = 50,
                    Difficulty = "Medium",
                    MissionType = "DailyStreak",
                    TargetValue = 5,
                    CurrentProgress = 0,
                    CreatedAt = now,
                    ExpiresAt = weekEnd
                });

            if (toAdd.Count == 0) return;

            context.Missions.AddRange(toAdd);
            try
            {
                context.SaveChanges();
            }
            catch (DbUpdateException)
            {
                // A concurrent request already created these missions (unique index violation).
                // Detach the unsaved entities so the context stays clean.
                foreach (var m in toAdd)
                    context.Entry(m).State = EntityState.Detached;
            }
        }
    }
}

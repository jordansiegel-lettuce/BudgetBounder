using BudgetBounder.Api.Models;

namespace BudgetBounder.Api.Services;

public static class ProgressionService
{
    public static int CalculateLevel(double xp) => xp switch
    {
        >= 5000 => 10,
        >= 4500 => 9,
        >= 4000 => 8,
        >= 3000 => 7,
        >= 2000 => 6,
        >= 1000 => 5,
        >= 500 => 4,
        >= 250 => 3,
        >= 100 => 2,
        _ => 1
    };

    public static void AwardXp(User user, int amount)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);

        user.XP += amount;
        user.Level = CalculateLevel(user.XP);
    }

    public static void UpdateStreak(User user, DateOnly activityDate)
    {
        ArgumentNullException.ThrowIfNull(user);

        if (user.LastActivityDate == activityDate)
        {
            return;
        }

        user.CurrentStreak = user.LastActivityDate == activityDate.AddDays(-1)
            ? user.CurrentStreak + 1
            : 1;
        user.LongestStreak = Math.Max(user.LongestStreak, user.CurrentStreak);
        user.LastActivityDate = activityDate;
    }
}

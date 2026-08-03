using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Xunit;

namespace BudgetBounder.Api.Tests.Services;

public class ProgressionServiceTests
{
    [Theory]
    [InlineData(0, 1)]
    [InlineData(99, 1)]
    [InlineData(100, 2)]
    [InlineData(249, 2)]
    [InlineData(250, 3)]
    [InlineData(4999, 9)]
    [InlineData(5000, 10)]
    public void CalculateLevel_UsesExistingProgressionBoundaries(double xp, int expected)
    {
        Assert.Equal(expected, ProgressionService.CalculateLevel(xp));
    }

    [Fact]
    public void AwardXp_AddsPositiveXpAndRecalculatesLevel()
    {
        var user = new User { XP = 90, Level = 1 };

        ProgressionService.AwardXp(user, 20);

        Assert.Equal(110, user.XP);
        Assert.Equal(2, user.Level);
    }

    [Fact]
    public void AwardXp_RejectsNonPositiveAwards()
    {
        var user = new User { XP = 90, Level = 1 };

        Assert.Throws<ArgumentOutOfRangeException>(() => ProgressionService.AwardXp(user, 0));
        Assert.Equal(90, user.XP);
    }

    [Fact]
    public void UpdateStreak_CountsOnlyOneActivityPerDay()
    {
        var user = new User
        {
            CurrentStreak = 4,
            LongestStreak = 7,
            LastActivityDate = new DateOnly(2026, 7, 23)
        };

        ProgressionService.UpdateStreak(user, new DateOnly(2026, 7, 23));

        Assert.Equal(4, user.CurrentStreak);
        Assert.Equal(7, user.LongestStreak);
    }

    [Fact]
    public void UpdateStreak_IncrementsConsecutiveDayAndLongestStreak()
    {
        var user = new User
        {
            CurrentStreak = 7,
            LongestStreak = 7,
            LastActivityDate = new DateOnly(2026, 7, 22)
        };

        ProgressionService.UpdateStreak(user, new DateOnly(2026, 7, 23));

        Assert.Equal(8, user.CurrentStreak);
        Assert.Equal(8, user.LongestStreak);
    }

    [Fact]
    public void UpdateStreak_RestartsAfterMissedDay()
    {
        var user = new User
        {
            CurrentStreak = 12,
            LongestStreak = 12,
            LastActivityDate = new DateOnly(2026, 7, 20)
        };

        ProgressionService.UpdateStreak(user, new DateOnly(2026, 7, 23));

        Assert.Equal(1, user.CurrentStreak);
        Assert.Equal(12, user.LongestStreak);
        Assert.Equal(new DateOnly(2026, 7, 23), user.LastActivityDate);
    }
}

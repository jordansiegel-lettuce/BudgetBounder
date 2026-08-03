namespace BudgetBounder.Api.Dtos;

public sealed record AdminOverviewDto(
    int TotalUsers,
    int ActiveUsers,
    int InactiveUsers,
    int NewRegistrations,
    int TransactionsLogged,
    int MissionsCompleted,
    double AverageUserLevel,
    int SavingsGoalsCreated,
    int AiGeneratedMissions);

public sealed record AdminUserDto(
    int Id,
    string FullName,
    string Email,
    int Level,
    double XP,
    string Role,
    bool IsActive,
    DateTime? LastActiveAt,
    int CurrentStreak);

public sealed record UserStatusRequest(bool IsActive);

public sealed record AdminMissionRequest(
    int UserId,
    string Title,
    string Description,
    string Difficulty,
    int XPReward,
    string MissionType,
    double TargetValue,
    DateTime ExpiresAt);

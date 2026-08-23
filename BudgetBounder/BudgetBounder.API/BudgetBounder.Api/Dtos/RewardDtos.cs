namespace BudgetBounder.Api.Dtos;

public sealed record AdminRewardCreateRequest(string Code, string Name, string Description, string CosmeticType);
public sealed record AdminRewardStatusRequest(bool IsActive);
public sealed record AdminRewardDto(int Id, string Code, string Name, string Description, string CosmeticType, bool IsActive, int UnlockCount, DateTime CreatedAt);

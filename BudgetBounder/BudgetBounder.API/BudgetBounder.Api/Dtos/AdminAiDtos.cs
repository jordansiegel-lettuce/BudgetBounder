namespace BudgetBounder.Api.Dtos;

public sealed record AdminAiReviewRequest(string Decision);
public sealed record AdminAiRecommendationDto(
    int Id, int UserId, string Title, string Content, string Status,
    DateTime CreatedAt, int? ReviewedByAdminId, DateTime? ReviewedAt);

using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/admin/ai-recommendations")]
[Authorize(Policy = "AdminOnly")]
public class AdminAiController(BudgetBounderDbContext context, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AdminAiRecommendationDto>>> List(
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = context.AiRecommendations.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(item => item.Status == status);
        return Ok(await query.OrderByDescending(item => item.CreatedAt)
            .Take(200)
            .Select(item => new AdminAiRecommendationDto(
                item.Id, item.UserId, item.Title, item.Content, item.Status,
                item.CreatedAt, item.ReviewedByAdminId, item.ReviewedAt))
            .ToListAsync(cancellationToken));
    }

    [HttpPatch("{id:int}/review")]
    public async Task<ActionResult> Review(
        int id,
        AdminAiReviewRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Decision is not (AiRecommendationStatuses.Approved or AiRecommendationStatuses.Rejected))
            return BadRequest("Decision must be Approved or Rejected.");
        if (currentUser.UserId is not int adminId) return Unauthorized();

        var recommendation = await context.AiRecommendations.FindAsync([id], cancellationToken);
        if (recommendation is null) return NotFound();
        if (recommendation.Status != AiRecommendationStatuses.Draft)
            return Conflict("This recommendation has already been reviewed.");

        recommendation.Status = request.Decision;
        recommendation.ReviewedByAdminId = adminId;
        recommendation.ReviewedAt = DateTime.UtcNow;
        context.AdminAuditLogs.Add(new AdminAuditLog
        {
            AdminUserId = adminId,
            Action = "ReviewAiRecommendation",
            TargetType = "AiRecommendation",
            TargetId = id.ToString(),
            Details = $"Decision={request.Decision}"
        });
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}

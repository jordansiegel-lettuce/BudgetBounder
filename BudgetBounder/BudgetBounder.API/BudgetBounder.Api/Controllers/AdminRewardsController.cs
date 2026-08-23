using System.Text.RegularExpressions;
using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/admin/rewards")]
[Authorize(Policy = "AdminOnly")]
public partial class AdminRewardsController(BudgetBounderDbContext context, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AdminRewardDto>>> List(CancellationToken cancellationToken) =>
        Ok(await context.RewardDefinitions.AsNoTracking().OrderBy(item => item.Name)
            .Select(item => new AdminRewardDto(item.Id, item.Code, item.Name, item.Description,
                item.CosmeticType, item.IsActive, item.Unlocks.Count, item.CreatedAt))
            .ToListAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<AdminRewardDto>> Create(AdminRewardCreateRequest request, CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int adminId) return Unauthorized();
        if (!CosmeticTypes.Allowed.Contains(request.CosmeticType, StringComparer.OrdinalIgnoreCase))
            return BadRequest("Cosmetic type must be Badge, Theme, or AvatarFrame.");
        var code = CodeSeparators().Replace(request.Code.Trim().ToLowerInvariant(), "-").Trim('-');
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Description))
            return BadRequest("Code, name, and description are required.");
        if (await context.RewardDefinitions.AnyAsync(item => item.Code == code, cancellationToken))
            return Conflict("A reward with this code already exists.");

        var reward = new RewardDefinition
        {
            Code = code,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            CosmeticType = CosmeticTypes.Allowed.Single(item => item.Equals(request.CosmeticType, StringComparison.OrdinalIgnoreCase))
        };
        context.RewardDefinitions.Add(reward);
        Audit(adminId, "CreateRewardDefinition", reward.Code, reward.CosmeticType);
        await context.SaveChangesAsync(cancellationToken);
        return Created($"/api/admin/rewards/{reward.Id}", ToDto(reward));
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult> SetStatus(int id, AdminRewardStatusRequest request, CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int adminId) return Unauthorized();
        var reward = await context.RewardDefinitions.FindAsync([id], cancellationToken);
        if (reward is null) return NotFound();
        reward.IsActive = request.IsActive;
        Audit(adminId, "SetRewardStatus", id.ToString(), $"IsActive={request.IsActive}");
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private void Audit(int adminId, string action, string targetId, string details) => context.AdminAuditLogs.Add(new AdminAuditLog
    {
        AdminUserId = adminId, Action = action, TargetType = "RewardDefinition", TargetId = targetId, Details = details
    });

    private static AdminRewardDto ToDto(RewardDefinition item) => new(item.Id, item.Code, item.Name, item.Description, item.CosmeticType, item.IsActive, item.Unlocks.Count, item.CreatedAt);

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex CodeSeparators();
}

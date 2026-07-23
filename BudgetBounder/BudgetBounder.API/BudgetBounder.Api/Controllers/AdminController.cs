using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController(
    BudgetBounderDbContext context,
    AdminDashboardService dashboard,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult<AdminOverviewDto>> Overview(CancellationToken cancellationToken) =>
        Ok(await dashboard.GetOverviewAsync(cancellationToken));

    [HttpGet("users")]
    public async Task<ActionResult> Users(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = context.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.FullName!.Contains(search) || u.Email!.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(u => u.LastActiveAt)
            .ThenBy(u => u.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserDto(
                u.Id, u.FullName!, u.Email!, u.Level, u.XP, u.Role,
                u.IsActive, u.LastActiveAt, u.CurrentStreak))
            .ToListAsync(cancellationToken);
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("users/{id:int}")]
    public async Task<ActionResult<AdminUserDto>> UserById(int id, CancellationToken cancellationToken)
    {
        var user = await context.Users.AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new AdminUserDto(
                u.Id, u.FullName!, u.Email!, u.Level, u.XP, u.Role,
                u.IsActive, u.LastActiveAt, u.CurrentStreak))
            .SingleOrDefaultAsync(cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPatch("users/{id:int}/status")]
    public async Task<ActionResult> SetUserStatus(
        int id,
        UserStatusRequest request,
        CancellationToken cancellationToken)
    {
        var user = await context.Users.FindAsync([id], cancellationToken);
        if (user is null) return NotFound();
        if (user.Role == UserRoles.Admin && !request.IsActive) return BadRequest("Administrator accounts cannot be disabled here.");
        user.IsActive = request.IsActive;
        Audit("SetUserStatus", "User", id.ToString(), $"IsActive={request.IsActive}");
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("missions")]
    public async Task<ActionResult> Missions(CancellationToken cancellationToken) =>
        Ok(await context.Missions.AsNoTracking()
            .OrderByDescending(m => m.CreatedAt)
            .Take(200)
            .ToListAsync(cancellationToken));

    [HttpPost("missions")]
    public async Task<ActionResult<Mission>> CreateMission(
        AdminMissionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.XPReward is < 1 or > 1000 || request.TargetValue <= 0 || request.ExpiresAt <= DateTime.UtcNow)
            return BadRequest("Reward, target, and expiration are invalid.");
        if (!await context.Users.AnyAsync(u => u.Id == request.UserId, cancellationToken))
            return BadRequest("Target user does not exist.");
        var mission = new Mission
        {
            UserId = request.UserId,
            Title = request.Title,
            Description = request.Description,
            Difficulty = request.Difficulty,
            XPReward = request.XPReward,
            MissionType = request.MissionType,
            TargetValue = request.TargetValue,
            ExpiresAt = request.ExpiresAt
        };
        context.Missions.Add(mission);
        Audit("CreateMission", "Mission", "pending", request.Title);
        await context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Missions), new { id = mission.Id }, mission);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<AdminOverviewDto>> Analytics(CancellationToken cancellationToken) =>
        Ok(await dashboard.GetOverviewAsync(cancellationToken));

    [HttpGet("monitoring")]
    public ActionResult Monitoring() => Ok(new
    {
        api = new { status = "Operational", checkedAt = DateTime.UtcNow },
        database = new { status = "Operational" },
        ai = new { status = "Configured" },
        unity = new { status = "Milestone 2" }
    });

    [HttpGet("audit-log")]
    public async Task<ActionResult> AuditLog(CancellationToken cancellationToken) =>
        Ok(await context.AdminAuditLogs.AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .Take(200)
            .ToListAsync(cancellationToken));

    private void Audit(string action, string targetType, string targetId, string details)
    {
        if (currentUser.UserId is not int adminId) return;
        context.AdminAuditLogs.Add(new AdminAuditLog
        {
            AdminUserId = adminId,
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            Details = details
        });
    }
}

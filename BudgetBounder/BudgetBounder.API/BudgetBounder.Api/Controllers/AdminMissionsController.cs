using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController, Route("api/admin/missions"), Authorize(Policy = "AdminOnly")]
public class AdminMissionsController(BudgetBounderDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> List(string? status, bool? ai, int? userId, int page = 1, CancellationToken cancellationToken = default)
    {
        if (page < 1 || userId is <= 0 || (status != null && !new[] { "Draft", "Approved", "Rejected" }.Contains(status)))
            return BadRequest("Invalid mission filters.");
        var query = db.Missions.AsNoTracking().Where(m => (status == null || m.ReviewStatus == status) &&
            (!ai.HasValue || m.IsAiGenerated == ai) && (!userId.HasValue || m.UserId == userId));
        var total = await query.CountAsync(cancellationToken);
        var completed = await query.CountAsync(m => m.IsCompleted, cancellationToken);
        var items = await query.OrderByDescending(m => m.CreatedAt).ThenByDescending(m => m.Id)
            .Skip((page - 1) * 50).Take(50).ToListAsync(cancellationToken);
        return Ok(new { items, total, completed, page, pageSize = 50 });
    }

    [HttpPost]
    public async Task<ActionResult> Create(AdminMissionRequest request, CancellationToken cancellationToken)
    {
        if (!Valid(request)) return BadRequest("Provide a title, description, supported type, positive target, 1–1000 XP and future expiry.");
        var users = await db.Users.Where(u => u.IsActive && (request.UserId == 0 || u.Id == request.UserId)).Select(u => u.Id).ToListAsync(cancellationToken);
        if (users.Count == 0) return BadRequest("No active target users found.");
        foreach (var id in users)
        {
            var mission = new Mission { UserId = id, ReviewStatus = "Approved", ReviewedByAdminId = currentUser.UserId, ReviewedAt = DateTime.UtcNow };
            Apply(mission, request);
            db.Missions.Add(mission);
        }
        Audit("CreateMission", "batch", $"{request.Title}; users={users.Count}");
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException) { return Conflict("A mission with this type and expiry already exists for a target user. Choose another expiry."); }
        return Ok(new { created = users.Count });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Edit(int id, AdminMissionRequest request, CancellationToken cancellationToken)
    {
        var mission = await db.Missions.FindAsync([id], cancellationToken);
        if (mission == null) return NotFound();
        if (mission.IsCompleted || mission.CurrentProgress > 0) return Conflict("Missions with progress are read-only. Create a new mission instead.");
        if (!Valid(request) || mission.UserId != request.UserId) return BadRequest("Invalid mission fields. The assigned user cannot change.");
        Apply(mission, request);
        if (mission.IsAiGenerated) { mission.ReviewStatus = "Draft"; mission.ReviewedByAdminId = null; mission.ReviewedAt = null; }
        Audit("EditMission", id.ToString(), request.Title);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException) { return Conflict("The mission changed or conflicts with an existing mission. Reload and try again."); }
        return NoContent();
    }

    [HttpPatch("{id:int}/review")]
    public async Task<ActionResult> Review(int id, MissionReviewRequest request, CancellationToken cancellationToken)
    {
        if (!new[] { "Approved", "Rejected" }.Contains(request.Decision)) return BadRequest("Choose Approved or Rejected.");
        var mission = await db.Missions.FindAsync([id], cancellationToken);
        if (mission == null) return NotFound();
        if (mission.IsCompleted) return Conflict("Completed missions cannot be changed.");
        if (request.Decision == "Approved" && (mission.ExpiresAt <= DateTime.UtcNow || !Valid(new AdminMissionRequest(mission.UserId, mission.Title, mission.Description, mission.Difficulty, mission.XPReward, mission.MissionType, mission.TargetValue, mission.ExpiresAt))))
            return BadRequest("Edit this mission to provide valid fields and a future expiry before approving it.");
        mission.ReviewStatus = request.Decision;
        mission.ReviewedByAdminId = currentUser.UserId;
        mission.ReviewedAt = DateTime.UtcNow;
        Audit("ReviewMission", id.ToString(), request.Decision);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { return Conflict("The mission changed. Reload before reviewing."); }
        return NoContent();
    }

    private static bool Valid(AdminMissionRequest r) => r.UserId >= 0 && !string.IsNullOrWhiteSpace(r.Title) && r.Title.Length <= 160 &&
        !string.IsNullOrWhiteSpace(r.Description) && r.Description.Length <= 2000 && r.XPReward is >= 1 and <= 1000 &&
        double.IsFinite(r.TargetValue) && r.TargetValue > 0 && r.TargetValue <= 10000 && r.ExpiresAt > DateTime.UtcNow &&
        new[] { "Easy", "Medium", "Hard" }.Contains(r.Difficulty) && new[] { "LogExpenses", "LogIncome", "SavingGoal", "DailyStreak" }.Contains(r.MissionType);
    private static void Apply(Mission m, AdminMissionRequest r)
    {
        m.Title = r.Title.Trim(); m.Description = r.Description.Trim(); m.Difficulty = r.Difficulty;
        m.XPReward = r.XPReward; m.MissionType = r.MissionType; m.TargetValue = r.TargetValue; m.ExpiresAt = r.ExpiresAt.ToUniversalTime();
    }
    private void Audit(string action, string id, string details)
    {
        if (currentUser.UserId is int adminId) db.AdminAuditLogs.Add(new AdminAuditLog { AdminUserId = adminId, Action = action, TargetType = "Mission", TargetId = id, Details = details });
    }
}
public sealed record MissionReviewRequest(string Decision);

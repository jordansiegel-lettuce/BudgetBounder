using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Controllers;

[ApiController]
[Route("api/budgets")]
[Authorize]
public class BudgetsController(BudgetBounderDbContext context, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult> GetMine([FromQuery] DateOnly? month, CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        var selected = month ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var start = new DateTime(selected.Year, selected.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var budget = await context.MonthlyBudgets
            .SingleOrDefaultAsync(b => b.UserId == userId && b.Month == start, cancellationToken);
        return budget is null ? NoContent() : Ok(budget);
    }

    [HttpPut("me/{year:int}/{month:int}")]
    public async Task<ActionResult<MonthlyBudget>> UpsertMine(
        int year,
        int month,
        [FromBody] BudgetAmountRequest request,
        CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not int userId) return Unauthorized();
        if (month is < 1 or > 12 || request.Amount <= 0) return BadRequest("A positive amount and valid month are required.");
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var budget = await context.MonthlyBudgets
            .SingleOrDefaultAsync(b => b.UserId == userId && b.Month == start, cancellationToken);
        if (budget is null)
        {
            budget = new MonthlyBudget { UserId = userId, Month = start, Amount = request.Amount };
            context.MonthlyBudgets.Add(budget);
        }
        else
        {
            budget.Amount = request.Amount;
            budget.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Ok(budget);
    }
}

public sealed record BudgetAmountRequest(double Amount);

using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace BudgetBounder.Api.Controllers;
[ApiController]
[Route("api/admin/analytics")]
[Authorize(Policy = "AdminOnly")]
public sealed class AdminAnalyticsController(AdminDashboardService dashboard) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminAnalyticsDto>> Get([FromQuery] AdminAnalyticsFilter filters, CancellationToken cancellationToken)
    {
        try { return Ok(await dashboard.GetAnalyticsAsync(filters, cancellationToken)); }
        catch (ArgumentException error) { return BadRequest(new { message = error.Message }); }
    }
}

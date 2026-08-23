using System.Text.Json;
using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class AdminMonitoringTests
{
    [Fact]
    public void Monitoring_ReportsUnityIntegrationAsOperational()
    {
        using var context = new BudgetBounderDbContext(new DbContextOptionsBuilder<BudgetBounderDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var controller = new AdminController(context, new AdminDashboardService(context), new AdminUser());

        var result = Assert.IsType<OkObjectResult>(controller.Monitoring());
        var json = JsonSerializer.Serialize(result.Value);

        Assert.Contains("\"unity\":{\"status\":\"Operational\"", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Milestone 2", json);
    }

    private sealed class AdminUser : ICurrentUserService
    {
        public int? UserId => 1;
        public bool IsAdmin => true;
    }
}

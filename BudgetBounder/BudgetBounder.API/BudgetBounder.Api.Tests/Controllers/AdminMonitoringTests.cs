using System.Text.Json;
using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class AdminMonitoringTests
{
    [Fact]
    public async Task Monitoring_ReportsLiveDatabaseAndGameStatus()
    {
        using var context = NewContext();
        var controller = new AdminController(context, new AdminDashboardService(context), new AdminUser());

        var json = await MonitoringJson(controller, new Dictionary<string, string?> { ["Groq:ApiKey"] = "test-key" });

        Assert.Contains("\"database\":{\"status\":\"Operational\"", json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("\"game\":{\"status\":\"Operational\"", json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("\"ai\":{\"status\":\"Operational\"", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Milestone 2", json);
    }

    [Fact]
    public async Task Monitoring_ReportsMissingAiKey()
    {
        using var context = NewContext();
        var controller = new AdminController(context, new AdminDashboardService(context), new AdminUser());

        var json = await MonitoringJson(controller, new Dictionary<string, string?>());

        Assert.Contains("\"ai\":{\"status\":\"Not configured\"", json, StringComparison.OrdinalIgnoreCase);
    }

    private static BudgetBounderDbContext NewContext() => new(new DbContextOptionsBuilder<BudgetBounderDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static async Task<string> MonitoringJson(AdminController controller, Dictionary<string, string?> settings)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        var result = Assert.IsType<OkObjectResult>(await controller.Monitoring(configuration, CancellationToken.None));
        return JsonSerializer.Serialize(result.Value);
    }

    private sealed class AdminUser : ICurrentUserService
    {
        public int? UserId => 1;
        public bool IsAdmin => true;
    }
}

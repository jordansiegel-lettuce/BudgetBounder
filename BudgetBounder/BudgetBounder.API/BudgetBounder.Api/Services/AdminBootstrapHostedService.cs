using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetBounder.Api.Services;

public sealed class AdminBootstrapHostedService(
    IServiceProvider services,
    IConfiguration configuration,
    ILogger<AdminBootstrapHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var email = configuration["BootstrapAdmin:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["BootstrapAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogInformation("Admin bootstrap is disabled. Set BootstrapAdmin__Email and BootstrapAdmin__Password to create the first administrator.");
            return;
        }

        await using var scope = services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<BudgetBounderDbContext>();
        var admin = await context.Users.SingleOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (admin is null)
        {
            admin = new User
            {
                FullName = "BudgetBounder Administrator",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRoles.Admin,
                IsActive = true
            };
            context.Users.Add(admin);
        }
        else
        {
            admin.Role = UserRoles.Admin;
            admin.IsActive = true;
        }

        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Administrator bootstrap is ready for {Email}.", email);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

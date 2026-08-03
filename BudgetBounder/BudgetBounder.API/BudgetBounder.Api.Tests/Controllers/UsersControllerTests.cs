using BudgetBounder.Api.Controllers;
using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace BudgetBounder.Api.Tests.Controllers;

public class UsersControllerTests
{
    [Fact]
    public void Register_ReturnsConflictForExistingEmailIgnoringCase()
    {
        var options = new DbContextOptionsBuilder<BudgetBounderDbContext>()
            .UseInMemoryDatabase(nameof(Register_ReturnsConflictForExistingEmailIgnoringCase))
            .Options;
        using var context = new BudgetBounderDbContext(options);
        context.Users.Add(new User
        {
            FullName = "Existing",
            Email = "player@example.com",
            PasswordHash = "unused"
        });
        context.SaveChanges();
        var controller = new UsersController(context, new ConfigurationBuilder().Build());

        var result = controller.Register(new RegisterDto
        {
            FullName = "New",
            Email = "PLAYER@example.com",
            Password = "password"
        });

        Assert.IsType<ConflictObjectResult>(result);
        Assert.Single(context.Users);
    }
}

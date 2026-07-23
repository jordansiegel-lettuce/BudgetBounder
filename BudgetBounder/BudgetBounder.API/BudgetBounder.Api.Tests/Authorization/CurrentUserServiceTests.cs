using System.Security.Claims;
using BudgetBounder.Api.Authorization;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace BudgetBounder.Api.Tests.Authorization;

public class CurrentUserServiceTests
{
    [Fact]
    public void ResolvesUserIdAndRoleFromAuthenticatedClaims()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "42"),
            new Claim(ClaimTypes.Role, "Admin")
        ], "test"));
        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        var service = new CurrentUserService(accessor);

        Assert.Equal(42, service.UserId);
        Assert.True(service.IsAdmin);
    }

    [Fact]
    public void MissingUserIdentifierReturnsNull()
    {
        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity())
            }
        };

        Assert.Null(new CurrentUserService(accessor).UserId);
    }
}

using System.Security.Claims;

namespace BudgetBounder.Api.Authorization;

public interface ICurrentUserService
{
    int? UserId { get; }
    bool IsAdmin { get; }
}

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public int? UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User?.FindFirstValue("sub");
            return int.TryParse(value, out var id) ? id : null;
        }
    }

    public bool IsAdmin => User?.IsInRole(UserRoles.Admin) == true;
}

public static class UserRoles
{
    public const string User = "User";
    public const string Admin = "Admin";
}

using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetBounder.Api.Tests.Data;

public class UserModelTests
{
    [Fact]
    public void EmailIndex_PreservesLegacyDuplicateRows()
    {
        var options = new DbContextOptionsBuilder<BudgetBounderDbContext>()
            .UseInMemoryDatabase(nameof(EmailIndex_PreservesLegacyDuplicateRows))
            .Options;
        using var context = new BudgetBounderDbContext(options);

        var emailIndex = context.Model.FindEntityType(typeof(User))!
            .GetIndexes()
            .Single(index => index.Properties.Single().Name == nameof(User.Email));

        Assert.False(emailIndex.IsUnique);
    }
}

using BudgetBounder.Api.Services;
using Xunit;
namespace BudgetBounder.Api.Tests.Services;
public class CategoryTests
{
    [Theory]
    [InlineData("Bus ticket", "Transport")]
    [InlineData("Coffee and lunch", "Food")]
    [InlineData("Rent September", "Housing")]
    [InlineData("Unknown merchant", "Other")]
    public void SuggestsCategoryFromDescription(string title, string expected) => Assert.Equal(expected, TransactionCategorizer.Suggest(title));
}

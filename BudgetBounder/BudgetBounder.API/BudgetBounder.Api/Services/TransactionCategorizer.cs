using System.Text.RegularExpressions;
namespace BudgetBounder.Api.Services;
public static class TransactionCategorizer
{
    private static readonly (string Category, string Words)[] Rules = [
        ("Food", "coffee|lunch|dinner|restaurant|grocery|supermarket|pizza|קפה|מסעדה|סופר|אוכל"),
        ("Transport", "bus|train|taxi|uber|fuel|petrol|parking|אוטובוס|רכבת|דלק|חניה"),
        ("Housing", "rent|electricity|water|mortgage|שכירות|חשמל|ארנונה"),
        ("Health", "doctor|pharmacy|medicine|dentist|רופא|תרופה|מרקחת"),
        ("Shopping", "clothes|shoes|amazon|בגדים|נעליים")];
    public static string Suggest(string? title) => Rules.FirstOrDefault(rule =>
        Regex.IsMatch(title ?? "", "\\b(" + rule.Words + ")\\b", RegexOptions.IgnoreCase)).Category ?? "Other";
}

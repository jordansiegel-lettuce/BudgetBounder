namespace BudgetBounder.Api.Services
{
    public static class LevelService
    {
        public static int CalculateLevel(double xp)
        {
            return ProgressionService.CalculateLevel(xp);
        }
    }
}

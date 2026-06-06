namespace BudgetBounder.Api.Services
{
    public static class LevelService
    {
        public static int CalculateLevel(double xp)
        {
            if (xp >= 5000) return 10;
            if (xp >= 4500) return 9;
            if (xp >= 4000) return 8;
            if (xp >= 3000) return 7;
            if (xp >= 2000) return 6;
            if (xp >= 1000) return 5;
            if (xp >= 500)  return 4;
            if (xp >= 250)  return 3;
            if (xp >= 100)  return 2;
            return 1;
        }
    }
}

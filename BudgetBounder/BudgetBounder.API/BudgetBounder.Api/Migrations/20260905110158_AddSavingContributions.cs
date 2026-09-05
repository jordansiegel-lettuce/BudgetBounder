using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetBounder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSavingContributions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'first-entry') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('first-entry', 'First Entry', 'Recorded your first financial entry.', 'Badge', 1, SYSUTCDATETIME())");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'first-mission') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('first-mission', 'Quest Starter', 'Completed your first mission.', 'Badge', 1, SYSUTCDATETIME())");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'first-vault') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('first-vault', 'Vault Keeper', 'Completed a savings goal.', 'Badge', 1, SYSUTCDATETIME())");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'level-five') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('level-five', 'Level Five', 'Reached finance level five.', 'Badge', 1, SYSUTCDATETIME())");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'tower-explorer') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('tower-explorer', 'Tower Explorer', 'Submitted a valid built-in game result.', 'Badge', 1, SYSUTCDATETIME())");
            migrationBuilder.CreateTable(
                name: "SavingContributions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SavingGoalId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavingContributions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavingContributions_UserId_CreatedAt",
                table: "SavingContributions",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SavingContributions");
        }
    }
}

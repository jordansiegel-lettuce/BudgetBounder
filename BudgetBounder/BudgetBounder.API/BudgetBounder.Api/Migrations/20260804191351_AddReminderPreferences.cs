using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetBounder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReminderPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DailyLogEnabled = table.Column<bool>(type: "bit", nullable: false),
                    DailyLogHour = table.Column<int>(type: "int", nullable: false),
                    BudgetAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    BudgetThresholdPercent = table.Column<int>(type: "int", nullable: false),
                    GoalRemindersEnabled = table.Column<bool>(type: "bit", nullable: false),
                    GoalReminderWeekday = table.Column<int>(type: "int", nullable: false),
                    GoalReminderHour = table.Column<int>(type: "int", nullable: false),
                    MissionAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReminderPreferences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReminderPreferences_UserId",
                table: "ReminderPreferences",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReminderPreferences");
        }
    }
}

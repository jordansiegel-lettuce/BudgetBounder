using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetBounder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIsAiGeneratedToMissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAiGenerated",
                table: "Missions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAiGenerated",
                table: "Missions");
        }
    }
}

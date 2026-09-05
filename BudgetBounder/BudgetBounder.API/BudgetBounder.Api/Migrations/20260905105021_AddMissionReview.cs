using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetBounder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMissionReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReviewStatus",
                table: "Missions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Approved");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "Missions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReviewedByAdminId",
                table: "Missions",
                type: "int",
                nullable: true);
            migrationBuilder.Sql("UPDATE Missions SET ReviewStatus = CASE WHEN IsAiGenerated = 1 AND IsCompleted = 0 THEN 'Draft' ELSE 'Approved' END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReviewStatus",
                table: "Missions");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "Missions");

            migrationBuilder.DropColumn(
                name: "ReviewedByAdminId",
                table: "Missions");
        }
    }
}

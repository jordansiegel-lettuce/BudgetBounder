using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetBounder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReceiptAndMerchantLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Transactions",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Transactions",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MerchantAddress",
                table: "Transactions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptImageDataUrl",
                table: "Transactions",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "MerchantAddress",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ReceiptImageDataUrl",
                table: "Transactions");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeoMarker.Data.Migrations
{
    public partial class changedcolumnname : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Markers");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Markers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Markers");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Markers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}

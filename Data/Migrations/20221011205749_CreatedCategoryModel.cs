using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeoMarker.Data.Migrations
{
    public partial class CreatedCategoryModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Markers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<int>(type: "int", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.CategoryId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Markers_CategoryId",
                table: "Markers",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Markers_Category_CategoryId",
                table: "Markers",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Markers_Category_CategoryId",
                table: "Markers");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropIndex(
                name: "IX_Markers_CategoryId",
                table: "Markers");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Markers");
        }
    }
}

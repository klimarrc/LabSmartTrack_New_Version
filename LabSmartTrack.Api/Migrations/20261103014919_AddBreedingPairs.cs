using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabSmartTrack.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBreedingPairs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BreedingPairs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BreedingCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SireId = table.Column<int>(type: "int", nullable: false),
                    DamId = table.Column<int>(type: "int", nullable: false),
                    CageId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreedingPairs", x => x.Id);
                    table.CheckConstraint("CK_BreedingPairs_DateOrder", "[EndDate] IS NULL OR [EndDate] >= [StartDate]");
                    table.CheckConstraint("CK_BreedingPairs_DifferentMice", "[SireId] <> [DamId]");
                    table.ForeignKey(
                        name: "FK_BreedingPairs_Cages_CageId",
                        column: x => x.CageId,
                        principalTable: "Cages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BreedingPairs_Mice_DamId",
                        column: x => x.DamId,
                        principalTable: "Mice",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BreedingPairs_Mice_SireId",
                        column: x => x.SireId,
                        principalTable: "Mice",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BreedingPairs_CageId",
                table: "BreedingPairs",
                column: "CageId");

            migrationBuilder.CreateIndex(
                name: "IX_BreedingPairs_DamId",
                table: "BreedingPairs",
                column: "DamId");

            migrationBuilder.CreateIndex(
                name: "IX_BreedingPairs_SireId",
                table: "BreedingPairs",
                column: "SireId");

            migrationBuilder.CreateIndex(
                name: "UX_BreedingPairs_BreedingCode",
                table: "BreedingPairs",
                column: "BreedingCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BreedingPairs");
        }
    }
}

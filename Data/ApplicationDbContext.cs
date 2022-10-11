using GeoMarker.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GeoMarker.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // reference each model as DBSet objects
        public DbSet<Marker> Markers { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
    }
}
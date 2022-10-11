using Microsoft.Extensions.Hosting;

namespace GeoMarker.Models
{
    public class Favorite
    {
        public int FavoriteId { get; set; }
        
        public int UserId { get; set; }

        public int MarkerId { get; set; }

        // ref to parent - 1 Post can have many Likes
        public Marker? Marker { get; set; }
    }
}

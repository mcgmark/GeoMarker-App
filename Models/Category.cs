using System.ComponentModel.DataAnnotations;

namespace GeoMarker.Models
{
    public class Category
    {
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(50)]
        [Display(Name = "Category")]
        public string? Name { get; set; }

        // ref to parent - 1 Category can have many Markers
        public List<Marker>? Markers { get; set; }
    }
}

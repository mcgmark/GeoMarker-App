using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace GeoMarker.Models
{
    public class Marker
    {
        public int MarkerId { get; set; }


        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string? Title { get; set; }

        // FK for Category
        [Display(Name = "Category")]
        public int CategoryId { get; set; }

        // ref to parent model
        public Category? Category { get; set; }

        [Required]
        [MaxLength(500)]
        public string? Description { get; set; }

        public string? Photo { get; set; }

        public string? Address { get; set; }

        public string? Latitude { get; set; }

        public string? Longitude { get; set; }

        [Required]
        [Display(Name = "Date")]
        public DateTime CreatedDate { get; set; }

    }
}

using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class About
    {
        [Key]
        public int aboutid { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(300, ErrorMessage = "Heading must be at most 300 characters.")]
        public string Heading { get; set; }

        [Required]
        [StringLength(4000, ErrorMessage = "Text content must be at most 4000 characters.")]
        public string TextContent { get; set; }

        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        public DateTime ModifiedTime { get; set; } = DateTime.UtcNow;
    }

    public class AboutUsDTO
    {
        [Required(ErrorMessage = "UserId is required.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Heading is required.")]
        [StringLength(100, ErrorMessage = "Heading must be at most 100 characters.")]
        public string Heading { get; set; }

        [Required(ErrorMessage = "Text content is required.")]
        [StringLength(4000, ErrorMessage = "Text content must be at most 4000 characters.")]
        public string textContent { get; set; }
    }

    public class aboutus
    {

        [StringLength(100, ErrorMessage = "Heading must be at most 100 characters.")]
        public string Heading { get; set; }


        [StringLength(4000, ErrorMessage = "Text content must be at most 4000 characters.")]
        public string TextContent { get; set; }
    }

}
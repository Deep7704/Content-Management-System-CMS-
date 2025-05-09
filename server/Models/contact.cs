using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class contact
    {
        [Key]
        public int inquiry_id { get; internal set; }
        public string name { get; set; }
        public string email { get; set; }
        [Required]
        [StringLength(10, MinimumLength = 10)]
        [RegularExpression(@"[1-9][0-9]{9}$", ErrorMessage = "Mobile number must be 10 digits, and cannot be composed of repeated digits. It can optionally start with a + sign.")]
        public required string phone { get; set; } = null!;
        public string message { get; set; }

        public Boolean IsActive { get; internal set; } = true;
    }
}

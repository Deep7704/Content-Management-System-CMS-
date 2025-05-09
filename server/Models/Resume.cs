using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Models
{
    [Table("resumes")] 
    public class Resume
    {

        [Key]
        public int resumeid { get; internal set; }
        public int UserId { get; set; }

        [Required]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "Only letters allowed.")]
        public string FirstName { get; set; }

        [RegularExpression("^[a-zA-Z]*$", ErrorMessage = "Only letters allowed.")]
        public string MiddleName { get; set; }

        [Required]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "Only letters allowed.")]
        public string LastName { get; set; }


        public string MobileNo { get; set; }

        [Required]
        public string Location { get; set; }
        public bool isactive { get; set; } 

        [Required]
        [EmailAddress]
        public string EmailId { get; set; }
        public string FileName { get; set; }
        public DateTime UploadedDate { get; set; }

        [Required]
        public byte[] FileContent { get; set; }

    }
}
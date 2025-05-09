using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Models
{
    public class HomeBanner
    {
        [Key]
        public int Item_id { get; set; }
        public  string FileName { get; set; }
        public  byte[] FileContent { get; set; }
        public  string FileType { get; set; }

        [Column("uploadeddate")]
        public  DateTime UploadedDate { get; set; }
        public int UserId { get; set; }

        public string textContent { get; set; }





    }
}

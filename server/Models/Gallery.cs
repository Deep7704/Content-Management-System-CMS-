using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Models
{
    [Table("gallery")]
    public class GalleryItem
    {
        [Key]
        public int Item_Id { get; set; }
        public int UserId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public byte[] FileContent { get; set; }

        [Column("uploadeddate")]
        public DateTime UploadedDate { get; set; } // Use only this
        [Column(TypeName = "timestamp")]
        public DateTime ModifiedTime { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;
    }

    public class Image
    {
        [Key]
        public int itemId { get; set; }
        public int UserId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public byte[] FileContent { get; set; }

        public string Pagename { get; set; }

        [Column("uploadeddate")]
        public DateTime UploadedDate { get; set; } // Use only this
        [Column(TypeName = "timestamp")]
        public DateTime ModifiedTime { get; set; } = DateTime.Now;
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CMS.Models;

public partial class CmsContext : DbContext
{

    public virtual DbSet<GalleryItem> GalleryItems { get; set; }

    public virtual DbSet<Image>Getimages { get; set; }
    public virtual DbSet<HomeBanner> HomeBanners { get; set; }


    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(RelationalEventId.PendingModelChangesWarning)); // Or use another event ID
    }


    public CmsContext(DbContextOptions<CmsContext> options)
        : base(options)
    {
    }
    public virtual DbSet<Resume> Resumes { get; set; }
    public  DbSet<Register> Register { get; set; }
    public virtual DbSet<About> Aboutus { get; set; }
    public virtual DbSet<About> AboutUsDTO { get; set; }
    public virtual DbSet<About> aboutus { get; set; }
    public virtual DbSet <Footer> footer { get; set; }
    public virtual DbSet<FooterUpdateRequest> FooterUpdateRequests { get; set; }

    public virtual DbSet<contact> contactus { get; set; }

    //public object ContentMasters { get; internal set; }


    public virtual DbSet<ContentMaster> ContentMaster { get; set; }
    //public DbSet<User> Users { get; set; } // Ensure this exists
    public DbSet<ContentMaster> ContentMasters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ContentMaster>()
      .HasKey(c => c.Id);

        modelBuilder.Entity<Footer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("footer_content_pkey");
            entity.ToTable("footer_content");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WebsiteTitle).HasColumnName("websitetitle");
            entity.Property(e => e.CopyrightText).HasColumnName("copyright_text");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FooterLinks).HasColumnName("footer_links");
            entity.Property(e => e.SocialLinks).HasColumnName("social_links");
        });


        modelBuilder.Entity<contact>(entity =>
        {
            entity.HasKey(e => e.inquiry_id).HasName("inquiry_id");

            entity.ToTable("contactus");

            entity.Property(e => e.inquiry_id).HasColumnName("inquiry_id");
            entity.Property(e => e.name).HasColumnName("name");
            entity.Property(e => e.phone).HasColumnName("phone");
            entity.Property(e => e.email).HasColumnName("email");
            entity.Property(e => e.message).HasColumnName("message");
            entity.Property(e => e.IsActive).HasColumnName("isactive");
        });


        modelBuilder.Entity<Resume>(entity =>
        {
            entity.HasKey(e => e.resumeid).HasName("resume_pkey");
            
            entity.ToTable("resumes");

            entity.Property(e => e.UserId).HasColumnName("userid");
            entity.Property(e => e.FirstName).HasColumnName("firstname");
            entity.Property(e => e.MiddleName).HasColumnName("middlename");
            entity.Property(e => e.LastName).HasColumnName("lastname");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.EmailId).HasColumnName("emailid");
            entity.Property(e => e.isactive).HasColumnName("isactive");
            entity.Property(e => e.MobileNo).HasColumnName("mobileno");
            entity.Property(e => e.FileName).HasColumnName("filename");
            entity.Property(e => e.UploadedDate).HasColumnName("uploadeddate");
            entity.Property(e => e.FileContent).HasColumnName("filecontent");

        });
        OnModelCreatingPartial(modelBuilder);

        modelBuilder.Entity<GalleryItem>(entity =>
        {
            entity.HasKey(e => e.Item_Id).HasName("Item_Id");

            entity.ToTable("gallery");

            entity.Property(e => e.UserId).HasColumnName("userid");
            entity.Property(e => e.FileName).HasColumnName("filename");
            entity.Property(e => e.FileType).HasColumnName("filetype");
            entity.Property(e => e.FileContent).HasColumnName("filecontent");
            entity.Property(e => e.UploadedDate).HasColumnName("uploadeddate");
            entity.Property(e => e.ModifiedTime).HasColumnName("modifiedtime");
            entity.Property(e => e.IsActive).HasColumnName("isactive");
        });

        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasKey(e => e.itemId).HasName("itemid_pkey");

            entity.ToTable("images");

            entity.Property(e => e.UserId).HasColumnName("userid");
            entity.Property(e => e.FileName).HasColumnName("filename");
            entity.Property(e => e.Pagename).HasColumnName("pagename");
            entity.Property(e => e.FileType).HasColumnName("filetype");
            entity.Property(e => e.FileContent).HasColumnName("filecontent");
            entity.Property(e => e.UploadedDate).HasColumnName("uploadeddate");
            entity.Property(e => e.ModifiedTime).HasColumnName("modifiedtime");
            entity.Property(e => e.itemId).HasColumnName("itemid");
        });
        
        modelBuilder.Entity<HomeBanner>(entity =>
        {
            entity.HasKey(e => e.Item_id).HasName("Item_id");

            entity.ToTable("homebanner");

            entity.Property(e => e.UserId).HasColumnName("userid");
            entity.Property(e => e.FileName).HasColumnName("filename");
            entity.Property(e => e.FileType).HasColumnName("filetype");
            entity.Property(e => e.FileContent).HasColumnName("filecontent");
            entity.Property(e => e.UploadedDate).HasColumnName("uploadeddate");
            entity.Property(e => e.textContent).HasColumnName("TextContent");
            
        });

        modelBuilder.Entity<About>(entity =>
        {
            entity.HasKey(e => e.aboutid).HasName("aboutid");

            entity.ToTable("aboutus");

            entity.Property(e => e.UserId).HasColumnName("userid");
            entity.Property(e => e.TextContent).HasColumnName("textcontent");
            entity.Property(e => e.Heading).HasColumnName("heading");
            entity.Property(e => e.ModifiedTime).HasColumnName("modifiedtime");
            entity.Property(e => e.UploadedDate).HasColumnName("uploadeddate");
        });


        modelBuilder.Entity<Register>(entity =>
        {
            entity.HasKey(e => e.User_Id).HasName("register_pkey");

            entity.ToTable("register");

            entity.HasIndex(e => e.Mobilenumber, "register_mobilenumber_key").IsUnique();

            entity.HasIndex(e => e.Password, "register_password_key").IsUnique();

            entity.HasIndex(e => e.Username, "register_username_key").IsUnique();

            entity.Property(e => e.User_Id).HasColumnName("user_id");
            entity.Property(e => e.Firstname)
                .HasMaxLength(100)
                .HasColumnName("firstname");
            entity.Property(e => e.Lastname)
                .HasMaxLength(100)
                .HasColumnName("lastname");
            entity.Property(e => e.Middlename)
                .HasMaxLength(100)
                .HasColumnName("middlename");
            entity.Property(e => e.Mobilenumber).HasColumnName("mobilenumber");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.Username)
                .HasMaxLength(100)
                .HasColumnName("username");

            entity.Property(e => e.isactive)
            .HasColumnName("isactive")
            .HasDefaultValue("true"); 
            entity.Property(e => e.Role)
          .HasColumnName("role")
          .HasDefaultValue("user");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

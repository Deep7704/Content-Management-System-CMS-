using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Dapper;
using System.Data;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.ComponentModel.DataAnnotations;
namespace CMS.Models
{
        public class Footer
        {
            [Key]
            public int Id { get; set; }
            public string WebsiteTitle { get; set; }
            public string Email { get; set; }
            public string CopyrightText { get; set; }

            // Store JSON as string and deserialize manually
            public string? SocialLinks { get; set; }
            public string? FooterLinks { get; set; }
        }

    public class FooterUpdateRequest
    {
        [Key]
        public int Id { get; set; }

        public string WebsiteTitle { get; set; }
        public string Email { get; set; }
        public string CopyrightText { get; set; }
        public SocialLinks SocialLinks { get; set; }
        public FooterLinks FooterLinks { get; set; }
    }



    // Define fixed properties inside SocialLinks
    public class SocialLinks
    {
        [Key]
        public int Id { get; set; }
        public string Twitter { get; set; } = "";
        public string Facebook { get; set; } = "";
        public string Instagram { get; set; } = "";
        public string Linkedin { get; set; } = "";
    }

    // Define fixed properties inside FooterLinks
    public class FooterLinks
    {
        [Key]
        public int Id { get; set; }
        public Link Legal { get; set; } = new Link();
        public Link Privacy { get; set; } = new Link();
        public Link Terms { get; set; } = new Link();
    }

    public class Link
    {
        [Key]
        public int Id { get; set; }
        public string Url { get; set; } = "";
        public string Text { get; set; } = "";
    }
}
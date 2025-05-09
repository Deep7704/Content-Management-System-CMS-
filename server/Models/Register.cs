using Microsoft.OpenApi.Any;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.RegularExpressions;

namespace CMS.Models
{
    public partial class Register
    {
        [Key]
        public int User_Id { get;internal set; }
        public required string Firstname { get; set; }
        public required string Middlename { get; set; }
        public required string Lastname { get; set; }
        [Required]
        [StringLength(10, MinimumLength = 10)]
        [RegularExpression(@"[1-9][0-9]{9}$", ErrorMessage = "Mobile number must be 10 digits, and cannot be composed of repeated digits. It can optionally start with a + sign.")]
        public required string Mobilenumber { get; set; } = null!;
        public required string Username { get; set; }
        public required string Password { get; set; }
        //[Required(ErrorMessage = "Email is required.")]
        //[EmailAddress(ErrorMessage = "Invalid email address.")]
        public required string email_id { get; set; }

        [Column("isactive")] // ✅ Changed to lowercase
        public bool isactive { get; internal set; } = true;
        public string Role { get; internal set; } = "user";
        public bool ValidateEmail()
        {
            if (string.IsNullOrEmpty(email_id)) // ✅ Skip validation if email is null or empty
            {
                return true;
            }

            if (!IsValidEmail(email_id))
            {
                throw new ArgumentException("Invalid email address.");
            }

            return true;
        }

        private bool IsValidEmail(string email)
        {
            if (email != email.ToLower())
            {
                return false;
            }
            return Regex.IsMatch(email, @"^[a-z0-9._%+-]+@[a-z]+\.[a-z]{2,}$") &&
                   !email.Contains("..") &&
                   email.Contains('.');
        }
        public static string EncryptPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return null;
            }

            // Convert the password to a byte array
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

            // Encrypt the byte array
            return Convert.ToBase64String(passwordBytes);
        }

        public bool ValidatePassword()
        {
            if (string.IsNullOrEmpty(this.Password)) // ✅ Skip validation if password is null or empty
            {
                return true;
            }

            if (!IsValidPassword(this.Password))
            {
                throw new ArgumentException("Invalid Password. Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.");
            }

            return true;
        }


        private bool IsValidPassword(string password)
        {
            // Regex to enforce the password criteria
            return Regex.IsMatch((password), @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;<>?,.]).{8,}$");
        }
    }

}
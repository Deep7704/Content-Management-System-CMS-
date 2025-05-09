using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Models
{
    public class LoginModel
    {

        public required int User_Id { get; set; }
        public required string Password { get; set; }

    }
}


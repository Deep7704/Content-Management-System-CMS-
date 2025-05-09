using CMS.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using System;

namespace CMS.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly CmsContext context;
        private readonly IConfiguration _configuration;

        public LoginController(CmsContext context, IConfiguration configuration)
        {
            this.context = context;
            _configuration = configuration;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)
        {
            try
            {
                var user = await context.Register
                    .FromSqlRaw(@"
        SELECT r.*, decrypt_password(r.password) as decryptedpassword
        FROM register r 
        WHERE r.user_id = @user_id 
        AND r.""isactive"" = true 
        AND decrypt_password(r.password) = @password",
                        new NpgsqlParameter("@user_id", login.User_Id),
                        new NpgsqlParameter("@password", login.Password))
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return BadRequest(new { message = "Incorrect username/password. Or Please register..." });
                }

                // *** Generate JWT ***
                var token = GenerateJwtToken(user);

                // *** Return JWT with decoded password ***
                return Ok(new
                {
                    Token = token,
                    Message = "Login successful!",
                    User_Id = user.User_Id,
                    Email = user.email_id,
                    Mobilenumber = user.Mobilenumber,
                    Lastname = user.Lastname,
                    Middlename = user.Middlename,
                    Username = user.Username,
                    Role = user.Role, // Assuming your Register model has a 'Role' property
                    Firstname = user.Firstname, // Assuming your Register model has a 'Firstname' property
                    Password = user.Password
                });
            }
            catch (Exception ex)
            {
                var errorDetails = new
                {
                    message = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerMessage = ex.InnerException?.Message
                };
                return BadRequest(errorDetails);
            }
        }


        private string GenerateJwtToken(Register user)
        {
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);

            // *** Debugging: Inspect the values ***
            Console.WriteLine($"User_Id: {user.User_Id}, Email: {user.email_id}, Role: {user.Role}");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.NameIdentifier, Convert.ToString(user.User_Id)),// Use User_Id, handle nulls
            new Claim(ClaimTypes.Email, user.email_id ?? string.Empty), //  Handle nulls
            new Claim(ClaimTypes.Role, user.Role ?? string.Empty) // Handle nulls
        }),
                Expires = DateTime.UtcNow.AddMinutes(30),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            return jwtToken;
        }
    }
}
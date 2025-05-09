using CMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Npgsql;
using System.Data;
using System.Text;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

namespace CMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        public static string EncryptPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return null;
                    }
            else
            {
                byte[] storepassword = ASCIIEncoding.ASCII.GetBytes(password);
                string encryptedpassword = Convert.ToBase64String(storepassword);           
                return encryptedpassword;
            }
        }   

        private readonly IConfiguration _configuration; 
        private readonly CmsContext context;
        //public readonly CmsContext _context;
        private readonly PasswordHasher<Register> passwordHasher;

        public RegisterController(IConfiguration configuration, CmsContext context)
        {
            _configuration = configuration;
            this.context = context;
            passwordHasher = new PasswordHasher<Register>(); // Initialize the configuration
        }

        [HttpGet("getusers")]
        public async Task<IActionResult> GetAllUsers()
        {
            if (context?.Register == null)
            {
                return StatusCode(500, "Database table not found or not initialized.");
            }

            var users = await context.Register
                .Where(u => u.isactive == true) // Ensure isActive is properly set
                .Select(u => new
                {
                    u.User_Id,
                    u.Username,
                    u.Firstname,
                    u.Middlename,
                    u.Lastname,
                    u.email_id,
                    u.Mobilenumber,
                    u.Password,
                    u.Role,
                    Action = "Change Role" // Action column
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("getuser/{userId}")]
        public async Task<IActionResult> GetUsers(int userId)
        { 
            if (context?.Register == null)
            {
                return StatusCode(500, "Database table not found or not initialized.");
            }

            var users = await context.Register
                .Where(u => u.isactive == true && u.User_Id == userId) // Ensure isActive is properly set
                .Select(u => new
                {
                    u.User_Id,
                    u.Username,
                    u.Firstname,
                    u.Middlename,
                    u.Lastname,
                    u.email_id,
                    u.Mobilenumber,
                    u.Password,
                    u.Role,
                   Action = "Change Role" // Action column
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePerson(Register details)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            details.ValidateEmail();
            details.ValidatePassword();

            var connectionString = _configuration.GetConnectionString("dbsc");

            try
            {
                using (var connection = new NpgsqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // **Check for duplicate email or mobile number before inserting**
                    using (var checkCommand = new NpgsqlCommand("SELECT COUNT(*) FROM register WHERE email_id = @email_id OR mobilenumber = @mobilenumber", connection))
                    {
                        checkCommand.Parameters.AddWithValue("email_id", details.email_id);
                        checkCommand.Parameters.AddWithValue("mobilenumber", details.Mobilenumber);

                        var existingCount = (long)await checkCommand.ExecuteScalarAsync();
                        if (existingCount > 0)
                        {
                            return Conflict(new { message = "Email ID or Mobile Number already exists. Please try another." });
                        }
                    }

                    // **Encrypt the password before saving**
                    var encryptedPassword = EncryptPassword(details.Password);
                    int? newUserId = null;

                    // **PostgreSQL function call**
                    using (var command = new NpgsqlCommand("SELECT fn_CreateUser(@firstname, @middlename, @lastname, @mobilenumber, @username, @password, @email_id, @isactive, @role)", connection))
                    {
                        command.Parameters.AddWithValue("firstname", details.Firstname);
                        command.Parameters.AddWithValue("middlename", details.Middlename);
                        command.Parameters.AddWithValue("lastname", details.Lastname);
                        command.Parameters.AddWithValue("mobilenumber", details.Mobilenumber);
                        command.Parameters.AddWithValue("username", details.Username);
                        command.Parameters.AddWithValue("password", encryptedPassword);
                        command.Parameters.AddWithValue("email_id", details.email_id);
                        command.Parameters.AddWithValue("isactive", true); // ✅ Changed to lowercase
                        command.Parameters.AddWithValue("role", "user");

                        var result = await command.ExecuteScalarAsync();
                        newUserId = result == DBNull.Value ? null : (int?)result;
                    }
;
                    if (newUserId == null)
                    {
                        return StatusCode(500, "Error creating the user.");
                    }

                    // **Return success**
                    details.User_Id = newUserId.Value;
                    return CreatedAtAction(nameof(GetUsers), new { userId = details.User_Id }, details);

                }
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return Conflict(new { message = "Duplicate entry detected. Email or Mobile Number already exists." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        public class UpdateRoleDto
        {
            public string Role { get; set; }
        }

        [HttpPut("UpdateUserRole")]
        public async Task<IActionResult> UpdateUserRole(int userid, string username, UpdateRoleDto roleUpdate)
        {
            if (roleUpdate == null || string.IsNullOrEmpty(roleUpdate.Role))
            {
                return BadRequest("Invalid request. Role is required.");
            }

            try
            {
                var user = await context.Register.FirstOrDefaultAsync(u => u.User_Id == userid && u.Username == username);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // Update only the role field
                user.Role = roleUpdate.Role;

                context.Update(user);
                await context.SaveChangesAsync();

                return Ok(new { role = user.Role });
            }
            catch (Exception ex)
            {    
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }
        [HttpPatch("UpdateUser")]
        public async Task<IActionResult> UpdateUser(int userid, [FromBody] Register updatedUser)
        {
            if (updatedUser == null) return BadRequest("Invalid input: missing user details.");

            var existingUser = await context.Register.FirstOrDefaultAsync(u => u.User_Id == userid);
            if (existingUser == null) return NotFound("User not found.");

            // Custom email validation
            if (!string.IsNullOrEmpty(updatedUser.email_id) &&
                (updatedUser.email_id != updatedUser.email_id.ToLower() ||
                 updatedUser.email_id.Contains("..") ||
                 !Regex.IsMatch(updatedUser.email_id, @"^[a-z0-9._%+-]+@[a-z]+\.[a-z]{2,}$")))
            {
                ModelState.AddModelError("email_id", "Invalid email format.");
            }

            // Check for duplicate username/email
            if ((updatedUser.Username != null || updatedUser.email_id != null) &&
                await context.Register.AnyAsync(u => u.User_Id != userid && (u.Username == updatedUser.Username || u.email_id == updatedUser.email_id)))
            {
                ModelState.AddModelError("Username", "Username or Email already exists or re-try with other username.");
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Update fields
            existingUser.Firstname = updatedUser.Firstname ?? existingUser.Firstname;
            existingUser.Middlename = updatedUser.Middlename ?? existingUser.Middlename;
            existingUser.Lastname = updatedUser.Lastname ?? existingUser.Lastname;
            existingUser.Username = updatedUser.Username ?? existingUser.Username;
            existingUser.Mobilenumber = updatedUser.Mobilenumber ?? existingUser.Mobilenumber;
            existingUser.email_id = updatedUser.email_id ?? existingUser.email_id;

            // Handle password update securely
            if (!string.IsNullOrWhiteSpace(updatedUser.Password) && updatedUser.Password != "********")
            {
                existingUser.Password = EncryptPassword(updatedUser.Password);
            }

            try
            {
                await context.SaveChangesAsync();
                return Ok(new { message = "User updated successfully.", user = existingUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult<Register>> DeletePerson(int id)
        {
            var std = await context.Register.FindAsync(id);
            if (std == null)
            {
                return NotFound();
            }

            // Mark the record as inactive instead of deleting

            std.isactive = false;
            await context.SaveChangesAsync();

            return Ok(std);
        }

        [HttpGet("total-users")]
        public async Task<IActionResult> GetTotalUsers()
        {
            if (context.Register == null)
            {
                return BadRequest("Register table is null or not initialized.");
            }

            var totalUsers = context.Register.Count();
            var activeUsers = context.Register.Count(u => u.isactive == true);

            return Ok(new { totalUsers = totalUsers, activeUsers = activeUsers });
        }

    }
}
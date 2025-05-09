using CMS.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System;
using Dapper; 
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Npgsql;
using Microsoft.Extensions.Configuration;
using System.ComponentModel.DataAnnotations;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using static CMS.Controllers.ContentMasterController;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.EntityFrameworkCore.Infrastructure;
using NpgsqlTypes;
using System.Data;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentMasterController : ControllerBase
    {

        private readonly IConfiguration _configuration;
        private readonly CmsContext _context;

        public ContentMasterController(CmsContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        private bool IsAdmin(int userId)
        {
            // Admin userId is assumed to be 1 for now (change logic as needed)
            return userId == 4;
        }
        [HttpGet("getimages")]
        public async Task<IActionResult> GetImages()
        {
            var galleryItems = await _context.Getimages
                .Select(i => new
                {
                    i.itemId,
                    i.UserId,
                    i.FileName,
                    i.FileType,
                    i.Pagename,
                    ImageUrl = $"{Request.Scheme}://{Request.Host}/api/ContentMaster/images/download/{i.itemId}?userid={i.UserId}&pagename={i.Pagename}"
                })
                .ToListAsync();

            return Ok(galleryItems);
        }


        [HttpGet("images/download/{itemId}")]
        public async Task<IActionResult> DownloadImage(int itemId, int userid, string pagename)
        {
            var image = await _context.Getimages
                .Where(g => g.itemId == itemId && g.UserId == userid && g.Pagename == pagename)
                .Select(g => new { g.FileContent, g.FileName })
                .FirstOrDefaultAsync();

            if (image == null || image.FileContent == null)
            {
                return NotFound(new { message = "Image not found." });
            }
            var ext = Path.GetExtension(image.FileName).ToLower();

            var mime = ext switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".svg" => "image/svg+xml",
                ".webp" => "image/webp",
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                ".ogg" => "video/ogg",
                _ => "application/octet-stream"
            };

            return File(image.FileContent, mime, image.FileName);

        }


        [HttpPut("updateimage/{itemId}")]
        public async Task<IActionResult> uploadImage(int itemId, int userid, string pagename, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }
            try
            {
                // Validate file type (image/video)
                string extension = Path.GetExtension(file.FileName).ToLower();
                string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
                string[] validVideoExtensions = { ".mp4", ".webm", ".ogg" };

                if (!validImageExtensions.Contains(extension) && !validVideoExtensions.Contains(extension))
                {
                    return BadRequest("Invalid file type. Only images and videos are allowed.");
                }

                // Read the file content into memory
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                byte[] fileContent = memoryStream.ToArray();
                string filename = file.FileName;

                // Determine MIME type for the file
                string mimeType = extension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".mp4" => "video/mp4",
                    ".webm" => "video/webm",
                    ".ogg" => "video/ogg",
                    _ => "application/octet-stream"
                };



                using var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc"));
                await connection.OpenAsync();

                string query = @"UPDATE IMAGES 
                SET FileName = @FileName, FileContent = @FileContent, ModifiedTime = CURRENT_TIMESTAMP
                WHERE itemId = @ItemId AND UserId = @UserId AND PageName = @PageName;";

                using var command = new NpgsqlCommand(query, connection);
                command.Parameters.AddWithValue("@FileName", filename);
                command.Parameters.AddWithValue("@FileContent", fileContent);
                command.Parameters.AddWithValue("@FileType", mimeType);
                command.Parameters.AddWithValue("@ItemId", itemId);
                command.Parameters.AddWithValue("@UserId", userid);
                command.Parameters.AddWithValue("@PageName", pagename);

                int affectedrow = await command.ExecuteNonQueryAsync();
                if (affectedrow > 0)
                {
                    return Ok(new { message = "Image updated successfully" });
                }
                else
                {
                    return NotFound("No matching record found.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error :{ex.Message}");
            }
        }

        public class ResumeUploadDto
        {
            public string FirstName { get; set; }
            public string? MiddleName { get; set; }
            public string LastName { get; set; }
            public string MobileNo { get; set; }
            public string EmailId { get; set; }
            public string Location { get; set; }
        }

        [HttpPost("resume")]
        public async Task<IActionResult> UploadResume(int userId, [FromForm] ResumeUploadDto resumeDto, IFormFile file)
        {
            //if (resumeDto.File == null || resumeDto.File.Length == 0)
            //{
            //    return BadRequest("Please upload a valid file.");
            //}

            if (string.IsNullOrEmpty(resumeDto.FirstName) || string.IsNullOrEmpty(resumeDto.LastName) ||
                string.IsNullOrEmpty(resumeDto.MobileNo) || string.IsNullOrEmpty(resumeDto.EmailId))
            {
                return BadRequest("All fields are required.");
            }
            if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ||
                file.ContentType != "application/pdf")
            {
                return BadRequest("Only PDF files are allowed.");
            }

            string fileName = Path.GetFileNameWithoutExtension(file.FileName);

            byte[] fileBytes;
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            var connectionString = _configuration.GetConnectionString("dbsc");

            try
            {
                using (var connection = new NpgsqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (var command = new NpgsqlCommand(
                        "SELECT fn_InsertResume(@userId, @firstName, @middleName, @lastName, @mobileNo, @emailId, @location, @fileContent, @fileName)",
                        connection))
                    {
                        command.Parameters.AddWithValue("@userId", userId);
                        command.Parameters.AddWithValue("@firstName", resumeDto.FirstName);
                        command.Parameters.AddWithValue("@middleName", string.IsNullOrEmpty(resumeDto.MiddleName) ? (object)DBNull.Value : resumeDto.MiddleName);
                        command.Parameters.AddWithValue("@lastName", resumeDto.LastName);
                        command.Parameters.AddWithValue("@mobileNo", resumeDto.MobileNo);
                        command.Parameters.AddWithValue("@emailId", resumeDto.EmailId);
                        command.Parameters.AddWithValue("@location", resumeDto.Location);
                        command.Parameters.AddWithValue("@fileContent", fileBytes);
                        command.Parameters.AddWithValue("@fileName", fileName);
                        //command.Parameters.AddWithValue("@fileName",resumeDto.FileName);

                        var result = await command.ExecuteScalarAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }

            return Ok("Resume uploaded successfully!");
        }

        [HttpGet("resumes")]
        public async Task<IActionResult> GetAllResumes()
        {
            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    await connection.OpenAsync();
                    var command = new NpgsqlCommand("SELECT ResumeId, UserId, FirstName, MiddleName, LastName, MobileNo, EmailId, Location, FileName FROM Resumes WHERE isactive = true", connection);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var resumes = new List<object>();

                        while (await reader.ReadAsync())
                        {
                            resumes.Add(new
                            {
                                ResumeId = reader["ResumeId"],
                                UserId = reader["UserId"],
                                FirstName = reader["FirstName"],
                                MiddleName = reader["MiddleName"],
                                LastName = reader["LastName"],
                                MobileNo = reader["MobileNo"],
                                EmailId = reader["EmailId"],
                                Location = reader["Location"],
                                FileName = reader["FileName"],
                                DownloadUrl = $"/api/resumes/download/{reader["ResumeId"]}" // Generate download link
                            });
                        }

                        if (resumes.Count == 0)
                            return NotFound(new { message = "No resumes found." });

                        return Ok(resumes);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("getresume")]
        public async Task<IActionResult> Downloadresume(int ResumeId)
        {
            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    await connection.OpenAsync();
                    var command = new NpgsqlCommand("SELECT FileName, FileContent From resumes Where ResumeId = @ResumeId", connection);
                    command.Parameters.AddWithValue("@ResumeId", ResumeId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var fileName = reader["FileName"].ToString();
                            var fileContent = reader["FileContent"] as byte[];

                            if (fileContent == null)
                                return NotFound(new { message = "Resume file not found." });
                            return File(fileContent, "application/pdf", fileName);// return a attchment with correct banner(name)
                        }
                        else
                        {
                            return NotFound(new { message = "Resume not found." });
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("resumes/{resumeid}")]
        public async Task<ActionResult> SoftdeleteResume(int resumeid)
        {
            var resumes = await _context.Resumes.FirstOrDefaultAsync(r => r.resumeid == resumeid);

            if (resumes == null)
            {
                return NotFound("Resume not found");
            }

            resumes.isactive = false; // Set it to true for soft delete
            await _context.SaveChangesAsync();
            return Ok("Resume soft deleted successfully");
        }


        [HttpPost("about/{userid}")]
        public async Task<IActionResult> UploadContent(int userid, [FromBody] AboutUsDTO aboutUsDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    await connection.OpenAsync();
                    string query = @"
                        INSERT INTO aboutus (UserId, Heading, TextContent, UploadedDate, ModifiedTime) 
                        VALUES (@UserId, @Heading, @TextContent, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING AboutID;";

                    using (var command = new NpgsqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", aboutUsDTO.UserId);
                        command.Parameters.AddWithValue("@Heading", aboutUsDTO.Heading);
                        command.Parameters.AddWithValue("@TextContent", aboutUsDTO.textContent);

                        int newId = (int)await command.ExecuteScalarAsync();
                        return CreatedAtAction(nameof(UploadContent), new { AboutID = newId }, new { AboutID = newId, aboutUsDTO.UserId, aboutUsDTO.Heading, aboutUsDTO.textContent });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpGet("about/{aboutid}")]
        public async Task<IActionResult> GetAboutUs(int aboutid)
        {
            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    await connection.OpenAsync();

                    // Fetch record where aboutid matches
                    string query = @"SELECT heading, textcontent, userid, aboutid 
                             FROM aboutus 
                             WHERE aboutid = @aboutid";

                    using (var command = new NpgsqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@aboutid", aboutid);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync()) // Check if any record is found
                            {
                                var aboutUs = new
                                {
                                    heading = reader["heading"].ToString(),
                                    textcontent = reader["textcontent"].ToString(),
                                    userid = reader["userid"],
                                    aboutid = reader["aboutid"]
                                };

                                return Ok(aboutUs);
                            }
                            else
                            {
                                return NotFound($"No AboutUs content found for aboutid {aboutid}.");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }


        [HttpPut("editabouttext/{aboutid}")]
        public async Task<IActionResult> EditAboutText([FromRoute] int aboutid, [FromQuery] int userid, [FromBody] aboutus about)
        {
            if (about == null || string.IsNullOrWhiteSpace(about.Heading) || string.IsNullOrWhiteSpace(about.TextContent))
            {
                return BadRequest("Invalid request. Heading and TextContent are required.");
            }

            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    await connection.OpenAsync();

                    // Update query with RETURNING clause
                    string updateQuery = @"
                WITH updated AS (
                    UPDATE aboutus 
                    SET heading = @heading, textcontent = @textcontent, modifiedtime = NOW()
                    WHERE userid = @userid AND aboutid = @aboutid
                    RETURNING aboutid, userid, heading, textcontent)
                SELECT * FROM updated";

                    using (var command = new NpgsqlCommand(updateQuery, connection))
                    {
                        command.Parameters.AddWithValue("@heading", about.Heading);
                        command.Parameters.AddWithValue("@textcontent", about.TextContent);
                        command.Parameters.AddWithValue("@userid", userid);
                        command.Parameters.AddWithValue("@aboutid", aboutid);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                var result = new
                                {
                                    aboutid = reader["aboutid"],
                                    userid = reader["userid"],
                                    heading = reader["heading"],
                                    textcontent = reader["textcontent"]
                                };
                                return Ok(result); // Return updated record
                            }
                            else
                            {
                                return NotFound("No matching record found for the given userid and aboutid.");
                            }
                        }
                    }
                }
            }
            catch (PostgresException pgEx)
            {
                return StatusCode(500, $"Database error: {pgEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }


        //Gallery section----->
        private static readonly string GalleryFilePath = "gallery.json";
        //private static List<Models.GalleryItem> galleryItems = LoadGalleryItems();

        public int userId { get; private set; }

        // Get all gallery items
        [HttpGet("gallery")]
        public async Task<IActionResult> GetGallery()
        {
            var galleryItems = await _context.GalleryItems
                  .Where(g => g.IsActive)
                .Select(g => new
                {
                    g.Item_Id,
                    g.UserId,
                    g.FileName,
                    g.FileType,
                    g.UploadedDate,

                    ImageUrl = Url.Action("DownloadGalleryImage", new { itemId = g.Item_Id })// Generate API URL for image
                })
                .ToListAsync();

            return Ok(galleryItems);
        }



        [HttpPost("gallery/upload/{userId}")]
        public async Task<IActionResult> UploadGalleryImage(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Invalid file type. Only images are allowed." });

            try
            {
                // Verify if user exists
                var userExists = await _context.Register.AnyAsync(u => u.User_Id == userId);
                if (!userExists)
                    return BadRequest(new { message = "User not found." });

                // Convert file to byte array
                byte[] fileBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }

                // Save image details to Gallery table
                var galleryItem = new GalleryItem
                {
                    UserId = userId,
                    FileName = file.FileName,
                    FileType = "image",
                    FileContent = fileBytes,
                    UploadedDate = DateTime.UtcNow
                };

                _context.GalleryItems.Add(galleryItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Image uploaded successfully.", itemId = galleryItem.Item_Id });
            }
            catch (DbUpdateException dbEx)
            {
                return StatusCode(500, new
                {
                    message = "Error uploading image.",
                    error = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Unexpected error uploading image.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("gallery/download/{itemId}")]
        public async Task<IActionResult> DownloadGalleryImage(int itemId)
        {
            var image = await _context.GalleryItems
                .Where(g => g.Item_Id == itemId)
                .Select(g => new { g.FileContent, g.FileName })
                .FirstOrDefaultAsync();

            if (image == null || image.FileContent == null)
                return NotFound(new { message = "Image not found." });

            return File(image.FileContent, "image/jpeg", image.FileName);
        }


        // Both Admin & Editor can edit content
        [HttpPut("galleryUpdate/{itemId}")]
        public async Task<IActionResult> UpdateGalleryImage(int itemId, int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }
            var allowedExtension = new List<string> { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".svg", ".avif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtension.Contains(fileExtension))
            {
                return BadRequest(new { message = "Invalid File type only images are allowed" });
            }
            try
            {
                var galleryimage = await _context.GalleryItems.FirstOrDefaultAsync(g => g.Item_Id == itemId && g.UserId == userId);
                if (galleryimage == null)
                {
                    return NotFound(new { message = "Image not found or you do not have permission to edit it." });
                }
                byte[] fileBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }
                galleryimage.FileContent = fileBytes;
                galleryimage.FileName = file.FileName;
                galleryimage.FileType = fileExtension;
                galleryimage.UploadedDate = DateTime.UtcNow;

                _context.GalleryItems.Update(galleryimage);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Image updated successfully.",
                    itemId = galleryimage.Item_Id
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error updating the image.",
                    error = ex.Message
                });
            }

        }

        [HttpDelete("gallery/delete/{itemid}")]
        public async Task<IActionResult> SoftDeleteGalleryItem(int itemid)
        {
            var galleryItem = await _context.GalleryItems.FirstOrDefaultAsync(g => g.Item_Id == itemid);
            if (galleryItem == null)
            {
                return NotFound();
            }

            // Ensure timestamp is stored in local time (not UTC)
            galleryItem.IsActive = false;
            galleryItem.ModifiedTime = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

            await _context.SaveChangesAsync();
            return Ok("content deleted successfully");
        }


        [HttpGet("getinquiries")]
        public async Task<IActionResult> GetInquiry()
        {
            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    await connection.OpenAsync();
                    using (var cmd = new NpgsqlCommand("SELECT * FROM fn_getinquiry()", connection))
                    {
                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            var inquiries = new List<contact>();

                            while (await reader.ReadAsync())
                            {
                                inquiries.Add(new contact
                                {
                                    inquiry_id = reader.GetInt32(0),
                                    name = reader.GetString(1),
                                    email = reader.GetString(2),
                                    phone = reader.GetString(3),
                                    message = reader.GetString(4),
                                    IsActive = reader.GetBoolean(5)
                                });
                            }
                            return Ok(inquiries);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("SubmitInquiry")] // POST api/Contact/SubmitInquiry
        public async Task<IActionResult> SubmitInquiry([FromBody] contact contactUs)
        {
            if (contactUs == null)
            {
                return BadRequest("Contact data is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                using (var connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))

                {
                    await connection.OpenAsync();

                    // Call the function
                    using (var cmd = new NpgsqlCommand("fn_postinquiry", connection))
                    {
                        cmd.CommandText = "SELECT fn_postinquiry(@name, @email, @phone, @message)";
                        cmd.CommandType = System.Data.CommandType.Text;


                        cmd.Parameters.Add(new NpgsqlParameter("name", NpgsqlDbType.Varchar) { Value = contactUs.name });
                        cmd.Parameters.Add(new NpgsqlParameter("email", NpgsqlDbType.Varchar) { Value = contactUs.email });
                        cmd.Parameters.Add(new NpgsqlParameter("phone", NpgsqlDbType.Varchar) { Value = contactUs.phone }); // Must match VARCHAR in DB
                        cmd.Parameters.Add(new NpgsqlParameter("message", NpgsqlDbType.Varchar) { Value = contactUs.message });


                        var result = await cmd.ExecuteScalarAsync(); // ExecuteScalarAsync returns the first column of the first row in the result set. Additional columns or rows are ignored.

                        if (result != null && result != DBNull.Value)
                        {
                            int newInquiryId = Convert.ToInt32(result); // Convert the result to integer
                            return Ok(new { InquiryId = newInquiryId, Message = "Inquiry submitted successfully." });
                        }
                        else
                        {
                            return StatusCode(500, "Failed to retrieve inquiry ID.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the exception!  Important for debugging.
                Console.WriteLine(ex.ToString());  // Or use a proper logger
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("deleteinquiry/{id}")]
        public async Task<IActionResult> SoftDeleteInquiry(int id)
        {
            var inquiry = await _context.contactus.FirstOrDefaultAsync(c => c.inquiry_id == id);
            if (inquiry == null)
            {
                return NotFound();
            }

            inquiry.IsActive = false;
            //inquiry.ModifiedTime = DateTime.Now; // Ensure you have a ModifiedTime column

            await _context.SaveChangesAsync();
            return Ok("Inquiry deleted successfully");
        }

        [HttpGet("footer")]
        [Produces("application/json")]
        public async Task<ActionResult<object>> GetFooter()
        {
            try
            {
                using (IDbConnection connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    connection.Open();

                    string sql = "SELECT id, website_title AS WebsiteTitle, email, copyright_text AS CopyrightText, " +
                                 "social_links::TEXT AS SocialLinks, footer_links::TEXT AS FooterLinks " +
                                 "FROM get_footer_data(@Id)";

                    var parameters = new { Id = 1 };

                    var footerData = await connection.QueryFirstOrDefaultAsync<Footer>(sql, parameters);

                    if (footerData == null)
                    {
                        return NotFound("Footer content not found.");
                    }

                    var socialLinks = !string.IsNullOrEmpty(footerData.SocialLinks)
     ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(footerData.SocialLinks)
     : null;

                    var footerLinks = !string.IsNullOrEmpty(footerData.FooterLinks)
                        ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(footerData.FooterLinks)
                        : null;

                    // Return the modified object
                    return Ok(new
                    {
                        footerData.Id,
                        footerData.WebsiteTitle,
                        footerData.Email,
                        footerData.CopyrightText,
                        SocialLinks = socialLinks,
                        FooterLinks = footerLinks
                    });
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error retrieving footer data: {ex}");
                return StatusCode(500, new { Message = "Internal Server Error", Details = ex.Message });
            }
        }

        [HttpPut("footer/update")]
        [Produces("application/json")]
        public async Task<IActionResult> UpdateFooter([FromBody] FooterUpdateRequest request)
        {
            try
            {
                using (IDbConnection connection = new NpgsqlConnection(_configuration.GetConnectionString("dbsc")))
                {
                    connection.Open();

                    string sql = @"SELECT * FROM update_footer_data(
                                @WebsiteTitle, 
                                @Email, 
                                @CopyrightText, 
                                @SocialLinks::jsonb, 
                                @FooterLinks::jsonb
                            )";

                    var parameters = new
                    {
                        WebsiteTitle = request.WebsiteTitle,
                        Email = request.Email,
                        CopyrightText = request.CopyrightText,
                        SocialLinks = JsonConvert.SerializeObject(request.SocialLinks),  // Ensure JSON serialization
                        FooterLinks = JsonConvert.SerializeObject(request.FooterLinks)   // Ensure JSON serialization
                    };

                    var updatedFooter = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, parameters);

                    if (updatedFooter == null)
                    {
                        return NotFound("Footer update failed.");
                    }

                    // ✅ Convert dynamic object to JSON response
                    var response = new
                    {
                        Id = updatedFooter.id,
                        WebsiteTitle = updatedFooter.website_title,
                        Email = updatedFooter.email,
                        CopyrightText = updatedFooter.copyright_text,
                        SocialLinks = JsonConvert.DeserializeObject<SocialLinks>(updatedFooter.social_links.ToString()),
                        FooterLinks = JsonConvert.DeserializeObject<FooterLinks>(updatedFooter.footer_links.ToString())
                    };

                    return Ok(response); // Return correct updated values
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating footer: {ex}");
                return StatusCode(500, "Internal Server Error");
            }
        }


    }
}
using CMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;

namespace CMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeBannerController : ControllerBase  // Renamed from HomeBanner to HomeBannerController
    {
        private readonly CmsContext _context;

        public HomeBannerController(CmsContext context)  // Constructor adjusted to match new controller name
        {
            _context = context;
        }

        private static List<Models.HomeBanner> banners = new()
        {
            // Example banner data (can be moved to DB later)
        };

        [HttpGet]
        public async Task<IActionResult> GetBanner()
        {
            var homebanneritems = await _context.HomeBanners
                           .Select(h => new
                           {
                               h.Item_id,
                               h.UserId,
                               h.FileName,
                               h.FileType,
                               h.UploadedDate,
                               h.textContent,

                               ImageUrl = Url.Action("DownloadImages", "HomeBanner", new { itemId = h.Item_id }, Request.Scheme)// Generate API URL for image
                           })
                           .ToListAsync();

            return Ok(homebanneritems);
        }

        [HttpGet("download{itemid}")]
        public async Task<ActionResult> Downloadimages(int itemid)
        {
            var image = await _context.HomeBanners
                .Where(h => h.Item_id == itemid)
                .Select(h => new { h.FileContent, h.FileName })
                .FirstOrDefaultAsync();

            if (image == null || image.FileContent == null)
            {
                return NotFound(new { message = "Image not found." });
            }
            return File(image.FileContent, "image/jpeg", image.FileName);
        }



        [HttpPost("homebanner/upload/{userId}")]
        public async Task<IActionResult> UploadImages(int userId, IFormFile file, string textcontent)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            // Allowed image extensions
            var allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".svg", ".avif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Invalid file type. Only image files are allowed." });
            }

            try
            {
                // Check if the user exists
                var userExists = await _context.Register.AnyAsync(u => u.User_Id == userId);
                if (!userExists)
                    return BadRequest(new { message = "User not found." });

                byte[] fileBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }

                // Insert the image into the database
                var homebannerItem = new Models.HomeBanner
                {
                    UserId = userId,
                    FileName = file.FileName,  // Ensure the filename is set
                    FileType = fileExtension,  // Save the actual file extension
                    FileContent = fileBytes,
                    UploadedDate = DateTime.UtcNow
                };

                _context.HomeBanners.Add(homebannerItem);
                await _context.SaveChangesAsync();

                // Now, if there's a textContent, store it in the HomeBanner table
                if (!string.IsNullOrEmpty(textcontent))
                {
                    homebannerItem.textContent = textcontent;  // Store the text content directly in the HomeBanner
                    _context.HomeBanners.Update(homebannerItem);  // Update the record with text content
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Image and content uploaded successfully.", itemId = homebannerItem.Item_id });
            }
            catch (DbUpdateException dbEx)
            {
                return StatusCode(500, new
                {
                    message = "Error uploading image or content.",
                    error = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Unexpected error uploading image or content.",
                    error = ex.Message
                });
            }
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteImage(int itemid)
        {
            var homeBannerItem = await _context.HomeBanners.FirstOrDefaultAsync(h => h.Item_id == itemid);
            if (homeBannerItem == null)
            {
                return NotFound(new { message = "Item not found." });
            }

            _context.HomeBanners.Remove(homeBannerItem); // Permanently deletes the item from DB
            await _context.SaveChangesAsync(); // Saves changes to the database

            return Ok(new { message = "Content deleted successfully." });
        }

        public class EditTextRequest
        {
            public int UserId { get; set; }  // user who is attempting to edit
            public string TextContent { get; set; }  // the new text content to be updated
        }

        [HttpPut("edittext/{itemId}")]
        public async Task<IActionResult> EditText(int itemId, [FromBody] EditTextRequest request)
        {
            // Find the banner by itemId
            var banner = await _context.HomeBanners.FindAsync(itemId);
            if (banner == null)
            {
                return NotFound("Banner not found.");
            }

            // Update the text content of the banner
            banner.textContent = request.TextContent;

            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return a structured JSON response
            return Ok(new { message = "Text content updated successfully." });
        }



        [HttpPut("updateimage/{itemId}")]
        public async Task<IActionResult> UpdateImage(int itemId, int userId, string? textContent, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            var allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".svg", ".avif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Invalid file type. Only image files are allowed." });
            }

            try
            {
                var banner = await _context.HomeBanners.FirstOrDefaultAsync(b => b.Item_id == itemId && b.UserId == userId);
                if (banner == null)
                {
                    return NotFound(new { message = "Banner not found or you do not have permission to edit it." });
                }

                // Convert image file to byte array
                byte[] fileBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }

                // Update fields
                banner.FileContent = fileBytes;
                banner.FileName = file.FileName;
                banner.FileType = fileExtension;
                banner.UploadedDate = DateTime.UtcNow;

                // Update text content only if provided (allows null values)
                if (!string.IsNullOrEmpty(textContent))
                {
                    banner.textContent = textContent;
                }

                _context.HomeBanners.Update(banner);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Image and text updated successfully.",
                    itemId = banner.Item_id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error updating the image and text.",
                    error = ex.Message
                });
            }
        }
    }}
    
//        [HttpDelete("{id}")]
//        public ActionResult DeleteBanner(int id)
//        {
//            var banner = banners.FirstOrDefault(b => b.Id == id);
//            if (banner == null)
//            {
//                return NotFound(new { message = "Banner not found" });
//            }

//            banners.Remove(banner);
//            return Ok(new { message = "Banner was deleted" });
//        }
//    }
//}

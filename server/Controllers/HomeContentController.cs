using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class HomeContentController : ControllerBase
{
    private static List<HomeContent> _homeContents = new List<HomeContent>
    {
        new HomeContent(1, "This is a content example for image 1."),
        new HomeContent(2, "This is a content example for image 2."),
        new HomeContent(3, "This is a content example for image 3."),
        new HomeContent(4, "This is a content example for image 4."),
        new HomeContent(5, "This is a content example for image 5.")
    };

    [HttpGet]
    public ActionResult<IEnumerable<HomeContent>> GetAllContent()
    {
        return Ok(_homeContents);
    }
    [HttpPost]
    public IActionResult CreateContent([FromBody] HomeContent homeContent)
    {
        if (homeContent == null)
        {
            return BadRequest("Content cannot be null.");
        }

        var existingContent = _homeContents.FirstOrDefault(c => c.Id == homeContent.Id);
        if (existingContent != null)
        {
            return Conflict("A content with the same ID already exists.");
        }

        _homeContents.Add(homeContent);
        return CreatedAtAction(nameof(GetAllContent), new { id = homeContent.Id }, homeContent);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateContent(int id, [FromBody] HomeContent homeContent)
    {
        var existingContent = _homeContents.FirstOrDefault(c => c.Id == id);
        if (existingContent == null) return NotFound();

        existingContent.Content = homeContent.Content; // Updates only in memory
        return Ok(existingContent);
    }
    [HttpDelete("{id}")]
    public IActionResult DeleteContent(int id)
    {
        var content = _homeContents.FirstOrDefault(c => c.Id == id);
        if (content == null) return NotFound();

        _homeContents.Remove(content);
        return NoContent();
    }
}

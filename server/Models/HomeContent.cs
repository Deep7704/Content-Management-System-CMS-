
public class HomeContent
{
    public int Id { get; private set; }
    public string Content { get; set; } = string.Empty;

   
    public HomeContent(int id, string content)
    {
        Id = id;
        Content = content;
    }
}

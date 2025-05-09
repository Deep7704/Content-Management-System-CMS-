using CMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Server.Kestrel.Core; // <-- Add this
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// --- Configure Kestrel for larger file uploads ---
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    // Set a limit, e.g., 1 GB (adjust as needed)
    serverOptions.Limits.MaxRequestBodySize = 1024 * 1024 * 1024;
});

// --- Configure FormOptions for multipart requests ---
builder.Services.Configure<FormOptions>(options =>
{
    // Set the limit to the same value or higher if needed for multipart specifically
    options.MultipartBodyLengthLimit = 1024 * 1024 * 1024;
    options.ValueLengthLimit = int.MaxValue; // Optional: If you have large form values besides the file
    options.MemoryBufferThreshold = int.MaxValue; // Optional: Can influence how large files are handled (memory vs. disk buffering)
});
// --- End of file upload limit configuration ---


// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });


builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

// Add Entity Framework with PostgreSQL
builder.Services.AddDbContext<CmsContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("dbsc"))
);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
// Configure CORS
// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});


var app = builder.Build();
IConfiguration configuration = builder.Configuration;


// Use CORS and Swagger in Development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowAll"); // Use CORS middleware
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


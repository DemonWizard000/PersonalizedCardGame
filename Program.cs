using Elmah.Io.AspNetCore;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PersonalizedCardGame.Hubs;
using PersonalizedCardGame.Middleware;
using PersonalizedCardGame.Models;
using SignalRChat.Hubs;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// Add services to the container.
builder.Services.AddControllersWithViews().AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

builder.Services.AddDbContext<DBCardGameContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString(builder.Environment.IsDevelopment() ? "DbCoreConnectionString" : "DbCoreConnectionString_Deploy") ?? throw new InvalidOperationException("Connection string 'DbCoreConnectionString' not found.")));

builder.Services.AddIdentity<AppUser, IdentityRole>().AddEntityFrameworkStores<DBCardGameContext>().AddDefaultTokenProviders()
    .AddRoles<IdentityRole>();

services.Configure<IdentityOptions>(opt =>
{
    opt.Password.RequiredLength = 6;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequireDigit = true;
    opt.Password.RequireLowercase = true;
    opt.Password.RequireUppercase = false;
    opt.User.RequireUniqueEmail = true;
    opt.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    opt.Lockout.MaxFailedAccessAttempts = 3;
    opt.Lockout.DefaultLockoutTimeSpan = System.TimeSpan.FromMinutes(10);
});

services.AddCors(options => options.AddPolicy("CorsPolicy",
        builder =>
        {
            builder.AllowAnyHeader()
                   .AllowAnyMethod()
                   .SetIsOriginAllowed((host) => true)
                   .AllowCredentials();
        }));
services.AddDistributedMemoryCache();

services.Configure<ElmahIoOptions>(builder.Configuration.GetSection("ElmahIo"));
services.AddElmahIo();

builder.Services.AddHttpContextAccessor();
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Auth/SignIn";
});

builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseStaticFiles();
    app.MapFallbackToFile("index.html");
}

if (app.Environment.IsDevelopment())
{
    app.UseCors("CorsPolicy");
}

app.UseRouting();
app.UseAuthentication();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.UseMiddleware<JwtMiddleware>();
app.UseElmahIo();
app.MapHub<GameClass>("/GameClass"/*, 
    options.Transports = HttpTransportType.WebSockets;
}*/);
app.MapHub<MyHub>("/MyHub");

app.Run();

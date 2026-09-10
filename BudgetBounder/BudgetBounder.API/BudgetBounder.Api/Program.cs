using BudgetBounder.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BudgetBounder.Api.Authorization;
using BudgetBounder.Api.Services;

namespace BudgetBounder.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddHttpClient();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
            builder.Services.AddScoped<FinancialSummaryService>();
            builder.Services.AddScoped<AdminDashboardService>();
            builder.Services.AddHostedService<AdminBootstrapHostedService>();

            builder.Services.AddDbContext<BudgetBounderDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins(
                              // Admin web (Vite picks the first free port).
                              "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
                              // The Expo app running in a browser (react-native-web).
                              "http://localhost:8081", "http://localhost:19006")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Events = new JwtBearerEvents
                    {
                        OnTokenValidated = async validation =>
                        {
                            var id = validation.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                ?? validation.Principal?.FindFirst("sub")?.Value;
                            var db = validation.HttpContext.RequestServices.GetRequiredService<BudgetBounderDbContext>();
                            if (!int.TryParse(id, out var userId) || !await db.Users.AnyAsync(u => u.Id == userId && u.IsActive))
                                validation.Fail("Account is inactive or no longer exists.");
                        }
                    };
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                    };
                });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole(UserRoles.Admin));
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}

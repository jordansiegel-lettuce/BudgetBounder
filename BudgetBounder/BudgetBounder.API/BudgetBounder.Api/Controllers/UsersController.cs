using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BudgetBounder.Api.Authorization;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(BudgetBounderDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public ActionResult GetUsers()
        {
            return Ok(_context.Users.Select(u => new { u.Id, u.FullName, u.Email, u.Level, u.XP, u.IsActive }).ToList());
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public ActionResult Register(RegisterDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            if (_context.Users.Any(user => (user.Email ?? "").ToLower() == normalizedEmail))
                return Conflict(new { message = "An account with this email already exists." });

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRoles.User
            };
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(new { user.Id, user.FullName, user.Email, user.Level, user.XP });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public ActionResult Login(LoginDto loginDto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized();
            if (!user.IsActive)
                return Unauthorized("Account is inactive.");

            user.LastActiveAt = DateTime.UtcNow;
            _context.SaveChanges();

            var token = GenerateJwtToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Level,
                    user.XP,
                    user.Role,
                    user.CurrentStreak
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("email", user.Email!),
                new Claim("name", user.FullName!),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("level", user.Level.ToString()),
                new Claim("xp", user.XP.ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("{id}")]
        public ActionResult GetById(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound();
            var callerId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var callerUserId) ? callerUserId : 0;
            if (callerId != user.Id && !User.IsInRole(UserRoles.Admin)) return Forbid();
            return Ok(new { user.Id, user.FullName, user.Email, user.Level, user.XP, user.Role, user.IsActive, user.CurrentStreak, user.LongestStreak });
        }

        [HttpGet("me")]
        public ActionResult Me()
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound();
            return Ok(new { user.Id, user.FullName, user.Email, user.Level, user.XP, user.Role, user.CurrentStreak, user.LongestStreak });
        }
    }
}

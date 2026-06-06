using BudgetBounder.Api.Data;
using BudgetBounder.Api.Dtos;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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
        public ActionResult<List<User>> GetUsers()
        {
            return _context.Users.ToList();
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public ActionResult Register(RegisterDto dto)
        {
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
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

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("sub", user.Id.ToString()),
                new Claim("email", user.Email!),
                new Claim("name", user.FullName!),
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
            return Ok(new { user.Id, user.FullName, user.Email, user.Level, user.XP });
        }
    }
}

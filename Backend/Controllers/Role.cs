using Backend.Data;
using Backend.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Role : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public Role(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO model)
        {
            // Kiểm tra admin
            if (model.Email == "admin123@gmail.com" && model.Password == "123456thuan")
            {
                var adminToken = GenerateJwtToken("Admin", "0", "Admin");
                return Ok(new { token = adminToken, role = "Admin" });
            }

            // Kiểm tra bác sĩ
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.Email == model.Email);

            if (doctor != null && VerifyPassword(model.Password, doctor.PasswordHash))
            {
                var doctorToken = GenerateJwtToken("Doctor", doctor.Id.ToString(), doctor.Name);
                return Ok(new { token = doctorToken, role = "Doctor", doctorId = doctor.Id });
            }

            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
        }

        private string GenerateJwtToken(string role, string userId, string name, string email = "")
        {
            var claims = new List<Claim>();

            if (role == "Doctor")
            {
                claims.AddRange(new[]
                {
            new Claim(ClaimTypes.Role, role),
            new Claim("UserId", userId),
            new Claim("DoctorId", userId),  // Thêm DoctorId cho bác sĩ
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Email, email)
        });
            }
            else // Admin hoặc role khác
            {
                claims.AddRange(new[]
                {
            new Claim(ClaimTypes.Role, role),
            new Claim("UserId", userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, name)
        });
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool VerifyPassword(string password, string passwordHash)
        {
            // Implement password verification logic here
            // For example, using BCrypt or other password hashing library
            return true; // Temporary return for example
        }
    }
}


using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        public DoctorController(
            ApplicationDbContext context,
            IFileService fileService,
            IAuthService authService,
            IConfiguration configuration)
        {
            _context = context;
            _fileService = fileService;
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateDoctorDTO dto)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _context.Doctors.AnyAsync(d => d.Email == dto.Email))
            {
                return BadRequest("Email already exists");
            }

            // Kiểm tra password hợp lệ (ít nhất 6 ký tự)
            if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters");
            }

            var doctor = new Doctor
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Specialty = dto.Specialty,
                Hospital = dto.Hospital,
                Address = dto.Address,
                Experience = dto.Experience,
                ConsultationFee = dto.ConsultationFee,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.Image != null)
            {
                doctor.ImagePath = await _fileService.SaveImageAsync(dto.Image);
            }

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            // Tạo token JWT để đăng nhập luôn
            var token = GenerateJwtToken(doctor);

            return Ok(new { doctor, token });
        }
        // Thêm endpoint đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login dto)
        {
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.Email == dto.Email);

            if (doctor == null)
                return BadRequest("Invalid email or password");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, doctor.PasswordHash))
                return BadRequest("Invalid email or password");

            var token = GenerateJwtToken(doctor);

            return Ok(new { doctor, token });
        }

        private string GenerateJwtToken(Doctor doctor)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.Email, doctor.Email),
        new Claim(ClaimTypes.NameIdentifier, doctor.Id.ToString()),
        new Claim(ClaimTypes.Role, "Doctor")
    };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateDoctorDTO dto)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return NotFound();

            doctor.Name = dto.Name;
            doctor.Specialty = dto.Specialty;
            doctor.Hospital = dto.Hospital;
            doctor.Address = dto.Address;
            doctor.Experience = dto.Experience;
            doctor.ConsultationFee = dto.ConsultationFee;
            doctor.Description = dto.Description;
            doctor.UpdatedAt = DateTime.UtcNow;

            if (dto.Image != null)
            {
                _fileService.DeleteImage(doctor.ImagePath);
                doctor.ImagePath = await _fileService.SaveImageAsync(dto.Image);
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(doctor);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id))
                    return NotFound();
                throw;
            }
        }
        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.Id == id);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return NotFound();

            _fileService.DeleteImage(doctor.ImagePath);
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var doctors = await _context.Doctors.ToListAsync();
            return Ok(doctors);
        }
        [HttpGet("home")]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetHomeDoctors()
        {
            var doctors = await _context.Doctors
                .Select(d => new Doctor
                {
                    Id = d.Id,
                    Name = d.Name,
                    Specialty = d.Specialty,
                    Hospital = d.Hospital,
                    Experience = d.Experience,
                    ConsultationFee = d.ConsultationFee,
                    ImagePath = d.ImagePath,  // Map trường ảnh trực tiếp
                   
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return NotFound();
            return Ok(doctor);
        }
    }
}

using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.SecurityTokenService;
using Microsoft.IdentityModel.Tokens;
using OpenQA.Selenium;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> Register(RegisterDTO registerDto);
        Task<AuthResponse> Login(LoginDTO loginDto);

        Task<UserDto> GetUserById(int id);
        
       
    }
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly JwtService _jwtService;
        public AuthService(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment environment, JwtService jwtService)
        {
            _context = context;
            _configuration = configuration;
            _environment = environment;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse> Register(RegisterDTO registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new BadRequestException("Email đã tồn tại");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var user = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Role = "User", // Gán role User mặc định
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateJwtToken(user);

            return new AuthResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            };
        }

        public async Task<AuthResponse> Login(LoginDTO loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                throw new BadRequestException("Email hoặc mật khẩu không đúng");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                throw new BadRequestException("Email hoặc mật khẩu không đúng");
            }

            var token = _jwtService.GenerateJwtToken(user);

            return new AuthResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            };
        }
        public async Task<UserDto> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new NotFoundException("User not found");

            return MapToDto(user);
        }

        //public async Task<string> UpdateProfileImage(int id, IFormFile image)
        //{
        //    var user = await _context.Users.FindAsync(id);
        //    if (user == null)
        //        throw new NotFoundException("User not found");

        //    var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        //    if (!Directory.Exists(uploadsFolder))
        //        Directory.CreateDirectory(uploadsFolder);

        //    var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
        //    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        //    using (var fileStream = new FileStream(filePath, FileMode.Create))
        //    {
        //        await image.CopyToAsync(fileStream);
        //    }

        //    user.ProfileImage = uniqueFileName;
        //    user.UpdatedAt = DateTime.UtcNow;
        //    await _context.SaveChangesAsync();

        //    return uniqueFileName;
        //}

        //public async Task<UserDto> UpdateProfile(int id, UpdateProfileDto updateDto)
        //{
        //    var user = await _context.Users.FindAsync(id);
        //    if (user == null)
        //        throw new NotFoundException("User not found");

        //    // Cập nhật các thông tin bổ sung
        //    user.PhoneNumber = updateDto.PhoneNumber;
        //    user.Address = updateDto.Address;
        //    user.Gender = updateDto.Gender;
        //    user.BirthDate = updateDto.BirthDate;
        //    user.UpdatedAt = DateTime.UtcNow;

        //    await _context.SaveChangesAsync();

        //    return MapToDto(user);
        //}

        private UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Gender = user.Gender,
                BirthDate = user.BirthDate,
                ProfileImage = user.ProfileImage
            };
        }
    }
}
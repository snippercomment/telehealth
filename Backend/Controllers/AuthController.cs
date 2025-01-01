using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Cryptography;
using System.Security.Claims;
using Backend.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.SecurityTokenService;
using OpenQA.Selenium;
using System;






namespace Backend.Controllers

{

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ILogger<AuthController> _logger;
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _environment;
        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IPasswordHasher<User> passwordHasher,
            ILogger<AuthController> logger,
            IAuthService authService,
            IWebHostEnvironment environment
            )
        {
            _context = context;
            _configuration = configuration;

            _passwordHasher = passwordHasher;
            _logger = logger;
            _authService = authService;
            _environment = environment;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterDTO registerDto)
        {
            try
            {
                var response = await _authService.Register(registerDto);
                return Ok(response);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginDTO loginDto)
        {
            try
            {
                var response = await _authService.Login(loginDto);
                return Ok(response);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllProfiles()
        {
            var profiles = await _context.Users.ToListAsync();
            var response = new List<UserDto>();

            foreach (var profile in profiles)
            {
                string imageUrl = null;
                if (!string.IsNullOrEmpty(profile.ProfileImage))
                {
                    // Tạo URL cho ảnh
                    imageUrl = $"{Request.Scheme}://{Request.Host}/images/avatars/{profile.ProfileImage}";
                }

                response.Add(new UserDto
                {
                    Id = profile.Id,
                    FullName = profile.FullName,
                    Email = profile.Email,
                    PhoneNumber = profile.PhoneNumber,
                    Address = profile.Address,
                    Gender = profile.Gender,
                    BirthDate = profile.BirthDate,
                    ProfileImage = imageUrl // Trả về URL của ảnh thay vì Base64
                });
            }

            return response;
        }

        [HttpGet("profile/{id}")]
        public async Task<ActionResult<UserDto>> GetProfile(int id)
        {
            var profile = await _context.Users.FindAsync(id);
            if (profile == null)
            {
                return NotFound();
            }

            string imageUrl = null;
            if (!string.IsNullOrEmpty(profile.ProfileImage))
            {
                // Tạo URL cho ảnh
                imageUrl = $"{Request.Scheme}://{Request.Host}/images/avatars/{profile.ProfileImage}";
            }

            var response = new UserDto
            {
                Id = profile.Id,
                FullName = profile.FullName,
                Email = profile.Email,
                PhoneNumber = profile.PhoneNumber,
                Address = profile.Address,
                Gender = profile.Gender,
                BirthDate = profile.BirthDate,
                ProfileImage = imageUrl // Trả về URL của ảnh thay vì Base64
            };

            return response;
        }

        [HttpPut("profile/update/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromForm] ProfileUpdateRequest request)
        {
            if (id <= 0)
            {
                return BadRequest("ID không hợp lệ");
            }

            var profile = await _context.Users.FindAsync(id);
            if (profile == null)
            {
                return NotFound();
            }

            profile.FullName = request.FullName;
            profile.PhoneNumber = request.PhoneNumber;
            profile.Address = request.Address;
            profile.Gender = request.Gender;
            profile.BirthDate = request.BirthDate;

            if (request.ImageFile != null)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "avatars");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                if (!string.IsNullOrEmpty(profile.ProfileImage))
                {
                    var oldImagePath = Path.Combine(uploadsFolder, profile.ProfileImage);
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                string uniqueFileName = Guid.NewGuid().ToString() + "_" + request.ImageFile.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.ImageFile.CopyToAsync(stream);
                }

                profile.ProfileImage = uniqueFileName;
            }

            try
            {
                await _context.SaveChangesAsync();

                string imageUrl = null;
                if (!string.IsNullOrEmpty(profile.ProfileImage))
                {
                    imageUrl = $"{Request.Scheme}://{Request.Host}/images/avatars/{profile.ProfileImage}";
                }

                var response = new UserDto
                {
                    Id = profile.Id,
                    FullName = profile.FullName,
                    Email = profile.Email,
                    PhoneNumber = profile.PhoneNumber,
                    Address = profile.Address,
                    Gender = profile.Gender,
                    BirthDate = profile.BirthDate,
                    ProfileImage = imageUrl
                };

                return Ok(response);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProfileExists(id))
                {
                    return NotFound();
                }
                throw;
            }

        }

        private bool ProfileExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }






    }
        

}


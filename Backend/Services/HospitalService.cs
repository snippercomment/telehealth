using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using OpenQA.Selenium;

namespace Backend.Services
{
    public interface IHospitalService
    {
        Task<IEnumerable<Hospital>> GetAllHospitalsAsync();
        Task<Hospital> GetHospitalByIdAsync(int id);
        Task<Hospital> CreateHospitalAsync(HospitalDTO hospitalDto);
        Task<Hospital> UpdateHospitalAsync(int id, HospitalDTO hospitalDto);
        Task<bool> IsHospitalOpenAsync(int hospitalId, DateTime dateTime);
        Task<WorkingHours> GetWorkingHoursAsync(int hospitalId);
        Task DeleteHospitalAsync(int id);
    }
    public class HospitalService : IHospitalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public HospitalService(ApplicationDbContext context, IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<Hospital>> GetAllHospitalsAsync()
        {
            var hospitals = await _context.Hospitals.ToListAsync();
            var baseUrl = $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}";

            foreach (var hospital in hospitals)
            {
                if (!string.IsNullOrEmpty(hospital.ImagePath))
                {
                    hospital.ImagePath = $"{baseUrl}{hospital.ImagePath}";
                }
            }

            return hospitals;
        }
        // Sửa phương thức GetHospitalByIdAsync
        public async Task<Hospital> GetHospitalByIdAsync(int id)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital != null && !string.IsNullOrEmpty(hospital.ImagePath))
            {
                var baseUrl = $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}";
                hospital.ImagePath = $"{baseUrl}{hospital.ImagePath}";
            }
            return hospital;
        }


        public async Task<Hospital> CreateHospitalAsync(HospitalDTO hospitalDto)
        {
            var imagePath = await SaveImageAsync(hospitalDto.Image);

            var hospital = new Hospital
            {
                Name = hospitalDto.Name,
                Description = hospitalDto.Description,
                Address = hospitalDto.Address,
                PhoneNumber = hospitalDto.PhoneNumber,
                Specialties = hospitalDto.Specialties,
                ImagePath = imagePath,
                OpenTime = hospitalDto.OpenTime,
                CloseTime = hospitalDto.CloseTime,
                CreatedAt = DateTime.UtcNow
            };

            _context.Hospitals.Add(hospital);
            await _context.SaveChangesAsync();
            return hospital;
        }

        public async Task<Hospital> UpdateHospitalAsync(int id, HospitalDTO hospitalDto)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital == null) return null;

            if (hospitalDto.Image != null)
            {
                DeleteImage(hospital.ImagePath);
                hospital.ImagePath = await SaveImageAsync(hospitalDto.Image);
            }

            hospital.Name = hospitalDto.Name;
            hospital.Description = hospitalDto.Description;
            hospital.Address = hospitalDto.Address;
            hospital.PhoneNumber = hospitalDto.PhoneNumber;
            hospital.Specialties = hospitalDto.Specialties;
            hospital.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return hospital;
        }

        public async Task DeleteHospitalAsync(int id)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital != null)
            {
                DeleteImage(hospital.ImagePath);
                _context.Hospitals.Remove(hospital);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<bool> IsHospitalOpenAsync(int hospitalId, DateTime dateTime)
        {
            var hospital = await _context.Hospitals.FindAsync(hospitalId);
            if (hospital == null)
                throw new NotFoundException("Hospital not found");

            // Kiểm tra xem có phải ngày làm việc không (thứ 2 đến thứ 7)
            if (dateTime.DayOfWeek == DayOfWeek.Sunday)
                return false;

            var currentTime = dateTime.TimeOfDay;
            return currentTime >= hospital.OpenTime && currentTime <= hospital.CloseTime;
        }

        public async Task<WorkingHours> GetWorkingHoursAsync(int hospitalId)
        {
            var hospital = await _context.Hospitals.FindAsync(hospitalId);
            if (hospital == null)
                throw new NotFoundException("Hospital not found");

            return new WorkingHours
            {
                OpenTime = hospital.OpenTime,
                CloseTime = hospital.CloseTime
            };
        }

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            if (image == null) return null;

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "hospitals");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Path.GetFileNameWithoutExtension(image.FileName);
            var extension = Path.GetExtension(image.FileName);
            var uniqueFileName = $"{DateTime.Now.ToString("yyyyMMddHHmmss")}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return $"/images/hospitals/{uniqueFileName}";
        }

        private void DeleteImage(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath)) return;

            var fullPath = Path.Combine(_environment.WebRootPath, imagePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}

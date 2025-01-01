using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize] // Tùy vào yêu cầu bảo mật của bạn
    public class StatisticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatisticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                // Lấy tất cả thông tin của các bảng
                var appointments = await _context.Appointments.ToListAsync();
                var doctors = await _context.Doctors.ToListAsync();
                var hospitals = await _context.Hospitals.ToListAsync();
                var patients = await _context.Users.ToListAsync();

                // Chuẩn bị dữ liệu tổng hợp
                var statistics = new
                {
                    Appointments = new
                    {
                        Total = appointments.Count,
                        Label = "Đặt khám từ xa",
                        Data = appointments.Select(a => new { a.Id, a.UserId }).ToList()
                    },
                    Doctors = new
                    {
                        Total = doctors.Count,
                        Label = "Danh sách bác sĩ",
                        Data = doctors.Select(d => new { d.Id, d.Name }).ToList()
                    },
                    Hospitals = new
                    {
                        Total = hospitals.Count,
                        Label = "Danh sách bệnh viện",
                        Data = hospitals.Select(h => new { h.Id, h.Name }).ToList()
                    },
                    Patients = new
                    {
                        Total = patients.Count,
                        Label = "Thông tin bệnh nhân",
                        Data = patients.Select(p => new { p.Id, p.FullName }).ToList()
                    }
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê", error = ex.Message });
            }
        }

        [HttpGet("detailed")]
        public async Task<IActionResult> GetDetailedStatistics(
            [FromQuery] string period = "",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var today = DateTime.UtcNow;

                // Xác định thời gian bắt đầu và kết thúc nếu không được cung cấp
                if (!startDate.HasValue || !endDate.HasValue)
                {
                    startDate = period.ToLower() switch
                    {
                        "week" => today.AddDays(-7),
                        "month" => today.AddMonths(-1),
                        "year" => today.AddYears(-1),
                        _ => today.AddMonths(-1)
                    };

                    endDate = today;
                }

                // Đảm bảo startDate luôn nhỏ hơn hoặc bằng endDate
                if (startDate > endDate)
                {
                    return BadRequest(new { message = "Ngày bắt đầu không thể lớn hơn ngày kết thúc." });
                }

                // Lấy thống kê cho các cuộc hẹn
                var appointmentStats = await _context.Appointments
                    .Where(a => a.CreatedAt >= startDate && a.CreatedAt <= endDate)
                    .GroupBy(a => a.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("dd/MM/yyyy"),
                        Count = g.Count(),
                        Appointments = g.Select(a => new
                        {
                            a.Id,
                            a.PatientName,
                            a.Doctor,
                            CreatedAt = a.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                            a.Status
                        }).ToList()
                    })
                    .ToListAsync();

                // Lấy thống kê cho các bác sĩ
                var doctorStats = await _context.Doctors
                    .Where(d => d.CreatedAt.Date >= startDate.Value.Date && d.CreatedAt.Date <= endDate.Value.Date)
                    .GroupBy(d => d.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("dd/MM/yyyy"),
                        Count = g.Count(),
                        Doctors = g.Select(d => new
                        {
                            d.Id,
                            d.Name,
                            d.Specialty,
                            CreatedAt = d.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                        }).ToList()
                    })
                    .ToListAsync();

                // Lấy thống kê cho bệnh nhân đăng ký
                var patientStats = await _context.Users
                    .Where(p => p.CreatedAt.Date >= startDate.Value.Date && p.CreatedAt.Date <= endDate.Value.Date)
                    .GroupBy(p => p.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("dd/MM/yyyy"),
                        Count = g.Count(),
                        Patients = g.Select(p => new
                        {
                            p.Id,
                            p.FullName,
                            CreatedAt = p.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                        }).ToList()
                    })
                    .ToListAsync();

                // Lấy thống kê cho bệnh viện được thêm
                var hospitalStats = await _context.Hospitals
                    .Where(h => h.CreatedAt.Date >= startDate.Value.Date && h.CreatedAt.Date <= endDate.Value.Date)
                    .GroupBy(h => h.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("dd/MM/yyyy"),
                        Count = g.Count(),
                        Hospitals = g.Select(h => new
                        {
                            h.Id,
                            h.Name,
                            CreatedAt = h.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                        }).ToList()
                    })
                    .ToListAsync();

                // Trả về kết quả
                return Ok(new
                {
                    AppointmentStatistics = appointmentStats,
                    DoctorStatistics = doctorStats,
                    PatientStatistics = patientStats,
                    HospitalStatistics = hospitalStats,
                    Period = period,
                    StartDate = startDate.Value.ToString("yyyy-MM-dd"),
                    EndDate = endDate.Value.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê chi tiết", error = ex.Message });
            }
        }

        [HttpGet("appointments/status")]
        public async Task<IActionResult> GetAppointmentStatusStatistics()
        {
            try
            {
                var statusStats = await _context.Appointments
                    .GroupBy(a => a.Status)
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                return Ok(statusStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê trạng thái", error = ex.Message });
            }
        }
    }
}

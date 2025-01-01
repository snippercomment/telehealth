using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Doctor")]  // Chỉ cho phép người có vai trò Doctor truy cập
    public class DoctorStatisticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorStatisticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // API thống kê bác sĩ: số lượng cuộc hẹn, tư vấn, danh sách đã khám và tư vấn
        [HttpGet]
        public async Task<IActionResult> GetDoctorStatistics()
        {
            try
            {
                // Lấy doctorId từ Claims (từ token) của người dùng hiện tại
                var doctorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)); // Lấy doctorId từ token

                // Lấy bác sĩ theo ID
                var doctor = await _context.Doctors
                    .Include(d => d.Appointments)
                    .Include(d => d.Consultations)
                    .FirstOrDefaultAsync(d => d.Id == doctorId);

                if (doctor == null)
                {
                    return NotFound(new { message = "Bác sĩ không tồn tại." });
                }

                // Lấy danh sách cuộc hẹn đã khám
                var appointments = doctor.Appointments
                    .Where(a => a.Status == "Đã khám")
                    .ToList();

                // Lấy danh sách cuộc tư vấn đã hoàn thành
                var consultations = doctor.Consultations
                    .Where(c => c.Status == "Đã tư vấn")
                    .ToList();

                // Tổng số cuộc hẹn và tư vấn
                var totalAppointments = doctor.Appointments.Count;
                var totalConsultations = doctor.Consultations.Count;

                // Trả về dữ liệu tổng hợp
                return Ok(new
                {
                    DoctorName = doctor.Name,
                    TotalAppointments = totalAppointments,
                    TotalConsultations = totalConsultations,
                    CompletedAppointments = appointments.Count,
                    CompletedConsultations = consultations.Count,
                    Appointments = appointments.Select(a => new
                    {
                        a.Id,
                        PatientName = a.PatientName,
                        AppointmentDate = a.AppointmentDate.ToString("dd/MM/yyyy HH:mm"),
                        a.Status
                    }),
                    Consultations = consultations.Select(c => new
                    {
                        c.Id,
                        PatientName = c.UserName,
                        ConsultationDate = c.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                        c.Status
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin thống kê bác sĩ", error = ex.Message });
            }
        }
    }
}

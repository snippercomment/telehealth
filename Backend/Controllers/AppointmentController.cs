using Backend.Data;
using Backend.DTO;
using Backend.Hubs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<MyHub> _hubContext;


        public AppointmentController(ApplicationDbContext context, IConfiguration configuration, IHubContext<MyHub> hubContext)
        {
            _context = context;
            _configuration = configuration;
             _hubContext = hubContext;
        }


        // API đặt lịch (yêu cầu đăng nhập)
        [HttpPost("book")]
        [Authorize]
        public async Task<IActionResult> BookAppointment(AppointmentDTO dto)
        {
            // Lấy ID người dùng từ token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);  // Lấy userId từ claim

            if (userId == null)
            {
                Console.WriteLine("Token không chứa NameIdentifier");
                return Unauthorized(); // Trả về lỗi nếu không có userId
            }

            if (!int.TryParse(userId, out int parsedUserId))
            {
                Console.WriteLine($"Không thể chuyển đổi userId '{userId}' thành số nguyên");
                return Unauthorized(); // Trả về lỗi nếu không thể chuyển đổi userId thành số nguyên
            }

            // Kiểm tra bác sĩ có tồn tại không
            var doctor = await _context.Doctors.FindAsync(dto.DoctorId);
            if (doctor == null)
            {
                return BadRequest(new { message = "Bác sĩ không tồn tại" });
            }

            // Tạo thông tin cuộc hẹn
            var appointment = new Appointment
            {
                UserId = parsedUserId,
                PatientName = dto.PatientName,
                PatientPhone = dto.PatientPhone,
                Gender = dto.Gender,
                AppointmentDate = dto.AppointmentDate,
                AppointmentTime = TimeSpan.Parse(dto.AppointmentTime),
                Describe = dto.Describe,
                DoctorId = dto.DoctorId,
                Status = "Chờ xác nhận",
                CancellationReason = "",
                ExaminationStatus = "",
                PaymentStatus = "Chưa thanh toán", // Trạng thái thanh toán ban đầu
                TotalFee = doctor.ConsultationFee, // Sử dụng giá tiền của bác sĩ
                CreatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đặt lịch thành công",
                appointmentId = appointment.Id,
                totalFee = doctor.ConsultationFee
            });
        }
        [HttpPost("payment")]
        [Authorize]
        public async Task<IActionResult> MakePayment(PaymentDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                Console.WriteLine("Mã Token không chứa NameIdentifier");
                return Unauthorized();
            }

            if (!int.TryParse(userId, out int parsedUserId))
            {
                Console.WriteLine($"Không thể chuyển đổi userId '{userId}' thành số nguyên");
                return Unauthorized();
            }

            // Check if the appointment exists
            var appointment = await _context.Appointments.FindAsync(dto.AppointmentID);
            if (appointment == null)
            {
                return BadRequest(new { message = "Lịch khám không tồn tại" });
            }

            // Check if the payment already exists
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.UserID == parsedUserId && p.PaymentDetails.Any(pd => pd.AppointmentID == dto.AppointmentID));
            if (existingPayment != null)
            {
                return BadRequest(new { message = "Đã thanh toán cho lịch khám này" });
            }

            // Validate expiration date
            if (dto.ExpirationDate < DateTime.Now)
            {
                return BadRequest(new { message = "Thẻ đã hết hạn." });
            }

            // Create payment information
            var payment = new Payment
            {
                CardNumber = dto.CardNumber,
                ExpirationDate = dto.ExpirationDate, // Đã là kiểu DateTime
                PaymentStatus = "Chưa thanh toán",
                UserID = parsedUserId
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Create payment detail
            var paymentDetail = new PaymentDetail
            {
                PaymentID = payment.PaymentID,
                AppointmentID = dto.AppointmentID,
                Amount = appointment.TotalFee,
                PaymentDate = DateTime.Now,
                DetailStatus = "Đã thanh toán",
                UserID = parsedUserId
            };

            _context.PaymentDetails.Add(paymentDetail);

            // Update appointment payment status
            appointment.PaymentStatus = "Đã thanh toán";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thanh toán đã hoàn tất thành công.",
                paymentId = payment.PaymentID,
                paymentDetailId = paymentDetail.PaymentDetailID,
                appointmentId = appointment.Id,
                totalFee = appointment.TotalFee,
                sampleCards = new List<object>
        {
            new { type = "Visa", number = "4111111111111111", expirationDate = "12/12/2028" },
            new { type = "Mastercard", number = "5105105105105100", expirationDate = "12/12/2028" }
        }
            });
        }


        // API để người dùng xem lịch hẹn của mình
        [HttpGet("my-appointments")]
        [Authorize]
        public async Task<IActionResult> GetMyAppointments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(); // Trả về lỗi nếu userIdClaim không hợp lệ hoặc không thể chuyển đổi
            }

            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Where(a => a.UserId == userId) // So sánh với kiểu int
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new
                {
                    a.Id,
                    a.PatientName,
                    a.PatientPhone,
                    a.Gender,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Describe,
                    a.Status,
                    a.ExaminationStatus,
                    a.CancellationReason,
                    IsEditable = a.Status != "Approved", 
                    IsCancellable = a.Status != "Approved", 
                    Doctor = new
                    {
                        a.Doctor.Id,
                        a.Doctor.Name,
                        a.Doctor.Specialty,
                        a.Doctor.ConsultationFee
                    }
                })
                .ToListAsync();

            return Ok(appointments);
        }


        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.User)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new
                {
                    a.Id,
                    a.PatientName,
                    a.PatientPhone,
                    a.Gender,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Describe,
                    ApprovalStatus = a.Status == "Approved" ? "Đã duyệt" : "Chờ duyệt",
                    User = new
                    {
                        a.User.Id,
                        a.User.Email,
                        a.User.PhoneNumber
                    },
                    Doctor = new
                    {
                        a.Doctor.Id,
                        a.Doctor.Name,
                        a.Doctor.Specialty,
                        a.Doctor.ConsultationFee
                    },
                    IsApproved = a.Status == "Approved"
                })
                .ToListAsync();

            return Ok(appointments);
        }

        

        // API để lấy lịch hẹn theo bác sĩ
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Where(a => a.DoctorId == doctorId && a.Status == "Approved")
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new
                {
                    a.Id,
                    a.PatientName,
                    a.PatientPhone,
                    a.Gender,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Describe,
                    a.ExaminationStatus,
                    a.Status,
                    User = new
                    {
                        a.User.Id,
                        a.User.Email,
                        a.User.PhoneNumber
                    }
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // API lấy chi tiết một lịch hẹn của người dùng
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetAppointmentDetails(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Chuyển đổi userIdClaim sang kiểu int
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.User)
                .Where(a => a.Id == id)
                .FirstOrDefaultAsync();

            if (appointment == null)
            {
                return NotFound();
            }

            // Kiểm tra quyền truy cập
            if (userRole != "Admin" &&
                userRole != "Doctor" &&
                appointment.UserId != userId) 
            {
                return Forbid();
            }

            var result = new
            {
                appointment.Id,
                appointment.PatientName,
                appointment.PatientPhone,
                appointment.Gender,
                appointment.AppointmentDate,
                appointment.AppointmentTime,
                appointment.Describe,
                appointment.Status,
                
                appointment.CancellationReason,
                User = new
                {
                    appointment.User.Id,
                    appointment.User.Email,
                    appointment.User.PhoneNumber
                },
                Doctor = new
                {
                    appointment.Doctor.Id,
                    appointment.Doctor.Name,
                    appointment.Doctor.Specialty
                }
            };

            return Ok(result);

        }
        // API để phê duyệt lịch hẹn của Admin 
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAppointment(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.User)
                    .Include(a => a.Doctor)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Không tìm thấy lịch hẹn" });
                }
                if (appointment.PaymentStatus != "Đã thanh toán")
                {
                    return BadRequest(new { message = "Phải thanh toán cuộc hẹn trước khi phê duyệt" });
                }
                if (appointment.Status == "Approved")
                {
                    return BadRequest(new { message = "Lịch hẹn đã được phê duyệt trước đó" });
                }

                // Cập nhật trạng thái lịch hẹn
                appointment.Status = "Approved";
                appointment.ExaminationStatus = "Chưa khám"; 
                appointment.IsVisibleToDoctor = true;
                appointment.IsCancellable = false; 
              
                appointment.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                // Gửi thông báo qua SignalR cho bác sĩ
                if (!string.IsNullOrEmpty(appointment.Doctor?.UserId?.ToString()))
                {
                    await _hubContext.Clients.User(appointment.Doctor.UserId.ToString()).SendAsync(
                        "NewAppointment",
                        new
                        {
                            message = "Bạn có lịch hẹn mới được phê duyệt",
                            appointmentId = appointment.Id,
                            details = new
                            {
                                patientName = appointment.PatientName,
                                appointmentDate = appointment.AppointmentDate,
                                status = appointment.ExaminationStatus 
                            }
                        }
                    );
                }

                // Gửi thông báo qua SignalR cho bệnh nhân
                if (!string.IsNullOrEmpty(appointment.User?.Id.ToString()))
                {
                    await _hubContext.Clients.User(appointment.User.Id.ToString()).SendAsync(
                        "AppointmentApproved",
                        new
                        {
                            message = "Lịch hẹn của bạn đã được phê duyệt. Vui lòng thanh toán để xác nhận.",
                            appointmentId = appointment.Id,
                            details = new
                            {
                                doctorName = appointment.Doctor.Name,
                                appointmentDate = appointment.AppointmentDate,
                                paymentStatus = appointment.PaymentStatus // Trạng thái thanh toán
                            }
                        }
                    );
                }

                await transaction.CommitAsync();

                return Ok(new { message = "Lịch hẹn đã được phê duyệt thành công. Người dùng cần thanh toán để xác nhận." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi phê duyệt lịch hẹn", details = ex.Message });
            }
        }



        // API huỷ lịch hẹn
        [HttpPut("cancel-appointment/{id}")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(int id, [FromBody] CancelDTO dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Chuyển đổi userIdClaim sang kiểu int
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Kiểm tra quyền truy cập
            if (userRole != "Admin" &&
                (userRole != "Doctor" || appointment.DoctorId != userId) &&
                appointment.UserId != userId) // So sánh kiểu int
            {
                return Forbid();
            }

            // Kiểm tra trạng thái lịch hẹn
            if (appointment.Status == "Đã huỷ")
            {
                return BadRequest("Lịch hẹn đã được huỷ trước đó");
            }

            // Cập nhật trạng thái lịch hẹn
            appointment.Status = "Đã huỷ";
            appointment.CancellationReason = dto.Reason;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã huỷ lịch hẹn" });

        }

        // API cập nhật lịch hẹn (cho người dùng)
        [HttpPut("update-my-appointment/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateMyAppointment(int id, AppointmentDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Chuyển đổi userIdClaim sang kiểu int
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId); // So sánh kiểu int

            if (appointment == null)
            {
                return NotFound("Không tìm thấy lịch hẹn hoặc bạn không có quyền sửa lịch hẹn này");
            }

            if (appointment.Status != "Chờ xác nhận")
            {
                return BadRequest("Chỉ có thể sửa lịch hẹn đang chờ xác nhận");
            }

            // Cập nhật thông tin lịch hẹn
            appointment.PatientName = dto.PatientName;
            appointment.PatientPhone = dto.PatientPhone;
            appointment.Gender = dto.Gender;
            appointment.AppointmentDate = dto.AppointmentDate;
            appointment.AppointmentTime = TimeSpan.Parse(dto.AppointmentTime);
            appointment.Describe = dto.Describe;
            appointment.DoctorId = dto.DoctorId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật lịch hẹn thành công" });

        }
        
        // API cập nhật trạng thái khám của bác sĩ
        [HttpPut("update-status/{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateStatusDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Doctor)
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Không tìm thấy cuộc hẹn" });
                }

                // Kiểm tra quyền bác sĩ
                var doctorId = User.FindFirst("DoctorId")?.Value;
                if (appointment.DoctorId.ToString() != doctorId)
                {
                    return Forbid();
                }

                if (appointment.Status != "Approved")
                {
                    return BadRequest(new { message = "Chỉ có thể cập nhật trạng thái cho lịch hẹn đã được phê duyệt" });
                }

                switch (dto.Status)
                {
                    case "Đã khám":
                        appointment.ExaminationStatus = "Đã khám";
                        appointment.Status = "Đã khám";
                        appointment.IsVisibleToDoctor = false; 
                        break;

                    case "Chưa khám":
                        appointment.ExaminationStatus = "Chưa khám";
                        appointment.Status = "Chưa khám";
                        appointment.IsVisibleToDoctor = true; 
                        break;

                    default:
                        return BadRequest(new { message = "Trạng thái không hợp lệ" });
                }

                appointment.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                // Gửi thông báo qua SignalR cho Admin
                await _hubContext.Clients.Group("Admins").SendAsync(
                    "ReceiveNotification",
                    new
                    {
                        message = $"Bác sĩ {appointment.Doctor.Name} đã cập nhật trạng thái: {appointment.ExaminationStatus}",
                        appointmentId = appointment.Id,
                        details = new
                        {
                            doctorName = appointment.Doctor.Name,
                            patientName = appointment.PatientName,
                            appointmentDate = appointment.AppointmentDate,
                            status = appointment.ExaminationStatus
                        }
                    }
                );

                // Gửi thông báo qua SignalR cho bệnh nhân
                await _hubContext.Clients.User(appointment.User.Id.ToString()).SendAsync(
                    "ReceiveNotification",
                    new
                    {
                        message = dto.Status == "Đã khám"
                            ? "Đơn khám bệnh của bạn đã hoàn thành."
                            : "Trạng thái khám bệnh của bạn đã được cập nhật.",
                        appointmentId = appointment.Id,
                        details = new
                        {
                            doctorName = appointment.Doctor.Name,
                            appointmentDate = appointment.AppointmentDate,
                            status = appointment.ExaminationStatus
                        }
                    }
                );

                await transaction.CommitAsync();

                return Ok(new { message = $"Trạng thái đã được cập nhật thành công: {dto.Status}" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật trạng thái", details = ex.Message });
            }
        }



        // API lấy lịch sử khám cho người dùng
        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetUserAppointmentHistory()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var histories = await _context.AppointmentHistories
                .Include(h => h.Doctor)
                .Where(h => h.UserId.ToString() == userId)
                .OrderByDescending(h => h.ExaminationDate)
                .Select(h => new
                {
                    h.Id,
                    DoctorName = h.Doctor.Name,
                    h.ExaminationDate,
                    h.Diagnosis,
                    h.Treatment,
                    h.Prescription,
                    h.CreatedAt
                })
                .ToListAsync();

            return Ok(histories);
        }

    }
}

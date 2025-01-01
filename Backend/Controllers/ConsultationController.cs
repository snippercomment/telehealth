        using Backend.Data;
        using Backend.DTO;
        using Backend.Models;
        using Microsoft.AspNetCore.Authorization;
        using Microsoft.AspNetCore.Http;
        using Microsoft.AspNetCore.Mvc;
        using Microsoft.AspNetCore.SignalR;
        using Microsoft.EntityFrameworkCore;
        using System.Security.Claims;



        namespace Backend.Controllers
        {
            [Route("api/admin/[controller]")]
            [ApiController]
            public class ConsultationController : ControllerBase
            {
                private readonly ApplicationDbContext _context;
                private readonly IHubContext<ConsultationHub> _hubContext;

                public ConsultationController(
                    ApplicationDbContext context,
                    IHubContext<ConsultationHub> hubContext)
                {
                    _context = context;
                    _hubContext = hubContext;
                }
                public enum ConsultationStatus
                {
                    Pending,        // Chờ bác sĩ tiếp nhận
                    Active,         // Đang tư vấn
                    UserEnded,      // Người dùng kết thúc
                    DoctorEnded,    // Bác sĩ kết thúc
                    Completed       // Hoàn thành (cả 2 bên đồng ý kết thúc)
                }
                // 1. API tạo cuộc tư vấn mới
                [HttpPost("create")]
                [Authorize(Roles = "User")]
                public async Task<IActionResult> CreateConsultation(ConsultationCreateDto dto)
                {
                    // Lấy UserId từ Claims
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim == null)
                    {
                        return Unauthorized(new { success = false, message = "User is not authenticated." });
                    }

                    var userId = int.Parse(userIdClaim.Value);

                    // Kiểm tra UserId hợp lệ
                    if (!_context.Users.Any(u => u.Id == userId))
                    {
                        return BadRequest(new { success = false, message = "Invalid UserId. User does not exist." });
                    }

                    // Tạo đối tượng Consultation
                    var consultation = new Consultation
                    {
                        UserId = userId,
                        UserName = dto.UserName,
                        Email = User.FindFirst(ClaimTypes.Email)?.Value,
                        Question = dto.Question,
                        Status = ConsultationStatus.Pending.ToString(),
                        CreatedAt = DateTime.UtcNow,
                        Messages = new List<ConsultationMessage>()
                    };

                    // Tạo tin nhắn ban đầu
                    var message = new ConsultationMessage
                    {
                        Message = dto.Question,
                        SenderType = "User",
                        SenderName = dto.UserName,
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    consultation.Messages.Add(message);
                    _context.Consultations.Add(consultation);

                    // Lưu thay đổi vào DB
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (DbUpdateException ex)
                    {
                        if (ex.InnerException != null)
                        {
                            Console.WriteLine("Inner Exception: " + ex.InnerException.Message);
                        }
                        return StatusCode(500, new { success = false, message = "An error occurred while saving the consultation." });
                    }

                    // Gửi thông báo tới nhóm Doctors
                    await _hubContext.Clients.Group("Doctors").SendAsync("NewConsultation", new
                    {
                        consultationId = consultation.Id,
                        userName = dto.UserName,
                        question = dto.Question,
                        createdAt = consultation.CreatedAt
                    });

                    return Ok(new
                    {
                        success = true,
                        consultationId = consultation.Id,
                        message = "Tạo cuộc tư vấn thành công"
                    });
                }

        [HttpGet("pending")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetPendingConsultations()
        {
            var pendingConsultations = await _context.Consultations
                .Where(c => c.Status == ConsultationStatus.Pending.ToString())
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.UserName,
                    c.Question,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, consultations = pendingConsultations });
        }
        // 2. API bác sĩ nhận cuộc tư vấn
        [HttpPost("accept/{id}")]
                [Authorize(Roles = "Doctor")]
                public async Task<IActionResult> AcceptConsultation(int id)
                {
                    var consultation = await _context.Consultations
                        .Include(c => c.Messages)
                        .FirstOrDefaultAsync(c => c.Id == id && c.Status == ConsultationStatus.Pending.ToString());

                    if (consultation == null)
                        return NotFound("Cuộc tư vấn không tồn tại hoặc đã được tiếp nhận");

                    var doctorIdClaim = User.FindFirst("DoctorId");
                    if (doctorIdClaim == null)
                        return Unauthorized("Thông tin bác sĩ không hợp lệ.");

                    var doctorId = int.Parse(doctorIdClaim.Value);

                    consultation.DoctorId = doctorId;
                    consultation.Status = ConsultationStatus.Active.ToString();
                    await _context.SaveChangesAsync();

                    await _hubContext.Clients.User(consultation.Email).SendAsync("ConsultationAccepted", new
                    {
                        consultationId = consultation.Id,
                        doctorName = User.Identity.Name
                    });

                    return Ok(new { success = true, message = "Đã tiếp nhận cuộc tư vấn" });
                }

                [HttpPost("end/{id}")]
                [Authorize(Roles = "User,Doctor")]
                public async Task<IActionResult> EndConsultation(int id)
                {
                    var consultation = await _context.Consultations
                        .FirstOrDefaultAsync(c => c.Id == id && c.Status == ConsultationStatus.Active.ToString());

                    if (consultation == null)
                        return NotFound("Không tìm thấy cuộc tư vấn hoạt động");

                    var isDoctor = User.IsInRole("Doctor");

                    // Kiểm tra quyền kết thúc
                    if (isDoctor && consultation.DoctorId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                        return Forbid();
                    if (!isDoctor && consultation.Email != User.FindFirst(ClaimTypes.Email).Value)
                        return Forbid();

                    // Cập nhật trạng thái
                    if (isDoctor)
                    {
                        if (consultation.Status == ConsultationStatus.UserEnded.ToString())
                        {
                            consultation.Status = ConsultationStatus.Completed.ToString();
                        }
                        else
                        {
                            consultation.Status = ConsultationStatus.DoctorEnded.ToString();
                        }
                    }
                    else
                    {
                        if (consultation.Status == ConsultationStatus.DoctorEnded.ToString())
                        {
                            consultation.Status = ConsultationStatus.Completed.ToString();
                        }
                        else
                        {
                            consultation.Status = ConsultationStatus.UserEnded.ToString();
                        }
                    }

                    await _context.SaveChangesAsync();

                    // Thông báo cho bên còn lại
                    string targetUser = isDoctor ? consultation.Email : consultation.Doctor.Email;
                    await _hubContext.Clients.User(targetUser).SendAsync("ConsultationStatusChanged", new
                    {
                        consultationId = consultation.Id,
                        newStatus = consultation.Status
                    });

                    return Ok(new
                    {
                        success = true,
                        status = consultation.Status,
                        message = "Đã cập nhật trạng thái cuộc tư vấn"
                    });
                }
        [HttpPost("messages/{id}")]
        [Authorize(Roles = "User,Doctor")]
        public async Task<IActionResult> SendMessage(int id, [FromForm] string message, IFormFile? image)
        {
            var nameIdentifierClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var emailClaim = User.FindFirst(ClaimTypes.Email);

            if (nameIdentifierClaim == null || emailClaim == null)
                return Unauthorized("Không thể xác định thông tin người dùng.");

            var currentUserId = nameIdentifierClaim.Value;
            var currentUserEmail = emailClaim.Value;

            var consultation = await _context.Consultations
                .Include(c => c.Messages)
                .Include(c => c.Doctor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (consultation == null)
                return NotFound("Không tìm thấy cuộc tư vấn.");

            if (string.IsNullOrEmpty(consultation.Status) || consultation.Status != ConsultationStatus.Active.ToString())
                return BadRequest("Cuộc tư vấn đã kết thúc hoặc chưa được tiếp nhận.");

            var isDoctor = User.IsInRole("Doctor");

            if (isDoctor)
            {
                if (consultation.DoctorId == null || consultation.DoctorId != int.Parse(currentUserId))
                    return Forbid("Bạn không phải là bác sĩ của cuộc tư vấn này.");
            }
            else
            {
                if (string.IsNullOrEmpty(consultation.Email) || consultation.Email != currentUserEmail)
                    return Forbid("Bạn không phải là người dùng của cuộc tư vấn này.");
            }

            var senderName = User.Identity?.Name ?? "Unknown";

            string filePath = null;
            if (image != null)
            {
                // Kiểm tra kích thước và loại tệp (nếu cần)
                if (image.Length > 10 * 1024 * 1024) 
                {
                    return BadRequest("File tải lên quá lớn. Vui lòng chọn file nhỏ hơn.");
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(image.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Chỉ hỗ trợ các định dạng ảnh .jpg, .jpeg, .png.");
                }

                // Tạo tên file duy nhất
                var fileName = $"{Guid.NewGuid()}_{image.FileName}";
                filePath = Path.Combine("wwwroot/loads", fileName);

                // Lưu file vào server
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Lưu đường dẫn tệp
                filePath = $"/loads/{fileName}";
            }

            var newMessage = new ConsultationMessage
            {
                ConsultationId = id,
                Message = message,
                FilePath = filePath, // Đường dẫn ảnh (nếu có)
                SenderType = isDoctor ? "Doctor" : "User",
                SenderName = senderName,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            if (consultation.Messages == null)
                consultation.Messages = new List<ConsultationMessage>();

            consultation.Messages.Add(newMessage);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lưu tin nhắn: {ex.Message}");
            }

            try
            {
                var messagePayload = new
                {
                    consultationId = consultation.Id,
                    message = newMessage.Message,
                    filePath = newMessage.FilePath, // Đường dẫn ảnh (nếu có)
                    senderType = newMessage.SenderType,
                    senderName = newMessage.SenderName,
                    createdAt = newMessage.CreatedAt
                };

                if (isDoctor && !string.IsNullOrEmpty(consultation.Email))
                {
                    await _hubContext.Clients.User(consultation.Email).SendAsync("NewMessage", messagePayload);
                }
                else if (!isDoctor && consultation.DoctorId != null)
                {
                    var doctorId = consultation.DoctorId.ToString();
                    await _hubContext.Clients.User(doctorId).SendAsync("NewMessage", messagePayload);
                }
                else
                {
                    return BadRequest("Không thể gửi tin nhắn: Thiếu thông tin người nhận.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi gửi tin nhắn qua SignalR: {ex.Message}");
            }

            return Ok(new
            {
                success = true,
                message = "Gửi tin nhắn thành công."
            });
        }



        // API lấy các cuộc tư vấn đang diễn ra (Active)
        [HttpGet("active")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetActiveConsultations()
        {
            var doctorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var activeConsultations = await _context.Consultations
                .Where(c => c.Status == ConsultationStatus.Active.ToString() && c.DoctorId == doctorId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.UserName,
                    c.Question,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, consultations = activeConsultations });
        }

        // API lấy trạng thái cuộc tư vấn
        [HttpGet("status/{id}")]
                [Authorize(Roles = "User,Doctor")]
                public async Task<IActionResult> GetConsultationStatus(int id)
                {
                    var consultation = await _context.Consultations
                        .Include(c => c.Doctor)
                        .FirstOrDefaultAsync(c => c.Id == id);

                    if (consultation == null)
                        return NotFound("Không tìm thấy cuộc tư vấn");

                    var isDoctor = User.IsInRole("Doctor");
                    if (isDoctor && consultation.DoctorId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                        return Forbid();
                    if (!isDoctor && consultation.Email != User.FindFirst(ClaimTypes.Email).Value)
                        return Forbid();

                    return Ok(new
                    {
                        success = true,
                        status = consultation.Status,
                        doctorName = consultation.Doctor?.Name,
                        startTime = consultation.CreatedAt
                    });
                }
            // API lấy chi tiết một cuộc tư vấn
            [HttpGet("detail/{id}")]
            [Authorize(Roles = "User,Doctor")]
            public async Task<IActionResult> GetConsultationDetail(int id)
            {
                var consultation = await _context.Consultations
                    .Include(c => c.Doctor)
                    .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (consultation == null)
                    return NotFound("Không tìm thấy cuộc tư vấn");

                var isDoctor = User.IsInRole("Doctor");
                if (isDoctor && consultation.DoctorId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                    return Forbid();
                if (!isDoctor && consultation.Email != User.FindFirst(ClaimTypes.Email).Value)
                    return Forbid();

                var result = new
                {
                    consultation.Id,
                    consultation.Status,
                    DoctorName = consultation.Doctor?.Name,
                    consultation.UserName,
                    consultation.Email,
                    consultation.CreatedAt,
                    consultation.Question,
                    Messages = consultation.Messages.Select(m => new {
                        m.Id,
                        m.Message,
                        m.SenderType,
                        m.SenderName,
                        m.CreatedAt,
                        m.IsRead
                    })
                };

                return Ok(new
                {
                    success = true,
                    consultation = result
                });
            }
            // API lấy lịch sử tư vấn của người dùng
            [HttpGet("user-history")]
                [Authorize(Roles = "User")]
                public async Task<IActionResult> GetUserConsultationHistory()
                {
                    var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

                    var consultations = await _context.Consultations
                        .Include(c => c.Doctor)
                        .Include(c => c.Messages)
                        .Where(c => c.Email == userEmail)
                        .OrderByDescending(c => c.CreatedAt)
                        .Select(c => new {
                            c.Id,
                            c.Status,
                            DoctorName = c.Doctor.Name,
                            c.CreatedAt,
                            LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault().Message,
                            MessageCount = c.Messages.Count,
                            Question = c.Question
                        })
                        .ToListAsync();

                    return Ok(new
                    {
                        success = true,
                        consultations
                    });
                }

        // API lấy lịch sử tư vấn của bác sĩ
        [HttpGet("doctor-history")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorConsultationHistory()
        {
            var doctorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var consultations = await _context.Consultations
                .Include(c => c.Messages) // Load tin nhắn của mỗi cuộc tư vấn
                .Where(c => c.DoctorId == doctorId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.Status,
                    c.UserName,
                    c.Email,
                    c.CreatedAt,
                    LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault().Message,
                    Messages = c.Messages.OrderBy(m => m.CreatedAt).Select(m => new {
                        m.SenderType,
                        m.SenderName,
                        m.Message,
                        m.CreatedAt
                    }).ToList(), // Danh sách tất cả các tin nhắn theo thứ tự thời gian
                    MessageCount = c.Messages.Count,
                    c.Question
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                consultations
            });
        }


    }



    public class ConsultationHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ConsultationHub(ApplicationDbContext context)
        {
            _context = context;
        }

        // Phương thức gửi cập nhật trạng thái tư vấn (dành cho bác sĩ và người dùng)
        public async Task SendStatusUpdate(int consultationId, string status)
        {
            var consultation = await _context.Consultations
                .Include(c => c.Doctor)
                .FirstOrDefaultAsync(c => c.Id == consultationId);

            if (consultation != null)
            {
                // Thêm bác sĩ và người dùng vào nhóm của cuộc tư vấn
                if (consultation.Doctor?.ConnectionId != null)
                {
                    await Groups.AddToGroupAsync(consultation.Doctor.ConnectionId, consultationId.ToString());
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == consultation.Email);
                if (user?.ConnectionId != null)
                {
                    await Groups.AddToGroupAsync(user.ConnectionId, consultationId.ToString());
                }

                // Gửi cập nhật trạng thái đến nhóm (bác sĩ và người dùng đều nhận được)
                await Clients.Group(consultationId.ToString()).SendAsync("StatusUpdated", new { consultationId, status });
            }
        }

        // Phương thức để bác sĩ nhận tin nhắn
        public async Task SendMessage(int consultationId, string message)
        {
            await Clients.All.SendAsync("NewMessage", new { consultationId, message });
        }

        // Phương thức để người dùng nhận tin nhắn
        public async Task UserSendMessage(int consultationId, string message)
        {
            await Clients.All.SendAsync("UserNewMessage", new { consultationId, message });
        }
    }

}


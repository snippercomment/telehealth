//using Backend.Data;
//using Backend.DTO;
//using Backend.Models;
//using Microsoft.EntityFrameworkCore;

//namespace Backend.Services
//{
    
//    public class AppointmentService 
//    {
//        private readonly ApplicationDbContext _context;

//        public AppointmentService(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<bool> CheckAvailableSlot(DateTime date, string time, int doctorId)
//        {
//            var existingAppointment = await _context.Appointments
//                .AnyAsync(a => a.AppointmentDate.Date == date.Date &&
//                              a.AppointmentTime == time &&
//                              a.DoctorId == doctorId);

//            return !existingAppointment;
//        }

//        public async Task<List<string>> GetAvailableTimeSlots(DateTime date, int doctorId)
//        {
//            var bookedSlots = await _context.Appointments
//                .Where(a => a.AppointmentDate.Date == date.Date && a.DoctorId == doctorId)
//                .Select(a => a.AppointmentTime)
//                .ToListAsync();

//            var allTimeSlots = GenerateTimeSlots(); // Tạo danh sách các khung giờ trong ngày
//            return allTimeSlots.Except(bookedSlots).ToList();
//        }

//        private List<string> GenerateTimeSlots()
//        {
//            // Tạo danh sách các khung giờ khám, ví dụ:
//            return new List<string>
//        {
//            "08:00", "08:30", "09:00", "09:30", "10:00",
//            "10:30", "11:00", "11:30", "14:00", "14:30",
//            "15:00", "15:30", "16:00", "16:30"
//        };
//        }

//    }

//}

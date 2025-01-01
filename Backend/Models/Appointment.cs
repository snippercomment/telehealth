using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Appointment
    {
        public int Id { get; set; } // Đây là khóa chính của Appointment
        [ForeignKey("User")]
        public int UserId { get; set; } // Khóa ngoại đến User
        public User User { get; set; } // Navigation property đến User
        [ForeignKey("Doctor")]
        public int DoctorId { get; set; } // Khóa ngoại đến Doctor
        public Doctor Doctor { get; set; } // Navigation property đến Doctor

        public string PatientName { get; set; }
        public string PatientPhone { get; set; }
        public string Gender { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string Describe { get; set; }
        public string Status { get; set; }
        public string ExaminationStatus { get; set; }
        public string CancellationReason { get; set; }
        
        public DateTime ExaminationDate { get; set; }
        public bool IsVisible { get; set; } = true; // Hiển thị trong danh sách hay không
        public DateTime UpdatedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsCancellable { get; set; }
        public bool IsVisibleToDoctor { get; set; }
        public ICollection<PaymentDetail> PaymentDetails { get; set; }
       
        public string PaymentStatus { get; set; }
        public decimal TotalFee { get; set; }
        //public Payment Payment { get; set; }
    }
    public class AppointmentHistory
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public Doctor Doctor { get; set; }
        public int DoctorId { get; set; }
        public DateTime ExaminationDate { get; set; }
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
        public string Prescription { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}

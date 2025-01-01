using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Specialty { get; set; } // Chuyên ngành
        public string Hospital { get; set; } // Bệnh viện
        public string Address { get; set; }
        public string Experience { get; set; }
        [Column(TypeName = "decimal(18,2)")]  // 18 chữ số, 2 số thập phân
        public decimal ConsultationFee { get; set; } // Giá khám
        public string Description { get; set; }
        public string ImagePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
         public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public string? ConnectionId { get;  set; }
        [InverseProperty("Doctor")]
        public virtual ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();

    }


    public class CreateDoctorDTO
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public string Specialty { get; set; }

        [Required]
        public string Hospital { get; set; }

        public string Address { get; set; }
        public string Experience { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Description { get; set; }
        public IFormFile? Image { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateDoctorDTO 
    {
        // Bỏ Email và Id ra khỏi DTO cập nhật
        public string Name { get; set; }
        public string Specialty { get; set; }
        public string Hospital { get; set; }
        public string Address { get; set; }
        public string Experience { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Description { get; set; }
        public IFormFile? Image { get; set; }
    }


    public class Login
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}

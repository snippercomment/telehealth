using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Consultation
    {

        public int Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Question { get; set; }
        public string? Status { get; set; } // Pending, Active, Completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public int? DoctorId { get; set; }
        public int UserId { get; set; }
        //public User User { get; set; }
        public Doctor? Doctor { get; set; }
        public List<ConsultationMessage> Messages { get; set; } = new List<ConsultationMessage>();
    }
    public class ConsultationMessage
    {
        public int Id { get; set; }
        public int ConsultationId { get; set; }
        public  Consultation? Consultation { get; set; }
        public string? Message { get; set; }
       
        
        public string SenderType { get; set; } // "User" or "Doctor"
        public string SenderName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string? FilePath { get;set; }
    }
}

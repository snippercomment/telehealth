
namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? ProfileImage { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? ConnectionId { get; set; }
        public ICollection<Consultation> Consultations { get; set; }
       
    }


    

    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? ProfileImage { get; set; } // Base64 string
        public string Role { get; set; }
    }

    public class ProfileUpdateRequest
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        // Bỏ trường Email
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Gender { get; set; }
        public DateTime BirthDate { get; set; }
        public IFormFile ImageFile { get; set; }
    }

}



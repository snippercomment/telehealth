namespace Backend.DTO
{
    public class ConsultationCreateDto
    {
        public string UserName { get; set; }
        public string Question { get; set; }
        public int DoctorId { get; set; }
    }
    public class MessageDto
    {
        public string Message { get; set; }
        public string? ImageUrl { get; set; } // URL của hình ảnh
        
    }
}

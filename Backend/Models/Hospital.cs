namespace Backend.Models
{
    public class Hospital
    {
     public int Id { get; set; }
    public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
    public string PhoneNumber { get; set; }
    public string Specialties { get; set; }
    public string ImagePath { get; set; }
        public TimeSpan OpenTime { get; set; }  // Giờ mở cửa
        public TimeSpan CloseTime { get; set; } // Giờ đóng cửa
        public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    }
    public class HospitalDTO
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        public string PhoneNumber { get; set; }
        public string Specialties { get; set; }
        public IFormFile Image { get; set; }
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
    }

    // Models/WorkingHours.cs
    public class WorkingHours
    {
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
    }

    //// Models/Enums/DayOfWeek.cs
    //public enum WorkingDays
    //{
    //    Monday = 1,
    //    Tuesday = 2,
    //    Wednesday = 3,
    //    Thursday = 4,
    //    Friday = 5,
    //    Saturday = 6,
    //    Sunday = 7
    //}
    

    //public class WorkingHoursDTO
    //{
    //    public TimeSpan OpenTime { get; set; }
    //    public TimeSpan CloseTime { get; set; }
    //}
}

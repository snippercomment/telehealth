namespace Backend.DTO
{
    public class AppointmentDTO
    {
        public string PatientName { get; set; }
        public string PatientPhone { get; set; }
        public string Gender { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; }
        public string Describe { get; set; }
        public int DoctorId { get; set; }

    }

    public class UpdateStatusDTO
    {

        public string Status { get; set; }
      
    }

    public class CancelDTO
    {
        public string Reason { get; set; }
    }


}

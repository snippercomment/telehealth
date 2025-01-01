namespace Backend.Models
{
    public class Payment
    {
        public int PaymentID { get; set; }
        public string CardNumber { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string PaymentStatus { get; set; }
        public int UserID { get; set; }

        // Navigation properties
        public User User { get; set; }
        public ICollection<PaymentDetail> PaymentDetails { get; set; }
       
    }
    public class PaymentDetail
    {
        public int PaymentDetailID { get; set; }
        public int PaymentID { get; set; }
        public int AppointmentID { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string DetailStatus { get; set; }

        // Navigation properties
        public Payment Payment { get; set; }
        public Appointment Appointment { get; set; }
        public int UserID { get; set; }
    }
    
}

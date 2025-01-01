namespace Backend.DTO
{
    public class PaymentDTO
    {
        public string CardNumber { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int AppointmentID { get; set; }
        public int UserID { get; set; }
        

    }
   
}

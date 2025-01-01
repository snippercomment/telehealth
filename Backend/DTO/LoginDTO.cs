using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = string.Empty;
    }
    //public class LoginResponse
    //{
    //    public bool Success { get; set; }
    //    public string Token { get; set; }
    //    public string Role { get; set; }
    //    public int? UserId { get; set; }
    //    public string Message { get; set; }
    //}
}

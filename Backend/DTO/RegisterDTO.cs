using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class RegisterDTO
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Tên đầy đủ là bắt buộc")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Mật khẩu nhập lại là bắt buộc")]
        [Compare("Password", ErrorMessage = "Mật khẩu nhập lại không khớp")]
        public string ConfirmPassword { get; set; }
    }

}


using Backend.Data;
using iTextSharp.text.pdf;
using iTextSharp.text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AppStatisticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppStatisticsController(ApplicationDbContext context)
        {
            _context = context;
        }
        // API xuất doanh thu thành PDF
        // API xuất doanh thu thành PDF
        [HttpGet("revenue/export-pdf")]
        public async Task<IActionResult> ExportRevenueToPdf()
        {
            try
            {
                // Lấy dữ liệu doanh thu
                var paymentDetails = await _context.PaymentDetails
                    .Where(pd => pd.DetailStatus == "Đã thanh toán")
                    .Join(_context.Payments,
                        pd => pd.PaymentID,
                        p => p.PaymentID,
                        (pd, p) => new { pd, p })
                    .Join(_context.Users,
                        pp => pp.p.UserID,
                        u => u.Id,
                        (pp, u) => new
                        {
                            pp.pd.PaymentID,
                            pp.pd.AppointmentID,
                            pp.pd.Amount,
                            PaymentDate = pp.pd.PaymentDate.ToString("dd/MM/yyyy HH:mm"),
                            pp.pd.DetailStatus,
                            u.FullName
                        })
                    .ToListAsync();

                var totalRevenue = paymentDetails.Sum(pd => pd.Amount);

                // Tạo tài liệu PDF
                var stream = new MemoryStream();
                var document = new Document(PageSize.A4, 20, 20, 40, 40);
                var writer = PdfWriter.GetInstance(document, stream);
                document.Open();

                // Tải font hỗ trợ Unicode
                string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "arial.ttf");
                var baseFont = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                var font = new Font(baseFont, 10, Font.NORMAL);
                var titleFont = new Font(baseFont, 16, Font.BOLD);
                var headerFont = new Font(baseFont, 12, Font.BOLD);

                // Thêm tiêu đề
                var title = new Paragraph("Thống kê doanh thu\n", titleFont) { Alignment = Element.ALIGN_CENTER };
                document.Add(title);

                var subtitle = new Paragraph($"Ngày tạo: {DateTime.Now:dd/MM/yyyy HH:mm}\n\n", font) { Alignment = Element.ALIGN_CENTER };
                document.Add(subtitle);

                // Tạo bảng
                var table = new PdfPTable(6)
                {
                    WidthPercentage = 100,
                    HorizontalAlignment = Element.ALIGN_CENTER
                };

                // Đặt tỷ lệ cột
                table.SetWidths(new float[] { 2, 2, 2, 3, 2, 3 });

                // Thêm tiêu đề cột
                var headers = new[] { "Mã thanh toán", "ID cuộc hẹn", "Số tiền", "Ngày thanh toán", "Trạng thái", "Họ và tên" };
                foreach (var header in headers)
                {
                    var cell = new PdfPCell(new Phrase(header, headerFont))
                    {
                        BackgroundColor = BaseColor.LIGHT_GRAY,
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 5
                    };
                    table.AddCell(cell);
                }

                // Thêm dữ liệu từng dòng
                foreach (var pd in paymentDetails)
                {
                    table.AddCell(new PdfPCell(new Phrase(pd.PaymentID.ToString(), font)) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(pd.AppointmentID.ToString(), font)) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(pd.Amount.ToString("N0") + " đ", font)) { HorizontalAlignment = Element.ALIGN_RIGHT });
                    table.AddCell(new PdfPCell(new Phrase(pd.PaymentDate, font)) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(pd.DetailStatus, font)) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(pd.FullName, font)) { HorizontalAlignment = Element.ALIGN_CENTER });
                }

                // Thêm bảng vào tài liệu
                document.Add(table);

                // Tổng doanh thu
                var totalParagraph = new Paragraph($"\nTổng doanh thu: {totalRevenue.ToString("N0")} đ", titleFont)
                {
                    Alignment = Element.ALIGN_RIGHT,
                    SpacingBefore = 10
                };
                document.Add(totalParagraph);

                document.Close();

                // Trả về file PDF
                var content = stream.ToArray();
                return File(content, "application/pdf", "ThongKeDoanhThu.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xuất file PDF", error = ex.Message });
            }
        }


        // API thống kê tổng số tiền cho các cuộc hẹn đã thanh toán (chi tiết từng thanh toán với tên người thanh toán)
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueStatistics()
        {
            try
            {
                // Nối bảng thông qua Payment để lấy thông tin người thanh toán
                var paymentDetails = await _context.PaymentDetails
                    .Where(pd => pd.DetailStatus == "Đã thanh toán")
                    .Join(_context.Payments,
                        pd => pd.PaymentID,
                        p => p.PaymentID,
                        (pd, p) => new { pd, p })
                    .Join(_context.Users,
                        pp => pp.p.UserID,
                        u => u.Id,
                        (pp, u) => new
                        {
                            pp.pd.PaymentID,
                            pp.pd.AppointmentID,
                            pp.pd.Amount,
                            PaymentDate = pp.pd.PaymentDate.ToString("dd/MM/yyyy HH:mm"),
                            pp.pd.DetailStatus,
                            u.FullName
                        })
                    .ToListAsync();

                var totalRevenue = paymentDetails.Sum(pd => pd.Amount);

                return Ok(new
                {
                    Columns = new[] { "PaymentID", "AppointmentID", "Amount", "PaymentDate", "DetailStatus", "FullName" },
                    Rows = paymentDetails,
                    TotalRevenue = totalRevenue
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê doanh thu", error = ex.Message });
            }
        }

        [HttpGet("revenue/{period}")]
        public async Task<IActionResult> GetRevenueByPeriod(string period)
        {
            try
            {
                var today = DateTime.UtcNow;
                DateTime startDate;

                // Xác định thời gian bắt đầu dựa trên period
                switch (period.ToLower())
                {
                    case "ngày":
                        startDate = today.Date;
                        break;
                    case "tháng":
                        startDate = new DateTime(today.Year, today.Month, 1);
                        break;
                    case "năm":
                        startDate = new DateTime(today.Year, 1, 1);
                        break;
                    default:
                        return BadRequest(new { message = "Period không hợp lệ. Vui lòng chọn 'ngày', 'tháng', hoặc 'năm'." });
                }

                // Nối bảng thông qua Payment để lấy thông tin người thanh toán
                var paymentDetails = await _context.PaymentDetails
                    .Where(pd => pd.PaymentDate >= startDate && pd.PaymentDate <= today && pd.DetailStatus == "Đã thanh toán")
                    .Join(_context.Payments,
                        pd => pd.PaymentID,
                        p => p.PaymentID,
                        (pd, p) => new { pd, p })
                    .Join(_context.Users,
                        pp => pp.p.UserID,
                        u => u.Id,
                        (pp, u) => new
                        {
                            pp.pd.PaymentID,
                            pp.pd.AppointmentID,
                            pp.pd.Amount,
                            PaymentDate = pp.pd.PaymentDate.ToString("dd/MM/yyyy HH:mm"),
                            pp.pd.DetailStatus,
                            u.FullName
                        })
                    .ToListAsync();

                var totalRevenue = paymentDetails.Sum(pd => pd.Amount);
                var formattedStartDate = startDate.ToString("dd/MM/yyyy HH:mm");

                return Ok(new
                {
                    Period = period,
                    StartDate = formattedStartDate,
                    Columns = new[] { "PaymentID", "AppointmentID", "Amount", "PaymentDate", "DetailStatus", "FullName" },
                    Rows = paymentDetails,
                    TotalRevenue = totalRevenue
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê doanh thu theo thời gian", error = ex.Message });
            }
        }




    }


}

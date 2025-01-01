import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStatisticsService } from '../../service/appStatistics.service';

@Component({
  selector: 'app-appointment-statistics',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './appointment-statistics.component.html',
  styleUrl: './appointment-statistics.component.css'
})
export class AppointmentStatisticsComponent {
  revenueData: any = {}; // Dữ liệu gốc từ server
  filteredRevenueData: any[] = []; // Dữ liệu đã lọc
  searchTerm: string = ''; // Giá trị tìm kiếm
  currentPage: number = 1; // Trang hiện tại
  itemsPerPage: number = 5; // Số lượng mục trên mỗi trang

  constructor(private appStatisticsService: AppStatisticsService) {}

  ngOnInit(): void {
    this.getRevenueStatistics();
  }

  // Lấy thống kê doanh thu tổng quát
  getRevenueStatistics(): void {
    this.appStatisticsService.getRevenueStatistics().subscribe((data) => {
      this.revenueData = data;
      this.filteredRevenueData = data.rows; // Khởi tạo dữ liệu đã lọc
    });
  }

  // Lấy thống kê doanh thu theo thời gian (Ngày, Tháng, Năm)
  getRevenueByPeriod(period: string): void {
    this.appStatisticsService.getRevenueByPeriod(period).subscribe((data) => {
      this.revenueData = data;
      this.filteredRevenueData = data.rows; // Khởi tạo dữ liệu đã lọc
      this.currentPage = 1; // Reset về trang đầu
    });
  }
   // Gọi hàm export PDF
   handleExportToPdf() {
    this.appStatisticsService.exportRevenueToPdf().subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'DoanhThu.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Lỗi khi xuất PDF:', error);
        alert('Không thể xuất file PDF. Vui lòng thử lại sau!');
      }
    );
  }

  // Tìm kiếm trong danh sách doanh thu
  search(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRevenueData = this.revenueData.rows.filter(
      (row: any) =>
        row.paymentID.toLowerCase().includes(term) ||
        row.appointmentID.toLowerCase().includes(term) ||
        row.fullName.toLowerCase().includes(term)
    );
    this.currentPage = 1; // Reset về trang đầu
  }

  // Tổng số trang
  get totalPages(): number {
    return Math.ceil(this.filteredRevenueData.length / this.itemsPerPage);
  }

  // Lấy dữ liệu hiển thị cho trang hiện tại
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRevenueData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Chuyển trang
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

}

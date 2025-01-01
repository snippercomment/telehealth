import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Hospital } from '../../../model/hospital.model';
import { HospitalService } from '../../service/hospital.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../subpage/hospitals/delete/delete.component';
@Component({
  selector: 'app-hopitals',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,HttpClientModule,MatIconModule,MatTableModule],
  providers: [
    HospitalService // Đăng ký service ở đây
  ],
  templateUrl: './hopitals.component.html',
  styleUrl: './hopitals.component.css'
})
export class HopitalsComponent implements OnInit {
  hospitals: Hospital[] = [];
  currentPage = 1;
  itemsPerPage = 5; // Cập nhật số lượng bệnh viện trên mỗi trang
  searchTerm = '';
  filteredHospitals: Hospital[] = [];
  displayedColumns: string[] = ['id', 'name', 'openTime', 'closeTime', 'phone', 'image', 'actions'];

  constructor(private hospitalService: HospitalService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadHospitals();
  }

  // Tính tổng số trang
  get totalPages(): number {
    return Math.ceil(this.filteredHospitals.length / this.itemsPerPage);
  }

  // Hàm lấy các bệnh viện cho trang hiện tại
  get paginatedHospitals(): Hospital[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredHospitals.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Hàm tải danh sách bệnh viện
  loadHospitals(): void {
    this.hospitalService.getAllHospitals().subscribe(
      (data) => {
        this.hospitals = data.map(hospital => ({
          ...hospital,
          phone: hospital.phoneNumber || 'Chưa có số điện thoại', 
          image: hospital.imagePath || 'assets/images/default-hospital.png' 
        }));
        this.filteredHospitals = [...this.hospitals];
      },
      (error) => console.error('Error loading hospitals:', error)
    );
  }

  // Hàm tìm kiếm bệnh viện
  search() {
    if (!this.searchTerm.trim()) {
      this.filteredHospitals = [...this.hospitals];
      return;
    }
    this.filteredHospitals = this.hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      hospital.phoneNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Hàm chuyển trang
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Tạo mảng các trang
  getPages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  // Mở dialog xóa bệnh viện
  openDeleteDialog(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      data: { id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hospitalService.deleteHospital(id).subscribe(
          () => {
            this.loadHospitals();
          },
          error => console.error('Error:', error)
        );
      }
    });
  }
}

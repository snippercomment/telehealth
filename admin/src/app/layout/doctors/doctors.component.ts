import { Component, OnInit } from '@angular/core';
import { Doctor, Speciality } from '../../../model/doctor.interface';
import { DoctorService } from '../../service/doctor.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {  HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../subpage/doctors/delete/delete.component';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,HttpClientModule],
  providers: [
    DoctorService  // Đăng ký service ở đây
  ],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit{
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  pagedDoctors: Doctor[] = [];
  searchTerm: string = '';
  errorMessage: string = '';

  // Phân trang
  currentPage = 1;        // Trang hiện tại
  itemsPerPage = 5;       // Số lượng bác sĩ mỗi trang
  totalPages = 1;         // Tổng số trang

  constructor(private doctorService: DoctorService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe(
      (data) => {
        this.doctors = data;
        this.filteredDoctors = data; // Dữ liệu sau khi lọc
        this.totalPages = Math.ceil(this.filteredDoctors.length / this.itemsPerPage);
        this.updatePagedDoctors();  // Cập nhật bác sĩ hiển thị theo trang
        this.errorMessage = '';
      },
      (error) => {
        console.error('Error loading doctors:', error);
        this.errorMessage = 'Không thể tải danh sách bác sĩ. Vui lòng thử lại sau!';
      }
    );
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.filteredDoctors = this.doctors;
       const searchFee = parseFloat(this.searchTerm);
    } else {
      this.filteredDoctors = this.doctors.filter(doctor => {
        const searchTermLower = this.searchTerm.toLowerCase();
        const searchFee = parseFloat(this.searchTerm); // Chuyển đổi searchTerm thành số nếu có thể
      
        return (
          doctor.name.toLowerCase().includes(searchTermLower) ||
          doctor.specialty.toLowerCase().includes(searchTermLower) ||
          doctor.hospital.toLowerCase().includes(searchTermLower) ||
          doctor.experience.toLowerCase().includes(searchTermLower) ||
          (doctor.consultationFee && doctor.consultationFee.toString().includes(this.searchTerm)) || // Tìm theo từng chữ số
          (doctor.consultationFee && !isNaN(searchFee) && doctor.consultationFee === searchFee) // Tìm chính xác giá
        );
      });
        
    }
    this.totalPages = Math.ceil(this.filteredDoctors.length / this.itemsPerPage);
    this.currentPage = 1;  // Reset về trang đầu khi tìm kiếm
    this.updatePagedDoctors();
  }

  // Cập nhật danh sách bác sĩ theo trang
  updatePagedDoctors() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedDoctors = this.filteredDoctors.slice(start, end);
  }

  // Thay đổi trang
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;  // Nếu trang không hợp lệ
    this.currentPage = page;
    this.updatePagedDoctors();
  }

  deleteDoctor(id: number, doctorName: string): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      data: { itemName: doctorName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.doctorService.deleteDoctor(id).subscribe(
          () => {
            this.loadDoctors(); // Reload danh sách sau khi xóa
          },
          (error) => {
            console.error('Error deleting doctor:', error);
          }
        );
      }
    });
  }
}

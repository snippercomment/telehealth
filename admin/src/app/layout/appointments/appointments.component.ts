import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../../subpage/confirm-modal/confirm-modal.component';
import { AppointmentService } from '../../service/appointment.service';
import { Appointment } from '../../../model/appointment.model';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule,HttpClientModule,FormsModule,ConfirmModalComponent],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent {
  currentPage: number = 1; 
  itemsPerPage: number = 4;
  appointments: Appointment[] = [];
  loading: boolean = true;
  error: string | null = null;
  @Input() appointment: any; 
  filteredAppointments: any[] = []; // Dữ liệu đã lọc
  searchTerm: string = ''; // Từ khóa tìm kiếm
  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
    
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.filteredAppointments = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách lịch khám';
        this.loading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }

  approveAppointment(id: number | undefined) {
    this.appointmentService.approveAppointment(id!).subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error approving appointment:', error);
        alert('Không thể duyệt lịch khám. Vui lòng thử lại!');
      }
    });
  }
  search() {
    const term = this.searchTerm.trim().toLowerCase();
  
    if (!term) {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter(appointment =>
        appointment.patientName?.toLowerCase().includes(term) ||
        appointment.patientPhone?.toLowerCase().includes(term) ||
        appointment.doctor?.name?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1; // Reset về trang đầu tiên sau khi tìm kiếm
  }
  
  // Tổng số trang
get totalPages(): number {
  return Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
}

// Lấy dữ liệu hiển thị cho trang hiện tại
get paginatedAppointments(): Appointment[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredAppointments.slice(startIndex, startIndex + this.itemsPerPage);
}

// Chuyển trang
changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}
  
  formatDateTime(date: string, time: string): string {
    return `${new Date(date).toLocaleDateString('vi-VN')} ${time}`;
  }
  
}


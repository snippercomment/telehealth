import { Component } from '@angular/core';
import { AppointmentService } from '../../service/appointment.service';
import { AuthService } from '../../service/auth.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Appointment } from '../../../model/appointment.model';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  providers: [
    AppointmentService // Đăng ký service ở đây
  ],
  templateUrl: './doctor-appointments.component.html',
  styleUrl: './doctor-appointments.component.css'
})
export class DoctorAppointmentsComponent {
   appointments: Appointment[] = [];
  filteredAppointments: any[] = [];
  searchTerm: string = '';
  doctorId!: number;
 
  constructor(private appointmentService: AppointmentService  ) 
  { this.doctorId = Number(localStorage.getItem('doctorId')); }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getDoctorAppointments(this.doctorId)
      .subscribe({
        next: (data) => {
          this.appointments = data;
          this.filteredAppointments = data;
          
        },
        error: (error) => {
          console.error('Error fetching appointments:', error);
          alert('Không thể tải danh sách lịch khám');
        }
      });
  }
  // getDoctorId() {
  //   // Lấy doctorId từ localStorage hoặc service của bạn
  //   return localStorage.getItem('doctorId');
  // }
  updateStatus(appointmentId: number, status: string) {
    this.appointmentService.updateExaminationStatus(appointmentId, status ).subscribe({
      next: () => {
        // Tải lại danh sách lịch khám sau khi cập nhật
        this.loadAppointments();
        alert(`Trạng thái đã được cập nhật thành công: ${status}`);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật trạng thái:', err);
        alert('Không thể cập nhật trạng thái. Vui lòng thử lại!');
      }
    });
  }
  
  
  
  searchAppointments() {
    if (!this.searchTerm.trim()) {
      this.filteredAppointments = this.appointments;
      return;
    }

    const searchValue = this.searchTerm.toLowerCase().trim();
    this.filteredAppointments = this.appointments.filter(appointment => 
      appointment.patientName.toLowerCase().includes(searchValue) ||
      appointment.patientPhone.includes(searchValue)
    );
  }
}

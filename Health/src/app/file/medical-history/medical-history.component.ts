import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../../../../admin/src/app/service/appointment.service';
import { Appointment, Payment } from '../../../../../admin/src/model/appointment.model';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,HttpClientModule],
  providers:[AppointmentService],
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.css'
})
export class MedicalHistoryComponent implements OnInit  {
  appointments: Appointment[] = [];
  selectedAppointment!: Appointment;
  editForm: FormGroup;
  showCancelDialog = false;
  showEditDialog = false;
  cancelReason = '';
  notificationMessage: string = '';
  showNotification: boolean = false;


  showPaymentDialog = false;
  paymentForm!: FormGroup; 
  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      patientName: ['', Validators.required],
      patientPhone: ['', Validators.required],
      gender: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      describe: ['', Validators.required],
      doctorId: ['', Validators.required]
    });
    
  }

  ngOnInit() {
    this.loadAppointments();
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expirationDate: ['', Validators.required]
    });
  }

  loadAppointments() {
    this.appointmentService.getMyAppointments().subscribe(
      data => this.appointments = data
    );
  }

  openCancelDialog(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showCancelDialog = true;
  }
  showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.notificationMessage = '';
    }, 3000); // Tự động ẩn sau 3 giây
  }
  
  showErrorNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.notificationMessage = '';
    }, 3000); // Tự động ẩn sau 3 giây
  }
  openEditDialog(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.editForm.patchValue({
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      gender: appointment.gender,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      describe: appointment.describe,
      doctorId: appointment.doctor!.id
    });
    this.showEditDialog = true;
  }

  cancelAppointment() {
    if (this.selectedAppointment && this.cancelReason) {
      this.appointmentService.cancelAppointment(
        this.selectedAppointment.id!,
        this.cancelReason
      ).subscribe({
        next: () => {
          this.loadAppointments();
          this.showCancelDialog = false;
          this.cancelReason = '';
          this.showSuccessNotification('Huỷ lịch hẹn thành công!');
        },
        error: () => {
          this.showErrorNotification('Có lỗi xảy ra khi huỷ lịch hẹn.');
        }
      });
    }
  }
  updateAppointment() {
    if (this.editForm.valid && this.selectedAppointment) {
      const updatedData = this.editForm.value;
      this.appointmentService.updateMyAppointment(this.selectedAppointment.id!, updatedData)
        .subscribe({
          next: () => {
            this.showSuccessNotification('Cập nhật lịch hẹn thành công!');
            this.showEditDialog = false;
            this.loadAppointments();
          },
          error: () => {
            this.showErrorNotification('Không thể cập nhật lịch hẹn.');
          }
        });
    }
  }
  // Mở hộp thoại thanh toán
  openPaymentDialog(appointment: any): void {
    this.selectedAppointment = appointment;
    this.showPaymentDialog = true;
  }

  // Xử lý thanh toán
  processPayment(): void {
    if (this.paymentForm.invalid) return;
  
    const paymentDTO: Payment = {
      AppointmentID: this.selectedAppointment.id,
      CardNumber: this.paymentForm.value.cardNumber,
      ExpirationDate: this.paymentForm.value.expirationDate
    };
  
    this.appointmentService.makePayment(paymentDTO).subscribe({
      next: () => {
        this.showSuccessNotification('Thanh toán thành công!');
        this.showPaymentDialog = false;
      },
      error: () => {
        this.showErrorNotification('Có lỗi xảy ra khi thanh toán.');
      }
    });
  }
  validateCardNumber(event: Event) {
    const input = (event.target as HTMLInputElement);
    input.value = input.value.replace(/\D/g, '').substring(0, 16);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DoctorService } from '../../../../../admin/src/app/service/doctor.service';
import { Doctor } from '../../../../../admin/src/model/doctor.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppointmentService } from '../../../../../admin/src/app/service/appointment.service';



@Component({
  selector: 'app-appointment-link',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,MatCardModule,MatIconModule,RouterLink,HttpClientModule],
    providers: [AppointmentService],
  templateUrl: './appointment-link.component.html',
  styleUrl: './appointment-link.component.css'
})
export class AppointmentLinkComponent implements OnInit {
  doctors!: Doctor |null | null;
  doctorsApp: any[] = [];
  relatedDoctors: Doctor[] = [];
  bookingForm!: FormGroup;
  isLoading: boolean = false;
  error: string = '';
  imagePath: string = ''; 
  showNotification = false;
  notificationMessage = '';
  defaultImage: string = 'assets/images/default-doctor.png';

  timeSlots: string[] = [
    
  ];

  genderOptions = [
    {  label: 'Nam' },
    {  label: 'Nữ' },
    { label: 'Khác' }
  ];

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadDoctorDetails();
  }
  private initForm() {
    this.bookingForm = this.fb.group({
      patientName: ['', [Validators.required]],
      patientPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      describe: ['', Validators.required],
      doctorId: ['', Validators.required]
    });
  }

  private loadDoctorDetails() {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];
    this.doctorService.getDoctorById(id).subscribe({
      
      next: (doctor) => {
        console.log('Doctor data:', doctor);
        
        this.doctors = doctor;
        this.bookingForm.patchValue({
          doctorId: doctor.id
        });
        this.loadRelatedDoctors();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải thông tin bác sĩ';
        this.isLoading = false;
        console.error('Error loading doctor details:', error);
      }
    });
    
  }


  private loadRelatedDoctors() {
    this.isLoading = true;
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.relatedDoctors = doctors
          .filter(d => d.specialty === this.doctors!.specialty && d.id !== this.doctors!.id)
          .slice(0, 3);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bác sĩ liên quan';
        this.isLoading = false;
        console.error('Error loading related doctors:', error);
      }
    });
  }

  

  onSubmit() {
    if (this.bookingForm.valid) {
      this.notificationMessage = 'Đặt lịch thành công! Cảm ơn bạn đã sử dụng dịch vụ.';
      this.showNotification = true;

      // Reset form và tự động ẩn thông báo sau vài giây
      setTimeout(() => {
        this.showNotification = false;
        this.bookingForm.reset();
      }, 5000);
    }
  }
}

import { Component } from '@angular/core';
// import { AddDoctor } from '../../../../model/doctor.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateDoctorDTO } from '../../../../model/doctor.interface';
import { DoctorService } from '../../../service/doctor.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-adddoctors',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,HttpClientModule],
  providers: [
    DoctorService  // Đăng ký service ở đây
  ],
  templateUrl: './adddoctors.component.html',
  styleUrl: './adddoctors.component.css'
})
export class AdddoctorsComponent {
  doctor: CreateDoctorDTO = {
    name: '',
    email: '',
    password: '',
    specialty: '',
    hospital: '',
    address: '',
    experience: '',
    consultationFee: 0,
    description: ''
  };
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  imagePreview: string = 'assets/';
  selectedFile?: File;

  specialties: string[] = [];
  experiences: string[] = [];

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  openFileInput(): void {
    document.getElementById('fileInput')?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      this.doctor.image = this.selectedFile;
    }

    this.doctorService.createDoctor(this.doctor).subscribe({
      next: (response) => {
        console.log('Doctor created successfully', response);
        this.router.navigate(['/admin/Doctor']);
      },
      error: (error) => {
        console.error('Error creating doctor', error);
        // Thêm xử lý lỗi ở đây (ví dụ: hiển thị thông báo)
      }
    });
  }

}

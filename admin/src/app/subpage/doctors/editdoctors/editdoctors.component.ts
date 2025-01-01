import { Doctor, UpdateDoctorDTO } from './../../../../model/doctor.interface';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule,  ReactiveFormsModule,  Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DoctorService } from '../../../service/doctor.service';
import { HttpClientModule } from '@angular/common/http';
// import { Doctor, UpdateDoctorDTO } from '../../../../model/doctor.interface';



@Component({
  selector: 'app-editdoctors',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink,HttpClientModule],
  providers: [
    DoctorService  // Đăng ký service ở đây
  ],
  templateUrl: './editdoctors.component.html',
  styleUrl: './editdoctors.component.css'
})


export class EditdoctorsComponent  implements OnInit {
  doctor: Doctor = {
    id: 0,
    name: '',
    email: '',
    password: '',
    specialty: '',
    hospital: '',
    address: '',
    experience: '',
    consultationFee: 0,
    description: '',
    imagePath: '',
  };

  imagePreview: string = 'assets/';
  selectedFile: File | null = null;
  
  
  specialties: string[] = [];
  experiences: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.loadDoctor(id);
    }
  }

  loadDoctor(id: number) {
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor: Doctor) => {
        this.doctor = doctor;
        this.imagePreview = doctor.imagePath ? doctor.imagePath : 'defaultImagePath';

        this.doctor.password = '********'; // Ẩn mật khẩu
      },
      error: (error) => {
        console.error('Error loading doctor:', error);
      }
    });
  }

  openFileInput() {
    document.getElementById('fileInput')!.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    const formData = new FormData();
    
    const updateData: UpdateDoctorDTO = {
      name: this.doctor.name,
      specialty: this.doctor.specialty,
      hospital: this.doctor.hospital,
      address: this.doctor.address,
      experience: this.doctor.experience,
      consultationFee: this.doctor.consultationFee,
      description: this.doctor.description
    };

    // Append all text fields
    Object.keys(updateData).forEach(key => {
      formData.append(key, updateData[key].toString());
    });

    // Append image if selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.doctorService.updateDoctor(this.doctor.id, formData).subscribe({
      next: (response) => {
        console.log('Doctor updated successfully', response);
        this.router.navigate(['/admin/Doctor']);
      },
      error: (error) => {
        console.error('Error updating doctor:', error);
      }
    });
  }
}

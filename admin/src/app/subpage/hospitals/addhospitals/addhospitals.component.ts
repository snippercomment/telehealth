import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HospitalService } from '../../../service/hospital.service';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-addhospitals',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,HttpClientModule],
   providers: [
    HospitalService // Đăng ký service ở đây
  ],
  templateUrl: './addhospitals.component.html',
  styleUrl: './addhospitals.component.css'
})
export class AddhospitalsComponent implements OnInit {
  hospitalForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  specialties = ['Tâm Lý, Bác Sĩ Gia Đình, Ngoại Thần Kinh, Nội Cơ Xương Khớp', 'Ngoại Tiêu Hoá, Da Liễu, Tai Mũi Họng, Nội Thần Kinh',
    'Nội Hô Hấp, Lão Khoa, Tâm Lý, Ngoại Thần Kinh','Nội Thần Kinh, Bác Sĩ Gia Đình, Lão Khoa, Nội Cơ Xương Khớp','Ngoại Tiêu Hoá, Da Liễu, Tai Mũi Họng, Nội Hô Hấp'
  ];
  constructor(private fb: FormBuilder,private router: Router,private hospitalService: HospitalService,) {
    this.hospitalForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      specialties: ['', Validators.required],
      openTime: ['', Validators.required],
      closeTime: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      description: [''],
    });
   

  }

  ngOnInit(): void {}
  getPhoneErrorMessage(): string {
    const control = this.hospitalForm.get('phone');
    if (control?.hasError('required')) {
      return 'Vui lòng nhập số điện thoại';
    }
    if (control?.hasError('pattern')) {
      return 'Số điện thoại không hợp lệ';
    }
    return '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.hospitalForm.valid) {
      const formData = new FormData();
      
      // Thêm các trường form vào FormData
      Object.keys(this.hospitalForm.value).forEach(key => {
        if (key === 'departments') {
          formData.append(key, JSON.stringify(this.hospitalForm.value[key]));
        } else {
          formData.append(key, this.hospitalForm.value[key]);
        }
      });

      // Thêm file ảnh nếu có
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.hospitalService.addHospital(formData).subscribe({
        next: (response) => {
          console.log('Hospital added successfully', response);
          this.router.navigate(['/admin/Hospital']); // Điều hướng sau khi thêm thành công
        },
        error: (error) => {
          console.error('Error adding hospital', error);
          // Xử lý lỗi ở đây
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/Hospital']);
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HospitalService } from '../../../service/hospital.service';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-edithospitals',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,HttpClientModule],
  providers: [
    HospitalService
  ],
  templateUrl: './edithospitals.component.html',
  styleUrl: './edithospitals.component.css'
})
export class EdithospitalsComponent {
  hospitalForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  hospitalId!: number;
  specialties = ['Tâm Lý, Bác Sĩ Gia Đình, Ngoại Thần Kinh, Nội Cơ Xương Khớp', 'Ngoại Tiêu Hoá, Da Liễu, Tai Mũi Họng, Nội Thần Kinh',
    'Nội Hô Hấp, Lão Khoa, Tâm Lý, Ngoại Thần Kinh','Nội Thần Kinh, Bác Sĩ Gia Đình, Lão Khoa, Nội Cơ Xương Khớp','Ngoại Tiêu Hoá, Da Liễu, Tai Mũi Họng, Nội Hô Hấp'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private hospitalService: HospitalService,
    private route: ActivatedRoute
  ) {
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

  ngOnInit() {
    this.hospitalId = +this.route.snapshot.params['id'];
    this.loadHospitalData();
  }

  loadHospitalData() {
    this.hospitalService.getHospitalById(this.hospitalId).subscribe({
      next: (hospital) => {
        this.hospitalForm.patchValue({
          name: hospital.name,
          address: hospital.address,
          specialties: hospital.specialties,
          openTime: hospital.openTime,
          closeTime: hospital.closeTime,
          phoneNumber: hospital.phoneNumber,
          description: hospital.description
        });
        
        if (hospital.imagePath) {
          this.imagePreview = hospital.imagePath;
        }
      },
      error: (error) => {
        console.error('Error loading hospital:', error);
      }
    });
  }

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
      
      Object.keys(this.hospitalForm.value).forEach(key => {
        if (key === 'specialties') {
          formData.append(key, JSON.stringify(this.hospitalForm.value[key]));
        } else {
          formData.append(key, this.hospitalForm.value[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.hospitalService.updateHospital(this.hospitalId, formData).subscribe({
        next: (response) => {
          console.log('Hospital updated successfully', response);
          this.router.navigate(['/admin/Hospital']);
        },
        error: (error) => {
          console.error('Error updating hospital', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/Hospital']);
  }
}

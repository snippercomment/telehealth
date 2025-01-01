// import { EditDoctorComponent } from './editdoctor.service';
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';


// @Injectable({
//   providedIn: 'root'
// })
// export class EditDoctorComponent {
//   private apiUrl = 'your-api-url/api/doctors';

//   constructor(private http: HttpClient) { }

//   getDoctorById(id: string): Observable<Doctor> {
//     return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
//   }

//   updateDoctor(id: string, formData: FormData): Observable<Doctor> {
//     return this.http.put<Doctor>(`${this.apiUrl}/${id}`, formData);
//   }
// }


// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DoctorService } from '../../services/doctor.service';
// import { Doctor } from '../../models/doctor.model';

// @Component({
//   selector: 'app-edit-doctor',
//   templateUrl: './edit-doctor.component.html',
//   styleUrls: ['./edit-doctor.component.css']
// })
// export class EditDoctorComponent implements OnInit {
//   doctor: Doctor;
//   imagePreview: string;
//   selectedFile: File | null = null;
  
//   specialties = ['Nhi khoa', 'Tim mạch', 'Da liễu', 'Nội khoa'];
//   experiences = ['1-3 năm', '3-5 năm', '5-10 năm', 'Trên 10 năm'];

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private doctorService: DoctorService
//   ) { }

//   ngOnInit() {
//     const id = this.route.snapshot.params['id'];
//     this.loadDoctor(id);
//   }

//   loadDoctor(id: string) {
//     this.doctorService.getDoctorById(id).subscribe(
//       (doctor: Doctor) => {
//         this.doctor = doctor;
//         this.imagePreview = doctor.imageUrl;
//       },
//       error => {
//         console.error('Error loading doctor:', error);
//       }
//     );
//   }

//   openFileInput() {
//     document.getElementById('fileInput').click();
//   }

//   onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedFile = file;
//       const reader = new FileReader();
//       reader.onload = () => {
//         this.imagePreview = reader.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   onSubmit() {
//     const formData = new FormData();
//     formData.append('name', this.doctor.name);
//     formData.append('specialty', this.doctor.specialty);
//     formData.append('hospital', this.doctor.hospital);
//     formData.append('address', this.doctor.address);
//     formData.append('experience', this.doctor.experience);
//     formData.append('fee', this.doctor.fee.toString());
//     formData.append('description', this.doctor.description);
    
//     if (this.selectedFile) {
//       formData.append('image', this.selectedFile);
//     }

//     this.doctorService.updateDoctor(this.doctor.id, formData).subscribe(
//       (response) => {
//         alert('Cập nhật thành công');
//         this.router.navigate(['/admin/doctors']);
//       },
//       error => {
//         alert('Lỗi khi cập nhật');
//         console.error(error);
//       }
//     );
//   }
// }
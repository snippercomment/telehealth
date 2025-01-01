import { Injectable} from '@angular/core';

import { BehaviorSubject, map, Observable } from 'rxjs';
import { CreateDoctorDTO, Doctor, UpdateDoctorDTO } from '../../model/doctor.interface';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl=`${environment.apiUrl}api/admin/Doctor`;
  private barUrl= `${environment.apiUrl}api/admin/Doctor`;
  
  constructor(private http: HttpClient ) {
  }
  
  
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl).pipe(
      map(doctors => doctors.map(doctor => ({
        ...doctor,
        imagePath: doctor.imagePath ? `${environment.apiUrl}/${doctor.imagePath}` : null
      })))
    );
  }
  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`).pipe(
      map((doctor) => {
        if (doctor.imagePath) {
          // Base URL của backend
          const baseUrl = `${environment.apiUrl}`; 
          
          // Sửa đường dẫn hình ảnh
          doctor.imagePath = `${baseUrl}/${doctor.imagePath.replace(/\\/g, '/')}`;
        }
        return doctor; // Trả về dữ liệu đã chỉnh sửa
      })
    );
  }
  
  createDoctor(doctorData: CreateDoctorDTO): Observable<Doctor> {
    const formData = new FormData();
    
    // Append all text fields
    formData.append('name', doctorData.name);
    formData.append('email', doctorData.email);
    formData.append('password', doctorData.password);
    formData.append('specialty', doctorData.specialty);
    formData.append('hospital', doctorData.hospital);
    formData.append('address', doctorData.address);
    formData.append('experience', doctorData.experience);
    formData.append('consultationFee', doctorData.consultationFee.toString());
    formData.append('description', doctorData.description);

    // Append image if exists
    if (doctorData.image) {
      formData.append('image', doctorData.image);
    }

    return this.http.post<Doctor>(this.apiUrl, formData);
  }
  updateDoctor(id: number, formData: FormData): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/${id}`, formData);
  }
  deleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  searchDoctor(term: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/search?term=${term}`);
  }


  // Lấy danh sách bác sĩ cho trang chủ
  getHomeDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.barUrl);
  }

  // Lấy chi tiết bác sĩ
  getDoctorDetails(id: number): Observable<Doctor> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(doctor => ({
        ...doctor,
        imagePath: doctor.imagePath ? 
          `${environment.apiUrl}/${doctor.imagePath}` : 
          'assets/images/default-doctor.png'
      }))
    );
  }
  // // Tìm kiếm bác sĩ
  // searchDoctors(query: string): Observable<Doctor[]> {
  //   return this.http.get<Doctor[]>(`${this.barUrl}/search?query=${query}`);
  // }
}
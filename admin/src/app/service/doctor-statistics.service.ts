import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DoctorStatisticsService {
    private apiUrl = `${environment.apiUrl}api/admin/DoctorStatistics`;
  constructor(private http: HttpClient) { }

  // Phương thức lấy thống kê bác sĩ
  getDoctorStatistics(): Observable<any> {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}`, { headers });
  }
}

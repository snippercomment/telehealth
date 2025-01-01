
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppStatisticsService {
  private apiUrl = `${environment.apiUrl}api/admin/AppStatistics`;

  constructor(private http: HttpClient) { }

 
  
// API để lấy thống kê doanh thu
getRevenueStatistics(): Observable<any> {
  const token = localStorage.getItem('token'); // Lấy token từ localStorage
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/revenue`, { headers });
}

// API thống kê doanh thu theo thời gian (Ngày, Tháng, Năm)
getRevenueByPeriod(period: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/revenue/${period}`, { headers });
}
exportRevenueToPdf() {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.apiUrl}/revenue/export-pdf`, {
    headers,
    responseType: 'blob',
  });
}

}
  
  


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}api/admin/Statistics`;

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}`, { headers });
  }
  getDetailedStatistics(period: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/detailed?period=${period}`, { headers });
  }
  
  
  
  getAppointmentStatusStatistics(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/appointments/status`, { headers });
  }

  
// API thống kê doanh thu từ ngày đến ngày
getRevenueStatistics(startDate: string, endDate: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/revenue?startDate=${startDate}&endDate=${endDate}`, { headers });
}

// API thống kê doanh thu theo thời gian (Ngày, Tháng, Năm)
getRevenueByPeriod(period: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/revenue/${period}`, { headers });
}
}
  
  

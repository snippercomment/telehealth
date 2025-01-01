// services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentDTO, AppointmentResponse, Payment } from '../../model/appointment.model';
import * as signalR from '@microsoft/signalr';




@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
    private hubConnection: signalR.HubConnection;
    private apiUrl = `${environment.apiUrl}api/admin/Appointment`;

     constructor(private http: HttpClient) {
        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${environment.apiUrl}myHub`)
          .build();
      }
    
      public startConnection = async () => {
        try {
          await this.hubConnection.start();
          console.log('SignalR connection started');
        } catch (err) {
          console.error('Error while starting SignalR connection:', err);
          setTimeout(() => this.startConnection(), 5000);
        }
      }
      public on(eventName: string, callback: (data: any) => void): void {
        this.hubConnection.on(eventName, callback);
      }
  
    bookAppointment(appointmentData: any): Observable<any> {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Create headers with authorization token
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
  
      return this.http.post(`${this.apiUrl}/book`, appointmentData, { headers });
    }
  
    getMyAppointments(): Observable<Appointment[]> {
      const token = localStorage.getItem('token'); // Lấy token từ localStorage
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Thiết lập header Authorization với token
    
      return this.http.get<Appointment[]>(`${this.apiUrl}/my-appointments`, { headers }); // Gửi yêu cầu GET với header
    }
    
   // Lấy tất cả lịch hẹn (cho Admin)
  getAllAppointments(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${this.apiUrl}/all`, { headers });
  }
  approveAppointment(id: number): Observable<any> {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Thiết lập headers
    return this.http.put<any>(`${this.apiUrl}/approve/${id}`, null, { headers }); // Truyền headers qua options
  }
  
  
    // Lấy lịch hẹn theo bác sĩ
  getDoctorAppointments(doctorId: number): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/${doctorId}`, { headers });
  }

  updateExaminationStatus(appointmentId: number, status: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/update-status/${appointmentId}`, 
      { status},
      { headers }
    );
  }
  cancelAppointment(id: number, reason: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/cancel-appointment/${id}`, 
      { reason: reason }, 
      { headers }
    );
  }
 // Xóa lịch hẹn với token
 deleteAppointment(appointmentId: number): Observable<void> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete<void>(`${this.apiUrl}/delete-my-appointment/${appointmentId}`, { headers });
}
  updateMyAppointment(id: number, payload: { NewStatus: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    // Gửi yêu cầu chỉ với status
    return this.http.put(`${this.apiUrl}/update-my-appointment/${id}`, { payload}, { headers });
  }
  makePayment(payment: Payment): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.post(`${this.apiUrl}/payment`, payment, { headers });
  }
  

  // getAppointmentsByStatus(status: string): Observable<Appointment[]> {
  //   const token = localStorage.getItem('token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this.http.get<Appointment[]>(`${this.apiUrl}/byStatus/${status}`, { headers });
  // }
  
  
}
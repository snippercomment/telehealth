import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';


@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private hubConnection: signalR.HubConnection;
  private baseUrl = `${environment.apiUrl}api/admin/Consultation`;
  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}consultationHub`)
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
  // Thiết lập các listener cho các sự kiện


// Phương thức để gửi tin nhắn mới
public sendMessageToGroup(consultationId: number, message: string) {
  this.hubConnection
      .send("SendMessageToGroup", consultationId, message)
      .catch((err) => console.error(err));
}

  // public addNewConsultationListener = (callback: (consultation: any) => void) => {
  //   this.hubConnection.on('NewConsultation', (consultation) => {
  //     callback(consultation);
  //   });
  // }

  // public addNewMessageListener = (callback: (message: any) => void) => {
  //   this.hubConnection.on('NewMessage', (message) => {
  //     callback(message);
  //   });
  // }
// Tạo cuộc tư vấn mới
createConsultation(data: { userName: string, question: string }): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`${this.baseUrl}/create`, data, { headers });
}

// Lấy lịch sử tư vấn của người dùng
getUserConsultationHistory(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.baseUrl}/user-history`, { headers });
}
//  lấy trang thái
getPendingConsultations(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.baseUrl}/pending`, { headers });
}
// trang thái dang tư vấn
getActiveConsultations(): Observable<any> {
  const token = localStorage.getItem('token');  // Lấy token từ localStorage
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get(`${this.baseUrl}/active`, { headers });
}

// lấy lịch sử của bác sĩ
  getDoctorConsultationHistory(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/doctor-history`,{ headers });
  }

  getConsultationDetail(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/detail/${id}`, { headers });
  }
  
  acceptConsultation(consultationId: number): Observable<any> {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post(`${this.baseUrl}/accept/${consultationId}`, {}, { headers });
  }
  
  sendMessage(consultationId: number, fromData: FormData  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/messages/${consultationId}`, fromData, { headers });
  }
  
  endConsultation(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/end/${id}`, {}, { headers });
  }
  
  getConsultationStatus(id: number): Observable<any> {
    const token = localStorage.getItem('token');  // Lấy token từ localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);  // Thêm token vào header
  
    // Gửi yêu cầu GET với token trong header
    return this.http.get(`${this.baseUrl}/status/${id}`, { headers });
  }
  
  
  // getStatusText(status: string): string {
  //   const statusMap = {
  //     'Pending': 'Chờ tư vấn',
  //     'Active': 'Đang tư vấn',
  //     'UserEnded': 'Người dùng kết thúc',
  //     'DoctorEnded': 'Bác sĩ kết thúc',
  //     'Completed': 'Hoàn thành'
  //   };
  //   return statusMap[status as keyof typeof statusMap] || status;
  // }
  // SignalR event listeners
  sendMessageToSignalR(consultationId: number, message: string) {
    this.hubConnection.invoke('SendMessage', consultationId, message)
      .catch(err => console.error('Error sending message via SignalR: ', err));
  }
  
  // onNewMessage(callback: (message: any) => void) {
  //   this.hubConnection.on('NewMessage', callback);
  // }

  // onConsultationAccepted(callback: (data: any) => void) {
  //   this.hubConnection.on('ConsultationAccepted', callback);
  // }

  // onConsultationStatusChanged(callback: (data: any) => void) {
  //   this.hubConnection.on('ConsultationStatusChanged', callback);
  // }
  

}
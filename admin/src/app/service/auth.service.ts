
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginCredentials, LoginResponse } from '../../model/appointment.model';




@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}api/`;

  constructor(private http: HttpClient) { }

  adminLogin(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}Role/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userRole', 'Admin');
          }
        })
      );
  }

  doctorLogin(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}Role/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userRole', 'Doctor');
            if (response.doctorId) {
              localStorage.setItem('doctorId', response.doctorId.toString());
            }
          }
        })
      );
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
  getDoctorId(): string| null {
    return localStorage.getItem('doctorId')
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const userRole = this.getUserRole();
    const doctorId = this.getDoctorId
    return !!token && !!userRole && !!doctorId;
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('doctorId');
  }
  
}
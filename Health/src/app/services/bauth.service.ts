
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { UserDTO } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BauthService {

  private apiUrl = `${environment.apiUrl}api/auth`; 
  private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient, private router: Router) {
    let storedUser: UserDTO  | null = null;
  
    if (this.isBrowser()) {
      const userData = localStorage.getItem('currentUser');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        try {
          storedUser = JSON.parse(userData) as UserDTO; // Chỉ parse khi dữ liệu hợp lệ
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
      
    }
  
    this.currentUserSubject = new BehaviorSubject<UserDTO | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }
  
  /**
   * Kiểm tra môi trường trình duyệt
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        // Lưu token vào localStorage
        localStorage.setItem('token', response.token);
        // Lưu thông tin người dùng và role vào localStorage
        const userData = {
          id: response.id,
          fullName: response.fullName,
          email: response.email,
          role: response.role  
        };
        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }
  getCurrentUser() {
    return this.currentUserSubject.value;
  }
  

  setCurrentUser(user: any) {
    
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
      this.currentUserSubject.next(user);
    } catch (e) {
      console.error('Error saving user data to localStorage');
    }
    if (user?.profileImage) {
      user.avatarUrl = `data:image/jpeg;base64,${user.profileImage}`;
    }
   
  }
  // Phương thức mới để cập nhật thông tin user
  getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  updateProfile(user:UserDTO): void {

    localStorage.setItem('currentUser', JSON.stringify(user));
    
    this.currentUserSubject.next(user);
  }
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; role: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response) {
            // Lưu token và role vào localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
  
            // Gọi setCurrentUser nếu cần xử lý thêm user data
            this.setCurrentUser(response);
          }
        })
      );
  }
  

    logout() {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('role'),
      localStorage.removeItem('user')
      this.currentUserSubject.next(null);
      
  }
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
 
}
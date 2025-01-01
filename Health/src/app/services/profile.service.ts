import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProfileUpdateRequest, UserDTO } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'https://localhost:5001/api/auth';

  constructor(private http: HttpClient) {}


  getAllProfiles(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/profile`);
  }
  getProfileById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.baseUrl}/profile/${id}`);
  }
  updateProfile(id: number, formData: FormData): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.baseUrl}/profile/update/${id}`, formData);
  }
}


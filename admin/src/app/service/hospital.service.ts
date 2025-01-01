import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { Hospital } from '../../model/hospital.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  
  private apiUrl = `${environment.apiUrl}api/admin/Hospital`; 

  constructor(private http: HttpClient) {}

  // Phương thức dùng chung
  getAllHospitals(): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(this.apiUrl);
  }

  getHospitalById(id: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
  }

  // Các phương thức cho trang admin
  addHospital(hospitalData: FormData): Observable<Hospital> {
    return this.http.post<Hospital>(this.apiUrl, hospitalData);
  }

  updateHospital(id: number, hospital: FormData): Observable<Hospital> {
    return this.http.put<Hospital>(`${this.apiUrl}/${id}`, hospital);
  }

  deleteHospital(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
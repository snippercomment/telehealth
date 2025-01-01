import { Injectable } from '@angular/core';
import { Doctor, MedicalService } from '../models/doctor.model';


@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private doctors: Doctor[] = [
    {
      id: 1,
      name: 'Bác sĩ: Nguyễn Trường Mạnh',
      specialty: 'Sức khoẻ định kỳ',
      description: 'Tư vấn Online qua TeleHealth'
    }
  ];

  private services: MedicalService[] = [
    {
      id: 1,
      name: 'Tư vấn ngay online 01 lần',
      description: 'Lịch khám: Hẹn khám',
      price: 300000,
      appointmentType: 'online'
    }
  ];

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getServices(): MedicalService[] {
    return this.services;
  }
}

// code lấy backend
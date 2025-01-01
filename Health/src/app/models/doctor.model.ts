// src/app/features/consultation/models/doctor.model.ts
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  description: string;
}
  // src/app/features/consultation/models/booking.model.ts
  export interface MedicalService {
    id: number;
    name: string;
    description: string;
    price: number;
    appointmentType: string;
}
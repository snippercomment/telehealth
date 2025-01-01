// core/models/appointment.model.ts
export interface Appointment {
  id: number;
  patientName: string;
  patientPhone: string;
  gender: string;
  appointmentDate: string;
  appointmentTime: string;
  describe: string;
  doctorId: number;
  status?: string;
  cancellationReason?: string;
  approvalStatus?: string;
  examinationStatus?:string;
  
  doctor?: {
      id: number;
      name: string;
      specialty: string;
      consultationFee: number; 
  };
  user?: {
      id: number;
      email: string;
      phoneNumber: string;
  };
  isApproved: boolean;
}
export interface AppointmentResponse {
  message: string;
}

// export interface CancelDTO {
//   reason: string;
// }
// models/login.interface.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  doctorId: number;
}


export interface AppointmentDTO {
  patientName: string;
  patientPhone: string;
  gender: string;
  appointmentDate: string;
  appointmentTime: string;
  describe: string;
  doctorId: number;
}

export interface AppointmentDT {
  status:string;
}
export interface Payment {
  AppointmentID: number;
  CardNumber: string;
  ExpirationDate: string;
}

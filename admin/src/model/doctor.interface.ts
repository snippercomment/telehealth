// doctors/models/doctor.model.ts
export interface Doctor {
  id: number;
  name: string;
  email: string;
  password: string;
  specialty: string;
  hospital: string;
  experience: string;
  consultationFee: number;
  imagePath: string | null;
  description: string;
  address: string;
}
  

export interface Speciality {
    id: number;
    name: string;
  }

  export interface CreateDoctorDTO {
    name: string;
    email: string;
    password: string;
    specialty: string;
    hospital: string;
    address: string;
    experience: string;
    consultationFee: number;
    description: string;
    image?: File;
  }

  export interface UpdateDoctorDTO {
    [key: string]: any; 
    name: string;
    specialty: string;
    hospital: string;
    address: string;
    experience: string;
    consultationFee: number;
    description: string;
    image?: File;
  }
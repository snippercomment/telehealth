// models/hospital.interface.ts
export interface Hospital {
  id: number;
  name: string;
  address: string;
  openTime: string;  // Mở cửa
  closeTime: string; // Đóng cửa
  phoneNumber: string;
  imagePath: string;
  description: string;
  specialties?: string[];
}

  export interface EditHospital {
    id: number;
    name: string;
    address: string;
    openTime: string;    // Thời gian mở cửa
    closeTime: string;   // Thời gian đóng cửa
    phone:string;
    description: string;
    departments: string[];
    image: string;
  }
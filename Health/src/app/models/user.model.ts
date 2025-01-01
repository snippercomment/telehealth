
// src/app/models/user.model.ts
export interface UserDTO {
  id: number,
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  address: string;
  gender: string;
  birthDate: string;
  profileImage?: string;
  }
// export interface RegisterRequest {
//     email: string;
//     hoTen: string;
//     matKhau: string;

export interface ProfileUpdateRequest {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  gender: string;
  birthDate: string;
  imageFile?: File;
}
// }

// export interface LoginResponse {
//   email: string;
//   hoTen: string;
//   tinhThanhPho: string;
//   quanHuyen: string;
//   phuongXa: string;
//   diaChi: string;
//   ngaySinh: Date;
//   soDienThoai: string;
//   matKhau: string;
//   gioiTinh: string;
// }
export interface MenuItem {
  name: string;
  link?: string;
  children?: MenuItem[];
}



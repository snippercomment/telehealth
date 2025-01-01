import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { DoctorService } from '../../service/doctor.service';

@Component({
  selector: 'app-dashboarddoctor',
  standalone: true,
  imports: [RouterOutlet,CommonModule,RouterLink],
  providers:[DoctorService],
  templateUrl: './dashboarddoctor.component.html',
  styleUrl: './dashboarddoctor.component.css'
})
export class DashboarddoctorComponent {
  doctor: string = ''; 
  isDropdownOpen = false;
  isExpanded: boolean = true;
  currentDoctorId: number;
  isSidebarOpen = false;
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  constructor(
   private doctorService: DoctorService,
    private router: Router
  ) {
    // Lấy ID bác sĩ từ localStorage hoặc nơi lưu trữ sau khi đăng nhập
    this.currentDoctorId = Number(localStorage.getItem('doctor')); 
    
    // Lấy thông tin bác sĩ từ API
    if (this.currentDoctorId) {
      this.doctorService.getDoctorById(this.currentDoctorId).subscribe({
        next: (doctor) => {
          this.doctor = doctor.name;
        },
        error: (error) => {
          console.error('Error fetching doctor info:', error);
        }
      });
    }
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  logout(): void {
  // Xóa ID bác sĩ khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('doctorId'); // Xóa token nếu có
    this.router.navigate(['/loginDoctor']);
  }
}

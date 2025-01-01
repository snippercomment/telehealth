import { Component } from '@angular/core';
import { DoctorStatisticsService } from '../../service/doctor-statistics.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.css'
})
export class AppointmentManagementComponent {
  
  doctorStats: any = null;

  constructor(private doctorStatisticsService: DoctorStatisticsService) { }

  ngOnInit(): void {
    this.getDoctorStatistics();
  }

  // Lấy doctorId từ backend hoặc AuthService (ví dụ ở đây là từ backend)
  getDoctorStatistics(): void {
    this.doctorStatisticsService.getDoctorStatistics().subscribe(
      (data) => {
        this.doctorStats = data;
      },
      (error) => {
        console.error('Error fetching doctor statistics:', error);
      }
    );
  }
  formatDate(date: string): string {
    const [day, month, yearTime] = date.split('/');
    const [year, time] = yearTime.split(' ');
    return `${day}/${month}/${year} ${time}`;
  }
}

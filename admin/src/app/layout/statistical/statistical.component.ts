import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../service/statistics.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-statistical',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './statistical.component.html',
  styleUrl: './statistical.component.css'
})
export class StatisticalComponent implements OnInit {
  statistics: any; // Tổng quan
  detailedStatistics: any; // Chi tiết theo thời gian
  appointmentStatusStats: any; // Thống kê trạng thái
  selectedPeriod: string = 'week'; // Mặc định là tuần

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.fetchStatistics();
    this.fetchDetailedStatistics();
    this.fetchAppointmentStatusStats();
  }

  fetchStatistics(): void {
    this.statisticsService.getStatistics().subscribe(
      (data) => {
        this.statistics = data;
      },
      (error) => {
        console.error('Error fetching statistics:', error);
      }
    );
  }

  fetchDetailedStatistics(): void {
    this.statisticsService.getDetailedStatistics(this.selectedPeriod).subscribe(
      (data) => {
        this.detailedStatistics = data;
      },
      (error) => {
        console.error('Error fetching detailed statistics:', error);
      }
    );
  }

  fetchAppointmentStatusStats(): void {
    this.statisticsService.getAppointmentStatusStatistics().subscribe(
      (data) => {
        this.appointmentStatusStats = data;
      },
      (error) => {
        console.error('Error fetching appointment status statistics:', error);
      }
    );
  }

  onPeriodChange(): void {
    this.fetchDetailedStatistics();
  }
}

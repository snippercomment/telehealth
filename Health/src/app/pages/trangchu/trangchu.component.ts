import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { DoctorService } from '../../../../../admin/src/app/service/doctor.service';
import { Doctor } from '../../../../../admin/src/model/doctor.interface';




interface Specialty{
  name: string;
  icon: string;
}


@Component({
  selector: 'app-trangchu',
  standalone: true,
  imports: [CommonModule,MatIcon,RouterLink],
  templateUrl: './trangchu.component.html',
  styleUrl: './trangchu.component.css'
})
export class TrangchuComponent {
  doctors: Doctor[] = [];
  displayedDoctors: Doctor[] = [];
  isLoading = false;
  error = '';
  private itemsPerPage = 8;

  constructor(private doctorService: DoctorService) { }

  ngOnInit(): void {
    this.loadDoctors();
  }

  
  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.displayedDoctors = this.doctors.slice(0, this.itemsPerPage);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bác sĩ';
        this.isLoading = false;
        console.error('Error loading doctors:', error);
      }
    });
  }

  loadMore(): void {
    const currentLength = this.displayedDoctors.length;
    const nextDoctors = this.doctors.slice(currentLength, currentLength + this.itemsPerPage);
    this.displayedDoctors = [...this.displayedDoctors, ...nextDoctors];
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-doctor.png';
  }
 
  specialties: Specialty[] = [
    {
      name: 'Tâm Lý',
      icon: '../../../assets/icon_pro/1.png'
    },
    {
      name: 'Bác Sĩ Gia Đình',
      icon: '../../../assets/icon_pro/2.png'
    },
    {
      name: 'Ngoại Thần Kinh',
      icon: '../../../assets/icon_pro/3.png'
    },
    {
      name: 'Ngoại Tiêu Hoá',
      icon: '../../../assets/icon_pro/4.png'
    },
    {
      name: 'Da Liễu',
     icon: '../../../assets/icon_pro/5.png'
    },
    {
      name: 'Tai Mũi Họng',
     icon: '../../../assets/icon_pro/6.png'
    },
    {
      name: 'Nội Cơ Xương Khớp',
     icon: '../../../assets/icon_pro/7.png'
    },{
      name: 'Lão Khoa',
     icon: '../../../assets/icon_pro/8.png'
    }
    ,{
      name: 'Nội Thần Kinh',
     icon: '../../../assets/icon_pro/9.png'
    },{
      name: 'Nội Hô Hấp',
     icon: '../../../assets/icon_pro/10.png'
    }
  ];

  
  
}

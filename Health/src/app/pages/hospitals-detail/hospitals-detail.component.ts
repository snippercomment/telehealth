import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { RouterLink } from '@angular/router';
import { HospitalService } from '../../../../../admin/src/app/service/hospital.service';
import { Hospital } from '../../../../../admin/src/model/hospital.model';



@Component({
  selector: 'app-hospitals-detail',
  standalone: true,
  imports: [ FormsModule ,CommonModule,RouterLink],
  templateUrl: './hospitals-detail.component.html',
  styleUrl: './hospitals-detail.component.css'
})
export class HospitalsDetailComponent implements OnInit {
  
  searchTerm: string = '';
  
  hospitals: Hospital[] = [];
  filteredHospitals: any[] = [];
  constructor(private hospitalService: HospitalService) { }

  ngOnInit(): void {
    this.loadHospitals();
    this.hospitalService.getAllHospitals().subscribe(data => {
      this.hospitals = data;
      this.filteredHospitals = data; // Ban đầu hiển thị tất cả bệnh viện
    });
  }
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (term) {
      this.filteredHospitals = this.hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(term) ||
        hospital.address.toLowerCase().includes(term)
      );
    } else {
     
      this.filteredHospitals = [...this.hospitals];
    }
  }
  loadHospitals(): void {
    this.hospitalService.getAllHospitals().subscribe(
      (data) => {
        this.hospitals = data.map(hospital => ({
          ...hospital,
          
          image: hospital.imagePath || 'assets/images/default-hospital.png' 
        }));
      },
      error => console.error('Error:', error)
    );
  }
  onBookAppointment(hospitalId: number): void {
    console.log(`Booking appointment for hospital ${hospitalId}`);
  }

}

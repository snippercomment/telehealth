import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { DoctorService } from '../../../../../admin/src/app/service/doctor.service';
import { Doctor } from '../../../../../admin/src/model/doctor.interface';



@Component({
  selector: 'app-datlichen',
  standalone: true,
  imports: [
    CommonModule,MatButtonModule,MatIconModule,MatCardModule,ReactiveFormsModule,RouterLink],
  templateUrl: './datlichen.component.html',
  styleUrl: './datlichen.component.css'
})
export class DatlichenComponent implements OnInit {
  displayedDoctors: Doctor[] = [];
  isLoading = false;
  selectedSpecialty: string = '';
  doctors: Doctor[] = [];
  private itemsPerPage = 8;
  error = '';
  // filteredDoctors: Doctor[] = [];
  filterForm: FormGroup;
  specialties = ['Tâm Lý', 'Bác Sĩ Gia Đình', 'Ngoại Thần Kinh', 'Ngoại Tiêu Hoá', 'Da Liễu','Tai Mũi Họng','Nội Cơ Xương Khớp','Lão Khoa','Nội Thần Kinh','Nội Hô Hấp'];
 
  constructor(private fb: FormBuilder,private router: Router,private doctorService: DoctorService) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      specialties: this.fb.group(
        this.specialties.reduce((acc, specialty) => ({...acc, [specialty]: false}), {})
      ),
      minRating: [0]
    });
  }

  ngOnInit() {
     this.loadDoctors();
  
    // this.filteredDoctors = this.doctors;

    // Theo dõi thay đổi trong form để lọc bác sĩ
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filterDoctors();
      });
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
  bookAppointment(doctorId: number): void {
    this.router.navigate(['/appointment-link', doctorId]);
  }

  filterDoctors() {
    const formValues = this.filterForm.value;
    const searchTerm = formValues.searchTerm.toLowerCase();
    const selectedSpecialties = Object.entries(formValues.specialties)
      .filter(([_, selected]) => selected)
      .map(([specialty]) => specialty);
  
    this.displayedDoctors = this.doctors.filter(doctor => {
      // Lọc theo từ khóa tìm kiếm
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) ||
                            doctor.specialty.toLowerCase().includes(searchTerm);
  
      // Lọc theo chuyên khoa
      const matchesSpecialty = selectedSpecialties.length === 0 || 
                               selectedSpecialties.includes(doctor.specialty);
  
      return matchesSearch && matchesSpecialty;
    });
  }
//   // Thêm method để xử lý click
//   viewDoctorDetails(doctorId: number): void {
//   this.router.navigate(['/appointment-link', doctorId]);
// }

}

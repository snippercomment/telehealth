import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HospitalService } from '../../../../../admin/src/app/service/hospital.service';
import { Hospital } from '../../../../../admin/src/model/hospital.model';

@Component({
  selector: 'app-hospital-list',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './hospital-list.component.html',
  styleUrl: './hospital-list.component.css'
})
export class HospitalListComponent implements OnInit {
  hospitalInfo!: Hospital;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private hospitalService: HospitalService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadHospitalDetails(id);
    });
  }

  private loadHospitalDetails(id: number): void {
    this.hospitalService.getHospitalById(id).subscribe({
      next: (hospital) => {
        this.hospitalInfo = hospital;
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
        this.loading = false;
        console.error('Error loading hospital details:', error);
      }
    });
  }
  
}

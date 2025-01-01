import { ProfileService } from './../../../../../Health/src/app/services/profile.service';
import { UserDTO } from './../../../../../Health/src/app/models/user.model';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';


// interface Patient {
//   id: number;
//   avatar: string;
//   name: string;
//   email: string;
//   phone: string;
//   gender: string;
//   birthDate: string;
//   address: string;
//   isLocked: boolean;
// }


@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule,FormsModule, MatIconModule,MatTableModule,HttpClientModule,RouterLink],
  providers: [
    ProfileService// Đăng ký service ở đây
  ],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent {
  profiles: UserDTO[] = [];
  displayedColumns: string[] = ['id', 'profileImage', 'fullName', 'email', 'phoneNumber', 'address', 'gender', 'birthDate', 'actions'];
  currentPage = 1;
  itemsPerPage = 3;
  searchTerm = ''; // Giá trị tìm kiếm
  filteredProfiles: UserDTO[]=[];
  constructor(private profileService: ProfileService, private router: Router) {}

  ngOnInit() {
    this.loadProfiles();
  }
  
  loadProfiles() {
    this.profileService.getAllProfiles().subscribe(
      (data) => {
        this.profiles = data.map(profile => ({
          ...profile,
          profileImage: profile.profileImage || 'assets/icons/avatar.jpg'
        }));
        this.filteredProfiles = [...this.profiles]; // Khởi tạo dữ liệu lọc
      },
      error => console.error('Error loading profiles:', error)
    );
  }
  
  
  search() {
    if (!this.searchTerm.trim()) {
      // Nếu không có từ khóa tìm kiếm, hiển thị toàn bộ hồ sơ
      this.filteredProfiles = [...this.profiles];
      this.currentPage = 1; // Reset về trang đầu tiên
      return;
    }
  
    const term = this.searchTerm.toLowerCase();
    this.filteredProfiles = this.profiles.filter(profile =>
      profile.fullName?.toLowerCase().includes(term) ||
      profile.email?.toLowerCase().includes(term)
    );
    this.currentPage = 1; // Reset về trang đầu tiên sau khi tìm kiếm
  }
  
    // Tổng số trang
  get totalPages(): number {
    return Math.ceil(this.filteredProfiles.length / this.itemsPerPage);
  }
  
  // Lấy dữ liệu hiển thị cho trang hiện tại
  get paginatedProfiles(): UserDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProfiles.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  
  // Chuyển trang
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
    
  
}

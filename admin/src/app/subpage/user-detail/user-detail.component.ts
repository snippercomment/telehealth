import { MatCardModule } from '@angular/material/card';
import { Component } from '@angular/core';
import { UserDTO } from '../../../../../Health/src/app/models/user.model';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../../../Health/src/app/services/profile.service';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [MatIconModule,CommonModule,MatCardModule,MatListModule,MatProgressSpinnerModule,HttpClientModule],
  providers: [
    ProfileService// Đăng ký service ở đây
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {
  user!: UserDTO;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private location: Location,

  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfile(+id);
    }
  }

  loadProfile(id: number) {
    this.isLoading = true;
    this.profileService.getProfileById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải thông tin người dùng';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  goBack() {
    this.location.back(); 

  }
}

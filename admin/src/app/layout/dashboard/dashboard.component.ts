import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet,RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
   isExpanded: boolean = true;
   isSidebarHidden = false;

   toggleSidebar() {
     this.isSidebarHidden = !this.isSidebarHidden;
   }
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      // Nếu không có token, chuyển hướng về trang login tương ứng
      if (expectedRole === 'Admin') {
        this.router.navigate(['/admin/login']);
      } else if (expectedRole === 'Doctor') {
        this.router.navigate(['/doctor/loginDoctor']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }
    


    // if (expectedRole && userRole !== expectedRole) {
    //   // Nếu role không khớp, chuyển hướng đến trang unauthorized
    //   this.router.navigate(['/unauthorized']);
    //   return false;
    // }

    return true;
  }
}
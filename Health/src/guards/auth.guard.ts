import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { BauthService } from '../app/services/bauth.service';



@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private bauthService: BauthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.bauthService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: window.location.pathname }
      });
      return false;
    }
  }
}
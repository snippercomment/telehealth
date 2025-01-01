import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { approutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(approutes), provideClientHydration(), provideAnimationsAsync(),provideHttpClient(), JwtHelperService,  // Thêm JwtHelperService vào đây
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter: () => localStorage.getItem('token'), // Cung cấp cách lấy token từ localStorage
        allowedDomains: ['localhost:5001'], // Thêm các domain cho phép gọi API
        disallowedRoutes: ['localhost:5001/api/auth/'] // Thêm các route không cần token
      }
    } ]
};

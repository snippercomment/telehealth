import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { LoginCredentials, LoginResponse } from '../../../model/appointment.model';

@Component({
  selector: 'app-login-doctor',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './login-doctor.component.html',
  styleUrl: './login-doctor.component.css'
})
export class LoginDoctorComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
   successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
  
    if (this.loginForm.valid) {
      this.isLoading = true;
  
      this.authService.doctorLogin(this.loginForm.value).subscribe({
        next: () => {
          this.successMessage = 'Đăng nhập thành công! Chuyển hướng...';
          this.errorMessage = '';
  
          setTimeout(() => {
            this.router.navigate(['/doctor/appointment-management']);
          }, 1000);
        },
        error: () => {
          this.errorMessage = 'Email hoặc mật khẩu không đúng';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin!';
    }
  }
  

  // navigateToAdminLogin(): void {
  //   this.router.navigate(['/admin/login']);
  // }
}

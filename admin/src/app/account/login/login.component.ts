import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; 

import { Router, RouterLink } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,HttpClientModule  ,RouterLink],
  
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
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

      this.authService.adminLogin(this.loginForm.value).subscribe({
        next: () => {
          this.successMessage = 'Đăng nhập thành công! Chuyển hướng...';
          this.errorMessage = '';
          setTimeout(() => {
            this.router.navigate(['/admin/Statistical']);
          }, 1000); // Giả lập delay chuyển hướng
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
      this.errorMessage = 'Vui lòng nhập đúng thông tin đăng nhập!';
    }
  }

  navigateToDoctorLogin(): void {
    this.router.navigate(['/loginDoctor']);
  }
}

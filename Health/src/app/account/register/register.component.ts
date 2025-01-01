import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatSelectModule} from '@angular/material/select';
import {provideNativeDateAdapter} from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { BauthService } from '../../services/bauth.service';




@Component({
  selector: 'app-register',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule, 
  
    RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string = '';  

  constructor(
    private fb: FormBuilder,
    private bauthService: BauthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
  
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else if (field === 'confirmPassword') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  onSubmit() {
    if (this.registerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const registerData = {
        fullName: this.registerForm.get('fullName')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        confirmPassword: this.registerForm.get('confirmPassword')?.value

      };

      this.bauthService.register(registerData).subscribe({
        next: (response) => {
          // Đăng ký thành công, điều hướng đến trang login
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Registration failed', error);
          
          // Lấy thông báo lỗi từ backend và hiển thị
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;  // Lưu thông báo lỗi
          } else {
            this.errorMessage = 'Có lỗi xảy ra, vui lòng thử lại sau.';
          }
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}


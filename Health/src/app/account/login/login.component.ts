import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { BauthService } from '../../services/bauth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterLink,MatIcon],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm : FormGroup;
  errorMessage: string = '';
  hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bauthService: BauthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.bauthService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this.bauthService.login(loginData).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Đăng nhập thất bại';
        }
      });
    }
  }
}

import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-lienhe',
  standalone: true,
  imports: [MatCardModule,
    MatButtonModule,
    MatIconModule,RouterLink,CommonModule],
  templateUrl: './lienhe.component.html',
  styleUrl: './lienhe.component.css'
})
export class LienheComponent {
  
  title = 'LIÊN HỆ VỚI CHÚNG TÔI';
  address = '69/68 Đ. Đặng Thuỳ Trâm, Phường 13, Bình Thạnh, Hồ Chí Minh 70000';
  phone = 'HOTLINE : 0923124367';
  email = 'Email: telehealth123@gmail.com';
  
}

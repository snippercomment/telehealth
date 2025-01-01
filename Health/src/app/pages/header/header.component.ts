import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import {MatMenuModule} from '@angular/material/menu';
import { MenuItem} from '../../models/user.model';
import { Observable, of } from 'rxjs';
import { BauthService } from '../../services/bauth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,MatIcon,MatMenuModule,RouterLink,RouterOutlet],
  
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit {

    menuItems: MenuItem[] = [
      { name: 'TRANG CHỦ', link: '/home' },
      { 
        name: 'Y TẾ',
        children: [
          { name: 'Dịch vụ', link: '/services' },
          { name: 'Đặt khám từ xa', link: '/appointment' },
       
          
        ]
      },
      { name: 'BỆNH VIỆN', link: '/hospitals-detail' },
      { name: 'LIÊN HỆ VỚI CHÚNG TÔI', link: '/about' }
    ];
  currentUser: any = null;
  showDropdown: boolean = false;
  showSpecialties = false;
  
  constructor(
    private bauthService: BauthService,
    private router: Router,

  ) {
    
  }
 
  ngOnInit() {
    this.bauthService.currentUser$.subscribe(user => {
      this.showDropdown = !!user; 
      this.currentUser = user;
      
    });
    
    
    
  }
  

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  


  logout() {
  this.bauthService.logout();
  this.router.navigate(['/home']); 
  }

 
  
  
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { BauthService } from '../../services/bauth.service';

interface MedicalCenter {
  id: number;
  title: string;
  imageUrl: string;
  
}
interface Feature {
  icon: string;
  title: string;
  description: string;
}
interface Statistic {
  value: string;
  label: string;
  suffix?: string;
}

@Component({
  selector: 'app-dichvu',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './dichvu.component.html',
  styleUrl: './dichvu.component.css',
  animations: [
    trigger('countAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]

})
export class DichvuComponent {
  
  centers: MedicalCenter[] = [
    {
      id: 1,
      title: 'Khám sức khoẻ định kỳ',
      imageUrl: '../../../assets/banner2.jpg',
      
    },
    {
      id: 2,
      title: 'Phòng Khám Chỉnh Hình',
      imageUrl: '../../../assets/banner3.jpg',
      
    },
    {
      id: 3,
      title: 'Phòng Khám Tim Mạch',
      imageUrl: '../../../assets/banner4.jpg',
      
    },
    {
      id: 4,
      title: 'Kiểm Tra Miễn Dịch',
      imageUrl: '../../../assets/banner5.jpg',
      
    }
  ];

  navigateToCenter(link: string): void {
    // Implement navigation logic here
    console.log('Navigating to:', link);
  }
  features: Feature[] = [
    {
      icon: 'virus',
      title: 'Chẩn đoán Miễn Dịch',
      description: 'Chúng tôi có đội ngũ bác sĩ chuyên môn cao trong việc phát hiện và chẩn đoán Bệnh Miễn Dịch chính xác cao.'
    },
    {
      icon: 'shield',
      title: 'Bảo hiểm',
      description: 'Đồng hành cùng các gói bảo hiểm chính tử các đối tác thương hiệu lớn và uy tín trên toàn quốc.'
    },
    {
      icon: 'medical',
      title: 'Hỗ trợ y tế',
      description: 'Sẵn sàng hỗ trợ mọi thắc mắc của khách hàng trong quá trình khám bệnh.'
    }
  ];
  statistics: Statistic[] = [
    {
      value: '99',
      label: 'Phản hồi tích cực',
      suffix: '%'
    },
    {
      value: '2,300',
      label: 'Bệnh Nhân tin tưởng',
      suffix: '+'
    },
    {
      value: '43',
      label: 'Bác sĩ chuyên nghiệp'
    }
  ];

  currentUser: any = null;
  showDropdown: boolean = false;
  
  constructor(
    private bauthService: BauthService,
    private router: Router
  ) {
    
  }
 
  



  

  // ngOnInit() {
  //   this.animateNumbers();
  // }

  // private animateNumbers() {
  //   this.statistics.forEach(stat => {
  //     const endValue = parseInt(stat.value.replace(/,/g, ''));
  //     this.animateValue(stat, 0, endValue, 20000);
  //   });
  // }

  // private animateValue(stat: Statistic, start: number, end: number, duration: number) {
  //   const range = end - start;
  //   const increment = end > start ? 1 : -1;
  //   const stepTime = Math.abs(Math.floor(duration / range));
  //   let current = start;
  //   const timer = setInterval(() => {
  //     current += increment;
  //     stat.value = current.toLocaleString() + (stat.suffix || '');
  //     if (current === end) {
  //       clearInterval(timer);
  //     }
  //   }, stepTime);
  // }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';


interface Security {
  id: string;
  title: string;
  content?: string;
  items?: string[];
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [MatCardModule,
    MatExpansionModule,CommonModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css'
})
export class SecurityComponent {
  pageTitle = 'Chính sách bảo mật';
  security:Security[] = [
    {
      id: 'intro',
      title: '1. Giới thiệu',
      content: ' Chính sách bảo mật này đặt ra các nguyên tắc và quy định để bảo vệ thông tin cá nhân và sức khỏe của người dùng trong TeleHealth. Chúng tôi cam kết đảm bảo rằng mọi dữ liệu được thu thập và xử lý một cách an toàn và hợp pháp.'
    },
    {
      id: 'collection',
      title: '2. Mục đích sử dụng dữ liệu',
      items: [
        'Để cung cấp dịch vụ chăm sóc sức khỏe từ xa.',
        'Để cải thiện và cá nhân hóa trải nghiệm của người dùng.',
        'Để thông báo cho người dùng về các thông tin liên quan đến sức khỏe và cuộc hẹn.'
      ]
    },
    {
      id: 'security',
      title: '3. Bảo mật thông tin',
      items: [
        'Mã hóa dữ liệu: Tất cả thông tin nhạy cảm sẽ được mã hóa khi lưu trữ và truyền tải.',
        'Quyền truy cập: Chỉ những Quản trị viên và người dùng được ủy quyền mới có quyền truy cập vào thông tin cá nhân và hồ sơ sức khỏe.',
        'Chính sách bảo mật: Tất cả Quản trị viên  đều phải tuân thủ chính sách bảo mật của TeleHealth.'
        
      ]
    },
    {
      id: 'sharing',
      title: '4. Chia sẻ thông tin',
      items: [
        'Chúng tôi sẽ không bán hoặc cho thuê thông tin cá nhân của người dùng cho bên thứ ba.',
        'Chúng tôi có thể chia sẻ thông tin của bạn khi có yêu cầu từ cơ quan nhà nước có thẩm quyền.'
      ]
    },
    {
      id: 'rights',
      title: '6. Quyền của Bệnh nhân',
      content: 'Bệnh nhân có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình.'
    },
    {
      id: 'contact',
      title: '7. Liên hệ',
      content: 'Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật của chúng tôi, vui lòng liên hệ với chúng tôi.'
    }
  ];
}

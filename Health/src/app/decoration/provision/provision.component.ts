import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';


interface Provision {
  id: string;
  title: string;
  content?: string;
  items?: string[];
}

@Component({
  selector: 'app-provision',
  standalone: true,
  imports: [MatCardModule,
    MatExpansionModule,CommonModule],
  templateUrl: './provision.component.html',
  styleUrl: './provision.component.css'
})
export class ProvisionComponent {
  pageTitle = 'Điều Khoản Sử Dụng';
  provision:Provision[] = [
    {
      id: 'intro',
      title: '1. Giới thiệu',
      content: ' Chào mừng bạn đến với TeleHealth. Khi bạn sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi sử dụng.'
    },
    {
      id: 'acccept',
      title: '2. Chấp nhận điều khoản',
      content:'Bằng cách truy cập hoặc sử dụng dịch vụ, bạn đồng ý bị ràng buộc bởi các điều khoản này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ.'
    },
    {
      id: 'benefit',
      title: '3. Quyền sử dụng',
      items: [
        'Giấy phép: Chúng tôi cấp cho bạn một giấy phép không độc quyền, không thể chuyển nhượng và có thể thu hồi để sử dụng dịch vụ cho mục đích cá nhân và phi thương mại.',
        'Nghĩa vụ của người dùng: Bạn đồng ý sử dụng dịch vụ theo cách hợp pháp và không vi phạm bất kỳ luật pháp nào.',
        
      ]
    },
    {
      id: 'account',
      title: '4. Tài khoản người dùng',
      items: [
        'Đăng ký: Để sử dụng một số chức năng của dịch vụ, bạn cần tạo một tài khoản. Bạn cam kết cung cấp thông tin chính xác và đầy đủ.',
        'Bảo mật tài khoản: Bạn có trách nhiệm giữ bí mật thông tin tài khoản của mình và thông báo cho chúng tôi ngay lập tức về bất kỳ hành vi sử dụng trái phép nào.'
      ]
    },
    {
      id: 'rights',
      title: '6. Sử dụng thông tin',
      items: [
        'Chúng tôi có quyền thu thập và sử dụng thông tin cá nhân của bạn theo chính sách bảo mật hiện hành.',
        'Dịch vụ có thể không luôn luôn khả dụng và chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn hoặc không có lỗi.'
      ]
    },
    {
      id:'change',
      title:'7. Thay đổi điều khoản',
      content:'Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Mọi thay đổi sẽ có hiệu lực ngay khi được công bố trên trang web hoặc trong ứng dụng. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.'
    },
    {
      id: 'contact',
      title: '8. Liên hệ',
      content: 'Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua địa chỉ email hoặc số điện thoại được cung cấp trên trang web.'
    }
  ];
}


import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsultationService } from '../../../../../admin/src/app/service/consultation.service';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-tuvan',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule,FormsModule,HttpClientModule],
  templateUrl: './tuvan.component.html',
  styleUrl: './tuvan.component.css'
})
export class TuvanComponent implements OnInit {
  @ViewChild('scrollMessages') private scrollMessages!: ElementRef;

  showNewConsultationForm = false;
  consultations: any[] = [];
  selectedConsultation: any = null;
  newMessage = '';
  newConsultation = {
    userName: '',
    question: ''
  };
  consultationStatus: any = null;
  statusCheckInterval: any;
  selectedImage: File | null = null;// Lưu hình ảnh được chọn

  constructor(private consultationService: ConsultationService) {}

  ngOnInit() {
    this.loadConsultations();
    this.setupSignalR();
  }

  private setupSignalR() {
    this.consultationService.startConnection().then(() => {
      // Lắng nghe tin nhắn mới từ bác sĩ
      this.consultationService.on('NewMessage', (data) => {
        const message = data.message;
        const consultationId = data.consultationId;
        const filePath = data.filePath;  // Nhận đường dẫn ảnh
  
        // Kiểm tra xem tin nhắn có thuộc về cuộc tư vấn đã chọn không
        if (this.selectedConsultation?.id === consultationId) {
          if (!this.selectedConsultation!.messages) {
            this.selectedConsultation!.messages = [];
          }
          // Đưa tin nhắn và filePath vào message
          const newMessage = { message, filePath };
          this.selectedConsultation!.messages.push(newMessage);
          this.scrollToBottom();
        }
      });
  
      // Lắng nghe tin nhắn mới từ người dùng
      this.consultationService.on('UserNewMessage', (data) => {
        const message = data.message;
        const consultationId = data.consultationId;
        const filePath = data.filePath;  // Nhận đường dẫn ảnh
  
        // Kiểm tra xem tin nhắn có thuộc về cuộc tư vấn đã chọn không
        if (this.selectedConsultation?.id === consultationId) {
          if (!this.selectedConsultation!.messages) {
            this.selectedConsultation!.messages = [];
          }
          // Đưa tin nhắn và filePath vào message
          const newMessage = { message, filePath };
          this.selectedConsultation!.messages.push(newMessage);
          this.scrollToBottom();
        }
      });
  
      // Lắng nghe khi trạng thái tư vấn thay đổi
      this.consultationService.on('StatusUpdated', (data) => {
        const { consultationId, status } = data;
        if (this.selectedConsultation?.id === consultationId) {
          this.selectedConsultation!.status = status;
        }
      });
    });
  }
  
  loadConsultations() {
    this.consultationService.getUserConsultationHistory().subscribe(
      response => {
        this.consultations = response.consultations;
      },
      error => console.error('Error loading consultations:', error)
    );
  }

  createConsultation() {
    this.consultationService.createConsultation(this.newConsultation).subscribe(
      response => {
        this.showNewConsultationForm = false;
        this.loadConsultations();
        this.newConsultation = { userName: '', question: '' };
      },
      error => console.error('Error creating consultation:', error)
    );
  }

  selectConsultation(consultation: any) {
    this.consultationService.getConsultationDetail(consultation.id).subscribe(
      response => {
        this.selectedConsultation = response.consultation;
        this.startStatusChecking();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error => console.error('Error loading consultation details:', error)
    );
  }

  private startStatusChecking() {
    // Xóa interval cũ nếu có
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    // Kiểm tra status ngay lập tức
    this.checkConsultationStatus();

    // Thiết lập interval để kiểm tra định kỳ (ví dụ: mỗi 30 giây)
    this.statusCheckInterval = setInterval(() => {
      this.checkConsultationStatus();
    }, 30000);
  }

  private checkConsultationStatus() {
    if (!this.selectedConsultation) return;
  
    this.consultationService.getConsultationStatus(this.selectedConsultation.id)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedConsultation.status = response.status;
            this.selectedConsultation.doctorName = response.doctorName;
            if (['Completed', 'UserEnded', 'DoctorEnded'].includes(response.status)) {
              clearInterval(this.statusCheckInterval);
            }
          }
        },
        error: (error) => {
          console.error('Error checking consultation status:', error);
        }
      });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      console.log(this.selectedImage); // Xem file bạn chọn có hợp lệ không
    }
  }
  
  // Gửi tin nhắn
  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedImage) return;
  
    const formData = new FormData();
    formData.append('message', this.newMessage); // Thêm tin nhắn vào FormData
  
    if (this.selectedImage) {
      formData.append('image', this.selectedImage); // Thêm hình ảnh vào FormData
    }
  
    // Gửi request đến backend
    this.consultationService.sendMessage(this.selectedConsultation.id, formData)
      .subscribe(
        () => {
          this.newMessage = '';
          this.selectedImage = null;
          this.scrollToBottom();
        },
        (error) => {
          console.error('Lỗi khi gửi tin nhắn:', error);
        }
      );
  }
  
  // Cuộn xuống cuối khung chat sau khi gửi tin nhắn
  // scrollToBottom(): void {
  //   const chatContainer = document.getElementById('chat-container');
  //   if (chatContainer) {
  //     chatContainer.scrollTop = chatContainer.scrollHeight;
  //   }
  // }
  

  
  endConsultation() {
    this.consultationService.endConsultation(this.selectedConsultation.id).subscribe(
      response => {
        this.selectedConsultation.status = response.status;
      },
      error => console.error('Error ending consultation:', error)
    );
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'Chờ tiếp nhận',
      'Active': 'Đang tư vấn',
      'UserEnded': 'Đã kết thúc (Người dùng)',
      'DoctorEnded': 'Đã kết thúc (Bác sĩ)',
      'Completed': 'Hoàn thành'
    };
    return statusMap[status] || status;
  }

  private scrollToBottom(): void {
    try {
      this.scrollMessages.nativeElement.scrollTop = 
        this.scrollMessages.nativeElement.scrollHeight;
    } catch(err) {}
  }
}
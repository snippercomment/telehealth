import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsultationService } from '../../service/consultation.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Consultation } from '../../../model/consultation.model';


type ConsultationStatus = 'Pending' | 'Active' | 'UserEnded' | 'DoctorEnded' | 'Completed';
@Component({
  selector: 'app-doctor-consultation',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule,FormsModule,RouterLink],
  templateUrl: './doctor-consultation.component.html',
  styleUrl: './doctor-consultation.component.css'
})
export class DoctorConsultationComponent {
  activeTab: 'pending' | 'active' | 'history' = 'active';
  pendingConsultations: Consultation[] = [];
  activeConsultations: Consultation[] = [];
  consultationHistory: Consultation[] = [];
  selectedConsultation: Consultation | null = null;
  newMessage: string = '';
  loading = false;
  error = '';
  selectedFile: File | null = null;
  @ViewChild('scrollMessages') private scrollContainer!: ElementRef;

  constructor(private consultationService: ConsultationService) {}

  ngOnInit() {
    this.loadConsultations();
    this.setupSignalR();
    this.startStatusChecking();
    this.loadPendingConsultations();
    this.loadActiveConsultations();
  }

  private statusCheckInterval: any;

  ngOnDestroy() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }

  private startStatusChecking() {
    this.statusCheckInterval = setInterval(() => {
      if (this.selectedConsultation) {
        this.checkConsultationStatus(this.selectedConsultation.id);
      }
      this.activeConsultations.forEach(consultation => {
        this.checkConsultationStatus(consultation.id);
      });
    }, 30000);
  }

  private checkConsultationStatus(consultationId: number) {
    this.consultationService.getConsultationStatus(consultationId).subscribe({
      next: (response) => {
        if (response.success) {
          if (this.selectedConsultation && this.selectedConsultation.id === consultationId) {
            this.selectedConsultation.status = response.status;
            this.selectedConsultation.doctor = response.doctorName;
            
            if (this.shouldMoveToHistory(response.status)) {
              this.moveConsultationToHistory(consultationId);
            }
          }

          const activeConsultation = this.activeConsultations.find(c => c.id === consultationId);
          if (activeConsultation) {
            activeConsultation.status = response.status;
            activeConsultation.doctor = response.doctorName;
            
            if (this.shouldMoveToHistory(response.status)) {
              this.moveConsultationToHistory(consultationId);
            }
          }
        }
      },
      error: (error) => {
        console.error('Error checking consultation status:', error);
      }
    });
  }

  private shouldMoveToHistory(status: ConsultationStatus): boolean {
    return ['Completed', 'UserEnded', 'DoctorEnded'].includes(status);
  }

  private moveConsultationToHistory(consultationId: number) {
    const consultation = this.activeConsultations.find(c => c.id === consultationId);
    if (consultation) {
      this.activeConsultations = this.activeConsultations.filter(c => c.id !== consultationId);
      this.consultationHistory.unshift(consultation);
      
      if (this.selectedConsultation?.id === consultationId) {
        this.selectedConsultation = null;
      }
    }
  }

  getStatusText(status: string): string {
    const statusMap = {
      'Pending': 'Chờ tư vấn',
      'Active': 'Đang tư vấn',
      'UserEnded': 'Người dùng kết thúc',
      'DoctorEnded': 'Bác sĩ kết thúc',
      'Completed': 'Hoàn thành'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  // Các phương thức khác giữ nguyên
  private setupSignalR() {
    this.consultationService.startConnection().then(() => {
      // Lắng nghe tin nhắn mới từ bác sĩ
      this.consultationService.on('NewMessage', (data) => {
        const message = data.message;
        const consultationId = data.consultationId;
  
        // Kiểm tra xem tin nhắn có thuộc về cuộc tư vấn đã chọn không
        if (this.selectedConsultation?.id === consultationId) {
          if (!this.selectedConsultation!.messages) {
            this.selectedConsultation!.messages = [];
          }
          this.selectedConsultation!.messages.push(message);
          this.scrollToBottom();
        }
      });
  
      // Lắng nghe tin nhắn mới từ người dùng
      this.consultationService.on('UserNewMessage', (data) => {
        const message = data.message;
        const consultationId = data.consultationId;
  
        // Kiểm tra xem tin nhắn có thuộc về cuộc tư vấn đã chọn không
        if (this.selectedConsultation?.id === consultationId) {
          if (!this.selectedConsultation!.messages) {
            this.selectedConsultation!.messages = [];
          }
          this.selectedConsultation!.messages.push(message);
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
  
  

  private loadConsultations() {
    this.consultationService.getDoctorConsultationHistory().subscribe({
      next: (response) => {
        if (response.success) {
          // Gán toàn bộ dữ liệu từ backend
          this.consultationHistory = response.consultations.map((c: any) => ({
            ...c,
            messages: c.messages || [], // Đảm bảo `messages` không bị null
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching consultation history:', error);
      }
    });
  }

  setActiveTab(tab: 'pending' | 'active' | 'history') {
    this.activeTab = tab;
    this.selectedConsultation = null;
  }

  acceptConsultation(consultationId: number) {
    this.consultationService.acceptConsultation(consultationId).subscribe(() => {
      const consultation = this.pendingConsultations.find(c => c.id === consultationId);
      if (consultation) {
        this.pendingConsultations = this.pendingConsultations.filter(c => c.id !== consultationId);
        consultation.status = 'Active';
        this.activeConsultations.unshift(consultation);
      }
    });
  }
// Phương thức để tải chi tiết cuộc tham vấn khi nhấn vào
  loadConsultationDetail(consultationId: number) {
    this.consultationService.getConsultationDetail(consultationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedConsultation = response.consultation;
          // Bạn có thể mở Modal hoặc hiển thị thông tin chi tiết trên giao diện
        }
      },
      error: (error) => {
        console.error('Error fetching consultation detail:', error);
      }
    });
  }
  


  loadPendingConsultations(): void {
    this.loading = true;
    this.consultationService.getPendingConsultations()
      .subscribe({
        next: (response) => {
          this.pendingConsultations = response.consultations;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Không thể tải danh sách tư vấn';
          this.loading = false;
          console.error('Error:', error);
        }
      });
  }
  loadActiveConsultations(): void {
    this.consultationService.getActiveConsultations().subscribe({
      next: (response) => {
        if (response.success) {
          this.activeConsultations = response.consultations;
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy các cuộc tư vấn đang diễn ra:', error);
      }
    });
  }
 // Xử lý sự kiện khi người dùng chọn file
 onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
}

// Gửi tin nhắn
sendMessage(): void {
  if ((!this.newMessage.trim() && !this.selectedFile) || !this.selectedConsultation) return;

  const formData = new FormData();
  formData.append('message', this.newMessage.trim());
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  // Gửi tin nhắn qua API
  this.consultationService.sendMessage(this.selectedConsultation.id, formData)
    .subscribe(
      () => {
        // Reset sau khi gửi thành công
        this.newMessage = '';
        this.selectedFile = null;
        this.scrollToBottom();
      },
      (error) => {
        console.error('Lỗi khi gửi tin nhắn:', error);
      }
    );
}


  endConsultation(consultationId: number) {
    if (!this.selectedConsultation) return;

    this.consultationService.endConsultation(consultationId).subscribe(() => {
      if (this.selectedConsultation) {
        this.activeConsultations = this.activeConsultations.filter(
          c => c.id !== consultationId
        );
        this.selectedConsultation.status = 'DoctorEnded';
        this.consultationHistory.unshift(this.selectedConsultation);
        this.selectedConsultation = null;
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.scrollContainer.nativeElement.scrollTop = 
          this.scrollContainer.nativeElement.scrollHeight;
      } catch(err) {}
    }, 100);
  }
}

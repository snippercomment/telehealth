
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators ,ReactiveFormsModule} from '@angular/forms';
import {  RouterModule } from '@angular/router';

import { ProfileService } from '../../services/profile.service';


import { UserDTO } from '../../models/user.model';
import { BauthService } from '../../services/bauth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule,ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: UserDTO | null = null;
  avatar: string | null = null;
  isSaveSuccessful = false;
  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private bauthService: BauthService,
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{value: '', disabled: true}], 
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: [''],
      gender: [''],
      birthDate: ['',[Validators.required]],
      imageFile: [null]
    });
  }

  ngOnInit(): void {
    const userId = this.bauthService.getCurrentUserId();
    if (userId) {
      this.loadProfile(userId);
    }
  }
   // Hàm chuyển đổi định dạng ngày từ "YYYY-MM-DD" sang Date object
   private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Hàm chuyển đổi Date object sang định dạng "YYYY-MM-DD"
  private formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
loadProfile(id: number): void {
    this.profileService.getProfileById(id).subscribe(
      (user: UserDTO) => {
        this.currentUser = user;
        this.bauthService.setCurrentUser(user);

        
        let formattedBirthDate = '';
        if (user.birthDate) {
          if (typeof user.birthDate === 'string') {
            formattedBirthDate = user.birthDate.split('T')[0];
          }
        }

        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          gender: user.gender,
          birthDate: formattedBirthDate
        });
        if (user.profileImage) {
          if (user.profileImage.startsWith('http') || user.profileImage.startsWith('https')) {
            // Nếu là URL
            this.avatar = user.profileImage;
          } else if (user.profileImage.startsWith('data:image')) {
            // Nếu đã là base64
            this.avatar = user.profileImage;
          } else {
            // Nếu là base64 string thuần
            this.avatar = `data:image/jpeg;base64,${user.profileImage}`;
          }
        }
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({
        imageFile: file
      });

      const reader = new FileReader();
      reader.onload = () => {
        this.avatar = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      const formValue = this.profileForm.getRawValue();
  
      const formData = new FormData();
  
      formData.append('id', this.currentUser.id.toString());
      formData.append('fullName', formValue.fullName);
      formData.append('email', formValue.email);
      formData.append('phoneNumber', formValue.phoneNumber);
      formData.append('address', formValue.address);
      formData.append('gender', formValue.gender);
      formData.append('birthDate', formValue.birthDate);
  
      // Thêm file hình ảnh nếu có
      if (formValue.imageFile) {
        formData.append('imageFile', formValue.imageFile);
      }
  
      this.profileService.updateProfile(this.currentUser.id, formData)
        .subscribe(
          (updatedUser: UserDTO) => {
            this.bauthService.setCurrentUser(updatedUser);
            this.currentUser = updatedUser;
  
            // Xử lý hiển thị avatar sau khi cập nhật
            if (updatedUser.profileImage) {
              if (updatedUser.profileImage.startsWith('http') || updatedUser.profileImage.startsWith('https')) {
                this.avatar = updatedUser.profileImage;
              } else if (updatedUser.profileImage.startsWith('data:image')) {
                this.avatar = updatedUser.profileImage;
              } else {
                this.avatar = `data:image/jpeg;base64,${updatedUser.profileImage}`;
              }
            }
  
            // Hiển thị thông báo thành công
            this.isSaveSuccessful = true;
  
            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => {
              this.isSaveSuccessful = false;
            }, 3000);
          },
          error => {
            console.error('Cập nhật thất bại', error);
          }
        );
    }
  }
  closeNotification(): void {
    this.isSaveSuccessful = false;
  }  
  }
  

  


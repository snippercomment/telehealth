import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private isServer: boolean;

  constructor() {
    // Kiểm tra xem có đang ở môi trường browser không
    this.isServer = typeof window === 'undefined';
  }

  getItem(key: string): any {
    if (!this.isServer) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  setItem(key: string, value: any): void {
    if (!this.isServer) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  removeItem(key: string): void {
    if (!this.isServer) {
      localStorage.removeItem(key);
    }
  }
}
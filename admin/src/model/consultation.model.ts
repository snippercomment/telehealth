export interface Consultation {
    id: number;
    userId: number;
    doctorId?: number;
    userName: string;
    user?: {
      id: number;
      fullName: string;
      email: string;
    };
    doctor?: string;
    status: string;
    createdAt: Date;
    lastMessage?: ConsultationMessage;
    unreadCount: number;
    totalMessages: number;
    message: string;
    messages?: ConsultationMessage[];
    question?: string;
    messageCount?: number; 
}

export interface Message {
    id: number;
    message: string;
    content: string;
    senderType: string;
    senderName: string;
    createdAt: Date;
    
}

export interface ConsultationMessage {
    id: number;
    message: string;
    senderType: string;
    senderName: string;
    createdAt: Date;
    isRead: boolean;
  }

export interface ConsultationCreateDto {

    question: string;
}

export interface ConsultationReplyDto {
    message: string;
}
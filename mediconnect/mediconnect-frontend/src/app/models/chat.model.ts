export interface ChatMessage {
  id: number;
  appointmentId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  fileUrl?: string;
  isRead: boolean;
  sentAt: string;
}

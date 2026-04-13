import { Injectable, inject } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { ApiService } from './api.service';
import { ChatMessage } from '../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);
  private messageSubject = new Subject<ChatMessage>();
  messages$ = this.messageSubject.asObservable();

  getMessages(appointmentId: number): Observable<ChatMessage[]> {
    return this.api.get<any>(`/chat/appointment/${appointmentId}`).pipe(map(r => r.data));
  }

  sendMessage(appointmentId: number, content: string): Observable<ChatMessage> {
    return this.api.post<any>('/chat/send', { appointmentId, content, messageType: 'TEXT' }).pipe(map(r => r.data));
  }

  markAsRead(appointmentId: number): Observable<void> {
    return this.api.patch<any>(`/chat/appointment/${appointmentId}/read`).pipe(map(() => void 0));
  }
}

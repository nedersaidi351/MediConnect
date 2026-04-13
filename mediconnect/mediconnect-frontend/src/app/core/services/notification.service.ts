import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  getNotifications(page = 0, size = 20): Observable<any> {
    return this.api.get<any>('/notifications', { page, size }).pipe(map(r => r.data));
  }

  getUnreadCount(): Observable<number> {
    return this.api.get<any>('/notifications/unread-count').pipe(map(r => r.data));
  }

  markAllRead(): Observable<void> {
    return this.api.patch<any>('/notifications/read-all').pipe(map(() => void 0));
  }
}

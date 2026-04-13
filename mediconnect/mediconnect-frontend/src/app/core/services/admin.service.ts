import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  getDashboardStats(): Observable<any> {
    return this.api.get<any>('/admin/dashboard').pipe(map(r => r.data));
  }

  getPendingDoctors(page = 0, size = 10): Observable<any> {
    return this.api.get<any>('/admin/doctors/pending', { page, size }).pipe(map(r => r.data));
  }

  verifyDoctor(id: number): Observable<void> {
    return this.api.patch<any>(`/admin/doctors/${id}/verify`).pipe(map(() => void 0));
  }

  toggleUser(id: number): Observable<void> {
    return this.api.patch<any>(`/admin/users/${id}/toggle`).pipe(map(() => void 0));
  }

  getAllUsers(page = 0, size = 20): Observable<any> {
    return this.api.get<any>('/admin/users', { page, size }).pipe(map(r => r.data));
  }
}

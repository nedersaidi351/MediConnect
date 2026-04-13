import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SecretaryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/secretary`;

  getAppointments(page = 0, size = 10, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.base}/appointments`, { params });
  }

  confirmAppointment(id: number): Observable<any> {
    return this.http.patch<any>(`${this.base}/appointments/${id}/confirm`, {});
  }

  cancelAppointment(id: number, reason?: string): Observable<any> {
    let params = new HttpParams();
    if (reason) params = params.set('reason', reason);
    return this.http.patch<any>(`${this.base}/appointments/${id}/cancel`, {}, { params });
  }

  sendReminder(id: number): Observable<any> {
    return this.http.post<any>(`${this.base}/appointments/${id}/reminder`, {});
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/stats`);
  }

  getPatients(page = 0, size = 20): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.base}/patients`, { params });
  }
}

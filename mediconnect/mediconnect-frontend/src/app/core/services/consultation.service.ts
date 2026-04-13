import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private api = inject(ApiService);

  start(appointmentId: number): Observable<any> {
    return this.api.post<any>(`/consultations/${appointmentId}/start`, {}).pipe(map(r => r.data));
  }

  saveNotes(appointmentId: number, data: any): Observable<any> {
    return this.api.put<any>(`/consultations/${appointmentId}/notes`, data).pipe(map(r => r.data));
  }

  end(appointmentId: number): Observable<any> {
    return this.api.post<any>(`/consultations/${appointmentId}/end`, {}).pipe(map(r => r.data));
  }

  get(appointmentId: number): Observable<any> {
    return this.api.get<any>(`/consultations/${appointmentId}`).pipe(map(r => r.data));
  }
}

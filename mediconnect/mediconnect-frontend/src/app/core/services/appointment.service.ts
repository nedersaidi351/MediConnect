import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Appointment, AppointmentRequest, PagedResponse } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = inject(ApiService);

  book(req: AppointmentRequest): Observable<Appointment> {
    return this.api.post<any>('/appointments', req).pipe(map(r => r.data));
  }

  getMyAppointments(page = 0, size = 10): Observable<PagedResponse<Appointment>> {
    return this.api.get<any>('/appointments/my', { page, size }).pipe(map(r => r.data));
  }

  getDoctorAppointments(page = 0, size = 10): Observable<PagedResponse<Appointment>> {
    return this.api.get<any>('/appointments/doctor/my', { page, size }).pipe(map(r => r.data));
  }

  getDailySchedule(date: string): Observable<Appointment[]> {
    return this.api.get<any>('/appointments/doctor/schedule', { date }).pipe(map(r => r.data));
  }

  confirm(id: number): Observable<Appointment> {
    return this.api.patch<any>(`/appointments/${id}/confirm`).pipe(map(r => r.data));
  }

  cancel(id: number, reason?: string): Observable<Appointment> {
    const url = reason
      ? `/appointments/${id}/cancel?reason=${encodeURIComponent(reason)}`
      : `/appointments/${id}/cancel`;
    return this.api.patch<any>(url).pipe(map(r => r.data));
  }

  complete(id: number): Observable<Appointment> {
    return this.api.patch<any>(`/appointments/${id}/complete`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Appointment> {
    return this.api.get<any>(`/appointments/${id}`).pipe(map(r => r.data));
  }
}

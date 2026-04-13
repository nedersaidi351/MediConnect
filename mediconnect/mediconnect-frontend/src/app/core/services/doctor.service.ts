import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { DoctorProfile, Specialty } from '../../models/doctor.model';
import { PagedResponse } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private api = inject(ApiService);

  searchDoctors(specialtyId?: number, city?: string, name?: string, page = 0, size = 10): Observable<PagedResponse<DoctorProfile>> {
    return this.api.get<any>('/doctors/search', { specialtyId, city, name, page, size }).pipe(map(r => r.data));
  }

  getPublicProfile(id: number): Observable<DoctorProfile> {
    return this.api.get<any>(`/doctors/${id}/public`).pipe(map(r => r.data));
  }

  getMyProfile(): Observable<DoctorProfile> {
    return this.api.get<any>('/doctors/profile/me').pipe(map(r => r.data));
  }

  createProfile(data: any): Observable<DoctorProfile> {
    return this.api.post<any>('/doctors/profile', data).pipe(map(r => r.data));
  }

  updateProfile(data: any): Observable<DoctorProfile> {
    return this.api.put<any>('/doctors/profile', data).pipe(map(r => r.data));
  }

  setAvailability(slots: any[]): Observable<void> {
    return this.api.put<any>('/doctors/availability', { slots }).pipe(map(() => void 0));
  }

  getSpecialties(): Observable<Specialty[]> {
    return this.api.get<any>('/specialties').pipe(map(r => r.data));
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private api = inject(ApiService);

  getMyProfile(): Observable<any> {
    return this.api.get<any>('/patients/profile/me').pipe(map(r => r.data));
  }

  updateProfile(data: any): Observable<any> {
    return this.api.put<any>('/patients/profile', data).pipe(map(r => r.data));
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = inject(ApiService);

  getDoctorReviews(doctorId: number, page = 0, size = 10): Observable<any> {
    return this.api.get<any>(`/reviews/doctors/${doctorId}`, { page, size }).pipe(map(r => r.data));
  }

  addReview(doctorId: number, data: any): Observable<any> {
    return this.api.post<any>(`/reviews/doctors/${doctorId}`, data).pipe(map(r => r.data));
  }
}

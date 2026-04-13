import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../models/auth.model';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(this.loadUserFromStorage());

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    localStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  getUserId(): number | null {
    return this.currentUser()?.id ?? null;
  }

  redirectToDashboard(): void {
    const role = this.getRole();
    switch (role) {
      case 'PATIENT':    this.router.navigate(['/patient/dashboard']); break;
      case 'DOCTOR':     this.router.navigate(['/doctor/dashboard']); break;
      case 'ADMIN':      this.router.navigate(['/admin/dashboard']); break;
      case 'SECRETARY':  this.router.navigate(['/secretary/dashboard']); break;
      default: this.router.navigate(['/login']);
    }
  }

  private handleAuthSuccess(res: AuthResponse): void {
    if (res.data) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      const user: User = {
        id: res.data.userId,
        email: res.data.email,
        fullName: res.data.fullName,
        role: res.data.role
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }
}

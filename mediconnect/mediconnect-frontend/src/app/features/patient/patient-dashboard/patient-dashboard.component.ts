import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, HeaderComponent, SidebarComponent],
  styles: [`
    .outer-wrap { display:flex; flex-direction:column; height:100vh; font-family:'Inter',sans-serif; background:#F8F7FF; }
    .body-row { display:flex; flex:1; overflow:hidden; }
    .main-content { flex:1; overflow-y:auto; padding:28px; }

    .stats-row { display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
    .stats-row .stat-card { flex:1; min-width:160px; }

    .section-card { background:white; border-radius:20px; border:1px solid #EDEDF8; box-shadow:0 2px 12px rgba(79,70,229,0.06); overflow:hidden; margin-bottom:20px; }
    .section-header { padding:18px 22px 15px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #F3F4FF; }
    .section-icon { width:36px; height:36px; background:linear-gradient(135deg,#4F46E5,#7C3AED); border-radius:10px; display:flex; align-items:center; justify-content:center; }
    .section-title { font-size:1rem; font-weight:700; color:#1E1B4B; margin:0; }
    .section-link { font-size:0.83rem; font-weight:600; color:#4F46E5; text-decoration:none; display:flex; align-items:center; gap:3px; padding:6px 13px; border:1.5px solid #C7D2FE; border-radius:8px; background:white; transition:all 0.2s; }
    .section-link:hover { background:#EEF2FF; }
    .section-body { padding:12px 16px 16px; }

    .empty-state { text-align:center; padding:48px 24px; }
    .empty-emoji { font-size:3rem; margin-bottom:10px; }

    .appt-item { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px 14px; border-radius:14px; border:1px solid #EDEDF8; background:#FAFAFA; margin-bottom:8px; transition:all 0.2s; }
    .appt-item:hover { background:#F5F3FF; border-color:#C7D2FE; transform:translateY(-1px); box-shadow:0 4px 12px rgba(79,70,229,0.08); }
    .appt-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#EEF2FF,#E0E7FF); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .appt-info { flex:1; min-width:0; }
    .appt-doctor { font-weight:700; color:#1E1B4B; font-size:0.93rem; margin-bottom:1px; }
    .appt-specialty { font-size:0.78rem; color:#7C3AED; font-weight:600; margin-bottom:3px; }
    .appt-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .appt-meta span { font-size:0.75rem; color:#6B7280; }

    .badge { display:inline-flex; align-items:center; font-size:0.73rem; font-weight:700; padding:4px 10px; border-radius:20px; letter-spacing:0.02em; flex-shrink:0; }
    .badge-confirmed { background:#D1FAE5; color:#065F46; }
    .badge-pending   { background:#FEF3C7; color:#92400E; }
    .badge-cancelled { background:#FEE2E2; color:#991B1B; }
    .badge-completed { background:#DBEAFE; color:#1E40AF; }

    .quick-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:4px; }
    .quick-card { background:white; border-radius:16px; border:1px solid #EDEDF8; padding:20px 14px; text-align:center; text-decoration:none; display:block; transition:all 0.25s; box-shadow:0 1px 4px rgba(79,70,229,0.04); }
    .quick-card:hover { transform:translateY(-5px); box-shadow:0 12px 28px rgba(79,70,229,0.13); border-color:#C7D2FE; }
    .quick-icon { font-size:1.9rem; margin-bottom:8px; display:block; }
    .quick-label { font-size:0.8rem; font-weight:600; color:#374151; }

    @media (max-width:768px) {
      .quick-grid { grid-template-columns:repeat(2,1fr); }
      .stats-row .stat-card { min-width:130px; }
    }
  `],
  template: `
    <div class="outer-wrap">
      <app-header />
      <div class="body-row">
        <app-sidebar />
        <main class="main-content mc-page">

          <!-- Welcome Banner -->
          <div class="welcome-banner anim-fade-in-up" style="margin-bottom:24px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
              <div>
                <p style="font-size:0.75rem;color:rgba(255,255,255,0.6);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:5px">Tableau de bord patient</p>
                <h1 style="font-size:1.85rem;font-weight:800;color:white;line-height:1.2;margin-bottom:6px">
                  Bonjour, {{ (auth.currentUser()?.fullName?.split(' ') || [''])[0] }} 👋
                </h1>
                <p style="color:rgba(255,255,255,0.75);font-size:0.92rem">Gérez vos rendez-vous et suivez votre santé en ligne</p>
              </div>
              <a routerLink="/patient/doctors"
                 style="display:inline-flex;align-items:center;gap:8px;background:white;color:#4F46E5;border-radius:14px;padding:12px 24px;font-weight:700;font-size:0.88rem;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,0.15);transition:all 0.25s;flex-shrink:0"
                 onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.18)'"
                 onmouseout="this.style.transform='';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'">
                <mat-icon style="font-size:18px;width:18px;height:18px">search</mat-icon>
                Prendre RDV
              </a>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="stats-row anim-fade-in-up delay-100">
            <div class="stat-card stat-indigo">
              <mat-icon class="stat-icon">calendar_today</mat-icon>
              <div class="stat-value">{{ totalAppointments }}</div>
              <div class="stat-label">Rendez-vous à venir</div>
            </div>
            <div class="stat-card stat-teal">
              <mat-icon class="stat-icon">local_hospital</mat-icon>
              <div class="stat-value">{{ confirmedCount }}</div>
              <div class="stat-label">Médecins consultés</div>
            </div>
            <div class="stat-card stat-emerald">
              <mat-icon class="stat-icon">event_available</mat-icon>
              <div class="stat-value">{{ upcoming.length > 0 ? upcoming[0].appointmentDate : '—' }}</div>
              <div class="stat-label">Prochain rendez-vous</div>
            </div>
          </div>

          <!-- Recent Appointments -->
          <div class="section-card anim-fade-in-up delay-200">
            <div class="section-header">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="section-icon">
                  <mat-icon style="color:white;font-size:18px;width:18px;height:18px">upcoming</mat-icon>
                </div>
                <h3 class="section-title">Rendez-vous récents</h3>
              </div>
              <a routerLink="/patient/appointments" class="section-link">
                Voir tout <mat-icon style="font-size:15px;width:15px;height:15px">arrow_forward</mat-icon>
              </a>
            </div>
            <div class="section-body">
              @if (upcoming.length === 0) {
                <div class="empty-state">
                  <div class="empty-emoji">📅</div>
                  <p style="font-weight:700;color:#374151;margin-bottom:6px;font-size:1rem">Aucun rendez-vous à venir</p>
                  <p style="font-size:0.86rem;color:#9CA3AF;margin-bottom:20px">Prenez rendez-vous avec un médecin certifié</p>
                  <a routerLink="/patient/doctors" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;border-radius:12px;padding:11px 22px;font-weight:600;font-size:0.87rem;text-decoration:none;box-shadow:0 4px 14px rgba(79,70,229,0.3)">
                    <mat-icon style="font-size:16px;width:16px;height:16px">search</mat-icon> Trouver un médecin
                  </a>
                </div>
              } @else {
                @for (appt of upcoming; track appt.id) {
                  <div class="appt-item">
                    <div class="appt-avatar">👨‍⚕️</div>
                    <div class="appt-info">
                      <div class="appt-doctor">Dr. {{ appt.doctorName }}</div>
                      <div class="appt-specialty">{{ appt.specialty }}</div>
                      <div class="appt-meta">
                        <span>📅 {{ appt.appointmentDate }}</span>
                        <span>⏰ {{ appt.startTime }}</span>
                      </div>
                    </div>
                    <span [class]="'badge badge-' + appt.status.toLowerCase()">{{ statusLabel(appt.status) }}</span>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="anim-fade-in-up delay-400">
            <p style="font-size:0.88rem;font-weight:700;color:#6B7280;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px">Actions rapides</p>
            <div class="quick-grid">
              @for (a of quickActions; track a.label) {
                <a [routerLink]="a.route" class="quick-card">
                  <span class="quick-icon">{{ a.icon }}</span>
                  <span class="quick-label">{{ a.label }}</span>
                </a>
              }
            </div>
          </div>

        </main>
      </div>
    </div>
  `
})
export class PatientDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private apptSvc = inject(AppointmentService);

  appointments: Appointment[] = [];
  upcoming: Appointment[] = [];
  totalAppointments = 0;
  confirmedCount = 0;
  pendingCount = 0;

  quickActions = [
    { icon: '🔍', label: 'Chercher un médecin', route: '/patient/doctors' },
    { icon: '📅', label: 'Mes rendez-vous',      route: '/patient/appointments' },
    { icon: '👤', label: 'Mon profil',            route: '/patient/profile' },
    { icon: '💊', label: 'Messagerie',            route: '/patient/doctors' },
  ];

  ngOnInit(): void {
    this.apptSvc.getMyAppointments(0, 20).subscribe(res => {
      this.appointments      = res.content;
      this.totalAppointments = res.totalElements;
      this.confirmedCount    = res.content.filter((a: Appointment) => a.status === 'CONFIRMED').length;
      this.pendingCount      = res.content.filter((a: Appointment) => a.status === 'PENDING').length;
      this.upcoming          = res.content.filter((a: Appointment) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED').slice(0, 5);
    });
  }

  statusLabel(s: string): string {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Terminé' } as any)[s] ?? s;
  }
}

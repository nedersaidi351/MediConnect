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
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, HeaderComponent, SidebarComponent],
  styles: [`
    .outer-wrap { display:flex; flex-direction:column; height:100vh; font-family:'Inter',sans-serif; background:#F0F9FF; }
    .body-row { display:flex; flex:1; overflow:hidden; }
    .main-content { flex:1; overflow-y:auto; padding:28px; }

    .stats-row { display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
    .stats-row .stat-card { flex:1; min-width:140px; }

    .two-col { display:grid; grid-template-columns:1fr 340px; gap:20px; align-items:start; }

    .section-card { background:white; border-radius:20px; border:1px solid #E0F2FE; box-shadow:0 2px 12px rgba(8,145,178,0.07); overflow:hidden; }
    .section-header { padding:18px 22px 15px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #F0F9FF; }
    .section-icon-teal { width:36px; height:36px; background:linear-gradient(135deg,#0891B2,#4F46E5); border-radius:10px; display:flex; align-items:center; justify-content:center; }
    .section-title { font-size:1rem; font-weight:700; color:#0C4A6E; margin:0; }
    .section-link { font-size:0.82rem; font-weight:600; color:#0891B2; text-decoration:none; padding:5px 12px; border:1.5px solid #BAE6FD; border-radius:8px; background:white; transition:background 0.2s; }
    .section-link:hover { background:#E0F2FE; }
    .section-body { padding:12px 16px 16px; }

    .patient-item { display:flex; align-items:center; gap:14px; padding:12px 13px; border-radius:14px; border:1px solid #E0F2FE; background:#FAFEFF; margin-bottom:8px; transition:all 0.2s; }
    .patient-item:hover { background:#E0F2FE; border-color:#7DD3FC; transform:translateX(3px); }
    .avatar-circle { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#0891B2,#4F46E5); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:0.88rem; flex-shrink:0; }
    .patient-name { font-weight:700; color:#0C4A6E; font-size:0.92rem; margin-bottom:2px; }
    .patient-meta { font-size:0.76rem; color:#64748B; }

    .badge { display:inline-flex; align-items:center; font-size:0.73rem; font-weight:700; padding:4px 10px; border-radius:20px; letter-spacing:0.02em; flex-shrink:0; }
    .badge-confirmed { background:#D1FAE5; color:#065F46; }
    .badge-pending   { background:#FEF3C7; color:#92400E; }
    .badge-cancelled { background:#FEE2E2; color:#991B1B; }
    .badge-completed { background:#DBEAFE; color:#1E40AF; }

    .actions-sidebar { display:flex; flex-direction:column; gap:12px; }
    .action-item { background:white; border-radius:14px; border:1px solid #E0F2FE; padding:15px 16px; text-decoration:none; display:flex; align-items:center; gap:13px; transition:all 0.25s; }
    .action-item:hover { transform:translateX(5px); border-color:#7DD3FC; box-shadow:0 4px 16px rgba(8,145,178,0.12); }
    .action-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0; }
    .action-label { font-size:0.87rem; font-weight:600; color:#0C4A6E; margin-bottom:1px; }
    .action-sub { font-size:0.75rem; color:#94A3B8; }

    .empty-state { text-align:center; padding:44px 24px; }

    @media (max-width:900px) {
      .two-col { grid-template-columns:1fr; }
    }
  `],
  template: `
    <div class="outer-wrap">
      <app-header />
      <div class="body-row">
        <app-sidebar />
        <main class="main-content mc-page">

          <!-- Welcome Banner -->
          <div class="welcome-banner anim-fade-in-up"
               style="background:linear-gradient(135deg,#0891B2 0%,#4F46E5 50%,#7C3AED 100%);margin-bottom:24px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
              <div style="display:flex;align-items:center;gap:18px">
                <div style="width:62px;height:62px;background:rgba(255,255,255,0.18);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2.1rem;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">👨‍⚕️</div>
                <div>
                  <p style="font-size:0.75rem;color:rgba(255,255,255,0.6);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px">Espace médecin</p>
                  <h1 style="font-size:1.75rem;font-weight:800;color:white;line-height:1.2;margin-bottom:5px">
                    Dr. {{ auth.currentUser()?.fullName }}
                  </h1>
                  <p style="color:rgba(255,255,255,0.72);font-size:0.88rem">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
                </div>
              </div>
              <a routerLink="/doctor/appointments"
                 style="display:inline-flex;align-items:center;gap:8px;background:white;color:#0891B2;border-radius:14px;padding:12px 22px;font-weight:700;font-size:0.87rem;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,0.15);transition:all 0.25s;flex-shrink:0"
                 onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
                <mat-icon style="font-size:18px;width:18px;height:18px">calendar_today</mat-icon>
                Mes rendez-vous
              </a>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="stats-row anim-fade-in-up delay-100">
            <div class="stat-card stat-blue">
              <mat-icon class="stat-icon">today</mat-icon>
              <div class="stat-value">{{ totalToday }}</div>
              <div class="stat-label">RDV aujourd'hui</div>
            </div>
            <div class="stat-card stat-amber">
              <mat-icon class="stat-icon">pending_actions</mat-icon>
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">Confirmations en attente</div>
            </div>
            <div class="stat-card stat-teal">
              <mat-icon class="stat-icon">event_available</mat-icon>
              <div class="stat-value">{{ confirmedCount }}</div>
              <div class="stat-label">Cette semaine</div>
            </div>
            <div class="stat-card stat-purple">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-value">{{ all.length }}</div>
              <div class="stat-label">Total patients</div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="two-col anim-fade-in-up delay-200">

            <!-- Patient Schedule -->
            <div class="section-card">
              <div class="section-header">
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="section-icon-teal">
                    <mat-icon style="color:white;font-size:18px;width:18px;height:18px">people</mat-icon>
                  </div>
                  <h3 class="section-title">Planning patients</h3>
                </div>
                <a routerLink="/doctor/appointments" class="section-link">Voir tout</a>
              </div>
              <div class="section-body">
                @if (recent.length === 0) {
                  <div class="empty-state">
                    <div style="font-size:2.8rem;margin-bottom:10px">🩺</div>
                    <p style="font-size:0.9rem;color:#9CA3AF;font-weight:500">Aucun rendez-vous pour le moment</p>
                  </div>
                } @else {
                  @for (a of recent; track a.id) {
                    <div class="patient-item">
                      <div class="avatar-circle">{{ getInitials(a.patientName) }}</div>
                      <div style="flex:1;min-width:0">
                        <div class="patient-name">{{ a.patientName }}</div>
                        <div class="patient-meta">📅 {{ a.appointmentDate }} &nbsp;·&nbsp; ⏰ {{ a.startTime }}</div>
                      </div>
                      <span [class]="'badge badge-' + a.status.toLowerCase()">{{ statusLabel(a.status) }}</span>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Quick Actions Sidebar -->
            <div class="anim-fade-in-up delay-300">
              <p style="font-size:0.85rem;font-weight:700;color:#64748B;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:14px;padding:0 2px">Actions rapides</p>
              <div class="actions-sidebar">
                @for (a of quickActions; track a.label) {
                  <a [routerLink]="a.route" class="action-item">
                    <div class="action-icon" [style.background]="a.bg">{{ a.icon }}</div>
                    <div style="flex:1">
                      <div class="action-label">{{ a.label }}</div>
                      <div class="action-sub">{{ a.sub }}</div>
                    </div>
                    <mat-icon style="color:#BAE6FD;font-size:16px;width:16px;height:16px">chevron_right</mat-icon>
                  </a>
                }
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  `
})
export class DoctorDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private apptSvc = inject(AppointmentService);

  all: Appointment[] = [];
  recent: Appointment[] = [];
  today = new Date();
  totalToday = 0;
  pendingCount = 0;
  confirmedCount = 0;
  completedCount = 0;

  quickActions = [
    { icon: '📅', label: 'Rendez-vous',       sub: 'Gérer les demandes',    route: '/doctor/appointments',  bg: '#EEF2FF' },
    { icon: '🗓️', label: 'Planning du jour',  sub: 'Voir le programme',     route: '/doctor/schedule',      bg: '#E0F2FE' },
    { icon: '⏰', label: 'Disponibilités',    sub: 'Définir vos créneaux',  route: '/doctor/availability',  bg: '#F0FDF4' },
    { icon: '👤', label: 'Mon profil',         sub: 'Mettre à jour',         route: '/doctor/profile',       bg: '#FFF7ED' },
  ];

  ngOnInit(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.apptSvc.getDoctorAppointments(0, 50).subscribe(res => {
      this.all            = res.content;
      this.recent         = res.content.slice(0, 6);
      this.totalToday     = res.content.filter((a: Appointment) => a.appointmentDate === todayStr).length;
      this.pendingCount   = res.content.filter((a: Appointment) => a.status === 'PENDING').length;
      this.confirmedCount = res.content.filter((a: Appointment) => a.status === 'CONFIRMED').length;
      this.completedCount = res.content.filter((a: Appointment) => a.status === 'COMPLETED').length;
    });
  }

  statusLabel(s: string): string {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Terminé' } as any)[s] ?? s;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  }
}

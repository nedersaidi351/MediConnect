import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SecretaryService } from '../../../core/services/secretary.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    HeaderComponent, SidebarComponent
  ],
  styles: [`
    :host { display: block; }

    .outer-wrap { display: flex; flex-direction: column; height: 100vh; font-family: 'Inter', sans-serif; }
    .body-row   { display: flex; flex: 1; overflow: hidden; }
    .main-content { flex: 1; overflow-y: auto; padding: 28px; }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stats-grid .stat-card { min-width: 0; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }

    /* Section card */
    .section-card {
      background: white;
      border-radius: 20px;
      border: 1px solid rgba(99,102,241,0.1);
      box-shadow: 0 2px 12px rgba(79,70,229,0.06);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .section-header {
      padding: 18px 22px 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #F3F4FF;
    }
    .section-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .section-title { font-size: 1rem; font-weight: 700; color: #1E1B4B; margin: 0; }
    .section-body { padding: 16px 20px; }

    .section-link {
      font-size: 0.83rem;
      font-weight: 600;
      color: #4F46E5;
      text-decoration: none;
      display: flex; align-items: center; gap: 3px;
      padding: 6px 13px;
      border: 1.5px solid #C7D2FE;
      border-radius: 8px;
      background: white;
      transition: background 0.2s;
    }
    .section-link:hover { background: #EEF2FF; }

    /* Quick action cards */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (max-width: 600px) { .actions-grid { grid-template-columns: 1fr; } }

    .action-card {
      background: white;
      border-radius: 16px;
      border: 1px solid rgba(99,102,241,0.1);
      padding: 20px 18px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 1px 4px rgba(79,70,229,0.04);
    }
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(79,70,229,0.13);
      border-color: #C7D2FE;
    }
    .action-icon {
      width: 46px; height: 46px;
      border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .action-label { font-size: 0.9rem; font-weight: 700; color: #1E1B4B; margin-bottom: 2px; }
    .action-sub   { font-size: 0.76rem; color: #9CA3AF; }

    /* Pending badge */
    .urgent-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      border: 1.5px solid #FCD34D;
      color: #92400E;
      border-radius: 100px;
      padding: 5px 13px;
      font-size: 0.78rem;
      font-weight: 700;
    }

    /* Timeline items */
    .timeline-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 13px 0;
      border-bottom: 1px solid #F3F4FF;
    }
    .timeline-item:last-child { border-bottom: none; padding-bottom: 0; }
    .tl-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tl-stat { font-size: 1.2rem; font-weight: 800; min-width: 42px; color: #1E1B4B; }
    .tl-label { font-size: 0.85rem; font-weight: 600; color: #374151; }
    .tl-sub   { font-size: 0.75rem; color: #9CA3AF; }
  `],
  template: `
    <div class="outer-wrap">
      <app-header />
      <div class="body-row">
        <app-sidebar />
        <main class="main-content mc-page">

          <!-- Welcome Banner -->
          <div class="welcome-banner anim-fade-in-up"
               style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 48%,#EC4899 100%);background-size:200% 200%;margin-bottom:24px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
              <div style="display:flex;align-items:center;gap:18px">
                <div style="width:62px;height:62px;background:rgba(255,255,255,0.18);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">💼</div>
                <div>
                  <p style="font-size:0.75rem;color:rgba(255,255,255,0.6);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px">Espace secrétariat</p>
                  <h1 style="font-size:1.75rem;font-weight:800;color:white;line-height:1.2;margin-bottom:5px">
                    Bonjour, {{ (auth.currentUser()?.fullName?.split(' ') || [''])[0] }} 👋
                  </h1>
                  <p style="color:rgba(255,255,255,0.72);font-size:0.88rem">Gérez les rendez-vous et les patients de la clinique</p>
                </div>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                @if (stats() && stats().pendingAppointments > 0) {
                  <div class="urgent-badge">
                    <mat-icon style="font-size:14px;width:14px;height:14px">notifications_active</mat-icon>
                    {{ stats().pendingAppointments }} en attente
                  </div>
                }
                <a routerLink="/secretary/appointments"
                   style="display:inline-flex;align-items:center;gap:8px;background:white;color:#4F46E5;border-radius:14px;padding:12px 22px;font-weight:700;font-size:0.87rem;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,0.15);transition:all 0.25s;flex-shrink:0"
                   onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
                  <mat-icon style="font-size:18px;width:18px;height:18px">event_available</mat-icon>
                  Voir les RDV
                </a>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          @if (loading()) {
            <div style="display:flex;justify-content:center;align-items:center;padding:64px">
              <mat-spinner diameter="44"></mat-spinner>
            </div>
          } @else if (stats()) {

            <!-- Stats Grid -->
            <div class="stats-grid anim-fade-in-up delay-100">
              <div class="stat-card stat-amber">
                <mat-icon class="stat-icon">pending_actions</mat-icon>
                <div class="stat-value">{{ stats().pendingAppointments }}</div>
                <div class="stat-label">En attente de confirmation</div>
              </div>
              <div class="stat-card stat-emerald">
                <mat-icon class="stat-icon">check_circle</mat-icon>
                <div class="stat-value">{{ stats().confirmedAppointments }}</div>
                <div class="stat-label">Confirmés ce mois</div>
              </div>
              <div class="stat-card stat-blue">
                <mat-icon class="stat-icon">today</mat-icon>
                <div class="stat-value">{{ stats().todayAppointments }}</div>
                <div class="stat-label">Rendez-vous aujourd'hui</div>
              </div>
              <div class="stat-card stat-indigo">
                <mat-icon class="stat-icon">calendar_month</mat-icon>
                <div class="stat-value">{{ stats().totalAppointments }}</div>
                <div class="stat-label">Total rendez-vous</div>
              </div>
              <div class="stat-card stat-teal">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-value">{{ stats().totalPatients }}</div>
                <div class="stat-label">Patients enregistrés</div>
              </div>
              <div class="stat-card stat-purple">
                <mat-icon class="stat-icon">medical_services</mat-icon>
                <div class="stat-value">{{ stats().totalDoctors }}</div>
                <div class="stat-label">Médecins actifs</div>
              </div>
            </div>

            <!-- Two column layout -->
            <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start" class="anim-fade-in-up delay-200">

              <!-- Overview section -->
              <div class="section-card">
                <div class="section-header">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="section-icon">
                      <mat-icon style="color:white;font-size:18px;width:18px;height:18px">bar_chart</mat-icon>
                    </div>
                    <h3 class="section-title">Aperçu des rendez-vous</h3>
                  </div>
                  <a routerLink="/secretary/appointments" class="section-link">
                    Gérer <mat-icon style="font-size:15px;width:15px;height:15px">arrow_forward</mat-icon>
                  </a>
                </div>
                <div class="section-body">

                  <div class="timeline-item">
                    <div class="tl-dot" style="background:#F59E0B"></div>
                    <div style="flex:1">
                      <div class="tl-label">En attente de confirmation</div>
                      <div class="tl-sub">Nécessitent une action</div>
                    </div>
                    <div class="tl-stat" style="color:#D97706">{{ stats().pendingAppointments }}</div>
                  </div>

                  <div class="timeline-item">
                    <div class="tl-dot" style="background:#10B981"></div>
                    <div style="flex:1">
                      <div class="tl-label">Confirmés</div>
                      <div class="tl-sub">Prêts pour la consultation</div>
                    </div>
                    <div class="tl-stat" style="color:#059669">{{ stats().confirmedAppointments }}</div>
                  </div>

                  <div class="timeline-item">
                    <div class="tl-dot" style="background:#2563EB"></div>
                    <div style="flex:1">
                      <div class="tl-label">Aujourd'hui</div>
                      <div class="tl-sub">Programme du jour</div>
                    </div>
                    <div class="tl-stat" style="color:#1D4ED8">{{ stats().todayAppointments }}</div>
                  </div>

                  <div class="timeline-item">
                    <div class="tl-dot" style="background:#9CA3AF"></div>
                    <div style="flex:1">
                      <div class="tl-label">Total historique</div>
                      <div class="tl-sub">Tous les rendez-vous</div>
                    </div>
                    <div class="tl-stat">{{ stats().totalAppointments }}</div>
                  </div>

                </div>
              </div>

              <!-- Quick actions -->
              <div class="anim-fade-in-up delay-300">
                <p style="font-size:0.85rem;font-weight:700;color:#6B7280;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:14px">Actions rapides</p>
                <div class="actions-grid">
                  @for (a of quickActions; track a.label) {
                    <a [routerLink]="a.route" [queryParams]="a.params || {}" class="action-card">
                      <div class="action-icon" [style.background]="a.bg">{{ a.icon }}</div>
                      <div>
                        <div class="action-label">{{ a.label }}</div>
                        <div class="action-sub">{{ a.sub }}</div>
                      </div>
                    </a>
                  }
                </div>
              </div>

            </div>

          }

        </main>
      </div>
    </div>
  `
})
export class SecretaryDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private secretaryService = inject(SecretaryService);
  private snack = inject(MatSnackBar);

  loading = signal(true);
  stats = signal<any>(null);

  quickActions = [
    { icon: '📋', label: 'Tous les RDV',    sub: 'Voir le planning',      route: '/secretary/appointments', params: {},              bg: '#EEF2FF' },
    { icon: '⏳', label: 'En attente',       sub: 'À confirmer',           route: '/secretary/appointments', params: { status: 'PENDING' },    bg: '#FFFBEB' },
    { icon: '✅', label: 'Confirmés',        sub: 'RDV validés',           route: '/secretary/appointments', params: { status: 'CONFIRMED' },  bg: '#ECFDF5' },
    { icon: '📅', label: "Aujourd'hui",      sub: 'Programme du jour',     route: '/secretary/appointments', params: {},              bg: '#EFF6FF' },
  ];

  ngOnInit(): void {
    this.secretaryService.getStats().subscribe({
      next: res => { this.stats.set(res.data); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snack.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
      }
    });
  }
}

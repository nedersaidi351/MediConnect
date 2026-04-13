import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, HeaderComponent, SidebarComponent],
  styles: [`
    :host { display: block; }

    .outer-wrap { display: flex; flex-direction: column; height: 100vh; font-family: 'Inter', sans-serif; }
    .body-row   { display: flex; flex: 1; overflow: hidden; }
    .main-content { flex: 1; overflow-y: auto; padding: 28px; }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stats-grid .stat-card { min-width: 0; }
    @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 700px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

    /* Alert card */
    .alert-card {
      background: white;
      border-radius: 16px;
      border: 1.5px solid #FCA5A5;
      box-shadow: 0 4px 16px rgba(239,68,68,0.1);
      padding: 20px 24px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .alert-icon {
      width: 46px; height: 46px;
      border-radius: 14px;
      background: #FEF2F2;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* Nav action cards */
    .nav-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 768px) { .nav-grid { grid-template-columns: 1fr; } }

    .nav-card {
      background: white;
      border-radius: 18px;
      border: 1px solid rgba(99,102,241,0.1);
      padding: 24px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      position: relative;
      overflow: hidden;
    }
    .nav-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(79,70,229,0.14);
      border-color: rgba(79,70,229,0.22);
    }
    .nav-card-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .nav-card-title { font-size: 0.97rem; font-weight: 700; color: #1E1B4B; margin-bottom: 3px; }
    .nav-card-sub   { font-size: 0.8rem; color: #9CA3AF; }
  `],
  template: `
    <div class="outer-wrap">
      <app-header />
      <div class="body-row">
        <app-sidebar />
        <main class="main-content mc-page">

          <!-- Welcome Banner -->
          <div class="welcome-banner anim-fade-in-up"
               style="background:linear-gradient(135deg,#1E1B4B 0%,#4F46E5 50%,#0891B2 100%);background-size:200% 200%;margin-bottom:24px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
              <div style="display:flex;align-items:center;gap:18px">
                <div style="width:62px;height:62px;background:rgba(255,255,255,0.18);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">🛡️</div>
                <div>
                  <p style="font-size:0.75rem;color:rgba(255,255,255,0.55);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px">Administration système</p>
                  <h1 style="font-size:1.75rem;font-weight:800;color:white;margin-bottom:5px">Tableau de bord</h1>
                  <p style="color:rgba(255,255,255,0.7);font-size:0.9rem">Vue d'ensemble de la plateforme MediConnect</p>
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-shrink:0">
                <a routerLink="/admin/doctors"
                   style="display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.18);color:white;border:1.5px solid rgba(255,255,255,0.3);border-radius:10px;padding:9px 18px;font-weight:600;font-size:0.85rem;text-decoration:none;backdrop-filter:blur(10px);transition:all 0.25s"
                   onmouseover="this.style.background='rgba(255,255,255,0.28)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">
                  <mat-icon style="font-size:16px;width:16px;height:16px">verified</mat-icon>
                  Vérifications
                </a>
                <a routerLink="/admin/users"
                   style="display:inline-flex;align-items:center;gap:7px;background:white;color:#4F46E5;border-radius:10px;padding:9px 18px;font-weight:700;font-size:0.85rem;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.25s"
                   onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">
                  <mat-icon style="font-size:16px;width:16px;height:16px">people</mat-icon>
                  Utilisateurs
                </a>
              </div>
            </div>
          </div>

          @if (!stats) {
            <div style="display:flex;justify-content:center;align-items:center;padding:64px">
              <mat-spinner diameter="44"></mat-spinner>
            </div>
          } @else {

            <!-- Stats Grid -->
            <div class="stats-grid anim-fade-in-up delay-100">
              <div class="stat-card stat-indigo">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-label">Utilisateurs</div>
              </div>
              <div class="stat-card stat-teal">
                <mat-icon class="stat-icon">medical_services</mat-icon>
                <div class="stat-value">{{ stats.totalDoctors }}</div>
                <div class="stat-label">Médecins</div>
              </div>
              <div class="stat-card stat-blue">
                <mat-icon class="stat-icon">person</mat-icon>
                <div class="stat-value">{{ stats.totalPatients }}</div>
                <div class="stat-label">Patients</div>
              </div>
              <div class="stat-card stat-emerald">
                <mat-icon class="stat-icon">calendar_month</mat-icon>
                <div class="stat-value">{{ stats.totalAppointments }}</div>
                <div class="stat-label">Rendez-vous</div>
              </div>
              <div class="stat-card anim-fade-in-up delay-500"
                   [class]="stats.pendingVerifications > 0 ? 'stat-rose' : 'stat-emerald'">
                <mat-icon class="stat-icon">pending</mat-icon>
                <div class="stat-value">{{ stats.pendingVerifications }}</div>
                <div class="stat-label">Vérifications</div>
              </div>
            </div>

            <!-- Alert card -->
            @if (stats.pendingVerifications > 0) {
              <div class="alert-card anim-fade-in-up delay-400">
                <div class="alert-icon">
                  <mat-icon style="color:#EF4444;font-size:22px;width:22px;height:22px">warning_amber</mat-icon>
                </div>
                <div style="flex:1">
                  <p style="font-weight:700;color:#991B1B;margin-bottom:3px">
                    {{ stats.pendingVerifications }} médecin(s) en attente de validation
                  </p>
                  <p style="font-size:0.84rem;color:#6B7280">Validez les comptes médecins pour qu'ils puissent recevoir des rendez-vous.</p>
                </div>
                <a routerLink="/admin/doctors"
                   style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;border-radius:10px;padding:9px 18px;font-weight:600;font-size:0.85rem;text-decoration:none;flex-shrink:0;box-shadow:0 4px 12px rgba(239,68,68,0.35);transition:all 0.25s"
                   onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">
                  <mat-icon style="font-size:16px;width:16px;height:16px">verified</mat-icon>
                  Traiter maintenant
                </a>
              </div>
            }

            <!-- Nav Action Cards -->
            <div class="nav-grid anim-fade-in-up delay-500">
              @for (a of adminActions; track a.label) {
                <a [routerLink]="a.route" class="nav-card">
                  <div class="nav-card-icon" [style.background]="a.bg">{{ a.icon }}</div>
                  <div style="flex:1">
                    <p class="nav-card-title">{{ a.label }}</p>
                    <p class="nav-card-sub">{{ a.sub }}</p>
                  </div>
                  <mat-icon style="color:#C7D2FE;flex-shrink:0;font-size:18px;width:18px;height:18px">arrow_forward_ios</mat-icon>
                </a>
              }
            </div>

          }

        </main>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminSvc = inject(AdminService);
  stats: any = null;

  adminActions = [
    { icon: '👥', label: 'Gestion utilisateurs',  sub: 'Activer / désactiver les comptes',  route: '/admin/users',    bg: '#EEF2FF' },
    { icon: '🩺', label: 'Validation médecins',    sub: 'Vérifier les profils médicaux',     route: '/admin/doctors',  bg: '#E0F2FE' },
    { icon: '📊', label: 'Statistiques',           sub: "Vue d'ensemble de la plateforme",   route: '/admin/dashboard', bg: '#F0FDF4' },
  ];

  ngOnInit(): void {
    this.adminSvc.getDashboardStats().subscribe(s => this.stats = s);
  }
}

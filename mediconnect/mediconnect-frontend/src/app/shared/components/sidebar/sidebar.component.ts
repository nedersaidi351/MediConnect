import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; emoji: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  styles: [`
    :host { display: block; height: 100%; }

    .sidebar {
      width: 240px;
      height: 100%;
      background: white;
      border-right: 1px solid rgba(99,102,241,0.1);
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .sidebar::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #4F46E5, #7C3AED, #0891B2);
    }

    .nav-section {
      padding: 12px 10px;
      flex: 1;
      overflow-y: auto;
    }
    .nav-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #9CA3AF;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 8px 10px 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 12px;
      border-radius: 12px;
      text-decoration: none;
      color: #6B7280;
      font-size: 0.87rem;
      font-weight: 500;
      margin-bottom: 2px;
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
      position: relative;
      cursor: pointer;
      border: 1.5px solid transparent;
    }
    .nav-link:hover {
      background: #F5F3FF;
      color: #4F46E5;
      border-color: rgba(79,70,229,0.1);
    }
    .nav-link.active-link {
      background: linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.06));
      color: #4F46E5;
      font-weight: 700;
      border-color: rgba(79,70,229,0.2);
    }
    .nav-link.active-link .nav-icon-wrap {
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      box-shadow: 0 4px 10px rgba(79,70,229,0.35);
    }
    .nav-link.active-link .nav-icon-wrap mat-icon { color: white; }
    .nav-link.active-link::before {
      content: '';
      position: absolute;
      left: 0; top: 20%; bottom: 20%;
      width: 3px;
      background: linear-gradient(to bottom, #4F46E5, #7C3AED);
      border-radius: 0 3px 3px 0;
    }

    .nav-icon-wrap {
      width: 32px; height: 32px;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      background: #F3F4F6;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .nav-link:hover .nav-icon-wrap {
      background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08));
    }
    .nav-icon-wrap mat-icon {
      font-size: 18px !important; width: 18px !important; height: 18px !important;
      color: #9CA3AF;
    }

    .user-footer {
      border-top: 1px solid #F3F4FF;
      padding: 14px 14px;
    }
    .user-chip {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: linear-gradient(135deg, #F5F3FF, #EEF2FF);
      border: 1px solid rgba(79,70,229,0.12);
    }
    .user-avatar {
      width: 34px; height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 0.85rem;
      flex-shrink: 0;
    }
  `],
  template: `
    <div class="sidebar">

      <!-- Nav -->
      <div class="nav-section">
        <p class="nav-label">Navigation</p>
        @for (item of navItems; track item.route) {
          <a class="nav-link" [routerLink]="item.route"
             routerLinkActive="active-link">
            <div class="nav-icon-wrap">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <span>{{ item.label }}</span>
          </a>
        }
      </div>

      <!-- User footer -->
      <div class="user-footer">
        <div class="user-chip">
          <div class="user-avatar">
            {{ auth.currentUser()?.fullName?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div style="flex:1;min-width:0">
            <p style="font-size:0.82rem;font-weight:700;color:#1E1B4B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ auth.currentUser()?.fullName }}
            </p>
            <p style="font-size:0.7rem;color:#7C3AED;font-weight:600">{{ roleLabel }}</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class SidebarComponent {
  auth = inject(AuthService);

  get roleLabel(): string {
    const map: Record<string,string> = { PATIENT:'Patient', DOCTOR:'Médecin', ADMIN:'Administrateur', SECRETARY:'Secrétaire' };
    return map[this.auth.getRole() || ''] || '';
  }

  get navItems(): NavItem[] {
    const role = this.auth.getRole();
    if (role === 'PATIENT') return [
      { label: 'Tableau de bord', icon: 'dashboard',      route: '/patient/dashboard',     emoji: '🏠' },
      { label: 'Trouver un médecin', icon: 'search',      route: '/patient/doctors',       emoji: '🔍' },
      { label: 'Mes rendez-vous', icon: 'calendar_today', route: '/patient/appointments',  emoji: '📅' },
      { label: 'Mon profil',      icon: 'person',         route: '/patient/profile',       emoji: '👤' },
    ];
    if (role === 'DOCTOR') return [
      { label: 'Tableau de bord',  icon: 'dashboard',      route: '/doctor/dashboard',    emoji: '🏠' },
      { label: 'Rendez-vous',      icon: 'calendar_today', route: '/doctor/appointments', emoji: '📅' },
      { label: 'Planning du jour', icon: 'today',          route: '/doctor/schedule',     emoji: '🗓️' },
      { label: 'Disponibilités',   icon: 'schedule',       route: '/doctor/availability', emoji: '⏰' },
      { label: 'Mon profil',       icon: 'badge',          route: '/doctor/profile',      emoji: '👤' },
    ];
    if (role === 'ADMIN') return [
      { label: 'Tableau de bord', icon: 'dashboard',        route: '/admin/dashboard', emoji: '🏠' },
      { label: 'Utilisateurs',    icon: 'people',           route: '/admin/users',     emoji: '👥' },
      { label: 'Médecins',        icon: 'medical_services', route: '/admin/doctors',   emoji: '🩺' },
    ];
    if (role === 'SECRETARY') return [
      { label: 'Tableau de bord', icon: 'dashboard',      route: '/secretary/dashboard',    emoji: '🏠' },
      { label: 'Rendez-vous',     icon: 'calendar_month', route: '/secretary/appointments', emoji: '📅' },
    ];
    return [];
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatbotWidgetComponent } from '../chatbot/chatbot-widget.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule,
    ChatbotWidgetComponent
  ],
  styles: [`
    :host { display: block; }
    .header {
      height: 62px;
      background: linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6D28D9 100%);
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 12px;
      box-shadow: 0 2px 20px rgba(79,70,229,0.3), 0 1px 4px rgba(0,0,0,0.1);
      position: relative;
      z-index: 100;
      font-family: 'Inter', sans-serif;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      cursor: pointer;
    }
    .logo-icon {
      width: 34px; height: 34px;
      background: rgba(255,255,255,0.18);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      border: 1px solid rgba(255,255,255,0.25);
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 1.08rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.01em;
    }
    .logo-sub {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.6);
      font-weight: 500;
      margin-top: -1px;
    }

    .icon-btn {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.18);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.22); transform: translateY(-1px); }
    .icon-btn mat-icon { color: white; font-size: 20px !important; width: 20px !important; height: 20px !important; }

    .notif-badge {
      position: absolute;
      top: -4px; right: -4px;
      width: 18px; height: 18px;
      background: #EF4444;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: white;
      border: 2px solid #4F46E5;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.12); }
    }

    .user-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 12px 5px 5px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .user-btn:hover { background: rgba(255,255,255,0.22); }
    .user-avatar {
      width: 30px; height: 30px;
      border-radius: 8px;
      background: white;
      color: #4F46E5;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.82rem;
      flex-shrink: 0;
    }
    .user-name { font-size: 0.82rem; font-weight: 600; color: white; }
    .user-role { font-size: 0.68rem; color: rgba(255,255,255,0.65); }

    .notif-menu { min-width: 300px; }
    .notif-item { padding: 12px 16px; display: flex; gap: 10px; align-items: flex-start; }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #4F46E5; flex-shrink: 0; margin-top: 5px; }
  `],
  template: `
    <!-- Chatbot widget (fixed position, renders on every page) -->
    <app-chatbot-widget />

    <header class="header">

      <!-- Logo -->
      <a routerLink="/" class="logo" style="text-decoration:none">
        <div class="logo-icon">🏥</div>
        <div>
          <div class="logo-text">MediConnect</div>
          <div class="logo-sub">Consultation médicale</div>
        </div>
      </a>

      <div style="flex:1"></div>

      <!-- Notification bell -->
      <div class="icon-btn" [matMenuTriggerFor]="notifMenu">
        <mat-icon>notifications</mat-icon>
        @if (unreadCount() > 0) {
          <span class="notif-badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
        }
      </div>

      <mat-menu #notifMenu="matMenu" class="notif-menu">
        <div style="padding:14px 16px 10px;border-bottom:1px solid #F3F4FF">
          <p style="font-weight:700;font-size:0.92rem;color:#1E1B4B">Notifications</p>
          @if (unreadCount() > 0) {
            <p style="font-size:0.78rem;color:#6B7280;margin-top:2px">{{ unreadCount() }} non lue(s)</p>
          }
        </div>
        <div style="padding:8px">
          @if (unreadCount() === 0) {
            <div style="padding:20px;text-align:center;color:#9CA3AF;font-size:0.85rem">
              <span style="font-size:1.8rem;display:block;margin-bottom:6px">🔔</span>
              Aucune notification
            </div>
          } @else {
            <div class="notif-item">
              <div class="notif-dot"></div>
              <div>
                <p style="font-size:0.85rem;font-weight:600;color:#1E1B4B">{{ unreadCount() }} nouvelle(s) notification(s)</p>
              </div>
            </div>
            <div style="padding:6px 8px">
              <button mat-button color="primary" style="width:100%;font-size:0.83rem;font-weight:600"
                      (click)="markAllRead()">Tout marquer comme lu</button>
            </div>
          }
        </div>
      </mat-menu>

      <!-- User menu -->
      <div class="user-btn" [matMenuTriggerFor]="userMenu">
        <div class="user-avatar">
          {{ auth.currentUser()?.fullName?.charAt(0)?.toUpperCase() || '?' }}
        </div>
        <div class="hidden md:block">
          <div class="user-name">{{ (auth.currentUser()?.fullName?.split(' ') || [''])[0] }}</div>
          <div class="user-role">{{ roleLabel }}</div>
        </div>
        <mat-icon style="color:rgba(255,255,255,0.7);font-size:16px;width:16px;height:16px">expand_more</mat-icon>
      </div>

      <mat-menu #userMenu="matMenu">
        <div style="padding:14px 18px 12px;border-bottom:1px solid #F3F4FF">
          <p style="font-weight:700;font-size:0.9rem;color:#1E1B4B">{{ auth.currentUser()?.fullName }}</p>
          <p style="font-size:0.76rem;color:#7C3AED;font-weight:600;margin-top:1px">{{ roleLabel }}</p>
          <p style="font-size:0.76rem;color:#9CA3AF;margin-top:1px">{{ auth.currentUser()?.email }}</p>
        </div>
        <div style="padding:6px">
          <button mat-menu-item (click)="auth.logout()"
                  style="border-radius:8px;color:#EF4444;font-weight:600;font-size:0.87rem">
            <mat-icon style="color:#EF4444">logout</mat-icon>
            Se déconnecter
          </button>
        </div>
      </mat-menu>

    </header>
  `
})
export class HeaderComponent implements OnInit {
  auth = inject(AuthService);
  private notifSvc = inject(NotificationService);

  unreadCount = signal(0);

  get roleLabel(): string {
    const map: Record<string,string> = { PATIENT:'Patient', DOCTOR:'Médecin', ADMIN:'Administrateur', SECRETARY:'Secrétaire' };
    return map[this.auth.getRole() || ''] || '';
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.notifSvc.getUnreadCount().subscribe(c => this.unreadCount.set(c));
    }
  }

  markAllRead(): void {
    this.notifSvc.markAllRead().subscribe(() => this.unreadCount.set(0));
  }
}

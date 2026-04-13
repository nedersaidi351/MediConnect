import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h2 class="text-2xl font-bold text-gray-800">Bienvenue, {{ user()?.fullName }} 👋</h2>
          <p class="text-gray-500 mt-1">Vous êtes connecté en tant que {{ user()?.role }}</p>
        </main>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.currentUser;

  ngOnInit(): void {
    this.auth.redirectToDashboard();
  }
}

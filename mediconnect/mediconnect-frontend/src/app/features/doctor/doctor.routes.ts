import { Routes } from '@angular/router';

export const doctorRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('../dashboard/dashboard.component').then(c => c.DashboardComponent) },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(c => c.DoctorProfileComponent) },
];


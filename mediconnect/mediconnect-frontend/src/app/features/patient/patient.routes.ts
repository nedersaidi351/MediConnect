// Placeholder for patient routes
import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('../dashboard/dashboard.component').then(c => c.DashboardComponent) },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(c => c.PatientProfileComponent) },
  { path: 'appointments', loadComponent: () => import('./appointments/appointments.component').then(c => c.AppointmentsComponent) },
  { path: 'doctors', loadComponent: () => import('./doctors/doctors.component').then(c => c.DoctorsComponent) },
];


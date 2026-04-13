import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/patient/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
      { path: 'doctors', loadComponent: () => import('./features/patient/search-doctors/search-doctors.component').then(m => m.SearchDoctorsComponent) },
      { path: 'appointments', loadComponent: () => import('./features/patient/appointments/appointments.component').then(m => m.AppointmentsComponent) },
      { path: 'profile', loadComponent: () => import('./features/patient/profile/profile.component').then(m => m.PatientProfileComponent) },
      { path: 'chat/:appointmentId', loadComponent: () => import('./features/patient/chat/chat.component').then(m => m.ChatComponent) },
    ]
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard],
    data: { role: 'DOCTOR' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'profile', loadComponent: () => import('./features/doctor/profile/doctor-profile.component').then(m => m.DoctorProfileComponent) },
      { path: 'schedule', loadComponent: () => import('./features/doctor/schedule/schedule.component').then(m => m.ScheduleComponent) },
      { path: 'availability', loadComponent: () => import('./features/doctor/availability/availability.component').then(m => m.AvailabilityComponent) },
      { path: 'appointments', loadComponent: () => import('./features/doctor/appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent) },
      { path: 'consultation/:appointmentId', loadComponent: () => import('./features/doctor/consultation/consultation.component').then(m => m.ConsultationComponent) },
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'doctors', loadComponent: () => import('./features/admin/doctors/admin-doctors.component').then(m => m.AdminDoctorsComponent) },
    ]
  },
  {
    path: 'secretary',
    canActivate: [authGuard, roleGuard],
    data: { role: 'SECRETARY' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/secretary/secretary-dashboard/secretary-dashboard.component').then(m => m.SecretaryDashboardComponent) },
      { path: 'appointments', loadComponent: () => import('./features/secretary/secretary-appointments/secretary-appointments.component').then(m => m.SecretaryAppointmentsComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];

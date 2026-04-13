import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatTabsModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Mes rendez-vous</h1>
            <a mat-raised-button color="primary" routerLink="/patient/doctors">
              <mat-icon>add</mat-icon> Nouveau RDV
            </a>
          </div>

          <mat-tab-group>
            <mat-tab label="À venir">
              <ng-template matTabContent>
                <div class="pt-4">
                  @if (loading) { <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div> }
                  @else if (upcoming.length === 0) {
                    <div class="text-center py-12 text-gray-400">
                      <mat-icon class="text-5xl">event_busy</mat-icon>
                      <p>Aucun rendez-vous à venir</p>
                    </div>
                  } @else {
                    @for (a of upcoming; track a.id) {
                      <ng-container *ngTemplateOutlet="apptCard; context: { a: a }"></ng-container>
                    }
                  }
                </div>
              </ng-template>
            </mat-tab>
            <mat-tab label="Passés">
              <ng-template matTabContent>
                <div class="pt-4">
                  @for (a of past; track a.id) {
                    <ng-container *ngTemplateOutlet="apptCard; context: { a: a }"></ng-container>
                  }
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>

          <ng-template #apptCard let-a="a">
            <mat-card class="mb-3">
              <mat-card-content class="py-4">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-gray-800 text-lg">Dr. {{ a.doctorName }}</p>
                    <p class="text-indigo-600 text-sm">{{ a.specialty }}</p>
                    <p class="text-gray-500 text-sm mt-1">
                      <mat-icon class="text-base align-middle">calendar_today</mat-icon>
                      {{ a.appointmentDate }} à {{ a.startTime }}
                    </p>
                    <p class="text-gray-400 text-xs mt-1">
                      <mat-icon class="text-base align-middle">videocam</mat-icon>
                      {{ typeLabel(a.type) }}
                    </p>
                    @if (a.reason) {
                      <p class="text-gray-500 text-sm mt-1">{{ a.reason }}</p>
                    }
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <mat-chip class="{{ statusClass(a.status) }} text-xs">{{ statusLabel(a.status) }}</mat-chip>
                    @if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
                      <button mat-stroked-button color="warn" (click)="cancel(a)">Annuler</button>
                    }
                    @if (a.type === 'CHAT' && a.status === 'CONFIRMED') {
                      <a mat-raised-button color="primary" [routerLink]="['/patient/chat', a.id]">Chat</a>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </main>
      </div>
    </div>
  `
})
export class AppointmentsComponent implements OnInit {
  private apptSvc = inject(AppointmentService);
  private snack = inject(MatSnackBar);

  all: Appointment[] = [];
  loading = false;

  get upcoming() { return this.all.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED'); }
  get past() { return this.all.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED'); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.apptSvc.getMyAppointments(0, 50).subscribe({
      next: res => { this.all = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  cancel(a: Appointment): void {
    this.apptSvc.cancel(a.id).subscribe({
      next: () => { this.snack.open('Rendez-vous annulé.', 'Fermer', { duration: 3000 }); this.load(); },
      error: (err) => this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }

  statusClass(s: string): string {
    return { PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700', COMPLETED: 'bg-blue-100 text-blue-700' }[s] ?? '';
  }

  statusLabel(s: string): string {
    return { PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Terminé' }[s] ?? s;
  }

  typeLabel(t: string): string {
    return { VIDEO: 'Vidéo', AUDIO: 'Audio', CHAT: 'Chat' }[t] ?? t;
  }
}

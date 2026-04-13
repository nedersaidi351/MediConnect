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
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatTabsModule, MatProgressSpinnerModule, MatSnackBarModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Gestion des rendez-vous</h1>
          @if (loading) {
            <div class="flex justify-center py-12"><mat-spinner></mat-spinner></div>
          } @else {
            <mat-tab-group>
              <mat-tab label="En attente ({{ pending.length }})">
                <ng-template matTabContent>
                  <div class="pt-4">
                    @for (a of pending; track a.id) {
                      <mat-card class="mb-3">
                        <mat-card-content class="py-4">
                          <div class="flex items-start justify-between">
                            <div>
                              <p class="font-semibold text-lg">{{ a.patientName }}</p>
                              <p class="text-gray-500 text-sm">{{ a.appointmentDate }} à {{ a.startTime }} - {{ a.endTime }}</p>
                              <p class="text-gray-400 text-xs">{{ typeLabel(a.type) }}</p>
                              @if (a.reason) { <p class="text-gray-600 text-sm mt-1">{{ a.reason }}</p> }
                            </div>
                            <div class="flex gap-2">
                              <button mat-raised-button color="primary" (click)="confirm(a)">Confirmer</button>
                              <button mat-stroked-button color="warn" (click)="cancel(a)">Refuser</button>
                            </div>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                    @if (pending.length === 0) {
                      <div class="text-center py-12 text-gray-400">
                        <mat-icon class="text-5xl">event_available</mat-icon>
                        <p>Aucun rendez-vous en attente</p>
                      </div>
                    }
                  </div>
                </ng-template>
              </mat-tab>
              <mat-tab label="Confirmés ({{ confirmed.length }})">
                <ng-template matTabContent>
                  <div class="pt-4">
                    @for (a of confirmed; track a.id) {
                      <mat-card class="mb-3">
                        <mat-card-content class="py-4">
                          <div class="flex items-start justify-between">
                            <div>
                              <p class="font-semibold text-lg">{{ a.patientName }}</p>
                              <p class="text-gray-500 text-sm">{{ a.appointmentDate }} à {{ a.startTime }}</p>
                              <p class="text-gray-400 text-xs">{{ typeLabel(a.type) }}</p>
                            </div>
                            <div class="flex gap-2">
                              <a mat-raised-button color="primary" [routerLink]="['/doctor/consultation', a.id]">
                                Démarrer consultation
                              </a>
                              <button mat-stroked-button color="warn" (click)="cancel(a)">Annuler</button>
                            </div>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                </ng-template>
              </mat-tab>
              <mat-tab label="Historique">
                <ng-template matTabContent>
                  <div class="pt-4">
                    @for (a of completed; track a.id) {
                      <mat-card class="mb-3">
                        <mat-card-content class="py-3">
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="font-semibold">{{ a.patientName }}</p>
                              <p class="text-gray-500 text-sm">{{ a.appointmentDate }}</p>
                            </div>
                            <mat-chip class="bg-blue-100 text-blue-700">Terminé</mat-chip>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                </ng-template>
              </mat-tab>
            </mat-tab-group>
          }
        </main>
      </div>
    </div>
  `
})
export class DoctorAppointmentsComponent implements OnInit {
  private apptSvc = inject(AppointmentService);
  private snack = inject(MatSnackBar);

  all: Appointment[] = [];
  loading = false;

  get pending() { return this.all.filter(a => a.status === 'PENDING'); }
  get confirmed() { return this.all.filter(a => a.status === 'CONFIRMED'); }
  get completed() { return this.all.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED'); }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.apptSvc.getDoctorAppointments(0, 100).subscribe({
      next: r => { this.all = r.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirm(a: Appointment): void {
    this.apptSvc.confirm(a.id).subscribe({
      next: () => { this.snack.open('Confirmé !', 'Fermer', { duration: 3000 }); this.load(); },
      error: (e) => this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }

  cancel(a: Appointment): void {
    this.apptSvc.cancel(a.id).subscribe({
      next: () => { this.snack.open('Annulé.', 'Fermer', { duration: 3000 }); this.load(); },
      error: (e) => this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }

  typeLabel(t: string): string {
    return { VIDEO: 'Vidéo', AUDIO: 'Audio', CHAT: 'Chat' }[t] ?? t;
  }
}

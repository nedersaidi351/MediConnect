import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SecretaryService } from '../../../core/services/secretary.service';

@Component({
  selector: 'app-secretary-appointments',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatTabsModule,
    MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
    MatSelectModule, MatDialogModule, MatSnackBarModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">

          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Gestion des rendez-vous</h1>
              <p class="text-gray-500 mt-1">Confirmez, annulez ou envoyez des rappels aux patients</p>
            </div>
          </div>

          <!-- Filter Tabs -->
          <mat-tab-group (selectedIndexChange)="onTabChange($event)" class="mb-4">
            <mat-tab label="Tous"></mat-tab>
            <mat-tab label="En attente"></mat-tab>
            <mat-tab label="Confirmés"></mat-tab>
            <mat-tab label="Annulés"></mat-tab>
          </mat-tab-group>

          @if (loading()) {
            <div class="flex justify-center py-12">
              <mat-spinner diameter="48"></mat-spinner>
            </div>
          } @else if (appointments().length === 0) {
            <mat-card>
              <mat-card-content class="p-8 text-center">
                <mat-icon class="text-gray-300 text-6xl" style="font-size: 64px; width: 64px; height: 64px">event_busy</mat-icon>
                <p class="text-gray-500 mt-3">Aucun rendez-vous trouvé</p>
              </mat-card-content>
            </mat-card>
          } @else {
            <div class="space-y-3">
              @for (appt of appointments(); track appt.id) {
                <mat-card class="hover:shadow-md transition-shadow">
                  <mat-card-content class="p-4">
                    <div class="flex items-start justify-between gap-4">

                      <!-- Left Info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                          <span class="font-semibold text-gray-800">{{ appt.patientName }}</span>
                          <span class="text-gray-400 text-sm">→</span>
                          <span class="text-indigo-600 font-medium text-sm">Dr. {{ appt.doctorName }}</span>
                          <span class="text-gray-400 text-xs">({{ appt.specialty }})</span>
                        </div>
                        <div class="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span class="flex items-center gap-1">
                            <mat-icon class="text-sm" style="font-size: 16px; width: 16px; height: 16px">calendar_today</mat-icon>
                            {{ appt.appointmentDate | date:'dd/MM/yyyy' }}
                          </span>
                          <span class="flex items-center gap-1">
                            <mat-icon class="text-sm" style="font-size: 16px; width: 16px; height: 16px">schedule</mat-icon>
                            {{ appt.startTime }} – {{ appt.endTime }}
                          </span>
                          <span class="flex items-center gap-1">
                            <mat-icon class="text-sm" style="font-size: 16px; width: 16px; height: 16px">{{ typeIcon(appt.type) }}</mat-icon>
                            {{ appt.type }}
                          </span>
                        </div>
                        @if (appt.reason) {
                          <p class="text-xs text-gray-500 mt-1 italic">{{ appt.reason }}</p>
                        }
                      </div>

                      <!-- Status + Actions -->
                      <div class="flex flex-col items-end gap-2 flex-shrink-0">
                        <span [class]="statusClass(appt.status)"
                              class="px-2 py-0.5 rounded-full text-xs font-medium">
                          {{ statusLabel(appt.status) }}
                        </span>

                        <div class="flex gap-1">
                          @if (appt.status === 'PENDING') {
                            <button mat-icon-button color="primary"
                                    matTooltip="Confirmer"
                                    [disabled]="actionLoading()[appt.id]"
                                    (click)="confirm(appt.id)">
                              <mat-icon>check_circle</mat-icon>
                            </button>
                          }
                          @if (appt.status === 'PENDING' || appt.status === 'CONFIRMED') {
                            <button mat-icon-button color="warn"
                                    matTooltip="Annuler"
                                    [disabled]="actionLoading()[appt.id]"
                                    (click)="cancel(appt.id)">
                              <mat-icon>cancel</mat-icon>
                            </button>
                            <button mat-icon-button
                                    matTooltip="Envoyer un rappel"
                                    [disabled]="actionLoading()[appt.id]"
                                    (click)="sendReminder(appt.id)">
                              <mat-icon>notifications</mat-icon>
                            </button>
                          }
                        </div>
                      </div>

                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="flex justify-center gap-2 mt-6">
                <button mat-stroked-button [disabled]="currentPage() === 0" (click)="changePage(currentPage() - 1)">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <span class="flex items-center px-4 text-sm text-gray-600">
                  Page {{ currentPage() + 1 }} / {{ totalPages() }}
                </span>
                <button mat-stroked-button [disabled]="currentPage() >= totalPages() - 1" (click)="changePage(currentPage() + 1)">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            }
          }

        </main>
      </div>
    </div>
  `
})
export class SecretaryAppointmentsComponent implements OnInit {
  private secretaryService = inject(SecretaryService);
  private snack = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  appointments = signal<any[]>([]);
  actionLoading = signal<Record<number, boolean>>({});
  currentPage = signal(0);
  totalPages = signal(0);

  private readonly STATUS_FILTERS = [undefined, 'PENDING', 'CONFIRMED', 'CANCELLED'];
  private currentStatus: string | undefined = undefined;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        const idx = this.STATUS_FILTERS.indexOf(params['status']);
        if (idx >= 0) this.currentStatus = params['status'];
      }
      this.load();
    });
  }

  onTabChange(index: number): void {
    this.currentStatus = this.STATUS_FILTERS[index];
    this.currentPage.set(0);
    this.load();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  confirm(id: number): void {
    this.setActionLoading(id, true);
    this.secretaryService.confirmAppointment(id).subscribe({
      next: () => { this.snack.open('Rendez-vous confirmé', 'OK', { duration: 3000 }); this.load(); },
      error: (err) => { this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 3000 }); this.setActionLoading(id, false); }
    });
  }

  cancel(id: number): void {
    const reason = prompt('Raison de l\'annulation (optionnel) :') ?? undefined;
    this.setActionLoading(id, true);
    this.secretaryService.cancelAppointment(id, reason).subscribe({
      next: () => { this.snack.open('Rendez-vous annulé', 'OK', { duration: 3000 }); this.load(); },
      error: (err) => { this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 3000 }); this.setActionLoading(id, false); }
    });
  }

  sendReminder(id: number): void {
    this.setActionLoading(id, true);
    this.secretaryService.sendReminder(id).subscribe({
      next: () => { this.snack.open('Rappel envoyé au patient', 'OK', { duration: 3000 }); this.setActionLoading(id, false); },
      error: (err) => { this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 3000 }); this.setActionLoading(id, false); }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé',
      CANCELLED: 'Annulé', COMPLETED: 'Terminé', NO_SHOW: 'Absent'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-orange-100 text-orange-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      NO_SHOW: 'bg-gray-100 text-gray-700'
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = { VIDEO: 'videocam', AUDIO: 'call', CHAT: 'chat' };
    return map[type] ?? 'event';
  }

  private load(): void {
    this.loading.set(true);
    this.secretaryService.getAppointments(this.currentPage(), 10, this.currentStatus).subscribe({
      next: res => {
        this.appointments.set(res.data?.content ?? []);
        this.totalPages.set(res.data?.totalPages ?? 0);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.snack.open('Erreur de chargement', 'Fermer', { duration: 3000 }); }
    });
  }

  private setActionLoading(id: number, val: boolean): void {
    this.actionLoading.update(m => ({ ...m, [id]: val }));
  }
}

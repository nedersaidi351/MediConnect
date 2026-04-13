import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatDatepickerModule, MatNativeDateModule, MatIconModule, MatChipsModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Planning du jour</h1>
          <mat-card class="mb-6">
            <mat-card-content class="pt-4">
              <div class="flex gap-3 items-center">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="dp" [formControl]="dateCtrl">
                  <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
                  <mat-datepicker #dp></mat-datepicker>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="load()">Afficher</button>
              </div>
            </mat-card-content>
          </mat-card>
          @if (appointments.length === 0) {
            <div class="text-center py-12 text-gray-400">
              <mat-icon class="text-5xl">event_busy</mat-icon>
              <p>Aucun rendez-vous ce jour</p>
            </div>
          } @else {
            <div class="flex flex-col gap-3">
              @for (a of appointments; track a.id) {
                <mat-card>
                  <mat-card-content class="py-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div class="text-center">
                          <div class="text-xl font-bold text-indigo-600">{{ a.startTime }}</div>
                          <div class="text-xs text-gray-400">{{ a.endTime }}</div>
                        </div>
                        <div>
                          <p class="font-semibold">{{ a.patientName }}</p>
                          <p class="text-gray-500 text-sm">{{ a.type }}</p>
                          @if (a.reason) { <p class="text-gray-400 text-xs">{{ a.reason }}</p> }
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <mat-chip>{{ statusLabel(a.status) }}</mat-chip>
                        @if (a.status === 'CONFIRMED') {
                          <a mat-raised-button color="primary" [routerLink]="['/doctor/consultation', a.id]">
                            Consultation
                          </a>
                        }
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `
})
export class ScheduleComponent implements OnInit {
  private apptSvc = inject(AppointmentService);
  private fb = inject(FormBuilder);

  appointments: Appointment[] = [];
  dateCtrl = this.fb.control(new Date());

  ngOnInit(): void { this.load(); }

  load(): void {
    const d = this.dateCtrl.value;
    if (!d) return;
    const dateStr = new Date(d).toISOString().split('T')[0];
    this.apptSvc.getDailySchedule(dateStr).subscribe(r => this.appointments = r);
  }

  statusLabel(s: string): string {
    return { PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Terminé' }[s] ?? s;
  }
}

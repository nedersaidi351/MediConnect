import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, MatStepperModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Consultation #{{ appointmentId }}</h1>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <mat-card class="lg:col-span-1">
              <mat-card-header><mat-card-title>Informations RDV</mat-card-title></mat-card-header>
              <mat-card-content class="pt-4">
                @if (appointment) {
                  <p><strong>Patient:</strong> {{ appointment.patientName }}</p>
                  <p><strong>Date:</strong> {{ appointment.appointmentDate }}</p>
                  <p><strong>Heure:</strong> {{ appointment.startTime }}</p>
                  <p><strong>Type:</strong> {{ appointment.type }}</p>
                  @if (appointment.reason) { <p><strong>Motif:</strong> {{ appointment.reason }}</p> }
                }
                <div class="mt-4 flex flex-col gap-2">
                  @if (!consultationStarted) {
                    <button mat-raised-button color="primary" (click)="startConsultation()">
                      <mat-icon>play_arrow</mat-icon> Démarrer
                    </button>
                  }
                  @if (consultationStarted && !consultationEnded) {
                    <button mat-raised-button color="warn" (click)="endConsultation()">
                      <mat-icon>stop</mat-icon> Terminer
                    </button>
                  }
                </div>
              </mat-card-content>
            </mat-card>
            <mat-card class="lg:col-span-2">
              <mat-card-header><mat-card-title>Notes de consultation</mat-card-title></mat-card-header>
              <mat-card-content class="pt-4">
                <form [formGroup]="notesForm" class="flex flex-col gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Diagnostic</mat-label>
                    <textarea matInput formControlName="diagnosis" rows="4" placeholder="Diagnostic médical..."></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Prescription / Ordonnance</mat-label>
                    <textarea matInput formControlName="prescription" rows="4" placeholder="Médicaments, posologie..."></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Notes complémentaires</mat-label>
                    <textarea matInput formControlName="notes" rows="3"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Date de suivi</mat-label>
                    <input matInput [matDatepicker]="dp" formControlName="followUpDate">
                    <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
                    <mat-datepicker #dp></mat-datepicker>
                  </mat-form-field>
                  <div class="flex justify-end gap-2">
                    <button mat-stroked-button color="primary" (click)="saveNotes()" [disabled]="saving">
                      Sauvegarder
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </main>
      </div>
    </div>
  `
})
export class ConsultationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultSvc = inject(ConsultationService);
  private apptSvc = inject(AppointmentService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  appointmentId!: number;
  appointment: any = null;
  consultationStarted = false;
  consultationEnded = false;
  saving = false;

  notesForm = this.fb.group({
    diagnosis: [''],
    prescription: [''],
    notes: [''],
    followUpDate: [null]
  });

  ngOnInit(): void {
    this.appointmentId = +this.route.snapshot.paramMap.get('appointmentId')!;
    this.apptSvc.getById(this.appointmentId).subscribe(a => {
      this.appointment = a;
      if (a.status === 'COMPLETED') { this.consultationStarted = true; this.consultationEnded = true; }
    });
    this.consultSvc.get(this.appointmentId).subscribe({
      next: c => {
        this.consultationStarted = true;
        if (c.endedAt) this.consultationEnded = true;
        this.notesForm.patchValue(c);
      },
      error: () => {}
    });
  }

  startConsultation(): void {
    this.consultSvc.start(this.appointmentId).subscribe({
      next: () => { this.consultationStarted = true; this.snack.open('Consultation démarrée.', 'Fermer', { duration: 3000 }); },
      error: (e) => this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }

  saveNotes(): void {
    this.saving = true;
    this.consultSvc.saveNotes(this.appointmentId, this.notesForm.value).subscribe({
      next: () => { this.saving = false; this.snack.open('Notes sauvegardées.', 'Fermer', { duration: 3000 }); },
      error: (e) => { this.saving = false; this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 }); }
    });
  }

  endConsultation(): void {
    this.consultSvc.end(this.appointmentId).subscribe({
      next: () => {
        this.consultationEnded = true;
        this.snack.open('Consultation terminée !', 'Fermer', { duration: 3000 });
        this.router.navigate(['/doctor/appointments']);
      },
      error: (e) => this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }
}

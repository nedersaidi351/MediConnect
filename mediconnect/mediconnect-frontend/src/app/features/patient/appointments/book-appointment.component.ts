import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorProfile } from '../../../models/doctor.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Prendre un rendez-vous</h2>
    <p class="px-6 text-gray-600">Dr. {{ data.doctor.firstName }} {{ data.doctor.lastName }} - {{ data.doctor.specialty }}</p>
    <mat-dialog-content class="pt-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Date du rendez-vous</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="appointmentDate" [min]="minDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>Date requise et doit être dans le futur</mat-error>
        </mat-form-field>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Heure de début</mat-label>
            <input matInput type="time" formControlName="startTime">
            <mat-error>Requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Heure de fin</mat-label>
            <input matInput type="time" formControlName="endTime">
            <mat-error>Requis</mat-error>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Type de consultation</mat-label>
          <mat-select formControlName="type">
            <mat-option value="VIDEO">Vidéo</mat-option>
            <mat-option value="AUDIO">Audio</mat-option>
            <mat-option value="CHAT">Chat</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Motif de consultation</mat-label>
          <textarea matInput formControlName="reason" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="loading || form.invalid">
        {{ loading ? 'Réservation...' : 'Confirmer' }}
      </button>
    </mat-dialog-actions>
  `
})
export class BookAppointmentComponent {
  private apptSvc = inject(AppointmentService);
  private snack = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BookAppointmentComponent>);

  data: { doctor: DoctorProfile } = inject(MAT_DIALOG_DATA);
  loading = false;
  minDate = new Date();

  private fb = inject(FormBuilder);
  form = this.fb.group({
    appointmentDate: [null, Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    type: ['VIDEO', Validators.required],
    reason: ['']
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value;
    const date = new Date(v.appointmentDate as any);
    const req = {
      doctorId: this.data.doctor.id,
      appointmentDate: date.toISOString().split('T')[0],
      startTime: v.startTime!,
      endTime: v.endTime!,
      type: v.type as any,
      reason: v.reason || undefined
    };
    this.apptSvc.book(req).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Rendez-vous réservé avec succès !', 'Fermer', { duration: 4000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err.error?.message || 'Erreur lors de la réservation', 'Fermer', { duration: 4000 });
      }
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DoctorService } from '../../../core/services/doctor.service';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS: Record<string, string> = { MONDAY:'Lundi', TUESDAY:'Mardi', WEDNESDAY:'Mercredi', THURSDAY:'Jeudi', FRIDAY:'Vendredi', SATURDAY:'Samedi', SUNDAY:'Dimanche' };

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatIconModule, MatSnackBarModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Mes disponibilités</h1>
          <mat-card>
            <mat-card-content class="pt-4">
              <form [formGroup]="form" (ngSubmit)="save()">
                <div formArrayName="slots" class="flex flex-col gap-4">
                  @for (slot of slots.controls; track i; let i = $index) {
                    <div [formGroupName]="i" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <mat-form-field appearance="outline" class="w-40">
                        <mat-label>Jour</mat-label>
                        <mat-select formControlName="dayOfWeek">
                          @for (d of days; track d) {
                            <mat-option [value]="d">{{ dayLabel(d) }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-36">
                        <mat-label>Début</mat-label>
                        <input matInput type="time" formControlName="startTime">
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-36">
                        <mat-label>Fin</mat-label>
                        <input matInput type="time" formControlName="endTime">
                      </mat-form-field>
                      <button mat-icon-button color="warn" type="button" (click)="removeSlot(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
                <div class="flex justify-between mt-4">
                  <button mat-stroked-button type="button" (click)="addSlot()">
                    <mat-icon>add</mat-icon> Ajouter un créneau
                  </button>
                  <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                    {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </main>
      </div>
    </div>
  `
})
export class AvailabilityComponent implements OnInit {
  private doctorSvc = inject(DoctorService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  days = DAYS;
  saving = false;

  form = this.fb.group({ slots: this.fb.array([]) });

  get slots() { return this.form.get('slots') as FormArray; }

  ngOnInit(): void {
    this.doctorSvc.getMyProfile().subscribe({
      next: (p) => {
        p.availabilitySlots?.forEach((s: any) => this.slots.push(this.createSlot(s.dayOfWeek, s.startTime, s.endTime)));
      },
      error: () => {}
    });
  }

  createSlot(day = 'MONDAY', start = '08:00', end = '17:00') {
    return this.fb.group({
      dayOfWeek: [day, Validators.required],
      startTime: [start, Validators.required],
      endTime: [end, Validators.required]
    });
  }

  addSlot(): void { this.slots.push(this.createSlot()); }
  removeSlot(i: number): void { this.slots.removeAt(i); }

  dayLabel(d: string): string { return DAY_LABELS[d] ?? d; }

  save(): void {
    this.saving = true;
    this.doctorSvc.setAvailability(this.slots.value).subscribe({
      next: () => { this.saving = false; this.snack.open('Disponibilités enregistrées !', 'Fermer', { duration: 3000 }); },
      error: (e) => { this.saving = false; this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 }); }
    });
  }
}

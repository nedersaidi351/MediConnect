import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Mon Profil</h1>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <mat-card class="lg:col-span-1 text-center">
              <mat-card-content class="py-6">
                <div class="text-6xl mb-4">👤</div>
                <h2 class="text-xl font-semibold">{{ user()?.fullName }}</h2>
                <p class="text-gray-500">{{ user()?.email }}</p>
                <span class="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">Patient</span>
              </mat-card-content>
            </mat-card>
            <mat-card class="lg:col-span-2">
              <mat-card-header>
                <mat-card-title>Informations médicales</mat-card-title>
              </mat-card-header>
              <mat-card-content class="pt-4">
                @if (loading) {
                  <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div>
                } @else {
                  <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 gap-3">
                      <mat-form-field appearance="outline">
                        <mat-label>Date de naissance</mat-label>
                        <input matInput [matDatepicker]="dp" formControlName="dateOfBirth">
                        <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
                        <mat-datepicker #dp></mat-datepicker>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Genre</mat-label>
                        <mat-select formControlName="gender">
                          <mat-option value="MALE">Homme</mat-option>
                          <mat-option value="FEMALE">Femme</mat-option>
                          <mat-option value="OTHER">Autre</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline">
                      <mat-label>Groupe sanguin</mat-label>
                      <mat-select formControlName="bloodType">
                        <mat-option value="A+">A+</mat-option>
                        <mat-option value="A-">A-</mat-option>
                        <mat-option value="B+">B+</mat-option>
                        <mat-option value="B-">B-</mat-option>
                        <mat-option value="AB+">AB+</mat-option>
                        <mat-option value="AB-">AB-</mat-option>
                        <mat-option value="O+">O+</mat-option>
                        <mat-option value="O-">O-</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Allergies</mat-label>
                      <textarea matInput formControlName="allergies" rows="2"></textarea>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Maladies chroniques</mat-label>
                      <textarea matInput formControlName="chronicDiseases" rows="2"></textarea>
                    </mat-form-field>
                    <div class="grid grid-cols-2 gap-3">
                      <mat-form-field appearance="outline">
                        <mat-label>Contact urgence (Nom)</mat-label>
                        <input matInput formControlName="emergencyContactName">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Contact urgence (Tél)</mat-label>
                        <input matInput formControlName="emergencyContactPhone">
                      </mat-form-field>
                    </div>
                    <div class="flex justify-end">
                      <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                      </button>
                    </div>
                  </form>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </main>
      </div>
    </div>
  `
})
export class PatientProfileComponent implements OnInit {
  auth = inject(AuthService);
  private patientSvc = inject(PatientService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  user = this.auth.currentUser;
  loading = true;
  saving = false;

  form = this.fb.group({
    dateOfBirth: [null],
    gender: [''],
    bloodType: [''],
    allergies: [''],
    chronicDiseases: [''],
    emergencyContactName: [''],
    emergencyContactPhone: ['']
  });

  ngOnInit(): void {
    this.patientSvc.getMyProfile().subscribe({
      next: (p) => {
        this.form.patchValue(p);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    this.saving = true;
    this.patientSvc.updateProfile(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Profil mis à jour !', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 3000 });
      }
    });
  }
}

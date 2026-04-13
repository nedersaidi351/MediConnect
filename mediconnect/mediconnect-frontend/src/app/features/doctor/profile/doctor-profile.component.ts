import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { DoctorProfile, Specialty } from '../../../models/doctor.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Mon Profil Médecin</h1>
          @if (loading) {
            <div class="flex justify-center py-12"><mat-spinner></mat-spinner></div>
          } @else {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <mat-card class="lg:col-span-1 text-center">
                <mat-card-content class="py-6">
                  <div class="text-6xl mb-4">👨‍⚕️</div>
                  <h2 class="text-xl font-semibold">{{ profile?.firstName }} {{ profile?.lastName }}</h2>
                  <p class="text-indigo-600">{{ profile?.specialty }}</p>
                  @if (profile?.isVerified) {
                    <span class="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      ✓ Vérifié
                    </span>
                  } @else {
                    <span class="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">En attente de vérification</span>
                  }
                  @if (profile) {
                    <div class="mt-4 text-gray-500 text-sm">
                      <p>⭐ {{ profile.averageRating }} ({{ profile.totalReviews }} avis)</p>
                      <p>{{ profile.yearsExperience }} ans d'expérience</p>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
              <mat-card class="lg:col-span-2">
                <mat-card-header><mat-card-title>Informations professionnelles</mat-card-title></mat-card-header>
                <mat-card-content class="pt-4">
                  <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Spécialité</mat-label>
                      <mat-select formControlName="specialtyId">
                        @for (s of specialties; track s.id) {
                          <mat-option [value]="s.id">{{ s.name }}</mat-option>
                        }
                      </mat-select>
                      <mat-error>Requis</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Numéro de licence</mat-label>
                      <input matInput formControlName="licenseNumber">
                      <mat-error>Requis</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Biographie</mat-label>
                      <textarea matInput formControlName="bio" rows="4"></textarea>
                    </mat-form-field>
                    <div class="grid grid-cols-2 gap-3">
                      <mat-form-field appearance="outline">
                        <mat-label>Années d'expérience</mat-label>
                        <input matInput type="number" formControlName="yearsExperience">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Honoraires (DZD)</mat-label>
                        <input matInput type="number" formControlName="consultationFee">
                      </mat-form-field>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <mat-form-field appearance="outline">
                        <mat-label>Ville</mat-label>
                        <input matInput formControlName="city">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Adresse</mat-label>
                        <input matInput formControlName="address">
                      </mat-form-field>
                    </div>
                    <div class="flex justify-end">
                      <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          }
        </main>
      </div>
    </div>
  `
})
export class DoctorProfileComponent implements OnInit {
  private doctorSvc = inject(DoctorService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  profile: DoctorProfile | null = null;
  specialties: Specialty[] = [];
  loading = true;
  saving = false;
  hasProfile = false;

  form = this.fb.group({
    specialtyId: [null, Validators.required],
    licenseNumber: ['', Validators.required],
    bio: [''],
    yearsExperience: [0],
    consultationFee: [null],
    city: [''],
    address: ['']
  });

  ngOnInit(): void {
    this.doctorSvc.getSpecialties().subscribe(s => this.specialties = s);
    this.doctorSvc.getMyProfile().subscribe({
      next: (p) => { this.profile = p; this.hasProfile = true; this.form.patchValue(p as any); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.hasProfile
      ? this.doctorSvc.updateProfile(this.form.value)
      : this.doctorSvc.createProfile(this.form.value);
    req.subscribe({
      next: (p) => { this.profile = p; this.hasProfile = true; this.saving = false; this.snack.open('Profil enregistré !', 'Fermer', { duration: 3000 }); },
      error: (err) => { this.saving = false; this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 3000 }); }
    });
  }
}

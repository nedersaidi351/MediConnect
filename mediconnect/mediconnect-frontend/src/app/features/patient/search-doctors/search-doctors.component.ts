import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { DoctorProfile, Specialty } from '../../../models/doctor.model';

@Component({
  selector: 'app-search-doctors',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    HeaderComponent, SidebarComponent
  ],
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .doc-card {
      background: white;
      border-radius: 20px;
      border: 1px solid rgba(99,102,241,0.1);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      cursor: pointer;
      animation: fadeInUp 0.4s ease both;
    }
    .doc-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 50px rgba(79,70,229,0.16), 0 8px 20px rgba(0,0,0,0.06);
      border-color: rgba(79,70,229,0.25);
    }
    .doc-avatar {
      height: 88px;
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.8rem;
      position: relative;
      overflow: hidden;
    }
    .doc-avatar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.1));
    }
    .star { color: #F59E0B; }
    .search-input {
      width: 100%;
      border: 1.5px solid #E8EDFF;
      border-radius: 11px;
      padding: 13px 16px 13px 44px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: all 0.22s;
      background: white;
      color: #1E1B4B;
    }
    .search-input:focus {
      border-color: #4F46E5;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
    }
    .search-input::placeholder { color: #9CA3AF; }
    .inp-wrap { position: relative; }
    .inp-icon {
      position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
      color: #9CA3AF; font-size: 18px !important; width: 18px !important; height: 18px !important;
      transition: color 0.2s;
    }
    .inp-wrap:focus-within .inp-icon { color: #4F46E5; }
  `],
  template: `
    <div class="h-screen flex flex-col" style="font-family:'Inter',sans-serif">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto mc-page p-6">

          <!-- Page header -->
          <div class="anim-fade-in-up mb-6">
            <h1 style="font-size:1.65rem;font-weight:800;color:#1E1B4B;margin-bottom:4px">Trouver un médecin</h1>
            <p style="color:#6B7280;font-size:0.9rem">Consultez nos spécialistes certifiés et prenez rendez-vous en ligne</p>
          </div>

          <!-- Search bar -->
          <div style="background:white;border-radius:18px;border:1px solid var(--border);padding:20px 24px;margin-bottom:20px;box-shadow:var(--shadow-sm)" class="anim-fade-in-up delay-100">
            <form [formGroup]="searchForm" (ngSubmit)="search()" class="flex flex-wrap gap-3 items-end">

              <div style="flex:2;min-width:180px">
                <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:6px">Nom du médecin</label>
                <div class="inp-wrap">
                  <mat-icon class="inp-icon">person_search</mat-icon>
                  <input class="search-input" formControlName="name" placeholder="Rechercher un médecin...">
                </div>
              </div>

              <div style="flex:2;min-width:180px">
                <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:6px">Spécialité</label>
                <div style="position:relative">
                  <mat-form-field appearance="outline" style="width:100%">
                    <mat-select formControlName="specialtyId" placeholder="Toutes les spécialités">
                      <mat-option [value]="null">Toutes les spécialités</mat-option>
                      @for (s of specialties; track s.id) {
                        <mat-option [value]="s.id">{{ s.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <div style="flex:1;min-width:140px">
                <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:6px">Ville</label>
                <div class="inp-wrap">
                  <mat-icon class="inp-icon">location_on</mat-icon>
                  <input class="search-input" formControlName="city" placeholder="Ville...">
                </div>
              </div>

              <button type="submit"
                      style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;border:none;border-radius:12px;padding:13px 28px;font-weight:700;font-size:0.9rem;font-family:'Inter',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(79,70,229,0.38);transition:all 0.25s;display:flex;align-items:center;gap:7px;flex-shrink:0"
                      onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                <mat-icon style="font-size:18px;width:18px;height:18px">search</mat-icon>
                Rechercher
              </button>

            </form>

            <!-- Specialty pills quick-filter -->
            @if (specialties.length > 0) {
              <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
                <button (click)="quickFilter(null)"
                        style="font-size:0.76rem;font-weight:600;padding:5px 14px;border-radius:999px;border:1.5px solid;cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif"
                        [style.background]="searchForm.get('specialtyId')?.value === null ? '#4F46E5' : 'white'"
                        [style.color]="searchForm.get('specialtyId')?.value === null ? 'white' : '#6B7280'"
                        [style.borderColor]="searchForm.get('specialtyId')?.value === null ? '#4F46E5' : '#E8EDFF'">
                  Tous
                </button>
                @for (s of specialties.slice(0,8); track s.id) {
                  <button (click)="quickFilter(s.id)"
                          style="font-size:0.76rem;font-weight:600;padding:5px 14px;border-radius:999px;border:1.5px solid;cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif"
                          [style.background]="searchForm.get('specialtyId')?.value === s.id ? '#4F46E5' : 'white'"
                          [style.color]="searchForm.get('specialtyId')?.value === s.id ? 'white' : '#6B7280'"
                          [style.borderColor]="searchForm.get('specialtyId')?.value === s.id ? '#4F46E5' : '#E8EDFF'">
                    {{ s.name }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Results count -->
          @if (!loading && doctors.length > 0) {
            <p style="font-size:0.85rem;color:#6B7280;margin-bottom:14px;font-weight:500" class="anim-fade-in-up delay-200">
              <span style="color:#4F46E5;font-weight:700">{{ doctors.length }}</span> médecin(s) trouvé(s)
            </p>
          }

          <!-- Loading -->
          @if (loading) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div style="background:white;border-radius:20px;overflow:hidden;border:1px solid var(--border)">
                  <div class="skeleton" style="height:88px"></div>
                  <div style="padding:16px">
                    <div class="skeleton" style="height:16px;margin-bottom:8px;width:60%"></div>
                    <div class="skeleton" style="height:12px;margin-bottom:8px;width:40%"></div>
                    <div class="skeleton" style="height:12px;width:80%"></div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Empty state -->
          @else if (doctors.length === 0) {
            <div style="text-align:center;padding:64px 24px" class="anim-fade-in-up">
              <div style="font-size:3.5rem;margin-bottom:14px">🔍</div>
              <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px">Aucun médecin trouvé</p>
              <p style="font-size:0.88rem;color:#9CA3AF">Modifiez vos critères de recherche et réessayez</p>
            </div>
          }

          <!-- Doctor grid -->
          @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (doc of doctors; track doc.id; let i = $index) {
                <div class="doc-card" [style.animation-delay]="(i % 9 * 50) + 'ms'">

                  <!-- Avatar header -->
                  <div class="doc-avatar">
                    <span style="position:relative;z-index:1">{{ docAvatar(doc) }}</span>
                    @if (doc.isVerified) {
                      <div style="position:absolute;top:10px;right:10px;z-index:2;background:white;border-radius:999px;padding:3px 9px;font-size:0.7rem;font-weight:700;color:#059669;border:1.5px solid #D1FAE5;display:flex;align-items:center;gap:3px">
                        <mat-icon style="font-size:12px;width:12px;height:12px;color:#059669">verified</mat-icon>
                        Vérifié
                      </div>
                    }
                  </div>

                  <!-- Body -->
                  <div style="padding:16px 18px">

                    <div style="margin-bottom:10px">
                      <h3 style="font-size:1rem;font-weight:700;color:#1E1B4B;margin-bottom:2px">Dr. {{ doc.firstName }} {{ doc.lastName }}</h3>
                      <p style="font-size:0.82rem;font-weight:600;color:#7C3AED">{{ doc.specialty }}</p>
                    </div>

                    <!-- Rating -->
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
                      <div style="display:flex;gap:1px">
                        @for (s of stars(doc.averageRating); track $index) {
                          <mat-icon style="font-size:14px;width:14px;height:14px;color:#F59E0B">{{ s }}</mat-icon>
                        }
                      </div>
                      <span style="font-size:0.8rem;font-weight:600;color:#374151">{{ doc.averageRating | number:'1.1-1' }}</span>
                      <span style="font-size:0.75rem;color:#9CA3AF">({{ doc.totalReviews }} avis)</span>
                    </div>

                    <!-- Meta -->
                    <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:14px">
                      @if (doc.city) {
                        <span style="font-size:0.78rem;color:#6B7280;display:flex;align-items:center;gap:5px">
                          <mat-icon style="font-size:14px;width:14px;height:14px;color:#A5B4FC">location_on</mat-icon>
                          {{ doc.city }}
                        </span>
                      }
                      <span style="font-size:0.78rem;color:#6B7280;display:flex;align-items:center;gap:5px">
                        <mat-icon style="font-size:14px;width:14px;height:14px;color:#A5B4FC">workspace_premium</mat-icon>
                        {{ doc.yearsExperience }} ans d'expérience
                      </span>
                      @if (doc.consultationFee) {
                        <span style="font-size:0.78rem;color:#6B7280;display:flex;align-items:center;gap:5px">
                          <mat-icon style="font-size:14px;width:14px;height:14px;color:#A5B4FC">payments</mat-icon>
                          {{ doc.consultationFee | currency:'DZD':'symbol':'1.0-0' }}
                        </span>
                      }
                    </div>

                    <!-- Actions -->
                    <div style="display:flex;gap:8px">
                      <button (click)="openBooking(doc)"
                              style="flex:1;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:0.83rem;font-family:'Inter',sans-serif;cursor:pointer;box-shadow:0 3px 10px rgba(79,70,229,0.35);transition:all 0.22s"
                              onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">
                        📅 Prendre RDV
                      </button>
                    </div>

                  </div>
                </div>
              }
            </div>
          }

        </main>
      </div>
    </div>
  `
})
export class SearchDoctorsComponent implements OnInit {
  private doctorSvc = inject(DoctorService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  doctors: DoctorProfile[] = [];
  specialties: Specialty[] = [];
  loading = false;

  searchForm = this.fb.group({ name: [''], specialtyId: [null as number | null], city: [''] });

  ngOnInit(): void {
    this.doctorSvc.getSpecialties().subscribe(s => this.specialties = s);
    this.search();
  }

  search(): void {
    this.loading = true;
    const { name, specialtyId, city } = this.searchForm.value;
    this.doctorSvc.searchDoctors(specialtyId ?? undefined, city ?? undefined, name ?? undefined)
      .subscribe({ next: res => { this.doctors = res.content; this.loading = false; }, error: () => this.loading = false });
  }

  quickFilter(id: number | null): void {
    this.searchForm.get('specialtyId')?.setValue(id);
    this.search();
  }

  openBooking(doc: DoctorProfile): void {
    import('../appointments/book-appointment.component').then(m => {
      this.dialog.open(m.BookAppointmentComponent, { width: '500px', data: { doctor: doc } });
    });
  }

  stars(rating: number): string[] {
    return [1,2,3,4,5].map(i => i <= Math.round(rating) ? 'star' : 'star_border');
  }

  docAvatar(doc: DoctorProfile): string {
    const avatars: Record<string, string> = {
      'cardiologie':'🫀', 'neurologie':'🧠', 'dermatologie':'🩹', 'pédiatrie':'👶',
      'gynécologie':'👩‍⚕️', 'orthopédie':'🦴', 'ophtalmologie':'👁️', 'orl':'👂',
      'gastro':'🫃', 'psychiatrie':'🧘'
    };
    const sp = (doc.specialty || '').toLowerCase();
    for (const [k, v] of Object.entries(avatars)) {
      if (sp.includes(k)) return v;
    }
    return '👨‍⚕️';
  }
}

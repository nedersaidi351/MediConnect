import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Vérification des médecins</h1>
          @if (loading) {
            <div class="flex justify-center py-12"><mat-spinner></mat-spinner></div>
          } @else if (doctors.length === 0) {
            <div class="text-center py-12 text-gray-400">
              <mat-icon class="text-5xl">verified</mat-icon>
              <p>Aucun médecin en attente de vérification</p>
            </div>
          } @else {
            <div class="flex flex-col gap-4">
              @for (doc of doctors; track doc.id) {
                <mat-card>
                  <mat-card-content class="py-4">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="font-semibold text-lg">Dr. {{ doc.firstName }} {{ doc.lastName }}</p>
                        <p class="text-indigo-600">{{ doc.specialty }}</p>
                        <p class="text-gray-500 text-sm">{{ doc.email }}</p>
                        <p class="text-gray-400 text-sm">Licence: {{ doc.licenseNumber }}</p>
                        @if (doc.city) { <p class="text-gray-400 text-sm">Ville: {{ doc.city }}</p> }
                        @if (doc.bio) { <p class="text-gray-600 text-sm mt-2 max-w-md">{{ doc.bio }}</p> }
                      </div>
                      <div class="flex flex-col items-end gap-2">
                        <mat-chip class="bg-yellow-100 text-yellow-700">En attente</mat-chip>
                        <button mat-raised-button color="primary" (click)="verify(doc)">
                          <mat-icon>verified</mat-icon> Valider
                        </button>
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
export class AdminDoctorsComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private snack = inject(MatSnackBar);

  doctors: any[] = [];
  loading = true;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.adminSvc.getPendingDoctors(0, 50).subscribe({
      next: r => { this.doctors = r.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  verify(doc: any): void {
    this.adminSvc.verifyDoctor(doc.id).subscribe({
      next: () => { this.snack.open('Médecin vérifié !', 'Fermer', { duration: 3000 }); this.load(); },
      error: (e) => this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }
}

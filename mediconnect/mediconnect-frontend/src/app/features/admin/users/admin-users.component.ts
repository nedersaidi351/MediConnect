import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Gestion des utilisateurs</h1>
          @if (loading) {
            <div class="flex justify-center py-12"><mat-spinner></mat-spinner></div>
          } @else {
            <mat-card>
              <mat-card-content>
                <table mat-table [dataSource]="users" class="w-full">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let u">{{ u.fullName }}</td>
                  </ng-container>
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let u">{{ u.email }}</td>
                  </ng-container>
                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>Rôle</th>
                    <td mat-cell *matCellDef="let u">
                      <mat-chip class="text-xs">{{ u.role }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let u">
                      <span [class]="u.enabled ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                        {{ u.enabled ? 'Actif' : 'Désactivé' }}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let u">
                      <button mat-stroked-button [color]="u.enabled ? 'warn' : 'primary'" (click)="toggle(u)">
                        {{ u.enabled ? 'Désactiver' : 'Activer' }}
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="cols"></tr>
                  <tr mat-row *matRowDef="let row; columns: cols;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          }
        </main>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private snack = inject(MatSnackBar);

  users: any[] = [];
  loading = true;
  cols = ['name', 'email', 'role', 'status', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.adminSvc.getAllUsers(0, 100).subscribe({
      next: r => { this.users = r.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggle(u: any): void {
    this.adminSvc.toggleUser(u.id).subscribe({
      next: () => { this.snack.open('Statut modifié.', 'Fermer', { duration: 3000 }); this.load(); },
      error: (e) => this.snack.open(e.error?.message || 'Erreur', 'Fermer', { duration: 3000 })
    });
  }
}

// Patient doctors search example
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';
import { DoctorProfile } from '../../../models/doctor.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <h2>Search Doctors</h2>
      <mat-form-field fullWidth>
        <mat-label>Search by specialty, city, name</mat-label>
        <input matInput [formControl]="searchControl">
      </mat-form-field>
      <div *ngIf="doctors.length">
        <table mat-table [dataSource]="doctors">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let doctor">{{doctor.firstName}} {{doctor.lastName}}</td>
          </ng-container>
          <ng-container matColumnDef="specialty">
            <th mat-header-cell *matHeaderCellDef>Specialty</th>
            <td mat-cell *matCellDef="let doctor">{{doctor.specialty}}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
      <p *ngIf="!doctors.length">No doctors found.</p>
    </div>
  `,
})
export class DoctorsComponent {
  apiService = inject(ApiService);
  searchControl = new FormControl('');
  doctors: DoctorProfile[] = [];
  displayedColumns = ['name', 'specialty'];

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      switchMap(value => {
        const request = { specialty: value || undefined };
        return this.apiService.get<DoctorProfile[]>('/doctors/search', request);
      })
    ).subscribe(doctors => {
      this.doctors = doctors || [];
    });
  }
}


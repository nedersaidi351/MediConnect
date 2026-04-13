import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule],
  template: `<h2>Doctor Profile</h2><p>Manage your profile, availability.</p>`,
})
export class DoctorProfileComponent {}


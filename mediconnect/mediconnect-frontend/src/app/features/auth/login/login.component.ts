import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  styles: [`
    :host { display: block; min-height: 100vh; }

    .wrap {
      display: flex;
      min-height: 100vh;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    /* ── Left hero panel ── */
    .hero {
      display: none;
      width: 52%;
      position: relative;
      overflow: hidden;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: linear-gradient(135deg, #3730A3 0%, #4F46E5 35%, #7C3AED 65%, #0891B2 100%);
      background-size: 200% 200%;
      animation: gradShift 8s ease infinite;
    }
    @media (min-width: 1024px) { .hero { display: flex; } }

    @keyframes gradShift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0) rotate(0deg); }
      50%      { transform: translateY(-20px) rotate(3deg); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideR {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
      animation: blobFloat 7s ease-in-out infinite;
    }

    .hero-content { position: relative; z-index: 10; max-width: 420px; width: 100%; }

    .feature-pill {
      background: rgba(255,255,255,0.13);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 14px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
      font-size: 0.88rem;
      font-weight: 500;
      margin-bottom: 10px;
      animation: fadeUp 0.6s ease both;
    }
    .feature-pill:hover { background: rgba(255,255,255,0.2); transform: translateX(4px); transition: all .3s; }

    .stats-row { display: flex; gap: 14px; margin-top: 36px; }
    .stat-pill {
      flex: 1;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 14px;
      padding: 14px 12px;
      text-align: center;
      color: white;
    }
    .stat-num { font-size: 1.6rem; font-weight: 800; line-height: 1; }
    .stat-lbl { font-size: 0.72rem; opacity: 0.8; margin-top: 3px; }

    /* ── Right form panel ── */
    .right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: linear-gradient(150deg, #EEF2FF 0%, #F0F9FF 55%, #E8F4FF 100%);
      position: relative;
    }

    .form-card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 24px 80px rgba(79,70,229,0.14), 0 8px 32px rgba(0,0,0,0.08);
      padding: 44px 40px;
      width: 100%;
      max-width: 440px;
      animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    }

    .field-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .input-wrap { position: relative; margin-bottom: 18px; }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #9CA3AF;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      transition: color 0.2s;
    }
    .input-wrap:focus-within .input-icon { color: #4F46E5; }

    .custom-input {
      width: 100%;
      border: 1.5px solid #E8EDFF;
      border-radius: 12px;
      padding: 14px 16px 14px 48px;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: all 0.25s;
      background: #FAFBFF;
      color: #1E1B4B;
      box-sizing: border-box;
    }
    .custom-input:focus {
      border-color: #4F46E5;
      background: white;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
    }
    .custom-input::placeholder { color: #9CA3AF; }

    .eye-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #9CA3AF;
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 6px;
    }
    .eye-btn:hover { color: #4F46E5; }

    .submit-btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.97rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 6px 20px rgba(79,70,229,0.38);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.48); }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #9CA3AF;
      font-size: 0.82rem;
      margin: 22px 0;
    }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #E8EDFF; }

    .register-link {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .register-link a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #4F46E5;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      padding: 10px 24px;
      border: 1.5px solid #C7D2FE;
      border-radius: 10px;
      background: white;
      transition: all 0.2s;
    }
    .register-link a:hover { background: #EEF2FF; border-color: #818CF8; }

    .demo-box {
      margin-top: 24px;
      background: #F8F9FF;
      border: 1px solid #E8EDFF;
      border-radius: 12px;
      padding: 14px 16px;
    }
    .demo-chip {
      cursor: pointer;
      background: white;
      border: 1px solid #E8EDFF;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 0.75rem;
      color: #374151;
      transition: all 0.15s;
      font-weight: 500;
    }
    .demo-chip:hover { border-color: #818CF8; color: #4F46E5; }
  `],
  template: `
    <div class="wrap">

      <!-- LEFT HERO -->
      <div class="hero">
        <div class="blob" style="width:300px;height:300px;top:-60px;right:-60px;animation-delay:0s"></div>
        <div class="blob" style="width:180px;height:180px;bottom:40px;left:-40px;animation-delay:2s"></div>
        <div class="blob" style="width:120px;height:120px;top:45%;left:20px;animation-delay:4s"></div>

        <div class="hero-content">
          <!-- Logo -->
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:40px;animation:slideR 0.6s ease both">
            <div style="width:60px;height:60px;background:rgba(255,255,255,0.18);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:1px solid rgba(255,255,255,0.3)">🏥</div>
            <div>
              <h1 style="font-size:1.8rem;font-weight:800;color:white;margin:0;line-height:1">MediConnect</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:0.82rem;margin:2px 0 0">Consultation médicale en ligne</p>
            </div>
          </div>

          <!-- Tagline -->
          <div style="animation:fadeUp 0.6s ease 0.1s both">
            <h2 style="font-size:2.4rem;font-weight:800;color:white;line-height:1.15;margin:0 0 14px">
              Votre santé,<br>
              <span style="color:rgba(167,243,208,0.95)">notre priorité.</span>
            </h2>
            <p style="color:rgba(255,255,255,0.72);font-size:1rem;line-height:1.6;margin:0 0 32px">
              Consultez des médecins certifiés, prenez vos rendez-vous et gérez votre santé depuis chez vous.
            </p>
          </div>

          <!-- Pills -->
          <div class="feature-pill" style="animation-delay:0.2s"><span style="font-size:1.4rem">🎥</span><span>Consultations vidéo, audio et chat</span></div>
          <div class="feature-pill" style="animation-delay:0.3s"><span style="font-size:1.4rem">📅</span><span>Prise de rendez-vous instantanée</span></div>
          <div class="feature-pill" style="animation-delay:0.4s"><span style="font-size:1.4rem">🔒</span><span>Données médicales sécurisées</span></div>
          <div class="feature-pill" style="animation-delay:0.5s"><span style="font-size:1.4rem">🤖</span><span>Assistant médical intelligent 24/7</span></div>

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-pill"><div class="stat-num">500+</div><div class="stat-lbl">Médecins</div></div>
            <div class="stat-pill"><div class="stat-num">10K+</div><div class="stat-lbl">Patients</div></div>
            <div class="stat-pill"><div class="stat-num">98%</div><div class="stat-lbl">Satisfaction</div></div>
          </div>
        </div>
      </div>

      <!-- RIGHT FORM -->
      <div class="right">

        <!-- Mobile logo -->
        <div style="position:absolute;top:20px;left:20px;display:flex;align-items:center;gap:8px">
          <span style="font-size:1.4rem">🏥</span>
          <span style="font-weight:800;color:#4F46E5;font-size:1.1rem">MediConnect</span>
        </div>

        <div class="form-card">

          <div style="margin-bottom:32px">
            <h2 style="font-size:1.65rem;font-weight:800;color:#1E1B4B;margin:0 0 6px">Bon retour ! 👋</h2>
            <p style="color:#6B7280;font-size:0.92rem;margin:0">Connectez-vous à votre compte MediConnect</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">

            <!-- Email -->
            <label class="field-label">Adresse email</label>
            <div class="input-wrap">
              <mat-icon class="input-icon">mail_outline</mat-icon>
              <input class="custom-input" type="email" placeholder="vous@exemple.com"
                     formControlName="email" autocomplete="email">
            </div>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p style="color:#EF4444;font-size:0.78rem;margin:-12px 0 12px;display:flex;align-items:center;gap:4px">
                <mat-icon style="font-size:14px;width:14px;height:14px">error_outline</mat-icon> Email invalide
              </p>
            }

            <!-- Password -->
            <label class="field-label">Mot de passe</label>
            <div class="input-wrap">
              <mat-icon class="input-icon">lock_outline</mat-icon>
              <input class="custom-input" [type]="hidePassword ? 'password' : 'text'"
                     placeholder="••••••••" formControlName="password" autocomplete="current-password"
                     style="padding-right:46px">
              <button type="button" class="eye-btn" (click)="hidePassword = !hidePassword">
                <mat-icon style="font-size:20px;width:20px;height:20px">{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>

            <!-- Submit -->
            <button class="submit-btn" type="submit" [disabled]="loading || form.invalid">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Connexion...</span>
              } @else {
                <span>Se connecter</span>
                <mat-icon style="font-size:20px;width:20px;height:20px">arrow_forward</mat-icon>
              }
            </button>

          </form>

          <div class="divider">Pas encore de compte ?</div>

          <div class="register-link">
            <a routerLink="/register">
              <mat-icon style="font-size:18px;width:18px;height:18px">person_add</mat-icon>
              Créer un compte
            </a>
          </div>

          <!-- Demo accounts -->
          <div class="demo-box">
            <p style="font-size:0.78rem;color:#6B7280;font-weight:500;display:flex;align-items:center;gap:6px;margin:0 0 8px">
              <mat-icon style="font-size:15px;width:15px;height:15px;color:#4F46E5">info_outline</mat-icon>
              Comptes de démonstration
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              @for (demo of demos; track demo.role) {
                <span class="demo-chip" (click)="fillDemo(demo)">{{ demo.icon }} {{ demo.role }}</span>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private snack = inject(MatSnackBar);

  hidePassword = true;
  loading = false;

  demos = [
    { role: 'Patient',    icon: '🧑', email: 'patient@test.com',   password: 'password' },
    { role: 'Médecin',    icon: '👨‍⚕️', email: 'doctor@test.com',    password: 'password' },
    { role: 'Secrétaire', icon: '💼', email: 'secretary@test.com', password: 'password' },
    { role: 'Admin',      icon: '🛡️', email: 'admin@test.com',     password: 'password' },
  ];

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  fillDemo(demo: { email: string; password: string }): void {
    this.form.patchValue({ email: demo.email, password: demo.password });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value as any).subscribe({
      next: () => { this.loading = false; this.auth.redirectToDashboard(); },
      error: (err) => {
        this.loading = false;
        this.snack.open(err.error?.message || 'Email ou mot de passe incorrect', 'Fermer',
          { duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }
}

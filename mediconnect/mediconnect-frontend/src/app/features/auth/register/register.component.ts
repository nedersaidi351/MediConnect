import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  styles: [`
    :host { display: block; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33%       { transform: translateY(-18px) rotate(1deg); }
      66%       { transform: translateY(-8px) rotate(-1deg); }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50%       { background-position: 100% 50%; }
    }
    @keyframes blobPulse {
      0%, 100% { transform: scale(1) translate(0, 0); }
      50%       { transform: scale(1.08) translate(10px, -10px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ─── Layout ─── */
    .register-shell {
      display: flex;
      min-height: 100vh;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    /* ─── Left hero panel ─── */
    .hero-panel {
      width: 44%;
      min-height: 100vh;
      background: linear-gradient(135deg, #3730A3 0%, #4F46E5 35%, #7C3AED 65%, #0891B2 100%);
      background-size: 300% 300%;
      animation: gradientShift 10s ease infinite;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
    }
    @media (max-width: 900px) { .hero-panel { display: none; } }

    .blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
      animation: blobPulse 8s ease-in-out infinite;
      pointer-events: none;
    }
    .blob-1 { width: 320px; height: 320px; top: -80px; right: -80px; animation-duration: 9s; }
    .blob-2 { width: 200px; height: 200px; bottom: 5%; left: -50px; animation-duration: 7s; animation-delay: -3s; }
    .blob-3 { width: 140px; height: 140px; top: 42%; left: 30%; animation-duration: 11s; animation-delay: -5s; background: rgba(255,255,255,0.04); }
    .blob-4 { width: 80px; height: 80px; bottom: 20%; right: 10%; animation-duration: 6s; background: rgba(255,255,255,0.09); }

    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .hero-inner { position: relative; z-index: 2; max-width: 340px; width: 100%; }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      margin-bottom: 28px;
      animation: slideInLeft 0.7s ease both;
    }
    .hero-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #34D399;
      box-shadow: 0 0 6px #34D399;
      animation: blobPulse 2s ease-in-out infinite;
    }

    .hero-logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
      animation: slideInLeft 0.7s ease 0.1s both;
    }
    .hero-logo-icon {
      width: 52px; height: 52px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.7rem;
      animation: float 5s ease-in-out infinite;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }

    .hero-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: white;
      line-height: 1.18;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
      animation: slideInLeft 0.7s ease 0.15s both;
    }
    .hero-title span {
      background: linear-gradient(90deg, #A5F3FC, #C4B5FD);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-desc {
      font-size: 0.93rem;
      color: rgba(255,255,255,0.72);
      line-height: 1.7;
      margin-bottom: 36px;
      animation: slideInLeft 0.7s ease 0.2s both;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      animation: slideInLeft 0.7s ease 0.25s both;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .step-num {
      width: 36px; height: 36px;
      border-radius: 12px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.28);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800;
      font-size: 0.88rem;
      color: white;
      flex-shrink: 0;
      backdrop-filter: blur(4px);
    }
    .step-num.done {
      background: rgba(52,211,153,0.25);
      border-color: rgba(52,211,153,0.4);
    }
    .step-text { font-size: 0.88rem; color: rgba(255,255,255,0.88); font-weight: 500; }

    .hero-stats {
      display: flex;
      gap: 20px;
      margin-top: 36px;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,0.12);
      animation: slideInLeft 0.7s ease 0.3s both;
    }
    .hero-stat { text-align: center; }
    .hero-stat-num { font-size: 1.3rem; font-weight: 800; color: white; }
    .hero-stat-lbl { font-size: 0.72rem; color: rgba(255,255,255,0.6); margin-top: 2px; }

    /* ─── Right form panel ─── */
    .form-panel {
      flex: 1;
      min-height: 100vh;
      background: linear-gradient(150deg, #EEF2FF 0%, #F0F9FF 55%, #F5F3FF 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      overflow-y: auto;
    }

    .form-card {
      background: white;
      border-radius: 28px;
      box-shadow: 0 32px 80px rgba(79,70,229,0.13), 0 8px 32px rgba(0,0,0,0.06);
      padding: 44px 40px;
      width: 100%;
      max-width: 530px;
      animation: fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
      border: 1px solid rgba(79,70,229,0.07);
    }
    @media (max-width: 600px) { .form-card { padding: 32px 22px; } }

    /* ─── Card header ─── */
    .card-header { margin-bottom: 28px; }
    .card-mobile-logo {
      display: none;
      align-items: center;
      gap: 8px;
      margin-bottom: 18px;
    }
    @media (max-width: 900px) { .card-mobile-logo { display: flex; } }
    .card-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #1E1B4B;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .card-subtitle { font-size: 0.88rem; color: #6B7280; }

    /* ─── Progress ─── */
    .progress-section { margin-bottom: 30px; }
    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .progress-text { font-size: 0.76rem; font-weight: 600; color: #6B7280; }
    .progress-pct { font-size: 0.76rem; font-weight: 700; color: #4F46E5; }
    .progress-track {
      height: 5px;
      background: #EEF2FF;
      border-radius: 100px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4F46E5, #7C3AED, #0891B2);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
      border-radius: 100px;
      transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
    }

    /* ─── Role pills ─── */
    .role-section { margin-bottom: 20px; }
    .role-grid { display: flex; gap: 10px; }
    .role-pill {
      flex: 1;
      border: 2px solid #E8EDFF;
      border-radius: 16px;
      padding: 15px 10px 13px;
      background: #FAFBFF;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      text-align: center;
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .role-pill:hover {
      border-color: #818CF8;
      background: #F5F3FF;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79,70,229,0.12);
    }
    .role-pill.selected {
      border-color: #4F46E5;
      background: linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%);
      box-shadow: 0 6px 22px rgba(79,70,229,0.18);
      transform: translateY(-2px);
    }
    .role-pill.selected::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #4F46E5, #7C3AED);
      border-radius: 16px 16px 0 0;
    }
    .role-check {
      position: absolute;
      top: 8px; right: 8px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      display: flex; align-items: center; justify-content: center;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .role-pill.selected .role-check { opacity: 1; transform: scale(1); }
    .role-emoji { font-size: 1.7rem; margin-bottom: 6px; display: block; }
    .role-label { font-size: 0.8rem; font-weight: 700; color: #374151; }
    .role-sublabel { font-size: 0.7rem; color: #9CA3AF; margin-top: 2px; }

    /* ─── Form fields ─── */
    .field-group { margin-bottom: 16px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 7px;
      letter-spacing: 0.01em;
    }
    .field-optional { color: #9CA3AF; font-weight: 400; font-size: 0.78rem; }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute;
      left: 14px; top: 50%;
      transform: translateY(-50%);
      color: #C4CAED;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      transition: color 0.2s ease;
      pointer-events: none;
    }
    .input-wrap:focus-within .input-icon { color: #4F46E5; }

    .custom-input {
      width: 100%;
      box-sizing: border-box;
      border: 1.5px solid #E8EDFF;
      border-radius: 12px;
      padding: 13px 16px 13px 44px;
      font-size: 0.91rem;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: all 0.22s ease;
      background: #FAFBFF;
      color: #1E1B4B;
    }
    .custom-input:focus {
      border-color: #4F46E5;
      background: white;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.09);
    }
    .custom-input::placeholder { color: #B0B8D0; }
    .custom-input.no-icon { padding-left: 16px; }
    .custom-input.has-eye { padding-right: 48px; }

    .eye-btn {
      position: absolute;
      right: 13px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      cursor: pointer;
      color: #B0B8D0;
      padding: 4px;
      border-radius: 6px;
      display: flex; align-items: center;
      transition: color 0.2s;
    }
    .eye-btn:hover { color: #4F46E5; }

    /* ─── Password strength ─── */
    .strength-wrap { margin-top: 10px; }
    .strength-bars { display: flex; gap: 5px; margin-bottom: 6px; }
    .strength-bar {
      flex: 1; height: 4px;
      border-radius: 100px;
      transition: background 0.3s ease;
    }
    .strength-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .strength-text { font-size: 0.74rem; font-weight: 600; }
    .strength-hint { font-size: 0.72rem; color: #B0B8D0; }

    /* ─── Submit button ─── */
    .submit-btn {
      width: 100%;
      padding: 15px 20px;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      border: none;
      border-radius: 13px;
      font-size: 0.96rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 6px 22px rgba(79,70,229,0.38);
      display: flex; align-items: center; justify-content: center; gap: 9px;
      position: relative;
      overflow: hidden;
      letter-spacing: 0.01em;
    }
    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 200%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
      transition: left 0.5s ease;
    }
    .submit-btn:hover:not(:disabled)::before { left: 100%; }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(79,70,229,0.46);
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

    /* ─── Divider / footer ─── */
    .form-footer {
      text-align: center;
      margin-top: 22px;
      font-size: 0.86rem;
      color: #9CA3AF;
    }
    .login-link {
      color: #4F46E5;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.2s;
    }
    .login-link:hover { color: #3730A3; text-decoration: underline; }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 22px 0;
    }
    .divider-line { flex: 1; height: 1px; background: #E8EDFF; }
    .divider-text { font-size: 0.76rem; color: #B0B8D0; font-weight: 500; }

    /* ─── Staggered animations ─── */
    .anim-1 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
    .anim-2 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.10s both; }
    .anim-3 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
    .anim-4 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.20s both; }
    .anim-5 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
    .anim-6 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
    .anim-7 { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
  `],
  template: `
    <div class="register-shell">

      <!-- ══════════ LEFT HERO PANEL ══════════ -->
      <div class="hero-panel">
        <div class="grid-pattern"></div>
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
        <div class="blob blob-4"></div>

        <div class="hero-inner">

          <div class="hero-badge">
            <div class="hero-badge-dot"></div>
            Plateforme médicale certifiée
          </div>

          <div class="hero-logo-wrap">
            <div class="hero-logo-icon">🏥</div>
            <div>
              <div style="font-size:1.25rem;font-weight:800;color:white;letter-spacing:-0.02em">MediConnect</div>
              <div style="font-size:0.7rem;color:rgba(255,255,255,0.6);margin-top:1px">Consultation médicale en ligne</div>
            </div>
          </div>

          <h2 class="hero-title">
            Rejoignez<br><span>MediConnect</span><br>dès aujourd'hui
          </h2>

          <p class="hero-desc">
            Créez votre compte gratuitement et accédez à une plateforme de santé connectée, sécurisée et intuitive.
          </p>

          <div class="steps-list">
            @for (step of steps; track step.n) {
              <div class="step-item">
                <div class="step-num" [class.done]="step.n === 1">
                  @if (step.n === 1) {
                    <mat-icon style="font-size:16px;width:16px;height:16px;color:#34D399">check</mat-icon>
                  } @else {
                    {{ step.n }}
                  }
                </div>
                <div>
                  <div class="step-text">{{ step.text }}</div>
                </div>
              </div>
            }
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-num">500+</div>
              <div class="hero-stat-lbl">Médecins</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">12K+</div>
              <div class="hero-stat-lbl">Patients</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">98%</div>
              <div class="hero-stat-lbl">Satisfaction</div>
            </div>
          </div>

        </div>
      </div>

      <!-- ══════════ RIGHT FORM PANEL ══════════ -->
      <div class="form-panel">
        <div class="form-card">

          <!-- Card header -->
          <div class="card-header">
            <div class="card-mobile-logo">
              <div style="width:36px;height:36px;background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem">🏥</div>
              <span style="font-size:1.05rem;font-weight:800;color:#4F46E5;letter-spacing:-0.02em">MediConnect</span>
            </div>
            <h2 class="card-title">Créer votre compte</h2>
            <p class="card-subtitle">Remplissez les informations ci-dessous pour commencer</p>
          </div>

          <!-- Progress bar -->
          <div class="progress-section anim-1">
            <div class="progress-label">
              <span class="progress-text">Progression du formulaire</span>
              <span class="progress-pct">{{ progress | number:'1.0-0' }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width]="progress + '%'"></div>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">

            <!-- Role selection -->
            <div class="role-section anim-2">
              <label class="field-label">Je suis</label>
              <div class="role-grid">
                @for (r of roles; track r.value) {
                  <button type="button" class="role-pill"
                          [class.selected]="form.get('role')?.value === r.value"
                          (click)="form.get('role')?.setValue(r.value)">
                    <div class="role-check">
                      <mat-icon style="font-size:11px;width:11px;height:11px;color:white">check</mat-icon>
                    </div>
                    <span class="role-emoji">{{ r.icon }}</span>
                    <div class="role-label">{{ r.label }}</div>
                    <div class="role-sublabel">{{ r.sub }}</div>
                  </button>
                }
              </div>
            </div>

            <!-- Name row -->
            <div class="field-row anim-3">
              <div class="field-group">
                <label class="field-label">Prénom</label>
                <div class="input-wrap">
                  <mat-icon class="input-icon">person_outline</mat-icon>
                  <input class="custom-input" placeholder="Ex: Karim" formControlName="firstName">
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">Nom</label>
                <div class="input-wrap">
                  <mat-icon class="input-icon">badge</mat-icon>
                  <input class="custom-input" placeholder="Ex: Benali" formControlName="lastName">
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="field-group anim-4">
              <label class="field-label">Adresse email</label>
              <div class="input-wrap">
                <mat-icon class="input-icon">mail_outline</mat-icon>
                <input class="custom-input" type="email"
                       placeholder="vous@exemple.com"
                       formControlName="email">
              </div>
            </div>

            <!-- Phone -->
            <div class="field-group anim-5">
              <label class="field-label">
                Téléphone <span class="field-optional">(optionnel)</span>
              </label>
              <div class="input-wrap">
                <mat-icon class="input-icon">phone_iphone</mat-icon>
                <input class="custom-input" placeholder="+213 0X XX XX XX" formControlName="phone">
              </div>
            </div>

            <!-- Password -->
            <div class="field-group anim-6" style="margin-bottom:26px">
              <label class="field-label">Mot de passe</label>
              <div class="input-wrap">
                <mat-icon class="input-icon">lock_outline</mat-icon>
                <input class="custom-input has-eye"
                       [type]="hide ? 'password' : 'text'"
                       placeholder="Minimum 8 caractères"
                       formControlName="password">
                <button type="button" class="eye-btn" (click)="hide = !hide">
                  <mat-icon style="font-size:19px;width:19px;height:19px">
                    {{ hide ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </div>
              <!-- Strength bar -->
              @if (form.get('password')?.value) {
                <div class="strength-wrap">
                  <div class="strength-bars">
                    @for (seg of [1,2,3,4]; track seg) {
                      <div class="strength-bar"
                           [style.background]="seg <= passwordStrength ? strengthColor : '#E8EDFF'"></div>
                    }
                  </div>
                  <div class="strength-label-row">
                    <span class="strength-text" [style.color]="strengthColor">{{ strengthLabel }}</span>
                    <span class="strength-hint">Utilisez majuscules, chiffres, symboles</span>
                  </div>
                </div>
              }
            </div>

            <!-- Submit -->
            <div class="anim-7">
              <button class="submit-btn" type="submit" [disabled]="loading || form.invalid">
                @if (loading) {
                  <mat-spinner diameter="20" style="--mdc-circular-progress-active-indicator-color:white"></mat-spinner>
                  <span>Création en cours...</span>
                } @else {
                  <mat-icon style="font-size:20px;width:20px;height:20px">rocket_launch</mat-icon>
                  <span>Créer mon compte gratuitement</span>
                }
              </button>
            </div>

          </form>

          <div class="divider anim-7">
            <div class="divider-line"></div>
            <span class="divider-text">Déjà inscrit ?</span>
            <div class="divider-line"></div>
          </div>

          <div style="text-align:center" class="anim-7">
            <a routerLink="/login" class="login-link">
              Se connecter à mon compte →
            </a>
          </div>

          <!-- Trust badges -->
          <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-top:24px;padding-top:20px;border-top:1px solid #F3F4FF" class="anim-7">
            @for (badge of trustBadges; track badge.icon) {
              <div style="display:flex;align-items:center;gap:5px">
                <mat-icon style="font-size:14px;width:14px;height:14px;color:#10B981">{{ badge.icon }}</mat-icon>
                <span style="font-size:0.71rem;color:#9CA3AF;font-weight:500">{{ badge.text }}</span>
              </div>
            }
          </div>

        </div>
      </div>

    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  hide = true;
  loading = false;

  roles = [
    { value: 'PATIENT',   label: 'Patient',    icon: '🧑‍🤝‍🧑', sub: 'Consultez des médecins' },
    { value: 'DOCTOR',    label: 'Médecin',    icon: '👨‍⚕️', sub: 'Gérez vos consultations' },
    { value: 'SECRETARY', label: 'Secrétaire', icon: '💼',     sub: 'Administrez les RDV' },
  ];

  steps = [
    { n: 1, text: 'Créez votre compte en 2 minutes' },
    { n: 2, text: 'Complétez votre profil médical' },
    { n: 3, text: 'Prenez vos rendez-vous facilement' },
  ];

  trustBadges = [
    { icon: 'verified_user', text: 'Sécurisé SSL' },
    { icon: 'privacy_tip',   text: 'Données protégées' },
    { icon: 'check_circle',  text: 'Certifié RGPD' },
  ];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    role:      ['PATIENT', Validators.required],
    password:  ['', [Validators.required, Validators.minLength(8)]]
  });

  get progress(): number {
    const fields = ['firstName', 'lastName', 'email', 'password'];
    const filled = fields.filter(f => this.form.get(f)?.value?.toString().trim()).length;
    return (filled / fields.length) * 100;
  }

  get passwordStrength(): number {
    const p = this.form.get('password')?.value || '';
    if (p.length < 4) return 0;
    let s = 1;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) || /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  get strengthColor(): string {
    return ['', '#EF4444', '#F59E0B', '#10B981', '#059669'][this.passwordStrength] || '#E8EDFF';
  }

  get strengthLabel(): string {
    return ['', 'Trop faible', 'Moyen', 'Fort', 'Très fort'][this.passwordStrength] || '';
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value as any).subscribe({
      next: () => { this.loading = false; this.auth.redirectToDashboard(); },
      error: (err) => {
        this.loading = false;
        this.snack.open(err.error?.message || 'Erreur lors de l\'inscription', 'Fermer', { duration: 4000 });
      }
    });
  }
}

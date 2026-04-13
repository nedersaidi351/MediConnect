import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatMessage } from '../../../models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    HeaderComponent, SidebarComponent
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-header />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 flex flex-col overflow-hidden p-4 bg-gray-50">
          <mat-card class="flex-1 flex flex-col overflow-hidden">
            <mat-card-header class="border-b pb-3">
              <mat-card-title>Chat de consultation</mat-card-title>
              <mat-card-subtitle>Rendez-vous #{{ appointmentId }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="flex-1 overflow-y-auto p-4" #messagesContainer>
              @if (loading) {
                <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div>
              } @else {
                @for (msg of messages; track msg.id) {
                  <div class="flex mb-3" [class.justify-end]="isMe(msg)">
                    <div class="max-w-[70%] rounded-2xl px-4 py-2 shadow-sm"
                         [class.bg-indigo-600]="isMe(msg)"
                         [class.text-white]="isMe(msg)"
                         [class.bg-white]="!isMe(msg)">
                      @if (!isMe(msg)) {
                        <p class="text-xs font-semibold text-indigo-600 mb-1">{{ msg.senderName }}</p>
                      }
                      <p class="text-sm">{{ msg.content }}</p>
                      <p class="text-xs opacity-60 mt-1 text-right">{{ msg.sentAt | date:'HH:mm' }}</p>
                    </div>
                  </div>
                }
              }
            </mat-card-content>
            <div class="border-t p-3">
              <form [formGroup]="form" (ngSubmit)="send()" class="flex gap-2">
                <mat-form-field appearance="outline" class="flex-1">
                  <input matInput formControlName="content" placeholder="Votre message..." autocomplete="off">
                </mat-form-field>
                <button mat-fab color="primary" type="submit" [disabled]="form.invalid || sending">
                  <mat-icon>send</mat-icon>
                </button>
              </form>
            </div>
          </mat-card>
        </main>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private chatSvc = inject(ChatService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  @ViewChild('messagesContainer') messagesEl!: ElementRef;

  appointmentId!: number;
  messages: ChatMessage[] = [];
  loading = true;
  sending = false;

  form = this.fb.group({ content: ['', Validators.required] });

  ngOnInit(): void {
    this.appointmentId = +this.route.snapshot.paramMap.get('appointmentId')!;
    this.chatSvc.getMessages(this.appointmentId).subscribe({
      next: msgs => { this.messages = msgs; this.loading = false; this.scrollBottom(); },
      error: () => { this.loading = false; }
    });
    this.chatSvc.messages$.subscribe(msg => {
      if (msg.appointmentId === this.appointmentId) {
        this.messages.push(msg);
        this.scrollBottom();
      }
    });
  }

  ngOnDestroy(): void {
    // disconnect handled by service lifecycle
  }

  send(): void {
    if (this.form.invalid) return;
    this.sending = true;
    this.chatSvc.sendMessage(this.appointmentId, this.form.value.content!).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.form.reset();
        this.sending = false;
        this.scrollBottom();
      },
      error: () => { this.sending = false; }
    });
  }

  isMe(msg: ChatMessage): boolean {
    return msg.senderId === this.auth.getUserId();
  }

  scrollBottom(): void {
    setTimeout(() => {
      if (this.messagesEl) {
        this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
      }
    }, 50);
  }
}

import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  specialty?: string;
  specialtySearch?: string;
  handoff?: boolean;
  suggestions?: string[];
  time: Date;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule, MatTooltipModule],
  styles: [`
    .chat-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }
    .chat-window {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 360px;
      max-height: 520px;
      z-index: 1000;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      background: white;
      overflow: hidden;
    }
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 360px;
    }
    .bubble-bot {
      background: #f1f5f9;
      border-radius: 0 12px 12px 12px;
      padding: 10px 14px;
      max-width: 85%;
      align-self: flex-start;
    }
    .bubble-user {
      background: #4f46e5;
      color: white;
      border-radius: 12px 12px 0 12px;
      padding: 10px 14px;
      max-width: 85%;
      align-self: flex-end;
    }
    .typing-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
  `],
  template: `
    <!-- Floating Action Button -->
    <button class="chat-fab" mat-fab color="primary"
            matTooltip="Assistant médical MediConnect"
            (click)="toggleChat()">
      <mat-icon>{{ isOpen() ? 'close' : 'chat' }}</mat-icon>
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div class="chat-window">

        <!-- Header -->
        <div class="bg-indigo-700 text-white px-4 py-3 flex items-center gap-3">
          <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <mat-icon class="text-white" style="font-size: 20px; width: 20px; height: 20px">smart_toy</mat-icon>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-sm">Assistant MediConnect</p>
            <p class="text-xs text-indigo-200">Orientation médicale</p>
          </div>
          <button mat-icon-button (click)="toggleChat()">
            <mat-icon class="text-white">close</mat-icon>
          </button>
        </div>

        <!-- Messages -->
        <div class="messages-area" #messagesContainer>
          @for (msg of messages(); track $index) {
            <div [class]="msg.from === 'user' ? 'bubble-user' : 'bubble-bot'">
              <p class="text-sm whitespace-pre-wrap">{{ msg.text }}</p>

              @if (msg.specialty && msg.from === 'bot') {
                <div class="mt-2 pt-2 border-t border-gray-200">
                  <p class="text-xs font-semibold text-indigo-700">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px; vertical-align: middle">local_hospital</mat-icon>
                    {{ msg.specialty }}
                  </p>
                  @if (msg.specialtySearch) {
                    <button class="mt-1 text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
                            (click)="searchDoctors(msg.specialtySearch!)">
                      Voir les médecins disponibles →
                    </button>
                  }
                </div>
              }

              @if (msg.handoff && msg.from === 'bot') {
                <div class="mt-2">
                  <button class="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
                          (click)="contactSecretary()">
                    Contacter la secrétaire →
                  </button>
                </div>
              }

              @if (msg.suggestions && msg.from === 'bot') {
                <div class="flex flex-wrap gap-1 mt-2">
                  @for (s of msg.suggestions; track s) {
                    <button class="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-full hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                            (click)="sendSuggestion(s)">
                      {{ s }}
                    </button>
                  }
                </div>
              }
            </div>
          }

          @if (typing()) {
            <div class="bubble-bot flex items-center gap-1">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="border-t p-3 flex gap-2">
          <input class="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-indigo-400"
                 placeholder="Décrivez vos symptômes..."
                 [(ngModel)]="inputText"
                 (keydown.enter)="send()"
                 [disabled]="typing()" />
          <button mat-mini-fab color="primary" (click)="send()" [disabled]="!inputText.trim() || typing()">
            <mat-icon>send</mat-icon>
          </button>
        </div>

      </div>
    }
  `
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private container!: ElementRef;

  private http = inject(HttpClient);
  private router = inject(Router);

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  typing = signal(false);
  inputText = '';
  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen() && this.messages().length === 0) {
      this.addBotMessage({
        text: 'Bonjour ! Je suis l\'assistant médical MediConnect. 👋\n\nDécrivez vos symptômes et je vous orienterai vers le spécialiste approprié.\n\nQue puis-je faire pour vous aujourd\'hui ?',
        suggestions: ['Maux de tête', 'Douleur thoracique', 'Problème de peau', 'Santé mentale', 'Parler à la secrétaire']
      });
    }
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';
    this.addUserMessage(text);
    this.getBotResponse(text);
  }

  sendSuggestion(text: string): void {
    this.addUserMessage(text);
    this.getBotResponse(text);
  }

  searchDoctors(specialty: string): void {
    this.router.navigate(['/patient/doctors'], { queryParams: { specialty } });
    this.isOpen.set(false);
  }

  contactSecretary(): void {
    this.addBotMessage({
      text: 'Je vous redirige vers la liste des médecins où vous pourrez prendre rendez-vous. Notre équipe reste disponible pour vous aider.'
    });
  }

  private getBotResponse(text: string): void {
    this.typing.set(true);
    this.shouldScroll = true;

    this.http.post<any>(`${environment.apiUrl}/chatbot/message`, { message: text })
      .subscribe({
        next: res => {
          this.typing.set(false);
          const data = res.data;
          this.addBotMessage({
            text: data.message,
            specialty: data.specialty,
            specialtySearch: data.specialtySearch,
            handoff: data.handoff,
            suggestions: data.suggestions
          });
        },
        error: () => {
          this.typing.set(false);
          this.addBotMessage({
            text: 'Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter directement notre secrétaire.',
            handoff: true
          });
        }
      });
  }

  private addUserMessage(text: string): void {
    this.messages.update(m => [...m, { from: 'user', text, time: new Date() }]);
    this.shouldScroll = true;
  }

  private addBotMessage(data: Partial<ChatMessage>): void {
    this.messages.update(m => [...m, { from: 'bot', time: new Date(), text: '', ...data }]);
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      if (this.container) {
        this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
      }
    } catch {}
  }
}

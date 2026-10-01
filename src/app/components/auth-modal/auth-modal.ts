import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModalComponent {
  protected readonly authService = inject(AuthService);
  readonly closeModal = output<void>();
  readonly authenticated = output<void>();

  // 'signin' or 'signup'
  readonly mode = signal<'signin' | 'signup'>('signin');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  email = '';
  password = '';
  displayName = '';

  setMode(m: 'signin' | 'signup'): void {
    this.mode.set(m);
    this.errorMessage.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }

  async onSubmit(): Promise<void> {
    const emailVal = this.email.trim();
    const passVal = this.password;

    if (!emailVal || !passVal) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (passVal.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      if (this.mode() === 'signup') {
        await this.authService.signUp(emailVal, passVal, this.displayName.trim());
      } else {
        await this.authService.signIn(emailVal, passVal);
      }
      this.authenticated.emit();
      this.closeModal.emit();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

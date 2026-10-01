import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { WatchlistService } from '../../core/services/watchlist.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-modal.html',
  styleUrl: './profile-modal.css',
})
export class ProfileModalComponent {
  protected readonly authService = inject(AuthService);
  protected readonly watchlistService = inject(WatchlistService);
  readonly closeModal = output<void>();

  readonly syncSuccess = signal<boolean>(false);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }

  async manualSync(): Promise<void> {
    await this.watchlistService.syncToCloud();
    this.syncSuccess.set(true);
    setTimeout(() => this.syncSuccess.set(false), 3000);
  }

  async onSignOut(): Promise<void> {
    await this.authService.signOut();
    this.closeModal.emit();
  }
}

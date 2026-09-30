import { Component, HostListener, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
})
export class SettingsModalComponent {
  private readonly watchlistService = inject(WatchlistService);
  private readonly tmdbService = inject(TmdbService);

  readonly closeModal = output<void>();

  apiKeyInput = this.watchlistService.apiKey();
  testStatus = signal<'idle' | 'testing' | 'success' | 'error'>('idle');
  statusMessage = signal<string>('');

  saveKey(): void {
    this.watchlistService.setApiKey(this.apiKeyInput);
    this.testStatus.set('success');
    this.statusMessage.set('API key saved! CineTrack will now use your key for all TMDB requests.');
  }

  useDemoKey(): void {
    this.apiKeyInput = '';
    this.watchlistService.setApiKey('');
    this.testStatus.set('success');
    this.statusMessage.set('Reset to default key. Live TMDB API is active.');
  }

  testConnection(): void {
    this.testStatus.set('testing');
    this.statusMessage.set('Testing connection with TMDB API...');

    const keyToTest = this.apiKeyInput.trim() || '4e44d9029b1270a757cddc766a1bcb63';
    this.tmdbService.validateApiKey(keyToTest).subscribe((isValid) => {
      if (isValid) {
        this.testStatus.set('success');
        this.statusMessage.set('Connection verified! Live TMDB API responded with HTTP 200 OK.');
      } else {
        this.testStatus.set('error');
        this.statusMessage.set('Connection failed: Invalid API key or network issue.');
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }
}

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../core/services/watchlist.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SettingsModalComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly showSettings = signal(false);
  protected readonly isOnline = signal(navigator.onLine);

  private readonly onlineHandler = () => this.isOnline.set(true);
  private readonly offlineHandler = () => this.isOnline.set(false);

  ngOnInit(): void {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  openSettings(): void {
    this.showSettings.set(true);
  }

  closeSettings(): void {
    this.showSettings.set(false);
  }
}

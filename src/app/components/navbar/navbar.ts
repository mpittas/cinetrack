import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../core/services/watchlist.service';
import { AuthService } from '../../core/services/auth.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { ProfileModalComponent } from '../profile-modal/profile-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    SettingsModalComponent,
    AuthModalComponent,
    ProfileModalComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly authService = inject(AuthService);

  protected readonly showSettings = signal(false);
  protected readonly showAuth = signal(false);
  protected readonly showProfile = signal(false);
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

  openAuth(): void {
    this.showAuth.set(true);
  }

  closeAuth(): void {
    this.showAuth.set(false);
  }

  openProfile(): void {
    this.showProfile.set(true);
  }

  closeProfile(): void {
    this.showProfile.set(false);
  }
}

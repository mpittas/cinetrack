import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchlistService } from '../../core/services/watchlist.service';
import { AuthService } from '../../core/services/auth.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieSearchService } from '../../core/services/movie-search.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { ProfileModalComponent } from '../profile-modal/profile-modal';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  @ViewChild('searchInputRef') searchInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('searchContainerRef') searchContainerRef?: ElementRef<HTMLElement>;

  protected readonly watchlistService = inject(WatchlistService);
  protected readonly authService = inject(AuthService);
  protected readonly tmdbService = inject(TmdbService);
  protected readonly movieSearchService = inject(MovieSearchService);
  private readonly router = inject(Router);

  // Modals state
  protected readonly showSettings = signal(false);
  protected readonly showAuth = signal(false);
  protected readonly showProfile = signal(false);
  protected readonly isOnline = signal(navigator.onLine);

  // Search state
  protected readonly searchQuery = signal('');
  protected readonly searchResults = signal<Movie[]>([]);
  protected readonly isSearching = signal(false);
  protected readonly isDropdownOpen = signal(false);
  protected readonly highlightedIndex = signal(-1);
  protected readonly isMobileSearchOpen = signal(false);

  protected readonly isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  private searchDebounceTimer: any = null;
  private readonly onlineHandler = () => this.isOnline.set(true);
  private readonly offlineHandler = () => this.isOnline.set(false);

  ngOnInit(): void {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    // ⌘K or Ctrl+K or / (when not focused on an input)
    const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    const isSlash =
      event.key === '/' &&
      !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement);

    if (isCmdK || isSlash) {
      event.preventDefault();
      this.searchInputRef?.nativeElement.focus();
      this.searchInputRef?.nativeElement.select();
      if (this.searchQuery().trim()) {
        this.isDropdownOpen.set(true);
      }
    }

    if (event.key === 'Escape' && this.isDropdownOpen()) {
      this.closeSearchDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (
      this.searchContainerRef &&
      !this.searchContainerRef.nativeElement.contains(event.target as Node)
    ) {
      this.isDropdownOpen.set(false);
      this.isMobileSearchOpen.set(false);
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.highlightedIndex.set(-1);

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    const trimmed = value.trim();
    if (!trimmed) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      this.isDropdownOpen.set(false);
      return;
    }

    this.isSearching.set(true);
    this.isDropdownOpen.set(true);

    this.searchDebounceTimer = setTimeout(() => {
      this.tmdbService.searchMovies(trimmed).subscribe({
        next: (movies) => {
          this.searchResults.set(movies.slice(0, 6));
          this.isSearching.set(false);
        },
        error: () => {
          this.searchResults.set([]);
          this.isSearching.set(false);
        },
      });
    }, 240);
  }

  onSearchFocus(): void {
    if (this.searchQuery().trim().length > 0) {
      this.isDropdownOpen.set(true);
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    const count = results.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.isDropdownOpen()) {
        this.isDropdownOpen.set(true);
        return;
      }
      this.highlightedIndex.update((idx) => (idx + 1 >= count ? 0 : idx + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isDropdownOpen()) {
        this.isDropdownOpen.set(true);
        return;
      }
      this.highlightedIndex.update((idx) => (idx - 1 < 0 ? count - 1 : idx - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const currentIdx = this.highlightedIndex();
      if (currentIdx >= 0 && results[currentIdx]) {
        this.selectMovie(results[currentIdx]);
      } else {
        this.viewAllInDiscover();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSearchDropdown();
      this.searchInputRef?.nativeElement.blur();
    }
  }

  selectMovie(movie: Movie): void {
    this.closeSearchDropdown();
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.router.navigate(['/movie', movie.id]);
  }

  viewAllInDiscover(): void {
    const q = this.searchQuery().trim();
    this.closeSearchDropdown();
    this.movieSearchService.setQuery(q);
    this.router.navigate(['/discover']);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.isDropdownOpen.set(false);
    this.searchInputRef?.nativeElement.focus();
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen.update((v) => !v);
    if (this.isMobileSearchOpen()) {
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 100);
    }
  }

  closeSearchDropdown(): void {
    this.isDropdownOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  onPosterError(event: Event): void {
    this.tmdbService.onImageError(event, 'poster');
  }

  // Modals
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

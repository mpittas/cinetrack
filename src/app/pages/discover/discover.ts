import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MovieSearchService } from '../../core/services/movie-search.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { AuthService } from '../../core/services/auth.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { ReviewModalComponent } from '../../components/review-modal/review-modal';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    RouterLink,
    FormsModule,
    MovieCardComponent,
    ReviewModalComponent,
    AuthModalComponent,
  ],
  templateUrl: './discover.html',
  styleUrl: './discover.css',
})
export class DiscoverComponent implements OnInit, OnDestroy {
  protected readonly searchService = inject(MovieSearchService);
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly authService = inject(AuthService);
  protected readonly tmdbService = inject(TmdbService);

  selectedGenreId: number | null = null;
  activeReviewMovie = signal<Movie | null>(null);
  showAuthModal = signal<boolean>(false);
  currentQuery = signal<string>('');

  readonly isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  private querySub?: Subscription;

  ngOnInit(): void {
    this.querySub = this.searchService.query$.subscribe((q) => {
      this.currentQuery.set(q);
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  focusGlobalSearch(): void {
    const input = document.getElementById('header-search-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.select();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openAuthModal(): void {
    this.showAuthModal.set(true);
  }

  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }

  clearSearch(): void {
    this.searchService.clearQuery();
  }

  setGenre(genreId: number | null): void {
    this.selectedGenreId = this.selectedGenreId === genreId ? null : genreId;
    this.searchService.setGenre(this.selectedGenreId);
  }

  setTab(tab: 'trending' | 'topRated' | 'nowPlaying'): void {
    this.searchService.setActiveTab(tab);
  }

  openReview(movie: Movie): void {
    this.activeReviewMovie.set(movie);
  }

  closeReview(): void {
    this.activeReviewMovie.set(null);
  }

  toggleHeroWatchlist(hero: Movie): void {
    this.watchlistService.toggleWatchlist(hero);
  }
}

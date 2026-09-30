import { Component, inject, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieSearchService } from '../../core/services/movie-search.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { ReviewModalComponent } from '../../components/review-modal/review-modal';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink, FormsModule, MovieCardComponent, ReviewModalComponent],
  templateUrl: './discover.html',
  styleUrl: './discover.css',
})
export class DiscoverComponent {
  protected readonly searchService = inject(MovieSearchService);
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly tmdbService = inject(TmdbService);

  // Search input binding
  searchInput = '';
  selectedGenreId: number | null = null;
  activeReviewMovie = signal<Movie | null>(null);

  onSearchChange(): void {
    this.searchService.setQuery(this.searchInput);
  }

  clearSearch(): void {
    this.searchInput = '';
    this.searchService.clearQuery();
  }

  setGenre(genreId: number | null): void {
    this.selectedGenreId = this.selectedGenreId === genreId ? null : genreId;
    this.searchService.setGenre(this.selectedGenreId);
  }

  setTab(tab: 'trending' | 'topRated' | 'nowPlaying'): void {
    this.searchInput = '';
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

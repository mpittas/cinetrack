import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { ReviewModalComponent } from '../../components/review-modal/review-modal';
import { Movie, TrackerItem } from '../../core/models/movie.model';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MovieCardComponent, ReviewModalComponent],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class WatchlistComponent {
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly tmdbService = inject(TmdbService);

  activeTab = signal<'watchlist' | 'watched' | 'favorites'>('watchlist');
  searchFilter = signal('');
  sortBy = signal<'date' | 'rating' | 'year' | 'title'>('date');
  viewMode = signal<'grid' | 'list'>('grid');

  activeReviewMovie = signal<Movie | null>(null);

  // Filtered and sorted items computed from reactive state
  readonly displayedItems = computed(() => {
    let list: TrackerItem[];
    const tab = this.activeTab();

    if (tab === 'watched') {
      list = this.watchlistService.watched();
    } else if (tab === 'favorites') {
      list = this.watchlistService.favorites();
    } else {
      list = this.watchlistService.watchlist();
    }

    const query = this.searchFilter().trim().toLowerCase();
    if (query) {
      list = list.filter(
        (item) =>
          item.movie.title.toLowerCase().includes(query) ||
          item.movie.overview.toLowerCase().includes(query)
      );
    }

    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'rating':
          return (b.userRating || b.movie.vote_average) - (a.userRating || a.movie.vote_average);
        case 'year':
          return (b.movie.release_date || '').localeCompare(a.movie.release_date || '');
        case 'title':
          return a.movie.title.localeCompare(b.movie.title);
        case 'date':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });
  });

  setTab(tab: 'watchlist' | 'watched' | 'favorites'): void {
    this.activeTab.set(tab);
  }

  openReview(movie: Movie): void {
    this.activeReviewMovie.set(movie);
  }

  closeReview(): void {
    this.activeReviewMovie.set(null);
  }

  removeItem(movieId: number): void {
    this.watchlistService.removeFromTracking(movieId);
  }

  moveToWatched(movie: Movie): void {
    this.watchlistService.toggleWatched(movie);
  }

  moveToWatchlist(movie: Movie): void {
    this.watchlistService.toggleWatchlist(movie);
  }

  onImgError(event: Event): void {
    this.tmdbService.onImageError(event, 'poster');
  }
}

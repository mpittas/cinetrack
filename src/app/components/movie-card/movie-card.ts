import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../core/models/movie.model';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
  readonly openReviewModal = output<Movie>();

  protected readonly watchlistService = inject(WatchlistService);
  protected readonly tmdbService = inject(TmdbService);

  get posterUrl(): string {
    return this.tmdbService.getImageUrl(this.movie().poster_path, 'w500');
  }

  get releaseYear(): string {
    const date = this.movie().release_date;
    return date ? date.substring(0, 4) : '';
  }

  get ratingFormatted(): string {
    return this.movie().vote_average ? this.movie().vote_average.toFixed(1) : 'NR';
  }

  onToggleWatchlist(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.watchlistService.toggleWatchlist(this.movie());
  }

  onToggleWatched(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.watchlistService.toggleWatched(this.movie());
  }

  onToggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.watchlistService.toggleFavorite(this.movie());
  }

  onReviewClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.openReviewModal.emit(this.movie());
  }

  onImgError(event: Event): void {
    this.tmdbService.onImageError(event, 'poster');
  }
}

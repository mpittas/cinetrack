import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { ReviewModalComponent } from '../../components/review-modal/review-modal';
import { Movie, UserReview } from '../../core/models/movie.model';

export interface RatingBreakdown {
  total: number;
  average: string;
  counts: Record<number, number>;
  percentages: Record<number, number>;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReviewModalComponent],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class ReviewsComponent {
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly tmdbService = inject(TmdbService);

  starFilter = signal<number | null>(null);
  searchQuery = signal<string>('');
  editingMovie = signal<Movie | null>(null);

  // Rating breakdown statistics
  readonly breakdown = computed<RatingBreakdown>(() => {
    const revs = this.watchlistService.reviews();
    const total = revs.length;
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    revs.forEach((r) => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });

    const average = total > 0 ? (revs.reduce((a, b) => a + b.rating, 0) / total).toFixed(1) : '0.0';

    const percentages: Record<number, number> = {
      5: total > 0 ? Math.round((counts[5] / total) * 100) : 0,
      4: total > 0 ? Math.round((counts[4] / total) * 100) : 0,
      3: total > 0 ? Math.round((counts[3] / total) * 100) : 0,
      2: total > 0 ? Math.round((counts[2] / total) * 100) : 0,
      1: total > 0 ? Math.round((counts[1] / total) * 100) : 0,
    };

    return {
      total,
      average,
      counts,
      percentages,
    };
  });

  // Filtered reviews
  readonly displayedReviews = computed(() => {
    let revs = this.watchlistService.reviews();
    const filter = this.starFilter();
    const query = this.searchQuery().trim().toLowerCase();

    if (filter !== null) {
      revs = revs.filter((r) => r.rating === filter);
    }

    if (query) {
      revs = revs.filter(
        (r) =>
          r.movieTitle.toLowerCase().includes(query) ||
          r.headline.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return revs;
  });

  setFilter(star: number | null): void {
    this.starFilter.set(this.starFilter() === star ? null : star);
  }

  editReview(rev: UserReview): void {
    const item = this.watchlistService.getItem(rev.movieId);
    if (item) {
      this.editingMovie.set(item.movie);
    } else {
      // Create minimal Movie proxy to edit review
      this.editingMovie.set({
        id: rev.movieId,
        title: rev.movieTitle,
        poster_path: rev.posterPath,
        backdrop_path: null,
        overview: rev.content,
        release_date: rev.releaseYear ? `${rev.releaseYear}-01-01` : '',
        vote_average: rev.rating * 2,
        vote_count: 0,
        popularity: 0,
      });
    }
  }

  deleteReview(id: string): void {
    this.watchlistService.deleteReview(id);
  }

  closeEditModal(): void {
    this.editingMovie.set(null);
  }

  onImgError(event: Event): void {
    this.tmdbService.onImageError(event, 'poster');
  }
}

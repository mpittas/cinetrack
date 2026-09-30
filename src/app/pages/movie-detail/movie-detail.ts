import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieDetails, Movie, CastMember, VideoResult } from '../../core/models/movie.model';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { ReviewModalComponent } from '../../components/review-modal/review-modal';
import { MovieCardComponent } from '../../components/movie-card/movie-card';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewModalComponent, MovieCardComponent],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly tmdbService = inject(TmdbService);
  protected readonly watchlistService = inject(WatchlistService);

  // Resolved movie state
  movieData = signal<MovieDetails | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  showReviewModal = signal(false);
  activeTrailerKey = signal<string | null>(null);

  // Safe trailer URL for iframe
  readonly safeTrailerUrl = computed<SafeResourceUrl | null>(() => {
    const key = this.activeTrailerKey();
    if (!key) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0`
    );
  });

  // Best trailer video from movie data
  readonly primaryTrailer = computed<VideoResult | null>(() => {
    const m = this.movieData();
    if (!m?.videos?.results?.length) return null;
    const officialTrailer = m.videos.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    );
    if (officialTrailer) return officialTrailer;
    const anyTrailer = m.videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
    if (anyTrailer) return anyTrailer;
    return m.videos.results.find((v) => v.site === 'YouTube') || null;
  });

  // Key crew members (Directors, Screenplay, Cinematography, Original Music)
  readonly keyCrew = computed<{ role: string; name: string }[]>(() => {
    const m = this.movieData();
    if (!m?.credits?.crew?.length) {
      if (m?.directors?.length) {
        return m.directors.map((d) => ({ role: 'Director', name: d }));
      }
      return [];
    }
    const result: { role: string; name: string }[] = [];
    const seen = new Set<string>();

    const targetJobs = [
      { job: 'Director', label: 'Director' },
      { job: 'Screenplay', label: 'Screenplay' },
      { job: 'Writer', label: 'Writer' },
      { job: 'Director of Photography', label: 'Cinematography' },
      { job: 'Original Music Composer', label: 'Music' },
    ];

    for (const target of targetJobs) {
      const match = m.credits.crew.find((c) => c.job === target.job && !seen.has(c.name));
      if (match) {
        seen.add(match.name);
        result.push({ role: target.label, name: match.name });
      }
    }
    return result;
  });

  // Key cast members (up to 18)
  readonly castMembers = computed<CastMember[]>(() => {
    const m = this.movieData();
    return m?.credits?.cast?.slice(0, 18) || [];
  });

  // Recommendations or similar movies
  readonly relatedMovies = computed<Movie[]>(() => {
    const m = this.movieData();
    if (m?.recommendations?.results?.length) {
      return m.recommendations.results.filter((r) => r.id !== m.id).slice(0, 8);
    }
    if (m?.similar?.results?.length) {
      return m.similar.results.filter((r) => r.id !== m.id).slice(0, 8);
    }
    return [];
  });

  ngOnInit(): void {
    // React to route changes, so navigating from movie to movie reloads seamlessly
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const id = idParam ? parseInt(idParam, 10) : null;
      if (id) {
        const resolved = this.route.snapshot.data['movie'] as MovieDetails | undefined;
        if (resolved && resolved.id === id && !this.movieData()) {
          this.movieData.set(resolved);
          this.isLoading.set(false);
          return;
        }
        this.loadMovieDetails(id);
      } else {
        this.errorMessage.set('No movie identifier provided.');
        this.isLoading.set(false);
      }
    });
  }

  loadMovieDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.activeTrailerKey.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.tmdbService.getMovieDetails(id).subscribe({
      next: (details) => {
        this.movieData.set(details);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not retrieve movie details. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  get userReview() {
    const m = this.movieData();
    return m ? this.watchlistService.getReviewForMovie(m.id) : undefined;
  }

  get userRating() {
    const m = this.movieData();
    return m ? this.watchlistService.getUserRating(m.id) : undefined;
  }

  toggleWatchlist(): void {
    const m = this.movieData();
    if (m) this.watchlistService.toggleWatchlist(m);
  }

  toggleWatched(): void {
    const m = this.movieData();
    if (m) this.watchlistService.toggleWatched(m);
  }

  toggleFavorite(): void {
    const m = this.movieData();
    if (m) this.watchlistService.toggleFavorite(m);
  }

  rateMovie(score: number): void {
    const m = this.movieData();
    if (m) this.watchlistService.setUserRating(m, score);
  }

  openTrailer(): void {
    const trailer = this.primaryTrailer();
    if (trailer) {
      this.activeTrailerKey.set(trailer.key);
    }
  }

  closeTrailer(): void {
    this.activeTrailerKey.set(null);
  }

  openReview(): void {
    this.showReviewModal.set(true);
  }

  closeReview(): void {
    this.showReviewModal.set(false);
  }

  deleteReview(reviewId: string): void {
    this.watchlistService.deleteReview(reviewId);
  }

  formatRuntime(minutes: number | undefined): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount || amount <= 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onImgError(event: Event, type: 'poster' | 'backdrop' | 'avatar' = 'poster'): void {
    this.tmdbService.onImageError(event, type);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.activeTrailerKey()) {
      this.closeTrailer();
    } else if (this.showReviewModal()) {
      this.closeReview();
    }
  }
}

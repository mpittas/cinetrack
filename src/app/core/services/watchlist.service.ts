import { Injectable, signal, computed, effect } from '@angular/core';
import { Movie, TrackerItem, UserReview } from '../models/movie.model';

const STORAGE_KEYS = {
  ITEMS: 'cinetrack_items_v2',
  REVIEWS: 'cinetrack_reviews_v2',
  API_KEY: 'cinetrack_tmdb_key_v1',
};

// Initial sample reviews for rich initial state
const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 'rev-interstellar-1',
    movieId: 157336,
    movieTitle: 'Interstellar',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    releaseYear: '2014',
    rating: 5,
    headline: 'Hans Zimmer + Nolan = Pure Cinematic Perfection',
    content: 'The docking scene alone is worth a 10/10. An emotional masterclass on time, love, and human survival.',
    tags: ['Sci-Fi', 'Emotional', 'Masterpiece', 'Cinematography'],
    rewatch: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rev-oppenheimer-2',
    movieId: 872585,
    movieTitle: 'Oppenheimer',
    posterPath: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    releaseYear: '2023',
    rating: 5,
    headline: 'Unrelenting tension and extraordinary sound design',
    content: 'Cillian Murphy gives the performance of a lifetime. The Trinity test sequence leaves you breathless.',
    tags: ['Biopic', 'Historical', 'Oscar Winner'],
    rewatch: false,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'rev-dune2-3',
    movieId: 693134,
    movieTitle: 'Dune: Part Two',
    posterPath: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    releaseYear: '2024',
    rating: 5,
    headline: 'The Lord of the Rings of this generation',
    content: 'Denis Villeneuve expands the scale to astronomical heights. The worm riding scene gave me goosebumps.',
    tags: ['Sci-Fi', 'Epic', 'Visuals'],
    rewatch: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  }
];

const INITIAL_ITEMS: TrackerItem[] = [
  {
    movieId: 157336,
    movie: {
      id: 157336,
      title: 'Interstellar',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
      release_date: '2014-11-05',
      vote_average: 8.4,
      vote_count: 36000,
      popularity: 180,
      runtime: 169,
      tagline: 'Mankind was born on Earth. It was never meant to die here.'
    },
    status: 'watched',
    isFavorite: true,
    userRating: 10,
    addedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    watchedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    movieId: 693134,
    movie: {
      id: 693134,
      title: 'Dune: Part Two',
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge.',
      release_date: '2024-02-27',
      vote_average: 8.2,
      vote_count: 6500,
      popularity: 240,
      runtime: 166,
      tagline: 'Long live the fighters.'
    },
    status: 'watched',
    isFavorite: true,
    userRating: 10,
    addedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    watchedAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    movieId: 872585,
    movie: {
      id: 872585,
      title: 'Oppenheimer',
      poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
      overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
      release_date: '2023-07-19',
      vote_average: 8.1,
      vote_count: 9200,
      popularity: 175,
      runtime: 180,
      tagline: 'The world forever changes.'
    },
    status: 'watched',
    isFavorite: true,
    userRating: 9,
    addedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    watchedAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    movieId: 278,
    movie: {
      id: 278,
      title: 'The Shawshank Redemption',
      poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
      release_date: '1994-09-23',
      vote_average: 8.7,
      vote_count: 27000,
      popularity: 215,
      runtime: 142,
      tagline: 'Fear can hold you prisoner. Hope can set you free.'
    },
    status: 'watchlist',
    isFavorite: false,
    addedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    movieId: 680,
    movie: {
      id: 680,
      title: 'Pulp Fiction',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
      overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in four tales of violence and redemption.',
      release_date: '1994-09-10',
      vote_average: 8.5,
      vote_count: 28000,
      popularity: 190,
      runtime: 154,
      tagline: 'Just because you are a character doesn\'t mean you have character.'
    },
    status: 'watchlist',
    isFavorite: false,
    addedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  // Service-based state using Angular Signals
  readonly trackerItems = signal<TrackerItem[]>(this.loadItems());
  readonly reviews = signal<UserReview[]>(this.loadReviews());
  readonly apiKey = signal<string>(this.loadApiKey());

  // Computed state slices
  readonly watchlist = computed(() =>
    this.trackerItems().filter((item) => item.status === 'watchlist')
  );

  readonly watched = computed(() =>
    this.trackerItems().filter((item) => item.status === 'watched')
  );

  readonly favorites = computed(() =>
    this.trackerItems().filter((item) => item.isFavorite)
  );

  readonly stats = computed(() => {
    const items = this.trackerItems();
    const watchedItems = items.filter((i) => i.status === 'watched');
    const userReviews = this.reviews();
    
    // Ratings calculation
    const ratedItems = items.filter((i) => i.userRating && i.userRating > 0);
    const averageRating = ratedItems.length > 0
      ? (ratedItems.reduce((acc, curr) => acc + (curr.userRating || 0), 0) / ratedItems.length).toFixed(1)
      : '0.0';

    // Total watch runtime in minutes
    const totalMinutes = watchedItems.reduce((acc, curr) => acc + (curr.movie.runtime || 110), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      watchlistCount: this.watchlist().length,
      watchedCount: watchedItems.length,
      favoritesCount: this.favorites().length,
      reviewsCount: userReviews.length,
      averageRating,
      totalHours,
      totalMovies: items.length
    };
  });

  constructor() {
    // Persist tracker items whenever state changes
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.trackerItems()));
      } catch (err) {
        console.warn('Failed to persist items in localStorage', err);
      }
    });

    // Persist reviews whenever state changes
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews()));
      } catch (err) {
        console.warn('Failed to persist reviews in localStorage', err);
      }
    });

    // Persist api key
    effect(() => {
      try {
        const key = this.apiKey();
        if (key) {
          localStorage.setItem(STORAGE_KEYS.API_KEY, key);
        } else {
          localStorage.removeItem(STORAGE_KEYS.API_KEY);
        }
      } catch (err) {
        console.warn('Failed to persist API key', err);
      }
    });
  }

  // --- Watchlist / Item Actions ---

  isInWatchlist(movieId: number): boolean {
    return this.trackerItems().some((item) => item.movieId === movieId && item.status === 'watchlist');
  }

  isWatched(movieId: number): boolean {
    return this.trackerItems().some((item) => item.movieId === movieId && item.status === 'watched');
  }

  isFavorite(movieId: number): boolean {
    return this.trackerItems().some((item) => item.movieId === movieId && item.isFavorite);
  }

  getUserRating(movieId: number): number | undefined {
    const item = this.trackerItems().find((i) => i.movieId === movieId);
    return item?.userRating;
  }

  getItem(movieId: number): TrackerItem | undefined {
    return this.trackerItems().find((i) => i.movieId === movieId);
  }

  toggleWatchlist(movie: Movie): void {
    this.trackerItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.movieId === movie.id);
      if (existingIndex > -1) {
        const item = items[existingIndex];
        if (item.status === 'watchlist') {
          // If already in watchlist, remove from tracking unless it's favorited
          if (item.isFavorite || item.userRating) {
            return items.map((it, idx) => idx === existingIndex ? { ...it, status: 'watched' as const } : it);
          }
          return items.filter((_, idx) => idx !== existingIndex);
        } else {
          // Change status from watched to watchlist
          return items.map((it, idx) => idx === existingIndex ? { ...it, status: 'watchlist' as const } : it);
        }
      } else {
        // Add new watchlist item
        const newItem: TrackerItem = {
          movieId: movie.id,
          movie,
          status: 'watchlist',
          isFavorite: false,
          addedAt: new Date().toISOString(),
        };
        return [newItem, ...items];
      }
    });
  }

  toggleWatched(movie: Movie): void {
    this.trackerItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.movieId === movie.id);
      if (existingIndex > -1) {
        const item = items[existingIndex];
        if (item.status === 'watched') {
          // Switch to watchlist or remove
          if (!item.isFavorite && !item.userRating) {
            return items.filter((_, idx) => idx !== existingIndex);
          }
          return items.map((it, idx) => idx === existingIndex ? { ...it, status: 'watchlist' as const } : it);
        } else {
          // Mark as watched
          return items.map((it, idx) =>
            idx === existingIndex
              ? { ...it, status: 'watched' as const, watchedAt: new Date().toISOString() }
              : it
          );
        }
      } else {
        // Add directly as watched
        const newItem: TrackerItem = {
          movieId: movie.id,
          movie,
          status: 'watched',
          isFavorite: false,
          addedAt: new Date().toISOString(),
          watchedAt: new Date().toISOString(),
        };
        return [newItem, ...items];
      }
    });
  }

  toggleFavorite(movie: Movie): void {
    this.trackerItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.movieId === movie.id);
      if (existingIndex > -1) {
        return items.map((it, idx) =>
          idx === existingIndex ? { ...it, isFavorite: !it.isFavorite } : it
        );
      } else {
        // Create new item in watchlist marked as favorite
        const newItem: TrackerItem = {
          movieId: movie.id,
          movie,
          status: 'watchlist',
          isFavorite: true,
          addedAt: new Date().toISOString(),
        };
        return [newItem, ...items];
      }
    });
  }

  setUserRating(movie: Movie, rating: number): void {
    this.trackerItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.movieId === movie.id);
      if (existingIndex > -1) {
        return items.map((it, idx) =>
          idx === existingIndex
            ? { ...it, userRating: rating, status: 'watched' as const, watchedAt: it.watchedAt || new Date().toISOString() }
            : it
        );
      } else {
        const newItem: TrackerItem = {
          movieId: movie.id,
          movie,
          status: 'watched',
          isFavorite: false,
          userRating: rating,
          addedAt: new Date().toISOString(),
          watchedAt: new Date().toISOString(),
        };
        return [newItem, ...items];
      }
    });
  }

  removeFromTracking(movieId: number): void {
    this.trackerItems.update((items) => items.filter((i) => i.movieId !== movieId));
  }

  // --- Mini-Reviews ---

  getReviewForMovie(movieId: number): UserReview | undefined {
    return this.reviews().find((r) => r.movieId === movieId);
  }

  saveReview(data: {
    movieId: number;
    movieTitle: string;
    posterPath: string | null;
    releaseYear?: string;
    rating: number;
    headline: string;
    content: string;
    tags: string[];
    rewatch: boolean;
  }): UserReview {
    let savedReview: UserReview;
    const existing = this.reviews().find((r) => r.movieId === data.movieId);

    if (existing) {
      savedReview = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.reviews.update((revs) =>
        revs.map((r) => (r.id === existing.id ? savedReview : r))
      );
    } else {
      savedReview = {
        ...data,
        id: 'rev-' + data.movieId + '-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      this.reviews.update((revs) => [savedReview, ...revs]);
    }

    // Auto-sync rating to tracker item if present
    this.trackerItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.movieId === data.movieId);
      if (existingIndex > -1) {
        return items.map((it, idx) =>
          idx === existingIndex
            ? {
                ...it,
                userRating: data.rating * 2, // Convert 5-star to 10-scale
                status: 'watched' as const,
                userReview: savedReview,
              }
            : it
        );
      }
      return items;
    });

    return savedReview;
  }

  deleteReview(reviewId: string): void {
    this.reviews.update((revs) => revs.filter((r) => r.id !== reviewId));
  }

  // --- API Key Management ---

  setApiKey(key: string): void {
    this.apiKey.set(key.trim());
  }

  // --- Helpers for Persistence ---

  private loadItems(): TrackerItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading items from localStorage', e);
    }
    return INITIAL_ITEMS;
  }

  private loadReviews(): UserReview[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading reviews from localStorage', e);
    }
    return INITIAL_REVIEWS;
  }

  private loadApiKey(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
      if (stored === '38ba8c4dd4cb60640b7d87bcbc0928b5') {
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
        return '';
      }
      return stored;
    } catch {
      return '';
    }
  }
}

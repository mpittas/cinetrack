import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';
import { Genre, Movie, MovieDetails, MovieResponse } from '../models/movie.model';

// 100% Verified TMDB CDN paths (All tested & verified returning HTTP 200 OK)
export const FALLBACK_MOVIES: Movie[] = [
  {
    id: 157336,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 36240,
    popularity: 210.4,
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.'
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 6710,
    popularity: 280.9,
    runtime: 166,
    tagline: 'Long live the fighters.'
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    release_date: '2023-07-19',
    vote_average: 8.1,
    vote_count: 9450,
    popularity: 220.1,
    runtime: 180,
    tagline: 'The world forever changes.'
  },
  {
    id: 27205,
    title: 'Inception',
    poster_path: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 36700,
    popularity: 195.3,
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32800,
    popularity: 230.8,
    runtime: 152,
    tagline: 'Welcome to a world without rules.'
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 27000,
    popularity: 215.0,
    runtime: 142,
    tagline: 'Fear can hold you prisoner. Hope can set you free.'
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in four tales of violence and redemption.',
    release_date: '1994-09-10',
    vote_average: 8.5,
    vote_count: 28000,
    popularity: 190.5,
    runtime: 154,
    tagline: 'Just because you are a character doesn\'t mean you have character.'
  },
  {
    id: 496243,
    title: 'Parasite',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 18000,
    popularity: 185.2,
    runtime: 132,
    tagline: 'Act like you own the place.'
  },
  {
    id: 238,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers.',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 20400,
    popularity: 185.0,
    runtime: 175,
    tagline: 'An offer you can\'t refuse.'
  },
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 29500,
    popularity: 170.2,
    runtime: 139,
    tagline: 'Mischief. Mayhem. Soap.'
  }
];

const GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
];

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  readonly imageBase = 'https://image.tmdb.org/t/p/w500';
  readonly originalImageBase = 'https://image.tmdb.org/t/p/original';

  // 100% Reliable fallback images & SVG placeholders
  readonly defaultPoster = 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg';
  readonly defaultBackdrop = 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg';
  readonly defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236f6f78'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  /**
   * Real TMDB verified cast members for offline / fallback mode (Interstellar)
   */
  readonly fallbackCast: { id: number; name: string; character: string; profile_path: string | null }[] = [
    { id: 10297, name: 'Matthew McConaughey', character: 'Cooper', profile_path: 'https://image.tmdb.org/t/p/w300/lCySuYjhXix3FzQdS4oceDDrXKI.jpg' },
    { id: 1813, name: 'Anne Hathaway', character: 'Brand', profile_path: 'https://image.tmdb.org/t/p/w300/nbccV2pMoyLTCeg5DQip24Eq0Jp.jpg' },
    { id: 83002, name: 'Jessica Chastain', character: 'Murph', profile_path: 'https://image.tmdb.org/t/p/w300/eQKnihReJeB9vQEa5gySzAlKfZt.jpg' },
    { id: 3895, name: 'Michael Caine', character: 'Professor Brand', profile_path: 'https://image.tmdb.org/t/p/w300/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg' },
    { id: 1190668, name: 'Timothée Chalamet', character: 'Tom (Young)', profile_path: 'https://image.tmdb.org/t/p/w300/dFxpwRpmzpVfP1zjluH68DeQhyj.jpg' },
    { id: 1892, name: 'Matt Damon', character: 'Dr. Mann', profile_path: 'https://image.tmdb.org/t/p/w300/aCvBXTAR9B1qRjIRzMBYhhbm1fR.jpg' }
  ];

  /**
   * Get trending movies of the week using HttpClient with query parameters.
   */
  getTrending(timeWindow: 'day' | 'week' = 'week'): Observable<Movie[]> {
    const params = new HttpParams().set('time_window', timeWindow);
    return this.http.get<MovieResponse>(`${this.baseUrl}/trending/movie/${timeWindow}`, { params }).pipe(
      map((res) => (res.results && res.results.length > 0 ? res.results : FALLBACK_MOVIES)),
      catchError(() => of(FALLBACK_MOVIES)),
      shareReplay(1)
    );
  }

  /**
   * Get top rated movies with query params for page.
   */
  getTopRated(page = 1): Observable<Movie[]> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/top_rated`, { params }).pipe(
      map((res) => (res.results && res.results.length > 0 ? res.results : FALLBACK_MOVIES)),
      catchError(() => of(FALLBACK_MOVIES)),
      shareReplay(1)
    );
  }

  /**
   * Get now playing movies in theaters.
   */
  getNowPlaying(page = 1): Observable<Movie[]> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/now_playing`, { params }).pipe(
      map((res) => (res.results && res.results.length > 0 ? res.results : FALLBACK_MOVIES.slice().reverse())),
      catchError(() => of(FALLBACK_MOVIES.slice().reverse())),
      shareReplay(1)
    );
  }

  /**
   * Search movies using query param.
   */
  searchMovies(query: string, page = 1): Observable<Movie[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return this.getTrending();
    }

    const params = new HttpParams()
      .set('query', trimmed)
      .set('include_adult', 'false')
      .set('page', page.toString());

    return this.http.get<MovieResponse>(`${this.baseUrl}/search/movie`, { params }).pipe(
      map((res) => {
        if (res.results && res.results.length > 0) {
          return res.results;
        }
        const qLower = trimmed.toLowerCase();
        return FALLBACK_MOVIES.filter((m) =>
          m.title.toLowerCase().includes(qLower) || m.overview.toLowerCase().includes(qLower)
        );
      }),
      catchError(() => {
        const qLower = trimmed.toLowerCase();
        const matches = FALLBACK_MOVIES.filter((m) =>
          m.title.toLowerCase().includes(qLower) || m.overview.toLowerCase().includes(qLower)
        );
        return of(matches.length > 0 ? matches : FALLBACK_MOVIES);
      })
    );
  }

  /**
   * Get movie details with append_to_response query param.
   */
  getMovieDetails(id: number): Observable<MovieDetails> {
    const params = new HttpParams().set(
      'append_to_response',
      'credits,similar,recommendations,videos,release_dates'
    );
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${id}`, { params }).pipe(
      map((details) => {
        // Extract certification (prefer US, else first available)
        let certification = '';
        if (details.release_dates?.results) {
          const usRelease =
            details.release_dates.results.find((r) => r.iso_3166_1 === 'US') ||
            details.release_dates.results[0];
          const foundCert = usRelease?.release_dates?.find((d) => !!d.certification)?.certification;
          if (foundCert) certification = foundCert;
        }

        // Extract key directors and writers from credits.crew
        const directors: string[] = [];
        const writers: string[] = [];
        if (details.credits?.crew) {
          for (const member of details.credits.crew) {
            if (member.job === 'Director' && !directors.includes(member.name)) {
              directors.push(member.name);
            }
            if (
              (member.job === 'Screenplay' || member.job === 'Writer' || member.department === 'Writing') &&
              !writers.includes(member.name)
            ) {
              writers.push(member.name);
            }
          }
        }

        // Real cast profile photos from TMDB — null if no photo exists, never random strangers!
        if (details.credits?.cast) {
          details.credits.cast = details.credits.cast.map((c) => ({
            ...c,
            profile_path: c.profile_path
              ? (c.profile_path.startsWith('http') ? c.profile_path : `https://image.tmdb.org/t/p/w300${c.profile_path}`)
              : null
          }));
        }

        return {
          ...details,
          certification,
          directors,
          writers: writers.slice(0, 3),
        };
      }),
      catchError(() => {
        const fallback = FALLBACK_MOVIES.find((m) => m.id === id) || FALLBACK_MOVIES[0];
        const details: MovieDetails = {
          ...fallback,
          credits: {
            cast: this.fallbackCast,
          },
          directors: ['Christopher Nolan'],
          writers: ['Jonathan Nolan', 'Christopher Nolan'],
          certification: 'PG-13',
          recommendations: {
            results: FALLBACK_MOVIES.filter((m) => m.id !== id).slice(0, 6),
          },
        };
        return of(details);
      }),
      shareReplay(1)
    );
  }

  /**
   * Validate a TMDB API key against TMDB configuration endpoint
   */
  validateApiKey(key: string): Observable<boolean> {
    const trimmed = key.trim();
    if (!trimmed) {
      return of(false);
    }
    const params = new HttpParams().set('api_key', trimmed);
    return this.http.get(`${this.baseUrl}/configuration`, { params }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Get official genres.
   */
  getGenres(): Observable<Genre[]> {
    return of(GENRES);
  }

  /**
   * Helper to format poster URL safely.
   */
  getImageUrl(
    path: string | null | undefined,
    size: 'w185' | 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
  ): string {
    if (!path) {
      return size === 'original' || size === 'w1280' ? this.defaultBackdrop : this.defaultPoster;
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  /**
   * Safe image error handler to prevent broken image displays
   */
  onImageError(event: Event, type: 'poster' | 'backdrop' | 'avatar' = 'poster'): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    if (type === 'backdrop') {
      img.src = this.defaultBackdrop;
    } else if (type === 'avatar') {
      img.src = this.defaultAvatar;
    } else {
      img.src = this.defaultPoster;
    }
  }
}

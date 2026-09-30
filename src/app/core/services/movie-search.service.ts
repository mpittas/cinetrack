import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, map, shareReplay, catchError } from 'rxjs/operators';
import { TmdbService } from './tmdb.service';
import { Movie, Genre } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieSearchService {
  private readonly tmdb = inject(TmdbService);

  // Reactive state subjects
  private readonly querySubject = new BehaviorSubject<string>('');
  private readonly selectedGenreSubject = new BehaviorSubject<number | null>(null);
  private readonly activeTabSubject = new BehaviorSubject<'trending' | 'topRated' | 'nowPlaying'>('trending');
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable streams for template consumption via AsyncPipe
  readonly query$ = this.querySubject.asObservable();
  readonly selectedGenre$ = this.selectedGenreSubject.asObservable();
  readonly activeTab$ = this.activeTabSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly genres$: Observable<Genre[]> = this.tmdb.getGenres().pipe(shareReplay(1));

  /**
   * Main Observable stream managing movie results.
   * Debounces user input and switches API calls reactively.
   */
  readonly movies$: Observable<Movie[]> = combineLatest([
    this.querySubject.pipe(debounceTime(280), distinctUntilChanged()),
    this.activeTabSubject,
    this.selectedGenreSubject,
  ]).pipe(
    tap(() => this.loadingSubject.next(true)),
    switchMap(([query, activeTab, selectedGenre]) => {
      let fetchStream: Observable<Movie[]>;
      if (query && query.trim().length > 0) {
        fetchStream = this.tmdb.searchMovies(query);
      } else {
        switch (activeTab) {
          case 'topRated':
            fetchStream = this.tmdb.getTopRated();
            break;
          case 'nowPlaying':
            fetchStream = this.tmdb.getNowPlaying();
            break;
          case 'trending':
          default:
            fetchStream = this.tmdb.getTrending();
            break;
        }
      }

      return fetchStream.pipe(
        tap(() => this.loadingSubject.next(false)),
        map((movies: Movie[]) => {
          if (!selectedGenre) return movies;
          return movies.filter((m: Movie) =>
            m.genre_ids?.includes(selectedGenre) || m.genres?.some((g: Genre) => g.id === selectedGenre)
          );
        }),
        catchError((err) => {
          console.error('Movie stream error caught:', err);
          this.loadingSubject.next(false);
          return of([] as Movie[]);
        })
      );
    }),
    shareReplay(1)
  );

  /**
   * Featured banner hero movie stream (the top trending movie with full details)
   */
  readonly heroMovie$: Observable<Movie | null> = this.tmdb.getTrending().pipe(
    switchMap((movies) => {
      if (movies.length > 0) {
        return this.tmdb.getMovieDetails(movies[0].id).pipe(catchError(() => of(movies[0])));
      }
      return of(null);
    }),
    shareReplay(1)
  );

  /**
   * Action: Update search text
   */
  setQuery(query: string): void {
    this.querySubject.next(query);
  }

  /**
   * Action: Filter by genre
   */
  setGenre(genreId: number | null): void {
    this.selectedGenreSubject.next(genreId);
  }

  /**
   * Action: Change category tab
   */
  setActiveTab(tab: 'trending' | 'topRated' | 'nowPlaying'): void {
    this.activeTabSubject.next(tab);
    if (this.querySubject.value) {
      this.querySubject.next(''); // Reset search query when switching tabs
    }
  }

  /**
   * Action: Clear query
   */
  clearQuery(): void {
    this.querySubject.next('');
  }
}

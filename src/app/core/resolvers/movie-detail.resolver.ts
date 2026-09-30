import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TmdbService } from '../services/tmdb.service';
import { MovieDetails } from '../models/movie.model';

/**
 * Route Resolver for /movie/:id
 * Fetches the movie details and credits before the MovieDetailComponent is rendered.
 */
export const movieDetailResolver: ResolveFn<MovieDetails> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<MovieDetails> => {
  const tmdbService = inject(TmdbService);
  const idParam = route.paramMap.get('id');
  const movieId = idParam ? parseInt(idParam, 10) : 157336;

  return tmdbService.getMovieDetails(movieId);
};

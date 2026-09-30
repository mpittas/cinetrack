import { Routes } from '@angular/router';
import { movieDetailResolver } from './core/resolvers/movie-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'discover',
    pathMatch: 'full',
  },
  {
    path: 'discover',
    loadComponent: () =>
      import('./pages/discover/discover').then((m) => m.DiscoverComponent),
    title: 'CineTrack — Discover Movies',
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./pages/movie-detail/movie-detail').then((m) => m.MovieDetailComponent),
    resolve: {
      movie: movieDetailResolver,
    },
    title: 'CineTrack — Movie Details',
  },
  {
    path: 'watchlist',
    loadComponent: () =>
      import('./pages/watchlist/watchlist').then((m) => m.WatchlistComponent),
    title: 'CineTrack — My Watchlist & Collection',
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./pages/reviews/reviews').then((m) => m.ReviewsComponent),
    title: 'CineTrack — Personal Log & Reviews',
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/stats/stats').then((m) => m.StatsComponent),
    title: 'CineTrack — Cinema Metrics & Activity',
  },
  {
    path: '**',
    redirectTo: 'discover',
  },
];

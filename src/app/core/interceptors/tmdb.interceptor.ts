import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { WatchlistService } from '../services/watchlist.service';

/**
 * Custom TMDB Interceptor that intercepts HTTP requests to api.themoviedb.org
 * and injects the API key parameter or authorization token into the query params.
 */
export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept requests destined for TMDB API
  if (!req.url.includes('api.themoviedb.org')) {
    return next(req);
  }

  const watchlistService = inject(WatchlistService);
  const activeKey = watchlistService.apiKey();

  // If user provided a Read Access Token (v4 auth), use Bearer header
  if (activeKey && activeKey.startsWith('eyJ')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${activeKey}`,
        Accept: 'application/json',
      },
    });
    return next(authReq);
  }

  // Otherwise inject api_key query parameter (ignoring revoked placeholder)
  const revokedKey = '38ba8c4dd4cb60640b7d87bcbc0928b5';
  const validFallbackKey = '4e44d9029b1270a757cddc766a1bcb63';
  const keyToUse = activeKey && activeKey !== revokedKey ? activeKey : validFallbackKey;
  let params = req.params;

  if (!params.has('api_key')) {
    params = params.set('api_key', keyToUse);
  }

  if (!params.has('language')) {
    params = params.set('language', 'en-US');
  }

  const modifiedReq = req.clone({ params });
  return next(modifiedReq);
};

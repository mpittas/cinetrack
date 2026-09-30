export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official?: boolean;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface ReleaseDateResult {
  iso_3166_1: string;
  release_dates: {
    certification: string;
    note?: string;
    release_date: string;
    type: number;
  }[];
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
}

export interface MovieDetails extends Movie {
  credits?: {
    cast: CastMember[];
    crew?: CrewMember[];
  };
  similar?: {
    results: Movie[];
  };
  recommendations?: {
    results: Movie[];
  };
  videos?: {
    results: VideoResult[];
  };
  release_dates?: {
    results: ReleaseDateResult[];
  };
  budget?: number;
  revenue?: number;
  homepage?: string | null;
  imdb_id?: string | null;
  certification?: string;
  directors?: string[];
  writers?: string[];
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
}

export interface UserReview {
  id: string;
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseYear?: string;
  rating: number; // 1 to 5 stars (or 1 to 10)
  headline: string;
  content: string;
  tags: string[];
  rewatch: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TrackerItem {
  movieId: number;
  movie: Movie;
  status: 'watchlist' | 'watched';
  isFavorite: boolean;
  userRating?: number; // 1 to 10
  addedAt: string;
  watchedAt?: string;
  userReview?: UserReview;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

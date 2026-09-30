import { Component, HostListener, input, output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Movie } from '../../core/models/movie.model';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-modal.html',
  styleUrl: './review-modal.css',
})
export class ReviewModalComponent implements OnInit {
  readonly movie = input.required<Movie>();
  readonly close = output<void>();

  private readonly watchlistService = inject(WatchlistService);
  protected readonly tmdbService = inject(TmdbService);

  rating = 5;
  headline = '';
  content = '';
  rewatch = true;
  selectedTags: string[] = [];

  readonly suggestedTags = [
    'Masterpiece',
    'Great Acting',
    'Mind-bending',
    'Emotional',
    'Cinematography',
    'Great Score',
    'Must Watch',
    'Overrated',
  ];

  customTag = '';

  ngOnInit(): void {
    const existing = this.watchlistService.getReviewForMovie(this.movie().id);
    if (existing) {
      this.rating = existing.rating;
      this.headline = existing.headline;
      this.content = existing.content;
      this.rewatch = existing.rewatch;
      this.selectedTags = [...existing.tags];
    }
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  toggleTag(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
  }

  addCustomTag(): void {
    const t = this.customTag.trim();
    if (t && !this.selectedTags.includes(t)) {
      this.selectedTags.push(t);
      this.customTag = '';
    }
  }

  save(): void {
    if (!this.headline.trim()) {
      this.headline = `${this.rating}-Star Experience`;
    }

    this.watchlistService.saveReview({
      movieId: this.movie().id,
      movieTitle: this.movie().title,
      posterPath: this.movie().poster_path,
      releaseYear: this.movie().release_date?.substring(0, 4),
      rating: this.rating,
      headline: this.headline.trim(),
      content: this.content.trim() || 'No additional notes provided.',
      tags: this.selectedTags,
      rewatch: this.rewatch,
    });

    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onImgError(event: Event): void {
    this.tmdbService.onImageError(event, 'poster');
  }
}

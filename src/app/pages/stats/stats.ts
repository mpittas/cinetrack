import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../core/services/watchlist.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class StatsComponent {
  protected readonly watchlistService = inject(WatchlistService);
  statusMessage = signal<string>('');

  exportData(): void {
    const data = {
      items: this.watchlistService.trackerItems(),
      reviews: this.watchlistService.reviews(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinetrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.statusMessage.set('Watchlist and reviews backup exported successfully!');
    setTimeout(() => this.statusMessage.set(''), 4000);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content.items && Array.isArray(content.items)) {
            this.watchlistService.trackerItems.set(content.items);
          }
          if (content.reviews && Array.isArray(content.reviews)) {
            this.watchlistService.reviews.set(content.reviews);
          }
          this.statusMessage.set('Backup successfully restored into CineTrack!');
          setTimeout(() => this.statusMessage.set(''), 4000);
        } catch {
          this.statusMessage.set('Failed to parse JSON backup file.');
          setTimeout(() => this.statusMessage.set(''), 4000);
        }
      };
      reader.readAsText(file);
    }
  }
}

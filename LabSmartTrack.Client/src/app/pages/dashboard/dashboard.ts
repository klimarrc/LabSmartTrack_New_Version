import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  ApiService,
  HealthResponse,
} from '../../services/api/api.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  protected readonly apiStatus =
    signal<'checking' | 'online' | 'offline'>(
      'checking',
    );

  protected readonly apiMessage = signal(
    'Checking API connection...',
  );

  protected readonly apiDetails =
    signal<HealthResponse | null>(null);

  private readonly apiService = inject(ApiService);

  ngOnInit(): void {
    this.checkApiHealth();
  }

  protected checkApiHealth(): void {
    this.apiStatus.set('checking');
    this.apiMessage.set(
      'Checking API connection...',
    );

    this.apiService.getHealth().subscribe({
      next: response => {
        this.apiDetails.set(response);
        this.apiStatus.set('online');
        this.apiMessage.set(
          `${response.application} is available`,
        );
      },

      error: error => {
        console.error(
          'Health-check request failed:',
          error,
        );

        this.apiDetails.set(null);
        this.apiStatus.set('offline');
        this.apiMessage.set(
          'The API is unavailable. Confirm that the ASP.NET Core API is running.',
        );
      },
    });
  }

  // Keep your existing dashboard properties below:
  // summaryCards
  // breedingRows
  // filteredBreedingRows
  // strainCounts
  // activity
}
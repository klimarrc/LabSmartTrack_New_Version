import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Observable,
} from 'rxjs';

import { environment } from '../../../environments/environment';

export interface HealthResponse {
  status: string;
  application: string;
  timestampUtc: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getHealth(): Observable<HealthResponse> {
    return this.http
      .get<HealthResponse>(
        `${this.apiBaseUrl}/api/Health`,
      );

  }
}
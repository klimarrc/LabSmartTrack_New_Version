import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface CreateBreedingPairRequest {
    breedingCode: string;
    sireId: number;
    damId: number;
    cageId: number;
    startDate: string;
}

export interface BreedingPair extends CreateBreedingPairRequest {
    id: number;
    endDate: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class BreedingPairsService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiBaseUrl}/BreedingPairs`;

    getAll(active?: boolean) {
        const url = active === undefined ? this.url : `${this.url}?active=${active}`;
        return this.http.get<BreedingPair[]>(url);
    }

    getById(id: number) {
        return this.http.get<BreedingPair>(`${this.url}/${id}`);
    }

    create(request: CreateBreedingPairRequest) {
        return this.http.post<BreedingPair>(this.url, request);
    }

    end(id: number, endDate: string) {
        return this.http.put<void>(`${this.url}/${id}`, { endDate });
    }
}
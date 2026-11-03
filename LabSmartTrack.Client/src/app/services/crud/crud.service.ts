import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuditableEntity } from '../../../models/colony.models';

export abstract class CrudService<
    TEntity extends AuditableEntity,
    TRequest
> {
    protected constructor(
        private readonly http: HttpClient,
        private readonly endpoint: string,
    ) { }

    getAll(): Observable<TEntity[]> {
        return this.http.get<TEntity[]>(this.endpoint);
    }

    getById(id: number): Observable<TEntity> {
        return this.http.get<TEntity>(
            `${this.endpoint}/${id}`,
        );
    }

    create(request: TRequest): Observable<TEntity> {
        return this.http.post<TEntity>(
            this.endpoint,
            request,
        );
    }

    update(
        id: number,
        request: TRequest,
    ): Observable<void> {
        // Scaffolded ASP.NET controllers require the body ID
        // to match the route ID.
        return this.http.put<void>(
            `${this.endpoint}/${id}`,
            { ...request, id },
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.endpoint}/${id}`,
        );
    }
}
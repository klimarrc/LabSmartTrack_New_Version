import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    inject,
    signal,
} from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, map, Observable } from 'rxjs';

import {
    Facility,
    FacilityRequest,
} from '../../../models/colony.models';
import {
    FacilitiesService,
} from '../../services/colony.services';

@Component({
    selector: 'app-facility-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './facility-form.html',
    styleUrl: './facility-form.css',
})

export class FacilityForm implements OnChanges {
    @Input() facility: Facility | null = null;

    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly formBuilder = inject(FormBuilder);
    private readonly facilitiesService =
        inject(FacilitiesService);

    readonly saving = signal(false);
    readonly error = signal('');

    readonly form = this.formBuilder.nonNullable.group({
        name: [
            '',
            [
                Validators.required,
                Validators.maxLength(100),
                Validators.pattern(/\S/),
            ],
        ],
        description: ['', Validators.maxLength(500)],
    });

    ngOnChanges(): void {
        this.error.set('');

        this.form.reset({
            name: this.facility?.name ?? '',
            description: this.facility?.description ?? '',
        });
    }

    save(): void {
        if (this.saving()) {
            return;
        }

        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        const values = this.form.getRawValue();

        const request: FacilityRequest = {
            name: values.name.trim(),
            description: values.description.trim() || null,
        };

        this.error.set('');
        this.saving.set(true);
        this.form.disable();

        const operation: Observable<void> = this.facility
            ? this.facilitiesService.update(
                this.facility.id,
                request,
            )
            : this.facilitiesService.create(request).pipe(
                map(() => undefined),
            );
        operation.pipe(
            finalize(() => {
                this.saving.set(false);
                this.form.enable();
            }),
        ).subscribe({
            next: () => this.saved.emit(),
            error: (error: HttpErrorResponse) => {
                this.error.set(this.getErrorMessage(error));
            },
        });

    }

    cancel(): void {
        if (!this.saving()) {
            this.cancelled.emit();
        }
    }

    private getErrorMessage(
        error: HttpErrorResponse,
    ): string {
        if (error.status === 0) {
            return 'Cannot reach the API. Check that it is running.';
        }

        if (error.status === 409) {
            return 'A facility with this name already exists.';
        }

        if (error.status === 404) {
            return 'This facility no longer exists. Refresh the list.';
        }

        const body = error.error;

        if (body && typeof body === 'object') {
            if (body.errors && typeof body.errors === 'object') {
                const messages = Object.values(body.errors)
                    .flatMap(value =>
                        Array.isArray(value)
                            ? value.filter(
                                (item): item is string =>
                                    typeof item === 'string',
                            )
                            : [],
                    );

                if (messages.length) {
                    return messages.join(' ');
                }
            }

            if (typeof body.message === 'string') {
                return body.message;
            }
        }

        return 'Unable to save the facility. Please try again.';
    }
}
import {
    Component,
    DestroyRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, map } from 'rxjs';

import {
    Strain,
    StrainRequest,
} from '../../../models/colony.models';
import { StrainsService } from '../../services/colony.services';

@Component({
    selector: 'app-strain-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './strain-form.html',
    styleUrl: './strain-form.css',
})
export class StrainForm implements OnChanges {
    @Input() strain: Strain | null = null;

    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly formBuilder = inject(FormBuilder);
    private readonly strainsService = inject(StrainsService);
    private readonly destroyRef = inject(DestroyRef);

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
            name: this.strain?.name ?? '',
            description: this.strain?.description ?? '',
        });
    }

    save(): void {
        if (this.saving()) {
            return;
        }

        this.error.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        const values = this.form.getRawValue();

        const request: StrainRequest = {
            name: values.name.trim(),
            description: values.description.trim() || null,
        };

        this.saving.set(true);
        this.form.disable();

        const operation: Observable<void> = this.strain
            ? this.strainsService.update(this.strain.id, request)
            : this.strainsService.create(request).pipe(
                map(() => undefined),
            );

        operation.pipe(
            takeUntilDestroyed(this.destroyRef),
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

    private getErrorMessage(error: HttpErrorResponse): string {
        if (error.status === 0) {
            return 'Cannot reach the API. Check that it is running.';
        }

        if (error.status === 409) {
            return 'A strain with this name already exists. Use a different name.';
        }

        if (error.status === 404) {
            return 'This strain no longer exists. Refresh the list.';
        }

        const body = error.error;

        if (body && typeof body === 'object') {
            if (body.errors && typeof body.errors === 'object') {
                const messages = Object.values(body.errors).flatMap(
                    value => Array.isArray(value)
                        ? value.filter(
                            (item): item is string => typeof item === 'string',
                        )
                        : [],
                );

                if (messages.length > 0) {
                    return messages.join(' ');
                }
            }

            if (typeof body.message === 'string') {
                return body.message;
            }
        }

        return 'Unable to save the strain. Your entered values have been preserved.';
    }
}
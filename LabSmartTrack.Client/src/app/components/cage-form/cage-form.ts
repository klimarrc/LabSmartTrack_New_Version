import {
    Component,
    DestroyRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
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
    Cage,
    CageRequest,
    Rack,
} from '../../../models/colony.models';

import {
    CagesService,
    RacksService,
} from '../../services/colony.services';

@Component({
    selector: 'app-cage-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './cage-form.html',
    styleUrl: './cage-form.css',
})
export class CageForm implements OnInit, OnChanges {
    @Input() cage: Cage | null = null;

    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly formBuilder = inject(FormBuilder);
    private readonly cagesService = inject(CagesService);
    private readonly racksService = inject(RacksService);
    private readonly destroyRef = inject(DestroyRef);

    // Confirm the complete list against your API.
    readonly statuses: string[] = ['Active'];

    readonly racks = signal<Rack[]>([]);
    readonly loadingRacks = signal(false);
    readonly racksError = signal('');

    readonly saving = signal(false);
    readonly error = signal('');

    readonly form = this.formBuilder.nonNullable.group({
        name: [
            '',
            [
                Validators.required,
                Validators.maxLength(50),
                Validators.pattern(/\S/),
            ],
        ],
        cageNumber: [
            '',
            [
                Validators.required,
                Validators.maxLength(50),
                Validators.pattern(/\S/),
            ],
        ],
        status: ['', Validators.required],
        rackId: [
            0,
            [
                Validators.required,
                Validators.min(1),
            ],
        ],
    });

    ngOnInit(): void {
        this.loadRacks();
    }

    ngOnChanges(): void {
        this.error.set('');

        this.form.reset({
            name: this.cage?.name ?? '',
            cageNumber: this.cage?.cageNumber ?? '',
            status: this.cage?.status ?? '',
            rackId: this.cage?.rackId ?? 0,
        });

        if (
            this.cage &&
            !this.statuses.includes(this.cage.status)
        ) {
            this.error.set(
                'This cage has a status not configured in the dropdown. ' +
                'Confirm the API’s allowed statuses before editing it.',
            );
        }
    }

    loadRacks(): void {
        if (this.loadingRacks()) {
            return;
        }

        this.loadingRacks.set(true);
        this.racksError.set('');

        this.racksService.getAll().pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loadingRacks.set(false)),
        ).subscribe({
            next: racks => {
                this.racks.set(racks);
            },
            error: () => {
                this.racksError.set(
                    'Unable to load racks. Check that the API is running and try again.',
                );
            },
        });
    }

    save(): void {
        if (
            this.saving() ||
            this.loadingRacks() ||
            this.racksError()
        ) {
            return;
        }

        this.error.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        const values = this.form.getRawValue();

        const rackExists = this.racks().some(
            rack => rack.id === values.rackId,
        );

        if (!rackExists) {
            this.error.set('Please select an available rack.');
            return;
        }

        if (!this.statuses.includes(values.status)) {
            this.error.set('Please select a configured cage status.');
            return;
        }

        const request: CageRequest = {
            name: values.name.trim(),
            cageNumber: values.cageNumber.trim(),
            status: values.status,
            rackId: values.rackId,
        };

        this.saving.set(true);
        this.form.disable();

        const operation: Observable<void> = this.cage
            ? this.cagesService.update(this.cage.id, request)
            : this.cagesService.create(request).pipe(
                map(() => undefined),
            );

        operation.pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
                this.saving.set(false);
                this.form.enable();
            }),
        ).subscribe({
            next: () => {
                this.saved.emit();
            },
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

        if (error.status === 404) {
            return 'The cage or selected rack no longer exists. Refresh the list.';
        }

        const body = error.error;

        if (body && typeof body === 'object') {
            if (body.errors && typeof body.errors === 'object') {
                const messages = Object.values(body.errors).flatMap(
                    value => Array.isArray(value)
                        ? value.filter(
                            (item): item is string =>
                                typeof item === 'string',
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

        if (error.status === 409) {
            return 'The cage conflicts with an existing record. ' +
                'Check whether its cage number is already in use.';
        }

        return 'Unable to save the cage. Your entered values have been preserved.';
    }
}
import {
    Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit,
    Output, inject, signal,
} from '@angular/core';
import {
    FormBuilder, ReactiveFormsModule, ValidatorFn, Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, forkJoin, map, of } from 'rxjs';

import {
    Cage, Mouse, MouseRequest, Strain,
} from '../../../models/colony.models';
import {
    CagesService, MiceService, StrainsService,
} from '../../services/colony.services';

@Component({
    selector: 'app-mouse-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './mouse-form.html',
    styleUrl: './mouse-form.css',
})
export class MouseForm implements OnInit, OnChanges {
    @Input() mouse: Mouse | null = null;
    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly fb = inject(FormBuilder);
    private readonly miceService = inject(MiceService);
    private readonly cagesService = inject(CagesService);
    private readonly strainsService = inject(StrainsService);
    private readonly destroyRef = inject(DestroyRef);

    readonly cages = signal<Cage[]>([]);
    readonly strains = signal<Strain[]>([]);
    readonly sexes = signal<string[]>([]);
    readonly statuses = signal<string[]>([]);
    readonly today = signal('');

    readonly loading = signal(false);
    readonly loadError = signal('');
    readonly saving = signal(false);
    readonly error = signal('');

    private readonly birthDateValidator: ValidatorFn = control => {
        const value: string = control.value || '';
        if (!value) return null;

        // Native date inputs provide YYYY-MM-DD; no timezone conversion.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { dateFormat: true };

        return this.today() && value > this.today()
            ? { futureDate: true }
            : null;
    };

    readonly form = this.fb.nonNullable.group({
        identifier: ['', [
            Validators.required, Validators.maxLength(50), Validators.pattern(/\S/),
        ]],
        sex: ['', Validators.required],
        status: ['', Validators.required],
        birthDate: ['', this.birthDateValidator],
        cageId: [0, [Validators.required, Validators.min(1)]],
        strainId: [0, [Validators.required, Validators.min(1)]],
    });

    ngOnInit(): void {
        this.loadOptions();
    }

    ngOnChanges(): void {
        const m = this.mouse;
        this.error.set('');
        this.form.reset({
            identifier: m?.identifier ?? '',
            sex: m?.sex ?? '',
            status: m?.status ?? '',
            birthDate: m?.birthDate ?? '',
            cageId: m?.cageId ?? 0,
            strainId: m?.strainId ?? 0,
        });
    }

    loadOptions(): void {
        if (this.loading()) return;
        this.loading.set(true);
        this.loadError.set('');

        forkJoin({
            cages: this.cagesService.getAll(),
            strains: this.strainsService.getAll(),
            options: this.miceService.getFormOptions(),
            }).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loading.set(false)),
            ).subscribe({


                next: ({ cages, strains, options }) => {
                    this.cages.set(cages);
                    this.strains.set(strains);
                    this.sexes.set(options.sexes);
                    this.statuses.set(options.statuses);
                    this.today.set(options.today);
                    this.form.controls.birthDate.updateValueAndValidity();
                },
                error: (err) => {
                    this.loadError.set('Could not load the cages, strains, or mouse form options. Please retry.');
                }

                    if (!options.sexes.length || !options.statuses.length || !options.today) {
            this.loadError.set('Mouse form options are incomplete. Check the API.');
        }
    },
    error: () => this.loadError.set(
    'Could not load the cages, strains, or mouse form options. Please retry.',
    ),
});
    }

save(): void {
    if(this.saving() || this.loading() || this.loadError() || !this.today()) return;

    this.error.set('');
    this.form.markAllAsTouched();
    if(this.form.invalid) return;

    const v = this.form.getRawValue();

    if(!this.sexes().includes(v.sex) || !this.statuses().includes(v.status)) {
    this.error.set('Select a sex and status from the available options.');
    return;
}

if (!this.cages().some(c => c.id === v.cageId) ||
    !this.strains().some(s => s.id === v.strainId)) {
    this.error.set('Select an available cage and strain.');
    return;
}

const request: MouseRequest = {
    identifier: v.identifier.trim(),
    sex: v.sex,
    status: v.status,
    birthDate: v.birthDate || null,
    cageId: v.cageId,
    strainId: v.strainId,
};

const operation: Observable<void> = this.mouse
    ? this.miceService.update(this.mouse.id, request)
    : this.miceService.create(request).pipe(map(() => undefined));

this.saving.set(true);
this.form.disable();

operation.pipe(
    takeUntilDestroyed(this.destroyRef),
    finalize(() => {
        this.saving.set(false);
        this.form.enable();
    }),
).subscribe({
    next: () => this.saved.emit(),
    error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
            this.error.set('A mouse with this identifier already exists.');
        } else if (err.status === 0) {
            this.error.set('Cannot reach the API. Your entries have been kept.');
        } else if (err.status === 404) {
            this.error.set('The record no longer exists. Refresh the list.');
        } else {
            const messages = Object.values(err.error?.errors ?? {})
                .flatMap(value => Array.isArray(value)
                    ? value.filter((item): item is string => typeof item === 'string')
                    : []);
            this.error.set(messages.join(' ') || 'Unable to save the mouse. Please retry.');
        }
    },
});
        }

cancel(): void {
    if(!this.saving()) this.cancelled.emit();
}

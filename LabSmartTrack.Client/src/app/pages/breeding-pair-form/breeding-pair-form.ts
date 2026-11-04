import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { Mouse, Cage } from '../../../models/colony.models';
import { MiceService, CagesService } from '../../services/colony.services';
import { BreedingPairsService } from '../../services/breeding-pairs.service';

@Component({
    selector: 'app-breeding-pair-form',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './breeding-pair-form.html',
    styleUrl: './breeding-pair-form.css',
})
export class BreedingPairForm {
    private readonly fb = inject(FormBuilder);
    private readonly mice = inject(MiceService);
    private readonly cagesService = inject(CagesService);
    private readonly pairs = inject(BreedingPairsService);
    private readonly destroyRef = inject(DestroyRef);

    readonly sires = signal<Mouse[]>([]);
    readonly dams = signal<Mouse[]>([]);
    readonly cages = signal<Cage[]>([]);
    readonly today = signal('');
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    readonly error = signal('');
    readonly success = signal('');

    readonly form = this.fb.nonNullable.group({
        breedingCode: ['', [
            Validators.required, Validators.maxLength(50), Validators.pattern(/\S/),
        ]],
        sireId: [0, Validators.min(1)],
        damId: [0, Validators.min(1)],
        cageId: [0, Validators.min(1)],
        startDate: ['', Validators.required],
    });

    constructor() {
        this.load();
    }

    load(): void {
        if (this.loading()) return;
        this.loading.set(true);
        this.loadError.set('');

        forkJoin({
            mice: this.mice.getAll(),
            cages: this.cagesService.getAll(),
            options: this.mice.getFormOptions(),
        }).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loading.set(false)),
        ).subscribe({
            next: ({ mice, cages, options }) => {
                this.sires.set(mice.filter(m => m.sex === 'Male' && m.status === 'Active'));
                this.dams.set(mice.filter(m => m.sex === 'Female' && m.status === 'Active'));
                this.cages.set(cages);
                this.today.set(options.today);
                if (!this.form.controls.startDate.value) {
                    this.form.controls.startDate.setValue(options.today);
                }
            },
            error: () => this.loadError.set('Unable to load mice, cages, or the facility date.'),
        });
    }

    save(): void {
        if (this.loading() || this.saving() || this.loadError()) return;
        this.error.set('');
        this.success.set('');
        this.form.markAllAsTouched();

        const v = this.form.getRawValue();
        if (this.form.invalid || !this.today()) return;

        if (v.sireId === v.damId || v.startDate > this.today()) {
            this.error.set('Select different mice and a start date no later than today.');
            return;
        }

        this.saving.set(true);
        this.form.disable();

        this.pairs.create({ ...v, breedingCode: v.breedingCode.trim() }).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
                this.saving.set(false);
                this.form.enable();
            }),
        ).subscribe({
            next: pair => {
                this.success.set(`Breeding pair ${pair.breedingCode} was created.`);
                this.form.reset({ startDate: this.today() });
            },
            error: (err: HttpErrorResponse) => {
                this.error.set('Unable to save the breeding pair.');
                const messages = Object.values(err.error?.errors ?? {})
                    .flatMap(v => Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
                this.error.set(
                    messages.join(' ') || err.error?.message ||
                    'Unable to save the breeding pair. Your entries have been kept.',
                );
            },
        });
    }
}
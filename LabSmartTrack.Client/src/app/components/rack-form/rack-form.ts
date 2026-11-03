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
    Rack,
    RackRequest,
    Room,
} from '../../../models/colony.models';
import {
    RacksService,
    RoomsService,
} from '../../services/colony.services';

@Component({
    selector: 'app-rack-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './rack-form.html',
    styleUrl: './rack-form.css',
})
export class RackForm implements OnInit, OnChanges {
    @Input() rack: Rack | null = null;

    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly formBuilder = inject(FormBuilder);
    private readonly racksService = inject(RacksService);
    private readonly roomsService = inject(RoomsService);
    private readonly destroyRef = inject(DestroyRef);

    readonly rooms = signal<Room[]>([]);
    readonly loadingRooms = signal(false);
    readonly roomsError = signal('');
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
        rackNumber: [
            '',
            [
                Validators.required,
                Validators.maxLength(50),
                Validators.pattern(/\S/),
            ],
        ],
        roomId: [0, [Validators.required, Validators.min(1)]],
    });

    ngOnInit(): void {
        this.loadRooms();
    }

    ngOnChanges(): void {
        this.error.set('');

        this.form.reset({
            name: this.rack?.name ?? '',
            rackNumber: this.rack?.rackNumber ?? '',
            roomId: this.rack?.roomId ?? 0,
        });
    }

    loadRooms(): void {
        if (this.loadingRooms()) {
            return;
        }

        this.loadingRooms.set(true);
        this.roomsError.set('');

        this.roomsService.getAll().pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loadingRooms.set(false)),
        ).subscribe({
            next: rooms => this.rooms.set(rooms),
            error: () => {
                this.roomsError.set(
                    'Unable to load rooms. Check your connection and try again.',
                );
            },
        });
    }

    save(): void {
        if (
            this.saving() ||
            this.loadingRooms() ||
            this.roomsError()
        ) {
            return;
        }

        this.error.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        const values = this.form.getRawValue();

        if (!this.rooms().some(room => room.id === values.roomId)) {
            this.error.set('Please select an available room.');
            return;
        }

        const request: RackRequest = {
            name: values.name.trim(),
            rackNumber: values.rackNumber.trim(),
            roomId: values.roomId,
        };

        this.saving.set(true);
        this.form.disable();

        const operation: Observable<void> = this.rack
            ? this.racksService.update(this.rack.id, request)
            : this.racksService.create(request).pipe(
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

        if (error.status === 404) {
            return 'The rack or selected room no longer exists. Refresh the list.';
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

                if (messages.length) {
                    return messages.join(' ');
                }
            }

            if (typeof body.message === 'string') {
                return body.message;
            }
        }

        if (error.status === 409) {
            return 'This rack conflicts with an existing record. Check its name and number.';
        }

        return 'Unable to save the rack. Your entered values have been preserved.';
    }
}
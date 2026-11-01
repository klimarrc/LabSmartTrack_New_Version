import {
    Component,
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
import { Observable, finalize, map } from 'rxjs';

import {
    Facility,
    Room,
    RoomRequest,
} from '../../../models/colony.models';
import {
    FacilitiesService,
    RoomsService,
} from '../../services/colony.services';

@Component({
    selector: 'app-room-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './room-form.html',
    styleUrl: './room-form.css',
})
export class RoomForm implements OnChanges, OnInit {
    @Input() room: Room | null = null;

    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly fb = inject(FormBuilder);
    private readonly roomsService = inject(RoomsService);
    private readonly facilitiesService = inject(FacilitiesService);

    readonly facilities = signal<Facility[]>([]);
    readonly loadingFacilities = signal(true);
    readonly facilityError = signal('');
    readonly saving = signal(false);
    readonly error = signal('');

    readonly form = this.fb.nonNullable.group({
        name: [
            '',
            [
                Validators.required,
                Validators.maxLength(100),
                Validators.pattern(/\S/),
            ],
        ],
        roomNumber: [
            '',
            [
                Validators.required,
                Validators.maxLength(50),
                Validators.pattern(/\S/),
            ],
        ],
        facilityId: [0, [Validators.required, Validators.min(1)]],
    });

    ngOnInit(): void {
        this.loadFacilities();
    }

    ngOnChanges(): void {
        this.error.set('');

        this.form.reset({
            name: this.room?.name ?? '',
            roomNumber: this.room?.roomNumber ?? '',
            facilityId: this.room?.facilityId ?? 0,
        });
    }

    loadFacilities(): void {
        this.loadingFacilities.set(true);
        this.facilityError.set('');

        this.facilitiesService.getAll().pipe(
            finalize(() => this.loadingFacilities.set(false)),
        ).subscribe({
            next: facilities => this.facilities.set(facilities),
            error: () => {
                this.facilityError.set(
                    'Unable to load facilities. Please try again.',
                );
            },
        });
    }

    save(): void {
        if (this.saving() || this.loadingFacilities()) {
            return;
        }

        this.form.markAllAsTouched();
        this.error.set('');

        if (this.form.invalid) {
            return;
        }

        const values = this.form.getRawValue();

        if (!this.facilities().some(
            facility => facility.id === values.facilityId,
        )) {
            this.error.set('Select an available facility.');
            return;
        }

        const request: RoomRequest = {
            name: values.name.trim(),
            roomNumber: values.roomNumber.trim(),
            facilityId: values.facilityId,
        };

        this.saving.set(true);
        this.form.disable();

        const operation: Observable<void> = this.room
            ? this.roomsService.update(this.room.id, request)
            : this.roomsService.create(request).pipe(
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

    private getErrorMessage(error: HttpErrorResponse): string {
        if (error.status === 0) {
            return 'Cannot reach the API. Check that it is running.';
        }

        if (error.status === 409) {
            return 'A room with this name already exists in this facility.';
        }

        if (error.status === 404) {
            return 'This room no longer exists. Refresh the list.';
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

        return 'Unable to save the room. Please try again.';
    }
}
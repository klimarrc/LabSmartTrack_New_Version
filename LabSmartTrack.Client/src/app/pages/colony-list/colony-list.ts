import {
    Component,
    DestroyRef,
    computed,
    inject,
    signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, map, switchMap } from 'rxjs';

import {
    CagesService,
    MiceService,
    RacksService,
    RoomsService,
    StrainsService,
} from '../../services/colony.services';

import { Room } from '../../../models/colony.models';
import { RoomForm } from '../../components/room-form/room-form';


type EntityKind =
    | 'rooms'
    | 'racks'
    | 'cages'
    | 'strains'
    | 'mice';

interface Column {
    key: string;
    label: string;
}

interface ListRow {
    id: number;
    values: Record<string, string>;
}

@Component({
    selector: 'app-colony-list',
    standalone: true,
    imports: [RoomForm],
    templateUrl: './colony-list.html',
    styleUrl: './colony-list.css',
})

export class ColonyList {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    private readonly roomsService = inject(RoomsService);
    private readonly racksService = inject(RacksService);
    private readonly cagesService = inject(CagesService);
    private readonly strainsService = inject(StrainsService);
    private readonly miceService = inject(MiceService);

    protected readonly title = signal('');
    protected readonly columns = signal<Column[]>([]);
    protected readonly rows = signal<ListRow[]>([]);

    protected readonly loading = signal(true);
    protected readonly error = signal('');
    protected readonly search = signal('');
    protected readonly statusFilter = signal('');

    private kind: EntityKind = 'rooms';

    protected readonly statuses = computed(() =>
        [...new Set(
            this.rows()
                .map(row => row.values['status'])
                .filter(Boolean),
        )].sort(),
    );

    protected readonly filteredRows = computed(() => {
        const query = this.search().trim().toLowerCase();
        const status = this.statusFilter();

        return this.rows().filter(row => {
            const matchesSearch =
                !query ||
                [String(row.id), ...Object.values(row.values)]
                    .join(' ')
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                !status || row.values['status'] === status;

            return matchesSearch && matchesStatus;
        });
    });
    protected readonly showRoomForm = signal(false);
    protected readonly selectedRoom = signal<Room | null>(null);
    protected readonly roomMessage = signal('');
    protected readonly loadingRoom = signal(false);

    protected get isRoomsPage(): boolean {
        return this.kind === 'rooms';
    }

    protected addRoom(): void {
        this.selectedRoom.set(null);
        this.roomMessage.set('');
        this.showRoomForm.set(true);
    }

    protected editRoom(id: number): void {
        if (this.loadingRoom() || this.showRoomForm()) {
            return;
        }

        this.error.set('');
        this.loadingRoom.set(true);

        this.roomsService.getById(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: room => {
                    this.loadingRoom.set(false);

                    // Do not open the form if navigation changed.
                    if (!this.isRoomsPage) {
                        return;
                    }

                    this.selectedRoom.set(room);
                    this.roomMessage.set('');
                    this.showRoomForm.set(true);
                },
                error: () => {
                    this.loadingRoom.set(false);

                    if (this.isRoomsPage) {
                        this.error.set(
                            'Unable to load the selected room.',
                        );
                    }
                },
            });
    }

    protected closeRoomForm(): void {
        this.showRoomForm.set(false);
        this.selectedRoom.set(null);
    }

    protected onRoomSaved(): void {
        this.closeRoomForm();
        this.roomMessage.set('Room saved successfully.');
        this.reload();
    }

    constructor() {
        this.route.data.pipe(
            switchMap(data => {
                this.kind = data['entity'] as EntityKind;
                this.title.set(data['title'] as string);

                this.closeRoomForm();
                this.roomMessage.set('');

                this.search.set('');
                this.statusFilter.set('');

                return this.fetchRows();
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe();
    }

    protected reload(): void {
        this.fetchRows()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }

    private fetchRows(): Observable<void> {
        this.loading.set(true);
        this.error.set('');
        this.rows.set([]);

        // Handle errors inside each request so route changes still work.
        return new Observable<void>(subscriber => {
            const subscription = this.getRecords().subscribe({
                next: rows => {
                    this.rows.set(rows);
                    this.loading.set(false);
                    subscriber.next();
                    subscriber.complete();
                },
                error: () => {
                    this.error.set(
                        'Unable to load records. Confirm the API is running and try again.',
                    );
                    this.loading.set(false);
                    subscriber.next();
                    subscriber.complete();
                },
            });

            return () => subscription.unsubscribe();
        });
    }

    private getRecords(): Observable<ListRow[]> {
        switch (this.kind) {
            case 'rooms':
                this.columns.set([
                    { key: 'name', label: 'Name' },
                    { key: 'roomNumber', label: 'Room number' },
                    { key: 'facilityId', label: 'Facility ID' },
                ]);

                return this.roomsService.getAll().pipe(
                    map(records => records.map(record => ({
                        id: record.id,
                        values: {
                            name: record.name,
                            roomNumber: record.roomNumber,
                            facilityId: String(record.facilityId),
                        },
                    }))),
                );

            case 'racks':
                this.columns.set([
                    { key: 'name', label: 'Name' },
                    { key: 'rackNumber', label: 'Rack number' },
                    { key: 'roomId', label: 'Room ID' },
                ]);

                return this.racksService.getAll().pipe(
                    map(records => records.map(record => ({
                        id: record.id,
                        values: {
                            name: record.name,
                            rackNumber: record.rackNumber,
                            roomId: String(record.roomId),
                        },
                    }))),
                );

            case 'cages':
                this.columns.set([
                    { key: 'name', label: 'Name' },
                    { key: 'cageNumber', label: 'Cage number' },
                    { key: 'status', label: 'Status' },
                    { key: 'rackId', label: 'Rack ID' },
                ]);

                return this.cagesService.getAll().pipe(
                    map(records => records.map(record => ({
                        id: record.id,
                        values: {
                            name: record.name,
                            cageNumber: record.cageNumber,
                            status: record.status,
                            rackId: String(record.rackId),
                        },
                    }))),
                );

            case 'strains':
                this.columns.set([
                    { key: 'name', label: 'Name' },
                    { key: 'description', label: 'Description' },
                ]);

                return this.strainsService.getAll().pipe(
                    map(records => records.map(record => ({
                        id: record.id,
                        values: {
                            name: record.name,
                            description: record.description ?? '',
                        },
                    }))),
                );

            case 'mice':
                this.columns.set([
                    { key: 'identifier', label: 'Identifier' },
                    { key: 'sex', label: 'Sex' },
                    { key: 'birthDate', label: 'Birth date' },
                    { key: 'status', label: 'Status' },
                    { key: 'cageId', label: 'Cage ID' },
                    { key: 'strainId', label: 'Strain ID' },
                ]);

                return this.miceService.getAll().pipe(
                    map(records => records.map(record => ({
                        id: record.id,
                        values: {
                            identifier: record.identifier,
                            sex: record.sex,
                            birthDate: record.birthDate ?? '',
                            status: record.status,
                            cageId: String(record.cageId),
                            strainId: String(record.strainId),
                        },
                    }))),
                );
        }
    }
}
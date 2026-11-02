import {
    Component,
    DestroyRef,
    computed,
    inject,
    signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    Observable,
    Subject,
    catchError,
    defer,
    finalize,
    forkJoin,
    map,
    of,
    startWith,
    switchMap,
    tap,
} from 'rxjs';

import {
    FacilitiesService,
    CagesService,
    MiceService,
    RacksService,
    RoomsService,
    StrainsService,
} from '../../services/colony.services';

import {
    Room,
    Rack,
    Cage,
    Strain,
} from '../../../models/colony.models';

import { RoomForm } from '../../components/room-form/room-form';
import { RackForm } from '../../components/rack-form/rack-form';
import { CageForm } from '../../components/cage-form/cage-form';
import { StrainForm } from '../../components/strain-form/strain-form';

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
    imports: [RoomForm, RackForm, CageForm, StrainForm],
    templateUrl: './colony-list.html',
    styleUrl: './colony-list.css',
})
export class ColonyList {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    private readonly facilitiesService = inject(FacilitiesService);
    private readonly roomsService = inject(RoomsService);
    private readonly racksService = inject(RacksService);
    private readonly cagesService = inject(CagesService);
    private readonly strainsService = inject(StrainsService);
    private readonly miceService = inject(MiceService);

    private readonly refreshRequests = new Subject<void>();

    private kind: EntityKind = 'rooms';

    private roomEditRequest = 0;
    private rackEditRequest = 0;
    private cageEditRequest = 0;

    // Table state
    protected readonly title = signal('');
    protected readonly columns = signal<Column[]>([]);
    protected readonly rows = signal<ListRow[]>([]);

    protected readonly loading = signal(true);
    protected readonly error = signal('');
    protected readonly search = signal('');
    protected readonly statusFilter = signal('');

    // Room form state
    protected readonly showRoomForm = signal(false);
    protected readonly selectedRoom = signal<Room | null>(null);
    protected readonly roomMessage = signal('');
    protected readonly loadingRoom = signal(false);

    // Rack form state
    protected readonly showRackForm = signal(false);
    protected readonly selectedRack = signal<Rack | null>(null);
    protected readonly rackMessage = signal('');
    protected readonly loadingRack = signal(false);

    // Cage form state
    protected readonly showCageForm = signal(false);
    protected readonly selectedCage = signal<Cage | null>(null);
    protected readonly cageMessage = signal('');
    protected readonly loadingCage = signal(false);

    // Strain form state
    private strainEditRequest = 0;

    protected readonly showStrainForm = signal(false);
    protected readonly selectedStrain = signal<Strain | null>(null);
    protected readonly strainMessage = signal('');
    protected readonly loadingStrain = signal(false);

    protected readonly statuses = computed(() => {
        const values = this.rows()
            .map(row => row.values['status'])
            .filter(
                (status): status is string =>
                    typeof status === 'string' && status.length > 0,
            );

        return [...new Set(values)].sort();
    });

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

    protected get isRoomsPage(): boolean {
        return this.kind === 'rooms';
    }

    protected get isRacksPage(): boolean {
        return this.kind === 'racks';
    }

    protected get isCagesPage(): boolean {
        return this.kind === 'cages';
    }

    protected get isStrainsPage(): boolean {
        return this.kind === 'strains';
    }

    constructor() {
        this.route.data.pipe(
            switchMap(data => {
                this.kind = data['entity'] as EntityKind;
                this.title.set(data['title'] as string);

                this.closeRoomForm();
                this.closeRackForm();
                this.closeCageForm();
                this.closeStrainForm();

                this.roomMessage.set('');
                this.rackMessage.set('');
                this.cageMessage.set('');
                this.strainMessage.set('');

                this.search.set('');
                this.statusFilter.set('');

                // Cancel older list requests when refreshing or navigating.
                return this.refreshRequests.pipe(
                    startWith(undefined),
                    switchMap(() => this.fetchRows()),
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe();
    }

    // Room actions

    protected addRoom(): void {
        if (
            !this.isRoomsPage ||
            this.loadingRoom() ||
            this.showRoomForm()
        ) {
            return;
        }

        this.selectedRoom.set(null);
        this.roomMessage.set('');
        this.showRoomForm.set(true);
    }

    protected editRoom(id: number): void {
        if (
            !this.isRoomsPage ||
            this.loadingRoom() ||
            this.showRoomForm()
        ) {
            return;
        }

        const request = ++this.roomEditRequest;

        this.error.set('');
        this.roomMessage.set('');
        this.loadingRoom.set(true);

        this.roomsService.getById(id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: room => {
                if (
                    request !== this.roomEditRequest ||
                    !this.isRoomsPage
                ) {
                    return;
                }

                this.loadingRoom.set(false);
                this.selectedRoom.set(room);
                this.showRoomForm.set(true);
            },
            error: () => {
                if (
                    request !== this.roomEditRequest ||
                    !this.isRoomsPage
                ) {
                    return;
                }

                this.loadingRoom.set(false);
                this.error.set(
                    'Unable to load room details. Please try again.',
                );
            },
        });
    }

    protected closeRoomForm(): void {
        this.roomEditRequest++;
        this.loadingRoom.set(false);
        this.showRoomForm.set(false);
        this.selectedRoom.set(null);
    }

    protected onRoomSaved(): void {
        this.closeRoomForm();
        this.roomMessage.set('Room saved successfully.');
        this.reload();
    }

    // Rack actions

    protected addRack(): void {
        if (
            !this.isRacksPage ||
            this.loadingRack() ||
            this.showRackForm()
        ) {
            return;
        }

        this.selectedRack.set(null);
        this.rackMessage.set('');
        this.showRackForm.set(true);
    }

    protected editRack(id: number): void {
        if (
            !this.isRacksPage ||
            this.loadingRack() ||
            this.showRackForm()
        ) {
            return;
        }

        const request = ++this.rackEditRequest;

        this.error.set('');
        this.rackMessage.set('');
        this.loadingRack.set(true);

        this.racksService.getById(id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: rack => {
                if (
                    request !== this.rackEditRequest ||
                    !this.isRacksPage
                ) {
                    return;
                }

                this.loadingRack.set(false);
                this.selectedRack.set(rack);
                this.showRackForm.set(true);
            },
            error: () => {
                if (
                    request !== this.rackEditRequest ||
                    !this.isRacksPage
                ) {
                    return;
                }

                this.loadingRack.set(false);
                this.error.set(
                    'Unable to load rack details. Please try again.',
                );
            },
        });
    }

    protected closeRackForm(): void {
        this.rackEditRequest++;
        this.loadingRack.set(false);
        this.showRackForm.set(false);
        this.selectedRack.set(null);
    }

    protected onRackSaved(): void {
        this.closeRackForm();
        this.rackMessage.set('Rack saved successfully.');
        this.reload();
    }

    // Cage actions

    protected addCage(): void {
        if (
            !this.isCagesPage ||
            this.loadingCage() ||
            this.showCageForm()
        ) {
            return;
        }

        this.selectedCage.set(null);
        this.cageMessage.set('');
        this.showCageForm.set(true);
    }

    protected editCage(id: number): void {
        if (
            !this.isCagesPage ||
            this.loadingCage() ||
            this.showCageForm()
        ) {
            return;
        }

        const request = ++this.cageEditRequest;

        this.error.set('');
        this.cageMessage.set('');
        this.loadingCage.set(true);

        this.cagesService.getById(id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: cage => {
                if (
                    request !== this.cageEditRequest ||
                    !this.isCagesPage
                ) {
                    return;
                }

                this.loadingCage.set(false);
                this.selectedCage.set(cage);
                this.showCageForm.set(true);
            },
            error: () => {
                if (
                    request !== this.cageEditRequest ||
                    !this.isCagesPage
                ) {
                    return;
                }

                this.loadingCage.set(false);
                this.error.set(
                    'Unable to load cage details. Please try again.',
                );
            },
        });
    }

    protected closeCageForm(): void {
        this.cageEditRequest++;
        this.loadingCage.set(false);
        this.showCageForm.set(false);
        this.selectedCage.set(null);
    }

    protected onCageSaved(): void {
        this.closeCageForm();
        this.cageMessage.set('Cage saved successfully.');
        this.reload();
    }

    // Strain actions
    protected addStrain(): void {
        if (
            !this.isStrainsPage ||
            this.loadingStrain() ||
            this.showStrainForm()
        ) {
            return;
        }

        this.selectedStrain.set(null);
        this.strainMessage.set('');
        this.showStrainForm.set(true);
    }

    protected editStrain(id: number): void {
        if (
            !this.isStrainsPage ||
            this.loadingStrain() ||
            this.showStrainForm()
        ) {
            return;
        }

        const request = ++this.strainEditRequest;

        this.error.set('');
        this.strainMessage.set('');
        this.loadingStrain.set(true);

        this.strainsService.getById(id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: strain => {
                if (
                    request !== this.strainEditRequest ||
                    !this.isStrainsPage
                ) {
                    return;
                }

                this.loadingStrain.set(false);
                this.selectedStrain.set(strain);
                this.showStrainForm.set(true);
            },
            error: () => {
                if (
                    request !== this.strainEditRequest ||
                    !this.isStrainsPage
                ) {
                    return;
                }

                this.loadingStrain.set(false);
                this.error.set(
                    'Unable to load strain details. Please try again.',
                );
            },
        });
    }

    protected closeStrainForm(): void {
        this.strainEditRequest++;
        this.loadingStrain.set(false);
        this.showStrainForm.set(false);
        this.selectedStrain.set(null);
    }

    protected onStrainSaved(): void {
        this.closeStrainForm();
        this.strainMessage.set('Strain saved successfully.');
        this.reload();
    }

    // Loading records

    protected reload(): void {
        this.refreshRequests.next();
    }

    private fetchRows(): Observable<void> {
        return defer(() => {
            this.loading.set(true);
            this.error.set('');
            this.rows.set([]);

            return this.getRecords();
        }).pipe(
            tap(rows => this.rows.set(rows)),
            map(() => undefined),
            catchError(() => {
                this.error.set(
                    'Unable to load records. Confirm the API is running and try again.',
                );

                return of(undefined);
            }),
            finalize(() => this.loading.set(false)),
        );
    }

    private getRecords(): Observable<ListRow[]> {
        switch (this.kind) {
            case 'rooms':
                this.columns.set([
                    { key: 'name', label: 'Name' },
                    { key: 'roomNumber', label: 'Room number' },
                    { key: 'facilityName', label: 'Facility' },
                ]);

                return forkJoin({
                    rooms: this.roomsService.getAll(),
                    facilities: this.facilitiesService.getAll(),
                }).pipe(
                    map(({ rooms, facilities }) => {
                        const facilityNames = new Map(
                            facilities.map(facility =>
                                [facility.id, facility.name] as const,
                            ),
                        );

                        return rooms.map(room => ({
                            id: room.id,
                            values: {
                                name: room.name,
                                roomNumber: room.roomNumber,
                                facilityName:
                                    facilityNames.get(room.facilityId) ??
                                    'Unknown facility',
                            },
                        }));
                    }),
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
                    { key: 'rackName', label: 'Rack' },
                    { key: 'roomName', label: 'Room' },
                    { key: 'facilityName', label: 'Facility' },
                ]);

                return forkJoin({
                    cages: this.cagesService.getAll(),
                    racks: this.racksService.getAll(),
                    rooms: this.roomsService.getAll(),
                    facilities: this.facilitiesService.getAll(),
                }).pipe(
                    map(({ cages, racks, rooms, facilities }) => {
                        const racksById = new Map(
                            racks.map(rack => [rack.id, rack] as const),
                        );

                        const roomsById = new Map(
                            rooms.map(room => [room.id, room] as const),
                        );

                        const facilitiesById = new Map(
                            facilities.map(facility =>
                                [facility.id, facility] as const,
                            ),
                        );

                        return cages.map(cage => {
                            const rack = racksById.get(cage.rackId);

                            const room = rack
                                ? roomsById.get(rack.roomId)
                                : undefined;

                            const facility = room
                                ? facilitiesById.get(room.facilityId)
                                : undefined;

                            return {
                                id: cage.id,
                                values: {
                                    name: cage.name,
                                    cageNumber: cage.cageNumber,
                                    status: cage.status,
                                    rackName: rack?.name ?? 'Unknown rack',
                                    roomName: room?.name ?? 'Unknown room',
                                    facilityName:
                                        facility?.name ?? 'Unknown facility',
                                },
                            };
                        });
                    }),
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

            default:
                throw new Error('Unsupported colony page.');
        }
    }
}
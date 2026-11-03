import { Component, inject, signal } from '@angular/core';

import { Facility } from '../../../models/colony.models';
import { FacilitiesService } from '../../services/colony.services';
import { FacilityForm } from '../../components/facility-form/facility-form';

@Component({
    selector: 'app-facilities',
    standalone: true,
    imports: [FacilityForm],
    templateUrl: './facilities.html',
    styleUrl: './facilities.css',
})
export class Facilities {
    private readonly facilitiesService =
        inject(FacilitiesService);

    readonly facilities = signal<Facility[]>([]);
    readonly error = signal('');
    readonly loading = signal(false);
    // Place your form properties here.
    readonly showForm = signal(false);
    readonly selectedFacility = signal<Facility | null>(null);
    readonly editingFacility = signal<Facility | null>(null);
    readonly successMessage = signal('');

    constructor() {
        this.loadFacilities();
    }

    loadFacilities(): void {
        this.error.set('');

        this.facilitiesService.getAll().subscribe({
            next: facilities => this.facilities.set(facilities),
            error: () => {
                this.error.set('Unable to load facilities.');
            },
        });
    }

    // Place your form methods here.
    addFacility(): void {
        this.selectedFacility.set(null);
        this.successMessage.set('');
        this.showForm.set(true);
    }

    editFacility(facility: Facility): void {
        this.selectedFacility.set(facility);
        this.successMessage.set('');
        this.showForm.set(true);
    }

    closeForm(): void {
        this.showForm.set(false);
        this.selectedFacility.set(null);
    }

    onFacilitySaved(): void {
        this.successMessage.set('Facility saved successfully.');
        this.closeForm();
        this.loadFacilities();
    }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    Cage,
    CageRequest,
    Facility,
    FacilityRequest,
    Mouse,
    MouseRequest,
    Rack,
    RackRequest,
    Room,
    RoomRequest,
    Strain,
    StrainRequest,
} from '../../models/colony.models';

import { CrudService } from '../../app/services/crud/crud.service';

// Use your existing environment configuration here.
// Adjust this import if your environment file is elsewhere.
import { environment } from '../../environments/environment';

const apiBaseUrl =
    environment.apiBaseUrl.replace(/\/+$/, '');

@Injectable({ providedIn: 'root' })
export class FacilitiesService
    extends CrudService<Facility, FacilityRequest> {
    constructor() {
        super(inject(HttpClient), `${apiBaseUrl}/Facilities`);
    }
}

@Injectable({ providedIn: 'root' })
export class RoomsService
    extends CrudService<Room, RoomRequest> {
    constructor() {
        super(inject(HttpClient), `${apiBaseUrl}/Rooms`);
    }
}

@Injectable({ providedIn: 'root' })
export class RacksService
    extends CrudService<Rack, RackRequest> {
    constructor() {
        super(inject(HttpClient), `${apiBaseUrl}/Racks`);
    }
}

@Injectable({ providedIn: 'root' })
export class CagesService
    extends CrudService<Cage, CageRequest> {
    constructor() {
        super(inject(HttpClient), `${apiBaseUrl}/Cages`);
    }
}

@Injectable({ providedIn: 'root' })
export class StrainsService
    extends CrudService<Strain, StrainRequest> {
    constructor() {
        super(inject(HttpClient), `${apiBaseUrl}/Strains`);
    }
}

@Injectable({ providedIn: 'root' })
export class MiceService
    extends CrudService<Mouse, MouseRequest> {
    constructor() {
        super(inject(HttpClient), `${apiBaseUrl}/Mice`);
    }
}
export interface AuditableEntity {
    id: number;
    createdAtUtc: string;
    updatedAtUtc: string;
}

// Request bodies exclude IDs, timestamps and navigation properties.
export interface FacilityRequest {
    name: string;
    description?: string | null;
}

export interface RoomRequest {
    name: string;
    roomNumber: string;
    facilityId: number;
}

export interface RackRequest {
    name: string;
    rackNumber: string;
    roomId: number;
}

export interface CageRequest {
    name: string;
    cageNumber: string;
    status: string;
    rackId: number;
}

export interface StrainRequest {
    name: string;
    description?: string | null;
}

export interface MouseRequest {
    identifier: string;
    sex: string;
    birthDate?: string | null;
    status: string;
    cageId: number;
    strainId: number;
}

export interface Facility
    extends AuditableEntity, FacilityRequest { }

export interface Room
    extends AuditableEntity, RoomRequest { }

export interface Rack
    extends AuditableEntity, RackRequest { }

export interface Cage
    extends AuditableEntity, CageRequest { }

export interface Strain
    extends AuditableEntity, StrainRequest { }

export interface Mouse
    extends AuditableEntity, MouseRequest { }
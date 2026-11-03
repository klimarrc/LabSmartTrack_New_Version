import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: Dashboard,
        title: 'Dashboard | LabSmartTrack',
    },
    {
        path: 'facilities',
        loadComponent: () =>
            import('./pages/facilities/facilities')
                .then(module => module.Facilities),
        title: 'Facilities | LabSmartTrack',
    },
    {
        path: 'rooms',
        loadComponent: () =>
            import('./pages/colony-list/colony-list')
                .then(module => module.ColonyList),
        title: 'Rooms | LabSmartTrack',
        data: { entity: 'rooms', title: 'Rooms' },
    },
    {
        path: 'racks',
        loadComponent: () =>
            import('./pages/colony-list/colony-list')
                .then(module => module.ColonyList),
        title: 'Racks | LabSmartTrack',
        data: { entity: 'racks', title: 'Racks' },
    },
    {
        path: 'cages',
        loadComponent: () =>
            import('./pages/colony-list/colony-list')
                .then(module => module.ColonyList),
        title: 'Cages | LabSmartTrack',
        data: { entity: 'cages', title: 'Cages' },
    },
    {
        path: 'strains',
        loadComponent: () =>
            import('./pages/colony-list/colony-list')
                .then(module => module.ColonyList),
        title: 'Strains | LabSmartTrack',
        data: { entity: 'strains', title: 'Strains' },
    },
    {
        path: 'mice',
        loadComponent: () =>
            import('./pages/colony-list/colony-list')
                .then(module => module.ColonyList),
        title: 'Mice | LabSmartTrack',
        data: { entity: 'mice', title: 'Mice' },
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
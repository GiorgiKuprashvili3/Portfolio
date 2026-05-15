import { Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { AdventureworksDetailComponent } from './components/projects/adventureworks-detail/adventureworks-detail.component';
import { CovidDetailComponent } from './components/projects/covid-detail/covid-detail.component';

export const routes: Routes = [
  { path: '', component: AppShellComponent },
  { path: 'projects/adventureworks', component: AdventureworksDetailComponent },
  { path: 'projects/covid',          component: CovidDetailComponent },
  { path: '**', redirectTo: '' },
];

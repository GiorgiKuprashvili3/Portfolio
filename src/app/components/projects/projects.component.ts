import { Component, inject, signal, computed } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { PortfolioService } from '../portfolio.service';
import { Project } from '../../models/portfolio.models';
import { AdventureworksDetailComponent } from './adventureworks-detail/adventureworks-detail.component';
import { CovidDetailComponent } from './covid-detail/covid-detail.component';

type Filter = 'all' | 'fe' | 'da';
type ModalKind = 'adventureworks' | 'covid' | null;

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, AdventureworksDetailComponent, CovidDetailComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
  private svc = inject(PortfolioService);

  allProjects: Project[] = this.svc.getProjects();
  activeFilter = signal<Filter>('all');
  activeModal = signal<ModalKind>(null);

  filteredProjects = computed(() =>
    this.activeFilter() === 'all'
      ? this.allProjects
      : this.allProjects.filter(p => p.type === this.activeFilter())
  );

  filters: { label: string; value: Filter }[] = [
    { label: 'all',      value: 'all' },
    { label: 'frontend', value: 'fe'  },
    { label: 'analytics',value: 'da'  },
  ];

  setFilter(f: Filter): void {
    this.activeFilter.set(f);
  }

  /** Map a project's `link` to a modal kind. */
  private modalKindFor(project: Project): ModalKind {
    if (!project.link) return null;
    if (project.link.includes('covid'))          return 'covid';
    if (project.link.includes('adventureworks')) return 'adventureworks';
    return null;
  }

  openModal(project: Project): void {
    const kind = this.modalKindFor(project);
    if (!kind) return;
    this.activeModal.set(kind);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.activeModal.set(null);
    document.body.style.overflow = '';
  }
}

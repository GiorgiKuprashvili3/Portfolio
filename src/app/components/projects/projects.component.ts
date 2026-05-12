import { Component, inject, signal, computed } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { PortfolioService } from '../portfolio.service';
import { Project } from '../../models/portfolio.models';

type Filter = 'all' | 'fe' | 'da';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
  private svc = inject(PortfolioService);

  allProjects: Project[] = this.svc.getProjects();
  activeFilter = signal<Filter>('all');

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
}

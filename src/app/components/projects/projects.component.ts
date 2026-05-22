import {
  Component,
  inject,
  signal,
  computed,
  QueryList,
  ViewChildren,
  ElementRef
} from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { PortfolioService } from '../portfolio.service';
import { Project } from '../../models/portfolio.models';
import { AdventureworksDetailComponent } from './adventureworks-detail/adventureworks-detail.component';
import { CovidDetailComponent } from './covid-detail/covid-detail.component';
// 1. Import the Customer Segmentation Component
import { CustomerSegmentationDetailComponent } from './customer-segmentation-detail/customer-segmentation-detail.component';

type Filter = 'all' | 'fe' | 'da';
// 2. Add 'customer-segmentation' to your allowed modal states
type ModalKind = 'adventureworks' | 'covid' | 'customer-segmentation' | null;

@Component({
  selector: 'app-projects',
  standalone: true,
  // 3. Add CustomerSegmentationDetailComponent to imports
  imports: [
    NgFor, 
    NgIf, 
    NgClass, 
    AdventureworksDetailComponent, 
    CovidDetailComponent, 
    CustomerSegmentationDetailComponent
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
  private svc = inject(PortfolioService);

  allProjects: Project[] = this.svc.getProjects();
  activeFilter = signal<Filter>('all');
  activeModal = signal<ModalKind>(null);

  @ViewChildren('cardElement') cardElements!: QueryList<ElementRef<HTMLDivElement>>;

  filteredProjects = computed(() =>
    this.activeFilter() === 'all'
      ? this.allProjects
      : this.allProjects.filter(p => p.type === this.activeFilter())
  );

  filters: { label: string; value: Filter }[] = [
    { label: 'SYS_ALL',       value: 'all' },
    { label: 'FRONT_END',     value: 'fe'  },
    { label: 'DATA_ANALYTICS',value: 'da'  },
  ];

  setFilter(f: Filter): void {
    this.activeFilter.set(f);
  }

  onGridMouseMove(event: MouseEvent) {
    if (!this.cardElements) return;
    
    this.cardElements.forEach((cardRef) => {
      const card = cardRef.nativeElement;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  openModal(project: Project): void {
    if (!project.link) return;
    
    // 4. Update conditional mapping to support customer segmentation
    const kind = project.link.includes('covid') ? 'covid' : 
                 project.link.includes('adventureworks') ? 'adventureworks' : 
                 project.link.includes('customer-segmentation') ? 'customer-segmentation' : null;
    
    if (kind) {
      this.activeModal.set(kind);
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(): void {
    this.activeModal.set(null);
    document.body.style.overflow = '';
  }
}
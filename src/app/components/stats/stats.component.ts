import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { PortfolioService } from '../portfolio.service';
import { Stat } from '../../models/portfolio.models';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [NgFor],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent {
  stats: Stat[] = inject(PortfolioService).getStats();

  tickerItems: string[] = [
    'Docker',
    'REST APIs',
    'Git',
    '3+ yrs',
    'Angular',
    'TypeScript',
    'RxJS',
    'NgRx',
    'Python',
    'SQL',
    'Figma',
    'React',
  ];
}

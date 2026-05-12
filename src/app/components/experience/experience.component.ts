import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { PortfolioService } from '../portfolio.service';
import { Experience } from '../../models/portfolio.models';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [NgFor],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
})
export class ExperienceComponent {
  experiences: Experience[] = inject(PortfolioService).getExperience();
}

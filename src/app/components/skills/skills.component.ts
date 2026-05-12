import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { PortfolioService } from '../portfolio.service';
import { SkillGroup } from '../../models/portfolio.models';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [NgFor],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent {
  skillGroups: SkillGroup[] = inject(PortfolioService).getSkillGroups();
}

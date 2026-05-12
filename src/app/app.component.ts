import { Component } from '@angular/core';
import { NavComponent }        from './components/nav/nav.component';
import { HeroComponent }       from './components/hero/hero.component';
import { StatsComponent }      from './components/stats/stats.component';
import { ProjectsComponent }   from './components/projects/projects.component';
import { AnalyticsComponent }  from './components/analytics/analytics.component';
import { SkillsComponent }     from './components/skills/skills.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ContactComponent }    from './components/contact/contact.component';
import { FooterComponent }     from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavComponent,
    HeroComponent,
    StatsComponent,
    ProjectsComponent,
    AnalyticsComponent,
    SkillsComponent,
    ExperienceComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <div class="portfolio-wrapper">
      <app-nav />
      <app-hero />
      <app-stats />
      <app-projects />
      <app-analytics />
      <app-skills />
      <app-experience />
      <app-contact />
      <app-footer />
    </div>
  `,
})
export class AppComponent {}

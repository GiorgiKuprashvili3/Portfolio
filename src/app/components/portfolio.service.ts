import { Injectable } from '@angular/core';
import { Project, SkillGroup, Experience, Stat } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  getStats(): Stat[] {
    return [
      { value: '3+',   label: 'years experience' },
      { value: '50K+', label: 'users reached'     },
      { value: '8',    label: 'tech skills'        },
      { value: '2×',   label: 'load time gain'     },
    ];
  }

  getProjects(): Project[] {
    return [
      {
        id: 1,
        type: 'fe',
        title: 'WebRTC Video Platform',
        description: 'Real-time audio/video communication system. Fixed critical frontend bugs enabling stable calls for 50k+ users.',
        tags: [
          { label: 'Angular', variant: 'fe' },
          { label: 'WebRTC',  variant: 'fe' },
          { label: 'RxJS',    variant: 'fe' },
        ],
        repoUrl: '#',
        liveUrl: '#',
      },
      {
        id: 2,
        type: 'fe',
        title: 'Doctor Booking System',
        description: 'Automated scheduling for patients and doctors with integrated messaging and real-time updates via NgRx.',
        tags: [
          { label: 'Angular',          variant: 'fe' },
          { label: 'NgRx',             variant: 'fe' },
          { label: 'Angular Material', variant: 'fe' },
        ],
        repoUrl: '#',
        liveUrl: '#',
      },
      {
        id: 3,
        type: 'fe',
        title: 'SVG Template Engine',
        description: 'Optimised Angular\'s SVG rendering pipeline — cut initial load time by 2× through smart template caching.',
        tags: [
          { label: 'Angular',     variant: 'fe' },
          { label: 'SVG',         variant: 'fe' },
          { label: 'TypeScript',  variant: 'fe' },
        ],
        repoUrl: '#',
      },
      {
        id: 4,
        type: 'da',
        title: 'Sales Trend Analysis',
        description: 'End-to-end EDA pipeline in Python. Cleaned 100k+ row dataset, visualised seasonality & revenue drivers with Matplotlib.',
        tags: [
          { label: 'Python',     variant: 'da' },
          { label: 'Pandas',     variant: 'da' },
          { label: 'Matplotlib', variant: 'da' },
        ],
        repoUrl: '#',
      },
      {
        id: 5,
        type: 'da',
        title: 'User Behaviour Dashboard',
        description: 'Aggregated Google Analytics event data with Python, built custom Matplotlib dashboard showing funnel drop-off.',
        tags: [
          { label: 'Python',           variant: 'da'    },
          { label: 'Pandas',           variant: 'da'    },
          { label: 'Google Analytics', variant: 'green' },
        ],
        repoUrl: '#',
      },
      {
        id: 7,
        type: 'da',
        title: 'AdventureWorks Sales & Profitability',
        description: 'End-to-end SQL Server analysis of 4 years of bicycle sales data. Uncovered 29K transactions sold below cost and mapped margin drivers across 35 subcategories.',
        tags: [
          { label: 'SQL',       variant: 'da' },
          { label: 'Excel',     variant: 'da' },
          { label: 'Analytics', variant: 'green' },
        ],
        repoUrl: 'https://github.com/GiorgiKuprashvili3/adventureworks-sales-analytics',
        repoLabel: 'repo',
        link: '/projects/adventureworks',
      },
      {
        id: 8,
        type: 'da',
        title: 'COVID-19 Impact & Vaccination Effectiveness',
        description: 'SQL Server analysis of 405K daily OWID records across 243 countries. Quantified the vaccination–mortality link and isolated GDP per capita as the cleaner predictor of outcomes.',
        tags: [
          { label: 'SQL',       variant: 'da' },
          { label: 'Excel',     variant: 'da' },
          { label: 'Analytics', variant: 'green' },
        ],
        repoUrl: 'https://github.com/GiorgiKuprashvili3/Covid_Analysis',
        repoLabel: 'repo',
        link: '/projects/covid',
      },
      {
        id: 6,
        type: 'da',
        title: 'Performance Benchmarking',
        description: 'Quantified Angular bundle size improvements using Lighthouse scores across releases. Plotted regression trends.',
        tags: [
          { label: 'Python',     variant: 'da' },
          { label: 'Matplotlib', variant: 'da' },
          { label: 'Angular',    variant: 'fe' },
        ],
        repoUrl: '#',
      },
    ];
  }

  getSkillGroups(): SkillGroup[] {
    return [
      {
        category: 'Frontend',
        skills: ['Angular', 'NgRx', 'React', 'TypeScript', 'RxJS'],
      },
      {
        category: 'Styling',
        skills: ['SCSS / CSS', 'Tailwind', 'Bootstrap', 'Angular Material', 'Responsive Design'],
      },
      {
        category: 'Analytics',
        skills: ['Python', 'Pandas', 'Matplotlib', 'Google Analytics'],
      },
      {
        category: 'Tooling',
        skills: ['Git', 'Figma', 'Jira', 'Unit Testing'],
      },
    ];
  }

  getExperience(): Experience[] {
    return [
      {
        dateRange: 'Sep 2024 — present',
        role: 'Frontend Developer',
        company: 'Freelance / Self-Employed',
        bullets: [
          'Responsive web interfaces with Angular, React, HTML5, SCSS, TypeScript.',
          'Collaborated directly with clients to deliver user-focused UI components.',
          'Added Python-based data analysis to client projects where insights were needed.',
        ],
      },
      {
        dateRange: 'Jun 2022 — Sep 2024',
        role: 'Frontend Developer',
        company: 'Omedia (Discovery Inc.)',
        bullets: [
          'Fixed complex WebRTC bug enabling real-time video calls for 50k+ users.',
          'Optimised SVG template pipeline — 2× reduction in page load time.',
          'Built booking and messaging systems for doctors and patients.',
          'Conducted unit testing, used Google Analytics for data-driven improvements.',
        ],
      },
    ];
  }
}

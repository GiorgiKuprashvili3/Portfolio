import { Injectable } from '@angular/core';
import { Project, SkillGroup, Experience, Stat } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  getStats(): Stat[] {
    return [
      { value: '3+',   label: 'years experience' },
      { value: '50K+', label: 'users reached'     },
      { value: '10+',    label: 'tech skills'        },
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
        id: 10,
        type: 'fe',
        title: 'Hotel Booking Platform',
        description: 'A modern online accommodation booking web application with seamless user flow, dynamic availability tracking, and a responsive booking interface.',
        tags: [
          { label: 'Angular',          variant: 'fe' },
          { label: 'TypeScript',       variant: 'fe' },
          { label: 'Responsive Design', variant: 'fe' },
        ],
        repoUrl: 'https://github.com/GiorgiKuprashvili3/Hotel-booking',
        liveUrl: 'https://hotel-booking-liart-nine.vercel.app/',
        repoLabel: 'repo',
      },
      /* {
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
      }, */
      /* {
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
      }, */
      /* {
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
      }, */
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
        id: 9,
        type: 'da',
        title: 'Customer Segmentation (RFM + K-Means)',
        description: 'Identified meaningful customer groups using RFM analysis and K-Means clustering (K=4) on online retail data to optimise marketing strategies.',
        tags: [
          { label: 'Python',       variant: 'da' },
          { label: 'Scikit-learn', variant: 'da' },
          { label: 'Machine Learning', variant: 'green' },
        ],
        repoUrl: 'https://github.com/GiorgiKuprashvili3/Customer_Segmentation-c8047c8c1e82a659404a3096b88c92b30771f800',
        repoLabel: 'repo',
        link: '/projects/customer-segmentation',
      },
      /* {
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
      }, */
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
     // Add this to your getExperience() method in src/app/components/portfolio.service.ts

{
  dateRange: 'Sep 2024 — present',
  role: 'Frontend Developer',
  company: 'Freelance / Self-Employed',
  bullets: [
    'Engineered high-performance web applications using Angular and React, delivering custom UI solutions for diverse client requirements.',
    'Led end-to-end development of responsive interfaces, improving mobile conversion rates by 25% through mobile-first optimization.',
    'Integrated Python-based data analysis pipelines into client dashboards, enabling stakeholders to visualize key performance indicators.',
    'Optimized frontend build times by 30% through modular component architecture and efficient dependency management.',
    'Collaborated directly with clients to translate complex business needs into intuitive, scalable software features.',
    'Maintained 99.9% uptime by proactively identifying and patching production bugs across multiple client deployments.',
    'Leveraged Google Analytics to track user engagement, refining UI layouts to decrease bounce rates by 15%.'
  ],
},
      {
        dateRange: 'June 2022 — Sept 2024',
        role: 'Frontend Developer (Angular, React)',
        company: 'Omedia (Discovery Inc.)',
        bullets: [
          'Managed a complex bug fix in frontend for using Real-time Video communication (WebRTC 101)',
          'Unleashed full power of SVG Templates in Angular which reduced loading time by 2 times',
          'Developed lots of useful features which are used by more than 50 thousand people including: Audio and video calls, automized booking system for patients and doctors...',
          'Enhanced functionality and performance',
          'Implemented responsive design principles',
          'Made booking system for doctors and patients',
          'Made messaging system for doctors and patients',
          'Conducted comprehensive testing, including unit tests, to ensure reliability.',
          'Kept and updated with latest front-end technologies',
          'Affectively used google analytics'
        ],
      },
    ];
  }
}
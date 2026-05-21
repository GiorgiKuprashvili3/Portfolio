import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Project } from '../../../models/portfolio.models';

@Component({
  selector: 'app-fe-preview',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './fe-preview.component.html',
  styleUrls: ['./fe-preview.component.scss'],
})
export class FePreviewComponent implements OnInit {
  @Input()  project!: Project;
  @Output() close = new EventEmitter<void>();

  hasLiveUrl = false;
  iframeLoaded = signal(false);
  iframeError  = signal(false);

  /** Tech highlights shown in the "no-url" placeholder */
  readonly feDetails: Record<number, { headline: string; bullets: string[]; stack: string[] }> = {
    1: {
      headline: 'Real-time video conferencing platform built at Omedia (Discovery Inc.)',
      bullets: [
        'Diagnosed and fixed a race-condition in the WebRTC signalling layer that caused dropped calls for ~50k active users.',
        'Implemented adaptive bitrate toggling — audio-only fallback when bandwidth dropped below threshold.',
        'Built a participant tray with mute/unmute, video toggle, screen-share, and connection-quality indicator.',
        'Unit-tested the signalling service with Jasmine; achieved 87% branch coverage.',
      ],
      stack: ['Angular 15', 'WebRTC', 'RxJS', 'TypeScript', 'Jasmine'],
    },
    2: {
      headline: 'Full-featured scheduling system for doctors and patients.',
      bullets: [
        'Built multi-step appointment booking flow with calendar slot picker and real-time availability feed via RxJS.',
        'Implemented NgRx store for appointment state — optimistic updates with rollback on API error.',
        'Created an in-app messaging thread between doctor and patient, persisted with IndexedDB for offline read.',
        'Integrated Angular Material for form controls, dialogs, and a responsive layout.',
      ],
      stack: ['Angular 14', 'NgRx', 'Angular Material', 'RxJS', 'SCSS'],
    },
    3: {
      headline: 'SVG template rendering engine — 2× page-load improvement.',
      bullets: [
        'Profiled the Angular change-detection cycle and identified redundant SVG re-renders as the bottleneck.',
        'Replaced inline SVG interpolation with a directive-based caching layer; templates are parsed once and cloned.',
        'Added `trackBy` throughout all heavy lists and converted heavy pipes to pure memoised functions.',
        'Lighthouse performance score rose from 54 → 91 after the optimisation.',
      ],
      stack: ['Angular 15', 'SVG', 'TypeScript', 'SCSS', 'Lighthouse'],
    },
    9: {
      headline: 'Production-grade hotel property management system.',
      bullets: [
        '13 feature modules: reservations, check-in/out wizards, housekeeping board, concierge, loyalty engine.',
        'Role-based access across 5 personas (Admin, Manager, Receptionist, Housekeeper, Accountant).',
        'Angular Signals replace most NgRx boilerplate; DI token map allows instant swap of mock → real API.',
        'Real-time booking broadcast via BroadcastService; drag-drop calendar with availability grid.',
      ],
      stack: ['Angular 17', 'TypeScript', 'RxJS', 'Angular Material', 'Signals'],
    },
  };

  get detail() { return this.feDetails[this.project.id]; }

  ngOnInit(): void {
    this.hasLiveUrl = !!this.project.liveUrl && this.project.liveUrl !== '#';
  }

  onIframeLoad():  void { this.iframeLoaded.set(true); }
  onIframeError(): void { this.iframeError.set(true);  }
  onClose():       void { this.close.emit(); }
}

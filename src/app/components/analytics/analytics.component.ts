import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('mauChart')   mauRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('stackChart') stackRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('perfChart')  perfRef!:  ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.buildMauChart();
    this.buildStackChart();
    this.buildPerfChart();
  }

  private buildMauChart(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mauData = [20,22,24,27,29,31,33,34,36,38,40,42,43,44,46,47,48,49,50,51,51,52,52,52];
    const labels = [
      ...months.map(m => `${m} '23`),
      ...months.map(m => `${m} '24`),
    ];
    const rolling = mauData.map((_, i, a) => {
      const s = Math.max(0, i - 2);
      const e = Math.min(a.length - 1, i + 2);
      const chunk = a.slice(s, e + 1);
      return Math.round(chunk.reduce((x, y) => x + y, 0) / chunk.length);
    });

    new Chart(this.mauRef.nativeElement, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'MAU (k)',
            data: mauData,
            backgroundColor: 'rgba(0,255,157,0.5)',
            borderColor: '#00FF9D',
            borderWidth: 1,
            borderRadius: 3,
          } as any,
          {
            type: 'line',
            label: 'Rolling avg',
            data: rolling,
            borderColor: '#00C8FF',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            borderDash: [4, 3],
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#6b7590', font: { size: 10, family: 'Space Mono' }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            ticks: { color: '#6b7590', font: { size: 10, family: 'Space Mono' }, callback: (v: any) => `${v}k` },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
        },
      },
    });
  }

  private buildStackChart(): void {
    new Chart(this.stackRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Angular', 'React', 'Python / Analytics'],
        datasets: [{
          data: [45, 30, 25],
          backgroundColor: ['#00FF9D', '#00C8FF', '#fbbf24'],
          borderColor: '#111620',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  }

  private buildPerfChart(): void {
    new Chart(this.perfRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Home', 'Dashboard', 'Profile', 'Reports'],
        datasets: [
          {
            label: 'Before (s)',
            data: [3.2, 4.1, 2.8, 5.3],
            backgroundColor: 'rgba(248,113,113,0.7)',
            borderColor: '#f87171',
            borderWidth: 1,
            borderRadius: 3,
          },
          {
            label: 'After (s)',
            data: [1.6, 2.0, 1.4, 2.5],
            backgroundColor: 'rgba(0,255,157,0.6)',
            borderColor: '#00FF9D',
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#6b7590', font: { size: 11, family: 'Space Mono' } },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            ticks: { color: '#6b7590', font: { size: 10, family: 'Space Mono' }, callback: (v: any) => `${v}s` },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
        },
      },
    });
  }
}

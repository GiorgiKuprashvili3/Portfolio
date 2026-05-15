import { Component, OnDestroy, signal } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnDestroy {

  // ── Name scramble ────────────────────────────────────────────────────────
  private readonly FIRST = 'Giorgi';
  private readonly LAST  = 'Kuprashvili';
  private readonly CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';

  displayFirst = signal(this.FIRST);
  displayLast  = signal(this.LAST);

  private scrambleTimer: ReturnType<typeof setInterval> | null = null;
  private restoreTimer: ReturnType<typeof setTimeout> | null = null;

  onNameEnter(): void {
    this.clearTimers();
    this.runScramble(this.FIRST, this.displayFirst);
    this.restoreTimer = setTimeout(() =>
      this.runScramble(this.LAST, this.displayLast), 80);
  }

  onNameLeave(): void {
    this.clearTimers();
    this.displayFirst.set(this.FIRST);
    this.displayLast.set(this.LAST);
  }

  private runScramble(original: string, target: ReturnType<typeof signal<string>>): void {
    let iteration = 0;
    const total   = original.length * 5; // ticks until fully resolved
    const id = setInterval(() => {
      const resolved = Math.floor(iteration / 5);
      const scrambled = original
        .split('')
        .map((ch, i) =>
          i < resolved
            ? ch
            : this.CHARS[Math.floor(Math.random() * this.CHARS.length)]
        )
        .join('');
      target.set(scrambled);
      if (++iteration > total) {
        target.set(original);
        clearInterval(id);
      }
    }, 40);
    this.scrambleTimer = id;
  }

  private clearTimers(): void {
    if (this.scrambleTimer) { clearInterval(this.scrambleTimer); this.scrambleTimer = null; }
    if (this.restoreTimer)  { clearTimeout(this.restoreTimer);   this.restoreTimer  = null; }
  }

  // ── Specialisation hover ─────────────────────────────────────────────────
  hoveredSpec = signal<'fe' | 'da' | null>(null);

  feSkills = [
    { label: 'Angular',    variant: 'fe' },
    { label: 'React',      variant: 'fe' },
    { label: 'TypeScript', variant: 'fe' },
    { label: 'RxJS',       variant: 'fe' },
    { label: 'NgRx',       variant: 'fe' },
    { label: 'SCSS',       variant: 'fe' },
  ];

  daSkills = [
    { label: 'Python',     variant: 'da' },
    { label: 'SQL',        variant: 'da' },
    { label: 'Pandas',     variant: 'da' },
    { label: 'Matplotlib', variant: 'da' },
    { label: 'Excel',      variant: 'da' },
  ];

  ngOnDestroy(): void { this.clearTimers(); }
}

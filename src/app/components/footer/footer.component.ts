import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      // built with Angular &nbsp;·&nbsp; Giorgi Kuprashvili &nbsp;·&nbsp; 2025
    </footer>
  `,
  styles: [`
    .footer {
      text-align: center;
      padding: 2rem 0;
      font-family: var(--mono);
      font-size: 11px;
      color: var(--muted);
      border-top: 0.5px solid var(--border);
      margin-top: 2rem;
    }
  `],
})
export class FooterComponent {}

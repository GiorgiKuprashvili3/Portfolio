import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.scss'],
})
export class HotelDetailComponent {
  @Output() close = new EventEmitter<void>();

  loaded = signal(false);

  private sanitizer = inject(DomSanitizer);

  readonly liveUrl = 'https://hotel-booking-583c.vercel.app/';
  readonly repoUrl = 'https://github.com/GiorgiKuprashvili3/Hotel-booking';

  readonly safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.liveUrl);

  onIframeLoad(): void {
    this.loaded.set(true);
  }
}

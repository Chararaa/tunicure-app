// src/app/components/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  showPrivacyModal = false;
  showCharteModal = false;

  openPrivacyModal(): void {
    this.showPrivacyModal = true;
    document.body.style.overflow = 'hidden'; // Empêche le scroll de la page
  }

  closePrivacyModal(): void {
    this.showPrivacyModal = false;
    document.body.style.overflow = 'auto';
  }

  openCharteModal(): void {
    this.showCharteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCharteModal(): void {
    this.showCharteModal = false;
    document.body.style.overflow = 'auto';
  }

  // Empêche la propagation du clic dans la modal
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
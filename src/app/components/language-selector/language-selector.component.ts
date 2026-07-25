import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-dropdown" [class.translating]="isTranslating">
      <!-- Bouton principal avec drapeau actuel -->
      <button class="dropdown-btn" 
              (click)="toggleDropdown()"
              [disabled]="isTranslating"
              type="button">
        <span class="current-flag">
          <img [src]="getCurrentFlag()" [alt]="currentLang" class="flag-img">
        </span>
        <span class="arrow">▼</span>
      </button>
      
      <!-- Liste déroulante -->
      <div class="dropdown-content" *ngIf="isDropdownOpen">
        <div class="dropdown-items">
          <button *ngFor="let lang of languages" 
                  class="dropdown-item"
                  (click)="changeLanguage(lang.code)"
                  [class.active]="currentLang === lang.code"
                  type="button">
            <span class="flag">
              <img [src]="getFlagUrl(lang.code)" [alt]="lang.name" class="flag-img">
            </span>
            <span class="lang-name">{{ lang.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- Overlay pour fermer le dropdown quand on clique ailleurs -->
      <div class="dropdown-backdrop" *ngIf="isDropdownOpen" (click)="closeDropdown()"></div>
    </div>
  `,
  styles: [`
    .language-dropdown {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-btn {
      padding: 8px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      position: relative;
    }
    
    .dropdown-btn:hover {
      background: #f5f5f5;
      border-color: #2196F3;
    }
    
    .dropdown-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .flag-img {
      width: 20px;
      height: 15px;
      object-fit: cover;
      border-radius: 2px;
      vertical-align: middle;
    }
    
    .current-flag {
      display: flex;
      align-items: center;
    }
    
    .arrow {
      font-size: 10px;
      transition: transform 0.3s;
      margin-left: 4px;
    }
    
    .dropdown-content {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 5px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 160px;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }
    
    .dropdown-items {
      padding: 8px 0;
    }
    
    .dropdown-item {
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
      text-align: left;
    }
    
    .dropdown-item:hover {
      background: #f5f5f5;
    }
    
    .dropdown-item.active {
      background: #e3f2fd;
      font-weight: 500;
    }
    
    .dropdown-item .flag {
      display: flex;
      align-items: center;
      width: 20px;
    }
    
    .dropdown-item .lang-name {
      font-size: 14px;
      color: #333;
    }
    
    .dropdown-item.active .lang-name {
      color: #2196F3;
    }
    
    .dropdown-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: transparent;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Style pour l'intégration dans le header */
    :host {
      display: inline-block;
      margin-left: 10px;
    }
    
    /* Pour l'intégration dans .social-links du header */
    :host-context(.social-links) .dropdown-btn {
      background: transparent;
      border: 0px solid rgba(255, 255, 255, 0.3);
      color: white;
    }
    
    :host-context(.social-links) .dropdown-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    :host-context(.social-links) .arrow {
      color: white;
    }
    
    @media (max-width: 768px) {
      .dropdown-btn {
        padding: 6px 12px;
      }
      
      .flag-img {
        width: 18px;
        height: 13px;
      }
      
      .dropdown-content {
        min-width: 140px;
      }
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  private translateService = inject(TranslateService);

  languages = this.translateService.languages;
  currentLang = this.translateService.getCurrentLang();
  isTranslating = false;
  isDropdownOpen = false;

  // Fonction pour obtenir l'URL du drapeau
  getFlagUrl(langCode: string): string {
    // Utilisation d'un service de drapeaux (FlagCDN)
    const flagMap: { [key: string]: string } = {
      'fr': 'https://flagcdn.com/w20/fr.png',
      'en': 'https://flagcdn.com/w20/gb.png',
      'es': 'https://flagcdn.com/w20/es.png',
      'de': 'https://flagcdn.com/w20/de.png',
      'ar': 'https://flagcdn.com/w20/sa.png'
      // Ajoutez d'autres codes de langue si nécessaire
    };

    return flagMap[langCode] || 'https://flagcdn.com/w20/un.png';
  }

  getCurrentFlag(): string {
    return this.getFlagUrl(this.currentLang);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.language-dropdown');

    if (this.isDropdownOpen && dropdownElement &&
      !dropdownElement.contains(clickedElement)) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    if (!this.isTranslating) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  async changeLanguage(lang: string) {
    if (lang !== this.currentLang && !this.isTranslating) {
      this.isTranslating = true;
      this.currentLang = lang;
      this.isDropdownOpen = false;

      const overlay = this.createLoadingOverlay();
      document.body.appendChild(overlay);

      try {
        localStorage.setItem('siteLanguage', lang);
        this.translateService.setCurrentLang(lang);
        await this.translateService.translateSite(lang);
      } catch (error) {
        console.error('Erreur de traduction:', error);
      } finally {
        this.isTranslating = false;
        if (overlay.parentElement) {
          setTimeout(() => overlay.remove(), 500);
        }
      }
    }
  }

  private createLoadingOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      flex-direction: column;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    const text = document.createElement('p');
    text.textContent = 'Traduction en cours...';
    text.style.cssText = `
      margin-top: 20px;
      font-family: Arial, sans-serif;
      color: #333;
    `;

    overlay.appendChild(spinner);
    overlay.appendChild(text);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return overlay;
  }

  ngOnInit() {
    console.log('Langues disponibles:', this.languages);
    console.log('Langue actuelle:', this.currentLang);

    if (this.currentLang !== 'en') {
      setTimeout(() => {
        this.translateService.translateSite(this.currentLang);
      }, 1000);
    }
  }
}
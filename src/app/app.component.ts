import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatbotPopupComponent } from "./components/chatbot-popup/chatbot-popup.component";
import { TranslateService } from './services/translate.service';
import { WhatsappPopupComponent } from "./components/whatsapp-popup/whatsapp-popup.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ChatbotPopupComponent, WhatsappPopupComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tunicure-app';

  private translateService = inject(TranslateService);

  ngOnInit() {
    // Détecter la langue du navigateur au démarrage
    const browserLang = this.translateService.detectBrowserLanguage();
    if (browserLang !== 'fr') {
      setTimeout(() => {
        this.translateService.translateSite(browserLang);
      }, 1000);
    }
  }

  goToOrder() {
    window.location.href = '/order';
  }
}

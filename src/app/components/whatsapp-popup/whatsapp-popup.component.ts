import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-popup',
  standalone: true, // ← Ajoute cette ligne si ton composant est standalone
  imports: [CommonModule], // ← Ajoute cette ligne

  templateUrl: './whatsapp-popup.component.html',
  styleUrls: ['./whatsapp-popup.component.css']
})
export class WhatsappPopupComponent {

  isOpen = false;
  showTyping = false;
  showMessage = false;

  phone = "447403904850";

  togglePopup() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.showTyping = true;
      this.showMessage = false;

      setTimeout(() => {
        this.showTyping = false;
        this.showMessage = true;
      }, 1500);
    }
  }

  openWhatsApp() {
    const text = encodeURIComponent("Hello, I would like more information 😊");
    window.open(`https://wa.me/${this.phone}?text=${text}`, "_blank");
  }
}

// header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pour *ngFor et *ngIf
import { Router, RouterModule } from '@angular/router';
import { LanguageSelectorComponent } from "../language-selector/language-selector.component";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent], // Ajouter les imports nécessaires
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // Correction: styleUrls au lieu de styleUrl
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;

toggleMenu(event?: Event) {
  // Si le clic vient du sélecteur fixe, ne pas fermer le menu
  if (event) {
    const target = event.target as HTMLElement;
    if (target.closest('.mobile-language-fixed') || 
        target.closest('app-language-selector')) {
      console.log('Clic sur sélecteur de langue - menu reste ouvert');
      return;
    }
  }
  
  this.isMenuOpen = !this.isMenuOpen;
  document.body.classList.toggle('menu-open', this.isMenuOpen);
}

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

}

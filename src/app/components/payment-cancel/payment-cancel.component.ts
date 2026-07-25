import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="payment-cancel-container">
      <!-- Hero Section -->
      <section class="cancel-hero">
        <div class="cancel-hero-content">
          <h1 style="color: white; font-size: 42px;">Paiement Annulé</h1>
          <p style="color: white; font-size: 18px;">Votre transaction a été interrompue</p>
        </div>
      </section>

      <!-- Cancel Card -->
      <div class="cancel-card">
        <!-- Cancel Content -->
        <div class="cancel-content">
          <!-- Cancel Header -->
          <div class="cancel-header">
            <div class="cancel-icon">❌</div>
            <h1>Transaction Annulée</h1>
            <p class="cancel-subtitle">
              Vous avez annulé le processus de paiement. Aucun montant n'a été débité de votre compte.
            </p>
          </div>

          <!-- Cancel Details -->
          <div class="cancel-details">
            <div class="info-box">
              <div class="info-icon">ℹ️</div>
              <div class="info-content">
                <h4>Ce qui s'est passé</h4>
                <p>
                  Vous avez interrompu le processus de paiement avant sa finalisation. 
                  Votre réservation n'a pas été confirmée et aucun prélèvement n'a été effectué.
                </p>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
              <h3>Que souhaitez-vous faire ensuite ?</h3>
              <div class="steps-grid">
                <div class="step-item">
                  <div class="step-icon">🔄</div>
                  <h4>Recommencer le paiement</h4>
                  <p>Retournez à votre commande pour compléter le paiement</p>
                  <button class="btn-retry" (click)="retryPayment()">
                    <i class="bi bi-arrow-clockwise"></i>
                    Réessayer le paiement
                  </button>
                </div>
                
                <div class="step-item">
                  <div class="step-icon">📞</div>
                  <h4>Contactez-nous</h4>
                  <p>Besoin d'aide ? Notre équipe est là pour vous accompagner</p>
                  <a href="tel:+33123456789" class="btn-contact">
                    <i class="bi bi-telephone"></i>
                    Nous appeler
                  </a>
                </div>
                
                <div class="step-item">
                  <div class="step-icon">✏️</div>
                  <h4>Modifier la commande</h4>
                  <p>Revoir les détails de votre consultation avant de payer</p>
                  <button class="btn-modify" (click)="modifyOrder()">
                    <i class="bi bi-pencil-square"></i>
                    Modifier
                  </button>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <a routerLink="/" class="btn-home">
                <i class="bi bi-house-door"></i>
                Retour à l'accueil
              </a>
              <a routerLink="/dashboard" class="btn-dashboard">
                <i class="bi bi-person-circle"></i>
                Mon compte
              </a>
            </div>

            <!-- Security Assurance -->
            <div class="security-assurance">
              <h4>
                <i class="bi bi-shield-check"></i>
                Votre sécurité est garantie
              </h4>
              <p>
                Aucune information bancaire n'a été conservée. 
                Toutes les transactions sont sécurisées par le cryptage SSL.
              </p>
              <div class="security-badges">
                <span class="security-badge">Annulation sécurisée</span>
                <span class="security-badge">Données protégées</span>
                <span class="security-badge">Sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./payment-cancel.component.css']
})
export class PaymentCancelComponent implements OnInit {
  orderId: string | null = null;

  ngOnInit() {
    // Récupérer l'orderId depuis l'URL ou le localStorage
    const urlParams = new URLSearchParams(window.location.search);
    this.orderId = urlParams.get('orderId') || localStorage.getItem('lastOrderId');
  }

  retryPayment() {
    if (this.orderId) {
      // Rediriger vers la page de paiement avec l'orderId
      window.location.href = `/payment?orderId=${this.orderId}`;
    } else {
      // Retour à l'accueil si pas d'orderId
      window.location.href = '/';
    }
  }

  modifyOrder() {
    if (this.orderId) {
      // Rediriger vers la page de modification de commande
      window.location.href = `/order/edit/${this.orderId}`;
    } else {
      window.location.href = '/book-consultation';
    }
  }
}
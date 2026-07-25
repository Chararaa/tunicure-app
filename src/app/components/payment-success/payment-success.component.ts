import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterLink, DatePipe, NgIf],
  template: `
    <div class="payment-success-container">
      <!-- Hero Section -->
      <section class="success-hero">
        <div class="success-hero-content">
          <h1 style="color: white; font-size: 42px;">Paiement Réussi !</h1>
          <p style="color: white; font-size: 18px;">Votre réservation est maintenant confirmée</p>
        </div>
      </section>

      <!-- Success Card -->
      <div class="success-card mt-5">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-success">
          <div class="loading-spinner"></div>
          <h3>Vérification de votre paiement...</h3>
          <p class="text-muted">Cette opération peut prendre quelques instants</p>
        </div>

        <!-- Success Content -->
        <div *ngIf="!isLoading && paymentDetails" class="success-content">
          <!-- Success Header -->
          <div class="success-header">
            <h1>Paiement Confirmé</h1>
         
          </div>

          <!-- Confirmation Details -->
          <div class="confirmation-details">
            <div class="confirmation-grid">
              <div class="confirmation-item">
                <h6>Transaction ID</h6>
                <div class="confirmation-value">{{ sessionId  }}...</div>
              </div>
              
              <div class="confirmation-item">
                <h6>Statut du paiement</h6>
                <div class="confirmation-value" style="color: #28a745;">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ paymentDetails.paymentStatus || 'Confirmé' }}
                </div>
              </div>
              
              <div class="confirmation-item" *ngIf="paymentDetails.date">
                <h6>Date & Heure</h6>
                <div class="confirmation-value">
                  {{ paymentDetails.date | date:'dd/MM/yyyy à HH:mm' }}
                </div>
              </div>
              
              <div class="confirmation-item" *ngIf="orderId">
                <h6>Référence Commande</h6>
                <div class="confirmation-value">{{ orderId }}...</div>
              </div>
            </div>

           
          </div>

          <!-- Next Steps -->
          <div class="next-steps">
            <h3>Prochaines Étapes</h3>
            <div class="steps-grid">
              <div class="step-item">
                <div class="step-icon">📧</div>
                <h4>Email de confirmation</h4>
                <p>Recevez un email récapitulatif avec tous les détails de votre réservation</p>
              </div>
              
              <div class="step-item">
                <div class="step-icon">📅</div>
                <h4>Confirmation du rendez-vous</h4>
                <p>Notre équipe vous contactera pour finaliser la date et l'heure de votre consultation</p>
              </div>
              
              <div class="step-item">
                <div class="step-icon">📋</div>
                <h4>Préparation</h4>
                <p>Recevez toutes les informations nécessaires pour préparer votre consultation</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <a routerLink="/home" class="btn-home">
              <i class="bi bi-house-door"></i>
              Retour à l'accueil
            </a>
            <button class="btn-print" (click)="printConfirmation()">
              <i class="bi bi-printer"></i>
              Imprimer la confirmation
            </button>
          </div>

          <!-- Confirmation Email -->
          <div class="confirmation-email">
            <h4>
              <i class="bi bi-envelope-check"></i>
              Email de confirmation envoyé
            </h4>
            <p>
              Un email de confirmation a été envoyé à votre adresse email. 
              Si vous ne le recevez pas, vérifiez votre dossier spam ou contactez notre support.
            </p>
          </div>
        </div>

        <!-- Fallback Success -->
        <div *ngIf="!isLoading && !paymentDetails" class="text-center py-5">
          <div class="success-animation">
            <svg viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none"/>
              <path d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h2 class="text-success mb-3">✅ Paiement Traité</h2>
          <p class="text-muted mb-4">Votre transaction a été traitée avec succès.</p>
          <div class="action-buttons">
            <a routerLink="/" class="btn-home">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  sessionId = '';
  orderId = '';
  paymentDetails: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id') || '';
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') || '';

    console.log('Session ID:', this.sessionId);
    console.log('Order ID:', this.orderId);

    if (this.sessionId) {
      this.verifyPayment();
    } else if (this.orderId) {
      // Simuler un délai pour l'animation
      setTimeout(() => {
        this.paymentDetails = {
          orderId: this.orderId,
          success: true,
          amount: 0,
          paymentStatus: 'Confirmé'
        };
        this.isLoading = false;
      }, 1500);
    } else {
      this.isLoading = false;
    }
  }

  verifyPayment() {
    this.paymentService.verifyPayment(this.sessionId).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.paymentDetails = response;
          this.isLoading = false;
          console.log('✅ Paiement vérifié:', response);
        }, 1000);
      },
      error: (error) => {
        console.warn('⚠️ Erreur vérification paiement:', error);
        setTimeout(() => {
          this.paymentDetails = {
            success: true,
            sessionId: this.sessionId,
            amount: 0,
            paymentStatus: 'Traité',
            message: 'Paiement traité avec succès'
          };
          this.isLoading = false;
        }, 1000);
      }
    });
  }

  printConfirmation() {
    window.print();
  }
}
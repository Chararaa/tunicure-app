import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true, // Si vous utilisez standalone components
  imports: [CommonModule], // AJOUTER CETTE LIGNE
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  order: any = null;
  isLoading = true;
  error = '';
  token = '';
  orderId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.token = this.route.snapshot.queryParamMap.get('token') || '';

      if (!this.token) {
        this.error = 'Lien de paiement invalide';
        this.isLoading = false;
        return;
      }

      this.loadOrderDetails();
    });
  }

  loadOrderDetails() {
    this.paymentService.getOrderDetails(this.orderId, this.token).subscribe({
      next: (response) => {
        this.order = response.order;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Loading error';
        this.isLoading = false;
      }
    });
  }

  async proceedToPayment() {
    try {
      const response = await this.paymentService.createPaymentSession(
        this.orderId,
        this.token
      ).toPromise();

      // Rediriger vers Stripe
      window.location.href = response.url;
    } catch (error: any) {
      this.error = error.error?.message || 'Erreur lors du paiement';
    }
  }

  calculateDepositAmount(): number {
    if (!this.order?.price) return 0;
    return this.order.price * 0.1;
  }

  calculateRemainingAmount(): number {
    if (!this.order?.price) return 0;
    return this.order.price * 0.9;
  }
}
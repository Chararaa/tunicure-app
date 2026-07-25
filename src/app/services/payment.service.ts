import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;
  private stripePromise = loadStripe(environment.stripePublicKey);

  constructor(private http: HttpClient) { }

  getOrderDetails(orderId: string, token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/order-details/${orderId}`, {  // ← NOUVELLE ROUTE
      params: { token }
    });
  }


  // Créer une session de paiement
  createPaymentSession(orderId: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/create-payment-session/${orderId}`, {
      token,
      returnUrl: `${window.location.origin}/payment/success`
    });
  }

  // Vérifier le statut du paiement
  verifyPayment(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${sessionId}`);
  }
}

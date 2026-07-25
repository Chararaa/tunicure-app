import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
//import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';

export interface Order {
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    country: string;
    address?: string;
    zipCode?: string;
    state?: string;
    dateBirth?: string;
    weight?: number;
    height?: number;
    age?: number;
  };
  medicalInfo: {
    smokes: 'yes' | 'no';
    alcoholConsumption?: string;
    contagiousDisease?: string;
    previousOperations: 'yes' | 'no';
    previousOperationsDetails?: string;
    woundHealingAbnormality?: string;
    bleedingClottingAbnormality?: string;
    chronicMedication: 'yes' | 'no';
    allergies: 'yes' | 'no';
    allergiesDetails?: string;
    expectations?: string;
  };
  category: string; // ID de la sous-catégorie
  generalCategory: string; // ID de la catégorie générale
  categoryName?: string; // Nom pour affichage
  generalCategoryName?: string; // Nom pour affichage
  pack: 'bronze';
  photos?: string[];
  additionalInfo?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  // Créer une commande avec photos
  createOrderWithPhotos(order: Order, photos: File[]): Observable<any> {
    const formData = new FormData();

    // Ajouter les données de la commande
    formData.append('clientInfo', JSON.stringify(order.clientInfo));
    formData.append('medicalInfo', JSON.stringify(order.medicalInfo));
    formData.append('category', order.category);
    formData.append('generalCategory', order.generalCategory);
    formData.append('pack', order.pack);

    // Informations supplémentaires
    const orderData = {
      clientInfo: order.clientInfo,
      medicalInfo: order.medicalInfo,
      category: order.category,
      generalCategory: order.generalCategory,
      pack: order.pack,
      additionalInfo: order.additionalInfo || {}
    };

    formData.append('orderData', JSON.stringify(orderData));

    // Ajouter les fichiers photos
    photos.forEach((photo, index) => {
      formData.append('photos', photo, photo.name);
    });

    return this.http.post(`${this.apiUrl}/orders`, formData);
  }

  // Créer une commande sans photos
  createOrder(order: Order): Observable<any> {
    const orderData = {
      ...order,
      photos: []
    };
    return this.http.post(`${this.apiUrl}/orders`, orderData);
  }

  // Récupérer les commandes (pour l'admin)
  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`);
  }
}

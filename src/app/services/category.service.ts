// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
//import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  banner: string;
  description: string;
  keywords: string[];
  averageDuration: string;
  recoveryTime: string;
  priceRange: PriceRange;
  benefits: Benefit[];
  faqs: FAQ[];
  generalCategory?: any;
  isActive: boolean;
  displayOrder: number;
  slug?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCategoriesByGeneralCategory(generalCategoryId: string): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/by-general/${generalCategoryId}?active=true`)
      .pipe(
        map(response => response.data || [])
      );
  }
}

// src/app/services/general-category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
//import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';

export interface GeneralCategory {
  _id: string;
  name: string;
  description: string;
  banner: string;
  video: string;
  videoType?: string;
  icon: string;
  subCategories: any[];
  subCategoriesCount: number;
  displayOrder: number;
  isActive: boolean;
  slug: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeneralCategoryService {
  private apiUrl = `${environment.apiUrl}/generalcategories`;

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<GeneralCategory[]> {
    return this.http.get<ApiResponse<GeneralCategory[]>>(`${this.apiUrl}?active=true`)
      .pipe(
        map(response => {
          //console.log('API Response:', response);
          return response.data || [];
        })
      );
  }

  getCategoryById(id: string): Observable<GeneralCategory> {
    return this.http.get<ApiResponse<GeneralCategory>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCategorySubcategories(id: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${id}/subcategories?active=true`)
      .pipe(
        map(response => response.data)
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../models/doctor.model';
//import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private apiUrl = `${environment.apiUrl}/doctors`;


  constructor(private http: HttpClient) { }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}?active=true&verified=true`);
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  // NOUVEAU: Récupérer les docteurs "featured"
  getFeaturedDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/featured/doctors`);
  }

  // NOUVEAU: Recherche par spécialité avec les nouveaux filtres
  getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/specialty/${specialty}`);
  }

  // NOUVEAU: Inscription de docteur
  registerDoctor(doctorData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, doctorData);
  }
}


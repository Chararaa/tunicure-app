// geo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  private africanCountries = [
    'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 
    'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 
    'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 
    'MW', 'ML', 'MR', 'MU', 'YT', 'MA', 'MZ', 'NA', 'NE', 'NG', 
    'RE', 'RW', 'SH', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 
    'SD', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'
  ];
  
  // Remplacez par votre token ipinfo.io
  private token = '3cd17e803d160c';

  constructor(private http: HttpClient) {}

  isAfricanVisitor(): Observable<boolean> {
    // Ipinfo.io supporte CORS avec le token en paramètre [citation:3][citation:7]
    return this.http.get<any>(`https://ipinfo.io/json?token=${this.token}`).pipe(
      map(response => {
        if (response && response.country) {
          const countryCode = response.country;
          console.log('Pays détecté:', countryCode); // Pour debug
          return this.africanCountries.includes(countryCode);
        }
        return false;
      }),
      catchError((error) => {
        console.log('Géo-détection échouée, accès autorisé par défaut', error);
        return of(false); // En cas d'erreur, on autorise l'accès
      })
    );
  }
}

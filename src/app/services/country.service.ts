import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface Country {
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  // Utilisez votre propre API proxy au lieu de restcountries.com
  private API = 'https://admin.tunicure.com/api/countries';

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.http.get<any[]>(this.API).pipe(
      map(countries =>
        countries
          .map(c => ({
            name: c.name.common || c.name,
            code: c.cca2 || c.code
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      ),
      catchError(error => {
        console.error('Erreur chargement pays:', error);
        // Liste de fallback en cas d'erreur
        return of([
          { name: 'France', code: 'FR' },
          { name: 'United States', code: 'US' },
          { name: 'United Kingdom', code: 'GB' },
          { name: 'Germany', code: 'DE' },
          { name: 'Spain', code: 'ES' },
          { name: 'Italy', code: 'IT' },
          { name: 'Tunisia', code: 'TN' },
          { name: 'Turkey', code: 'TR' }
        ]);
      })
    );
  }
}

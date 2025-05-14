import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  executeQuery(sql: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/getSales.php`, 
      { sql: sql },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getInventory.php`);
  }

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getTransactions.php`);
  }
}

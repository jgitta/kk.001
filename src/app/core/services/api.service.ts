import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  executeQuery(sql: string): Observable<any[]> {
    console.log('Executing SQL query:', sql);
    
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<any[]>(`${this.apiUrl}/query`, { sql }, { headers })
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }
  
  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory`)
      .pipe(
        catchError(error => {
          console.error('Error fetching inventory:', error);
          return throwError(() => error);
        })
      );
  }
  
  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`)
      .pipe(
        catchError(error => {
          console.error('Error fetching transactions:', error);
          return throwError(() => error);
        })
      );
  }
}

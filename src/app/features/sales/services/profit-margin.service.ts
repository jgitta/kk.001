import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class ProfitMarginService {
  private dataService = inject(DataService);
  
  profitByDepartment = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  getProfitMarginByDepartment(period: 'day'|'month'|'year' = 'month'): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getProfitMarginByDepartment(period).pipe(
      tap(data => {
        this.profitByDepartment.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching profit margin data:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load profit margin data');
        throw err;
      })
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentSalesService {
  private dataService = inject(DataService);
  
  departmentSales = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getDepartmentSales(periodType: 'day'|'month'|'year' = 'month'): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDepartmentSales(periodType).pipe(
      tap(data => {
        this.departmentSales.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching department sales:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load department sales');
        throw err;
      })
    );
  }
}

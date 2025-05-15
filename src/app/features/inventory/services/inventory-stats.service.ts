import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryStatsService {
  private dataService = inject(DataService);
  
  stats = signal<any>({});
  byDepartment = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getInventoryStats(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getInventoryStats().pipe(
      tap(data => {
        this.stats.set(data[0] || {});
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching inventory stats:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load inventory statistics');
        throw err;
      })
    );
  }
  
  getInventoryByDepartment(): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getInventoryByDepartment().pipe(
      tap(data => {
        this.byDepartment.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching inventory by department:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load inventory by department');
        throw err;
      })
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class TopSellingItemsService {
  private dataService = inject(DataService);
  
  topItems = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getTopSellingItems(limit: number = 10, period: 'day'|'month'|'year' = 'month'): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getTopSellingItems(limit, period).pipe(
      tap(data => {
        this.topItems.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching top selling items:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load top selling items');
        throw err;
      })
    );
  }
}
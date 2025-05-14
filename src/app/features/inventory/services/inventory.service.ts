import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { InventoryItem } from '../../../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiService = inject(ApiService);
  
  inventory = signal<InventoryItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getInventory(): Observable<InventoryItem[]> {
    this.loading.set(true);
    return this.apiService.getInventory().pipe(
      tap(data => {
        this.inventory.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error fetching inventory:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load inventory');
        throw err;
      })
    );
  }
}

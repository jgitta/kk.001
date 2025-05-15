import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { InventoryItem } from '../../../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private dataService = inject(DataService);
  
  inventory = signal<InventoryItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getInventory(): Observable<InventoryItem[]> {
    this.loading.set(true);
    return this.dataService.getInventory().pipe(
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

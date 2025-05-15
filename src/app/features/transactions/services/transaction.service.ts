import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { Transaction } from '../../../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private dataService = inject(DataService);
  
  transactions = signal<Transaction[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getTransactions(): Observable<Transaction[]> {
    this.loading.set(true);
    return this.dataService.getAllTransactions().pipe(
      tap(data => {
        this.transactions.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error fetching transactions:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load transactions');
        throw err;
      })
    );
  }
  
  getTransactionDetails(id: number): Observable<any[]> {
    return this.dataService.getTransactionEntries(id);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Sale } from '../../../models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class DailySalesService {
  private apiService = inject(ApiService);
  
  // Using signals for reactive state management
  dailySales = signal<Sale[]>([]);
  dailyTotal = signal<number>(0);
  newTransaction = signal<boolean>(false);
  lastTransactionCount = 0;

  getDailySales(date: string): Observable<Sale[]> {
    const sql = `SELECT [Transaction].[TransactionNumber], [Transaction].[Time], 
                round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                FROM [Transaction] 
                LEFT JOIN TransactionEntry ON [TransactionEntry].TransactionNumber = [Transaction].[TransactionNumber] 
                WHERE CONVERT(date,[Transaction].[Time]) = '${date}' 
                GROUP BY [Transaction].[TransactionNumber], [Transaction].[Time] 
                ORDER BY [Transaction].[Time]`;
    
    return this.apiService.executeQuery(sql).pipe(
      tap(data => {
        // Check if there are new transactions
        if (this.lastTransactionCount > 0 && data.length > this.lastTransactionCount) {
          this.newTransaction.set(true);
        } else {
          this.newTransaction.set(false);
        }
        
        this.lastTransactionCount = data.length;
        this.dailySales.set(data);
        
        const total = data.reduce((sum, sale) => sum + Number(sale.Total), 0);
        this.dailyTotal.set(total);
      }),
      catchError(err => {
        console.error('Error fetching daily sales:', err);
        throw err;
      })
    );
  }
}

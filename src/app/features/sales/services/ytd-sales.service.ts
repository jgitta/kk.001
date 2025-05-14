import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class YtdSalesService {
  private apiService = inject(ApiService);
  
  ytdSales = signal<any[]>([]);
  ytdTotal = signal<number>(0);

  getYtdSales(year: number): Observable<any[]> {
    const sql = `SELECT Month([Transaction].[Time]) as Month, 
                 round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 WHERE YEAR([Transaction].[Time]) = ${year} 
                 GROUP BY Month([Transaction].[Time]) 
                 ORDER BY Month`;
    
    return this.apiService.executeQuery(sql).pipe(
      tap(data => {
        this.ytdSales.set(data);
        const total = data.reduce((sum, item) => sum + Number(item.Total), 0);
        this.ytdTotal.set(total);
      }),
      catchError(err => {
        console.error('Error fetching YTD sales:', err);
        throw err;
      })
    );
  }
}

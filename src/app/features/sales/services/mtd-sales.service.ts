import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class MtdSalesService {
  private apiService = inject(ApiService);
  
  mtdSales = signal<any[]>([]);
  mtdTotal = signal<number>(0);

  getMtdSales(year: number, month: number): Observable<any[]> {
    const sql = `SELECT Day([Transaction].[Time]) as Day, 
                round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                FROM [transaction] 
                LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                WHERE YEAR([Transaction].[Time]) = ${year} AND MONTH([Transaction].[Time]) = ${month}
                GROUP BY Day([Transaction].[Time]) 
                ORDER BY Day`;
    
    return this.apiService.executeQuery(sql).pipe(
      tap(data => {
        this.mtdSales.set(data);
        const total = data.reduce((sum, item) => sum + Number(item.Total), 0);
        this.mtdTotal.set(total);
      }),
      catchError(err => {
        console.error('Error fetching MTD sales:', err);
        throw err;
      })
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class YtdSalesService {
  private dataService = inject(DataService);
  
  ytdSales = signal<any[]>([]);
  ytdTotal = signal<number>(0);
  yearComparison = signal<any[]>([]);

  getYtdSales(year: number = new Date().getFullYear()): Observable<any[]> {
    const sql = `SELECT Month([Transaction].[Time]) as Month, 
                 round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 WHERE YEAR([Transaction].[Time]) = ${year}
                 AND DATEPART(dayofyear, [Transaction].[Time]) <= DATEPART(dayofyear, GETDATE())
                 GROUP BY Month([Transaction].[Time]) 
                 ORDER BY Month`;
    
    return this.dataService.executeQuery(sql).pipe(
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

  getYearComparison(): Observable<any[]> {
    return this.dataService.getYtdSalesByYear().pipe(
      tap(data => {
        this.yearComparison.set(data);
      }),
      catchError(err => {
        console.error('Error fetching year comparison data:', err);
        throw err;
      })
    );
  }
}

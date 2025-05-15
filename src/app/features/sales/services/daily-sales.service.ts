import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DailySalesService {
  private dataService = inject(DataService);
  
  dailySales = signal<any[]>([]);
  dailyTotal = signal<number>(0);

  // Add a signal to track if there's a new transaction
  private _hasNewTransaction = signal<boolean>(false);

  getDailySales(date: string = new Date().toISOString().split('T')[0]): Observable<any[]> {
    return this.dataService.getDailySalesByHour(date).pipe(
      tap(data => {
        this.dailySales.set(data);
        const total = data.reduce((sum, item) => sum + Number(item.Total), 0);
        this.dailyTotal.set(total);
      }),
      catchError(err => {
        console.error('Error fetching daily sales:', err);
        throw err;
      })
    );
  }
  
  // Optional: Get today's total directly without hourly breakdown
  getDailyTotal(date: string = new Date().toISOString().split('T')[0]): Observable<any> {
    return this.dataService.getDailyTotal(date).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.dailyTotal.set(Number(data[0].Total) || 0);
        } else {
          this.dailyTotal.set(0);
        }
      }),
      catchError(err => {
        console.error('Error fetching daily total:', err);
        throw err;
      })
    );
  }

  // Method to check if there's a new transaction
  newTransaction(): boolean {
    return this._hasNewTransaction();
  }

  // Method to set a new transaction flag
  setNewTransaction(value: boolean): void {
    this._hasNewTransaction.set(value);
  }
}

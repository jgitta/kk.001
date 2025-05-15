import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class MtdSalesService {
  private dataService = inject(DataService);
  
  mtdSales = signal<any[]>([]);
  mtdTotal = signal<number>(0);

  getMtdSales(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): Observable<any[]> {
  return this.dataService.getMtdSalesByDay(year, month).pipe(
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

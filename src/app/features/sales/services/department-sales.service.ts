import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DepartmentSale } from '../../../models/department-sale.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentSalesService {
  private apiService = inject(ApiService);
  
  departmentSales = signal<DepartmentSale[]>([]);

  getDepartmentSales(year: number): Observable<DepartmentSale[]> {
    const sql = `SELECT [Department].Name AS Department, 
                round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                FROM [transaction] 
                LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                LEFT JOIN Item ON Item.ID = TransactionEntry.ItemID 
                LEFT JOIN [Department] ON [Department].ID = [Item].DepartmentID 
                WHERE YEAR([Transaction].[Time]) = ${year}  
                GROUP BY [Department].Name 
                ORDER BY [Department].Name`;
    
    return this.apiService.executeQuery(sql).pipe(
      tap(data => this.departmentSales.set(data)),
      catchError(err => {
        console.error('Error fetching department sales:', err);
        throw err;
      })
    );
  }
}

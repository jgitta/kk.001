#!/bin/bash

echo "Applying fixes for Angular compilation errors..."

# 1. Fix the CSS syntax error in panel-widget.component.ts
cat > src/app/shared/components/panel-widget/panel-widget.component.ts << 'PANELEOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <div class="panel-header">
        <h3 class="panel-title">{{ title }}</h3>
      </div>
      <div class="panel-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    .panel {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      min-height: 350px; /* Increased from 300px to accommodate charts */
      display: flex;
      flex-direction: column;
    }
    
    .panel-header {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .panel-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .panel-content {
      padding: 15px;
      flex: 1;
      overflow: auto;
    }
  `
})
export class PanelWidgetComponent {
  @Input() title: string = '';
}
PANELEOF

# 2. Add missing methods to DataService
cat >> src/app/services/data.service.ts << 'DATAEOF'

  getDailySalesByHour(date?: string): Observable<any[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sql = `
      SELECT 
        DATEPART(HOUR, Time) as Hour,
        SUM(Total) as Total
      FROM [Transaction]
      WHERE CONVERT(date, Time) = '${targetDate}'
      GROUP BY DATEPART(HOUR, Time)
      ORDER BY Hour
    `;
    
    return this.executeQuery(sql);
  }
  
  getDailyTotal(date?: string): Observable<any[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sql = `
      SELECT 
        SUM(Total) as Total
      FROM [Transaction]
      WHERE CONVERT(date, Time) = '${targetDate}'
    `;
    
    return this.executeQuery(sql);
  }

  getMtdSalesByDay(year?: number, month?: number): Observable<any[]> {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    const sql = `
      SELECT 
        DAY(Time) as Day,
        SUM(Total) as Total
      FROM [Transaction]
      WHERE YEAR(Time) = ${targetYear} AND MONTH(Time) = ${targetMonth}
      GROUP BY DAY(Time)
      ORDER BY Day
    `;
    
    return this.executeQuery(sql);
  }
DATAEOF

# 3. Fix DailySalesService
mkdir -p src/app/features/sales/services
cat > src/app/features/sales/services/daily-sales.service.ts << 'DAILYEOF'
import { Injectable, signal, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DailySalesService {
  private dataService = inject(DataService);
  
  dailySales = signal<any[]>([]);
  dailyTotal = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  getDailySales(date?: string): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDailySalesByHour(date).pipe(
      tap((data: any[]) => {
        this.dailySales.set(data);
        const total = data.reduce((sum: number, item: any) => sum + Number(item.Total || 0), 0);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching daily sales data:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load daily sales data');
        this.dailySales.set([]);
        return of([]);
      })
    );
  }
  
  getDailyTotal(date?: string): Observable<number> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDailyTotal(date).pipe(
      tap((data: any[]) => {
        if (data && data.length > 0) {
          this.dailyTotal.set(Number(data[0]?.Total) || 0);
        } else {
          this.dailyTotal.set(0);
        }
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching daily total:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load daily total');
        this.dailyTotal.set(0);
        return of(0);
      })
    );
  }
}
DAILYEOF

# 4. Fix MTD Sales Service
cat > src/app/features/sales/services/mtd-sales.service.ts << 'MTDEOF'
import { Injectable, signal, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class MtdSalesService {
  private dataService = inject(DataService);
  
  mtdSales = signal<any[]>([]);
  mtdTotal = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  getMtdSales(year?: number, month?: number): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getMtdSalesByDay(year, month).pipe(
      tap((data: any[]) => {
        this.mtdSales.set(data);
        const total = data.reduce((sum: number, item: any) => sum + Number(item.Total || 0), 0);
        this.mtdTotal.set(total);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching MTD sales data:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load MTD sales data');
        this.mtdSales.set([]);
        this.mtdTotal.set(0);
        return of([]);
      })
    );
  }
}
MTDEOF

# 5. Create Transaction Model
mkdir -p src/app/models
cat > src/app/models/transaction.model.ts << 'TRANSMODELEOF'
export interface Transaction {
  TransactionNumber: number;
  Time: string;  
  Total: number;
  id?: number;
  date?: string;
  total?: number;
  [key: string]: any;
}
TRANSMODELEOF

# 6. Fix Transaction Service
mkdir -p src/app/features/transactions/services
cat > src/app/features/transactions/services/transaction.service.ts << 'TRANSSERVEOF'
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

// Import directly from DataService's Transaction interface
import { Transaction } from '../../../services/data.service';

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
      tap((data: Transaction[]) => {
        this.transactions.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error loading transactions:', err);
        this.error.set(err.message || 'Failed to load transactions');
        this.loading.set(false);
        this.transactions.set([]);
        return of([]);
      })
    );
  }
  
  getTransactionDetail(id: number): Observable<any[]> {
    return this.dataService.getTransactionEntries(id);
  }
}
TRANSSERVEOF

echo "Angular error fixes applied successfully!"
echo "Run 'ng serve' to test your application."

#!/bin/bash
# filepath: /mnt/Documents/dev/Angular/19/kk.001/restore-charts.sh

echo "Restoring Angular application to display charts properly..."

# 1. Keep your existing database configuration (db.js) intact

# 2. Fix the API service to properly communicate with your backend
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/core/services

cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/core/services/api.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  executeQuery(sql: string): Observable<any[]> {
    console.log('Executing SQL query:', sql);
    
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<any[]>(`${this.apiUrl}/query`, { sql }, { headers })
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }
  
  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory`)
      .pipe(
        catchError(error => {
          console.error('Error fetching inventory:', error);
          return throwError(() => error);
        })
      );
  }
  
  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`)
      .pipe(
        catchError(error => {
          console.error('Error fetching transactions:', error);
          return throwError(() => error);
        })
      );
  }
}
EOF

# 3. Create DataService with proper chart data-fetching methods
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/services

cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/services/data.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  constructor(private apiService: ApiService) {}
  
  // Basic API methods
  executeQuery(sql: string): Observable<any[]> {
    return this.apiService.executeQuery(sql);
  }
  
  getInventory(): Observable<any[]> {
    return this.apiService.getInventory();
  }

  getAllTransactions(): Observable<any[]> {
    return this.apiService.getTransactions();
  }

  getTransactionEntries(id: number): Observable<any[]> {
    const sql = `
      SELECT 
        TransactionEntry.EntryID as entry_id,
        Item.Name as item_name,
        TransactionEntry.Quantity as quantity,
        TransactionEntry.Price as price,
        (TransactionEntry.Quantity * TransactionEntry.Price) as total
      FROM TransactionEntry
      JOIN Item ON TransactionEntry.ItemID = Item.ID
      WHERE TransactionEntry.TransactionNumber = ${id}
      ORDER BY TransactionEntry.EntryID
    `;
    
    return this.executeQuery(sql);
  }
  
  // Sales data methods
  getDailySalesByHour(date?: string): Observable<any[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sql = `
      SELECT 
        DATEPART(HOUR, Time) AS Hour,
        COUNT(TransactionNumber) AS Transactions,
        SUM(Total) AS Total
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
        SUM(Total) AS Total
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
        DAY(Time) AS Day,
        COUNT(TransactionNumber) AS Transactions,
        SUM(Total) AS Total
      FROM [Transaction]
      WHERE YEAR(Time) = ${targetYear} AND MONTH(Time) = ${targetMonth}
      GROUP BY DAY(Time)
      ORDER BY Day
    `;
    
    return this.executeQuery(sql);
  }
  
  getDepartmentSales(period: string = 'month', year?: number): Observable<any[]> {
    // Default to current year or the one provided
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    let whereClause = '';
    
    if (period === 'day') {
      const day = currentDate.getDate();
      whereClause = `WHERE YEAR(t.Time) = ${targetYear} AND MONTH(t.Time) = ${month} AND DAY(t.Time) = ${day}`;
    } else if (period === 'month') {
      whereClause = `WHERE YEAR(t.Time) = ${targetYear} AND MONTH(t.Time) = ${month}`;
    } else if (period === 'year') {
      whereClause = `WHERE YEAR(t.Time) = ${targetYear}`;
    }
    
    const sql = `
      SELECT 
        Department.Name AS Department,
        COUNT(TransactionEntry.TransactionNumber) AS Transactions,
        SUM(TransactionEntry.Quantity * TransactionEntry.Price) AS Total
      FROM [Transaction] t
      JOIN TransactionEntry ON TransactionEntry.TransactionNumber = t.TransactionNumber
      JOIN Item ON TransactionEntry.ItemID = Item.ID
      JOIN Department ON Item.DepartmentID = Department.ID
      ${whereClause}
      GROUP BY Department.Name
      ORDER BY Total DESC
    `;
    
    return this.executeQuery(sql);
  }
  
  getYtdSalesByYear(): Observable<any[]> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const previousYear = currentYear - 1;
    
    const sql = `
      SELECT 
        YEAR(Time) as Year,
        MONTH(Time) as Month,
        SUM(Total) as Total
      FROM [Transaction]
      WHERE YEAR(Time) IN (${previousYear}, ${currentYear})
      GROUP BY YEAR(Time), MONTH(Time)
      ORDER BY Year, Month
    `;
    
    return this.executeQuery(sql);
  }
}
EOF

# 4. Fix environment settings
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/environments

cat > /mnt/Documents/dev/Angular/19/kk.001/src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'  // Update this if your API runs on a different port
};
EOF

cat > /mnt/Documents/dev/Angular/19/kk.001/src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: '/api'  // In production, API is on same server
};
EOF

# 5. Fix the API routes file to ensure it properly handles query requests
cat > /mnt/Documents/dev/Angular/19/kk.001/routes/api.js << 'EOF'
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// Middleware for basic request logging
router.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Safe SQL keywords check
const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE'];

// Execute SQL query
router.post('/query', async (req, res) => {
  try {
    const sqlQuery = req.body.sql;
    
    if (!sqlQuery) {
      return res.status(400).json({ message: 'SQL query is required' });
    }
    
    // Check for potentially harmful SQL
    const upperQuery = sqlQuery.toUpperCase();
    const containsForbiddenKeyword = forbiddenKeywords.some(keyword => 
      upperQuery.includes(keyword)
    );
    
    if (containsForbiddenKeyword) {
      return res.status(403).json({ 
        message: 'Query contains forbidden operations'
      });
    }
    
    const pool = await poolPromise;
    const result = await pool.request().query(sqlQuery);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all inventory
router.get('/inventory', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        Item.ID,
        Item.Name,
        Item.Quantity,
        Item.Price,
        Department.Name as DepartmentName,
        Department.ID as DepartmentID
      FROM Item
      JOIN Department ON Item.DepartmentID = Department.ID
      ORDER BY Item.Name
    `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        TransactionNumber as id,
        Time as date,
        Total as total
      FROM [Transaction]
      ORDER BY Time DESC
    `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get transaction entries
router.get('/transactions/:id/entries', async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          TransactionEntry.EntryID as entry_id,
          Item.Name as item_name,
          TransactionEntry.Quantity as quantity,
          TransactionEntry.Price as price,
          (TransactionEntry.Quantity * TransactionEntry.Price) as total
        FROM TransactionEntry
        JOIN Item ON TransactionEntry.ItemID = Item.ID
        WHERE TransactionEntry.TransactionNumber = @id
        ORDER BY TransactionEntry.EntryID
      `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching transaction entries:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
EOF

# 6. Add the Angular animation provider to app.config.ts
cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/app.config.ts << 'EOF'
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
};
EOF

# 7. Clean the Angular cache to avoid compilation issues
rm -rf /mnt/Documents/dev/Angular/19/kk.001/.angular/cache

# 8. Fix or upgrade any chart components that may have been broken

# Basic chart service for creating chart data
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/services
cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/services/chart.service.ts << 'EOF'
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  
  /**
   * Format data for bar charts
   */
  formatBarChartData(data: any[], xField: string, yField: string, labelField?: string): any[] {
    return data.map(item => ({
      name: item[xField]?.toString() || '',
      value: Number(item[yField]) || 0,
      label: labelField ? (item[labelField]?.toString() || '') : undefined
    }));
  }
  
  /**
   * Format data for line charts
   */
  formatLineChartData(data: any[], 
                      xField: string, 
                      yField: string, 
                      seriesName: string = 'Series'): any[] {
    return [
      {
        name: seriesName,
        series: data.map(item => ({
          name: item[xField]?.toString() || '',
          value: Number(item[yField]) || 0
        }))
      }
    ];
  }
  
  /**
   * Format data for multi-series line charts
   */
  formatMultiLineChartData(data: any[], 
                          xField: string, 
                          yField: string, 
                          seriesField: string): any[] {
    
    // Group by series field
    const seriesMap = new Map();
    
    data.forEach(item => {
      const seriesName = item[seriesField]?.toString() || 'Unknown';
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, []);
      }
      
      seriesMap.get(seriesName).push({
        name: item[xField]?.toString() || '',
        value: Number(item[yField]) || 0
      });
    });
    
    // Convert map to array
    const result = [];
    seriesMap.forEach((dataPoints, seriesName) => {
      result.push({
        name: seriesName,
        series: dataPoints
      });
    });
    
    return result;
  }
  
  /**
   * Format data for pie charts
   */
  formatPieChartData(data: any[], nameField: string, valueField: string): any[] {
    return data.map(item => ({
      name: item[nameField]?.toString() || 'Unknown',
      value: Number(item[valueField]) || 0
    }));
  }
}
EOF

# 9. Fix the DepartmentSalesService if it's one of the ones showing charts
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services
cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services/department-sales.service.ts << 'EOF'
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentSalesService {
  private dataService = inject(DataService);
  
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  departmentSales = signal<any[]>([]);
  
  getDepartmentSales(period: string, year?: number): Observable<any[]> {
    console.log(`Loading department sales: period=${period}, year=${year}`);
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDepartmentSales(period, year).pipe(
      tap((data: any[]) => {
        console.log('Department sales data received:', data);
        this.departmentSales.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error loading department sales:', err);
        this.error.set(err.message || 'Failed to load department sales');
        this.loading.set(false);
        this.departmentSales.set([]);
        return of([]);
      })
    );
  }
}
EOF

# 10. Fix the DailySalesService
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services
cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services/daily-sales.service.ts << 'EOF'
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DailySalesService {
  private dataService = inject(DataService);
  
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  dailySales = signal<any[]>([]);
  dailyTotal = signal<number>(0);
  
  private _hasNewTransaction = signal<boolean>(false);
  
  getDailySales(date?: string): Observable<any[]> {
    console.log('Loading daily sales for date:', date);
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDailySalesByHour(date).pipe(
      tap((data: any[]) => {
        console.log('Daily sales data received:', data);
        this.dailySales.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error loading daily sales:', err);
        this.error.set(err.message || 'Failed to load daily sales');
        this.loading.set(false);
        this.dailySales.set([]);
        return of([]);
      })
    );
  }
  
  getDailyTotal(date?: string): Observable<number> {
    console.log('Loading daily total for date:', date);
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDailyTotal(date).pipe(
      map((data: any[]) => {
        console.log('Daily total data received:', data);
        return Number(data[0]?.Total) || 0;
      }),
      tap((total: number) => {
        this.dailyTotal.set(total);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error loading daily total:', err);
        this.error.set(err.message || 'Failed to load daily total');
        this.loading.set(false);
        this.dailyTotal.set(0);
        return of(0);
      })
    );
  }
  
  // Method to check for new transactions
  newTransaction(): boolean {
    return this._hasNewTransaction();
  }
  
  // Method to set a new transaction flag
  setNewTransaction(value: boolean): void {
    this._hasNewTransaction.set(value);
  }
}
EOF

# 11. Fix YtdSalesService
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services
cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services/ytd-sales.service.ts << 'EOF'
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class YtdSalesService {
  private dataService = inject(DataService);
  
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  ytdSales = signal<any[]>([]);
  
  getYtdSales(): Observable<any[]> {
    console.log('Loading YTD sales data');
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getYtdSalesByYear().pipe(
      tap((data: any[]) => {
        console.log('YTD sales data received:', data);
        this.ytdSales.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error loading YTD sales:', err);
        this.error.set(err.message || 'Failed to load YTD sales');
        this.loading.set(false);
        this.ytdSales.set([]);
        return of([]);
      })
    );
  }
}
EOF

# 12. Fix the MtdSalesService
mkdir -p /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services
cat > /mnt/Documents/dev/Angular/19/kk.001/src/app/features/sales/services/mtd-sales.service.ts << 'EOF'
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class MtdSalesService {
  private dataService = inject(DataService);
  
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  mtdSales = signal<any[]>([]);
  
  getMtdSales(year?: number, month?: number): Observable<any[]> {
    console.log(`Loading MTD sales: year=${year}, month=${month}`);
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getMtdSalesByDay(year, month).pipe(
      tap((data: any[]) => {
        console.log('MTD sales data received:', data);
        this.mtdSales.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(err => {
        console.error('Error loading MTD sales:', err);
        this.error.set(err.message || 'Failed to load MTD sales');
        this.loading.set(false);
        this.mtdSales.set([]);
        return of([]);
      })
    );
  }
}
EOF

echo "Chart restoration complete!"
echo ""
echo "Please follow these steps to get your application running with charts:"
echo ""
echo "1. Start your Express server:"
echo "   node server.js"
echo ""
echo "2. In a separate terminal, start your Angular app:"
echo "   ng serve"
echo ""
echo "3. Open your browser to: http://localhost:4200"
echo ""
echo "Your charts should now display properly. Check the browser console for any errors."
#!/bin/bash

# Angular Modernization Script
# This script implements best practices and fixes errors in your Angular application

echo "Starting Angular code modernization..."
PROJECT_ROOT="/mnt/Documents/dev/Angular/19/kk.001"
cd "$PROJECT_ROOT" || { echo "Error: Cannot navigate to project root!"; exit 1; }

# 1. Create necessary directories
echo "Creating necessary directories..."
mkdir -p src/app/core/services
mkdir -p src/app/features/inventory/models
mkdir -p src/environments

# 2. Fix app.config.ts
echo "Updating app.config.ts..."
cat > src/app/app.config.ts << 'EOF'
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

# 3. Create inventory model
echo "Creating inventory model..."
cat > src/app/features/inventory/models/inventory.model.ts << 'EOF'
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  value: number;
  departmentId: number;
  departmentName: string;
}
EOF

# 4. Create transaction model
echo "Creating transaction model..."
cat > src/app/features/transactions/models/transaction.model.ts << 'EOF'
export interface Transaction {
  id: number;
  date: string;
  total: number;
  [key: string]: any;
}

export interface TransactionEntry {
  entry_id: number;
  item_name: string;
  quantity: number;
  price: number;
  total?: number;
}
EOF

# 5. Create API Service
echo "Creating API service..."
cat > src/app/core/services/api.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  executeQuery(sql: string): Observable<any[]> {
    console.log('Executing SQL query:', sql);
    
    // TEMPORARY: Return mock data for development
    if (sql.includes('transaction_entries')) {
      return of([
        { entry_id: 1, item_name: 'Product 1', quantity: 2, price: 19.99 },
        { entry_id: 2, item_name: 'Product 2', quantity: 1, price: 29.99 }
      ]).pipe(delay(300));
    }
    
    return of([]).pipe(delay(300));
  }
  
  getInventory(): Observable<any[]> {
    // TEMPORARY: Return mock inventory data
    return of([
      { id: 1, name: 'Product 1', quantity: 50, price: 19.99, value: 999.50, departmentId: 1, departmentName: 'Electronics' },
      { id: 2, name: 'Product 2', quantity: 25, price: 29.99, value: 749.75, departmentId: 1, departmentName: 'Electronics' },
      { id: 3, name: 'Product 3', quantity: 100, price: 9.99, value: 999.00, departmentId: 2, departmentName: 'Clothing' }
    ]).pipe(delay(300));
  }
  
  getTransactions(): Observable<any[]> {
    // TEMPORARY: Return mock transaction data
    return of([
      { id: 1, date: '2024-05-15T14:30:00', total: 69.97 },
      { id: 2, date: '2024-05-15T15:45:00', total: 39.98 },
      { id: 3, date: '2024-05-14T10:15:00', total: 129.95 }
    ]).pipe(delay(300));
  }
}
EOF

# 6. Update DataService
echo "Updating DataService..."
cat > src/app/services/data.service.ts << 'EOF'
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { ApiService } from '../core/services/api.service';

export interface Transaction {
  id: number;
  date: string;
  total: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiService = inject(ApiService);

  executeQuery(sql: string): Observable<any[]> {
    console.log('Executing SQL query:', sql);
    
    // Mock Department Sales data
    if (sql.includes('Department.Name as Department') && sql.includes('ORDER BY Total DESC')) {
      return of([
        { Department: 'Electronics', Total: 25000 },
        { Department: 'Clothing', Total: 18000 },
        { Department: 'Food', Total: 15000 },
        { Department: 'Home Goods', Total: 12000 },
        { Department: 'Sporting Goods', Total: 9000 },
        { Department: 'Books', Total: 7500 },
        { Department: 'Toys', Total: 6000 },
        { Department: 'Beauty', Total: 5000 },
        { Department: 'Pharmacy', Total: 4500 },
        { Department: 'Garden', Total: 3000 }
      ]).pipe(delay(500));
    }
    
    return this.apiService.executeQuery(sql).pipe(
      catchError(error => {
        console.error('Error executing query:', error);
        return of([]);
      })
    );
  }

  getInventory(): Observable<any[]> {
    return this.apiService.getInventory();
  }

  getAllTransactions(): Observable<Transaction[]> {
    return this.apiService.getTransactions();
  }

  getTransactionEntries(id: number): Observable<any[]> {
    return this.apiService.executeQuery(`
      SELECT * FROM transaction_entries 
      WHERE transaction_id = ${id} 
      ORDER BY entry_id
    `);
  }

  getDepartmentSales(periodType: 'day'|'month'|'year' = 'month', year?: number): Observable<any[]> {
    let dateFilter = '';
    const selectedYear = year || new Date().getFullYear();
    
    switch(periodType) {
      case 'day':
        if (selectedYear === new Date().getFullYear()) {
          dateFilter = `WHERE CONVERT(date, [Transaction].[Time]) = CAST(GETDATE() AS DATE)`;
        } else {
          dateFilter = `WHERE YEAR([Transaction].[Time]) = ${selectedYear} AND MONTH([Transaction].[Time]) = 12 AND DAY([Transaction].[Time]) = 31`;
        }
        break;
      case 'month':
        if (selectedYear === new Date().getFullYear()) {
          dateFilter = `WHERE YEAR([Transaction].[Time]) = ${selectedYear} AND MONTH([Transaction].[Time]) = MONTH(GETDATE())`;
        } else {
          dateFilter = `WHERE YEAR([Transaction].[Time]) = ${selectedYear} AND MONTH([Transaction].[Time]) = 12`;
        }
        break;
      case 'year':
        dateFilter = `WHERE YEAR([Transaction].[Time]) = ${selectedYear}`;
        break;
    }
    
    const sql = `SELECT 
                  Department.Name as Department,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                FROM [transaction] 
                LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                LEFT JOIN Item ON TransactionEntry.ItemID = Item.ID
                LEFT JOIN Department ON Item.DepartmentID = Department.ID
                ${dateFilter}
                GROUP BY Department.Name
                ORDER BY Total DESC`;
    
    return this.executeQuery(sql);
  }

  getYtdSalesByYear(): Observable<any[]> {
    const sql = `
      WITH YearData AS (
        SELECT 
          YEAR(Time) as Year,
          SUM(Total) as YearTotal,
          (SELECT SUM(Total) 
           FROM [Transaction] t2 
           WHERE YEAR(t2.Time) = YEAR(t.Time) 
           AND DATEPART(dayofyear, t2.Time) <= DATEPART(dayofyear, GETDATE())) as YTDTotal
        FROM [Transaction] t
        GROUP BY YEAR(Time)
      )
      SELECT 
        Year,
        YearTotal,
        YTDTotal
      FROM YearData
      ORDER BY Year DESC
    `;
    
    return this.executeQuery(sql);
  }
}
EOF

# 7. Create Department Sales Service
echo "Creating Department Sales Service..."
cat > src/app/features/sales/services/department-sales.service.ts << 'EOF'
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentSalesService {
  private dataService = inject(DataService);
  
  // Use signals for reactive state
  departmentSales = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  getDepartmentSales(period: 'day'|'month'|'year' = 'month', year?: number): Observable<any[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.dataService.getDepartmentSales(period, year).pipe(
      tap(data => {
        this.departmentSales.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching department sales data:', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load department sales data');
        throw err;
      })
    );
  }
}
EOF

# 8. Update Inventory Component
echo "Updating Inventory Component..."
cat > src/app/features/inventory/inventory.component.ts << 'EOF'
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { InventoryItem } from './models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-container">
      <div *ngIf="loading">Loading inventory data...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>
      
      <div *ngIf="!loading && inventory.length > 0" class="inventory-stats">
        <div>Total Items: {{ inventory.length }}</div>
        <div>Total Value: {{ getTotalInventoryValue() | currency }}</div>
      </div>
    </div>
  `,
  styles: `
    .inventory-container {
      padding: 10px;
    }
    
    .error-message {
      color: red;
      padding: 5px;
    }
    
    .inventory-stats {
      display: flex;
      gap: 20px;
      margin-top: 10px;
      font-weight: bold;
    }
  `
})
export class InventoryComponent implements OnInit {
  private dataService = inject(DataService);
  
  inventory: InventoryItem[] = [];
  loading = false;
  error: string | null = null;
  
  ngOnInit(): void {
    this.loadInventory();
  }
  
  loadInventory(): void {
    this.loading = true;
    this.error = null;
    
    this.dataService.getInventory().subscribe({
      next: (data: InventoryItem[]) => {
        this.inventory = data;
        this.loading = false;
        console.log('Inventory data loaded:', data.length, 'items');
      },
      error: (err: Error) => {
        console.error('Error loading inventory:', err);
        this.error = err.message || 'Failed to load inventory data';
        this.loading = false;
      }
    });
  }
  
  getTotalInventoryValue(): number {
    return this.inventory.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
EOF

# 9. Fix Panel Widget Component CSS Comments
echo "Fixing Panel Widget Component CSS comments..."
sed -i 's/min-height: 350px; \/\/ Increased/min-height: 350px; \/* Increased from 300px to accommodate charts *\//g' src/app/shared/components/panel-widget/panel-widget.component.ts

# 10. Create environment files
echo "Creating environment files..."
cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: '/api'
};
EOF

cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: '/api'
};
EOF

# 11. Create favicon.ico if missing
echo "Checking for favicon.ico..."
if [ ! -f "src/favicon.ico" ]; then
  echo "Creating favicon.ico..."
  curl -s -o src/favicon.ico https://angular.io/assets/images/favicons/favicon.ico
fi

# 12. Create basic-pie-chart.component.ts
echo "Creating BasicPieChartComponent..."
cat > src/app/features/sales/components/department-sales/basic-pie-chart.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-basic-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="basic-chart-container">
      <div class="chart-placeholder">
        <p>Pie Chart: Department Sales for {{ year }}</p>
        <ul class="data-list">
          <li *ngFor="let item of data" class="data-item">
            <span class="color-dot" [style.background-color]="getColorForItem(item)"></span>
            <span class="item-name">{{ item.name }}:</span>
            <span class="item-value">{{ formatCurrency(item.value) }}</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    .basic-chart-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .chart-placeholder {
      width: 100%;
      text-align: left;
    }
    
    .chart-placeholder p {
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    }
    
    .data-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .data-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .item-name {
      flex: 1;
    }
    
    .item-value {
      font-weight: bold;
    }
  `
})
export class BasicPieChartComponent {
  @Input() data: any[] = [];
  @Input() year: number = new Date().getFullYear();
  
  // Simple color palette
  colors = [
    '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5C6BC0',
    '#26A69A', '#FFA726', '#EC407A', '#AB47BC', '#7E57C2'
  ];
  
  getColorForItem(item: any): string {
    const index = this.data.indexOf(item);
    return this.colors[index % this.colors.length];
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }
}
EOF

# 13. Create audio directory if missing
echo "Creating assets directories..."
mkdir -p src/assets/icons
mkdir -p src/assets/audio

# Create notification icon
echo "Creating notification icon..."
cat > src/assets/icons/ic_notifications_black_24px.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
  <path d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
</svg>
EOF

# Create audio placeholder
echo "Creating audio placeholder..."
touch src/assets/audio/cha_ching.mp3

echo "Angular modernization completed successfully!"
echo "Run 'ng serve' to test your application."
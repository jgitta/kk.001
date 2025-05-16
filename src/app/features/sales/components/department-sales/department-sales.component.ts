import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DepartmentSalesService } from '../../services/department-sales.service';
import { PanelWidgetComponent } from '../../../../shared/components/panel-widget/panel-widget.component';

@Component({
  selector: 'app-department-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelWidgetComponent],
  template: `
    <app-panel-widget title="Department Sales" [fixedHeight]="true">
      <div class="department-controls">
        <div class="period-selector">
          <label for="period">Period:</label>
          <select id="period" [(ngModel)]="selectedPeriod" (change)="loadData()">
            <option value="day">Today</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading-indicator">
        Loading department sales data...
      </div>
      
      <div *ngIf="error" class="error-message">
        Error: {{ error }}
      </div>
      
      <div class="pie-chart-container" *ngIf="!loading && !error">
        <!-- Legend -->
        <div class="chart-legend">
          <div *ngFor="let dept of departmentSales; let i = index" class="legend-item">
            <div class="color-box" [style.background-color]="getColor(i)"></div>
            <div class="legend-text">
              <span class="dept-name">{{ dept.Department }}</span>
              <span class="dept-value">{{ formatCurrency(dept.Total) }}</span>
            </div>
          </div>
          
          <div *ngIf="departmentSales.length === 0" class="no-data">
            No sales data available for this period.
          </div>
        </div>
        
        <!-- Pie Chart -->
        <div class="pie-chart" *ngIf="departmentSales.length > 0">
          <div class="pie">
            <div *ngFor="let slice of pieSlices; let i = index" 
                 class="slice" 
                 [style.transform]="slice.transform"
                 [style.background-color]="getColor(i)">
            </div>
          </div>
          <div class="total-value">
            {{ formatCurrency(totalSales) }}
          </div>
        </div>
      </div>
    </app-panel-widget>
  `,
  styles: `
    .department-controls {
      margin-bottom: 10px;
      display: flex;
      justify-content: flex-end;
    }
    
    .period-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    select {
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-size: 12px;
    }
    
    .loading-indicator, .error-message, .no-data {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: #666;
      font-style: italic;
      font-size: 13px;
    }
    
    .error-message {
      color: #d32f2f;
    }
    
    .pie-chart-container {
      display: flex;
      height: 100%;
    }
    
    .chart-legend {
      flex: 1;
      overflow-y: auto;
      padding-right: 10px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .color-box {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 6px;
      flex-shrink: 0;
    }
    
    .legend-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .dept-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .dept-value {
      color: #666;
    }
    
    .pie-chart {
      width: 150px;
      height: 150px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .pie {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .slice {
      position: absolute;
      width: 100%;
      height: 100%;
      transform-origin: center;
    }
    
    .total-value {
      position: absolute;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      width: 60%;
      height: 60%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
      font-size: 12px;
    }
  `
})
export class DepartmentSalesComponent implements OnInit, OnDestroy {
  selectedPeriod: 'day' | 'month' | 'year' = 'month';
  loading = false;
  error: string | null = null;
  departmentSales: any[] = [];
  pieSlices: { transform: string }[] = [];
  totalSales: number = 0;
  
  private subscription: Subscription | null = null;
  
  // Chart colors
  private colors: string[] = [
    '#4285F4', '#34A853', '#FBBC05', '#EA4335', 
    '#673AB7', '#3F51B5', '#2196F3', '#03A9F4',
    '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
    '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
  ];
  
  constructor(private departmentSalesService: DepartmentSalesService) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  loadData(): void {
    this.loading = true;
    this.error = null;
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    this.subscription = this.departmentSalesService.getDepartmentSales(this.selectedPeriod).subscribe({
      next: (data) => {
        // Sort by total sales in descending order
        this.departmentSales = data.sort((a, b) => Number(b.Total) - Number(a.Total)).slice(0, 10);
        this.calculateTotalSales();
        this.calculatePieSlices();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading department sales:', err);
        this.error = err.message || 'Failed to load department sales data';
        this.loading = false;
      }
    });
  }
  
  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }
  
  formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue || 0);
  }
  
  calculateTotalSales(): void {
    this.totalSales = this.departmentSales.reduce((sum, dept) => sum + Number(dept.Total), 0);
  }
  
  calculatePieSlices(): void {
    this.pieSlices = [];
    
    if (this.departmentSales.length === 0 || this.totalSales === 0) {
      return;
    }
    
    let cumulativeAngle = 0;
    
    this.departmentSales.forEach(dept => {
      const percentage = Number(dept.Total) / this.totalSales;
      const angle = percentage * 360;
      
      this.pieSlices.push({
        transform: `rotate(${cumulativeAngle}deg) skew(${90 - angle}deg)`
      });
      
      cumulativeAngle += angle;
    });
  }
}

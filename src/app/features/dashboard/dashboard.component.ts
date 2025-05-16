import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelWidgetComponent } from '../../shared/components/panel-widget/panel-widget.component';
import { DailySalesComponent } from '../sales/components/daily-sales/daily-sales.component';
import { YtdSalesComponent } from '../sales/components/ytd-sales/ytd-sales.component';
import { MtdSalesComponent } from '../sales/components/mtd-sales/mtd-sales.component';
import { DepartmentSalesComponent } from '../sales/components/department-sales/department-sales.component';
import { TransactionsComponent } from '../transactions/transactions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DailySalesComponent,
    YtdSalesComponent,
    MtdSalesComponent,
    DepartmentSalesComponent,
    TransactionsComponent
  ],
  template: `
    <div class="dashboard-header">
      <h1>Sales Dashboard</h1>
    </div>
    
    <div class="dashboard-container">
      <div class="dashboard-grid">
        <!-- Sales Charts Row -->
        <div class="chart-item">
          <app-daily-sales></app-daily-sales>
        </div>
        <div class="chart-item">
          <app-department-sales></app-department-sales>
        </div>
        <div class="chart-item">
          <app-mtd-sales></app-mtd-sales>
        </div>
        <div class="chart-item">
          <app-ytd-sales></app-ytd-sales>
        </div>
        
        <!-- Data Tables Row -->
        <div class="chart-item grid-col-span-4">
          <app-transactions></app-transactions>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-header {
      background-color: #3f51b5;
      color: white;
      padding: 12px 20px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .dashboard-header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .dashboard-container {
      padding: 15px;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    
    .chart-item {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      min-height: 300px;
      overflow: hidden;
    }
    
    .grid-col-span-2 {
      grid-column: span 2;
    }
    
    .grid-col-span-4 {
      grid-column: span 4;
    }
    
    /* Responsive adjustments */
    @media (max-width: 1400px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .grid-col-span-4 {
        grid-column: span 2;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      
      .grid-col-span-2, .grid-col-span-4 {
        grid-column: span 1;
      }
    }
  `
})
export class DashboardComponent {}

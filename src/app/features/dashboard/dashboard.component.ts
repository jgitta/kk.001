import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelWidgetComponent } from '../../shared/components/panel-widget/panel-widget.component';
import { DailySalesComponent } from '../sales/components/daily-sales/daily-sales.component';
import { YtdSalesComponent } from '../sales/components/ytd-sales/ytd-sales.component';
import { MtdSalesComponent } from '../sales/components/mtd-sales/mtd-sales.component';
import { DepartmentSalesComponent } from '../sales/components/department-sales/department-sales.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { TransactionsComponent } from '../transactions/transactions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PanelWidgetComponent,
    DailySalesComponent,
    YtdSalesComponent,
    MtdSalesComponent,
    DepartmentSalesComponent,
    InventoryComponent,
    TransactionsComponent
  ],
  template: `
    <div class="dashboard-header">
      <h1>K&K Dashboard</h1>
    </div>
    
    <div class="dashboard-container">
      <div class="row">
        <div class="col">
          <app-panel-widget title="YTD" [fixedHeight]="true">
            <app-ytd-sales></app-ytd-sales>
          </app-panel-widget>
        </div>
        <div class="col">
          <app-panel-widget title="Today's Sales" [fixedHeight]="true">
            <app-daily-sales></app-daily-sales>
          </app-panel-widget>
        </div>
        <div class="col">
          <app-panel-widget title="MTD" [fixedHeight]="true">
            <app-mtd-sales></app-mtd-sales>
          </app-panel-widget>
        </div>
      </div>
      
      <div class="row">
        <div class="col">
          <app-panel-widget title="Inventory" [fixedHeight]="true">
            <app-inventory></app-inventory>
          </app-panel-widget>
        </div>
        <div class="col">
          <app-panel-widget title="Transactions" [fixedHeight]="true">
            <app-transactions></app-transactions>
          </app-panel-widget>
        </div>
        <div class="col">
          <app-panel-widget title="Sales by Department (Top 10)" [fixedHeight]="true">
            <app-department-sales></app-department-sales>
          </app-panel-widget>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-header {
      background-color: #3f51b5;
      color: white;
      padding: 16px 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    
    .dashboard-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .dashboard-container {
      padding: 0 16px 16px 16px;
    }
    
    .row {
      display: flex;
      flex-wrap: wrap;
      margin: -0.5rem;
      margin-bottom: 1rem;
    }
    
    .col {
      flex: 1 1 calc(33.333% - 1rem);
      min-width: 300px;
      padding: 0.5rem;
    }
    
    @media (max-width: 1200px) {
      .col {
        flex: 1 1 calc(50% - 1rem);
      }
    }
    
    @media (max-width: 768px) {
      .col {
        flex: 1 1 100%;
      }
    }

    .panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 10px;
      min-height: 450px; /* Increased height */
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-content {
      padding: 15px;
      flex: 1;
      overflow: hidden;  /* Prevent scrollbars */
      display: flex;
      flex-direction: column;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      grid-gap: 20px;
      grid-auto-rows: minmax(400px, auto); /* Increase this value from your current setting */
    }
  `
})
export class DashboardComponent {}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfitMarginService } from '../../services/profit-margin.service';

@Component({
  selector: 'app-profit-margin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profit-margin-container">
      <div *ngIf="profitMarginService.loading()" class="loading">Loading profit data...</div>
      <div *ngIf="profitMarginService.error()" class="error-message">{{ profitMarginService.error() }}</div>
      
      <div *ngIf="!profitMarginService.loading() && profitMarginService.profitByDepartment().length > 0" class="profit-table">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Sales</th>
              <th>Cost</th>
              <th>Profit</th>
              <th>Margin %</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dept of profitMarginService.profitByDepartment()">
              <td>{{ dept.Department }}</td>
              <td>{{ dept.Sales | currency }}</td>
              <td>{{ dept.Cost | currency }}</td>
              <td>{{ dept.Profit | currency }}</td>
              <td [ngClass]="{'negative': dept.MarginPercent < 0}">
                {{ dept.MarginPercent | number:'1.1-1' }}%
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{{ totalSales() | currency }}</strong></td>
              <td><strong>{{ totalCost() | currency }}</strong></td>
              <td><strong>{{ totalProfit() | currency }}</strong></td>
              <td [ngClass]="{'negative': totalMargin() < 0}">
                <strong>{{ totalMargin() | number:'1.1-1' }}%</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  styles: \`
    .profit-margin-container {
      width: 100%;
      overflow-x: auto;
    }
    
    .loading, .error-message {
      padding: 10px;
      text-align: center;
    }
    
    .error-message {
      color: red;
    }
    
    .profit-table {
      width: 100%;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 8px;
      text-align: right;
      border-bottom: 1px solid #ddd;
    }
    
    th:first-child, td:first-child {
      text-align: left;
    }
    
    thead th {
      background-color: #f5f5f5;
    }
    
    .negative {
      color: red;
    }
  \`
})
export class ProfitMarginComponent implements OnInit {
  profitMarginService = inject(ProfitMarginService);
  
  ngOnInit(): void {
    this.loadProfitData();
  }
  
  loadProfitData(): void {
    this.profitMarginService.getProfitMarginByDepartment('month').subscribe();
  }
  
  totalSales(): number {
    return this.profitMarginService.profitByDepartment().reduce((sum, dept) => sum + Number(dept.Sales), 0);
  }
  
  totalCost(): number {
    return this.profitMarginService.profitByDepartment().reduce((sum, dept) => sum + Number(dept.Cost), 0);
  }
  
  totalProfit(): number {
    return this.profitMarginService.profitByDepartment().reduce((sum, dept) => sum + Number(dept.Profit), 0);
  }
  
  totalMargin(): number {
    const sales = this.totalSales();
    const profit = this.totalProfit();
    return sales > 0 ? (profit / sales * 100) : 0;
  }
}

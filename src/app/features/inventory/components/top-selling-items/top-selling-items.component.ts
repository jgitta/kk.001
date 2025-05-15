import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopSellingItemsService } from '../../services/top-selling-items.service';

@Component({
  selector: 'app-top-selling-items',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-selling-container">
      <div *ngIf="topSellingService.loading()" class="loading">Loading top selling items...</div>
      <div *ngIf="topSellingService.error()" class="error-message">{{ topSellingService.error() }}</div>
      
      <div *ngIf="!topSellingService.loading() && topSellingService.topItems().length > 0" class="items-list">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty Sold</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of topSellingService.topItems(); let i = index" [class.odd]="i % 2 === 1">
              <td>{{ item.Description }}</td>
              <td>{{ item.QuantitySold }}</td>
              <td>{{ item.TotalSales | currency }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: \`
    .top-selling-container {
      width: 100%;
      height: 100%;
    }
    
    .loading, .error-message {
      padding: 10px;
      text-align: center;
    }
    
    .error-message {
      color: red;
    }
    
    .items-list {
      width: 100%;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 6px 8px;
      text-align: right;
    }
    
    th:first-child, td:first-child {
      text-align: left;
    }
    
    th {
      background-color: #f5f5f5;
      font-size: 0.9rem;
    }
    
    .odd {
      background-color: #f9f9f9;
    }
  \`
})
export class TopSellingItemsComponent implements OnInit {
  topSellingService = inject(TopSellingItemsService);
  
  ngOnInit(): void {
    this.loadTopSellingItems();
  }
  
  loadTopSellingItems(): void {
    this.topSellingService.getTopSellingItems(10, 'month').subscribe();
  }
}

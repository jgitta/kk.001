import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from './services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-container">
      <h3>Inventory</h3>
      
      <div *ngIf="inventoryService.loading()" class="loading">
        Loading inventory data...
      </div>
      
      <div *ngIf="inventoryService.error()" class="error">
        {{ inventoryService.error() }}
      </div>
      
      <table *ngIf="!inventoryService.loading() && !inventoryService.error()">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of inventoryService.inventory()">
            <td>{{ item.ID }}</td>
            <td>{{ item.Name }}</td>
            <td>{{ item.Price | currency }}</td>
            <td>{{ item.Quantity }}</td>
            <td>{{ item.Department || 'Uncategorized' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .inventory-container {
      height: 100%;
      overflow: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    .loading {
      padding: 16px;
      text-align: center;
      color: #666;
    }
    
    .error {
      padding: 16px;
      color: red;
      background: #ffecec;
      border: 1px solid #f5aca6;
      border-radius: 4px;
    }
  `
})
export class InventoryComponent implements OnInit {
  inventoryService = inject(InventoryService);
  
  ngOnInit(): void {
    this.inventoryService.getInventory().subscribe();
  }
}

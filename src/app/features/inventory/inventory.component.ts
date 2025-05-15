import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

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
  inventory: any[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    this.loadInventory();
  }
  
  loadInventory(): void {
    this.loading = true;
    this.error = null;
    
    this.dataService.getInventory().subscribe({
      next: (data) => {
        this.inventory = data;
        this.loading = false;
        console.log('Inventory data loaded:', data.length, 'items');
      },
      error: (err) => {
        console.error('Error loading inventory:', err);
        this.error = `Failed to load inventory data: ${err.message}`;
        this.loading = false;
      }
    });
  }
  
  getTotalInventoryValue(): number {
    return this.inventory.reduce((sum, item) => {
      return sum + (item.Price * item.Quantity);
    }, 0);
  }
}

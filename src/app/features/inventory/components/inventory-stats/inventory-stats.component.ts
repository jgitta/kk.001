import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryStatsService } from '../../services/inventory-stats.service';

@Component({
  selector: 'app-inventory-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-stats-container">
      <div *ngIf="inventoryStatsService.loading()" class="loading">Loading inventory stats...</div>
      <div *ngIf="inventoryStatsService.error()" class="error-message">{{ inventoryStatsService.error() }}</div>
      
      <div *ngIf="!inventoryStatsService.loading() && hasStats()" class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">Total Items</div>
          <div class="stat-value">{{ inventoryStatsService.stats().TotalItems || 0 }}</div>
        </div>
        
        <div class="stat-box">
          <div class="stat-label">Total Inventory</div>
          <div class="stat-value">{{ inventoryStatsService.stats().TotalInventory || 0 }}</div>
        </div>
        
        <div class="stat-box">
          <div class="stat-label">Inventory Value</div>
          <div class="stat-value">{{ inventoryStatsService.stats().TotalValue | currency }}</div>
        </div>
        
        <div class="stat-box warning">
          <div class="stat-label">Out of Stock</div>
          <div class="stat-value">{{ inventoryStatsService.stats().OutOfStock || 0 }}</div>
        </div>
      </div>
    </div>
  `,
  styles: \`
    .inventory-stats-container {
      width: 100%;
    }
    
    .loading, .error-message {
      padding: 10px;
      text-align: center;
    }
    
    .error-message {
      color: red;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .stat-box {
      background-color: #f5f7f9;
      border-radius: 4px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .warning {
      background-color: #fff4e5;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 500;
    }
  \`
})
export class InventoryStatsComponent implements OnInit {
  inventoryStatsService = inject(InventoryStatsService);
  
  ngOnInit(): void {
    this.loadInventoryStats();
  }
  
  loadInventoryStats(): void {
    this.inventoryStatsService.getInventoryStats().subscribe();
  }
  
  hasStats(): boolean {
    return Object.keys(this.inventoryStatsService.stats()).length > 0;
  }
}

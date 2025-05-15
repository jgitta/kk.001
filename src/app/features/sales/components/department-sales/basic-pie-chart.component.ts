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

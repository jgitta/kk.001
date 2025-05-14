import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { YtdSalesService } from '../../services/ytd-sales.service';

@Component({
  selector: 'app-ytd-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="ytd-container">
      <h3>Year-to-Date: {{ ytdSalesService.ytdTotal() | currency }}</h3>
      <div class="chart-container">
        <ngx-charts-bar-vertical
          [view]="[300, 200]"
          [results]="chartData"
          [xAxis]="true"
          [yAxis]="true"
          [legend]="false"
          [showXAxisLabel]="true"
          [showYAxisLabel]="false"
          xAxisLabel="Month"
          [xAxisTickFormatting]="formatMonthLabel">
        </ngx-charts-bar-vertical>
      </div>
    </div>
  `,
  styles: `
    .ytd-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .chart-container {
      flex-grow: 1;
    }
  `
})
export class YtdSalesComponent implements OnInit {
  ytdSalesService = inject(YtdSalesService);
  chartData: any[] = [];
  
  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.ytdSalesService.getYtdSales(currentYear).subscribe(data => {
      this.chartData = data.map(item => ({
        name: this.getMonthName(item.Month),
        value: item.Total
      }));
    });
  }
  
  formatMonthLabel(value: number): string {
    return this.getMonthName(value);
  }
  
  getMonthName(month: number): string {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1];
  }
}

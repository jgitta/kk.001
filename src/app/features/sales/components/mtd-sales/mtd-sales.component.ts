import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MtdSalesService } from '../../services/mtd-sales.service';

@Component({
  selector: 'app-mtd-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="mtd-container">
      <h3>Month-to-Date: {{ mtdSalesService.mtdTotal() | currency }}</h3>
      <div class="chart-container">
        <ngx-charts-line-chart
          [view]="[300, 200]"
          [results]="[{name: 'Daily Sales', series: chartData}]"
          [xAxis]="true"
          [yAxis]="true"
          [legend]="false"
          [showXAxisLabel]="true"
          [showYAxisLabel]="false"
          xAxisLabel="Day">
        </ngx-charts-line-chart>
      </div>
    </div>
  `,
  styles: `
    .mtd-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .chart-container {
      flex-grow: 1;
    }
  `
})
export class MtdSalesComponent implements OnInit {
  mtdSalesService = inject(MtdSalesService);
  chartData: any[] = [];
  
  ngOnInit(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    this.mtdSalesService.getMtdSales(currentYear, currentMonth).subscribe(data => {
      this.chartData = data.map(item => ({
        name: item.Day.toString(),
        value: item.Total
      }));
    });
  }
}

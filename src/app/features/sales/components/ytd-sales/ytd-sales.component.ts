import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../../services/data.service';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-ytd-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="ytd-sales-container">
      <div *ngIf="loading" class="loading">Loading YTD data...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>
      
      <!-- Chart Container -->
      <div *ngIf="!loading && !error && chartData.length > 0" class="chart-container">
        <ngx-charts-bar-vertical-2d
          [view]="[340, 240]"
          [scheme]="colorScheme"
          [results]="chartData"
          [gradient]="true"
          [xAxis]="true"
          [yAxis]="true"
          [legend]="true"
          [legendPosition]="LegendPosition.Below"
          [showXAxisLabel]="true"
          [showYAxisLabel]="true"
          [xAxisLabel]="'Year'"
          [yAxisLabel]="'Sales ($)'"
          [showDataLabel]="false"
          [barPadding]="5"
          [groupPadding]="20"
          [roundDomains]="true"
          [trimXAxisTicks]="false"
          [maxXAxisTickLength]="16"
          [yAxisTickFormatting]="formatYAxisTicks">
        </ngx-charts-bar-vertical-2d>
      </div>
    </div>
  `,
  styles: `
    .ytd-sales-container {
      height: 100%;
      width: 100%;
    }
    
    .loading, .error-message {
      padding: 10px;
      text-align: center;
    }
    
    .error-message {
      color: red;
    }
    
    .chart-container {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `
})
export class YtdSalesComponent implements OnInit {
  private dataService = inject(DataService);
  
  loading = false;
  error: string | null = null;
  
  // Make LegendPosition available in the template
  LegendPosition = LegendPosition;
  
  // Updated chart configuration
  chartData: any[] = [];
  colorScheme: Color = {
    name: 'salesChart',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28']
  };
  
  ngOnInit(): void {
    this.loadYtdSalesData();
  }
  
  loadYtdSalesData(): void {
    this.loading = true;
    this.error = null;
    
    this.dataService.getYtdSalesByYear().subscribe({
      next: (data) => {
        this.formatChartData(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading YTD sales data:', err);
        this.error = 'Failed to load YTD sales data';
        this.loading = false;
      }
    });
  }
  
  formatChartData(data: any[]): void {
    // Take only the last 3 years to avoid overcrowding
    const recentData = data.slice(0, 3);
    
    // Format data for ngx-charts bar chart
    const formattedData = [
      {
        name: 'YTD',
        series: recentData.map(item => ({
          name: item.Year.toString(),
          value: item.YTDTotal || 0
        }))
      },
      {
        name: 'Full Year',
        series: recentData.map(item => ({
          name: item.Year.toString(),
          value: item.YearTotal || 0
        }))
      }
    ];
    
    this.chartData = formattedData;
  }
  
  // Format large numbers as currency with abbreviated values
  formatYAxisTicks(val: number): string {
    if (val >= 1000000) {
      return '$' + (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return '$' + (val / 1000).toFixed(1) + 'K';
    }
    return '$' + val;
  }
}

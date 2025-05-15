import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentSalesService } from '../../services/department-sales.service';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-department-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="department-sales-container">
      <div *ngIf="departmentSalesService.loading()" class="loading">Loading department sales...</div>
      <div *ngIf="departmentSalesService.error()" class="error-message">{{ departmentSalesService.error() }}</div>
      
      <div *ngIf="!departmentSalesService.loading() && chartData.length > 0" class="chart-container">
        <ngx-charts-pie-chart
          [view]="[320, 230]"
          [scheme]="colorScheme"
          [results]="chartData"
          [gradient]="true"
          [legend]="true"
          [legendPosition]="LegendPosition.Below"
          [legendTitle]="''"
          [labels]="false"
          [trimLabels]="false"
          [maxLabelLength]="12"
          [doughnut]="true"
          [animations]="false"> <!-- Disable animations -->
        </ngx-charts-pie-chart>
      </div>
    </div>
  `,
  styles: `
    .department-sales-container {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .loading, .error-message {
      padding: 10px;
      text-align: center;
    }
    
    .error-message {
      color: red;
    }
    
    .chart-container {
      flex: 1;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: hidden;
      margin-top: -10px; /* Pull chart up slightly to make room for legend */
    }

    /* These styles target the NGX Charts component to make legend items smaller */
    ::ng-deep .chart-legend .legend-labels {
      text-align: left !important;
      max-height: 170px !important;
      overflow-y: auto;
      white-space: nowrap;
      width: 100%;
      margin-top: 8px;
    }

    ::ng-deep .chart-legend .legend-label-text {
      font-size: 11px !important;
      margin-left: 2px;
    }

    ::ng-deep .chart-legend .legend-labels-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    ::ng-deep .chart-legend .legend-label {
      margin-right: 6px !important;
      margin-bottom: 3px !important;
    }
  `
})
export class DepartmentSalesComponent implements OnInit {
  departmentSalesService = inject(DepartmentSalesService);
  LegendPosition = LegendPosition;
  
  chartData: any[] = [];
  colorScheme: Color = {
    name: 'vivid',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5C6BC0', 
      '#26A69A', '#FFA726', '#EC407A', '#AB47BC', '#7E57C2'
    ]
  };
  
  ngOnInit(): void {
    this.loadDepartmentSales();
  }
  
  loadDepartmentSales(): void {
    this.departmentSalesService.getDepartmentSales('month').subscribe({
      next: () => this.formatChartData()
    });
  }
  
  formatChartData(): void {
    this.chartData = this.departmentSalesService.departmentSales()
      .slice(0, 10)
      .map(dept => ({
        name: dept.Department || 'Unknown',
        value: Number(dept.Total) || 0
      }));
  }
}

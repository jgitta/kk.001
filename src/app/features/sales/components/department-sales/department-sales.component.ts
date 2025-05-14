import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DepartmentSalesService } from '../../services/department-sales.service';

@Component({
  selector: 'app-department-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="dept-container">
      <h3>Sales by Department</h3>
      <div class="chart-container">
        <ngx-charts-pie-chart
          [view]="[300, 200]"
          [results]="chartData"
          [legend]="true"
          [labels]="true"
          [doughnut]="true">
        </ngx-charts-pie-chart>
      </div>
    </div>
  `,
  styles: `
    .dept-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .chart-container {
      flex-grow: 1;
    }
  `
})
export class DepartmentSalesComponent implements OnInit {
  private departmentSalesService = inject(DepartmentSalesService);
  chartData: any[] = [];
  
  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.departmentSalesService.getDepartmentSales(currentYear).subscribe(data => {
      this.chartData = data.map(item => ({
        name: item.Department || 'Uncategorized',
        value: item.Total
      }));
    });
  }
}

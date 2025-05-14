import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DailySalesService } from '../../services/daily-sales.service';
import { Sale } from '../../../../models/sale.model';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-daily-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="daily-sales-container">
      <div class="header">
        <h3>Today's Sales: {{ dailySalesService.dailyTotal() | currency }}</h3>
        <div class="controls">
          <button (click)="toggleMute()" class="mute-btn">
            <img [src]="muteSrc()" alt="Mute/Unmute" width="24">
          </button>
        </div>
      </div>
      
      <div class="chart-container">
        <ngx-charts-gauge
          [view]="[300, 250]"
          [results]="chartData()"
          [min]="0"
          [max]="upperLimit"
          [angleSpan]="240"
          [startAngle]="-120"
          [units]="'Sales'"
          [bigSegments]="10"
          [smallSegments]="5"
          [showAxis]="true">
        </ngx-charts-gauge>
      </div>
    </div>
  `,
  styles: `
    .daily-sales-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .chart-container {
      flex-grow: 1;
      display: flex;
      justify-content: center;
    }
    
    .mute-btn {
      background: none;
      border: none;
      cursor: pointer;
    }
  `
})
export class DailySalesComponent implements OnInit, OnDestroy {
  dailySalesService = inject(DailySalesService);
  private destroy$ = new Subject<void>();
  private audio = new Audio('./assets/audio/cha_ching.mp3');
  
  chartData = signal<any[]>([]);
  isMuted = signal<boolean>(false);
  muteSrc = signal<string>('./assets/icons/ic_notifications_black_24px.svg');
  upperLimit = 5000;
  
  ngOnInit(): void {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    this.loadSales(formattedDate);
    this.startUpdateInterval();
    
    // Update chart data when daily total changes
    this.updateChartData(this.dailySalesService.dailyTotal());
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadSales(date: string): void {
    this.dailySalesService.getDailySales(date).subscribe({
      next: () => {
        this.updateChartData(this.dailySalesService.dailyTotal());
        
        // Play sound if new transaction and not muted
        if (this.dailySalesService.newTransaction() && !this.isMuted()) {
          this.audio.play();
        }
      }
    });
  }
  
  startUpdateInterval(): void {
    interval(30000) // 30 seconds
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        this.loadSales(formattedDate);
      });
  }
  
  toggleMute(): void {
    this.isMuted.update(muted => !muted);
    this.muteSrc.set(this.isMuted() 
      ? './assets/icons/ic_notifications_off_black_24px.svg'
      : './assets/icons/ic_notifications_black_24px.svg'
    );
  }
  
  private updateChartData(value: number): void {
    this.chartData.set([
      {
        name: "Sales",
        value: value
      }
    ]);
  }
}

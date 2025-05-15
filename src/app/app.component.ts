import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './features/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent
],
  template: `
    <div class="app-container">
      <!-- Dashboard is now the only view -->
      <app-dashboard></app-dashboard>
    </div>
  `,
  styles: `
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f5f5f5;
    }
  `
})
export class AppComponent {
  title = 'KK Point of Sale';
}

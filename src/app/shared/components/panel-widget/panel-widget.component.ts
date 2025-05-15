import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <div class="panel-header">
        <h3>{{title}}</h3>
      </div>
      <div class="panel-content" [ngClass]="{'fixed-height': fixedHeight}">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    .panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .panel-content {
      padding: 16px;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-content.fixed-height {
      min-height: 350px; // Increased from 300px to accommodate charts better
    }
  `
})
export class PanelWidgetComponent {
  @Input() title: string = '';
  @Input() fixedHeight: boolean = false;
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-widget" [class.fixed-height]="fixedHeight">
      <div class="panel-header">
        <h3 class="panel-title">{{title}}</h3>
        <div class="panel-controls" *ngIf="showOptions">
          <button class="panel-control-btn">
            <i class="material-icons">more_vert</i>
          </button>
        </div>
      </div>
      <div class="panel-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    .panel-widget {
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      margin: 0.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .fixed-height {
      height: 350px;
    }
    
    .panel-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }
    
    .panel-title {
      margin: 0;
      font-size: 18px;
      font-weight: 400;
    }
    
    .panel-content {
      flex-grow: 1;
      padding: 16px;
      overflow: auto;
    }
    
    .panel-control-btn {
      background: none;
      border: none;
      cursor: pointer;
    }
  `
})
export class PanelWidgetComponent {
  @Input() title: string = '';
  @Input() showOptions: boolean = false;
  @Input() fixedHeight: boolean = false;
}

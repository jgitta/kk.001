import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from './services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transactions-container">
      <h3>Recent Transactions</h3>
      
      <div *ngIf="transactionService.loading()" class="loading">
        Loading transaction data...
      </div>
      
      <div *ngIf="transactionService.error()" class="error">
        {{ transactionService.error() }}
      </div>
      
      <table *ngIf="!transactionService.loading() && !transactionService.error()">
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let transaction of transactionService.transactions()">
            <td>{{ transaction.TransactionNumber }}</td>
            <td>{{ transaction.Time | date:'medium' }}</td>
            <td>{{ transaction.Total | currency }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .transactions-container {
      height: 100%;
      overflow: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    .loading {
      padding: 16px;
      text-align: center;
      color: #666;
    }
    
    .error {
      padding: 16px;
      color: red;
      background: #ffecec;
      border: 1px solid #f5aca6;
      border-radius: 4px;
    }
  `
})
export class TransactionsComponent implements OnInit {
  transactionService = inject(TransactionService);
  
  ngOnInit(): void {
    this.transactionService.getTransactions().subscribe();
  }
}

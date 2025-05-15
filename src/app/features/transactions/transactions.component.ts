import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TransactionService } from './services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transactions-container">
      <div *ngIf="loading()">Loading transaction data...</div>
      <div *ngIf="error()" class="error-message">{{ error() }}</div>
      
      <div *ngIf="!loading() && transactions().length > 0">
        <div>Recent transactions: {{ transactions().length }}</div>
        <div>Total value: {{ totalValue() | currency }}</div>
      </div>
    </div>
  `,
  styles: `
    .transactions-container {
      padding: 10px;
    }
    
    .error-message {
      color: red;
      padding: 5px;
    }
  `
})
export class TransactionsComponent implements OnInit {
  // Use transaction service instead of directly using data service
  private transactionService = inject(TransactionService);
  
  // Define signals
  transactions = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalValue = signal<number>(0);
  
  ngOnInit(): void {
    this.loadTransactions();
  }
  
  loadTransactions(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.transactionService.getTransactions().subscribe({
      next: () => {
        // Use the data from the service signal
        this.transactions.set(this.transactionService.transactions().slice(0, 10));
        this.loading.set(false);
        this.calculateTotalValue();
        console.log('Transaction data loaded:', this.transactions().length, 'transactions');
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.error.set(`Failed to load transaction data: ${err.message}`);
        this.loading.set(false);
      }
    });
  }
  
  calculateTotalValue(): void {
    const total = this.transactions().reduce((sum, transaction) => {
      return sum + transaction.Total;
    }, 0);
    this.totalValue.set(total);
  }
}

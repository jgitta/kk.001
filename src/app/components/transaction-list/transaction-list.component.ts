import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, TransactionDetailsComponent],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit {
  transactions: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  selectedTransactionNumber: number | null = null;
  apiAttempted: boolean = false;

  constructor(private dataService: DataService) { 
    console.log('TransactionList component constructed');
  }

  ngOnInit(): void {
    console.log('TransactionList component initialized');
    this.loadTransactions();
  }

  loadTransactions(): void {
    console.log('Loading transactions...');
    this.loading = true;
    this.error = null;
    
    this.dataService.getAllTransactions().subscribe({
      next: (data) => {
        console.log('Transaction data received:', data);
        this.transactions = data;
        this.loading = false;
        this.apiAttempted = true;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.error = 'Error loading transactions: ' + err.message;
        this.loading = false;
        this.apiAttempted = true;
      }
    });
  }
  
  viewDetails(transactionNumber: number): void {
    this.selectedTransactionNumber = transactionNumber;
  }
}

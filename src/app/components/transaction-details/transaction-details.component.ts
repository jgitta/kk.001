import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css'
})
export class TransactionDetailsComponent implements OnChanges {
  @Input() transactionNumber: number | null = null;
  
  entries: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  constructor(private dataService: DataService) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactionNumber'] && this.transactionNumber) {
      this.loadTransactionDetails();
    }
  }
  
  loadTransactionDetails(): void {
    if (!this.transactionNumber) return;
    
    this.loading = true;
    this.error = null;
    
    this.dataService.getTransactionEntries(this.transactionNumber).subscribe({
      next: (data) => {
        this.entries = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading transaction details: ' + err.message;
        this.loading = false;
        console.error('Error fetching transaction details:', err);
      }
    });
  }
}

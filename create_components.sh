#!/bin/bash

BASE_DIR="/mnt/Documents/dev/Angular/19/kk.001"
APP_DIR="$BASE_DIR/src/app"
COMPONENTS_DIR="$APP_DIR/components"

# Create components directory if it doesn't exist
mkdir -p "$COMPONENTS_DIR"

# Create Transaction List Component
TRANS_LIST_DIR="$COMPONENTS_DIR/transaction-list"
mkdir -p "$TRANS_LIST_DIR"

# Transaction List Component TS file
cat > "$TRANS_LIST_DIR/transaction-list.component.ts" << 'EOL'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit {
  transactions: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;
    
    this.dataService.getAllTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading transactions: ' + err.message;
        this.loading = false;
        console.error('Error fetching transactions:', err);
      }
    });
  }
  
  viewDetails(transactionNumber: number): void {
    // This will be implemented when we add transaction details component
    console.log('View details for transaction:', transactionNumber);
  }
}
EOL

# Transaction List Component HTML file
cat > "$TRANS_LIST_DIR/transaction-list.component.html" << 'EOL'
<div class="transaction-container">
  <h2>Transactions</h2>
  
  <div *ngIf="loading" class="loading">
    Loading transactions...
  </div>
  
  <div *ngIf="error" class="error-message">
    {{ error }}
  </div>
  
  <table *ngIf="transactions.length > 0 && !loading">
    <thead>
      <tr>
        <th>Transaction Number</th>
        <th>Date</th>
        <th>Total</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let transaction of transactions">
        <td>{{ transaction.TransactionNumber }}</td>
        <td>{{ transaction.Time | date:'short' }}</td>
        <td>{{ transaction.Total | currency }}</td>
        <td>
          <button (click)="viewDetails(transaction.TransactionNumber)">View Details</button>
        </td>
      </tr>
    </tbody>
  </table>
  
  <div *ngIf="transactions.length === 0 && !loading && !error" class="no-data">
    No transactions found.
  </div>
</div>
EOL

# Transaction List Component CSS file
cat > "$TRANS_LIST_DIR/transaction-list.component.css" << 'EOL'
.transaction-container {
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #eef;
}

.loading {
  margin: 20px 0;
  font-style: italic;
  color: #777;
}

.error-message {
  margin: 20px 0;
  color: red;
  padding: 10px;
  background-color: #ffeeee;
  border: 1px solid #ffcccc;
  border-radius: 4px;
}

.no-data {
  margin: 20px 0;
  font-style: italic;
  color: #555;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
EOL

# Create Item List Component
ITEM_LIST_DIR="$COMPONENTS_DIR/item-list"
mkdir -p "$ITEM_LIST_DIR"

# Item List Component TS file
cat > "$ITEM_LIST_DIR/item-list.component.ts" << 'EOL'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {
  items: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;
    
    this.dataService.getAllItems().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading items: ' + err.message;
        this.loading = false;
        console.error('Error fetching items:', err);
      }
    });
  }
  
  viewItem(id: number): void {
    // This will be implemented when we add item details component
    console.log('View item details:', id);
  }
}
EOL

# Item List Component HTML file
cat > "$ITEM_LIST_DIR/item-list.component.html" << 'EOL'
<div class="item-container">
  <h2>Items</h2>
  
  <div *ngIf="loading" class="loading">
    Loading items...
  </div>
  
  <div *ngIf="error" class="error-message">
    {{ error }}
  </div>
  
  <table *ngIf="items.length > 0 && !loading">
    <thead>
      <tr>
        <th>ID</th>
        <th>Description</th>
        <th>Price</th>
        <th>Department</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of items">
        <td>{{ item.ID }}</td>
        <td>{{ item.Description }}</td>
        <td>{{ item.Price | currency }}</td>
        <td>{{ item.DepartmentID }}</td>
        <td>
          <button (click)="viewItem(item.ID)">Details</button>
        </td>
      </tr>
    </tbody>
  </table>
  
  <div *ngIf="items.length === 0 && !loading && !error" class="no-data">
    No items found.
  </div>
</div>
EOL

# Item List Component CSS file
cat > "$ITEM_LIST_DIR/item-list.component.css" << 'EOL'
.item-container {
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #eef;
}

.loading {
  margin: 20px 0;
  font-style: italic;
  color: #777;
}

.error-message {
  margin: 20px 0;
  color: red;
  padding: 10px;
  background-color: #ffeeee;
  border: 1px solid #ffcccc;
  border-radius: 4px;
}

.no-data {
  margin: 20px 0;
  font-style: italic;
  color: #555;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
EOL

# Create Transaction Details Component
TRANS_DETAILS_DIR="$COMPONENTS_DIR/transaction-details"
mkdir -p "$TRANS_DETAILS_DIR"

# Transaction Details Component TS file
cat > "$TRANS_DETAILS_DIR/transaction-details.component.ts" << 'EOL'
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
EOL

# Transaction Details Component HTML file
cat > "$TRANS_DETAILS_DIR/transaction-details.component.html" << 'EOL'
<div class="details-container">
  <h3>Transaction #{{ transactionNumber }} Details</h3>
  
  <div *ngIf="loading" class="loading">
    Loading transaction details...
  </div>
  
  <div *ngIf="error" class="error-message">
    {{ error }}
  </div>
  
  <table *ngIf="entries.length > 0 && !loading">
    <thead>
      <tr>
        <th>Quantity</th>
        <th>Description</th>
        <th>Cost</th>
        <th>GM %</th>
        <th>Profit</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let entry of entries">
        <td>{{ entry.Quantity }}</td>
        <td>{{ entry.Description }}</td>
        <td>{{ entry.Cost | currency }}</td>
        <td>{{ entry['GM %'] | number:'1.2-2' }}%</td>
        <td>{{ entry.Profit | currency }}</td>
        <td>{{ entry.Price | currency }}</td>
        <td>{{ entry.Total | currency }}</td>
      </tr>
    </tbody>
  </table>
  
  <div *ngIf="entries.length === 0 && !loading && !error" class="no-data">
    No entries found for this transaction.
  </div>
</div>
EOL

# Transaction Details Component CSS file
cat > "$TRANS_DETAILS_DIR/transaction-details.component.css" << 'EOL'
.details-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

h3 {
  margin-top: 0;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #eef;
}

.loading {
  margin: 15px 0;
  font-style: italic;
  color: #777;
}

.error-message {
  margin: 15px 0;
  color: red;
  padding: 10px;
  background-color: #ffeeee;
  border: 1px solid #ffcccc;
  border-radius: 4px;
}

.no-data {
  margin: 15px 0;
  font-style: italic;
  color: #555;
}
EOL

# Update App Component
cat > "$APP_DIR/app.component.ts" << 'EOL'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { ItemListComponent } from './components/item-list/item-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TransactionListComponent, ItemListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeComponent: 'transactions' | 'items' = 'transactions';
  
  setActiveComponent(component: 'transactions' | 'items'): void {
    this.activeComponent = component;
  }
}
EOL

# App Component HTML file
cat > "$APP_DIR/app.component.html" << 'EOL'
<div class="app-container">
  <header>
    <h1>Database Management</h1>
  </header>
  
  <nav>
    <button [class.active]="activeComponent === 'transactions'" 
            (click)="setActiveComponent('transactions')">Transactions</button>
    <button [class.active]="activeComponent === 'items'" 
            (click)="setActiveComponent('items')">Items</button>
  </nav>
  
  <main>
    <app-transaction-list *ngIf="activeComponent === 'transactions'"></app-transaction-list>
    <app-item-list *ngIf="activeComponent === 'items'"></app-item-list>
  </main>
</div>
EOL

# App Component CSS file
cat > "$APP_DIR/app.component.css" << 'EOL'
.app-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

h1 {
  margin: 0;
}

nav {
  margin-bottom: 20px;
}

nav button {
  padding: 8px 16px;
  margin-right: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

nav button:hover {
  background-color: #45a049;
}

nav button.active {
  background-color: #367c39;
  box-shadow: 0 0 5px rgba(0,0,0,0.3) inset;
}

main {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
EOL

echo "All Angular component files have been created successfully!"
echo "Created directories:"
echo "- $TRANS_LIST_DIR"
echo "- $ITEM_LIST_DIR"
echo "- $TRANS_DETAILS_DIR"
echo "Updated app component files"
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

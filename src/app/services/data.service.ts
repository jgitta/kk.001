import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Generic query method that replaces the PHP functionality
  executeQuery(sql: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/query`, { sql });
  }
  
  // Standard CRUD operations for common entities
  getAllItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`);
  }

  getItem(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/items/${id}`);
  }
  
  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`);
  }
  
  getTransactionEntries(transactionNumber: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/${transactionNumber}/entries`);
  }
  
  getAllDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory`);
  }

  getTransactionSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions/summary`);
  }

  getDepartmentsWithItemCounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments/with-items`);
  }

  getYtdSalesByYear(): Observable<any[]> {
    // SQL query to get YTD sales for multiple years
    const sql = `
      WITH YearData AS (
        SELECT 
          YEAR(Time) as Year,
          SUM(Total) as YearTotal,
          (SELECT SUM(Total) 
           FROM [Transaction] t2 
           WHERE YEAR(t2.Time) = YEAR(t.Time) 
           AND DATEPART(dayofyear, t2.Time) <= DATEPART(dayofyear, GETDATE())) as YTDTotal
        FROM [Transaction] t
        GROUP BY YEAR(Time)
      )
      SELECT 
        Year,
        YearTotal,
        YTDTotal
      FROM YearData
      ORDER BY Year DESC
    `;
    
    return this.executeQuery(sql);
  }

  getDailySalesByHour(date: string = new Date().toISOString().split('T')[0]): Observable<any[]> {
    const sql = `SELECT 
                  DATEPART(HOUR, [Transaction].[Time]) as Hour,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 WHERE CONVERT(date, [Transaction].[Time]) = '${date}'
                 GROUP BY DATEPART(HOUR, [Transaction].[Time])
                 ORDER BY Hour`;
    
    return this.executeQuery(sql);
  }

  getDailyTotal(date: string = new Date().toISOString().split('T')[0]): Observable<any[]> {
    const sql = `SELECT 
                  CAST('${date}' AS DATE) as Date,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 WHERE CONVERT(date, [Transaction].[Time]) = '${date}'`;
    
    return this.executeQuery(sql);
  }

  getMtdSales(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): Observable<any[]> {
    const sql = `SELECT 
                  DAY([Transaction].[Time]) as Day,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 WHERE YEAR([Transaction].[Time]) = ${year}
                 AND MONTH([Transaction].[Time]) = ${month}
                 GROUP BY DAY([Transaction].[Time])
                 ORDER BY Day`;
    
    return this.executeQuery(sql);
  }

  getDepartmentSales(periodType: 'day'|'month'|'year' = 'month'): Observable<any[]> {
    let dateFilter = '';
    
    switch(periodType) {
      case 'day':
        dateFilter = `WHERE CONVERT(date, [Transaction].[Time]) = CAST(GETDATE() AS DATE)`;
        break;
      case 'month':
        dateFilter = `WHERE YEAR([Transaction].[Time]) = YEAR(GETDATE()) AND MONTH([Transaction].[Time]) = MONTH(GETDATE())`;
        break;
      case 'year':
        dateFilter = `WHERE YEAR([Transaction].[Time]) = YEAR(GETDATE())`;
        break;
    }
    
    const sql = `SELECT 
                  Department.Name as Department,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 LEFT JOIN Item ON TransactionEntry.ItemID = Item.ID
                 LEFT JOIN Department ON Item.DepartmentID = Department.ID
                 ${dateFilter}
                 GROUP BY Department.Name
                 ORDER BY Total DESC`;
    
    return this.executeQuery(sql);
  }

  getTopSellingItems(limit: number = 10, period: 'day'|'month'|'year' = 'month'): Observable<any[]> {
    let dateFilter = '';
    
    switch(period) {
      case 'day':
        dateFilter = `AND CONVERT(date, [Transaction].[Time]) = CAST(GETDATE() AS DATE)`;
        break;
      case 'month':
        dateFilter = `AND YEAR([Transaction].[Time]) = YEAR(GETDATE()) AND MONTH([Transaction].[Time]) = MONTH(GETDATE())`;
        break;
      case 'year':
        dateFilter = `AND YEAR([Transaction].[Time]) = YEAR(GETDATE())`;
        break;
    }
    
    const sql = `SELECT TOP ${limit} 
                  Item.Description,
                  SUM(TransactionEntry.Quantity) as QuantitySold,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS TotalSales
                 FROM TransactionEntry
                 JOIN Item ON TransactionEntry.ItemID = Item.ID
                 JOIN [Transaction] ON TransactionEntry.TransactionNumber = [Transaction].TransactionNumber
                 WHERE 1=1 ${dateFilter}
                 GROUP BY Item.Description
                 ORDER BY QuantitySold DESC`;
    
    return this.executeQuery(sql);
  }

  getInventoryStats(): Observable<any> {
    const sql = `SELECT 
                  COUNT(Item.ID) as TotalItems,
                  SUM(Item.Quantity) as TotalInventory,
                  SUM(Item.Quantity * Item.Cost) as TotalValue,
                  SUM(CASE WHEN Item.Quantity = 0 THEN 1 ELSE 0 END) as OutOfStock
                 FROM Item`;
    
    return this.executeQuery(sql);
  }

  getInventoryByDepartment(): Observable<any[]> {
    const sql = `SELECT 
                  Department.Name as Department,
                  COUNT(Item.ID) as ItemCount,
                  SUM(Item.Quantity) as Quantity,
                  SUM(Item.Quantity * Item.Cost) as Value
                 FROM Item
                 LEFT JOIN Department ON Item.DepartmentID = Department.ID
                 GROUP BY Department.Name
                 ORDER BY Value DESC`;
    
    return this.executeQuery(sql);
  }

  getProfitMarginByDepartment(period: 'day'|'month'|'year' = 'month'): Observable<any[]> {
    let dateFilter = '';
    
    switch(period) {
      case 'day':
        dateFilter = `WHERE CONVERT(date, [Transaction].[Time]) = CAST(GETDATE() AS DATE)`;
        break;
      case 'month':
        dateFilter = `WHERE YEAR([Transaction].[Time]) = YEAR(GETDATE()) AND MONTH([Transaction].[Time]) = MONTH(GETDATE())`;
        break;
      case 'year':
        dateFilter = `WHERE YEAR([Transaction].[Time]) = YEAR(GETDATE())`;
        break;
    }
    
    const sql = `SELECT 
                  Department.Name as Department,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Sales,
                  round(SUM(cast(TransactionEntry.Cost AS numeric) * TransactionEntry.Quantity),2) AS Cost,
                  round(SUM((cast(TransactionEntry.Price AS numeric) - cast(TransactionEntry.Cost AS numeric)) * TransactionEntry.Quantity),2) AS Profit,
                  round(SUM((cast(TransactionEntry.Price AS numeric) - cast(TransactionEntry.Cost AS numeric)) * TransactionEntry.Quantity) / 
                        SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity) * 100,2) AS MarginPercent
                 FROM [transaction] 
                 JOIN TransactionEntry ON TransactionEntry.TransactionNumber = [Transaction].TransactionNumber 
                 JOIN Item ON TransactionEntry.ItemID = Item.ID
                 JOIN Department ON Item.DepartmentID = Department.ID
                 ${dateFilter}
                 GROUP BY Department.Name
                 ORDER BY Profit DESC`;
    
    return this.executeQuery(sql);
  }

  getMtdSalesByDay(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): Observable<any[]> {
    const sql = `SELECT 
                  DAY([Transaction].[Time]) as Day,
                  round(SUM(cast(TransactionEntry.Price AS numeric) * TransactionEntry.Quantity),2) AS Total 
                 FROM [transaction] 
                 LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                 WHERE YEAR([Transaction].[Time]) = ${year}
                 AND MONTH([Transaction].[Time]) = ${month}
                 GROUP BY DAY([Transaction].[Time])
                 ORDER BY Day`;
    
    return this.executeQuery(sql);
  }
}
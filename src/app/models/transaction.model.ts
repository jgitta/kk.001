export interface Transaction {
  TransactionNumber: number;
  Time: string;
  Total: number;
  Items?: TransactionItem[];
}

export interface TransactionItem {
  ItemID: number;
  Name: string;
  Price: number;
  Quantity: number;
}

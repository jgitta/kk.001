const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// Modify the /query endpoint

const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE'];

router.post('/query', async (req, res) => {
  try {
    const sqlQuery = req.body.sql;
    
    if (!sqlQuery) {
      return res.status(400).json({ message: 'SQL query is required' });
    }
    
    // Check for potentially harmful SQL
    const upperQuery = sqlQuery.toUpperCase();
    const containsForbiddenKeyword = forbiddenKeywords.some(keyword => 
      upperQuery.includes(keyword)
    );
    
    if (containsForbiddenKeyword) {
      return res.status(403).json({ 
        message: 'Query contains forbidden operations'
      });
    }
    
    const pool = await poolPromise;
    const result = await pool.request().query(sqlQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ 
      message: 'An Error occurred!', 
      error: err.message 
    });
  }
});

// Items endpoints
router.get('/items', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Item');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Item WHERE ID = @id');
    
    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Transactions endpoint
router.get('/transactions', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM [Transaction]');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transaction entries by transaction number
router.get('/transactions/:number/entries', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('transactionNumber', sql.Int, req.params.number)
      .query(`
        SELECT 
          TransactionEntry.Quantity
        , Item.Description
        , CAST(TransactionEntry.Cost AS MONEY) AS Cost
        , ((TransactionEntry.Price - TransactionEntry.Cost) / TransactionEntry.Price) * 100 AS 'GM %'
        , CAST((TransactionEntry.Price - TransactionEntry.Cost) AS MONEY) AS 'Profit'
        , CAST(TransactionEntry.Price AS MONEY) AS Price
        , CAST(TransactionEntry.Price * TransactionEntry.Quantity AS MONEY) AS Total
        FROM TransactionEntry
        LEFT JOIN [Transaction] ON [TransactionEntry].TransactionNumber = [Transaction].TransactionNumber
        LEFT JOIN Item ON Item.ID = TransactionEntry.ItemID
        LEFT JOIN [Department] ON [Department].ID = [Item].DepartmentID
        WHERE TransactionEntry.TransactionNumber = @transactionNumber
        `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Custom query endpoint for specific business logic
router.get('/transactions/summary', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalTransactions,
        SUM(Total) as TotalRevenue,
        AVG(Total) as AverageTransaction
      FROM [Transaction]
    `);
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Departments endpoint
router.get('/departments', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Department');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add method to get departments with item counts
router.get('/departments/with-items', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        d.ID,
        d.Name,
        COUNT(i.ID) as ItemCount
      FROM Department d
      LEFT JOIN Item i ON d.ID = i.DepartmentID
      GROUP BY d.ID, d.Name
    `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new route for inventory data
router.get('/inventory', async (req, res) => {
  try {
    console.log('API: Inventory endpoint called');
    const pool = await poolPromise;
    console.log('API: Database pool acquired for inventory');
    
    const result = await pool.request().query(`
      SELECT 
        i.ID,
        i.Description,
        i.Price,
        i.Cost,
        i.Quantity,
        d.Name as DepartmentName
      FROM Item i
      LEFT JOIN Department d ON i.DepartmentID = d.ID
      ORDER BY i.Description
    `);
    
    console.log(`API: Inventory query executed, returned ${result.recordset?.length || 0} items`);
    res.json(result.recordset);
  } catch (err) {
    console.error('API Error fetching inventory:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
<?php
    require_once 'db.php'; // The mysql database connection script

  //  require('FirePHPCore/FirePHP.class.php');
  //  $firephp = FirePHP::getInstance(true);

    // get the raw POST data
    $rawData = file_get_contents("php://input");
    $postData = json_decode($rawData, true);
    $sql = $postData['sql'];

    //  $firephp->log(json_encode($rawData), 'rawData string');
    // $firephp->log($postData, 'postData string' );
   // $firephp->log($sql, 'sql string');


    // echo 'rawData string: ' . json_encode($rawData);
    // echo 'postData string: ' . json_encode($postData);
    // echo 'sql string: ' . json_encode($sql);



   

// YTD Sample
// $sql = <<<YTD
//         SELECT YEAR = YEAR([Transaction].[Time]),
//                 TOTAL = ROUND(SUM(TransactionEntry.Price * TransactionEntry.Quantity),2)
//                 FROM [transaction] 
//                 INNER JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
//                 LEFT JOIN   Item WITH(NOLOCK) ON TransactionEntry.ItemID = Item.ID 
//                 LEFT JOIN   Department WITH(NOLOCK) ON Item.DepartmentID = Department.ID 
//                 WHERE [Transaction].[Time] BETWEEN DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0) 
//                     AND GETDATE()+1 
//                     AND Department.Name <>'GIFT' OR [Transaction].[Time] BETWEEN DATEADD(yy, DATEDIFF(yy, 0, DATEADD(yy, -1, GETDATE())), 0) 
//                     AND DATEADD(yy, -1, getdate()+1) AND Department.Name <>'GIFT' 
//                     OR [Transaction].[Time] BETWEEN DATEADD(yy, DATEDIFF(yy, 0, DATEADD(yy, -2, GETDATE())), 0) 
//                     AND DATEADD(yy, -2, getdate()+1) AND Department.Name <>'GIFT' 
//                     OR [Transaction].[Time] BETWEEN DATEADD(yy, DATEDIFF(yy, 0, DATEADD(yy, -3, GETDATE())), 0) 
//                     AND DATEADD(yy, -3, getdate()+1) AND Department.Name <>'GIFT' 
//                     OR [Transaction].[Time] BETWEEN DATEADD(yy, DATEDIFF(yy, 0, DATEADD(yy, -4, GETDATE())), 0) 
//                     AND DATEADD(yy, -4, getdate()+1) AND Department.Name <>'GIFT' 
//                     GROUP BY YEAR([Transaction].[Time]) ORDER BY YEAR([Transaction].[Time]) DESC
// YTD;





// Department Sample

/*$sql = <<<DPT
        SELECT [Department].Name AS Department, CAST(SUM(TransactionEntry.Price * TransactionEntry.Quantity) AS NUMERIC(10,2)) AS Total 
                  FROM [transaction] 
                  LEFT JOIN TransactionEntry ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber 
                  LEFT JOIN Item ON Item.ID = TransactionEntry.ItemID 
                  LEFT JOIN [Department] ON [Department].ID = [Item].DepartmentID 
                  WHERE YEAR([Transaction].[Time]) = 2016
                  GROUP BY [Department].Name 
                  ORDER BY [Department].Name
DPT;*/

    try
    {
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $array = $stmt->fetchAll();
    } 
    catch(PDOException $ex) 
    {
        echo "An Error occured!  " . ($ex->getMessage()); //user friendly message
    }

    // set up header; first two prevent IE from caching queries
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');

    // return the JSON data
    echo json_encode($array, JSON_NUMERIC_CHECK);

   //  $firephp->log(json_encode($array), 'json from DB: ');

?>
<?php
require_once 'db.php'; // The mysql database connection script
require('FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);

// get the raw POST data
    $rawData = file_get_contents("php://input");
    $postData = json_decode($rawData, true);
    $sql = $postData['sql'];

    //$firephp->log($postData, 'postData received: ');

    // $sql = "SELECT 
    //   TransactionEntry.Quantity
    // , Item.Description
    // , Cost = CAST (TransactionEntry.Cost AS MONEY)
    // , 'GM %' = ((TransactionEntry.Price - TransactionEntry.Cost) / TransactionEntry.price) * 100
    // , 'Profit' = CAST ((TransactionEntry.Price - TransactionEntry.Cost) AS MONEY)
    // , Price = CAST (TransactionEntry.Price AS MONEY)
    // , Total = CAST (TransactionEntry.Price * TransactionEntry.Quantity AS MONEY)

    //     FROM TransactionEntry
    //     LEFT JOIN [Transaction] ON [Transactionentry].TransactionNumber = [Transaction].TransactionNumber
    //     LEFT JOIN Item ON Item.ID = TransactionEntry.ItemID
    //     LEFT JOIN [Department] ON [Department].ID = [Item].DepartmentID
    //     WHERE  TransactionEntry.transactionNumber= 62670";


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
    



// return the JSON data
echo json_encode($array);
//$firephp->log(json_encode($data), 'Data:');
//$firephp->log($sql, 'SQL sent from db: ');

?>


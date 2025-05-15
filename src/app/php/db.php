<?php

error_reporting(E_ALL);

// for linux install

$serverName = "74.81.167.109";
$port = 1443;
$database = "kk";
$uid = "sa";
$pwd = "rmhsql";


try {
	//Establishes the connection
	$conn = new PDO("dblib:host=$serverName;dbname=$database", $uid, $pwd);

	

	// PDO in error exception mode
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
	echo 'Connection failed: ' . $e->getMessage() . "<br/>";

}

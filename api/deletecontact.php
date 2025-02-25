<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';


$inData = getRequestInfo();

$contactID = $inData['ContactID'];

 $stmt = $conn->prepare("DELETE FROM Contacts WHERE ContactID = ?");
if (!$stmt) {
	sendResultInfoAsJson(["success" => false, "error" => $conn->error]);
	exit;
}

  $stmt->bind_param("i", $contactID);
    
if ($stmt->execute()) {
	sendResultInfoAsJson(["success" => true]);
} else {
	sendResultInfoAsJson(["success" => false, "error" => "Failed to delete contact."]);
}

$stmt->close();

?>

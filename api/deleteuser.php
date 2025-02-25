<?php                              
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';


$inData = getRequestInfo();

$UserID = $inData['UserID'];

$stmt = $conn->prepare("DELETE FROM Users WHERE ID = ?");
if (!$stmt) {
	sendResultInfoAsJson(["success" => false, "error" => $conn->error]);
	exit;
}

$stmt->bind_param("i", $UserID);

if ($stmt->execute()) {
	sendResultInfoAsJson(["success" => true]);
} else {
	sendResultInfoAsJson(["success" => false, "error" => "Failed to delete contact."]);
}

$stmt->close();

?>

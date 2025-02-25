<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';


$inData = getRequestInfo();

$contactID = $inData['ContactID'];
$firstName = trim($inData['firstName']);
$lastName = trim($inData['lastName']);
$email = trim($inData['email']);

// Check if contact exists
$stmt = $conn->prepare("SELECT COUNT(*) AS count FROM Contacts WHERE Email = ? AND ContactID != ?");
$stmt->execute([$email, $contactID]);
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if ($row && $row['count'] > 0) {
	sendResultInfoAsJson([
		"success" => false,
		"error" => "A contact with this email already exists."
	]);
	exit;
}

 $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Email = ?, DateCreated = NOW() WHERE ContactID = ?");
if ($stmt->execute([$firstName, $lastName, $email, $contactID])) {
	sendResultInfoAsJson(["success" => true]);
} else {
	sendResultInfoAsJson([
		"success" => false,
		"error" => "Failed to update contact."
	]);
}
?>

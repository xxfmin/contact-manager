<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';


$inData = getRequestInfo();

// Uncomment to see requestinfo
//sendResultInfoAsJson(["error" => $inData]);
//exit();

if (!isset($inData["userID"], $inData["firstName"], $inData["lastName"], $inData["email"])) {
	sendResultInfoAsJson(["error" => "All fields are required"]);
	exit();
}

// Set variables
$first = $inData["firstName"];
$last = $inData["lastName"];
$email = $inData["email"];
$id = $inData["userID"];

// Check for duplicate contacts?

// Add contact
$stmt = $conn->prepare("INSERT INTO Contacts (ID, FirstName, LastName, Email) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("isss", $id, $first, $last, $email);

if ($stmt->execute()) {
	sendResultInfoAsJson(["message" => "Contact added successfully!"]);
} else { 
	sendResultInfoAsJson(["error" => "Failed to add contact: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>

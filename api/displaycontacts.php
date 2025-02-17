<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$CookieID = 2;

// Uncomment to see requestinfo
//sendResultInfoAsJson(["Cookie ID" => $CookieID]);
//exit();


// Add contact
$stmt = $conn->prepare("SELECT * FROM Contacts");
if (!$stmt) {
    sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
    exit();
}


if ($stmt->execute()) {
	$result = $stmt->get_result();
	$contacts = $result->fetch_all(); // Needs argument
	sendResultInfoAsJson(["message" => "Contacts retrieved successfully!"]);
} else {
	sendResultInfoAsJson(["error" => "Failed to retrieve contacts: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>

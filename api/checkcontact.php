<?php

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';


$inData = getRequestInfo();

if ($inData["email"] == 0) {
        sendResultInfoAsJson(["error" => "Provide Email"]);
        exit();
}

// Set variables
$email = $inData["email"];

// Query for contacts
$stmt = $conn->prepare("SELECT * FROM Contacts WHERE email = ?");

if (!$stmt) {
    sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $email);

if ($stmt->execute()) {
        $result = $stmt->get_result();
		$contact = $result->fetch_all(MYSQLI_ASSOC); 

		if(!empty($contact)) {
			sendResultInfoAsJson(["exists" => "true"]);
		} else {
        	sendResultInfoAsJson(["exists" => "false"]);
		}

} else {
        sendResultInfoAsJson(["error" => "Failure with DB: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>

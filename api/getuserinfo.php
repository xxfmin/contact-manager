<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$inData = getRequestInfo();

$userId = isset($inData["userId"]) ? (int)$inData["userId"] : 0;
if ($userId === 0) {
    sendResultInfoAsJson(["error" => "Missing or invalid userId."]);
    exit();
}

// Fetch username and email
$stmt = $conn->prepare("SELECT Username, UserEmail FROM Users WHERE ID = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $username = $row["Username"];
    $email    = $row["UserEmail"];
    sendResultInfoAsJson([
        "username" => $username,
        "email"    => $email
    ]);
} else {
    sendResultInfoAsJson(["error" => "User not found."]);
}

$stmt->close();
$conn->close();
?>

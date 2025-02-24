<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$inData = getRequestInfo();

$userId     = isset($inData["userId"])     ? (int)$inData["userId"] : 0;
$username   = isset($inData["username"])   ? trim($inData["username"]) : "";
$email      = isset($inData["email"])      ? trim($inData["email"]) : "";
$oldPass    = isset($inData["oldPass"])    ? $inData["oldPass"] : "";
$newPass    = isset($inData["newPass"])    ? $inData["newPass"] : "";
$confirmPass= isset($inData["confirmPass"]) ? $inData["confirmPass"] : "";

if ($userId === 0) {
    sendResultInfoAsJson(["error" => "Missing or invalid userId"]);
    exit();
}

// Fetch current password hash from DB to verify oldPass if needed
$stmt = $conn->prepare("SELECT Password FROM Users WHERE ID = ?");
if (!$stmt) {
    sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
    exit();
}
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if (!$row = $result->fetch_assoc()) {
    $stmt->close();
    $conn->close();
    sendResultInfoAsJson(["error" => "User not found."]);
    exit();
}
$dbPasswordHash = $row["Password"];
$stmt->close();

// If all password fields are empty, just update username/email
if (empty($oldPass) && empty($newPass) && empty($confirmPass))
{
    $stmt = $conn->prepare("UPDATE Users SET Username = ?, UserEmail = ? WHERE ID = ?");
    if (!$stmt) {
        sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("ssi", $username, $email, $userId);
    if ($stmt->execute()) {
        sendResultInfoAsJson(["success" => true]);
    } else {
        sendResultInfoAsJson(["error" => "Error updating username/email."]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

// If user is attempting a password change, all 3 fields must be non-empty
if (empty($oldPass) || empty($newPass) || empty($confirmPass)) {
    sendResultInfoAsJson(["error" => "All password fields are required to change the password."]);
    $conn->close();
    exit();
}

// Verify old password
if (!password_verify($oldPass, $dbPasswordHash)) {
    sendResultInfoAsJson(["error" => "Old password is incorrect."]);
    $conn->close();
    exit();
}

// Check newPass == confirmPass
if ($newPass !== $confirmPass) {
    sendResultInfoAsJson(["error" => "New passwords do not match."]);
    $conn->close();
    exit();
}

// Hash new password and update
$newPassHash = password_hash($newPass, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE Users SET Username = ?, UserEmail = ?, Password = ? WHERE ID = ?");
if (!$stmt) {
    sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
    exit();
}
$stmt->bind_param("sssi", $username, $email, $newPassHash, $userId);

if ($stmt->execute()) {
    sendResultInfoAsJson(["success" => true]);
} else {
    sendResultInfoAsJson(["error" => "Error updating user record."]);
}

$stmt->close();
$conn->close();
?>

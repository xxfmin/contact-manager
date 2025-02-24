<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$inData = getRequestInfo();

if (isset($inData["userId"])) {
    $userId = (int)$inData["userId"];
} else {
    $userId = 0;
}

if (isset($inData["username"])) {
    $username = trim($inData["username"]);
} else {
    $username = "";
}

if (isset($inData["email"])) {
    $email = trim($inData["email"]);
} else {
    $email = "";
}

if (isset($inData["oldPass"])) {
    $oldPass = $inData["oldPass"];
} else {
    $oldPass = "";
}

if (isset($inData["newPass"])) {
    $newPass = $inData["newPass"];
} else {
    $newPass = "";
}

if (isset($inData["confirmPass"])) {
    $confirmPass = $inData["confirmPass"];
} else {
    $confirmPass = "";
}

if ($userId === 0) {
    sendResultInfoAsJson(["error" => "Missing or invalid userId"]);
    exit();
}

// Check for conflicts with an existing username or email from other users
$stmt = $conn->prepare("SELECT ID FROM Users WHERE (Username = ? OR UserEmail = ?) AND ID <> ?");
if (!$stmt) {
    sendResultInfoAsJson(["error" => "Database error: " . $conn->error]);
    exit();
}
$stmt->bind_param("ssi", $username, $email, $userId);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    sendResultInfoAsJson(["error" => "Username or Email already taken."]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

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

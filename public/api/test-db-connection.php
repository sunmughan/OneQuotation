<?php
/**
 * Database Connection Test Script
 * Tests MySQL database connection with provided credentials
 */

// Allow cross-origin requests (for development)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. Only POST requests are allowed.'
    ]);
    exit();
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
if (!isset($data['host']) || !isset($data['database']) || !isset($data['username'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required database connection parameters.'
    ]);
    exit();
}

// Extract connection parameters
$host = $data['host'];
$database = $data['database'];
$username = $data['username'];
$password = isset($data['password']) ? $data['password'] : '';
$port = isset($data['port']) ? $data['port'] : 3306;

// Test database connection
try {
    // Create connection
    $conn = new mysqli($host, $username, $password, $database, $port);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Close connection
    $conn->close();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful!'
    ]);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
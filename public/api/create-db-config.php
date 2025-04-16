<?php
/**
 * Create Database Configuration File
 * Creates the db-config.php file from the template with the provided configuration
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
if (!isset($data['dbConfig']) || !isset($data['dbConfig']['host']) || 
    !isset($data['dbConfig']['database']) || !isset($data['dbConfig']['username'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required database configuration parameters.'
    ]);
    exit();
}

// Extract database configuration
$dbConfig = $data['dbConfig'];
$host = $dbConfig['host'];
$database = $dbConfig['database'];
$username = $dbConfig['username'];
$password = isset($dbConfig['password']) ? $dbConfig['password'] : '';
$port = isset($dbConfig['port']) ? $dbConfig['port'] : '3306';
$prefix = isset($dbConfig['prefix']) ? $dbConfig['prefix'] : 'quotation_';

try {
    // Get template content
    $templatePath = __DIR__ . '/db-config-template.php';
    if (!file_exists($templatePath)) {
        throw new Exception("Database configuration template file not found.");
    }
    
    $template = file_get_contents($templatePath);
    
    // Replace placeholders with actual values
    $configContent = str_replace(
        ['{{DB_HOST}}', '{{DB_NAME}}', '{{DB_USER}}', '{{DB_PASS}}', '{{DB_PORT}}', '{{TABLE_PREFIX}}'],
        [$host, $database, $username, $password, $port, $prefix],
        $template
    );
    
    // Write to db-config.php
    $configPath = __DIR__ . '/db-config.php';
    if (file_put_contents($configPath, $configContent) === false) {
        throw new Exception("Failed to write database configuration file. Please check file permissions.");
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Database configuration file created successfully!'
    ]);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
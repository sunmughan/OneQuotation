<?php
/**
 * Database Configuration and Utility Functions
 * This file provides database connection and utility functions for the Quotation Management System
 */

// Allow cross-origin requests (adjust in production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get database configuration from config file
 * @return array|null Database configuration or null if not found
 */
function getDbConfig() {
    $configFile = __DIR__ . '/../../config.php';
    
    if (file_exists($configFile)) {
        $config = include $configFile;
        return $config['db'] ?? null;
    }
    
    return null;
}

/**
 * Create database connection
 * @return mysqli|null Database connection or null on failure
 */
function getDbConnection() {
    $dbConfig = getDbConfig();
    
    if (!$dbConfig) {
        return null;
    }
    
    try {
        $conn = new mysqli(
            $dbConfig['host'],
            $dbConfig['username'],
            $dbConfig['password'],
            $dbConfig['database'],
            $dbConfig['port']
        );
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        return $conn;
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get table name with prefix
 * @param string $table Base table name
 * @return string Full table name with prefix
 */
function getTableName($table) {
    $dbConfig = getDbConfig();
    $prefix = $dbConfig['prefix'] ?? 'quotation_';
    
    return $prefix . $table;
}

/**
 * Check if application is installed
 * @return bool True if installed, false otherwise
 */
function isInstalled() {
    $configFile = __DIR__ . '/../../config.php';
    
    if (file_exists($configFile)) {
        $config = include $configFile;
        return isset($config['app']['installed']) && $config['app']['installed'] === true;
    }
    
    return false;
}

/**
 * Get application configuration
 * @return array Application configuration
 */
function getAppConfig() {
    $configFile = __DIR__ . '/../../config.php';
    
    if (file_exists($configFile)) {
        $config = include $configFile;
        return $config['app'] ?? [];
    }
    
    return [];
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return installation status and app configuration
    echo json_encode([
        'installed' => isInstalled(),
        'config' => getAppConfig()
    ]);
    exit();
}
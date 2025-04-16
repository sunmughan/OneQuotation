<?php
/**
 * Database Configuration Template
 * This file will be used to create the actual db-config.php file during installation
 */

// Database connection parameters
$db_host = '{{DB_HOST}}';
$db_name = '{{DB_NAME}}';
$db_user = '{{DB_USER}}';
$db_pass = '{{DB_PASS}}';
$db_port = '{{DB_PORT}}';
$table_prefix = '{{TABLE_PREFIX}}';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4");

// Return connection
return $conn;
<?php
/**
 * Data Migration Script
 * Migrates data from localStorage to MySQL database
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
if (!isset($data['dbConfig']) || !isset($data['data'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters.'
    ]);
    exit();
}

// Extract parameters
$dbConfig = $data['dbConfig'];
$dataToMigrate = $data['data'];
$prefix = isset($dbConfig['prefix']) ? $dbConfig['prefix'] : 'quotation_';

// Validate database configuration
if (!isset($dbConfig['host']) || !isset($dbConfig['database']) || !isset($dbConfig['username'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required database configuration parameters.'
    ]);
    exit();
}

// Connect to database
try {
    $conn = new mysqli(
        $dbConfig['host'],
        $dbConfig['username'],
        $dbConfig['password'],
        $dbConfig['database'],
        isset($dbConfig['port']) ? $dbConfig['port'] : 3306
    );
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Create tables if they don't exist
    createTables($conn, $prefix);
    
    // Migrate data
    migrateProducts($conn, $dataToMigrate['products'], $prefix);
    migrateCustomers($conn, $dataToMigrate['customers'], $prefix);
    migrateStaff($conn, $dataToMigrate['staff'], $prefix);
    migrateQuotations($conn, $dataToMigrate['quotations'], $prefix);
    migrateSettings($conn, $dataToMigrate['settings'], $prefix);
    
    // Generate SQL file with complete database structure
    generateSqlFile($conn, $prefix, $dbConfig['database']);
    
    // Commit transaction
    $conn->commit();
    
    // Close connection
    $conn->close();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Data migration completed successfully!'
    ]);
} catch (Exception $e) {
    // Rollback transaction if active
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
        $conn->close();
    }
    
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error migrating data: ' . $e->getMessage()
    ]);
}

/**
 * Create database tables
 */
function createTables($conn, $prefix) {
    // Create products table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}products (
        id VARCHAR(36) PRIMARY KEY,
        product_type ENUM('tiles', 'adhesive', 'cp-sw') NOT NULL,
        sno VARCHAR(50),
        brand VARCHAR(100) NOT NULL,
        area_of_application VARCHAR(100),
        shade_name VARCHAR(100),
        image TEXT,
        dimensions VARCHAR(50),
        surface VARCHAR(50),
        category VARCHAR(100),
        product_code VARCHAR(100),
        description TEXT,
        mrp DECIMAL(10,2) NOT NULL,
        discount DECIMAL(5,2),
        discounted_price DECIMAL(10,2),
        price_per_sqft DECIMAL(10,2),
        area_in_one_box DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating products table: " . $conn->error);
    }
    
    // Create customers table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating customers table: " . $conn->error);
    }
    
    // Create staff table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}staff (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        position VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating staff table: " . $conn->error);
    }
    
    // Create quotations table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}quotations (
        id VARCHAR(36) PRIMARY KEY,
        quotation_number VARCHAR(50) NOT NULL,
        customer_id VARCHAR(36),
        customer_name VARCHAR(100),
        customer_email VARCHAR(100),
        customer_phone VARCHAR(20),
        customer_address TEXT,
        date DATE,
        valid_until DATE,
        total_amount DECIMAL(10,2),
        discount DECIMAL(10,2),
        tax DECIMAL(10,2),
        grand_total DECIMAL(10,2),
        notes TEXT,
        terms TEXT,
        status VARCHAR(20),
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES {$prefix}customers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating quotations table: " . $conn->error);
    }
    
    // Create quotation_items table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}quotation_items (
        id VARCHAR(36) PRIMARY KEY,
        quotation_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36),
        product_type ENUM('tiles', 'adhesive', 'cp-sw') NOT NULL,
        product_details JSON NOT NULL,
        quantity DECIMAL(10,2),
        unit_price DECIMAL(10,2),
        discount DECIMAL(5,2),
        total_price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (quotation_id) REFERENCES {$prefix}quotations(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES {$prefix}products(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating quotation_items table: " . $conn->error);
    }
    
    // Create settings table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(50) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating settings table: " . $conn->error);
    }
}

/**
 * Migrate products data
 */
function migrateProducts($conn, $products, $prefix) {
    // Prepare statement for products
    $stmt = $conn->prepare("INSERT INTO {$prefix}products 
        (id, product_type, brand, area_of_application, shade_name, image, dimensions, surface, 
        category, product_code, description, mrp, discount, discounted_price, price_per_sqft, area_in_one_box) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        brand = VALUES(brand),
        area_of_application = VALUES(area_of_application),
        shade_name = VALUES(shade_name),
        image = VALUES(image),
        dimensions = VALUES(dimensions),
        surface = VALUES(surface),
        category = VALUES(category),
        product_code = VALUES(product_code),
        description = VALUES(description),
        mrp = VALUES(mrp),
        discount = VALUES(discount),
        discounted_price = VALUES(discounted_price),
        price_per_sqft = VALUES(price_per_sqft),
        area_in_one_box = VALUES(area_in_one_box)");
    
    if (!$stmt) {
        throw new Exception("Error preparing products statement: " . $conn->error);
    }
    
    // Migrate tiles products
    if (isset($products['tiles']) && is_array($products['tiles'])) {
        foreach ($products['tiles'] as $product) {
            $stmt->bind_param(
                "sssssssssssddddd",
                $product['id'],
                $productType = 'tiles',
                $product['brand'],
                $product['areaOfApplication'] ?? '',
                $product['shadeName'] ?? '',
                $product['image'] ?? '',
                $product['dimensions'] ?? '',
                $product['surface'] ?? '',
                $category = '',
                $productCode = '',
                $description = '',
                $product['mrp'],
                $product['discount'] ?? 0,
                $product['discountedPrice'] ?? 0,
                $product['pricePerSqFt'] ?? 0,
                $product['areaInOneBox'] ?? 0
            );
            
            if (!$stmt->execute()) {
                throw new Exception("Error inserting tiles product: " . $stmt->error);
            }
        }
    }
    
    // Migrate adhesive products
    if (isset($products['adhesive']) && is_array($products['adhesive'])) {
        foreach ($products['adhesive'] as $product) {
            $stmt->bind_param(
                "sssssssssssddddd",
                $product['id'],
                $productType = 'adhesive',
                $product['brand'],
                $areaOfApplication = '',
                $shadeName = '',
                $image = '',
                $dimensions = '',
                $surface = '',
                $product['category'] ?? '',
                $productCode = '',
                $description = '',
                $product['mrp'],
                $discount = 0,
                $product['dPrice'] ?? 0,
                $pricePerSqFt = 0,
                $areaInOneBox = 0
            );
            
            if (!$stmt->execute()) {
                throw new Exception("Error inserting adhesive product: " . $stmt->error);
            }
        }
    }
    
    // Migrate CP & SW products
    if (isset($products['cp-sw']) && is_array($products['cp-sw'])) {
        foreach ($products['cp-sw'] as $product) {
            $stmt->bind_param(
                "sssssssssssddddd",
                $product['id'],
                $productType = 'cp-sw',
                $product['brand'],
                $areaOfApplication = '',
                $shadeName = '',
                $product['image'] ?? '',
                $dimensions = '',
                $surface = '',
                $category = '',
                $product['productCode'] ?? '',
                $product['description'] ?? '',
                $product['mrp'],
                $discount = 0,
                $product['dPrice'] ?? 0,
                $pricePerSqFt = 0,
                $areaInOneBox = 0
            );
            
            if (!$stmt->execute()) {
                throw new Exception("Error inserting CP & SW product: " . $stmt->error);
            }
        }
    }
    
    $stmt->close();
}

/**
 * Migrate customers data
 */
function migrateCustomers($conn, $customers, $prefix) {
    if (!is_array($customers) || empty($customers)) {
        return; // No customers to migrate
    }
    
    $stmt = $conn->prepare("INSERT INTO {$prefix}customers 
        (id, name, email, phone, address, city, state, pincode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        email = VALUES(email),
        phone = VALUES(phone),
        address = VALUES(address),
        city = VALUES(city),
        state = VALUES(state),
        pincode = VALUES(pincode)");
    
    if (!$stmt) {
        throw new Exception("Error preparing customers statement: " . $conn->error);
    }
    
    foreach ($customers as $customer) {
        $stmt->bind_param(
            "ssssssss",
            $customer['id'],
            $customer['name'],
            $customer['email'] ?? '',
            $customer['phone'] ?? '',
            $customer['address'] ?? '',
            $customer['city'] ?? '',
            $customer['state'] ?? '',
            $customer['pincode'] ?? ''
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting customer: " . $stmt->error);
        }
    }
    
    $stmt->close();
}

/**
 * Migrate staff data
 */
function migrateStaff($conn, $staff, $prefix) {
    if (!is_array($staff) || empty($staff)) {
        return; // No staff to migrate
    }
    
    $stmt = $conn->prepare("INSERT INTO {$prefix}staff 
        (id, name, email, phone, position) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        email = VALUES(email),
        phone = VALUES(phone),
        position = VALUES(position)");
    
    if (!$stmt) {
        throw new Exception("Error preparing staff statement: " . $conn->error);
    }
    
    foreach ($staff as $member) {
        $stmt->bind_param(
            "sssss",
            $member['id'],
            $member['name'],
            $member['email'] ?? '',
            $member['phone'] ?? '',
            $member['position'] ?? ''
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting staff member: " . $stmt->error);
        }
    }
    
    $stmt->close();
}

/**
 * Migrate quotations data
 */
function migrateQuotations($conn, $quotations, $prefix) {
    if (!is_array($quotations) || empty($quotations)) {
        return; // No quotations to migrate
    }
    
    // Prepare statement for quotations
    $quotationStmt = $conn->prepare("INSERT INTO {$prefix}quotations 
        (id, quotation_number, customer_id, customer_name, customer_email, customer_phone, customer_address, 
        date, valid_until, total_amount, discount, tax, grand_total, notes, terms, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        customer_id = VALUES(customer_id),
        customer_name = VALUES(customer_name),
        customer_email = VALUES(customer_email),
        customer_phone = VALUES(customer_phone),
        customer_address = VALUES(customer_address),
        date = VALUES(date),
        valid_until = VALUES(valid_until),
        total_amount = VALUES(total_amount),
        discount = VALUES(discount),
        tax = VALUES(tax),
        grand_total = VALUES(grand_total),
        notes = VALUES(notes),
        terms = VALUES(terms),
        status = VALUES(status),
        created_by = VALUES(created_by)");
    
    if (!$quotationStmt) {
        throw new Exception("Error preparing quotations statement: " . $conn->error);
    }
    
    // Prepare statement for quotation items
    $itemStmt = $conn->prepare("INSERT INTO {$prefix}quotation_items 
        (id, quotation_id, product_id, product_type, product_details, quantity, unit_price, discount, total_price) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        product_id = VALUES(product_id),
        product_type = VALUES(product_type),
        product_details = VALUES(product_details),
        quantity = VALUES(quantity),
        unit_price = VALUES(unit_price),
        discount = VALUES(discount),
        total_price = VALUES(total_price)");
    
    if (!$itemStmt) {
        throw new Exception("Error preparing quotation items statement: " . $conn->error);
    }
    
    foreach ($quotations as $quotation) {
        // Generate UUID for quotation if not exists
        if (!isset($quotation['id'])) {
            $quotation['id'] = generateUuid();
        }
        
        // Format dates
        $date = isset($quotation['date']) ? date('Y-m-d', strtotime($quotation['date'])) : null;
        $validUntil = isset($quotation['validUntil']) ? date('Y-m-d', strtotime($quotation['validUntil'])) : null;
        
        $quotationStmt->bind_param(
            "sssssssssddddssss",
            $quotation['id'],
            $quotation['quotationNumber'] ?? '',
            $quotation['customerId'] ?? null,
            $quotation['customerName'] ?? '',
            $quotation['customerEmail'] ?? '',
            $quotation['customerPhone'] ?? '',
            $quotation['customerAddress'] ?? '',
            $date,
            $validUntil,
            $quotation['totalAmount'] ?? 0,
            $quotation['discount'] ?? 0,
            $quotation['tax'] ?? 0,
            $quotation['grandTotal'] ?? 0,
            $quotation['notes'] ?? '',
            $quotation['terms'] ?? '',
            $quotation['status'] ?? 'draft',
            $quotation['createdBy'] ?? null
        );
        
        if (!$quotationStmt->execute()) {
            throw new Exception("Error inserting quotation: " . $quotationStmt->error);
        }
        
        // Insert quotation items
        if (isset($quotation['products']) && is_array($quotation['products'])) {
            foreach ($quotation['products'] as $index => $product) {
                // Generate UUID for item if not exists
                $itemId = generateUuid();
                
                // Determine product type
                $productType = 'tiles'; // Default
                if (isset($product['category'])) {
                    $productType = 'adhesive';
                } elseif (isset($product['productCode'])) {
                    $productType = 'cp-sw';
                }
                
                // Convert product to JSON
                $productDetails = json_encode($product);
                
                // Get quantity based on product type
                $quantity = 0;
                if ($productType === 'tiles') {
                    $quantity = $product['areaRequired'] ?? 0;
                } elseif ($productType === 'adhesive') {
                    $quantity = $product['noOfBags'] ?? 0;
                } elseif ($productType === 'cp-sw') {
                    $quantity = $product['nos'] ?? 0;
                }
                
                // Get unit price and discount
                $unitPrice = $product['mrp'] ?? 0;
                $discount = $product['discount'] ?? 0;
                $totalPrice = $product['totalAmount'] ?? 0;
                
                $itemStmt->bind_param(
                    "sssssdddd",
                    $itemId,
                    $quotation['id'],
                    $product['id'] ?? null,
                    $productType,
                    $productDetails,
                    $quantity,
                    $unitPrice,
                    $discount,
                    $totalPrice
                );
                
                if (!$itemStmt->execute()) {
                    throw new Exception("Error inserting quotation item: " . $itemStmt->error);
                }
            }
        }
    }
    
    $quotationStmt->close();
    $itemStmt->close();
}

/**
 * Migrate settings data
 */
function migrateSettings($conn, $settings, $prefix) {
    if (!is_array($settings) || empty($settings)) {
        return; // No settings to migrate
    }
    
    $stmt = $conn->prepare("INSERT INTO {$prefix}settings 
        (setting_key, setting_value) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value)");
    
    if (!$stmt) {
        throw new Exception("Error preparing settings statement: " . $conn->error);
    }
    
    // Flatten settings object into key-value pairs
    foreach ($settings as $key => $value) {
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
        }
        
        $stmt->bind_param("ss", $key, $value);
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting setting: " . $stmt->error);
        }
    }
    
    $stmt->close();
}

/**
 * Generate UUID v4
 */
function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Generate SQL file with complete database structure
 */
function generateSqlFile($conn, $prefix, $dbName) {
    // File path for the SQL dump
    $sqlFilePath = __DIR__ . '/database_structure.sql';
    
    // Start building SQL content
    $sqlContent = "-- Quotation Management System Database Structure\n";
    $sqlContent .= "-- Generated on " . date('Y-m-d H:i:s') . "\n\n";
    $sqlContent .= "-- Database: `{$dbName}`\n\n";
    
    // Get all tables with the specified prefix
    $tables = [];
    $result = $conn->query("SHOW TABLES LIKE '{$prefix}%'");
    while ($row = $result->fetch_row()) {
        $tables[] = $row[0];
    }
    
    // For each table, get the create statement and add it to the SQL content
    foreach ($tables as $table) {
        $result = $conn->query("SHOW CREATE TABLE `{$table}`");
        $row = $result->fetch_row();
        $createStatement = $row[1];
        
        $sqlContent .= "-- Table structure for table `{$table}`\n";
        $sqlContent .= "DROP TABLE IF EXISTS `{$table}`;\n";
        $sqlContent .= "{$createStatement};\n\n";
        
        // Get indexes for the table
        $sqlContent .= "-- Indexes for table `{$table}`\n";
        $indexResult = $conn->query("SHOW INDEX FROM `{$table}`");
        $indexes = [];
        while ($indexRow = $indexResult->fetch_assoc()) {
            $indexName = $indexRow['Key_name'];
            if ($indexName !== 'PRIMARY' && !in_array($indexName, $indexes)) {
                $indexes[] = $indexName;
                $sqlContent .= "-- Index: {$indexName}\n";
            }
        }
        $sqlContent .= "\n";
    }
    
    // Write SQL content to file
    file_put_contents($sqlFilePath, $sqlContent);
}
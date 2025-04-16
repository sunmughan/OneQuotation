<?php
/**
 * cPanel Installer Script for Quotation Management System
 * This script handles the installation process for cPanel hosting environments
 */

// Define constants
define('APP_NAME', 'Quotation Management System');
define('APP_VERSION', '1.0.0');
define('MIN_PHP_VERSION', '7.4.0');
define('MIN_MYSQL_VERSION', '5.7.0');

// Start session
session_start();

// Check if installation is already complete
if (file_exists('config.php') && !isset($_GET['force'])) {
    header('Location: index.html');
    exit();
}

// Get current step
$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;

// Process form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($step) {
        case 2: // Database configuration
            processDbConfig();
            break;
        case 3: // Data migration
            processMigration();
            break;
        case 4: // Finalize installation
            finalizeInstallation();
            break;
    }
}

/**
 * Process database configuration form
 */
function processDbConfig() {
    $host = $_POST['host'] ?? '';
    $database = $_POST['database'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $port = $_POST['port'] ?? '3306';
    $prefix = $_POST['prefix'] ?? 'quotation_';
    
    // Validate required fields
    if (empty($host) || empty($database) || empty($username)) {
        $_SESSION['error'] = 'Please fill in all required database fields';
        header('Location: install.php?step=2');
        exit();
    }
    
    // Test database connection
    try {
        $conn = new mysqli($host, $username, $password, $database, $port);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Check MySQL version
        $version = $conn->query('SELECT VERSION() as version')->fetch_assoc()['version'];
        if (version_compare($version, MIN_MYSQL_VERSION, '<')) {
            throw new Exception("MySQL version $version is not supported. Minimum required version is " . MIN_MYSQL_VERSION);
        }
        
        $conn->close();
        
        // Save database configuration to session
        $_SESSION['db_config'] = [
            'host' => $host,
            'database' => $database,
            'username' => $username,
            'password' => $password,
            'port' => $port,
            'prefix' => $prefix
        ];
        
        $_SESSION['success'] = 'Database connection successful!';
        header('Location: install.php?step=3');
        exit();
    } catch (Exception $e) {
        $_SESSION['error'] = $e->getMessage();
        header('Location: install.php?step=2');
        exit();
    }
}

/**
 * Process data migration
 */
function processMigration() {
    if (!isset($_SESSION['db_config'])) {
        $_SESSION['error'] = 'Database configuration not found. Please configure the database first.';
        header('Location: install.php?step=2');
        exit();
    }
    
    $dbConfig = $_SESSION['db_config'];
    
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
        
        // Create tables
        createTables($conn, $dbConfig['prefix']);
        
        $_SESSION['success'] = 'Database tables created successfully!';
        header('Location: install.php?step=4');
        exit();
    } catch (Exception $e) {
        $_SESSION['error'] = $e->getMessage();
        header('Location: install.php?step=3');
        exit();
    }
}

/**
 * Create necessary database tables
 * 
 * @param mysqli $conn Database connection
 * @param string $prefix Table prefix
 * @throws Exception If table creation fails
 */
function createTables($conn, $prefix) {
    // Create products table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}products (
        id VARCHAR(36) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        mrp DECIMAL(10,2) NOT NULL,
        discountedPrice DECIMAL(10,2),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating products table: " . $conn->error);
    }
    
    // Create customers table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating customers table: " . $conn->error);
    }
    
    // Create staff table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}staff (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating staff table: " . $conn->error);
    }
    
    // Create quotations table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}quotations (
        id VARCHAR(36) PRIMARY KEY,
        quotation_number VARCHAR(50) NOT NULL,
        customer_id VARCHAR(36),
        staff_id VARCHAR(36),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES {$prefix}customers(id) ON DELETE SET NULL,
        FOREIGN KEY (staff_id) REFERENCES {$prefix}staff(id) ON DELETE SET NULL
    )";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating quotations table: " . $conn->error);
    }
    
    // Create settings table
    $sql = "CREATE TABLE IF NOT EXISTS {$prefix}settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error creating settings table: " . $conn->error);
    }
}

/**
 * Finalize installation
 */
function finalizeInstallation() {
    if (!isset($_SESSION['db_config'])) {
        $_SESSION['error'] = 'Database configuration not found. Please configure the database first.';
        header('Location: install.php?step=2');
        exit();
    }
    
    $dbConfig = $_SESSION['db_config'];
    
    // Create config file
    $configContent = "<?php\n"
        . "// Configuration file for Quotation Management System\n"
        . "// Generated on " . date('Y-m-d H:i:s') . "\n\n"
        . "return [\n"
        . "    'db' => [\n"
        . "        'host' => '" . addslashes($dbConfig['host']) . "',\n"
        . "        'database' => '" . addslashes($dbConfig['database']) . "',\n"
        . "        'username' => '" . addslashes($dbConfig['username']) . "',\n"
        . "        'password' => '" . addslashes($dbConfig['password']) . "',\n"
        . "        'port' => '" . addslashes($dbConfig['port']) . "',\n"
        . "        'prefix' => '" . addslashes($dbConfig['prefix']) . "'\n"
        . "    ],\n"
        . "    'app' => [\n"
        . "        'installed' => true,\n"
        . "        'version' => '" . APP_VERSION . "',\n"
        . "        'install_date' => '" . date('Y-m-d H:i:s') . "'\n"
        . "    ]\n"
        . "];\n";
    
    if (file_put_contents('config.php', $configContent) === false) {
        $_SESSION['error'] = 'Failed to create configuration file. Please check file permissions.';
        header('Location: install.php?step=4');
        exit();
    }
    
    // Clear session
    session_destroy();
    
    // Redirect to success page
    header('Location: install.php?step=5');
    exit();
}

// Check PHP version
$phpVersionCheck = version_compare(PHP_VERSION, MIN_PHP_VERSION, '>=');

// Check if required PHP extensions are installed
$extensionsCheck = extension_loaded('mysqli') && extension_loaded('json');

// Check if config directory is writable
$writableCheck = is_writable('.');

// All requirements met
$requirementsMet = $phpVersionCheck && $extensionsCheck && $writableCheck;

// HTML header
function outputHeader() {
    global $step;
    
    echo '<!DOCTYPE html>
'
    . '<html lang="en">
'
    . '<head>
'
    . '    <meta charset="UTF-8">
'
    . '    <meta name="viewport" content="width=device-width, initial-scale=1.0">
'
    . '    <title>Install - ' . APP_NAME . '</title>
'
    . '    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
'
    . '    <style>
'
    . '        body { background-color: #f5f5f5; padding-top: 40px; }
'
    . '        .installer-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; }
'
    . '        .installer-header { background: #1976d2; color: white; padding: 20px; text-align: center; }
'
    . '        .installer-body { padding: 30px; }
'
    . '        .step-indicator { display: flex; margin-bottom: 30px; }
'
    . '        .step { flex: 1; text-align: center; padding: 10px; position: relative; }
'
    . '        .step:not(:last-child):after { content: ""; position: absolute; top: 50%; right: 0; transform: translateY(-50%); width: 100%; height: 2px; background: #ddd; z-index: 1; }
'
    . '        .step-number { display: inline-block; width: 30px; height: 30px; line-height: 30px; border-radius: 50%; background: #ddd; color: #333; position: relative; z-index: 2; }
'
    . '        .step.active .step-number { background: #1976d2; color: white; }
'
    . '        .step.completed .step-number { background: #4caf50; color: white; }
'
    . '    </style>
'
    . '</head>
'
    . '<body>
'
    . '<div class="container">
'
    . '    <div class="installer-container">
'
    . '        <div class="installer-header">
'
    . '            <h1>' . APP_NAME . ' Installer</h1>
'
    . '        </div>
'
    . '        <div class="installer-body">
'
    . '            <div class="step-indicator">
'
    . '                <div class="step ' . ($step >= 1 ? 'active' : '') . ' ' . ($step > 1 ? 'completed' : '') . '">
'
    . '                    <div class="step-number">1</div>
'
    . '                    <div class="step-title">Requirements</div>
'
    . '                </div>
'
    . '                <div class="step ' . ($step >= 2 ? 'active' : '') . ' ' . ($step > 2 ? 'completed' : '') . '">
'
    . '                    <div class="step-number">2</div>
'
    . '                    <div class="step-title">Database</div>
'
    . '                </div>
'
    . '                <div class="step ' . ($step >= 3 ? 'active' : '') . ' ' . ($step > 3 ? 'completed' : '') . '">
'
    . '                    <div class="step-number">3</div>
'
    . '                    <div class="step-title">Migration</div>
'
    . '                </div>
'
    . '                <div class="step ' . ($step >= 4 ? 'active' : '') . ' ' . ($step > 4 ? 'completed' : '') . '">
'
    . '                    <div class="step-number">4</div>
'
    . '                    <div class="step-title">Finalize</div>
'
    . '                </div>
'
    . '                <div class="step ' . ($step >= 5 ? 'active' : '') . '">
'
    . '                    <div class="step-number">5</div>
'
    . '                    <div class="step-title">Complete</div>
'
    . '                </div>
'
    . '            </div>
'
    . '            
'
    . '            <!-- Display error/success messages -->
'
    . '            ' . (isset($_SESSION['error']) ? '<div class="alert alert-danger">' . $_SESSION['error'] . '</div>' : '') . '
'
    . '            ' . (isset($_SESSION['success']) ? '<div class="alert alert-success">' . $_SESSION['success'] . '</div>' : '') . '
';
    
    // Clear session messages
    unset($_SESSION['error'], $_SESSION['success']);
}

// HTML footer
function outputFooter() {
    echo '        </div>
'
    . '    </div>
'
    . '    <div class="text-center mt-3 text-muted">
'
    . '        <small>&copy; ' . date('Y') . ' ' . APP_NAME . ' v' . APP_VERSION . '</small>
'
    . '    </div>
'
    . '</div>
'
    . '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
'
    . '</body>
'
    . '</html>';
}

// Output HTML
outputHeader();

// Display step content
switch ($step) {
    case 1: // System requirements check
        echo '<h2>System Requirements</h2>
'
        . '<p>Before we proceed with the installation, let\'s check if your server meets the requirements.</p>
'
        . '<table class="table">
'
        . '    <tbody>
'
        . '        <tr>
'
        . '            <td>PHP Version</td>
'
        . '            <td>' . PHP_VERSION . '</td>
'
        . '            <td>' . ($phpVersionCheck ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') . '</td>
'
        . '        </tr>
'
        . '        <tr>
'
        . '            <td>Required Extensions</td>
'
        . '            <td>mysqli, json</td>
'
        . '            <td>' . ($extensionsCheck ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') . '</td>
'
        . '        </tr>
'
        . '        <tr>
'
        . '            <td>Writable Directory</td>
'
        . '            <td>Current directory</td>
'
        . '            <td>' . ($writableCheck ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') . '</td>
'
        . '        </tr>
'
        . '    </tbody>
'
        . '</table>
'
        . '<div class="d-flex justify-content-between mt-4">
'
        . '    <div></div>
'
        . '    <div>
'
        . '        <a href="install.php?step=2" class="btn btn-primary' . (!$requirementsMet ? ' disabled' : '') . '">Next</a>
'
        . '    </div>
'
        . '</div>';
        break;
        
    case 2: // Database configuration
        $dbConfig = $_SESSION['db_config'] ?? [
            'host' => 'localhost',
            'database' => '',
            'username' => '',
            'password' => '',
            'port' => '3306',
            'prefix' => 'quotation_'
        ];
        
        echo '<h2>Database Configuration</h2>
'
        . '<p>Please enter your database connection details.</p>
'
        . '<form method="post" action="install.php?step=2">
'
        . '    <div class="mb-3">
'
        . '        <label for="host" class="form-label">Database Host</label>
'
        . '        <input type="text" class="form-control" id="host" name="host" value="' . htmlspecialchars($dbConfig['host']) . '" required>
'
        . '    </div>
'
        . '    <div class="mb-3">
'
        . '        <label for="database" class="form-label">Database Name</label>
'
        . '        <input type="text" class="form-control" id="database" name="database" value="' . htmlspecialchars($dbConfig['database']) . '" required>
'
        . '    </div>
'
        . '    <div class="mb-3">
'
        . '        <label for="username" class="form-label">Database Username</label>
'
        . '        <input type="text" class="form-control" id="username" name="username" value="' . htmlspecialchars($dbConfig['username']) . '" required>
'
        . '    </div>
'
        . '    <div class="mb-3">
'
        . '        <label for="password" class="form-label">Database Password</label>
'
        . '        <input type="password" class="form-control" id="password" name="password" value="' . htmlspecialchars($dbConfig['password']) . '">
'
        . '    </div>
'
        . '    <div class="row">
'
        . '        <div class="col-md-6 mb-3">
'
        . '            <label for="port" class="form-label">Database Port</label>
'
        . '            <input type="text" class="form-control" id="port" name="port" value="' . htmlspecialchars($dbConfig['port']) . '">
'
        . '        </div>
'
        . '        <div class="col-md-6 mb-3">
'
        . '            <label for="prefix" class="form-label">Table Prefix</label>
'
        . '            <input type="text" class="form-control" id="prefix" name="prefix" value="' . htmlspecialchars($dbConfig['prefix']) . '">
'
        . '        </div>
'
        . '    </div>
'
        . '    <div class="d-flex justify-content-between mt-4">
'
        . '        <div>
'
        . '            <a href="install.php?step=1" class="btn btn-secondary">Back</a>
'
        . '        </div>
'
        . '        <div>
'
        . '            <button type="submit" class="btn btn-primary">Test Connection</button>
'
        . '        </div>
'
        . '    </div>
'
        . '</form>';
        break;
        
    case 3: // Data migration
        echo '<h2>Database Migration</h2>
'
        . '<p>We will now create the necessary database tables for your application.</p>
'
        . '<form method="post" action="install.php?step=3">
'
        . '    <div class="alert alert-info">
'
        . '        <strong>Note:</strong> This step will create the following tables in your database:
'
        . '        <ul>
'
        . '            <li>Products</li>
'
        . '            <li>Customers</li>
'
        . '            <li>Staff</li>
'
        . '            <li>Quotations</li>
'
        . '            <li>Settings</li>
'
        . '        </ul>
'
        . '    </div>
'
        . '    <div class="d-flex justify-content-between mt-4">
'
        . '        <div>
'
        . '            <a href="install.php?step=2" class="btn btn-secondary">Back</a>
'
        . '        </div>
'
        . '        <div>
'
        . '            <button type="submit" class="btn btn-primary">Create Tables</button>
'
        . '        </div>
'
        . '    </div>
'
        . '</form>';
        break;
        
    case 4: // Finalize installation
        echo '<h2>Finalize Installation</h2>
'
        . '<p>You\'re almost done! Click the button below to complete the installation.</p>
'
        . '<form method="post" action="install.php?step=4">
'
        . '    <div class="alert alert-warning">
'
        . '        <strong>Important:</strong> After installation is complete, please delete the <code>install.php</code> file from your server for security reasons.
'
        . '    </div>
'
        . '    <div class="d-flex justify-content-between mt-4">
'
        . '        <div>
'
        . '            <a href="install.php?step=3" class="btn btn-secondary">Back</a>
'
        . '        </div>
'
        . '        <div>
'
        . '            <button type="submit" class="btn btn-success">Complete Installation</button>
'
        . '        </div>
'
        . '    </div>
'
        . '</form>';
        break;
        
    case 5: // Installation complete
        echo '<h2>Installation Complete!</h2>
'
        . '<div class="alert alert-success">
'
        . '    <strong>Congratulations!</strong> ' . APP_NAME . ' has been successfully installed.
'
        . '</div>
'
        . '<p>You can now start using your application.</p>
'
        . '<div class="d-flex justify-content-center mt-4">
'
        . '    <a href="index.html" class="btn btn-primary">Go to Application</a>
'
        . '</div>';
        break;
}

outputFooter();
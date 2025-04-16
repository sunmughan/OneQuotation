-- Quotation Management System Database Schema
-- This SQL file contains the database schema for the Quotation Management System
-- It can be used to create the database structure manually if needed

-- Products Table
CREATE TABLE IF NOT EXISTS {{prefix}}products (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers Table
CREATE TABLE IF NOT EXISTS {{prefix}}customers (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff Table
CREATE TABLE IF NOT EXISTS {{prefix}}staff (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    position VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotations Table
CREATE TABLE IF NOT EXISTS {{prefix}}quotations (
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
    FOREIGN KEY (customer_id) REFERENCES {{prefix}}customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotation Items Table
CREATE TABLE IF NOT EXISTS {{prefix}}quotation_items (
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
    FOREIGN KEY (quotation_id) REFERENCES {{prefix}}quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES {{prefix}}products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE IF NOT EXISTS {{prefix}}settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Settings Documentation
-- The following settings are used in the application:
-- businessName: The name of the business
-- businessAddress: The street address of the business
-- businessCity: The city where the business is located
-- businessState: The state where the business is located
-- businessZipCode: The zip/postal code of the business
-- businessPhone: The contact phone number for the business
-- businessEmail: The contact email for the business
-- logo: Base64 encoded image of the business logo
-- Note: Template selection has been removed from the application

-- Insert default settings
INSERT INTO {{prefix}}settings (setting_key, setting_value) VALUES
('businessName', 'Prateek Tiles and Marble'),
('businessAddress', '123 Main Street'),
('businessCity', 'Mumbai'),
('businessState', 'Maharashtra'),
('businessZipCode', '400001'),
('businessPhone', '+91 9876543210'),
('businessEmail', 'info@prateektiles.com'),
('logo', NULL),
-- Template selection setting removed
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Indexes for better performance
CREATE INDEX idx_products_brand ON {{prefix}}products(brand);
CREATE INDEX idx_products_type ON {{prefix}}products(product_type);
CREATE INDEX idx_customers_name ON {{prefix}}customers(name);
CREATE INDEX idx_customers_email ON {{prefix}}customers(email);
CREATE INDEX idx_customers_phone ON {{prefix}}customers(phone);
CREATE INDEX idx_quotations_number ON {{prefix}}quotations(quotation_number);
CREATE INDEX idx_quotations_customer ON {{prefix}}quotations(customer_id);
CREATE INDEX idx_quotation_items_quotation ON {{prefix}}quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product ON {{prefix}}quotation_items(product_id);
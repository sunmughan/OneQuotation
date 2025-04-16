/**
 * cPanel Deployment Script
 * This script prepares the application for deployment to cPanel hosting
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Check if archiver is installed, if not, show instructions
try {
  require.resolve('archiver');
} catch (e) {
  console.error('Error: archiver package is not installed.');
  console.log('Please install it using: npm install archiver --save-dev');
  process.exit(1);
}

// Configuration
const config = {
  distDir: path.join(__dirname, 'dist'),
  outputZip: path.join(__dirname, 'quotation-cpanel-deploy.zip'),
  filesToCopy: [
    { src: path.join(__dirname, 'public', 'install.php'), dest: 'install.php' },
    { src: path.join(__dirname, '.htaccess'), dest: '.htaccess' },
  ],
  apiDir: path.join(__dirname, 'public', 'api'),
  apiDestDir: 'api'
};

// Ensure dist directory exists (build must be run first)
if (!fs.existsSync(config.distDir)) {
  console.error('Error: dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(config.outputZip);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Successfully created ${config.outputZip}`);
  console.log(`Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nDeployment Instructions:');
  console.log('1. Upload the zip file to your cPanel hosting');
  console.log('2. Extract the zip file in your web directory');
  console.log('3. Navigate to your domain and access the installer: https://yourdomain.com/install.php');
  console.log('4. Follow the installation wizard to set up your database');
  console.log('5. After installation is complete, delete install.php for security');
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    console.error('Error:', err);
    process.exit(1);
  }
});

archive.on('error', function(err) {
  console.error('Error:', err);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

// Add dist directory contents to the archive
archive.directory(config.distDir, false);

// Add API directory to the archive
if (fs.existsSync(config.apiDir)) {
  archive.directory(config.apiDir, config.apiDestDir);
} else {
  console.warn(`Warning: API directory ${config.apiDir} not found`);
}

// Create uploads directory in the archive
archive.append(null, { name: 'uploads/' });

// Add additional files
config.filesToCopy.forEach(file => {
  if (fs.existsSync(file.src)) {
    archive.file(file.src, { name: file.dest });
  } else {
    console.warn(`Warning: File ${file.src} not found`);
  }
});

// Create a config-sample.php file
const configSampleContent = `<?php
// Configuration file for Quotation Management System
// Rename this file to config.php and update with your database details

return [
    'db' => [
        'host' => 'localhost',
        'database' => 'your_database_name',
        'username' => 'your_database_username',
        'password' => 'your_database_password',
        'port' => '3306',
        'prefix' => 'quotation_'
    ],
    'app' => [
        'installed' => true,
        'version' => '1.0.0',
        'install_date' => ''
    ]
];
`;

archive.append(configSampleContent, { name: 'config-sample.php' });

// Create a README file with deployment instructions
const readmeContent = `# Quotation Management System - cPanel Deployment

## Installation Instructions

1. **Upload and Extract**
   - Upload the zip file to your cPanel hosting
   - Extract the zip file in your web directory (public_html or a subdirectory)

2. **Run the Installer**
   - Navigate to your domain and access the installer: https://yourdomain.com/install.php
   - Follow the installation wizard to set up your database

3. **Post-Installation**
   - After installation is complete, delete install.php for security
   - Your application is now ready to use!

## Manual Configuration (Alternative)

If you prefer to configure the application manually:

1. Create a MySQL database and user in cPanel
2. Rename config-sample.php to config.php
3. Update the database details in config.php
4. Import the database schema (if available)

## Troubleshooting

- Ensure your hosting meets the requirements: PHP 7.4+ and MySQL 5.7+
- Check file permissions: directories should be 755, files should be 644
- If you encounter issues, check the error logs in cPanel

## Support

For support, please contact your administrator.
`;

archive.append(readmeContent, { name: 'README.md' });

// Finalize the archive
archive.finalize();

console.log('Creating deployment package...');
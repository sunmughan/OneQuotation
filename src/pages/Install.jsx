import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const steps = ['Welcome', 'Database Configuration', 'Data Migration', 'Finalize Installation'];

const Install = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    database: '',
    username: '',
    password: '',
    port: '3306',
    prefix: 'quotation_',
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testConnection, setTestConnection] = useState({
    status: null,
    message: '',
  });

  useEffect(() => {
    // Check if app is already installed
    const appConfig = localStorage.getItem('appConfig');
    if (appConfig) {
      try {
        const config = JSON.parse(appConfig);
        if (config.installed) {
          setIsInstalled(true);
        }
      } catch (e) {
        console.error('Error parsing app config:', e);
      }
    }
  }, []);

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate database configuration before proceeding
      if (!dbConfig.host || !dbConfig.database || !dbConfig.username) {
        setError('Please fill in all required database fields');
        return;
      }
      // Test database connection
      testDatabaseConnection();
      return;
    }

    if (activeStep === 2) {
      // Migrate data from localStorage to database
      migrateData();
      return;
    }

    if (activeStep === 3) {
      // Complete installation
      completeInstallation();
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDbConfigChange = (e) => {
    const { name, value } = e.target;
    setDbConfig({
      ...dbConfig,
      [name]: value,
    });
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Create a PHP script URL to test the connection
      const testUrl = '/api/test-db-connection.php';
      
      // Prepare the connection data
      const connectionData = {
        host: dbConfig.host,
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        port: dbConfig.port
      };
      
      // For development/demo purposes, simulate a successful connection
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
          setIsLoading(false);
          setTestConnection({
            status: true,
            message: 'Connection successful! (Development mode)',
          });
          setSuccess('Database connection successful!');
          
          setTimeout(() => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          }, 1500);
        }, 2000);
        return;
      }
      
      // For production, make an actual connection test
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (data.success) {
        setTestConnection({
          status: true,
          message: data.message || 'Connection successful!',
        });
        setSuccess('Database connection successful!');
        setTimeout(() => {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }, 1500);
      } else {
        setTestConnection({
          status: false,
          message: data.message || 'Connection failed!',
        });
        setError(data.message || 'Failed to connect to database. Please check your credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setTestConnection({
        status: false,
        message: 'Connection error!',
      });
      setError('Error testing connection: ' + err.message);
    }
  };

  const migrateData = async () => {
    setIsLoading(true);
    setError('');
    
    // Get all data from localStorage that needs to be migrated
    const dataToMigrate = {
      products: JSON.parse(localStorage.getItem('products') || '{}'),
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      staff: JSON.parse(localStorage.getItem('staff') || '[]'),
      quotations: JSON.parse(localStorage.getItem('savedQuotations') || '[]'),
      settings: JSON.parse(localStorage.getItem('businessSettings') || '{}'),
    };
    
    try {
      // For development/demo purposes, simulate a successful migration
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
          setIsLoading(false);
          setSuccess('Data migration completed successfully! (Development mode)');
          
          // Store database configuration
          localStorage.setItem('dbConfig', JSON.stringify(dbConfig));
          
          // Proceed to next step
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }, 3000);
        return;
      }
      
      // For production, make an actual API call to create tables and migrate data
      const migrationUrl = '/api/migrate-data.php';
      
      const response = await fetch(migrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dbConfig,
          data: dataToMigrate,
          prefix: dbConfig.prefix
        }),
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (data.success) {
        setSuccess('Data migration completed successfully!');
        localStorage.setItem('dbConfig', JSON.stringify(dbConfig));
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        setError(data.message || 'Failed to migrate data. Please try again.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error migrating data: ' + err.message);
    }
  };

  const completeInstallation = () => {
    // Mark installation as complete
    const appConfig = {
      installed: true,
      installDate: new Date().toISOString(),
      version: '1.0.0',
      dbConfig: dbConfig
    };
    
    // Store the configuration in localStorage
    localStorage.setItem('appConfig', JSON.stringify(appConfig));
    localStorage.setItem('dbConfig', JSON.stringify(dbConfig));
    
    // Update state
    setIsInstalled(true);
    setSuccess('Installation completed successfully! You will be redirected to the product selection page.');
    
    // Redirect to product selection page after a delay
    setTimeout(() => {
      navigate('/select');
    }, 3000);
  };

  const resetInstallation = () => {
    // Clear installation data
    localStorage.removeItem('appConfig');
    localStorage.removeItem('dbConfig');
    setIsInstalled(false);
    setActiveStep(0);
  };

  // Render different content based on the active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to the Quotation Management System Installer
            </Typography>
            <Typography paragraph>
              This installer will guide you through setting up your Quotation Management System with a database connection.
              Before proceeding, please make sure you have the following information ready:
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requirements:
                </Typography>
                <Typography paragraph>
                  1. Database name (created in your cPanel/phpMyAdmin)
                </Typography>
                <Typography paragraph>
                  2. Database username and password
                </Typography>
                <Typography paragraph>
                  3. Database host (usually localhost)
                </Typography>
                <Typography paragraph>
                  4. Database port (usually 3306 for MySQL)
                </Typography>
              </CardContent>
            </Card>
            {isInstalled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                The application appears to be already installed. Continuing will reconfigure your installation.
              </Alert>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Database Configuration
            </Typography>
            <Typography paragraph>
              Please enter your database connection details below. These details can typically be found in your cPanel or provided by your hosting provider.
            </Typography>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="Database Host"
                name="host"
                value={dbConfig.host}
                onChange={handleDbConfigChange}
                margin="normal"
                helperText="Usually 'localhost' or an IP address"
              />
              <TextField
                required
                fullWidth
                label="Database Name"
                name="database"
                value={dbConfig.database}
                onChange={handleDbConfigChange}
                margin="normal"
                helperText="The name of your MySQL database"
              />
              <TextField
                required
                fullWidth
                label="Database Username"
                name="username"
                value={dbConfig.username}
                onChange={handleDbConfigChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Database Password"
                name="password"
                type="password"
                value={dbConfig.password}
                onChange={handleDbConfigChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Database Port"
                name="port"
                value={dbConfig.port}
                onChange={handleDbConfigChange}
                margin="normal"
                helperText="Default is 3306 for MySQL"
              />
              <TextField
                fullWidth
                label="Table Prefix"
                name="prefix"
                value={dbConfig.prefix}
                onChange={handleDbConfigChange}
                margin="normal"
                helperText="Prefix for database tables (e.g., 'quotation_')"
              />
              {testConnection.status !== null && (
                <Alert 
                  severity={testConnection.status ? "success" : "error"}
                  sx={{ mt: 2 }}
                >
                  {testConnection.message}
                </Alert>
              )}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Data Migration
            </Typography>
            <Typography paragraph>
              In this step, we will migrate your existing data from browser storage to the database.
              This ensures that all your products, customers, staff, and quotations are safely stored in your database.
            </Typography>
            <Typography paragraph>
              Click "Next" to begin the migration process. This may take a few moments depending on the amount of data.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Your existing data will remain in the browser storage as a backup until the migration is complete.
            </Alert>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Complete Installation
            </Typography>
            <Typography paragraph>
              You're almost done! Click "Finish" to complete the installation process.
            </Typography>
            <Typography paragraph>
              After installation is complete, you will be redirected to the application dashboard.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Database Configuration: Complete
              </Typography>
              <Divider sx={{ width: '100%', my: 2 }} />
              <Typography variant="body1">
                Host: {dbConfig.host}
              </Typography>
              <Typography variant="body1">
                Database: {dbConfig.database}
              </Typography>
              <Typography variant="body1">
                Username: {dbConfig.username}
              </Typography>
              <Typography variant="body1">
                Table Prefix: {dbConfig.prefix}
              </Typography>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Quotation Management System Setup
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || isLoading}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoading && <CircularProgress size={24} sx={{ mr: 2 }} />}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isLoading}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
        
        {isInstalled && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={resetInstallation}
              disabled={isLoading}
            >
              Reset Installation
            </Button>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Install;
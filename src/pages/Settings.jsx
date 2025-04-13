import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  Container,
  Divider,
  Card,
  CardContent,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  FormControlLabel,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import { Save as SaveIcon, Upload as UploadIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';

const Settings = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  // Business information state
  const [businessName, setBusinessName] = useState('Prateek Tiles and Marble');
  const [businessAddress, setBusinessAddress] = useState('123 Main Street');
  const [businessCity, setBusinessCity] = useState('Mumbai');
  const [businessState, setBusinessState] = useState('Maharashtra');
  const [businessZipCode, setBusinessZipCode] = useState('400001');
  const [businessPhone, setBusinessPhone] = useState('+91 9876543210');
  const [businessEmail, setBusinessEmail] = useState('info@prateektiles.com');
  
  // Logo state
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
    
    if (Object.keys(savedSettings).length > 0) {
      setBusinessName(savedSettings.businessName || 'Prateek Tiles and Marble');
      setBusinessAddress(savedSettings.businessAddress || '123 Main Street');
      setBusinessCity(savedSettings.businessCity || 'Mumbai');
      setBusinessState(savedSettings.businessState || 'Maharashtra');
      setBusinessZipCode(savedSettings.businessZipCode || '400001');
      setBusinessPhone(savedSettings.businessPhone || '+91 9876543210');
      setBusinessEmail(savedSettings.businessEmail || 'info@prateektiles.com');
      
      if (savedSettings.logo) {
        setLogo(savedSettings.logo);
        setLogoPreview(savedSettings.logo);
      }
      
      // Load template selection
      if (savedSettings.selectedTemplate) {
        setSelectedTemplate(savedSettings.selectedTemplate);
      }
    }
  }, []);
  
  // Handle template change
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
  };
  
  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle logo removal
  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview('');
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    const settings = {
      businessName,
      businessAddress,
      businessCity,
      businessState,
      businessZipCode,
      businessPhone,
      businessEmail,
      logo,
      selectedTemplate
    };
    
    // Save to localStorage
    localStorage.setItem('businessSettings', JSON.stringify(settings));
    
    // Show success message
    setSnackbarMessage('Settings saved successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ px: isSmall ? 1 : 2 }}>
      <Box sx={{ my: isSmall ? 2 : 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          className="page-title"
          sx={{ fontSize: isSmall ? '1.5rem' : '2rem' }}
        >
          Business Settings
        </Typography>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
          >
            Business Information
          </Typography>
          
          <Grid container spacing={isSmall ? 2 : 3}>
            <Grid item xs={12}>
              <TextField
                label="Business Name"
                fullWidth
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                fullWidth
                value={businessCity}
                onChange={(e) => setBusinessCity(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                fullWidth
                value={businessState}
                onChange={(e) => setBusinessState(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Zip Code"
                fullWidth
                value={businessZipCode}
                onChange={(e) => setBusinessZipCode(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
          >
            Business Logo
          </Typography>
          
          <Grid container spacing={isSmall ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    size={isSmall ? "small" : "medium"}
                  >
                    Upload Logo
                  </Button>
                </label>
                {logoPreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveLogo}
                    startIcon={<DeleteIcon />}
                    sx={{ ml: 2 }}
                    size={isSmall ? "small" : "medium"}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Recommended size: 200x100 pixels. Max file size: 2MB.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Business Logo" 
                    style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }} 
                  />
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No logo uploaded
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
          >
            Quotation Template
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose a template design for your quotations. The selected template will be used when generating PDF quotations.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'simple' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedTemplate('simple')}
              >
                <Box sx={{ p: 1, bgcolor: selectedTemplate === 'simple' ? 'primary.light' : 'transparent' }}>
                  <Typography variant="subtitle2" align="center">
                    Standard
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box 
                    component="img" 
                    src="/images/template1.svg" 
                    alt="Standard Template" 
                    sx={{ width: '100%', height: 'auto', border: '1px solid #f0f0f0' }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'template2' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedTemplate('template2')}
              >
                <Box sx={{ p: 1, bgcolor: selectedTemplate === 'template2' ? 'primary.light' : 'transparent' }}>
                  <Typography variant="subtitle2" align="center">
                    Green
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box 
                    component="img" 
                    src="/images/template4.svg" 
                    alt="Green Template" 
                    sx={{ width: '100%', height: 'auto', border: '1px solid #f0f0f0' }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'template3' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedTemplate('template3')}
              >
                <Box sx={{ p: 1, bgcolor: selectedTemplate === 'template3' ? 'primary.light' : 'transparent' }}>
                  <Typography variant="subtitle2" align="center">
                    Purple
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box 
                    component="img" 
                    src="/images/template5.svg" 
                    alt="Purple Template" 
                    sx={{ width: '100%', height: 'auto', border: '1px solid #f0f0f0' }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'template4' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedTemplate('template4')}
              >
                <Box sx={{ p: 1, bgcolor: selectedTemplate === 'template4' ? 'primary.light' : 'transparent' }}>
                  <Typography variant="subtitle2" align="center">
                    Orange
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box 
                    component="img" 
                    src="/images/template1.svg" 
                    alt="Orange Template" 
                    sx={{ width: '100%', height: 'auto', border: '1px solid #f0f0f0' }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'template1' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedTemplate('template1')}
              >
                <Box sx={{ p: 1, bgcolor: selectedTemplate === 'template1' ? 'primary.light' : 'transparent' }}>
                  <Typography variant="subtitle2" align="center">
                    Blue
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box 
                    component="img" 
                    src="/images/template3.svg" 
                    alt="Blue Template" 
                    sx={{ width: '100%', height: 'auto', border: '1px solid #f0f0f0' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />} 
            onClick={handleSaveSettings}
            size={isSmall ? "small" : "medium"}
          >
            Save Settings
          </Button>
        </Box>
        
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Settings;
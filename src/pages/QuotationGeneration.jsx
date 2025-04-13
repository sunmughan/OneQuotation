import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';

// Import all templates
import { 
  SimpleTemplate, 
  SimplifiedTemplate,
  Template1, 
  Template2, 
  Template3, 
  Template4, 
  Template5 
} from '../components/templates';

const QuotationGeneration = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  
  const [quotationProducts, setQuotationProducts] = useState([]);
  
  // Customer information
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Staff information
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  // Company information
  const [companyName, setCompanyName] = useState('Prateek Tiles and Marble');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyZipCode, setCompanyZipCode] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  
  // Logo information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState('simple');
  
  // Quotation details
  const [taxRate, setTaxRate] = useState(18); // Default GST rate
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(15);
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Prices are subject to change without prior notice.\n' +
    '2. Delivery timeline: 7-10 working days after confirmation.\n' +
    '3. Payment Terms: 50% advance, balance before delivery.\n' +
    '4. Warranty as per manufacturer terms.\n' +
    '5. This quotation is valid for the mentioned validity period.'
  );
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  useEffect(() => {
    // Load products from localStorage
    const storedProducts = localStorage.getItem('quotationProducts');
    if (storedProducts) {
      setQuotationProducts(JSON.parse(storedProducts));
    }
    
    // Load staff from localStorage
    const savedStaff = JSON.parse(localStorage.getItem('staff') || '[]');
    setStaffList(savedStaff);
    
    // Load business settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
    if (Object.keys(savedSettings).length > 0) {
      setCompanyName(savedSettings.businessName || 'Prateek Tiles and Marble');
      setCompanyAddress(savedSettings.businessAddress || '123 Main Street');
      setCompanyCity(savedSettings.businessCity || 'Mumbai');
      setCompanyState(savedSettings.businessState || 'Maharashtra');
      setCompanyZipCode(savedSettings.businessZipCode || '400001');
      setCompanyPhone(savedSettings.businessPhone || '+91 9876543210');
      setCompanyEmail(savedSettings.businessEmail || 'info@prateektiles.com');
      
      // Set logo from business settings
      if (savedSettings.logo) {
        setCompanyLogo(savedSettings.logo);
        setLogoPreview(savedSettings.logo);
      }
      
      // Set template from business settings
      if (savedSettings.selectedTemplate) {
        setSelectedTemplate(savedSettings.selectedTemplate);
      }
    } else {
      // Set default company information if no settings found
      setCompanyAddress('123 Main Street');
      setCompanyCity('Mumbai');
      setCompanyState('Maharashtra');
      setCompanyZipCode('400001');
      setCompanyPhone('+91 9876543210');
      setCompanyEmail('info@prateektiles.com');
    }
    
    // Generate a unique quotation number
    const generateQuotationNumber = () => {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `PTM-${year}${month}${day}-${random}`;
    };
    
    setQuotationNumber(generateQuotationNumber());
  }, []);
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return quotationProducts.reduce((total, product) => {
      const productTotal = product.price * product.quantity;
      const discountAmount = (productTotal * product.discount) / 100;
      return total + (productTotal - discountAmount);
    }, 0);
  };
  
  // Calculate tax amount
  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * taxRate) / 100;
  };
  
  // Calculate grand total
  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    return subtotal + taxAmount;
  };
  
  // Handle staff selection
  const handleStaffChange = (event, newValue) => {
    setSelectedStaff(newValue);
    
    // Always update the company address with branch information when staff is selected
    if (newValue) {
      setCompanyAddress(newValue.branchAddress || '123 Main Street');
      setCompanyCity(newValue.branchCity || 'Mumbai');
      setCompanyState(newValue.branchState || 'Maharashtra');
      setCompanyZipCode(newValue.branchZipCode || '400001');
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setCompanyLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle logo removal
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setCompanyLogo(null);
  };
  
  // Handle saving the quotation
  const handleSaveQuotation = () => {
    if (!customerName) {
      setSnackbarMessage('Please enter customer name');
      setSnackbarOpen(true);
      return;
    }
    
    if (!selectedStaff) {
      setSnackbarMessage('Please select a salesperson');
      setSnackbarOpen(true);
      return;
    }
    
    const quotationData = {
      id: uuidv4(),
      quotationNumber,
      quotationDate,
      validityDays,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      // Staff information
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffPosition: selectedStaff.position,
      staffCode: selectedStaff.staffCode,
      // Company information
      companyName,
      companyAddress,
      companyCity,
      companyState,
      companyZipCode,
      companyPhone,
      companyEmail,
      // Products and pricing
      products: quotationProducts,
      taxRate,
      subtotal: calculateSubtotal(),
      taxAmount: calculateTaxAmount(),
      grandTotal: calculateGrandTotal(),
      termsAndConditions,
      createdAt: new Date().toISOString()
    };
    
    // Get existing quotations from localStorage
    const existingQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
    
    // Add new quotation
    const updatedQuotations = [quotationData, ...existingQuotations];
    
    // Save to localStorage
    localStorage.setItem('savedQuotations', JSON.stringify(updatedQuotations));
    
    setSnackbarMessage('Quotation saved successfully');
    setSnackbarOpen(true);
    
    // Navigate to quotation management after a short delay
    setTimeout(() => {
      navigate('/manage');
    }, 1500);
  };
  
  // Function to convert number to words for Indian Rupee format
  const convertNumberToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWord = (num) => {
      if (num < 20) return ones[num];
      return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    };
    
    if (amount === 0) return 'Zero Rupees Only';
    
    let words = '';
    const amountStr = amount.toFixed(2);
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    
    // Convert rupees
    if (rupees > 0) {
      if (rupees >= 10000000) {
        words += numToWord(Math.floor(rupees / 10000000)) + ' Crore ';
        rupees %= 10000000;
      }
      
      if (rupees >= 100000) {
        words += numToWord(Math.floor(rupees / 100000)) + ' Lakh ';
        rupees %= 100000;
      }
      
      if (rupees >= 1000) {
        words += numToWord(Math.floor(rupees / 1000)) + ' Thousand ';
        rupees %= 1000;
      }
      
      if (rupees >= 100) {
        words += numToWord(Math.floor(rupees / 100)) + ' Hundred ';
        rupees %= 100;
      }
      
      if (rupees > 0) {
        words += numToWord(rupees);
      }
      
      words += ' Rupees';
    }
    
    // Convert paise
    if (paise > 0) {
      words += ' And ' + numToWord(paise) + ' Paise';
    }
    
    return 'INR ' + words + ' Only.';
  };
  
  // Handle generating PDF
  const handleGeneratePDF = () => {
    if (!customerName) {
      setSnackbarMessage('Please enter customer name');
      setSnackbarOpen(true);
      return;
    }
    
    if (!selectedStaff) {
      setSnackbarMessage('Please select a salesperson');
      setSnackbarOpen(true);
      return;
    }
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Import the registerFonts function
    const { registerFonts } = require('../utils/pdfFonts');
    
    // Register fonts before generating PDF
    registerFonts(doc);
    
    // Prepare data for template
    const templateData = {
      // Company information
      companyName,
      companyAddress,
      companyCity,
      companyState,
      companyZipCode,
      companyPhone,
      companyEmail,
      companyLogo,
      
      // Customer information
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      
      // Staff information
      staffName: selectedStaff.name,
      staffPosition: selectedStaff.position,
      staffCode: selectedStaff.staffCode,
      
      // Quotation details
      quotationNumber,
      quotationDate,
      validUntil: (() => {
        const validUntilDate = new Date(quotationDate);
        validUntilDate.setDate(validUntilDate.getDate() + parseInt(validityDays));
        return validUntilDate.toISOString().split('T')[0];
      })(),
      products: quotationProducts,
      taxRate,
      subtotal: calculateSubtotal(),
      taxAmount: calculateTaxAmount(),
      grandTotal: calculateGrandTotal(),
      totalInWords: convertNumberToWords(calculateGrandTotal()),
      termsAndConditions
    };
    
    // Get the selected template from business settings
    const savedSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
    const templateToUse = savedSettings.selectedTemplate || 'simple';
    
    // Use the selected template
    switch (templateToUse) {
      case 'simple':
        SimpleTemplate(templateData, doc);
        break;
      case 'simplified':
        SimplifiedTemplate(templateData, doc);
        break;
      case 'template1':
        Template1(templateData, doc);
        break;
      case 'template2':
        Template2(templateData, doc);
        break;
      case 'template3':
        Template3(templateData, doc);
        break;
      case 'template4':
        Template4(templateData, doc);
        break;
      case 'template5':
        Template5(templateData, doc);
        break;
      default:
        SimpleTemplate(templateData, doc);
    }
    
    // Save the PDF
    doc.save(`Quotation_${quotationNumber}.pdf`);
    
    setSnackbarMessage('PDF generated successfully');
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
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
          Generate Quotation
        </Typography>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
          >
            Customer Information
          </Typography>
          
          <Grid container spacing={isSmall ? 2 : 3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                fullWidth
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                fullWidth
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
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
            Quotation Details
          </Typography>
          
          <Grid container spacing={isSmall ? 2 : 3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Quotation Number"
                fullWidth
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                InputProps={{ readOnly: true }}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Validity (Days)"
                type="number"
                fullWidth
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 15)}
                InputProps={{ inputProps: { min: 1 } }}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST Rate (%)"
                type="number"
                fullWidth
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                size={isSmall ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={staffList}
                getOptionLabel={(option) => `${option.name} (${option.branch})`}
                value={selectedStaff}
                onChange={handleStaffChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Salesperson"
                    fullWidth
                    required
                    size={isSmall ? "small" : "medium"}
                  />
                )}
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
            Products
          </Typography>
          
          {quotationProducts.length === 0 ? (
            <Alert severity="info">
              No products added to quotation yet. Please select products first.
            </Alert>
          ) : (
            <Box className="responsive-table" sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size={isSmall ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Unit Price (₹)</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotationProducts.map((product) => {
                      // Calculate discounted unit price
                      const discountedUnitPrice = product.price - (product.price * product.discount / 100);
                      const finalTotal = discountedUnitPrice * product.quantity;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: isSmall ? '0.75rem' : '0.875rem' }}>
                                {product.brand} {product.productCode && `- ${product.productCode}`}
                              </Typography>
                              {product.description && (
                                <Typography variant="body2" sx={{ fontSize: isSmall ? '0.75rem' : '0.875rem' }}>
                                  {product.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">₹{discountedUnitPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">₹{finalTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        Subtotal:
                      </TableCell>
                      <TableCell align="right">
                        ₹{calculateSubtotal().toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        GST ({taxRate}%):
                      </TableCell>
                      <TableCell align="right">
                        ₹{calculateTaxAmount().toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        Grand Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ₹{calculateGrandTotal().toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
          >
            Terms and Conditions
          </Typography>
          
          <TextField
            multiline
            rows={4}
            fullWidth
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            size={isSmall ? "small" : "medium"}
          />
        </Paper>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: isSmall ? 'column' : 'row',
          gap: isSmall ? 2 : 0
        }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
            sx={{ width: isSmall ? '100%' : 'auto' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveQuotation}
            sx={{ width: isSmall ? '100%' : 'auto' }}
          >
            Generate Quotation
          </Button>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuotationGeneration;
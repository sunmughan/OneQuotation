import React, { useState, useEffect, Suspense } from 'react';
import ProductManagementSection from '../components/ProductManagementSection';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

// Get products from localStorage
const getProductsFromStorage = () => {
  const savedProducts = JSON.parse(localStorage.getItem('products') || '{}');
  return {
    tiles: savedProducts.tiles || [],
    adhesive: savedProducts.adhesive || [],
    'cp-sw': savedProducts['cp-sw'] || []
  };
};

const ProductConfiguration = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  
  // Form state for adding a new product
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // Load products from localStorage on component mount
  useEffect(() => {
    const products = getProductsFromStorage();
    setAvailableProducts(products[category] || []);
  }, [category]);
  
  // Get category display name
  const getCategoryName = () => {
    switch(category) {
      case 'tiles': return 'Tiles';
      case 'adhesive': return 'Adhesive';
      case 'cp-sw': return 'CP & SW';
      default: return 'Products';
    }
  };

  // Get available products is now handled by the useEffect

  // Calculate total amount
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const productTotal = product.price * product.quantity;
      const discountAmount = (productTotal * product.discount) / 100;
      return total + (productTotal - discountAmount);
    }, 0);
  };

  // Handle adding a product to the quotation
  const handleAddProduct = () => {
    if (!selectedProduct) {
      setSnackbarMessage('Please select a product');
      setSnackbarOpen(true);
      return;
    }

    const productToAdd = availableProducts.find(p => p.id === selectedProduct);
    if (!productToAdd) return;

    let newProduct = {
      id: uuidv4(),
      productId: productToAdd.id,
      brand: productToAdd.brand,
      quantity: quantity,
      price: price,
      discount: discount
    };

    // Add category-specific properties
    if (category === 'tiles') {
      newProduct = {
        ...newProduct,
        shadeName: productToAdd.shadeName,
        dimensions: productToAdd.dimensions,
        surface: productToAdd.surface,
        areaOfApplication: productToAdd.areaOfApplication,
        image: productToAdd.image
      };
    } else if (category === 'adhesive') {
      newProduct = {
        ...newProduct,
        category: productToAdd.category
      };
    } else { // cp-sw
      newProduct = {
        ...newProduct,
        productCode: productToAdd.productCode,
        description: productToAdd.description,
        image: productToAdd.image
      };
    }

    setSelectedProducts([...selectedProducts, newProduct]);
    
    // Reset form
    setSelectedProduct('');
    setQuantity(1);
    setPrice(0);
    setDiscount(0);
    
    setSnackbarMessage('Product added to quotation');
    setSnackbarOpen(true);
  };

  // Handle removing a product from the quotation
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
    setSnackbarMessage('Product removed from quotation');
    setSnackbarOpen(true);
  };

  // Handle product selection change
  const handleProductChange = (event) => {
    const productId = event.target.value;
    setSelectedProduct(productId);
    
    if (productId) {
      const product = availableProducts.find(p => p.id === productId);
      if (product) {
        if (category === 'tiles') {
          setPrice(product.discountedPrice || product.mrp);
        } else if (category === 'adhesive') {
          setPrice(product.dPrice || product.mrp);
        } else { // cp-sw
          setPrice(product.dPrice || product.mrp);
        }
      }
    } else {
      setPrice(0);
    }
  };

  // Handle proceeding to quotation generation
  const handleProceedToQuotation = () => {
    if (selectedProducts.length === 0) {
      setSnackbarMessage('Please add at least one product to generate a quotation');
      setSnackbarOpen(true);
      return;
    }
    
    // Store selected products in localStorage for the next page
    localStorage.setItem('quotationProducts', JSON.stringify(selectedProducts));
    navigate('/generate');
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
          Configure {getCategoryName()}
        </Typography>

        <Grid container spacing={isSmall ? 2 : 3}>
          {/* Product Selection Form */}
          <Grid item xs={12} md={4}>
            <Paper className="section" sx={{ p: isSmall ? 2 : 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
              >
                Add Products
              </Typography>
              
              <FormControl fullWidth margin="normal" size={isSmall ? "small" : "medium"}>
                <InputLabel>Select Product</InputLabel>
                <Select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  label="Select Product"
                >
                  <MenuItem value="">-- Select a product --</MenuItem>
                  {availableProducts.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {category === 'tiles' ? `${product.brand} - ${product.shadeName}` :
                       category === 'adhesive' ? `${product.brand} - ${product.category}` :
                       `${product.brand} - ${product.productCode}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Grid container spacing={isSmall ? 1 : 2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    InputProps={{ startAdornment: '₹' }}
                    size={isSmall ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    size={isSmall ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Discount (%)"
                    type="number"
                    fullWidth
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    size={isSmall ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                fullWidth
                sx={{ mt: 2, py: isSmall ? 0.75 : 1 }}
              >
                Add to Quotation
              </Button>
            </Paper>
          </Grid>
          
          {/* Selected Products */}
          <Grid item xs={12} md={8}>
            <Paper className="section" sx={{ p: isSmall ? 2 : 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
              >
                Selected Products
              </Typography>
              
              {selectedProducts.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No products selected. Please add products to generate a quotation.
                </Alert>
              ) : (
                <Box className="responsive-table" sx={{ overflowX: 'auto' }}>
                  <TableContainer>
                    <Table size={isSmall ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Price (₹)</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Discount (%)</TableCell>
                          <TableCell align="right">Total (₹)</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProducts.map((product) => {
                          const productTotal = product.price * product.quantity;
                          const discountAmount = (productTotal * product.discount) / 100;
                          const finalTotal = productTotal - discountAmount;
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                {category === 'tiles' ? `${product.brand} - ${product.shadeName}` :
                                 category === 'adhesive' ? `${product.brand} - ${product.category}` :
                                 `${product.brand} - ${product.productCode}`}
                              </TableCell>
                              <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                              <TableCell align="right">{product.quantity}</TableCell>
                              <TableCell align="right">{product.discount}%</TableCell>
                              <TableCell align="right">{finalTotal.toFixed(2)}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveProduct(product.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              {selectedProducts.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
                          >
                            Quotation Summary
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: isSmall ? '0.875rem' : '1rem' }}>
                            Total Products: {selectedProducts.length}
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 2, fontSize: isSmall ? '1.25rem' : '1.5rem' }}>
                            Total: ₹{calculateTotal().toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size={isSmall ? "medium" : "large"}
                          onClick={handleProceedToQuotation}
                          sx={{ py: isSmall ? 1 : 1.5 }}
                        >
                          Proceed to Quotation
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Product Management Section */}
        <Grid container spacing={isSmall ? 2 : 3} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <ProductManagementSection category={category} />
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductConfiguration;
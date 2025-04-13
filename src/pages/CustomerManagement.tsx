import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  customerCode: string;
}

const CustomerManagement: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  
  // State for customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Form state
  const [formData, setFormData] = useState<Customer>({
    id: '',
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    customerCode: ''
  });
  
  // Load customers from localStorage on component mount
  useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    setCustomers(savedCustomers);
    setFilteredCustomers(savedCustomers);
  }, []);
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.companyName.toLowerCase().includes(term.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };
  
  // Handle form change
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open dialog for adding a new customer
  const handleAddCustomer = () => {
    setDialogMode('add');
    setFormData({
      id: '',
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      customerCode: `CUST${String(customers.length + 1).padStart(4, '0')}` // Generate customer code
    });
    setDialogOpen(true);
  };
  
  // Open dialog for editing a customer
  const handleEditCustomer = (customer: Customer) => {
    setDialogMode('edit');
    setSelectedCustomer(customer);
    setFormData(customer);
    setDialogOpen(true);
  };
  
  // Handle save customer
  const handleSaveCustomer = () => {
    let newCustomers: Customer[];
    let message: string;
    
    if (dialogMode === 'add') {
      const newCustomer = {
        ...formData,
        id: uuidv4()
      };
      newCustomers = [...customers, newCustomer];
      message = 'Customer added successfully';
    } else {
      newCustomers = customers.map(customer =>
        customer.id === selectedCustomer?.id ? { ...formData } : customer
      );
      message = 'Customer updated successfully';
    }
    
    // Update state and localStorage
    setCustomers(newCustomers);
    setFilteredCustomers(newCustomers);
    localStorage.setItem('customers', JSON.stringify(newCustomers));
    
    // Show success message
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Close dialog
    handleDialogClose();
  };
  
  // Handle delete customer
  const handleDeleteCustomer = (customerId: string) => {
    const newCustomers = customers.filter(customer => customer.id !== customerId);
    
    // Update state and localStorage
    setCustomers(newCustomers);
    setFilteredCustomers(newCustomers);
    localStorage.setItem('customers', JSON.stringify(newCustomers));
    
    // Show success message
    setSnackbarMessage('Customer deleted successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
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
          Customer Management
        </Typography>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h6"
              sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
            >
              Customers
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Search customers"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '250px' }}
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddCustomer}
              >
                Add Customer
              </Button>
            </Box>
          </Box>
          
          {filteredCustomers.length === 0 ? (
            <Alert severity="info">
              No customers found. Add some customers to get started.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.customerCode}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.companyName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{`${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      
      {/* Add/Edit Customer Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Customer' : 'Edit Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Name"
                fullWidth
                value={formData.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="companyName"
                label="Company Name"
                fullWidth
                value={formData.companyName}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formData.email}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="city"
                label="City"
                fullWidth
                value={formData.city}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="state"
                label="State"
                fullWidth
                value={formData.state}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="zipCode"
                label="ZIP Code"
                fullWidth
                value={formData.zipCode}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveCustomer} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerManagement;
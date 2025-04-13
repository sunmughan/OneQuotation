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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
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

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  branch: string;
  branchAddress: string;
  branchCity: string;
  branchState: string;
  branchZipCode: string;
  staffCode: string;
}

const StaffManagement: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  
  // State for staff
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaffList, setFilteredStaffList] = useState<Staff[]>([]);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Form state
  const [formData, setFormData] = useState<Staff>({
    id: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    branch: '',
    branchAddress: '',
    branchCity: '',
    branchState: '',
    branchZipCode: '',
    staffCode: ''
  });
  
  // Load staff from localStorage on component mount
  useEffect(() => {
    const savedStaff = JSON.parse(localStorage.getItem('staff') || '[]');
    setStaffList(savedStaff);
    setFilteredStaffList(savedStaff);
  }, []);
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    const filtered = staffList.filter(staff =>
      staff.name.toLowerCase().includes(term.toLowerCase()) ||
      staff.position.toLowerCase().includes(term.toLowerCase()) ||
      staff.staffCode.toLowerCase().includes(term.toLowerCase()) ||
      staff.branch.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStaffList(filtered);
  };
  
  // Handle form change
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target as { name: string; value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open dialog for adding a new staff
  const handleAddStaff = () => {
    setDialogMode('add');
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      position: '',
      branch: '',
      branchAddress: '',
      branchCity: '',
      branchState: '',
      branchZipCode: '',
      staffCode: `STAFF${String(staffList.length + 1).padStart(4, '0')}` // Generate staff code
    });
    setDialogOpen(true);
  };
  
  // Open dialog for editing a staff
  const handleEditStaff = (staff: Staff) => {
    setDialogMode('edit');
    setSelectedStaff(staff);
    setFormData(staff);
    setDialogOpen(true);
  };
  
  // Handle save staff
  const handleSaveStaff = () => {
    let newStaffList: Staff[];
    let message: string;
    
    if (dialogMode === 'add') {
      const newStaff = {
        ...formData,
        id: uuidv4()
      };
      newStaffList = [...staffList, newStaff];
      message = 'Staff added successfully';
    } else {
      newStaffList = staffList.map(staff =>
        staff.id === selectedStaff?.id ? { ...formData } : staff
      );
      message = 'Staff updated successfully';
    }
    
    // Update state and localStorage
    setStaffList(newStaffList);
    setFilteredStaffList(newStaffList);
    localStorage.setItem('staff', JSON.stringify(newStaffList));
    
    // Show success message
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Close dialog
    handleDialogClose();
  };
  
  // Handle delete staff
  const handleDeleteStaff = (staffId: string) => {
    const newStaffList = staffList.filter(staff => staff.id !== staffId);
    
    // Update state and localStorage
    setStaffList(newStaffList);
    setFilteredStaffList(newStaffList);
    localStorage.setItem('staff', JSON.stringify(newStaffList));
    
    // Show success message
    setSnackbarMessage('Staff deleted successfully');
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
          Staff Management
        </Typography>
        
        <Paper className="section" sx={{ p: isSmall ? 2 : 3, mb: isSmall ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isSmall ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isSmall ? 'flex-start' : 'center', 
            gap: isSmall ? 2 : 0,
            mb: isSmall ? 2 : 3 
          }}>
            <Typography 
              variant="h6"
              sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
            >
              Staff Members
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Search staff"
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
                onClick={handleAddStaff}
              >
                Add Staff
              </Button>
            </Box>
          </Box>
          
          {filteredStaffList.length === 0 ? (
            <Alert severity="info">
              No staff found. Add some staff members to get started.
            </Alert>
          ) : (
            <Box className="responsive-table">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Phone</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Branch</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStaffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.staffCode}</TableCell>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{staff.email}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{staff.phone}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{staff.branch}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditStaff(staff)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteStaff(staff.id)}
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
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Add/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Staff' : 'Edit Staff'}
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
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="position"
                label="Position"
                fullWidth
                value={formData.position}
                onChange={handleFormChange}
                required
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
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Branch Information
              </Typography>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="branch"
                label="Branch Name"
                fullWidth
                value={formData.branch}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="staffCode"
                label="Staff Code"
                fullWidth
                value={formData.staffCode}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="branchAddress"
                label="Branch Address"
                fullWidth
                value={formData.branchAddress}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="branchCity"
                label="City"
                fullWidth
                value={formData.branchCity}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="branchState"
                label="State"
                fullWidth
                value={formData.branchState}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="branchZipCode"
                label="ZIP Code"
                fullWidth
                value={formData.branchZipCode}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveStaff} variant="contained" color="primary">
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

export default StaffManagement;
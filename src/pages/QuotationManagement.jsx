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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Chip,
  Tooltip,
  Alert,
  Pagination,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const QuotationManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  useEffect(() => {
    // Load saved quotations from localStorage
    const savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
    setQuotations(savedQuotations);
    setFilteredQuotations(savedQuotations);
  }, []);
  
  // Handle search
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredQuotations(quotations);
    } else {
      const filtered = quotations.filter(quotation => 
        quotation.customerName.toLowerCase().includes(term) ||
        quotation.quotationNumber.toLowerCase().includes(term) ||
        quotation.customerEmail?.toLowerCase().includes(term) ||
        quotation.customerPhone?.includes(term)
      );
      setFilteredQuotations(filtered);
    }
    
    setCurrentPage(1);
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (quotation) => {
    setQuotationToDelete(quotation);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setQuotationToDelete(null);
  };
  
  // Handle delete quotation
  const handleDeleteQuotation = () => {
    if (!quotationToDelete) return;
    
    const updatedQuotations = quotations.filter(q => q.id !== quotationToDelete.id);
    setQuotations(updatedQuotations);
    setFilteredQuotations(updatedQuotations.filter(quotation => {
      if (searchTerm.trim() === '') return true;
      return (
        quotation.customerName.toLowerCase().includes(searchTerm) ||
        quotation.quotationNumber.toLowerCase().includes(searchTerm) ||
        quotation.customerEmail?.toLowerCase().includes(searchTerm) ||
        quotation.customerPhone?.includes(searchTerm)
      );
    }));
    
    // Update localStorage
    localStorage.setItem('savedQuotations', JSON.stringify(updatedQuotations));
    
    handleDeleteDialogClose();
  };
  
  // Handle view quotation
  const handleViewQuotation = (quotation) => {
    // Store the selected quotation in localStorage
    localStorage.setItem('quotationProducts', JSON.stringify(quotation.products));
    
    // Navigate to quotation generation page
    navigate('/generate');
  };
  
  // Handle download quotation as PDF
  const handleDownloadQuotation = (quotation) => {
    const doc = new jsPDF();
    
    // Add company logo and header
    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210); // Primary color
    doc.text('Prateek Tiles and Marble', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Professional Quotation', 105, 30, { align: 'center' });
    
    // Add quotation details
    doc.setFontSize(10);
    doc.text(`Quotation #: ${quotation.quotationNumber}`, 15, 45);
    doc.text(`Date: ${quotation.quotationDate}`, 15, 52);
    doc.text(`Valid for: ${quotation.validityDays} days`, 15, 59);
    
    // Add customer details
    doc.text('Customer Details:', 130, 45);
    doc.text(`Name: ${quotation.customerName}`, 130, 52);
    if (quotation.customerEmail) doc.text(`Email: ${quotation.customerEmail}`, 130, 59);
    if (quotation.customerPhone) doc.text(`Phone: ${quotation.customerPhone}`, 130, 66);
    if (quotation.customerAddress) doc.text(`Address: ${quotation.customerAddress}`, 130, 73);
    
    // Add product table
    doc.autoTable({
      startY: 85,
      head: [['Product', 'Price (₹)', 'Qty', 'Discount (%)', 'Total (₹)']],
      body: quotation.products.map(product => {
        const productTotal = product.price * product.quantity;
        const discountAmount = (productTotal * product.discount) / 100;
        const finalTotal = productTotal - discountAmount;
        
        return [
          `${product.brand} - ${product.productCode}\n${product.description}`,
          product.price.toFixed(2),
          product.quantity,
          `${product.discount}%`,
          finalTotal.toFixed(2)
        ];
      }),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 15, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.text('Subtotal:', 140, finalY);
    doc.text(`₹ ${quotation.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });
    
    doc.text(`GST (${quotation.taxRate}%):`, 140, finalY + 7);
    doc.text(`₹ ${quotation.taxAmount.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
    
    doc.setFontSize(12);
    doc.text('Grand Total:', 140, finalY + 15);
    doc.text(`₹ ${quotation.grandTotal.toFixed(2)}`, 180, finalY + 15, { align: 'right' });
    
    // Add terms and conditions
    doc.setFontSize(10);
    doc.text('Terms and Conditions:', 15, finalY + 30);
    
    const termsLines = quotation.termsAndConditions.split('\n');
    let termsY = finalY + 37;
    
    termsLines.forEach(line => {
      doc.text(line, 15, termsY);
      termsY += 7;
    });
    
    // Add signature
    doc.text('For Prateek Tiles and Marble', 140, termsY + 15);
    doc.line(140, termsY + 30, 180, termsY + 30);
    doc.text('Authorized Signature', 140, termsY + 35);
    
    // Save the PDF
    doc.save(`Quotation-${quotation.quotationNumber}.pdf`);
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
      <Box sx={{ my: { xs: 1.5, sm: 2, md: 4 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          className="page-title"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
        >
          Quotation Management
        </Typography>
        
        <Paper className="section" sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1.5, sm: 0 },
            mb: { xs: 2, sm: 3 } 
          }}>
            <Typography 
              variant="h6"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}
            >
              Saved Quotations
            </Typography>
            
            <TextField
              placeholder="Search by customer name or quotation number"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize={isSmall ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: { xs: '100%', sm: '300px', md: '350px' },
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '0.9rem' }
                }
              }}
            />
          </Box>
          
          {filteredQuotations.length === 0 ? (
            <Alert severity="info">
              {quotations.length === 0 ? 
                'No quotations have been created yet. Create a new quotation to see it here.' : 
                'No quotations match your search criteria.'}
            </Alert>
          ) : (
            <>
              <TableContainer sx={{ 
                overflowX: 'auto', // Enable horizontal scrolling on small screens
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                }
              }}>
                <Table size={isSmall ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        whiteSpace: 'nowrap',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>Quotation #</TableCell>
                      <TableCell sx={{ 
                        display: { xs: 'none', sm: 'table-cell' },
                        whiteSpace: 'nowrap',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>Date</TableCell>
                      <TableCell sx={{ 
                        whiteSpace: 'nowrap',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>Customer</TableCell>
                      <TableCell align="right" sx={{ 
                        whiteSpace: 'nowrap',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>Amount (₹)</TableCell>
                      <TableCell align="center" sx={{ 
                        whiteSpace: 'nowrap',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentItems.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell sx={{ 
                          px: { xs: 1, sm: 2 },
                          py: { xs: 1, sm: 1.5 }
                        }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'medium',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            {quotation.quotationNumber}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}>
                            Valid for {quotation.validityDays} days
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ 
                          display: { xs: 'none', sm: 'table-cell' },
                          px: { xs: 1, sm: 2 },
                          py: { xs: 1, sm: 1.5 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          {quotation.quotationDate}
                        </TableCell>
                        <TableCell sx={{ 
                          px: { xs: 1, sm: 2 },
                          py: { xs: 1, sm: 1.5 }
                        }}>
                          <Typography variant="body2" sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            {quotation.customerName}
                          </Typography>
                          {quotation.customerPhone && (
                            <Typography variant="caption" color="textSecondary" display="block" sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' }
                            }}>
                              {quotation.customerPhone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          px: { xs: 1, sm: 2 },
                          py: { xs: 1, sm: 1.5 }
                        }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            ₹{quotation.grandTotal.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}>
                            Tax: ₹{quotation.taxAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          px: { xs: 1, sm: 2 },
                          py: { xs: 1, sm: 1.5 }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            gap: { xs: 0.5, sm: 0 }
                          }}>
                            <Tooltip title="View/Edit">
                              <IconButton 
                                size={isSmall ? "small" : "medium"} 
                                color="primary"
                                onClick={() => handleViewQuotation(quotation)}
                                sx={{ p: { xs: 0.5, sm: 1 } }}
                              >
                                <ViewIcon fontSize={isSmall ? "small" : "medium"} />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Download PDF">
                              <IconButton 
                                size={isSmall ? "small" : "medium"} 
                                color="secondary"
                                onClick={() => handleDownloadQuotation(quotation)}
                                sx={{ p: { xs: 0.5, sm: 1 } }}
                              >
                                <DownloadIcon fontSize={isSmall ? "small" : "medium"} />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton 
                                size={isSmall ? "small" : "medium"} 
                                color="error"
                                onClick={() => handleDeleteDialogOpen(quotation)}
                                sx={{ p: { xs: 0.5, sm: 1 } }}
                              >
                                <DeleteIcon fontSize={isSmall ? "small" : "medium"} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Create New Quotation
          </Button>
        </Box>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete quotation {quotationToDelete?.quotationNumber} for {quotationToDelete?.customerName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteQuotation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuotationManagement;
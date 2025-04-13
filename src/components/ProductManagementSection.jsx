import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ProductManagement from '../pages/ProductManagement';

/**
 * ProductManagementSection component
 * 
 * This component renders the product management interface for a specific category
 * It's designed to be embedded within the ProductConfiguration pages
 */
const ProductManagementSection = ({ category }) => {
  return (
    <Paper className="section" sx={{ p: 2, mt: 3 }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ mb: 2 }}
      >
        Manage {category === 'tiles' ? 'Tiles' : 
               category === 'adhesive' ? 'Adhesive' : 
               'CP & SW'} Products
      </Typography>
      
      <Box sx={{ mt: 1 }}>
        {/* Pass the active tab to ProductManagement based on category */}
        <ProductManagement initialTab={category} embedded={true} />
      </Box>
    </Paper>
  );
};

export default ProductManagementSection;
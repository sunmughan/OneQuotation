import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Icons for product categories
import TilesIcon from '@mui/icons-material/Grid4x4';
import AdhesiveIcon from '@mui/icons-material/Opacity';
import CpSwIcon from '@mui/icons-material/Plumbing';

const ProductSelection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

  const productCategories = [
    {
      id: 'tiles',
      name: 'Tiles',
      description: 'Premium quality tiles for flooring and wall applications',
      icon: <TilesIcon sx={{ fontSize: isSmall ? 60 : 80 }} />,
      color: '#1976d2'
    },
    {
      id: 'adhesive',
      name: 'Adhesive',
      description: 'High-performance adhesives for all tiling needs',
      icon: <AdhesiveIcon sx={{ fontSize: isSmall ? 60 : 80 }} />,
      color: '#dc004e'
    },
    {
      id: 'cp-sw',
      name: 'CP & SW',
      description: 'Quality CP fittings and sanitary ware products',
      icon: <CpSwIcon sx={{ fontSize: isSmall ? 60 : 80 }} />,
      color: '#4caf50'
    }
  ];

  const handleCategorySelect = (categoryId) => {
    navigate(`/configure/${categoryId}`);
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
          Select Product Category
        </Typography>
        
        <Paper elevation={0} className="section" sx={{ p: isSmall ? 2 : 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isSmall ? '1rem' : '1.25rem' }}
          >
            Welcome to Prateek Tiles and Marble Quotation System
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ fontSize: isSmall ? '0.875rem' : '1rem' }}
          >
            Please select a product category to begin creating your quotation.
          </Typography>
        </Paper>

        <Grid container spacing={isSmall ? 2 : 4} sx={{ mt: isSmall ? 1 : 2 }}>
          {productCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: isSmall ? 2 : 3,
                    bgcolor: `${category.color}15`
                  }}
                >
                  <Box sx={{ color: category.color }}>
                    {category.icon}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: isSmall ? 1.5 : 2 }}>
                  <Typography 
                    gutterBottom 
                    variant="h5" 
                    component="h2"
                    sx={{ fontSize: isSmall ? '1.25rem' : '1.5rem' }}
                  >
                    {category.name}
                  </Typography>
                  <Typography sx={{ fontSize: isSmall ? '0.875rem' : '1rem' }}>
                    {category.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: isSmall ? 1.5 : 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => handleCategorySelect(category.id)}
                    sx={{ 
                      bgcolor: category.color, 
                      '&:hover': { bgcolor: category.color },
                      py: isSmall ? 0.75 : 1
                    }}
                  >
                    Select & Configure
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductSelection;
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import ProductSelection from './pages/ProductSelection';
import ProductConfiguration from './pages/ProductConfiguration';
import QuotationGeneration from './pages/QuotationGeneration';
import QuotationManagement from './pages/QuotationManagement';
import ProductManagement from './pages/ProductManagement';
import CustomerManagement from './pages/CustomerManagement';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import Install from './pages/Install';
import Layout from './components/Layout';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [isInstalled, setIsInstalled] = useState(true);
  
  useEffect(() => {
    // Check if app is installed by looking for appConfig in localStorage
    const appConfig = localStorage.getItem('appConfig');
    if (!appConfig) {
      setIsInstalled(false);
    } else {
      try {
        const config = JSON.parse(appConfig);
        setIsInstalled(!!config.installed);
      } catch (e) {
        console.error('Error parsing app config:', e);
        setIsInstalled(false);
      }
    }
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/install" element={<Install />} />
        {isInstalled ? (
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<ProductSelection />} />
                <Route path="/configure/:category" element={<ProductConfiguration />} />
                <Route path="/generate" element={<QuotationGeneration />} />
                <Route path="/manage" element={<QuotationManagement />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="/staff" element={<StaffManagement />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          } />
        ) : (
          <Route path="/*" element={<Navigate to="/install" replace />} />
        )}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
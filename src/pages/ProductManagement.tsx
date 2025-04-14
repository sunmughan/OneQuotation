import React, { useState, useEffect, ChangeEvent, SyntheticEvent, useRef } from 'react';

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
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


// Add FormChangeEvent type definition
type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | number } };

interface TilesProduct {
  id: string;
  sno?: string;
  brand: string;
  areaOfApplication: string;
  shadeName: string;
  image: string;
  dimensions: string;
  surface: string;
  mrp: number;
  discount: number;
  discountedPrice: number;
  areaRequired: number;
  noOfBoxes: number;
  totalAmount: number;
  pricePerSqFt: number;
  areaInOneBox: number;
}

interface AdhesiveProduct {
  id: string;
  sno?: string;
  brand: string;
  category: string;
  mrp: number;
  dPrice: number;
  noOfBags: number;
  totalAmount: number;
}

interface CPSWProduct {
  id: string;
  sno?: string;
  brand: string;
  productCode: string;
  description: string;
  image: string;
  mrp: number;
  dPrice: number;
  nos: number;
  totalAmount: number;
}

interface Products {
  tiles: TilesProduct[];
  adhesive: AdhesiveProduct[];
  'cp-sw': CPSWProduct[];
}


interface ProductManagementProps {
  initialTab?: keyof Products;
  embedded?: boolean;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ initialTab = 'tiles', embedded = false }) => {
  // State for tabs
  const [activeTab, setActiveTab] = useState<keyof Products>(initialTab);
  
  // State for products
  const [products, setProducts] = useState<Products>({
    tiles: [],
    adhesive: [],
    'cp-sw': []
  });
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState<(TilesProduct | AdhesiveProduct | CPSWProduct)[]>([]);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<TilesProduct | AdhesiveProduct | CPSWProduct | null>(null);
  
  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // State for bulk import
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{success: number, failed: number, errors: string[]}>({success: 0, failed: 0, errors: []});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for tiles
  const [tilesForm, setTilesForm] = useState<TilesProduct>({
    id: '',
    brand: '',
    areaOfApplication: '',
    shadeName: '',
    image: '',
    dimensions: '',
    surface: '',
    mrp: 0,
    discount: 0,
    discountedPrice: 0,
    areaRequired: 0,
    noOfBoxes: 0,
    totalAmount: 0,
    pricePerSqFt: 0,
    areaInOneBox: 0 // Added missing required property
  });
  
  // Form state for adhesive
  const [adhesiveForm, setAdhesiveForm] = useState<AdhesiveProduct>({
    id: '',
    brand: '',
    category: '',
    mrp: 0,
    dPrice: 0,
    noOfBags: 0,
    totalAmount: 0
  });
  
  // Form state for CP & SW
  const [cpswForm, setCpswForm] = useState<CPSWProduct>({
    id: '',
    brand: '',
    productCode: '',
    description: '',
    image: '',
    mrp: 0,
    dPrice: 0,
    nos: 0,
    totalAmount: 0
  });
  
  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '{}');
    if (Object.keys(savedProducts).length > 0) {
      setProducts(savedProducts);
    }
    filterProducts(activeTab, '');
  }, []);
  
  // Update filtered products when active tab changes
  useEffect(() => {
    filterProducts(activeTab, searchTerm);
  }, [activeTab, products]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: keyof Products) => {
    setActiveTab(newValue);
    setSearchTerm('');
  };
  
  // Update the filterProducts function with proper type handling
  const filterProducts = (category: keyof Products, term: string) => {
    if (!term) {
      setFilteredProducts(products[category]);
    } else {
      const filtered = products[category].filter((product) => {
        if (category === 'tiles') {
          const p = product as TilesProduct;
          return (
            p.brand.toLowerCase().includes(term.toLowerCase()) ||
            p.shadeName.toLowerCase().includes(term.toLowerCase())
          );
        } else if (category === 'adhesive') {
          const p = product as AdhesiveProduct;
          return (
            p.brand.toLowerCase().includes(term.toLowerCase()) ||
            p.category.toLowerCase().includes(term.toLowerCase())
          );
        } else {
          const p = product as CPSWProduct;
          return (
            p.brand.toLowerCase().includes(term.toLowerCase()) ||
            p.productCode.toLowerCase().includes(term.toLowerCase()) ||
            p.description.toLowerCase().includes(term.toLowerCase())
          );
        }
      });
      setFilteredProducts(filtered);
    }
  };
  
  // Handle search
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterProducts(activeTab, term);
  };
  
  // Open dialog for adding a new product
  const handleAddProduct = () => {
    setDialogMode('add');
    
    // Reset form based on active tab
    if (activeTab === 'tiles') {
      setTilesForm({
        id: '',
        brand: '',
        areaOfApplication: '',
        shadeName: '',
        image: '',
        dimensions: '',
        surface: '',
        mrp: 0,
        discount: 0,
        discountedPrice: 0,
        areaRequired: 0,
        noOfBoxes: 0,
        totalAmount: 0,
        pricePerSqFt: 0,
        areaInOneBox: 0
      });
    } else if (activeTab === 'adhesive') {
      setAdhesiveForm({
        id: '',
        brand: '',
        category: '',
        mrp: 0,
        dPrice: 0,
        noOfBags: 0,
        totalAmount: 0
      });
    } else { // cp-sw
      setCpswForm({
        id: '',
        brand: '',
        productCode: '',
        description: '',
        image: '',
        mrp: 0,
        dPrice: 0,
        nos: 0,
        totalAmount: 0
      });
    }
    
    setDialogOpen(true);
  };
  
  // Open dialog for editing a product
  const handleEditProduct = (product: TilesProduct | AdhesiveProduct | CPSWProduct) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    
    // Set form based on active tab
    if (activeTab === 'tiles') {
      setTilesForm({
        ...product as TilesProduct
      });
    } else if (activeTab === 'adhesive') {
      setAdhesiveForm({
        ...(product as AdhesiveProduct)
      });
    } else { // cp-sw
      setCpswForm({
        ...(product as CPSWProduct)
      });
    }
    
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  // Handle form change for tiles
  const handleTilesFormChange = (event: FormChangeEvent): void => {
    const { name, value } = event.target;
    let updatedForm = { ...tilesForm, [name]: value };
    
    // Get current values or updated values based on what changed
    const mrp = name === 'mrp' ? parseFloat(String(value)) || 0 : tilesForm.mrp;
    const discount = name === 'discount' ? parseFloat(String(value)) || 0 : tilesForm.discount;
    const areaRequired = name === 'areaRequired' ? parseFloat(String(value)) || 0 : tilesForm.areaRequired;
    const areaInOneBox = name === 'areaInOneBox' ? parseFloat(String(value)) || 0 : tilesForm.areaInOneBox;
    const pricePerSqFt = name === 'pricePerSqFt' ? parseFloat(String(value)) || 0 : tilesForm.pricePerSqFt || mrp;
    
    // Calculate total amount (MRP × area required) - this should remain unchanged by discount
    const totalAmount = mrp * areaRequired;
    
    // Calculate discounted price by applying the discount percentage
    // Formula: discountedPrice = totalAmount - (totalAmount * discount/100)
    const discountedPrice = totalAmount - (totalAmount * discount / 100);
    
    // Calculate number of boxes based on area required and area in one box
    let noOfBoxes = tilesForm.noOfBoxes;
    
    if (name === 'areaRequired' || name === 'areaInOneBox') {
      if (areaRequired > 0 && areaInOneBox > 0) {
        // Calculate boxes needed based on area required and area in one box
        noOfBoxes = Math.ceil(areaRequired / areaInOneBox);
      } else {
        noOfBoxes = 0;
      }
    } else if (name === 'noOfBoxes') {
      noOfBoxes = parseInt(String(value)) || 0;
    }
    
    // Update all relevant fields
    updatedForm = { 
      ...updatedForm, 
      mrp, 
      discount, 
      discountedPrice, 
      areaRequired, 
      areaInOneBox, 
      noOfBoxes, 
      totalAmount, 
      pricePerSqFt 
    };
    
    setTilesForm(updatedForm as TilesProduct);
  };

  
  // Handle form change for adhesive
  const handleAdhesiveFormChange = (event: FormChangeEvent): void => {
    const { name, value } = event.target;
    let updatedForm = { ...adhesiveForm, [name]: value };
    
    if (name === 'dPrice' || name === 'noOfBags') {
      const dPrice = name === 'dPrice' ? parseFloat(String(value)) || 0 : adhesiveForm.dPrice;
      const noOfBags = name === 'noOfBags' ? parseInt(String(value)) || 0 : adhesiveForm.noOfBags;
      const totalAmount = dPrice * noOfBags;
      updatedForm = { ...updatedForm, dPrice, noOfBags, totalAmount };
    }
    
    setAdhesiveForm(updatedForm as AdhesiveProduct);
  };
  
  // Handle form change for CP & SW
  const handleCpswFormChange = (event: FormChangeEvent): void => {
    const { name, value } = event.target;
    let updatedForm = { ...cpswForm, [name]: value };
    
    if (name === 'dPrice' || name === 'nos') {
      const dPrice = name === 'dPrice' ? parseFloat(String(value)) || 0 : cpswForm.dPrice;
      const nos = name === 'nos' ? parseInt(String(value)) || 0 : cpswForm.nos;
      const totalAmount = dPrice * nos;
      updatedForm = { ...updatedForm, dPrice, nos, totalAmount };
    }
    
    setCpswForm(updatedForm as CPSWProduct);
  };
  
  // Handle image upload with proper type safety
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, category: 'tiles' | 'cp-sw'): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (category === 'tiles') {
          setTilesForm(prev => ({ ...prev, image: result }));
        } else if (category === 'cp-sw') {
          setCpswForm(prev => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle save product
  const handleSaveProduct = (): void => {
    let newProducts = { ...products };
    let message = '';
    
    if (activeTab === 'tiles') {
      if (dialogMode === 'add') {
        const newProduct = {
          ...tilesForm,
          id: uuidv4(),
          sno: (products.tiles.length + 1).toString()
        };
        newProducts.tiles = [...products.tiles, newProduct];
        message = 'Tile product added successfully';
      } else { // edit
        newProducts.tiles = products.tiles.map(product => 
          product.id === selectedProduct?.id ? { ...tilesForm } : product
        );
        message = 'Tile product updated successfully';
      }
    } else if (activeTab === 'adhesive') {
      if (dialogMode === 'add') {
        const newProduct = {
          ...adhesiveForm,
          id: uuidv4(),
          sno: (products.adhesive.length + 1).toString()
        };
        newProducts.adhesive = [...products.adhesive, newProduct];
        message = 'Adhesive product added successfully';
      } else { // edit
        newProducts.adhesive = products.adhesive.map(product => 
          product.id === selectedProduct?.id ? { ...adhesiveForm } : product
        );
        message = 'Adhesive product updated successfully';
      }
    } else { // cp-sw
      if (dialogMode === 'add') {
        const newProduct = {
          ...cpswForm,
          id: uuidv4(),
          sno: (products['cp-sw'].length + 1).toString()
        };
        newProducts['cp-sw'] = [...products['cp-sw'], newProduct];
        message = 'CP & SW product added successfully';
      } else { // edit
        newProducts['cp-sw'] = products['cp-sw'].map(product => 
          product.id === selectedProduct?.id ? { ...cpswForm } : product
        );
        message = 'CP & SW product updated successfully';
      }
    }
    
    // Update state and localStorage
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
    
    // Show success message
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Close dialog
    handleDialogClose();
  };
  
  // Handle delete product
  const handleDeleteProduct = (productId: string): void => {
    let newProducts = { ...products };
    let message = '';
    
    if (activeTab === 'tiles') {
      newProducts.tiles = products.tiles.filter(product => product.id !== productId);
      message = 'Tile product deleted successfully';
    } else if (activeTab === 'adhesive') {
      newProducts.adhesive = products.adhesive.filter(product => product.id !== productId);
      message = 'Adhesive product deleted successfully';
    } else { // cp-sw
      newProducts['cp-sw'] = products['cp-sw'].filter(product => product.id !== productId);
      message = 'CP & SW product deleted successfully';
    }
    
    // Update state and localStorage
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
    
    // Show success message
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  
  // Get category display name
  const getCategoryName = (): string => {
    switch(activeTab) {
      case 'tiles': return 'Tiles';
      case 'adhesive': return 'Adhesive';
      case 'cp-sw': return 'CP & SW';
      default: return 'Products';
    }
  };
  
  // Handle bulk import dialog open
  const handleOpenImportDialog = (): void => {
    setImportDialogOpen(true);
  };
  
  // Handle bulk import dialog close
  const handleCloseImportDialog = (): void => {
    setImportDialogOpen(false);
    setImportResults({success: 0, failed: 0, errors: []});
  };
  
  // Handle file selection for import
  const handleFileSelect = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process the imported file
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        // Use arraybuffer type instead of binary for better compatibility
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        processImportedData(jsonData);
      } catch (error) {
        console.error('Excel import error:', error);
        setImportResults({
          success: 0,
          failed: 0,
          errors: ['Failed to parse Excel file. Please check the file format.']
        });
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      setImportResults({
        success: 0,
        failed: 0,
        errors: ['Error reading file. Please try again.']
      });
      setIsImporting(false);
    };
    
    // Use readAsArrayBuffer instead of readAsBinaryString for better compatibility
    reader.readAsArrayBuffer(file);
    
    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };
  
  // Process the imported data based on active tab
  const processImportedData = (jsonData: any[]): void => {
    if (!jsonData.length) {
      setImportResults({
        success: 0,
        failed: 0,
        errors: ['No data found in the file.']
      });
      setIsImporting(false);
      return;
    }
    
    let newProducts = { ...products };
    let successCount = 0;
    let failedCount = 0;
    let errors: string[] = [];
    
    if (activeTab === 'tiles') {
      jsonData.forEach((row, index) => {
        try {
          // Validate required fields
          if (!row.brand || !row.areaOfApplication || !row.shadeName || !row.dimensions || !row.surface) {
            failedCount++;
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }
          
          // Parse numeric values
          const mrp = parseFloat(row.mrp) || 0;
          const discount = parseFloat(row.discount) || 0;
          const areaRequired = parseFloat(row.areaRequired) || 0;
          const areaInOneBox = parseFloat(row.areaInOneBox) || 0; // New field for area in one box
          
          // Calculate discounted price by subtracting the discount amount from total price
          // Formula: discountedPrice = totalPrice - (totalPrice * discount/100)
          const totalPrice = mrp * areaRequired;
          const discountedPrice = totalPrice - (totalPrice * discount / 100)
          
          // Calculate number of boxes based on area required and area in one box
          let noOfBoxes = 0;
          
          if (areaRequired > 0 && areaInOneBox > 0) {
            // Calculate boxes needed based on area required and area in one box
            noOfBoxes = Math.ceil(areaRequired / areaInOneBox);
          }
          // Calculate total amount using MRP (unchanged by discount)
          const totalAmount = mrp * areaRequired;
          // The discounted price is already calculated above and reflects the discount
          
          // Normalize dimension format to handle both "100 * 200" and "100*200" formats
          // This will standardize the format regardless of spaces around the asterisk
          const normalizedDimensions = typeof row.dimensions === 'string' ? 
            row.dimensions.replace(/\s*\*\s*/g, ' * ') : 
            row.dimensions;
          
          const newProduct: TilesProduct = {
            id: uuidv4(),
            sno: (newProducts.tiles.length + successCount + 1).toString(),
            brand: row.brand,
            areaOfApplication: row.areaOfApplication,
            shadeName: row.shadeName,
            image: '',
            dimensions: normalizedDimensions,
            surface: row.surface,
            mrp,
            discount,
            discountedPrice,
            areaRequired,
            noOfBoxes,
            totalAmount,
            pricePerSqFt: areaRequired > 0 ? discountedPrice / areaRequired : 0,
            areaInOneBox
          };
          
          newProducts.tiles.push(newProduct);
          successCount++;
          
        } catch (error) {
          failedCount++;
          errors.push(`Row ${index + 1}: Invalid data format`);
        }
      });
    } else if (activeTab === 'adhesive') {
      jsonData.forEach((row, index) => {
        try {
          // Validate required fields
          if (!row.brand || !row.category) {
            failedCount++;
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }
          
          // Parse numeric values
          const mrp = parseFloat(row.mrp) || 0;
          const dPrice = parseFloat(row.dPrice) || 0;
          const noOfBags = parseInt(row.noOfBags) || 0;
          const totalAmount = dPrice * noOfBags;
          
          const newProduct: AdhesiveProduct = {
            id: uuidv4(),
            sno: (newProducts.adhesive.length + successCount + 1).toString(),
            brand: row.brand,
            category: row.category,
            mrp,
            dPrice,
            noOfBags,
            totalAmount
          };
          
          newProducts.adhesive.push(newProduct);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Row ${index + 1}: Invalid data format`);
        }
      });
    } else { // cp-sw
      jsonData.forEach((row, index) => {
        try {
          // Validate required fields
          if (!row.brand || !row.productCode || !row.description) {
            failedCount++;
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }
          
          // Parse numeric values
          const mrp = parseFloat(row.mrp) || 0;
          const dPrice = parseFloat(row.dPrice) || 0;
          const nos = parseInt(row.nos) || 0;
          const totalAmount = dPrice * nos;
          
          const newProduct: CPSWProduct = {
            id: uuidv4(),
            sno: (newProducts['cp-sw'].length + successCount + 1).toString(),
            brand: row.brand,
            productCode: row.productCode,
            description: row.description,
            image: '',
            mrp,
            dPrice,
            nos,
            totalAmount
          };
          
          newProducts['cp-sw'].push(newProduct);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Row ${index + 1}: Invalid data format`);
        }
      });
    }
    
    if (successCount > 0) {
      // Update state and localStorage
      setProducts(newProducts);
      localStorage.setItem('products', JSON.stringify(newProducts));
    }
    
    setImportResults({
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10) // Limit to first 10 errors to avoid overwhelming the user
    });
    setIsImporting(false);
  };
  
  // Generate and download template for the current product type
  const handleDownloadTemplate = (): void => {
    let template: any[] = [];
    let fileName = '';
let templateWorksheet: XLSX.WorkSheet;
    
    if (activeTab === 'tiles') {
      template = [{
        brand: 'Sample Brand',
        areaOfApplication: 'Floor',
        shadeName: 'Sample Shade',
        dimensions: '100 * 200', // Format should be 'Length * Breadth' in mm
        surface: 'Matte',
        mrp: 100,
        discount: 10,
        areaRequired: 100, // Area in square feet
        areaInOneBox: 30.92, // Area in one box in square feet
        noOfBoxes: 4, // Automatically calculated based on area required and area in one box
        pricePerSqFt: 90,
        totalAmount: 9000
      }];
      fileName = 'tiles_import_template.xlsx';
    } else if (activeTab === 'adhesive') {
      template = [{
        brand: 'Sample Brand',
        category: 'Tile Adhesive',
        mrp: 500,
        dPrice: 450,
        noOfBags: 10,
        totalAmount: 4500
      }];
      fileName = 'adhesive_import_template.xlsx';
      
      // Add header row with explanations for adhesive
let adhesiveWorksheet = XLSX.utils.json_to_sheet(template);
      adhesiveWorksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
      
      XLSX.utils.sheet_add_aoa(adhesiveWorksheet, [[
        'Brand', 'Category', 'MRP', 'Discounted Price', 'Number of Bags', 'Total Amount'
      ]], { origin: 'A1' });
      
      // Make the header row bold
      const range = XLSX.utils.decode_range(adhesiveWorksheet['!ref'] || 'A1:F1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!adhesiveWorksheet[cellRef]) adhesiveWorksheet[cellRef] = {};
        adhesiveWorksheet[cellRef].s = { font: { bold: true } };
      }
    } else { // cp-sw
      template = [{
        brand: 'Sample Brand',
        productCode: 'CP001',
        description: 'Sample Product Description',
        mrp: 1000,
        dPrice: 900,
        nos: 5,
        totalAmount: 4500
      }];
      fileName = 'cpsw_import_template.xlsx';
    }
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(template);
    
    // Add notes to the worksheet for tiles template
    if (activeTab === 'tiles') {
      // Add cell comments/notes to explain fields
      const comments = [
        { cell: 'D2', comment: 'Format should be "Length * Breadth" in mm' },
        { cell: 'I2', comment: 'Area in 1 Box - Area covered by one box in square feet. Used to calculate number of boxes needed.' },
        { cell: 'J2', comment: 'Number of Boxes will be automatically calculated based on Area Required and Area in 1 Box' }
      ];
      
      // XLSX.js doesn't directly support comments, but we can add a note in the header
      worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      
      // Add a header row with explanations
      XLSX.utils.sheet_add_aoa(worksheet, [[
        'Brand', 'Area of Application', 'Shade Name', 'Dimensions', 'Surface', 'MRP', 'Discount', 'Area Required', 'Area in 1 Box', 'No of Boxes', 'Price Per SqFt', 'Total Amount'
      ]], { origin: 'A1' });
      
      // Make the header row bold
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:L1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellRef]) worksheet[cellRef] = {};
        worksheet[cellRef].s = { font: { bold: true } };
      }
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(data, fileName);
    
    // Show success message
    setSnackbarMessage(`Template for ${getCategoryName()} downloaded successfully`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  return (
    <Container maxWidth="lg" sx={{ px: embedded ? 0 : 2, width: '100%' }}>
      <Box sx={{ my: embedded ? 0 : 4 }}>
        <Typography variant="h4" component="h1" gutterBottom className="page-title">
          Product Management
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Tiles" value="tiles" />
            <Tab label="Adhesive" value="adhesive" />
            <Tab label="CP & SW" value="cp-sw" />
          </Tabs>
        </Paper>
        
        <Paper className="section" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {getCategoryName()} Products
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder={`Search ${getCategoryName()}`}
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
                onClick={handleAddProduct}
              >
                Add {getCategoryName().slice(0, -1)}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleOpenImportDialog}
              >
                Bulk Import
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
            </Box>
          </Box>
          
          {filteredProducts.length === 0 ? (
            <Alert severity="info">
              No {getCategoryName().toLowerCase()} products found. Add some products to get started.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Brand</TableCell>
                    
                    {activeTab === 'tiles' && (
                      <>
                        <TableCell>Area of Application</TableCell>
                        <TableCell>Shade Name</TableCell>
                        <TableCell>Dimensions (MM)</TableCell>
                        <TableCell>Surface</TableCell>
                        <TableCell align="right">MRP (₹)</TableCell>
                        <TableCell align="right">Discount (%)</TableCell>
                        <TableCell align="right">Discounted Price (₹)</TableCell>
                        <TableCell align="right">Price/Sq.Ft (₹)</TableCell>
                      </>
                    )}
                    
                    {activeTab === 'adhesive' && (
                      <>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">MRP (₹)</TableCell>
                        <TableCell align="right">D Price (₹)</TableCell>
                      </>
                    )}
                    
                    {activeTab === 'cp-sw' && (
                      <>
                        <TableCell>Product Code</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">MRP (₹)</TableCell>
                        <TableCell align="right">D Price (₹)</TableCell>
                      </>
                    )}
                    
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.sno}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      
                      {activeTab === 'tiles' && (
                        <>
                          <TableCell>{(product as TilesProduct).areaOfApplication}</TableCell>
                          <TableCell>{(product as TilesProduct).shadeName}</TableCell>
                          <TableCell>{(product as TilesProduct).dimensions}</TableCell>
                          <TableCell>{(product as TilesProduct).surface}</TableCell>
                          <TableCell align="right">{product.mrp}</TableCell>
                          <TableCell align="right">{(product as TilesProduct).discount}%</TableCell>
                          <TableCell align="right">{(product as TilesProduct).discountedPrice}</TableCell>
                          <TableCell align="right">{(product as TilesProduct).pricePerSqFt}</TableCell>
                        </>
                      )}
                      
                      {activeTab === 'adhesive' && (
                        <>
                          <TableCell>{(product as AdhesiveProduct).category}</TableCell>
                          <TableCell align="right">{product.mrp}</TableCell>
                          <TableCell align="right">{(product as AdhesiveProduct).dPrice}</TableCell>
                        </>
                      )}
                      
                      {activeTab === 'cp-sw' && (
                        <>
                          <TableCell>{(product as CPSWProduct).productCode}</TableCell>
                          <TableCell>{(product as CPSWProduct).description}</TableCell>
                          <TableCell align="right">{product.mrp}</TableCell>
                          <TableCell align="right">{(product as CPSWProduct).dPrice}</TableCell>
                        </>
                      )}
                      
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditProduct(product)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteProduct(product.id)}
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
      
      {/* Add/Edit Product Dialog - Tiles Form */}
      <Dialog open={dialogOpen && activeTab === 'tiles'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? `Add New ${getCategoryName().slice(0, -1)}` : `Edit ${getCategoryName().slice(0, -1)}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={tilesForm.brand}
                onChange={handleTilesFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area of Application"
                name="areaOfApplication"
                value={tilesForm.areaOfApplication}
                onChange={handleTilesFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shade Name"
                name="shadeName"
                value={tilesForm.shadeName}
                onChange={handleTilesFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dimensions (MM)"
                name="dimensions"
                value={tilesForm.dimensions}
                onChange={handleTilesFormChange}
                margin="normal"
                placeholder="Length * Breadth (e.g. 100 * 200)"
                helperText="Enter as Length * Breadth in millimeters"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Surface"
                name="surface"
                value={tilesForm.surface}
                onChange={handleTilesFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MRP (₹)"
                name="mrp"
                type="number"
                value={tilesForm.mrp}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discount (%)"
                name="discount"
                type="number"
                value={tilesForm.discount}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area Required (Sq Feet)"
                name="areaRequired"
                type="number"
                value={tilesForm.areaRequired}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Total area required in square feet"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area in 1 Box (Sq Feet)"
                name="areaInOneBox"
                type="number"
                value={tilesForm.areaInOneBox}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Enter the area covered by one box in square feet."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="No of Boxes"
                name="noOfBoxes"
                type="number"
                value={tilesForm.noOfBoxes}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Automatically calculated based on area required and area in one box"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price Per Sq Ft (₹)"
                name="pricePerSqFt"
                type="number"
                value={tilesForm.pricePerSqFt}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discounted Price (₹)"
                name="discountedPrice"
                type="number"
                value={tilesForm.discountedPrice}
                onChange={handleTilesFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Amount (₹)"
                name="totalAmount"
                type="number"
                value={tilesForm.totalAmount}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'tiles')}
                />
              </Button>
              {tilesForm.image && (
                <Box sx={{ mt: 2, maxWidth: '200px' }}>
                  <img src={tilesForm.image} alt="Tile Preview" style={{ width: '100%' }} />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Product Dialog - Adhesive Form */}
      <Dialog open={dialogOpen && activeTab === 'adhesive'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? `Add New ${getCategoryName().slice(0, -1)}` : `Edit ${getCategoryName().slice(0, -1)}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={adhesiveForm.brand}
                onChange={handleAdhesiveFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={adhesiveForm.category}
                onChange={handleAdhesiveFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MRP (₹)"
                name="mrp"
                type="number"
                value={adhesiveForm.mrp}
                onChange={handleAdhesiveFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="D Price (₹)"
                name="dPrice"
                type="number"
                value={adhesiveForm.dPrice}
                onChange={handleAdhesiveFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="No of Bags"
                name="noOfBags"
                type="number"
                value={adhesiveForm.noOfBags}
                onChange={handleAdhesiveFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Amount (₹)"
                name="totalAmount"
                type="number"
                value={adhesiveForm.totalAmount}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Product Dialog - CP & SW Form */}
      <Dialog open={dialogOpen && activeTab === 'cp-sw'} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? `Add New ${getCategoryName().slice(0, -1)}` : `Edit ${getCategoryName().slice(0, -1)}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={cpswForm.brand}
                onChange={handleCpswFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Code"
                name="productCode"
                value={cpswForm.productCode}
                onChange={handleCpswFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={cpswForm.description}
                onChange={handleCpswFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MRP (₹)"
                name="mrp"
                type="number"
                value={cpswForm.mrp}
                onChange={handleCpswFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="D Price (₹)"
                name="dPrice"
                type="number"
                value={cpswForm.dPrice}
                onChange={handleCpswFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nos"
                name="nos"
                type="number"
                value={cpswForm.nos}
                onChange={handleCpswFormChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Amount (₹)"
                name="totalAmount"
                type="number"
                value={cpswForm.totalAmount}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cp-sw')}
                />
              </Button>
              {cpswForm.image && (
                <Box sx={{ mt: 2, maxWidth: '200px' }}>
                  <img src={cpswForm.image} alt="CP & SW Preview" style={{ width: '100%' }} />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Bulk Import Dialog */}
      <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Import {getCategoryName()}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" paragraph>
              Upload an Excel file with {getCategoryName()} data to import in bulk. Make sure to follow the template format.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileImport}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileUploadIcon />}
                onClick={handleFileSelect}
                disabled={isImporting}
                sx={{ mb: 2 }}
              >
                Select Excel File
              </Button>
              
              <Typography variant="body2" color="textSecondary">
                Supported formats: .xlsx, .xls
              </Typography>
            </Box>
            
            {isImporting && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}
            
            {importResults.success > 0 || importResults.failed > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Import Results
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <Typography>
                    <strong>Successfully imported:</strong> {importResults.success} products
                  </Typography>
                  
                  <Typography>
                    <strong>Failed to import:</strong> {importResults.failed} products
                  </Typography>
                </Box>
                
                {importResults.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Errors:
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}>
                      {importResults.errors.map((error, index) => (
                        <Typography key={index} variant="body2" color="error" paragraph>
                          {error}
                        </Typography>
                      ))}
                      
                      {importResults.errors.length >= 10 && (
                        <Typography variant="body2" color="textSecondary">
                          Showing first 10 errors only. There may be more issues in the file.
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}
              </Box>
            ) : null}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Need a template?
            </Typography>
            
            <Typography variant="body2" paragraph>
              Download a template file with the correct format for {getCategoryName()} import.
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;

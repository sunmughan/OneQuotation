/**
 * PDF Font Utilities
 * This file handles font registration for jsPDF to ensure proper font rendering in PDF documents
 */

/**
 * Register fonts with jsPDF instance
 * @param {jsPDF} doc - The jsPDF instance to register fonts with
 */
export const registerFonts = (doc) => {
  try {
    // Since we can't reliably load external fonts in PDF, we'll use the built-in fonts
    // Set Helvetica as the default font which is built into jsPDF
    doc.setFont('Helvetica');
    
    // You can also use other built-in fonts if needed:
    // 'courier', 'times', 'helvetica'
    
    console.log('Font set to Helvetica');
  } catch (error) {
    console.warn('Failed to set font:', error);
  }
};


/**
 * Add rupee symbol support
 * @param {jsPDF} doc - The jsPDF instance
 */
export const addRupeeSymbol = (doc) => {
  // Use the standard rupee symbol ₹
  return '₹';
};

/**
 * Format currency with rupee symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with rupee symbol
 */
export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};
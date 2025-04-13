import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { registerFonts, formatCurrency } from '../../utils/pdfFonts';

const Template5 = (data, doc) => {
  // Register fonts first
  registerFonts(doc);
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Set Helvetica font for all text (built into jsPDF)
  doc.setFont('Helvetica');
  
  // Draw border around the page
  doc.setDrawColor(200, 200, 200); // Light gray border color
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Top and bottom borders
  doc.setFillColor(33, 150, 243); // Blue background (#2196F3)
  doc.rect(0, 0, pageWidth, 10, 'F');
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  
  // Header with rounded box
  doc.setFillColor(227, 242, 253); // Light blue background (#E3F2FD)
  doc.roundedRect(margin + 5, margin + 10, pageWidth - 2 * margin - 10, 40, 5, 5, 'F');
  
  // Add company logo if available
  if (data.companyLogo) {
    try {
      doc.addImage(data.companyLogo, 'PNG', margin + 10, margin + 15, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
      // Fallback to placeholder if logo can't be added
      doc.setFillColor(33, 150, 243); // Blue background
      doc.circle(margin + 25, margin + 30, 15, 'F');
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // White text
      doc.text('LOGO', margin + 25, margin + 30, { align: 'center' });
    }
  } else {
    // No logo available, show placeholder
    doc.setFillColor(33, 150, 243); // Blue background
    doc.circle(margin + 25, margin + 30, 15, 'F');
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('LOGO', margin + 25, margin + 30, { align: 'center' });
  }
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(13, 71, 161); // Dark blue color (#0D47A1)
  doc.text('QUOTATION', pageWidth / 2, margin + 35, { align: 'center' });
  
  // Quotation Info Box
  doc.setFillColor(227, 242, 253); // Light blue background
  doc.roundedRect(margin + 5, margin + 60, pageWidth - 2 * margin - 10, 40, 5, 5, 'F');
  
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(13, 71, 161); // Dark blue color
  
  doc.text(`QUOTATION #: ${data.quotationNumber}`, margin + 15, margin + 75);
  doc.text(`DATE: ${data.quotationDate}`, pageWidth / 2, margin + 75);
  doc.text(`VALID UNTIL: ${data.validUntil}`, margin + 15, margin + 90);
  doc.text(`PREPARED BY: ${data.staffName || 'N/A'}`, pageWidth / 2, margin + 90);
  
  // From/To Section
  const fromToSectionY = margin + 110;
  
  // From box (Company info)
  doc.setFillColor(227, 242, 253); // Light blue background
  doc.roundedRect(margin + 5, fromToSectionY, (pageWidth - 2 * margin - 15) / 2, 60, 5, 5, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(13, 71, 161); // Dark blue color
  doc.text('FROM:', margin + 15, fromToSectionY + 15);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(data.companyName, margin + 15, fromToSectionY + 30);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.companyAddress, margin + 15, fromToSectionY + 40);
  doc.text(`${data.companyCity}, ${data.companyState} ${data.companyZipCode}`, margin + 15, fromToSectionY + 48);
  doc.text(`Phone: ${data.companyPhone} | Email: ${data.companyEmail}`, margin + 15, fromToSectionY + 56);
  
  // To box (Customer info)
  doc.setFillColor(227, 242, 253); // Light blue background
  doc.roundedRect(pageWidth / 2 + 5, fromToSectionY, (pageWidth - 2 * margin - 15) / 2, 60, 5, 5, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(13, 71, 161); // Dark blue color
  doc.text('TO:', pageWidth / 2 + 15, fromToSectionY + 15);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(data.customerName, pageWidth / 2 + 15, fromToSectionY + 30);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  
  // Format address with line breaks
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressText = addressLines.join(', ');
    doc.text(addressText, pageWidth / 2 + 15, fromToSectionY + 40, { maxWidth: (pageWidth - 2 * margin - 15) / 2 - 20 });
    doc.text(`Phone: ${data.customerPhone || 'N/A'}`, pageWidth / 2 + 15, fromToSectionY + 56);
  } else {
    doc.text('N/A', pageWidth / 2 + 15, fromToSectionY + 40);
    doc.text(`Phone: ${data.customerPhone || 'N/A'}`, pageWidth / 2 + 15, fromToSectionY + 48);
  }
  
  // Items table
  const itemsTableY = fromToSectionY + 80;
  
  // Table headers
  doc.setFillColor(33, 150, 243); // Blue background
  doc.roundedRect(margin + 5, itemsTableY, pageWidth - 2 * margin - 10, 15, 5, 5, 'F');
  
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  
  // Define column widths
  const colWidth1 = 15; // #
  const colWidth2 = (pageWidth - 2 * margin - colWidth1 - 120) * 0.6; // Product Name
  const colWidth3 = (pageWidth - 2 * margin - colWidth1 - 120) * 0.4; // Product Shade
  const colWidth4 = 40; // Total Area
  const colWidth5 = 30; // Boxes
  const colWidth6 = 25; // Price
  const colWidth7 = 25; // Amount
  
  // Header text
  doc.text('#', margin + 15, itemsTableY + 10);
  doc.text('DESCRIPTION', margin + colWidth1 + 20, itemsTableY + 10);
  doc.text('QTY', margin + colWidth1 + colWidth2 + 20, itemsTableY + 10);
  doc.text('PRICE', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 15, itemsTableY + 10);
  doc.text('AMOUNT', pageWidth - margin - 15, itemsTableY + 10, { align: 'right' });
  
  // Product table content
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.setFont('Helvetica', 'normal'); // Use Helvetica instead of Proxima Nova
  let currentY = itemsTableY + 15;
  
  // Alternating row colors
  data.products.forEach((product, index) => {
    const productTotal = product.price * product.quantity;
    const discountAmount = (productTotal * product.discount) / 100;
    const finalTotal = productTotal - discountAmount;
    const rowHeight = 15; // Row height
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(240, 247, 255); // Very light blue for even rows
      doc.rect(margin + 5, currentY, pageWidth - 2 * margin - 10, rowHeight, 'F');
    }
    
    doc.setFontSize(9);
    
    // Item number
    doc.text((index + 1).toString(), margin + 15, currentY + 10);
    
    // Product Name column
    let productName = product.brand || '';
    if (product.productCode) {
      productName += productName ? ` - ${product.productCode}` : product.productCode;
    }
    doc.text(productName, margin + colWidth1 + 20, currentY + 10, {
      maxWidth: colWidth2 - 10
    });
    
    // Quantity column
    doc.text(product.quantity.toString(), margin + colWidth1 + colWidth2 + 20, currentY + 10);
    
    // Price column with rupee symbol
    doc.text(`₹${product.price.toFixed(2)}`, margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 15, currentY + 10);
    
    // Amount column with rupee symbol
    doc.text(`₹${finalTotal.toFixed(2)}`, pageWidth - margin - 15, currentY + 10, { align: 'right' });
    
    currentY += rowHeight;
  });
  
  // Add totals
  const totalsY = currentY + 15;
  
  // Total section with blue background
  doc.setFillColor(227, 242, 253); // Light blue background
  doc.roundedRect(pageWidth - margin - 160, totalsY, 160, 30, 5, 5, 'F');
  
  // Set consistent font for totals section
  doc.setFont('Proxima Nova');
  doc.setFontSize(10);
  
  // Total in words
  doc.setFont('Helvetica', 'normal'); // Helvetica doesn't have italic in jsPDF
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(`Amount in words: ${data.totalInWords}`, margin + 15, totalsY + 10);
  
  // Totals on right side
  doc.setFont('Helvetica', 'normal');
  doc.text('Taxable Amount', pageWidth - margin - 140, totalsY + 10, { align: 'right' });
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - margin - 15, totalsY + 10, { align: 'right' });
  
  // Tax
  const taxRate = data.taxRate || 18;
  doc.text(`IGST ${taxRate}.0%`, pageWidth - margin - 140, totalsY + 20, { align: 'right' });
  doc.text(`₹${data.taxAmount.toFixed(2)}`, pageWidth - margin - 15, totalsY + 20, { align: 'right' });
  
  // Total
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(13, 71, 161); // Dark blue color
  doc.text('TOTAL:', pageWidth - margin - 140, totalsY + 30, { align: 'right' });
  doc.text(`₹${data.grandTotal.toFixed(2)}`, pageWidth - margin - 15, totalsY + 30, { align: 'right' });
  
  // Terms and conditions
  const termsY = totalsY + 50;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(13, 71, 161); // Dark blue color
  doc.text('TERMS AND CONDITIONS', margin + 15, termsY);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.setFontSize(8);
  
  const termsLines = data.termsAndConditions ? data.termsAndConditions.split('\n') : [
    '1. Prices are subject to change without prior notice.',
    '2. Delivery timeline: 7-10 working days after confirmation.',
    '3. Payment Terms: 50% advance, balance before delivery.',
    '4. Warranty as per manufacturer terms.',
    '5. This quotation is valid for the mentioned validity period.'
  ];
  
  let currentTermsY = termsY + 10;
  termsLines.forEach((line, index) => {
    if (index < 5) { // Limit to 5 lines to avoid overflow
      doc.text(line, margin + 15, currentTermsY);
      currentTermsY += 8;
    }
  });
  
  // Footer text
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 5, { align: 'center' });
  
  return doc;
};

export default Template5;
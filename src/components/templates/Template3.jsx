import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Template3 = (data, doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Set Proxima Nova font for all text
  doc.setFont('Proxima Nova');
  
  // Draw border around the page
  doc.setDrawColor(200, 200, 200); // Light gray border color
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Header with gradient-like effect (since jsPDF doesn't support gradients directly)
  doc.setFillColor(156, 39, 176); // Purple background
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setFontSize(22);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 255, 255); // White color for header
  doc.text('PREMIUM QUOTATION', pageWidth / 2, 38, { align: 'center' });
  
  // Company and Quotation Info Section
  doc.setFillColor(249, 249, 249); // Light gray background
  doc.rect(margin, 70, pageWidth - 2 * margin, 80, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.line(pageWidth / 2, 70, pageWidth / 2, 150); // Vertical divider
  
  // Company Info
  doc.setFontSize(14);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(156, 39, 176); // Purple text
  doc.text(data.companyName, margin + 15, 90);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(85, 85, 85); // Dark gray text
  doc.text(data.companyAddress, margin + 15, 105);
  doc.text(`${data.companyCity}, ${data.companyState} ${data.companyZipCode}`, margin + 15, 120);
  doc.text(`Phone: ${data.companyPhone}`, margin + 15, 135);
  doc.text(`Email: ${data.companyEmail}`, margin + 15, 150);
  
  // Quotation Info
  doc.setFontSize(14);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(156, 39, 176); // Purple text
  doc.text('QUOTATION DETAILS', pageWidth / 2 + 15, 90);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(85, 85, 85); // Dark gray text
  doc.text(`Quotation #: ${data.quotationNumber}`, pageWidth / 2 + 15, 105);
  doc.text(`Date: ${data.quotationDate}`, pageWidth / 2 + 15, 120);
  doc.text(`Valid Until: ${data.validUntil}`, pageWidth / 2 + 15, 135);
  
  // Customer Info Section
  doc.setFillColor(243, 229, 245); // Light purple background
  doc.rect(margin, 160, pageWidth - 2 * margin, 50, 'F');
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(156, 39, 176); // Purple text
  doc.text('CUSTOMER:', margin + 15, 180);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(85, 85, 85); // Dark gray text
  doc.text(data.customerName, margin + 75, 180);
  
  doc.setFontSize(10);
  doc.text('Address:', margin + 15, 195);
  
  // Format address with line breaks
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressText = addressLines.join(', ');
    doc.text(addressText, margin + 75, 195, { maxWidth: pageWidth - 2 * margin - 90 });
  } else {
    doc.text('N/A', margin + 75, 195);
  }
  
  // Items Table
  const itemsTableY = 220;
  
  // Table headers
  doc.setFillColor(156, 39, 176); // Purple background
  doc.rect(margin, itemsTableY, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
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
  doc.text('#', margin + 7, itemsTableY + 12);
  doc.text('ITEM', margin + colWidth1 + 20, itemsTableY + 12);
  doc.text('SHADE', margin + colWidth1 + colWidth2 + 20, itemsTableY + 12);
  doc.text('AREA', margin + colWidth1 + colWidth2 + colWidth3 + 20, itemsTableY + 12);
  doc.text('QTY', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 15, itemsTableY + 12);
  doc.text('PRICE', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5 + 12, itemsTableY + 12);
  doc.text('AMOUNT', pageWidth - margin - 12, itemsTableY + 12);
  
  // Product table content
  doc.setTextColor(85, 85, 85); // Dark gray text
  doc.setFont('Proxima Nova', 'normal');
  let currentY = itemsTableY + 20;
  
  // Alternating row colors
  data.products.forEach((product, index) => {
    const productTotal = product.price * product.quantity;
    const discountAmount = (productTotal * product.discount) / 100;
    const finalTotal = productTotal - discountAmount;
    const rowHeight = 15; // Row height
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(249, 249, 249); // Light gray for even rows
      doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
    }
    
    doc.setFontSize(10);
    
    // Item number
    doc.text((index + 1).toString(), margin + 7, currentY + 10);
    
    // Product Name column
    let productName = product.brand || '';
    if (product.productCode) {
      productName += productName ? ` - ${product.productCode}` : product.productCode;
    }
    doc.text(productName, margin + colWidth1 + 5, currentY + 10, {
      maxWidth: colWidth2 - 10
    });
    
    // Product Shade column
    const shade = product.shade || 'N/A';
    doc.text(shade, margin + colWidth1 + colWidth2 + 5, currentY + 10, {
      maxWidth: colWidth3 - 10
    });
    
    // Total Area column
    const area = product.area ? `${product.area} sq.ft` : 'N/A';
    doc.text(area, margin + colWidth1 + colWidth2 + colWidth3 + 5, currentY + 10);
    
    // Number of Boxes column
    const boxes = product.boxes || product.quantity || 'N/A';
    doc.text(boxes.toString(), margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 15, currentY + 10);
    
    // Price column with rupee symbol
    doc.text(`₹${product.price.toFixed(2)}`, margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5 + 12, currentY + 10);
    
    // Amount column with rupee symbol
    doc.text(`₹${finalTotal.toFixed(2)}`, pageWidth - margin - 12, currentY + 10);
    
    currentY += rowHeight;
  });
  
  // Add totals
  const totalsY = currentY + 10;
  
  // Total section
  doc.setFillColor(243, 229, 245); // Light purple background
  doc.rect(pageWidth - margin - 160, totalsY, 160, 30, 'F');
  
  doc.setFontSize(14);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(156, 39, 176); // Purple text
  doc.text('TOTAL:', pageWidth - margin - 140, totalsY + 20);
  doc.text(`₹${data.grandTotal.toFixed(2)}`, pageWidth - margin - 20, totalsY + 20, { align: 'right' });
  
  // Total in words
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'italic');
  doc.setTextColor(85, 85, 85); // Dark gray text
  doc.text(`Amount in words: ${data.totalInWords}`, margin, totalsY + 50);
  
  // Terms and conditions
  const termsY = totalsY + 70;
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(156, 39, 176); // Purple text
  doc.text('TERMS AND CONDITIONS', margin, termsY);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(85, 85, 85); // Dark gray text
  doc.setFontSize(9);
  
  const termsLines = data.termsAndConditions.split('\n');
  let currentTermsY = termsY + 10;
  termsLines.forEach((line, index) => {
    doc.text(`${index + 1}. ${line.replace(/^\d+\.\s*/, '')}`, margin, currentTermsY);
    currentTermsY += 7;
  });
  
  // Footer
  doc.setFillColor(156, 39, 176); // Purple background
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return doc;
};

export default Template3;
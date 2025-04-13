import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Template2 = (data, doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Set Proxima Nova font for all text
  doc.setFont('Proxima Nova');
  
  // Draw border around the page
  doc.setDrawColor(76, 175, 80); // Green border color
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Header with title
  doc.setFillColor(76, 175, 80); // Green background
  doc.rect(margin, margin, pageWidth - 2 * margin, 25, 'F');
  
  doc.setFontSize(18);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 255, 255); // White color for header
  doc.text('QUOTATION', pageWidth / 2, margin + 15, { align: 'center' });
  
  // Company and Quote Information
  const infoSectionY = margin + 40;
  
  // Company logo placeholder
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.circle(margin + 20, infoSectionY + 15, 15, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('LOGO', margin + 20, infoSectionY + 15, { align: 'center' });
  
  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(76, 175, 80); // Green text
  doc.text(data.companyName, margin + 45, infoSectionY + 10);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0); // Black text
  doc.text(`GSTIN: ${data.companyState || 'N/A'}`, margin + 45, infoSectionY + 20);
  doc.text(`${data.companyAddress}, ${data.companyCity}`, margin + 45, infoSectionY + 30);
  doc.text(`${data.companyState} ${data.companyZipCode}`, margin + 45, infoSectionY + 40);
  doc.text(`Mobile: ${data.companyPhone} | Email: ${data.companyEmail}`, margin + 45, infoSectionY + 50);
  
  // Quotation info (right side)
  doc.setFillColor(245, 245, 245); // Light gray background
  doc.rect(pageWidth / 2 + 10, infoSectionY, pageWidth / 2 - margin - 10, 60, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(76, 175, 80); // Green text
  doc.text('QUOTATION DETAILS', pageWidth / 2 + 20, infoSectionY + 15);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(0, 0, 0); // Black text
  doc.text('Quotation #:', pageWidth / 2 + 20, infoSectionY + 30);
  doc.text(data.quotationNumber, pageWidth - margin - 20, infoSectionY + 30, { align: 'right' });
  
  doc.text('Date:', pageWidth / 2 + 20, infoSectionY + 40);
  doc.text(data.quotationDate, pageWidth - margin - 20, infoSectionY + 40, { align: 'right' });
  
  doc.text('Valid Until:', pageWidth / 2 + 20, infoSectionY + 50);
  doc.text(data.validUntil, pageWidth - margin - 20, infoSectionY + 50, { align: 'right' });
  
  // Customer details section
  const customerSectionY = infoSectionY + 75;
  
  // Bill To section
  doc.setFillColor(245, 245, 245); // Light gray background
  doc.rect(margin, customerSectionY, pageWidth / 2 - 20, 60, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(76, 175, 80); // Green text
  doc.text('BILL TO', margin + 10, customerSectionY + 15);
  
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(0, 0, 0); // Black text
  doc.text(data.customerName, margin + 10, customerSectionY + 30);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  
  // Format address with line breaks
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 40;
    addressLines.forEach(line => {
      doc.text(line.trim(), margin + 10, addressY);
      addressY += 7;
    });
    doc.text(`Phone: ${data.customerPhone || 'N/A'}`, margin + 10, addressY);
  } else {
    doc.text('N/A', margin + 10, customerSectionY + 40);
    doc.text(`Phone: ${data.customerPhone || 'N/A'}`, margin + 10, customerSectionY + 50);
  }
  
  // Ship To section
  doc.setFillColor(245, 245, 245); // Light gray background
  doc.rect(pageWidth / 2 + 10, customerSectionY, pageWidth / 2 - margin - 10, 60, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(76, 175, 80); // Green text
  doc.text('SHIP TO', pageWidth / 2 + 20, customerSectionY + 15);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(0, 0, 0); // Black text
  
  // Use same address for shipping if not specified
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 30;
    addressLines.forEach(line => {
      doc.text(line.trim(), pageWidth / 2 + 20, addressY);
      addressY += 7;
    });
  } else {
    doc.text('Same as billing address', pageWidth / 2 + 20, customerSectionY + 30);
  }
  
  // Items table
  const itemsTableY = customerSectionY + 75;
  
  // Table headers
  doc.setFillColor(76, 175, 80); // Green background
  doc.rect(margin, itemsTableY, pageWidth - 2 * margin, 12, 'F');
  
  doc.setFontSize(9);
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
  doc.text('#', margin + 5, itemsTableY + 8);
  doc.text('PRODUCT', margin + colWidth1 + 5, itemsTableY + 8);
  doc.text('SHADE', margin + colWidth1 + colWidth2 + 5, itemsTableY + 8);
  doc.text('AREA', margin + colWidth1 + colWidth2 + colWidth3 + 5, itemsTableY + 8);
  doc.text('QTY', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 5, itemsTableY + 8, { align: 'center' });
  doc.text('PRICE', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5 + 5, itemsTableY + 8, { align: 'right' });
  doc.text('AMOUNT', pageWidth - margin - 5, itemsTableY + 8, { align: 'right' });
  
  // Product table content
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFont('Proxima Nova', 'normal');
  let currentY = itemsTableY + 12;
  
  // Alternating row colors
  data.products.forEach((product, index) => {
    const productTotal = product.price * product.quantity;
    const discountAmount = (productTotal * product.discount) / 100;
    const finalTotal = productTotal - discountAmount;
    const rowHeight = 15; // Row height
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245); // Light gray for even rows
      doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
    }
    
    doc.setFontSize(9);
    
    // Item number
    doc.text((index + 1).toString(), margin + 5, currentY + 10);
    
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
    doc.text(boxes.toString(), margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 5, currentY + 10, { align: 'center' });
    
    // Price column with rupee symbol
    doc.text(`₹${product.price.toFixed(2)}`, margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5 + 5, currentY + 10, { align: 'right' });
    
    // Amount column with rupee symbol
    doc.text(`₹${finalTotal.toFixed(2)}`, pageWidth - margin - 5, currentY + 10, { align: 'right' });
    
    currentY += rowHeight;
  });
  
  // Add totals
  const totalsY = currentY + 10;
  
  // Totals section background
  doc.setFillColor(245, 245, 245); // Light gray background
  doc.rect(pageWidth / 2, totalsY, pageWidth / 2 - margin, 50, 'F');
  
  // Set consistent font for totals section
  doc.setFont('Proxima Nova');
  doc.setFontSize(10);
  
  // Total in words
  doc.setFont('Proxima Nova', 'italic');
  doc.text(`Amount in words: ${data.totalInWords}`, margin + 5, totalsY + 20);
  
  // Totals on right side
  doc.setFont('Proxima Nova', 'normal');
  doc.text('Subtotal:', pageWidth / 2 + 10, totalsY + 10);
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - margin - 10, totalsY + 10, { align: 'right' });
  
  // Tax
  doc.text(`Tax (${data.taxRate}%):`, pageWidth / 2 + 10, totalsY + 25);
  doc.text(`₹${data.taxAmount.toFixed(2)}`, pageWidth - margin - 10, totalsY + 25, { align: 'right' });
  
  // Total
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(76, 175, 80); // Green text
  doc.text('TOTAL:', pageWidth / 2 + 10, totalsY + 40);
  doc.text(`₹${data.grandTotal.toFixed(2)}`, pageWidth - margin - 10, totalsY + 40, { align: 'right' });
  
  // Terms and conditions
  const termsY = totalsY + 70;
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(76, 175, 80); // Green text
  doc.text('TERMS AND CONDITIONS', margin, termsY);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFontSize(8);
  
  const termsLines = data.termsAndConditions.split('\n');
  let currentTermsY = termsY + 10;
  termsLines.forEach((line, index) => {
    doc.text(line, margin, currentTermsY);
    currentTermsY += 7;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100); // Gray text
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('Page 1/1', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return doc;
};

export default Template2;
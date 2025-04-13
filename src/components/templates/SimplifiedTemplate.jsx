import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const SimplifiedTemplate = (data, doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Set Proxima Nova font for all text
  doc.setFont('Proxima Nova');
  
  // Draw border around the page
  doc.setDrawColor(200, 200, 200); // Light gray border color
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Header
  doc.setFillColor(33, 150, 243); // Blue background (#2196F3)
  doc.rect(margin, margin, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('QUOTATION', pageWidth / 2, margin + 13, { align: 'center' });
  
  // Company and Quote Information
  const infoSectionY = margin + 30;
  
  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(data.companyName, margin + 5, infoSectionY);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  doc.text(data.companyAddress, margin + 5, infoSectionY + 10);
  doc.text(`${data.companyCity}, ${data.companyState} ${data.companyZipCode}`, margin + 5, infoSectionY + 20);
  doc.text(`Mobile: ${data.companyPhone}`, margin + 5, infoSectionY + 30);
  doc.text(`Email: ${data.companyEmail}`, margin + 5, infoSectionY + 40);
  
  // Quotation info (right side)
  const tableStartX = pageWidth / 2 + 10;
  doc.setFontSize(9);
  doc.text('Quotation #:', tableStartX, infoSectionY);
  doc.text(data.quotationNumber, tableStartX + 40, infoSectionY);
  
  doc.text('Quotation Date:', tableStartX, infoSectionY + 10);
  doc.text(data.quotationDate, tableStartX + 40, infoSectionY + 10);
  
  doc.text('Valid Until:', tableStartX, infoSectionY + 20);
  doc.text(data.validUntil, tableStartX + 40, infoSectionY + 20);
  
  // Customer details section
  const customerSectionY = infoSectionY + 50;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, customerSectionY, pageWidth - margin, customerSectionY);
  
  // Customer info (left side)
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.text('Customer Details:', margin + 5, customerSectionY + 10);
  doc.text(data.customerName, margin + 5, customerSectionY + 20);
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  
  // Format address with line breaks
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 30;
    addressLines.forEach(line => {
      doc.text(line.trim(), margin + 5, addressY);
      addressY += 7;
    });
    doc.text(`Ph: ${data.customerPhone || 'N/A'}`, margin + 5, addressY);
  } else {
    doc.text('N/A', margin + 5, customerSectionY + 30);
    doc.text(`Ph: ${data.customerPhone || 'N/A'}`, margin + 5, customerSectionY + 40);
  }
  
  // Items table
  const itemsTableY = customerSectionY + 60;
  
  // Table headers
  doc.setFillColor(33, 150, 243); // Blue background
  doc.rect(margin, itemsTableY, pageWidth - 2 * margin, 15, 'F');
  
  doc.setFontSize(9);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  
  // Define column widths - simplified with fewer columns
  const colWidth1 = 15; // #
  const colWidth2 = 120; // Product Name
  const colWidth3 = 60; // Qty
  const colWidth4 = 60; // Price
  const colWidth5 = 60; // Amount
  
  // Header text
  doc.text('#', margin + 7, itemsTableY + 10);
  doc.text('PRODUCT NAME', margin + colWidth1 + 20, itemsTableY + 10);
  doc.text('QTY', margin + colWidth1 + colWidth2 + 20, itemsTableY + 10);
  doc.text('PRICE', margin + colWidth1 + colWidth2 + colWidth3 + 20, itemsTableY + 10);
  doc.text('AMOUNT', pageWidth - margin - 20, itemsTableY + 10, { align: 'right' });
  
  // Product table content
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFont('Proxima Nova', 'normal');
  let currentY = itemsTableY + 15;
  
  data.products.forEach((product, index) => {
    const productTotal = product.price * product.quantity;
    const discountAmount = (productTotal * product.discount) / 100;
    const finalTotal = productTotal - discountAmount;
    const rowHeight = 15; // Row height
    
    // Draw row border
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);
    
    doc.setFontSize(9);
    
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
    
    // Quantity column
    doc.text(product.quantity.toString(), margin + colWidth1 + colWidth2 + 20, currentY + 10);
    
    // Price column with rupee symbol
    doc.text(`₹${product.price.toFixed(2)}`, margin + colWidth1 + colWidth2 + colWidth3 + 20, currentY + 10);
    
    // Amount column with rupee symbol
    doc.text(`₹${finalTotal.toFixed(2)}`, pageWidth - margin - 20, currentY + 10, { align: 'right' });
    
    currentY += rowHeight;
  });
  
  // Add totals
  const totalsY = currentY + 15;
  
  // Draw border above totals
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, totalsY - 5, pageWidth - margin, totalsY - 5);
  
  // Set consistent font for totals section
  doc.setFont('Proxima Nova');
  doc.setFontSize(10);
  
  // Total in words
  doc.setFont('Proxima Nova', 'normal');
  doc.text(`Total amount (in words): ${data.totalInWords}`, margin + 5, totalsY + 5);
  
  // Totals on right side
  doc.text('Taxable Amount', pageWidth - margin - 80, totalsY + 5, { align: 'right' });
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - margin - 5, totalsY + 5, { align: 'right' });
  
  // Tax
  const taxRate = data.taxRate || 18;
  doc.text(`IGST ${taxRate}.0%`, pageWidth - margin - 80, totalsY + 15, { align: 'right' });
  doc.text(`₹${data.taxAmount.toFixed(2)}`, pageWidth - margin - 5, totalsY + 15, { align: 'right' });
  
  // Total
  doc.setFont('Proxima Nova', 'bold');
  doc.text('Total', pageWidth - margin - 80, totalsY + 25, { align: 'right' });
  doc.text(`₹${data.grandTotal.toFixed(2)}`, pageWidth - margin - 5, totalsY + 25, { align: 'right' });
  
  // Footer
  const footerY = pageHeight - margin - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100); // Gray text
  doc.text('Thank you for your business!', pageWidth / 2, footerY + 10, { align: 'center' });
};

export default SimplifiedTemplate;
import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Template4 = (data, doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Set Proxima Nova font for all text
  doc.setFont('Proxima Nova');
  
  // Draw border around the page
  doc.setDrawColor(200, 200, 200); // Light gray border color
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Side accent
  doc.setFillColor(255, 87, 34); // Orange accent (#FF5722)
  doc.rect(0, 0, 20, pageHeight, 'F');
  
  // Header
  doc.setFontSize(20);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text('QUOTATION', pageWidth / 2, margin + 15, { align: 'center' });
  
  // Orange line under header
  doc.setDrawColor(255, 87, 34); // Orange color
  doc.setLineWidth(2);
  doc.line(pageWidth / 4, margin + 20, (pageWidth / 4) * 3, margin + 20);
  doc.setLineWidth(0.5);
  
  // Company and Quote Information
  const infoSectionY = margin + 40;
  
  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(data.companyName, margin + 25, infoSectionY);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  doc.text(`GSTIN: ${data.companyState || 'N/A'}`, margin + 25, infoSectionY + 10);
  doc.text(data.companyAddress, margin + 25, infoSectionY + 20);
  doc.text(`${data.companyCity}, ${data.companyState} ${data.companyZipCode}`, margin + 25, infoSectionY + 30);
  doc.text(`Mobile: ${data.companyPhone}`, margin + 25, infoSectionY + 40);
  doc.text(`Email: ${data.companyEmail}`, margin + 25, infoSectionY + 50);
  
  // Quotation info (right side) - with orange background box
  doc.setFillColor(255, 243, 224); // Light orange background
  doc.rect(pageWidth / 2 + 10, infoSectionY - 10, pageWidth / 2 - margin - 10, 70, 'F');
  doc.setDrawColor(255, 87, 34); // Orange border
  doc.rect(pageWidth / 2 + 10, infoSectionY - 10, pageWidth / 2 - margin - 10, 70);
  
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 87, 34); // Orange text
  doc.text('QUOTATION DETAILS', pageWidth / 2 + 20, infoSectionY + 5);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(51, 51, 51); // Dark gray text
  
  const tableStartX = pageWidth / 2 + 20;
  doc.text('Quotation #:', tableStartX, infoSectionY + 20);
  doc.text(data.quotationNumber, pageWidth - margin - 20, infoSectionY + 20, { align: 'right' });
  
  doc.text('Quotation Date:', tableStartX, infoSectionY + 30);
  doc.text(data.quotationDate, pageWidth - margin - 20, infoSectionY + 30, { align: 'right' });
  
  doc.text('Valid Until:', tableStartX, infoSectionY + 40);
  doc.text(data.validUntil, pageWidth - margin - 20, infoSectionY + 40, { align: 'right' });
  
  doc.text('Place of Supply:', tableStartX, infoSectionY + 50);
  doc.text(data.companyState || 'N/A', pageWidth - margin - 20, infoSectionY + 50, { align: 'right' });
  
  // Customer details section
  const customerSectionY = infoSectionY + 80;
  
  // Customer info (left side)
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 87, 34); // Orange text
  doc.text('BILL TO:', margin + 25, customerSectionY);
  
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(data.customerName, margin + 25, customerSectionY + 15);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  
  // Format address with line breaks
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 25;
    addressLines.forEach(line => {
      doc.text(line.trim(), margin + 25, addressY);
      addressY += 7;
    });
    doc.text(`Ph: ${data.customerPhone || 'N/A'}`, margin + 25, addressY);
  } else {
    doc.text('N/A', margin + 25, customerSectionY + 25);
    doc.text(`Ph: ${data.customerPhone || 'N/A'}`, margin + 25, customerSectionY + 35);
  }
  
  // Shipping address (right side)
  doc.setFontSize(12);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 87, 34); // Orange text
  doc.text('SHIP TO:', pageWidth / 2 + 20, customerSectionY);
  
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.setFontSize(9);
  
  // Use same address for shipping if not specified
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 15;
    addressLines.forEach(line => {
      doc.text(line.trim(), pageWidth / 2 + 20, addressY);
      addressY += 7;
    });
  } else {
    doc.text('Same as billing address', pageWidth / 2 + 20, customerSectionY + 15);
  }
  
  // Items table
  const itemsTableY = customerSectionY + 70;
  
  // Table headers
  doc.setFillColor(255, 87, 34); // Orange background
  doc.rect(margin + 10, itemsTableY, pageWidth - 2 * margin - 10, 15, 'F');
  
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
  doc.text('#', margin + 20, itemsTableY + 10);
  doc.text('DESCRIPTION', margin + colWidth1 + 30, itemsTableY + 10);
  doc.text('QTY', margin + colWidth1 + colWidth2 + 30, itemsTableY + 10);
  doc.text('PRICE', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 15, itemsTableY + 10);
  doc.text('AMOUNT', pageWidth - margin - 20, itemsTableY + 10, { align: 'right' });
  
  // Product table content
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.setFont('Proxima Nova', 'normal');
  let currentY = itemsTableY + 15;
  
  // Alternating row colors
  data.products.forEach((product, index) => {
    const productTotal = product.price * product.quantity;
    const discountAmount = (productTotal * product.discount) / 100;
    const finalTotal = productTotal - discountAmount;
    const rowHeight = 15; // Row height
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(255, 243, 224); // Light orange for even rows
      doc.rect(margin + 10, currentY, pageWidth - 2 * margin - 10, rowHeight, 'F');
    }
    
    doc.setFontSize(9);
    
    // Item number
    doc.text((index + 1).toString(), margin + 20, currentY + 10);
    
    // Product Name column
    let productName = product.brand || '';
    if (product.productCode) {
      productName += productName ? ` - ${product.productCode}` : product.productCode;
    }
    doc.text(productName, margin + colWidth1 + 30, currentY + 10, {
      maxWidth: colWidth2 - 10
    });
    
    // Quantity column
    doc.text(product.quantity.toString(), margin + colWidth1 + colWidth2 + 30, currentY + 10);
    
    // Price column with rupee symbol
    doc.text(`₹${product.price.toFixed(2)}`, margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 15, currentY + 10);
    
    // Amount column with rupee symbol
    doc.text(`₹${finalTotal.toFixed(2)}`, pageWidth - margin - 20, currentY + 10, { align: 'right' });
    
    currentY += rowHeight;
  });
  
  // Add totals
  const totalsY = currentY + 15;
  
  // Total section with orange background
  doc.setFillColor(255, 243, 224); // Light orange background
  doc.rect(pageWidth - margin - 160, totalsY, 160, 30, 'F');
  doc.setDrawColor(255, 87, 34); // Orange border
  doc.rect(pageWidth - margin - 160, totalsY, 160, 30);
  
  // Set consistent font for totals section
  doc.setFont('Proxima Nova');
  doc.setFontSize(10);
  
  // Total in words
  doc.setFont('Proxima Nova', 'italic');
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(`Amount in words: ${data.totalInWords}`, margin + 25, totalsY + 10);
  
  // Totals on right side
  doc.setFont('Proxima Nova', 'normal');
  doc.text('Taxable Amount', pageWidth - margin - 140, totalsY + 10, { align: 'right' });
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - margin - 20, totalsY + 10, { align: 'right' });
  
  // Tax
  const taxRate = data.taxRate || 18;
  doc.text(`IGST ${taxRate}.0%`, pageWidth - margin - 140, totalsY + 20, { align: 'right' });
  doc.text(`₹${data.taxAmount.toFixed(2)}`, pageWidth - margin - 20, totalsY + 20, { align: 'right' });
  
  // Total
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(255, 87, 34); // Orange text
  doc.text('TOTAL:', pageWidth - margin - 140, totalsY + 30, { align: 'right' });
  doc.text(`₹${data.grandTotal.toFixed(2)}`, pageWidth - margin - 20, totalsY + 30, { align: 'right' });
  
  // Footer
  doc.setFillColor(255, 87, 34); // Orange background
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'normal');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return doc;
};

export default Template4;
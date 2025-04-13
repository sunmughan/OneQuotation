import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Template1 = (data, doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Set Proxima Nova font for all text
  doc.setFont('Proxima Nova');
  
  // Draw border around the page
  doc.setDrawColor(200, 200, 200); // Light gray border color
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Header with title
  doc.setFillColor(240, 248, 255); // Light blue background
  doc.rect(margin, margin, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(0, 102, 204); // Blue color for header
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
  doc.text(`GSTIN: ${data.companyState || 'N/A'}`, margin + 5, infoSectionY + 10);
  doc.text(data.companyAddress, margin + 5, infoSectionY + 15);
  doc.text(`${data.companyCity}, ${data.companyState} ${data.companyZipCode}`, margin + 5, infoSectionY + 20);
  doc.text(`Mobile: ${data.companyPhone}`, margin + 5, infoSectionY + 25);
  doc.text(`Email: ${data.companyEmail}`, margin + 5, infoSectionY + 30);
  
  // Quotation info (right side)
  const tableStartX = pageWidth / 2 + 10;
  doc.setFontSize(9);
  doc.text('Quotation #:', tableStartX, infoSectionY);
  doc.text(data.quotationNumber, tableStartX + 40, infoSectionY);
  
  doc.text('Quotation Date:', tableStartX, infoSectionY + 10);
  doc.text(data.quotationDate, tableStartX + 40, infoSectionY + 10);
  
  doc.text('Valid Until:', tableStartX, infoSectionY + 20);
  doc.text(data.validUntil, tableStartX + 40, infoSectionY + 20);
  
  doc.text('Place of Supply:', tableStartX, infoSectionY + 30);
  doc.text(data.companyState || 'N/A', tableStartX + 40, infoSectionY + 30);
  
  // Customer details section
  const customerSectionY = infoSectionY + 45;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, customerSectionY, pageWidth - margin, customerSectionY);
  
  // Customer info (left side)
  doc.setFontSize(10);
  doc.setFont('Proxima Nova', 'bold');
  doc.text('Customer Details:', margin + 5, customerSectionY + 10);
  doc.text(data.customerName, margin + 5, customerSectionY + 20);
  doc.setFont('Proxima Nova', 'normal');
  doc.setFontSize(9);
  doc.text('Billing address:', margin + 5, customerSectionY + 30);
  
  // Format address with line breaks
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 35;
    addressLines.forEach(line => {
      doc.text(line.trim(), margin + 5, addressY);
      addressY += 5;
    });
    doc.text(`Ph: ${data.customerPhone || 'N/A'}`, margin + 5, addressY + 5);
  } else {
    doc.text('N/A', margin + 5, customerSectionY + 35);
    doc.text(`Ph: ${data.customerPhone || 'N/A'}`, margin + 5, customerSectionY + 45);
  }
  
  // Shipping address (right side)
  doc.setFontSize(9);
  doc.setFont('Proxima Nova', 'bold');
  doc.text('Shipping address:', tableStartX, customerSectionY + 10);
  doc.setFont('Proxima Nova', 'normal');
  
  // Use same address for shipping if not specified
  if (data.customerAddress) {
    const addressLines = data.customerAddress.split(',');
    let addressY = customerSectionY + 15;
    addressLines.forEach(line => {
      doc.text(line.trim(), tableStartX, addressY);
      addressY += 5;
    });
  } else {
    doc.text('N/A', tableStartX, customerSectionY + 15);
  }
  
  // Items table
  const itemsTableY = customerSectionY + 60;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, itemsTableY, pageWidth - margin, itemsTableY);
  
  // Table headers
  doc.setFillColor(240, 248, 255); // Light blue background
  doc.rect(margin, itemsTableY + 5, pageWidth - 2 * margin, 10, 'F');
  
  doc.setFontSize(9);
  doc.setFont('Proxima Nova', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // Define column widths
  const colWidth1 = 15; // #
  const colWidth2 = (pageWidth - 2 * margin - colWidth1 - 120) * 0.6; // Product Name
  const colWidth3 = (pageWidth - 2 * margin - colWidth1 - 120) * 0.4; // Product Shade
  const colWidth4 = 40; // Total Area
  const colWidth5 = 30; // Boxes
  const colWidth6 = 25; // Price
  const colWidth7 = 25; // Amount
  
  // Header text
  doc.text('#', margin + 5, itemsTableY + 12);
  doc.text('Product Name', margin + colWidth1 + 5, itemsTableY + 12);
  doc.text('Product Shade', margin + colWidth1 + colWidth2 + 5, itemsTableY + 12);
  doc.text('Total Area', margin + colWidth1 + colWidth2 + colWidth3 + 5, itemsTableY + 12);
  doc.text('Boxes', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + 5, itemsTableY + 12, { align: 'center' });
  doc.text('Price', margin + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5 + 5, itemsTableY + 12, { align: 'right' });
  doc.text('Amount', pageWidth - margin - 5, itemsTableY + 12, { align: 'right' });
  
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
  doc.text(`IGST ${data.taxRate}.0%`, pageWidth - margin - 80, totalsY + 15, { align: 'right' });
  doc.text(`₹${data.taxAmount.toFixed(2)}`, pageWidth - margin - 5, totalsY + 15, { align: 'right' });
  
  // Total
  doc.setFont('Proxima Nova', 'bold');
  doc.text('Total', pageWidth - margin - 80, totalsY + 25, { align: 'right' });
  doc.text(`₹${data.grandTotal.toFixed(2)}`, pageWidth - margin - 5, totalsY + 25, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.text('Page 1/1   This is a digitally signed document.', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return doc;
};

export default Template1;
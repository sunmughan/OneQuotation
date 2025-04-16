// import React from 'react';
// import {
//   Container,
//   Paper,
//   Typography,
//   Grid,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TableContainer,
//   Divider,
// } from '@mui/material';

// const QuotationTemplate = ({ quotation }) => {
//   // console.log("QD", quotation);
//   if (!quotation) return null;

//   const {
//     companyName,
//     companyAddress,
//     companyCity,
//     companyState,
//     companyZipCode,
//     companyPhone,
//     companyEmail,
//     quotationNumber,
//     quotationDate,
//     validityDays,
//     customerName,
//     customerPhone,
//     customerEmail,
//     customerAddress,
//     products,
//     taxRate,
//   } = quotation;

//   const calculateTotal = () => {
//     const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity * (1 - item.discount / 100)), 0);
//     const taxAmount = (subtotal * taxRate) / 100;
//     const total = subtotal + taxAmount;
//     return { subtotal, taxAmount, total };
//   };

//   const { subtotal, taxAmount, total } = calculateTotal();

//   return (
//     <Container style={{ width: '800px', margin: '20px auto' }}>
//       <Paper elevation={3} style={{ padding: '30px', border: '1px solid #ddd' }}>
//         {/* Company Info */}
//         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//           <Typography variant="h5" style={{ fontWeight: 'bold' }}>{companyName}</Typography>
//           <Typography>{companyAddress}, {companyCity}, {companyState} - {companyZipCode}</Typography>
//           <Typography>Phone: {companyPhone} | Email: {companyEmail}</Typography>
//         </div>

//         <Divider style={{ margin: '20px 0' }} />

//         {/* Quotation Info */}
//         <div style={{ marginBottom: '20px' }}>
//           <Typography><strong>Quotation Number:</strong> {quotationNumber}</Typography>
//           <Typography><strong>Quotation Date:</strong> {quotationDate}</Typography>
//           <Typography><strong>Validity:</strong> {validityDays} days</Typography>
//         </div>

//         <Divider style={{ margin: '20px 0' }} />

//         {/* Customer Info */}
//         <div style={{ marginBottom: '20px' }}>
//           <Typography><strong>Customer Name:</strong> {customerName}</Typography>
//           <Typography><strong>Phone:</strong> {customerPhone}</Typography>
//           <Typography><strong>Email:</strong> {customerEmail}</Typography>
//           <Typography><strong>Address:</strong> {customerAddress}</Typography>
//         </div>

//         <Divider style={{ margin: '20px 0' }} />

//         {/* Products Table */}
//         <TableContainer>
//           <Table size="small" style={{ border: '1px solid #ccc' }}>
//             <TableHead>
//               <TableRow style={{ backgroundColor: '#f5f5f5' }}>
//                 <TableCell><strong>Product</strong></TableCell>
//                 <TableCell><strong>Quantity</strong></TableCell>
//                 <TableCell><strong>Price</strong></TableCell>
//                 <TableCell><strong>Discount (%)</strong></TableCell>
//                 <TableCell><strong>Total</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {products.map((item, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{item.name}</TableCell>
//                   <TableCell>{item.quantity}</TableCell>
//                   <TableCell>₹{item.price.toFixed(2)}</TableCell>
//                   <TableCell>{item.discount}%</TableCell>
//                   <TableCell>₹{(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

// {/* Summary */}
// <div style={{ marginTop: '20px', textAlign: 'right' }}>
//   <Typography><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</Typography>
//   <Typography><strong>Tax ({taxRate}%):</strong> ₹{taxAmount.toFixed(2)}</Typography>
//   <Typography variant="h6" style={{ fontWeight: 'bold', marginTop: '10px' }}>
//     Total: ₹{total.toFixed(2)}
//   </Typography>
// </div>
//       </Paper>
//     </Container>
//   );
// };

// export default QuotationTemplate;


import React from "react";
import "../../invoice.css";
import { Typography } from "@mui/material";

function numberToWords(num) {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
        'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
        return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };

    return num === 0 ? 'Zero Rupees Only' : numToWords(num) + ' Rupees Only';
}

const QuotationTemplate = ({ quotation }) => {
    console.log(quotation)

    const calculateTotal = () => {
        const subtotal = quotation.products.reduce((sum, item) => sum + (item.price * item.quantity * (1 - item.discount / 100)), 0);
        const taxAmount = (subtotal * quotation.taxRate) / 100;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    };

    const { subtotal, taxAmount, total } = calculateTotal();
    return (
        <div className="invoice-container">
            <h2 className="invoice-title">Quotation</h2>

            {/* <div className="invoice-header">
        <div className="company-details">
          <img src="/logo.png" alt="TATA Logo" className="company-logo" />
          <p><strong>TATA MOTORS LIMITED</strong></p>
          <p>GSTIN: 27AAACT2727Q1ZW</p>
          <p>Nigadi Bhosari Road, PIMPRI</p>
          <p>Pune, MAHARASHTRA, 411018</p>
          <p>Mobile: 9999999999</p>
          <p>Email: Swipe@getswipe.in</p>
        </div>

        <div className="invoice-details">
          <p><strong>Invoice #: </strong> INV-1</p>
          <p><strong>Invoice Date: </strong> 17 Jun 2023</p>
          <p><strong>Place of Supply: </strong> 36-TELANGANA</p>
          <p><strong>Due Date: </strong> 17 Jun 2023</p>
        </div>
      </div> */}

            <div className="invoice-header-container">
                <div className="header-top">
                    <div className="company-info">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/677px-Tata_logo.svg.png" alt="TATA Logo" className="company-logo" />
                        {/* <div className="company-text">
              <p><strong>{quotation}</strong></p>
              <p>GSTIN <strong>27AAACT2727Q1ZW</strong></p>
              <p>Nigadi Bhosari Road, PIMPRI</p>
              <p>Pune, MAHARASHTRA, 411018</p>
              <p><strong>Mobile</strong> 9999999999</p>
              <p><strong>Email</strong> Swipe@getswipe.in</p>
            </div> */}
                    </div>

                    <div className="invoice-details">
                        <div className="invoice-row">
                            <div className="label">Quotation #:</div>
                            <div className="value">{quotation.quotationNumber}</div>
                        </div>
                        <div className="invoice-row">
                            <div className="label">Quotation Date:</div>
                            <div className="value">{quotation.quotationDate}</div>
                        </div>
                        {/* <div className="invoice-row">
              <div className="label">Place of Supply:</div>
              <div className="value">36-TELANGANA</div>
            </div>
            <div className="invoice-row">
              <div className="label">Due Date:</div>
              <div className="value">17 Jun 2023</div>
            </div> */}
                    </div>
                </div>

                <div className="header-bottom">
                    <div className="customer-details">
                        <p><strong>Customer Details:</strong></p>
                        <p><strong>{quotation.customerName}</strong></p>
                        <p><strong>Billing address:</strong></p>
                        <p>{quotation.customerAddress}</p>
                        {/* <p>Gachibowli, Nanakramguda</p>
            <p>Hyderabad, TELANGANA, 500032</p>
            <p>Ph: 9999999999</p> */}
                    </div>

                    <div className="shipping-details">
                        {/* <p><strong>Shipping address:</strong></p>
            <p>Survey 115/1, ISB Rd, Financial District</p>
            <p>Gachibowli, Nanakramguda</p>
            <p>Hyderabad, TELANGANA, 500032</p> */}
                        <div className="company-text">
                            <p><strong>{quotation.companyName}</strong></p>
                            {/* <p>GSTIN <strong>27AAACT2727Q1ZW</strong></p> */}
                            <p>{quotation.companyName}</p>
                            <p>{quotation.companyCity}, {quotation.companyState}, {quotation.companyZipCode}</p>
                            <p><strong>Mobile</strong> {quotation.companyPhone}</p>
                            <p><strong>Email</strong> {quotation.companyEmail}</p>
                            <p><strong>Quoted by</strong> {quotation.staffName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="address-section">
        <div>
          <p><strong>Customer Details:</strong></p>
          <p>Natarajan Chandrasekaran</p>
          <p>Survey 115/1, ISB Rd, Financial District</p>
          <p>Gachibowli, Nanakramguda</p>
          <p>Hyderabad, TELANGANA, 500032</p>
          <p>Ph: 9999999999</p>
        </div>

        <div>
          <p><strong>Shipping Address:</strong></p>
          <p>Survey 115/1, ISB Rd, Financial District</p>
          <p>Gachibowli, Nanakramguda</p>
          <p>Hyderabad, TELANGANA, 500032</p>
        </div>
      </div> */}

            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item name (Brand + Shade)</th>
                        <th>Area Required</th>
                        <th>No. Of Boxes</th>
                        {/* <th>Qty</th> */}
                        <th>Discounted Price</th>
                        {/* <th>Tax Amount</th>
            <th>Amount</th> */}
                    </tr>
                </thead>
                <tbody>
                    {quotation.products?.map((product) => (
                        <tr>
                            <td>1</td>
                            <td>{product.brand} {product.shadeName}</td>
                            <td>{product.areaOfApplication}</td>
                            <td>{product.quantity}</td>
                            {/* <td>1</td> */}
                            <td>₹{product.price}</td>
                            {/* <td>1,44,900.00 (18%)</td>
            <td>9,49,900.00</td> */}
                        </tr>
                    ))}

                </tbody>
            </table>

            <div className="summary-section">
                <div className="amount-words">
                    <p>Total amount (in words): <strong>{numberToWords(total)}</strong></p>
                </div>
                <div className="summary-item">
                    {/* Summary */}
                    <div style={{ textAlign: 'left' }}>
                        <Typography><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</Typography>
                        <Typography><strong>Tax ({quotation.taxRate}%):</strong> ₹{taxAmount.toFixed(2)}</Typography>
                        <Typography style={{ fontWeight: 'bold' }}>
                            Total: ₹{total.toFixed(2)}
                        </Typography>
                    </div>
                    {/* <p><strong>Total: ₹{quotation.products[0].price}</strong></p> */}
                </div>
            </div>


            {/* <table className="tax-breakup-table">
        <thead>
          <tr>
            <th>HSN/SAC</th>
            <th>Taxable Value</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Total Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>87038070</td>
            <td>8,05,000.00</td>
            <td>18%</td>
            <td>1,44,900.00</td>
            <td>1,44,900.00</td>
          </tr>
          <tr>
            <td>87089900</td>
            <td>2,117.80</td>
            <td>18%</td>
            <td>381.20</td>
            <td>381.20</td>
          </tr>
          <tr>
            <td colSpan="4"><strong>TOTAL</strong></td>
            <td>1,45,281.20</td>
          </tr>
        </tbody>
      </table> */}

            {/* <div className="bank-details">
        <div>
          <p><strong>Bank Details:</strong></p>
          <p>Bank: YES BANK</p>
          <p>Account #: 667899999222445</p>
          <p>IFSC: YESB0IN4567</p>
          <p>Branch: Kodihalli</p>
        </div>

        <div className="upi-section">
          <p><strong>Pay using UPI:</strong></p>
          <img src="/upi-qr.png" alt="UPI QR" className="upi-qr" />
        </div>
      </div> */}

            <div className="notes-section" style={{ display: 'flex', padding: "20px 15px", marginTop: "50px", background: "#e9e9e9" }}>
                <div style={{ flex: 1 }}>
                    <p><strong>Notes:</strong></p>
                    <p>Thank you for the Business</p>
                </div>
                <div style={{ flex: 2 }}>
                    <p><strong>Terms and Conditions:</strong></p>
                    <ol>
                        <li>Goods once sold cannot be taken back or exchanged.</li>
                        <li>We are not the manufacturers, company will stand for warranty as per their terms and conditions.</li>
                        <li>Interest @24% p.a. will be charged for uncleared bills beyond 15 days.</li>
                        <li>Subject to local Jurisdiction.</li>
                    </ol>
                </div>
            </div>

            {/* <div className="signature-section">
        <p>Authorized Signatory</p>
        <img src="/signature.png" alt="Signature" className="signature-img" />
      </div> */}

            {/* <footer className="invoice-footer">
        <p>Page 1 / 1 | This is a digitally signed document.</p>
      </footer> */}
        </div>
    );
};

export default QuotationTemplate;

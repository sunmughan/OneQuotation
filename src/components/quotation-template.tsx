import React from 'react';

const QuotationTemplate = () => {
  // Sample data - replace with actual data in your implementation
  const data = {
    companyInfo: {
      name: "TATA MOTORS LIMITED",
      gstin: "27AAACT2727Q1ZW",
      address: "Nigadi Bhosari Road, PIMPRI\nPune, MAHARASHTRA, 411018",
      mobile: "9999999999",
      email: "Swipe@getswipe.in"
    },
    quotationInfo: {
      number: "QT451",
      date: "17 Jun 2023",
      validUntil: "17 Jul 2023",
      placeOfSupply: "36-TELANGANA"
    },
    customerDetails: {
      name: "Natarajan Chandrasekaran",
      billingAddress: "Survey 115/1, ISB Rd, Financial District\nGachibowli, Nanakramguda\nHyderabad, TELANGANA, 500032",
      phone: "9999999999"
    },
    shippingAddress: "Survey 115/1, ISB Rd, Financial District\nGachibowli, Nanakramguda\nHyderabad, TELANGANA, 500032",
    items: [
      {
        id: 1,
        productName: "Ceramic Floor Tiles",
        productShade: "Wood Maple",
        totalAreaRequired: "100 sq.ft",
        numberOfBoxes: 10,
        price: 2500.00,
        amount: 25000.00
      },
      {
        id: 2,
        productName: "Wall Tiles",
        productShade: "Ivory White",
        totalAreaRequired: "50 sq.ft",
        numberOfBoxes: 5,
        price: 1800.00,
        amount: 9000.00
      }
    ],
    taxableAmount: 34000.00,
    igst: 6120.00,
    total: 40120.00,
    totalInWords: "INR Forty Thousand, One Hundred And Twenty Rupees Only.",
    bankDetails: {
      bank: "YES BANK",
      accountNumber: "66789999222445",
      ifsc: "YESBBIN4567",
      branch: "Kodihalii"
    }
  };

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 font-sans">
      <div className="border border-gray-300">
        {/* Header */}
        <div className="text-center py-2 border-b border-gray-300 bg-blue-50">
          <h1 className="text-xl font-bold text-blue-600">QUOTATION</h1>
          <div className="absolute top-4 right-4 text-xs">ORIGINAL FOR RECIPIENT</div>
        </div>

        {/* Company and Quote Information */}
        <div className="flex border-b border-gray-300">
          <div className="w-1/2 p-4 flex">
            <div className="w-16 h-16 mr-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="#1a73e8" />
                <path d="M30,50 L70,50" stroke="white" strokeWidth="8" />
                <path d="M50,30 L50,70" stroke="white" strokeWidth="8" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">{data.companyInfo.name}</h2>
              <p className="text-xs">GSTIN {data.companyInfo.gstin}</p>
              <p className="text-xs whitespace-pre-line">{data.companyInfo.address}</p>
              <p className="text-xs">Mobile {data.companyInfo.mobile}</p>
              <p className="text-xs">Email {data.companyInfo.email}</p>
            </div>
          </div>
          <div className="w-1/2 p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1">Quotation #:</td>
                  <td className="py-1">{data.quotationInfo.number}</td>
                </tr>
                <tr>
                  <td className="py-1">Quotation Date:</td>
                  <td className="py-1">{data.quotationInfo.date}</td>
                </tr>
                <tr>
                  <td className="py-1">Valid Until:</td>
                  <td className="py-1">{data.quotationInfo.validUntil}</td>
                </tr>
                <tr>
                  <td className="py-1">Place of Supply:</td>
                  <td className="py-1">{data.quotationInfo.placeOfSupply}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details */}
        <div className="flex border-b border-gray-300">
          <div className="w-1/2 p-4">
            <h3 className="font-bold text-sm mb-1">Customer Details:</h3>
            <p className="font-bold text-sm">{data.customerDetails.name}</p>
            <p className="text-xs mb-1"><span className="font-bold">Billing address:</span></p>
            <p className="text-xs whitespace-pre-line">{data.customerDetails.billingAddress}</p>
            <p className="text-xs">Ph: {data.customerDetails.phone}</p>
          </div>
          <div className="w-1/2 p-4">
            <p className="text-xs mb-1"><span className="font-bold">Shipping address:</span></p>
            <p className="text-xs whitespace-pre-line">{data.shippingAddress}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-4 border-b border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 w-8">#</th>
                <th className="text-left py-2">Product Name</th>
                <th className="text-left py-2">Product Shade</th>
                <th className="text-left py-2">Total Area Required</th>
                <th className="text-center py-2">No. of Boxes</th>
                <th className="text-right py-2">Discounted Price</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2">{item.id}</td>
                  <td className="py-2">{item.productName}</td>
                  <td className="py-2">{item.productShade}</td>
                  <td className="py-2">{item.totalAreaRequired}</td>
                  <td className="text-center py-2">{item.numberOfBoxes}</td>
                  <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                  <td className="text-right py-2">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex border-b border-gray-300">
          <div className="w-1/2 p-4">
            <p className="text-sm">Total amount (in words): {data.totalInWords}</p>
          </div>
          <div className="w-1/2 p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-right py-1">Taxable Amount</td>
                  <td className="text-right py-1 w-32">₹{data.taxableAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-right py-1">IGST 18.0%</td>
                  <td className="text-right py-1">₹{data.igst.toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="text-right py-1">Total</td>
                  <td className="text-right py-1">₹{data.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Details and QR Code */}
        <div className="flex border-b border-gray-300">
          <div className="w-1/2 p-4">
            <h3 className="font-bold text-sm mb-1">Bank Details:</h3>
            <table className="text-xs">
              <tbody>
                <tr>
                  <td className="pr-2">Bank:</td>
                  <td>{data.bankDetails.bank}</td>
                </tr>
                <tr>
                  <td className="pr-2">Account #:</td>
                  <td>{data.bankDetails.accountNumber}</td>
                </tr>
                <tr>
                  <td className="pr-2">IFSC:</td>
                  <td>{data.bankDetails.ifsc}</td>
                </tr>
                <tr>
                  <td className="pr-2">Branch:</td>
                  <td>{data.bankDetails.branch}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-1/2 p-4 flex justify-between">
            <div>
              <h3 className="text-xs mb-1">Pay using UPI:</h3>
              <div className="w-24 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs mb-12">For {data.companyInfo.name}</p>
              <div className="w-24 h-24 border border-gray-300 rounded-full mx-auto flex items-center justify-center">
                <span className="text-xs text-gray-500">SIGNATURE</span>
              </div>
              <p className="text-xs mt-2">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="flex">
          <div className="w-1/2 p-4">
            <h3 className="font-bold text-sm mb-1">Notes:</h3>
            <p className="text-xs">Thank you for your interest in our products.</p>
          </div>
          <div className="w-1/2 p-4">
            <h3 className="font-bold text-sm mb-1">Terms and Conditions:</h3>
            <ol className="text-xs list-decimal pl-4">
              <li>This quotation is valid for 30 days from the quotation date.</li>
              <li>50% advance payment is required to confirm the order.</li>
              <li>Delivery timeline: 7-10 working days after order confirmation.</li>
              <li>Subject to local Jurisdiction.</li>
            </ol>
          </div>
        </div>
      </div>
      <div className="text-xs mt-2">
        Page 1/1 &nbsp;&nbsp; This is a digitally signed document.
      </div>
    </div>
  );
};

export default QuotationTemplate;

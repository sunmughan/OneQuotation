import React from 'react';

const SimplifiedQuotationTemplate = () => {
  // Sample data - replace with actual data in your implementation
  const data = {
    companyInfo: {
      name: "COMPANY NAME",
      gstin: "27AAACT2727Q1ZW",
      address: "Company Address",
      mobile: "9999999999",
      email: "company@example.com"
    },
    quotationInfo: {
      number: "QT-12345",
      date: "01/01/2023",
      validUntil: "01/31/2023",
      placeOfSupply: "MAHARASHTRA"
    },
    customerDetails: {
      name: "Customer Name",
      billingAddress: "Customer Address",
      phone: "9999999999"
    },
    shippingAddress: "Same as billing address",
    items: [
      {
        id: 1,
        productName: "Product Name",
        quantity: 2,
        price: 1000.00,
        amount: 2000.00
      }
    ],
    taxableAmount: 2000.00,
    igst: 360.00,
    total: 2360.00,
    totalInWords: "Two Thousand Three Hundred Sixty Rupees Only."
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 font-sans border border-gray-300">
      {/* Header */}
      <div className="text-center py-2 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">QUOTATION</h1>
      </div>

      {/* Company and Quote Information */}
      <div className="flex border-b border-gray-300 p-4">
        <div className="w-1/2">
          <h2 className="font-bold text-lg">{data.companyInfo.name}</h2>
          <p className="text-xs">GSTIN {data.companyInfo.gstin}</p>
          <p className="text-xs">{data.companyInfo.address}</p>
          <p className="text-xs">Mobile {data.companyInfo.mobile}</p>
          <p className="text-xs">Email {data.companyInfo.email}</p>
        </div>
        <div className="w-1/2">
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
      <div className="flex border-b border-gray-300 p-4">
        <div className="w-1/2">
          <h3 className="font-bold text-sm mb-1">Customer Details:</h3>
          <p className="font-bold text-sm">{data.customerDetails.name}</p>
          <p className="text-xs mb-1"><span className="font-bold">Billing address:</span></p>
          <p className="text-xs">{data.customerDetails.billingAddress}</p>
          <p className="text-xs">Ph: {data.customerDetails.phone}</p>
        </div>
        <div className="w-1/2">
          <p className="text-xs mb-1"><span className="font-bold">Shipping address:</span></p>
          <p className="text-xs">{data.shippingAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-4 border-b border-gray-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-1">#</th>
              <th className="text-left py-2 px-1">Product Name</th>
              <th className="text-center py-2 px-1">Qty</th>
              <th className="text-right py-2 px-1">Price</th>
              <th className="text-right py-2 px-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2 px-1">{item.id}</td>
                <td className="py-2 px-1">{item.productName}</td>
                <td className="text-center py-2 px-1">{item.quantity}</td>
                <td className="text-right py-2 px-1">₹{item.price.toFixed(2)}</td>
                <td className="text-right py-2 px-1">₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex p-4">
        <div className="w-1/2">
          <p className="text-sm">Total amount (in words): {data.totalInWords}</p>
        </div>
        <div className="w-1/2">
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

      {/* Footer */}
      <div className="text-center py-2 bg-blue-600 text-white text-sm">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default SimplifiedQuotationTemplate;
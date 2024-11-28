import { useState, useEffect } from 'react';
import { Trash2, Edit, PlusCircle } from 'lucide-react';

const InvoiceManagement = () => {
  // State Variables
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('');

  // Form State for Invoice Creation/Editing
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    customer_name: '',
    date: '',
    details: [{ description: '', quantity: 1, unit_price: 0 }]
  });

  // Fetch Invoices with Filters and Pagination
  const fetchInvoices = async () => {
    try {
      const url = new URL('https://invoice-mgmt-system-backend-tanjul.vercel.app/api/invoices/');
      url.searchParams.append('page', currentPage);
      if (customerFilter.trim()) {
        url.searchParams.append('customer_name', customerFilter.trim());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setInvoices(data.results);
      setTotalPages(Math.ceil(data.count / 10) || 1);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Save Invoice (Add or Update)
  const saveInvoice = async (e) => {
    e.preventDefault();
    try {
      const url = selectedInvoice 
        ? `https://invoice-mgmt-system-backend-tanjul.vercel.app/api/invoices/${selectedInvoice.id}/`
        : 'https://invoice-mgmt-system-backend-tanjul.vercel.app/api/invoices/';

      const method = selectedInvoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceForm)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchInvoices();
      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  // Delete Invoice
  const deleteInvoice = async (id) => {
    try {
      const response = await fetch(`https://invoice-mgmt-system-backend-tanjul.vercel.app/api/invoices/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  // Reset Form to Initial State
  const resetForm = () => {
    setSelectedInvoice(null);
    setInvoiceForm({
      invoice_number: '',
      customer_name: '',
      date: '',
      details: [{ description: '', quantity: 1, unit_price: 0 }]
    });
  };

  // Add a New Line Item
  const addLineItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      details: [...prev.details, { description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  // Update Data on Dependencies Change
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, customerFilter]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 py-6">
          Neura Dynamics - Invoice Management
        </h1>
        
        {/* Invoice List */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <input
              type="text"
              placeholder="Filter by Customer Name"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
            />
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-gray-300">
                <th className="p-3 text-left">Invoice Number</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-200">
                  <td className="p-3 text-white">{invoice.invoice_number}</td>
                  <td className="p-3 text-gray-300">{invoice.customer_name}</td>
                  <td className="p-3 font-semibold text-purple-400">${invoice.total_amount}</td>
                  <td className="p-3 flex justify-center space-x-3">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-blue-500 hover:text-blue-400 hover:scale-110 transition"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => deleteInvoice(invoice.id)}
                      className="text-red-500 hover:text-red-400 hover:scale-110 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-between p-4 items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg disabled:opacity-50 hover:bg-purple-600 transition"
            >
              Previous
            </button>
            <span className="text-gray-300">
              {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg disabled:opacity-50 hover:bg-purple-600 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Invoice Form */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
          <form onSubmit={saveInvoice} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <input
                type="text"
                placeholder="Invoice Number"
                value={invoiceForm.invoice_number}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, invoice_number: e.target.value }))
                }
                className="p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                required
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={invoiceForm.customer_name}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, customer_name: e.target.value }))
                }
                className="p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                required
              />
              <input
                type="date"
                value={invoiceForm.date}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                required
              />
            </div>

            {/* Line Items */}
            <div className="space-y-3 mb-4">
              {invoiceForm.details.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    placeholder="Description"
                    value={detail.description}
                    onChange={(e) => {
                      const newDetails = [...invoiceForm.details];
                      newDetails[index].description = e.target.value;
                      setInvoiceForm((prev) => ({ ...prev, details: newDetails }));
                    }}
                    className="p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={detail.quantity}
                    onChange={(e) => {
                      const newDetails = [...invoiceForm.details];
                      newDetails[index].quantity = parseInt(e.target.value, 10);
                      setInvoiceForm((prev) => ({ ...prev, details: newDetails }));
                    }}
                    min="1"
                    className="p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={detail.unit_price}
                    onChange={(e) => {
                      const newDetails = [...invoiceForm.details];
                      newDetails[index].unit_price = parseFloat(e.target.value);
                      setInvoiceForm((prev) => ({ ...prev, details: newDetails }));
                    }}
                    step="0.01"
                    min="0"
                    className="p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center bg-purple-700  text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition transform hover:scale-105"
              >
                <PlusCircle size={20} className="mr-2" />
                Add Line Item
              </button>
              <button
                type="submit"
                className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition transform hover:scale-105"
              >
                {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
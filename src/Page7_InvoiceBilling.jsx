import React, { useState } from 'react';
import './Page7_InvoiceBilling.css';

export default function Page7_InvoiceBilling({ setPage }) {
  const [items, setItems] = useState([
    { id: 1, label: "Frontend Layout Engineering", price: 850.00 },
    { id: 2, label: "State Architecture Setup", price: 400.00 }
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const subtotal = items.reduce((acc, curr) => acc + curr.price, 0);
  const taxRate = 0.075; // 7.5% Tax
  const taxTotal = subtotal * taxRate;
  const grandTotal = subtotal + taxTotal;

  const addItem = (e) => {
    e.preventDefault();
    if (!newLabel || !newPrice) return;
    setItems([...items, { id: Date.now(), label: newLabel, price: parseFloat(newPrice) }]);
    setNewLabel('');
    setNewPrice('');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="invoice-wrapper">
      <header className="invoice-controls-header">
        <button className="invoice-exit-btn" onClick={() => setPage('home')}>← Exit Subsystem</button>
        <span className="invoice-badge">BILLING LOGIC // V.07</span>
      </header>

      <main className="invoice-sheet">
        <div className="invoice-meta-row">
          <div>
            <h1 className="invoice-brand-title">Invoice Record</h1>
            <p className="invoice-serial-text">REF-2026-1010</p>
          </div>
          <div className="date-block text-right">
            <p><strong>Issued:</strong> Oct 10, 2026</p>
            <p><em>Due: On Receipt</em></p>
          </div>
        </div>

        {/* Dynamic Item Form Input */}
        <form onSubmit={addItem} className="invoice-item-form">
          <input
            type="text"
            placeholder="Item description or service..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price ($)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
          <button type="submit" className="invoice-add-btn">Append Line</button>
        </form>

        {/* Line Items Table */}
        <table className="invoice-item-table">
          <thead>
            <tr>
              <th>Service Details / Scope</th>
              <th className="text-right">Unit Price</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.label}</td>
                <td className="text-right font-mono">\${item.price.toFixed(2)}</td>
                <td className="text-center">
                  <button type="button" className="invoice-del-btn" onClick={() => removeItem(item.id)}>Drop</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Browser Calculated Ledger Totals */}
        <div className="invoice-summary-block">
          <div className="summary-line">
            <span>Subtotal:</span>
            <span className="font-mono">\${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Tax Surcharge (7.5%):</span>
            <span className="font-mono">\${taxTotal.toFixed(2)}</span>
          </div>
          <div className="summary-line grand-total-line">
            <span className="bold-total-label">AGGREGATE DUE:</span>
            <span className="font-mono grand-total-display">\${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <footer className="invoice-footer-notes">
          <p><em>Notice: Thank you for your business. Late adjustments trigger ledger calculation syncs automatically.</em></p>
        </footer>
      </main>
    </div>
  );
}

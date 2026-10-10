import React, { useState } from 'react';
import './Page7_InvoiceBilling.css';

export default function Page7_InvoiceBilling({ setPage }) {
  const [items, setItems] = useState([
    { id: 1, label: "Frontend Layout Engineering", price: 850.00, qty: 1 },
    { id: 2, label: "State Architecture Setup", price: 400.00, qty: 2 }
  ]);

  // Advanced Invoice Meta State
  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientEmail, setClientEmail] = useState('billing@acme.io');
  const [invoiceStatus, setInvoiceStatus] = useState('Pending');
  const [customTaxRate, setCustomTaxRate] = useState(0.075); // 7.5% VAT default

  // New Item Form State
  const [newLabel, setNewLabel] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('1');

  // Quick Service Preset Templates
  const servicePresets = [
    { label: "Smart Contract Security Audit", price: 2500.00 },
    { label: "Full-Stack Microservice API", price: 1200.00 },
    { label: "CI/CD Pipeline Automation", price: 600.00 },
    { label: "Database Latency Optimization", price: 950.00 }
  ];

  const handlePresetSelect = (e) => {
    const selected = servicePresets.find(p => p.label === e.target.value);
    if (selected) {
      setNewLabel(selected.label);
      setNewPrice(selected.price.toString());
      setNewQty('1');
    }
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const taxTotal = subtotal * customTaxRate;
  const grandTotal = subtotal + taxTotal;

  const addItem = (e) => {
    e.preventDefault();
    if (!newLabel || !newPrice) return;
    setItems([...items, { id: Date.now(), label: newLabel, price: parseFloat(newPrice), qty: parseInt(newQty) || 1 }]);
    setNewLabel('');
    setNewPrice('');
    setNewQty('1');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-wrapper">
      <header className="invoice-controls-header">
        <button className="invoice-exit-btn" onClick={() => setPage('home')}>← Exit Subsystem</button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={invoiceStatus} 
            onChange={(e) => setInvoiceStatus(e.target.value)}
            style={{ background: 'transparent', color: '#E0E0E0', border: '1px solid #404040', padding: '4px 8px', fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="Pending" style={{ background: '#1A1A1A' }}>Status: Pending</option>
            <option value="Paid" style={{ background: '#1A1A1A' }}>Status: Paid</option>
            <option value="Net-30" style={{ background: '#1A1A1A' }}>Status: Net-30</option>
            <option value="Overdue" style={{ background: '#1A1A1A' }}>Status: Overdue</option>
          </select>
          <button className="invoice-exit-btn" onClick={handlePrint}>🖨️ Print / PDF</button>

        </div>
      </header>

      <main className="invoice-sheet">
        <div className="invoice-meta-row">
          <div>
            <h1 className="invoice-brand-title">Enterprise Invoice</h1>
            <p className="invoice-serial-text">REF-2026-1010</p>
            <div style={{ marginTop: '12px', fontSize: '0.85rem', opacity: 0.9 }}>
              <p><strong>Billed To:</strong> {clientName} ({clientEmail})</p>
            </div>
          </div>
          <div className="date-block text-right">
            <p><strong>Issued:</strong> Oct 10, 2026</p>
            <p><strong>Due Term:</strong> Net-30 Days</p>
            <p style={{ marginTop: '8px' }}>
              <span style={{ 
                padding: '3px 10px', 
                fontSize: '0.75rem', 
                fontWeight: 'bold', 
                border: '1px solid currentColor',
                color: invoiceStatus === 'Paid' ? '#10B981' : invoiceStatus === 'Pending' ? '#FFD166' : '#EF4444'
              }}>
                {invoiceStatus.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        {/* Client Entity & Tax Configuration Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px dashed #404040' }}>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', opacity: 0.7 }}>Client Entity</label>
            <input 
              type="text" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)}
              style={{ width: '100%', padding: '6px', background: '#262626', border: '1px solid #404040', color: '#E0E0E0', fontSize: '0.85rem', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', opacity: 0.7 }}>Client Email</label>
            <input 
              type="email" 
              value={clientEmail} 
              onChange={(e) => setClientEmail(e.target.value)}
              style={{ width: '100%', padding: '6px', background: '#262626', border: '1px solid #404040', color: '#E0E0E0', fontSize: '0.85rem', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', opacity: 0.7 }}>Tax Surcharge Rate</label>
            <select 
              value={customTaxRate} 
              onChange={(e) => setCustomTaxRate(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '7px', background: '#262626', border: '1px solid #404040', color: '#E0E0E0', fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value={0.075}>Standard VAT (7.5%)</option>
              <option value={0.05}>Reduced Tax (5.0%)</option>
              <option value={0.10}>Corporate Rate (10.0%)</option>
              <option value={0.0}>Tax Exempt (0.0%)</option>
            </select>
          </div>
        </div>

        {/* Quick Service Preset Selector */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', opacity: 0.7 }}>Quick Service Templates:</label>
          <select 
            onChange={handlePresetSelect} 
            defaultValue=""
            style={{ width: '100%', padding: '8px', background: '#262626', border: '1px solid #404040', color: '#E0E0E0', fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="" disabled>-- Select preset engineering service --</option>
            {servicePresets.map((preset, idx) => (
              <option key={idx} value={preset.label}>{preset.label} (${preset.price.toFixed(2)})</option>
            ))}
          </select>
        </div>

        {/* Dynamic Item Form Input */}
        <form onSubmit={addItem} className="invoice-item-form">
          <input
            type="text"
            placeholder="Item description or service scope..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Unit Price ($)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            style={{ width: '80px', padding: '10px', background: '#262626', border: '1px solid #404040', color: '#E0E0E0', fontFamily: 'inherit' }}
            required
          />
          <button type="submit" className="invoice-add-btn">Append Line</button>
        </form>

        {/* Line Items Table */}
        <table className="invoice-item-table">
          <thead>
            <tr>
              <th>Service Details / Scope</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Line Total</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.label}</td>
                <td className="text-center font-mono">{item.qty}</td>
                <td className="text-right font-mono">${item.price.toFixed(2)}</td>
                <td className="text-right font-mono">${(item.price * item.qty).toFixed(2)}</td>
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
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Tax Surcharge ({(customTaxRate * 100).toFixed(1)}%):</span>
            <span className="font-mono">${taxTotal.toFixed(2)}</span>
          </div>
          <div className="summary-line grand-total-line">
            <span className="bold-total-label">AGGREGATE DUE:</span>
            <span className="font-mono grand-total-display">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <footer className="invoice-footer-notes">
          <p><em>Notice: Thank you for your business. Remit payment to corporate treasury account. Late adjustments trigger ledger calculation syncs automatically.</em></p>
        </footer>
      </main>
    </div>
  );
}

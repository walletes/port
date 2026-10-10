import React, { useState, useEffect } from 'react';
import './Page4_BankLedger.css';

export default function Page4_BankLedger({ setPage }) {
  const [transactions, setTransactions] = useState([
    {
      id: "TX-401",
      description: "Cloud Infrastructure License",
      type: "debit",
      amount: 120.00,
      date: "2026-10-08",
      channel: "API billing",
      status: "Settled"
    },
    {
      id: "TX-402",
      description: "Contract Invoicing Payout",
      type: "credit",
      amount: 1450.00,
      date: "2026-10-05",
      channel: "Direct deposit",
      status: "Settled"
    },
    {
      id: "TX-403",
      description: "Domain Name Renewal",
      type: "debit",
      amount: 15.99,
      date: "2026-10-02",
      channel: "Stripe gate",
      status: "Settled"
    }
  ]);

  // Controls & FX State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'credit', 'debit'
  const [currency, setCurrency] = useState('USD'); // USD, EUR, GBP, BTC
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Simulated live treasury sync status
  const [syncStatus, setSyncStatus] = useState('SECURE & SYNCED');

  /* useEffect(() => {
    const timer = setInterval(() => {
      setSyncStatus('CONNECTING LEDGER...');
      setTimeout(() => setSyncStatus('Connected & Synced'), 1500);
    }, 12000);
    return () => clearInterval(timer);
  }, []);
*/
  // New Transaction Form State
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState('debit');
  const [newChannel, setNewChannel] = useState('Direct Deposit');

  // FX Rates
  const fxRates = { USD: 1.0, EUR: 0.92, GBP: 0.79, BTC: 0.000015 };
  const fxSymbols = { USD: '$', EUR: '€', GBP: '£', BTC: '₿ ' };

  // Dynamic Ledger Sums
  const startingBalance = 3500.00;
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, current) => acc + current.amount, 0);

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, current) => acc + current.amount, 0);

  const currentBalance = startingBalance + totalCredits - totalDebits;

  // Convert amounts based on selected FX
  const convert = (val) => {
    const converted = val * fxRates[currency];
    return currency === 'BTC' ? converted.toFixed(6) : converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount || parseFloat(newAmount) <= 0) return;

    const newTx = {
      id: `TX-${Math.floor(100 + Math.random() * 900)}`,
      description: newDesc,
      type: newType,
      amount: parseFloat(newAmount),
      date: new Date().toISOString().split('T')[0],
      channel: newChannel,
      status: "Settled"
    };

    setTransactions([newTx, ...transactions]);
    setNewDesc('');
    setNewAmount('');
    setIsAdding(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setTransactions(transactions.filter(t => !selectedIds.includes(t.id)));
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = "ID,Description,Date,Channel,Type,Amount,Status\n";
    const rows = transactions.map(t => `${t.id},"${t.description}",${t.date},${t.channel},${t.type},${t.amount},${t.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corporate_treasury_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.channel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  // Cashflow Ratio Calculation for Progress Bar
  const totalFlow = totalCredits + totalDebits || 1;
  const creditPercent = Math.round((totalCredits / totalFlow) * 100);

  return (
    <div className="ledger-wrapper">
      <header className="ledger-header">
        <button
          className="exit-system-btn"
          onClick={() => setPage('home')}
        >
          ← Back to Directory
        </button>

        <div className="header-meta-group">
          <div className="currency-selector">
            {['USD', 'EUR', 'GBP', 'BTC'].map(curr => (
              <button
                key={curr}
                className={`curr-btn ${currency === curr ? 'active' : ''}`}
                onClick={() => setCurrency(curr)}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Financial Overview Cards */}
      <section className="balance-summary-section">
        <div className="summary-card main-balance">
          <p className="summary-label">Total Available Liquidity ({currency})</p>
          <h1 className="balance-display">
            {fxSymbols[currency]}{convert(currentBalance)}
          </h1>
          <div className="cashflow-ratio-bar">
            <div className="ratio-fill" style={{ width: `${creditPercent}%` }}></div>
          </div>
          <small className="ratio-caption">Inflow/Outflow Health Ratio: {creditPercent}% Credits</small>
        </div>

        <div className="summary-card inflows-card">
          <p className="summary-label">Total Inflows (+ Credit)</p>
          <h2 className="flow-display credit-text">
            +{fxSymbols[currency]}{convert(totalCredits)}
          </h2>
        </div>

        <div className="summary-card outflows-card">
          <p className="summary-label">Total Outflows (- Debit)</p>
          <h2 className="flow-display debit-text">
            -{fxSymbols[currency]}{convert(totalDebits)}
          </h2>
        </div>
      </section>

      {/* Action Bar & Controls */}
      <div className="ledger-actions-bar">
        <div className="ledger-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, description, or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="filter-tabs">
            {['all', 'credit', 'debit'].map(type => (
              <button
                key={type}
                className={`tab-btn ${typeFilter === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type === 'all' ? 'All Entries' : type === 'credit' ? 'Inflows (+)' : 'Outflows (-)'}
              </button>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          {selectedIds.length > 0 && (
            <button className="bulk-delete-btn" onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            className="add-tx-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "✕ Cancel" : "+ Record Entry"}
          </button>
          <button
            className="export-btn"
            onClick={handleExportCSV}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* New Transaction Form */}
      {isAdding && (
        <form onSubmit={handleAddTransaction} className="add-transaction-form">
          <h3>Record New Ledger Entry</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Description / Vendor</label>
              <input
                type="text"
                placeholder="e.g. AWS Cloud Services"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (USD Base)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Entry Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="debit">Debit (Outflow)</option>
                <option value="credit">Credit (Inflow)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Channel</label>
              <select value={newChannel} onChange={(e) => setNewChannel(e.target.value)}>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="API Billing">API Billing</option>
                <option value="Stripe Gateway">Stripe Gateway</option>
                <option value="Wire Transfer">Wire Transfer</option>
              </select>
            </div>
          </div>
          <button type="submit" className="submit-entry-btn">
            Post to Ledger
          </button>
        </form>
      )}

      {/* Historical Ledger Table */}
      <section className="ledger-table-section">
        <div className="table-header-row">
          <h2 className="table-heading">Historical Balance Entries</h2>
          <span className="entry-count-badge">Showing {filteredTransactions.length} records</span>
        </div>

        <div className="table-scroll-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                  />
                </th>
                <th>ID Reference</th>
                <th>Description / Scope</th>
                <th>Execution Date</th>
                <th>Payment Channel</th>
                <th>Status</th>
                <th className="text-right">Transaction Volume</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(item => (
                  <tr key={item.id} className={`${item.type} ${selectedIds.includes(item.id) ? 'selected-row' : ''}`}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                      />
                    </td>
                    <td className="font-mono">{item.id}</td>

                    <td>
                      <strong>{item.description}</strong>
                    </td>

                    <td>{item.date}</td>

                    <td>
                      <em>{item.channel}</em>
                    </td>

                    <td>
                      <span className="status-pill">{item.status}</span>
                    </td>

                    <td className={`text-right volume-cell ${item.type}`}>
                      {item.type === 'credit'
                        ? `+ ${fxSymbols[currency]}${convert(item.amount)}`
                        : `- ${fxSymbols[currency]}${convert(item.amount)}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

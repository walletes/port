import React, { useState } from 'react';
import './Page6_WarehouseStock.css';

export default function Page6_WarehouseStock({ setPage }) {
  const [items, setItems] = useState([
    { sku: "SKU-882", label: "ARM Core System Control Boards", quantity: 42, bay: "A-04", limit: 15, unitPrice: 240.00 },
    { sku: "SKU-419", label: "Cat6 External Shielded Network Cables", quantity: 8, bay: "B-12", limit: 10, unitPrice: 18.50 },
    { sku: "SKU-301", label: "Solid-State Flash System Disks (2TB)", quantity: 156, bay: "C-01", limit: 20, unitPrice: 110.00 },
    { sku: "SKU-504", label: "Power Distribution Rail Modules (48V)", quantity: 5, bay: "D-09", limit: 8, unitPrice: 320.00 }
  ]);

  // Controls State
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'healthy'
  const [isAdding, setIsAdding] = useState(false);

  // New Item Intake State
  const [newSku, setNewSku] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newBay, setNewBay] = useState('A-01');
  const [newQty, setNewQty] = useState('');
  const [newLimit, setNewLimit] = useState('10');
  const [newPrice, setNewPrice] = useState('50.00');

  const adjustStock = (sku, value) => {
    setItems(items.map(item =>
      item.sku === sku
        ? { ...item, quantity: Math.max(0, item.quantity + value) }
        : item
    ));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newQty) return;

    const newItem = {
      sku: newSku.trim() ? newSku.toUpperCase() : `SKU-${Math.floor(100 + Math.random() * 900)}`,
      label: newLabel,
      quantity: parseInt(newQty) || 0,
      bay: newBay,
      limit: parseInt(newLimit) || 10,
      unitPrice: parseFloat(newPrice) || 50.00
    };

    setItems([newItem, ...items]);
    setNewSku('');
    setNewLabel('');
    setNewQty('');
    setNewLimit('10');
    setNewPrice('50.00');
    setIsAdding(false);
  };

  const handleExportCSV = () => {
    const headers = "SKU,Description,Shelf Bay,Quantity,Alert Limit,Unit Price,Total Value\n";
    const rows = items.map(i => `${i.sku},"${i.label}",${i.bay},${i.quantity},${i.limit},${i.unitPrice},${(i.quantity * i.unitPrice).toFixed(2)}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_manifest_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Telemetry Aggregates
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockCount = items.filter(item => item.quantity <= item.limit).length;

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.bay.toLowerCase().includes(search.toLowerCase());

    const isLow = item.quantity <= item.limit;
    const matchesFilter =
      stockFilter === 'all' ||
      (stockFilter === 'low' && isLow) ||
      (stockFilter === 'healthy' && !isLow);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="stock-wrapper">
      <header className="stock-header">
        <button
          className="exit-terminal-btn"
          onClick={() => setPage('home')}
        >
          ← Close Operations
        </button>

        <span className="terminal-badge">
        </span>
      </header>

      <section className="manifest-controls">
        <h1 className="stock-title">
          Warehouse Inventory Console
        </h1>

        {/* Toolbar Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            className="exit-terminal-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "✕ Cancel Entry" : "+ Register SKU"}
          </button>
          <button
            className="exit-terminal-btn"
            onClick={handleExportCSV}
          >
            ↓ Export Manifest
          </button>
          <button
            className="exit-terminal-btn"
            style={{ backgroundColor: stockFilter === 'low' ? '#FFD166' : 'transparent', color: stockFilter === 'low' ? '#1A1A1A' : '#E0E0E0' }}
            onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
          >
            Warnings Only ({lowStockCount})
          </button>
        </div>

        {/* New Item Intake Form */}
        {isAdding && (
          <form onSubmit={handleAddItem} className="manifest-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#FFD166', fontSize: '1.1rem' }}>Register New Manifest SKU</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.8 }}>SKU ID</label>
                <input
                  type="text"
                  placeholder="e.g. SKU-910"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="stock-search-input"
                  style={{ padding: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.8 }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fiber Patch Cables"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="stock-search-input"
                  style={{ padding: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.8 }}>Shelf Bay</label>
                <input
                  type="text"
                  placeholder="e.g. A-04"
                  value={newBay}
                  onChange={(e) => setNewBay(e.target.value)}
                  className="stock-search-input"
                  style={{ padding: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.8 }}>Initial Units</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="stock-search-input"
                  style={{ padding: '8px' }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="exit-terminal-btn"
              style={{ marginTop: '10px', alignSelf: 'flex-start', backgroundColor: '#FFD166', color: '#1A1A1A', borderColor: '#FFD166', fontWeight: 'bold' }}
            >
              Commit SKU
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Filter manifest by SKU identifier, item label, or shelf bay..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="stock-search-input"
        />
      </section>

      <main className="manifest-list">
        {filteredItems.map(item => {
          const isLowStock = item.quantity <= item.limit;

          return (
            <div
              key={item.sku}
              className={`manifest-card ${isLowStock ? 'low-stock-alert' : ''}`}
            >
              <div className="card-identity-row">
                <span className="sku-tag">
                  {item.sku}
                </span>

                <span className="bay-location">
                  Location: Shelf <strong>{item.bay}</strong>
                </span>
              </div>

              <h2 className="item-label-text">
                {item.label}
              </h2>

              <div className="stock-counter-row">
                <div className="counter-display">
                  <span className="count-number">
                    {item.quantity}
                  </span>

                  <span className="count-unit">
                    Units on hand
                  </span>
                </div>

                <div className="counter-actions">
                  <button
                    className="qty-adjust-btn"
                    onClick={() => adjustStock(item.sku, -1)}
                    disabled={item.quantity === 0}
                    aria-label={`Decrease stock for ${item.label}`}
                  >
                    −
                  </button>

                  <button
                    className="qty-adjust-btn"
                    onClick={() => adjustStock(item.sku, 1)}
                    aria-label={`Increase stock for ${item.label}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {isLowStock && (
                <p className="low-stock-notice">
                  <em>
                    ⚠️ Alert Status: Restock parameter triggered.
                    Count dropped under target limit ({item.limit}).
                  </em>
                </p>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <p className="empty-stock-message" style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px' }}>
            No inventory items match your search.
          </p>
        )}
      </main>
    </div>
  );
}

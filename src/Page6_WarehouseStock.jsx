import React, { useState } from 'react';
import './Page6_WarehouseStock.css';

export default function Page6_WarehouseStock({ setPage }) {
  const [items, setItems] = useState([
    { sku: "SKU-882", label: "ARM Core System Control Boards", quantity: 42, bay: "A-04", limit: 15 },
    { sku: "SKU-419", label: "Cat6 External Shielded Network Cables", quantity: 8, bay: "B-12", limit: 10 },
    { sku: "SKU-301", label: "Solid-State Flash System Disks (2TB)", quantity: 156, bay: "C-01", limit: 20 }
  ]);

  const [search, setSearch] = useState('');

  const adjustStock = (sku, value) => {
    setItems(items.map(item =>
      item.sku === sku ? { ...item, quantity: Math.max(0, item.quantity + value) } : item
    ));
  };

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stock-wrapper">
      <header className="stock-header">
        <button className="exit-terminal-btn" onClick={() => setPage('home')}>← Close Operations</button>
        <span className="terminal-badge">MANIFEST SUBSYSTEM // LIVE STOCK</span>
      </header>

      <section className="manifest-controls">
        <h1 className="stock-title">Warehouse Inventory Console</h1>
        <input
          type="text"
          placeholder="Filter manifest by SKU identifier or item label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="stock-search-input"
        />
      </section>

      <main className="manifest-list">
        {filteredItems.map(item => {
          const isLowStock = item.quantity <= item.limit;
          return (
            <div key={item.sku} className={`manifest-card ${isLowStock ? 'low-stock-alert' : ''}`}>

              <span className="sku-tag">{item.sku}</span>
              <span className="bay-location">Location: Shelf <strong>{item.bay}</strong></span>
            </div>

            <h2 className="item-label-text">{item.label}</h2>

            <div className="stock-counter-row">
              <div className="counter-display">
                <span className="count-number">{item.quantity}</span>
                <span className="count-unit">Units on hand</span>
              </div>

              <div className="counter-actions">
                <button className="qty-adjust-btn" onClick={() => adjustStock(item.sku, -1)}>−</button>
                <button className="qty-adjust-btn" onClick={() => adjustStock(item.sku, 1)}>+</button>
              </div>
            </div>

            {isLowStock && (
              <p className="low-stock-notice">
                <em>⚠️ Alert Status: Restock parameter triggered. Count dropped under target limit ({item.limit}).</em>
              </p>
            )}
          </div>
          );
        })}
      </main>
    </div>
  );
}

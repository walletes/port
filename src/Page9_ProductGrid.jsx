import React, { useState } from 'react';
import './Page9_ProductGrid.css';

export default function Page9_ProductGrid({ setPage }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cartCount, setCartCount] = useState(0);

  const inventory = [
    { id: 1, title: "Structured Canvas Utility Jacket", price: 145.00, originalPrice: 195.00, category: "APPAREL", size: "M, L, XL" },
    { id: 2, title: "Ergonomic Vegetable-Tanned Leather Satchel", price: 280.00, originalPrice: null, category: "ACCESSORIES", size: "O/S" },
    { id: 3, title: "Minimalist Brushed Steel Desk Chronograph", price: 110.00, originalPrice: 150.00, category: "ACCESSORIES", size: "O/S" },
    { id: 4, title: "Relaxed Fit Heavyweight Cotton Hooded Sweater", price: 85.00, originalPrice: null, category: "APPAREL", size: "S, M, L" }
  ];

  const filteredItems = selectedCategory === 'ALL'
    ? inventory
    : inventory.filter(item => item.category === selectedCategory);

  return (
    <div className="catalog-wrapper">
      <header className="catalog-top-nav">
        <button className="catalog-exit-btn" onClick={() => setPage('home')}>← Main System</button>
        <div className="cart-counter-pill">
          Bag Capacity: <strong>{cartCount} units</strong>
        </div>
      </header>

      <section className="catalog-controls">
        <h1 className="catalog-headline">Curated Stock Collection</h1>

        <div className="filter-tab-row">
          <button onClick={() => setSelectedCategory('ALL')} className={selectedCategory === 'ALL' ? 'active-tab' : ''}>All Goods</button>
          <button onClick={() => setSelectedCategory('APPAREL')} className={selectedCategory === 'APPAREL' ? 'active-tab' : ''}>Apparel</button>
          <button onClick={() => setSelectedCategory('ACCESSORIES')} className={selectedCategory === 'ACCESSORIES' ? 'active-tab' : ''}>Accessories</button>
        </div>
      </section>

      {/* The browser natively calculates item columns and wraps them based on screensize */}
      <main className="catalog-grid-layout">
        {filteredItems.map(goods => (
          <div key={goods.id} className="catalog-card">
            <div className="card-image-placeholder">
              <span className="category-meta-tag">{goods.category}</span>
            </div>

            <div className="card-details-box">
              <h2 className="goods-title">{goods.title}</h2>
              <p className="goods-sizes">Available Dimensions: <em>{goods.size}</em></p>

              <div className="price-action-row">
                <div className="price-display-block">
                  <span className="current-price">\${goods.price.toFixed(2)}</span>
                  {goods.originalPrice && (
                    <span className="slashed-price">
                      <del>\${goods.originalPrice.toFixed(2)}</del>
                    </span>
                  )}
                </div>

                <button className="add-to-bag-btn" onClick={() => setCartCount(cartCount + 1)}>
                  Acquire Item
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

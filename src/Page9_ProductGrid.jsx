import React, { useState } from 'react';
import './Page9_ProductGrid.css';

export default function Page9_ProductGrid({ setPage }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);


  // Expanded Catalog with Asymmetric Layout Flags & Detailed Specs
  const [inventory] = useState([
    {
      id: 1,
      sku: "CAT-JKT-01",
      title: "Structured Canvas Utility Jacket",
      price: 145.00,
      originalPrice: 195.00,
      category: "APPAREL",
      size: "M, L, XL",
      stock: 12,
      featured: true,
      badge: "BESTSELLER",
      material: "100% Organic Heavyweight Cotton Canvas",
      description: "Precision-tailored industrial utility jacket engineered with reinforced double-needle stitching, brass zipper hardware, and weather-resistant wax coating."
    },
    {
      id: 2,
      sku: "CAT-LHR-02",
      title: "Ergonomic Vegetable-Tanned Leather Satchel",
      price: 280.00,
      originalPrice: null,
      category: "ACCESSORIES",
      size: "O/S",
      stock: 4,
      featured: false,
      badge: "LIMITED EDITION",
      material: "Full-Grain Italian Calfskin Leather",
      description: "Handcrafted carrying satchel featuring custom anodized aluminum buckles, padded laptop sleeve, and adjustable shoulder strap."
    },
    {
      id: 3,
      sku: "CAT-CLK-03",
      title: "Minimalist Brushed Steel Desk Chronograph",
      price: 110.00,
      originalPrice: 150.00,
      category: "ACCESSORIES",
      size: "O/S",
      stock: 18,
      featured: false,
      badge: "SALE",
      material: "316L Stainless Steel & Mineral Glass",
      description: "Precision quartz desk chronometer housed in a monolithic brushed steel chassis with silent sweep movement."
    },
    {
      id: 4,
      sku: "CAT-HDY-04",
      title: "Relaxed Fit Heavyweight Cotton Hooded Sweater",
      price: 85.00,
      originalPrice: null,
      category: "APPAREL",
      size: "S, M, L, XL",
      stock: 25,
      featured: false,
      badge: "NEW RELEASE",
      material: "480 GSM Loopback French Terry",
      description: "Ultra-dense knit hoodie with double-lined drawstring hood, custom ribbing, and pre-shrunk architectural silhouette."
    },
    {
      id: 5,
      sku: "CAT-BOT-05",
      title: "Tactical Cordura All-Terrain Combat Boots",
      price: 220.00,
      originalPrice: 260.00,
      category: "FOOTWEAR",
      size: "40, 41, 42, 43, 44",
      stock: 3,
      featured: false,
      wide: true,
      badge: "LOW STOCK",
      material: "1000D Cordura Nylon & Vibram Rubber",
      description: "High-spec tactical footwear built for extreme environments, incorporating waterproof Gore-Tex lining and high-traction rubber lug soles."
    },
    {
      id: 6,
      sku: "CAT-WLT-06",
      title: "RFID-Blocking Carbon Fiber Card Vault",
      price: 65.00,
      originalPrice: null,
      category: "ACCESSORIES",
      size: "O/S",
      stock: 30,
      featured: false,
      badge: "ESSENTIAL",
      material: "3K Aerospace-Grade Carbon Fiber",
      description: "Ultralight minimalist card carrier with spring-loaded quick-draw mechanism and integrated bill clip."
    },
    {
      id: 7,
      sku: "CAT-TRS-07",
      title: "Pleated Technical Cargo Trousers",
      price: 130.00,
      originalPrice: 165.00,
      category: "APPAREL",
      size: "30, 32, 34, 36",
      stock: 8,
      featured: false,
      badge: "POPULAR",
      material: "Water-Repellent Stretch Twill",
      description: "Ergonomic cargo pants featuring integrated magnetic fidlock pockets, articulated knee gussets, and cinchable cuffs."
    }
  ]);

  // Cart Management Logic
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    triggerToast(`Acquired 1x ${product.title} to your bag.`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalCartUnits = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Filtering & Sorting
  const filteredItems = inventory.filter(goods => {
    const matchesCategory = selectedCategory === 'ALL' || goods.category === selectedCategory;
    const matchesSearch = 
      goods.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goods.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goods.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'stock') return b.stock - a.stock;
    return 0;
  });
const [toastMessage, setToastMessage] = useState(null);

const triggerToast = (msg) => {
setToastMessage(msg);
setTimeout(() => setToastMessage(null), 3000);
};
  return (
    <div className="catalog-wrapper">
      {/* Top Header Navigation Bar */}
      <header className="catalog-top-nav">
        <button className="catalog-exit-btn" onClick={() => setPage('home')}>
          ← Main Directory
        </button>

        <button className="cart-counter-pill" onClick={() => setIsCartOpen(!isCartOpen)}>
          Bag Capacity: <strong>{totalCartUnits} units</strong> (${cartSubtotal.toFixed(2)})
        </button>
      </header>

      {/* Catalog Headline & Search Controls */}
      <section className="catalog-controls">
        <div className="headline-row">
          <div>
            <h1 className="catalog-headline">Curated Stock Collection</h1>
            <p className="catalog-subhead">High-fidelity archival apparel, technical equipment, and precision accessories.</p>
          </div>

          <div className="search-sort-group">
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Search by product name, SKU, or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select 
              className="catalog-sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default Index</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="filter-tab-row">
          {['ALL', 'APPAREL', 'ACCESSORIES', 'FOOTWEAR'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`filter-tab-btn ${selectedCategory === cat ? 'active-tab' : ''}`}
            >
              {cat === 'ALL' ? 'All Goods' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Asymmetric Bento Product Grid Layout */}
      <main className="catalog-grid-layout">
        {filteredItems.length === 0 ? (
          <div className="empty-catalog-card">
            <p>No catalog items found matching your specified search and filter criteria.</p>
          </div>
        ) : (
          filteredItems.map(goods => (
            <div 
              key={goods.id} 
              className={`catalog-card ${goods.featured ? 'featured-hero-card' : ''} ${goods.wide ? 'wide-banner-card' : ''}`}
            >
              <div className="card-image-placeholder">
                <span className="category-meta-tag">{goods.category}</span>
                {goods.badge && <span className="product-badge-tag">{goods.badge}</span>}
                <span className="sku-code-tag">{goods.sku}</span>
              </div>

              <div className="card-details-box">
                <h2 className="goods-title">{goods.title}</h2>
                <p className="goods-material">Material: {goods.material}</p>
                <p className="goods-sizes">Available Dimensions: <em>{goods.size}</em></p>

                <div className="stock-level-indicator">
                  <span className={`stock-dot ${goods.stock <= 5 ? 'critical' : 'healthy'}`}></span>
                  <span>{goods.stock <= 5 ? `Critical Alert: ${goods.stock} units left` : `In Stock: ${goods.stock} units`}</span>
                </div>

                <div className="price-action-row">
                  <div className="price-display-block">
                    <span className="current-price">${goods.price.toFixed(2)}</span>
                    {goods.originalPrice && (
                      <span className="slashed-price">
                        <del>${goods.originalPrice.toFixed(2)}</del>
                      </span>
                    )}
                  </div>

                  <div className="card-btn-group">
                    <button className="quick-spec-btn" onClick={() => setQuickViewProduct(goods)}>
                      Specs
                    </button>
                    <button className="add-to-bag-btn" onClick={() => addToCart(goods)}>
                      Acquire Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Quick View Spec Modal Drawer */}
      {quickViewProduct && (
        <div className="spec-modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="spec-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="spec-modal-header">
              <h3>Technical Product Specification</h3>
              <button className="close-modal-btn" onClick={() => setQuickViewProduct(null)}>✕</button>
            </div>

            <div className="spec-modal-body">
              <span className="sku-tag-modal">{quickViewProduct.sku}</span>
              <h2>{quickViewProduct.title}</h2>
              <p className="spec-desc">{quickViewProduct.description}</p>

              <div className="spec-detail-grid">
                <div><strong>Category:</strong> {quickViewProduct.category}</div>
                <div><strong>Materials:</strong> {quickViewProduct.material}</div>
                <div><strong>Sizing Specs:</strong> {quickViewProduct.size}</div>
                <div><strong>Current Stock:</strong> {quickViewProduct.stock} units</div>
                <div><strong>Unit Price:</strong> ${quickViewProduct.price.toFixed(2)}</div>
              </div>

              <div className="spec-modal-footer">
                <button className="add-to-bag-btn" onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}>
                  Add to Shopping Bag (${quickViewProduct.price.toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2>Acquired Items Bag ({totalCartUnits})</h2>
              <button className="close-modal-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <p className="empty-cart-msg">Your acquisition bag is currently empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-info">
                      <strong>{item.title}</strong>
                      <span>${item.price.toFixed(2)} each</span>
                    </div>

                    <div className="cart-item-controls">
                      <button onClick={() => updateCartQty(item.id, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>Drop</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="subtotal-row">
                  <span>Subtotal Valuation:</span>
                  <strong>${cartSubtotal.toFixed(2)}</strong>
                </div>
                <button className="checkout-btn" onClick={() => { setIsCartOpen(false); triggerToast('Order acquisition query transmitted to ledger.'); }}>
                  Transmit Order (${cartSubtotal.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Custom In-App Notification Toast */}
      {toastMessage && (
      <div className="custom-notification-toast">
      <span>{toastMessage}</span>
      </div>
      )}
    </div>
  );
}

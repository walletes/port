
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './Page9_ProductGrid.css';

const INITIAL_INVENTORY = [
  {
    id: 1,
    sku: 'CAT-JKT-01',
    title: 'Structured Canvas Utility Jacket',
    image: '/Jacket.jpg',
    price: 145,
    originalPrice: 195,
    category: 'APPAREL',
    size: 'M, L, XL',
    stock: 12,
    featured: true,
    badge: 'BESTSELLER',
    material: '100% Organic Heavyweight Cotton Canvas',
    description: 'Precision-tailored industrial utility jacket engineered with reinforced double-needle stitching, brass zipper hardware, and weather-resistant wax coating.'
  },
  {
    id: 2,
    sku: 'CAT-LHR-02',
    title: 'Ergonomic Vegetable-Tanned Leather Satchel',
    image: '/Bag.jpg',
    price: 280,
    originalPrice: null,
    category: 'ACCESSORIES',
    size: 'O/S',
    stock: 4,
    featured: false,
    badge: 'LIMITED EDITION',
    material: 'Full-Grain Italian Calfskin Leather',
    description: 'Handcrafted carrying satchel featuring custom anodized aluminum buckles, padded laptop sleeve, and adjustable shoulder strap.'
  },
  {
    id: 3,
    sku: 'CAT-CLK-03',
    title: 'Minimalist Brushed Steel Desk Chronograph',
    image: '/Watch.jpg',
    price: 110,
    originalPrice: 150,
    category: 'ACCESSORIES',
    size: 'O/S',
    stock: 18,
    featured: false,
    badge: 'SALE',
    material: '316L Stainless Steel & Mineral Glass',
    description: 'Precision quartz desk chronometer housed in a monolithic brushed steel chassis with silent sweep movement.'
  },
  {
    id: 4,
    sku: 'CAT-HDY-04',
    title: 'Relaxed Fit Heavyweight Cotton Hooded Sweater',
    image: '/Hoodie.jpg',
    price: 85,
    originalPrice: null,
    category: 'APPAREL',
    size: 'S, M, L, XL',
    stock: 25,
    featured: false,
    badge: 'NEW RELEASE',
    material: '480 GSM Loopback French Terry',
    description: 'Ultra-dense knit hoodie with double-lined drawstring hood, custom ribbing, and pre-shrunk architectural silhouette.'
  },
  {
    id: 5,
    sku: 'CAT-BOT-05',
    title: 'Tactical Cordura All-Terrain Combat Boots',
    image: '/Boot.jpg',
    price: 220,
    originalPrice: 260,
    category: 'FOOTWEAR',
    size: '40, 41, 42, 43, 44',
    stock: 3,
    featured: false,
    wide: true,
    badge: 'LOW STOCK',
    material: '1000D Cordura Nylon & Vibram Rubber',
    description: 'High-spec tactical footwear built for demanding environments, incorporating waterproof lining and high-traction rubber lug soles.'
  },
  {
    id: 6,
    sku: 'CAT-WLT-06',
    title: 'RFID-Blocking Carbon Fiber Card Vault',
    image: '/Wallet.jpg',
    price: 65,
    originalPrice: null,
    category: 'ACCESSORIES',
    size: 'O/S',
    stock: 30,
    featured: false,
    badge: 'ESSENTIAL',
    material: '3K Aerospace-Grade Carbon Fiber',
    description: 'Ultralight minimalist card carrier with spring-loaded quick-draw mechanism and integrated bill clip.'
  },
  {
    id: 7,
    sku: 'CAT-TRS-07',
    title: 'Pleated Technical Cargo Trousers',
    image: '/Cargo%20Pant.jpg',
    price: 130,
    originalPrice: 165,
    category: 'APPAREL',
    size: '30, 32, 34, 36',
    stock: 8,
    featured: false,
    badge: 'POPULAR',
    material: 'Water-Repellent Stretch Twill',
    description: 'Ergonomic cargo pants featuring integrated magnetic pockets, articulated knee gussets, and cinchable cuffs.'
  }
];

const CATEGORIES = ['ALL', 'APPAREL', 'ACCESSORIES', 'FOOTWEAR'];

const formatMoney = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

const readStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export default function Page9_ProductGrid({ setPage }) {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [cart, setCart] = useState(() =>
    readStorage('catalog-demo-cart', [])
  );

  const [favorites, setFavorites] = useState(() =>
    readStorage('catalog-demo-favorites', [])
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState('');
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutDetails, setCheckoutDetails] = useState({
    customerName: '',
    email: '',
    shippingMethod: 'standard'
  });

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const searchInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  const triggerToast = useCallback((message) => {
    setToastMessage(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('catalog-demo-cart', JSON.stringify(cart));
    } catch {
      triggerToast('Cart could not be saved to local storage.');
    }
  }, [cart, triggerToast]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'catalog-demo-favorites',
        JSON.stringify(favorites)
      );
    } catch {
      triggerToast('Favorites could not be saved to local storage.');
    }
  }, [favorites, triggerToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (event.key === 'Escape') {
        setQuickViewProduct(null);
        setIsCartOpen(false);
        setIsCompareOpen(false);
        setCheckoutOpen(false);
        return;
      }

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getCartQty = (productId) =>
    cart.find((item) => item.id === productId)?.qty || 0;

  const getAvailableStock = (product) =>
    Math.max(0, product.stock - getCartQty(product.id));

  const totalCartUnits = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((total, item) => total + item.price * item.qty, 0),
    [cart]
  );

  const originalCartValue = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + (item.originalPrice || item.price) * item.qty,
        0
      ),
    [cart]
  );

  const cartSavings = originalCartValue - cartSubtotal;

  const shippingCost = useMemo(() => {
    if (cart.length === 0 || cartSubtotal >= 250) return 0;

    return checkoutDetails.shippingMethod === 'express' ? 24.99 : 9.99;
  }, [cart.length, cartSubtotal, checkoutDetails.shippingMethod]);

  const estimatedTax = cartSubtotal * 0.075;
  const orderTotal = cartSubtotal + shippingCost + estimatedTax;

  const inventoryMetrics = useMemo(() => {
    const totalUnits = inventory.reduce(
      (total, product) => total + product.stock,
      0
    );

    const lowStock = inventory.filter(
      (product) => product.stock > 0 && product.stock <= 5
    ).length;

    const outOfStock = inventory.filter(
      (product) => product.stock === 0
    ).length;

    const catalogValue = inventory.reduce(
      (total, product) => total + product.stock * product.price,
      0
    );

    return {
      products: inventory.length,
      totalUnits,
      lowStock,
      outOfStock,
      catalogValue
    };
  }, [inventory]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inventory
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'ALL' ||
          product.category === selectedCategory;

        const matchesSearch =
          !query ||
          [
            product.title,
            product.sku,
            product.material,
            product.description,
            product.category,
            product.badge
          ].some((value) => value?.toLowerCase().includes(query));

        const matchesMinPrice =
          minPrice === '' || product.price >= Number(minPrice);

        const matchesMaxPrice =
          maxPrice === '' || product.price <= Number(maxPrice);

        const matchesFavorites =
          !showFavoritesOnly || favorites.includes(product.id);

        const matchesFeatured =
          !featuredOnly || product.featured;

        const matchesStock =
          !inStockOnly || product.stock > 0;

        return (
          matchesCategory &&
          matchesSearch &&
          matchesMinPrice &&
          matchesMaxPrice &&
          matchesFavorites &&
          matchesFeatured &&
          matchesStock
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'stock':
            return b.stock - a.stock;
          case 'name':
            return a.title.localeCompare(b.title);
          case 'discount':
            return (
              (b.originalPrice
                ? (b.originalPrice - b.price) / b.originalPrice
                : 0) -
              (a.originalPrice
                ? (a.originalPrice - a.price) / a.originalPrice
                : 0)
            );
          case 'default':
          default:
            return Number(b.featured) - Number(a.featured) || a.id - b.id;
        }
      });
  }, [
    inventory,
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    showFavoritesOnly,
    featuredOnly,
    inStockOnly,
    favorites,
    sortBy
  ]);

  const addToCart = (product) => {
    const currentQty = getCartQty(product.id);

    if (product.stock <= 0 || currentQty >= product.stock) {
      triggerToast('Stock limit reached for this product.');
      return;
    }

    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
            : item
        );
      }

      return [...previous, { ...product, qty: 1 }];
    });

    triggerToast(`${product.title} added to your bag.`);
  };

  const updateCartQty = (productId, delta) => {
    const product = inventory.find((item) => item.id === productId);

    setCart((previous) =>
      previous
        .map((item) => {
          if (item.id !== productId) return item;

          const nextQty = item.qty + delta;

          if (nextQty <= 0) return null;

          if (product && nextQty > product.stock) {
            triggerToast('Requested quantity exceeds available stock.');
            return item;
          }

          return { ...item, qty: nextQty };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((previous) =>
      previous.filter((item) => item.id !== productId)
    );

    triggerToast('Item removed from your bag.');
  };

  const clearCart = () => {
    if (cart.length === 0) return;

    setCart([]);
    triggerToast('Shopping bag cleared.');
  };

  const toggleFavorite = (productId) => {
    const alreadyFavorite = favorites.includes(productId);

    setFavorites((previous) =>
      alreadyFavorite
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );

    triggerToast(
      alreadyFavorite
        ? 'Removed from saved items.'
        : 'Added to saved items.'
    );
  };

  const toggleCompare = (product) => {
    const isSelected = compareItems.some(
      (item) => item.id === product.id
    );

    if (isSelected) {
      setCompareItems((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
      triggerToast('Product removed from comparison.');
      return;
    }

    if (compareItems.length >= 3) {
      triggerToast('You can compare up to three products at a time.');
      return;
    }

    setCompareItems((previous) => [...previous, product]);
    triggerToast('Product added to comparison.');
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSortBy('default');
    setMinPrice('');
    setMaxPrice('');
    setShowFavoritesOnly(false);
    setFeaturedOnly(false);
    setInStockOnly(false);
  };

  const startCheckout = () => {
    if (cart.length === 0) {
      triggerToast('Your shopping bag is empty.');
      return;
    }

    const invalidItem = cart.find((item) => {
      const product = inventory.find(
        (entry) => entry.id === item.id
      );

      return !product || item.qty > product.stock || product.stock <= 0;
    });

    if (invalidItem) {
      triggerToast('Stock changed. Review your shopping bag.');
      return;
    }

    setCheckoutError('');
    setIsCartOpen(false);
    setCheckoutOpen(true);
  };

  const submitDemoOrder = (event) => {
    event.preventDefault();
    setCheckoutError('');

    if (!checkoutDetails.customerName.trim()) {
      setCheckoutError('Enter your name to continue.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutDetails.email)) {
      setCheckoutError('Enter a valid email address.');
      return;
    }

    const stockConflict = cart.some((item) => {
      const product = inventory.find(
        (entry) => entry.id === item.id
      );

      return !product || item.qty > product.stock;
    });

    if (stockConflict) {
      setCheckoutError(
        'One or more items no longer have sufficient stock. Please review your bag.'
      );
      return;
    }

    const orderReference = `DEMO-${Date.now()
      .toString(36)
      .toUpperCase()}`;

    const order = {
      reference: orderReference,
      customerName: checkoutDetails.customerName.trim(),
      email: checkoutDetails.email.trim(),
      items: cart.map((item) => ({ ...item })),
      subtotal: cartSubtotal,
      shipping: shippingCost,
      tax: estimatedTax,
      total: orderTotal,
      createdAt: new Date().toISOString(),
      status: 'DEMO ORDER CREATED'
    };

    setInventory((previous) =>
      previous.map((product) => {
        const orderedItem = cart.find(
          (item) => item.id === product.id
        );

        return orderedItem
          ? { ...product, stock: product.stock - orderedItem.qty }
          : product;
      })
    );

    setCheckoutOrder(order);
    setCart([]);
    setCheckoutOpen(false);
    setCheckoutDetails({
      customerName: '',
      email: '',
      shippingMethod: 'standard'
    });

    triggerToast('Demo order created successfully.');
  };

  return (
    <div className="catalog-wrapper">
      <header className="catalog-top-nav">
        <button
          type="button"
          className="catalog-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Main Directory
        </button>

        <div className="catalog-nav-actions">
          <button
            type="button"
            className="catalog-counter-btn"
            onClick={() => setShowFavoritesOnly((value) => !value)}
            aria-pressed={showFavoritesOnly}
          >
            ♡ Saved ({favorites.length})
          </button>

          <button
            type="button"
            className="catalog-counter-btn"
            onClick={() => setIsCompareOpen(true)}
          >
            Compare ({compareItems.length})
          </button>

          <button
            type="button"
            className="cart-counter-pill"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open shopping bag, ${totalCartUnits} units`}
          >
            Bag Capacity: <strong>{totalCartUnits} units</strong>
            {' '}({formatMoney(cartSubtotal)})
          </button>
        </div>
      </header>

      <section className="catalog-controls">
        <div className="headline-row">
          <div>
            <p className="catalog-eyebrow">COMMERCE / INVENTORY SYSTEM</p>
            <h1 className="catalog-headline">
              Curated Stock Collection
            </h1>
            <p className="catalog-subhead">
              High-fidelity archival apparel, technical equipment, and precision accessories.
            </p>
          </div>

          <div className="search-sort-group">
            <input
              ref={searchInputRef}
              type="search"
              className="catalog-search-input"
              placeholder="Search products, SKU, material... (press /)"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search catalog"
            />

            <select
              className="catalog-sort-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort products"
            >
              <option value="default">Featured / Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Stock: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="discount">Largest Discount</option>
            </select>
          </div>
        </div>

        <div className="catalog-metrics-grid">
          <div className="catalog-metric-card">
            <span>Catalog SKUs</span>
            <strong>{inventoryMetrics.products}</strong>
          </div>

          <div className="catalog-metric-card">
            <span>Available Units</span>
            <strong>{inventoryMetrics.totalUnits}</strong>
          </div>

          <div className="catalog-metric-card">
            <span>Low Stock Alerts</span>
            <strong>{inventoryMetrics.lowStock}</strong>
          </div>

          <div className="catalog-metric-card">
            <span>Inventory Valuation</span>
            <strong>{formatMoney(inventoryMetrics.catalogValue)}</strong>
          </div>
        </div>

        {inventoryMetrics.outOfStock > 0 && (
          <p className="catalog-inventory-alert" role="status">
            Inventory warning: {inventoryMetrics.outOfStock} product(s)
            are currently out of stock.
          </p>
        )}

        <div className="filter-tab-row">
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-tab-btn ${
                selectedCategory === category ? 'active-tab' : ''
              }`}
              aria-pressed={selectedCategory === category}
            >
              {category === 'ALL' ? 'All Goods' : category}
            </button>
          ))}
        </div>

        <div className="catalog-advanced-filters">
<label className="catalog-filter-field">
            Minimum price
            <input
              type="number"
              min="0"
              placeholder="$0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>

          <label className="catalog-filter-field">
            Maximum price
            <input
              type="number"
              min="0"
              placeholder="No limit"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>

          <label className="catalog-toggle-filter">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(event) => setFeaturedOnly(event.target.checked)}
            />
            Featured only
          </label>

          <label className="catalog-toggle-filter">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
            />
            In stock only
          </label>

          <label className="catalog-toggle-filter">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(event) =>
                setShowFavoritesOnly(event.target.checked)
              }
            />
            Saved only
          </label>

          <div className="catalog-view-switch" aria-label="Catalog layout">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'active-tab' : ''}
              aria-pressed={viewMode === 'grid'}
            >
              Grid
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active-tab' : ''}
              aria-pressed={viewMode === 'list'}
            >
              List
            </button>
          </div>

          <button
            type="button"
            className="catalog-reset-btn"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>

        {minPrice !== '' &&
          maxPrice !== '' &&
          Number(minPrice) > Number(maxPrice) && (
            <p className="catalog-filter-error" role="alert">
              Minimum price cannot exceed maximum price.
            </p>
          )}

        <div className="catalog-results-meta">
          <span>
            Showing {filteredItems.length} of {inventory.length} products
          </span>
          <span>
            {compareItems.length}/3 products selected for comparison
          </span>
        </div>
      </section>

      <main
        className={`catalog-grid-layout ${
          viewMode === 'list' ? 'catalog-list-view' : ''
        }`}
      >
        {filteredItems.length === 0 ? (
          <div className="empty-catalog-card">
            <h2>No matching products</h2>
            <p>
              Try a different search term or remove some filters.
            </p>
            <button
              type="button"
              className="catalog-reset-btn"
              onClick={resetFilters}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredItems.map((product) => {
            const isFavorite = favorites.includes(product.id);
            const isCompared = compareItems.some(
              (item) => item.id === product.id
            );

            const discountPercent = product.originalPrice
              ? Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )
              : 0;

            const availableToAdd = getAvailableStock(product);

            return (
              <article
                key={product.id}
                className={`catalog-card ${
                  product.featured ? 'featured-hero-card' : ''
                } ${product.wide ? 'wide-banner-card' : ''} ${
                  product.stock === 0 ? 'out-of-stock-card' : ''
                }`}
              >
                <div className="card-image-placeholder">
               {product.image && (
                <img
                src={product.image}
                alt={product.title}
                className="product-card-img"
                loading="lazy"
                />
                )}
                  <span className="category-meta-tag">
                    {product.category}
                  </span>

                  {product.badge && (
                    <span className="product-badge-tag">
                      {product.badge}
                    </span>
                  )}

                  <span className="sku-code-tag">{product.sku}</span>

                  <button
                    type="button"
                    className={`catalog-favorite-btn ${
                      isFavorite ? 'is-favorite' : ''
                    }`}
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={
                      isFavorite
                        ? `Remove ${product.title} from saved items`
                        : `Save ${product.title}`
                    }
                    aria-pressed={isFavorite}
                  >
                    {isFavorite ? '♥' : '♡'}
                  </button>

                  {discountPercent > 0 && (
                    <span className="catalog-discount-tag">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                <div className="card-details-box">
                  <h2 className="goods-title">{product.title}</h2>

                  <p className="goods-material">
                    Material: {product.material}
                  </p>

                  <p className="goods-sizes">
                    Available dimensions: <em>{product.size}</em>
                  </p>

                  <div className="stock-level-indicator">
                    <span
                      className={`stock-dot ${
                        product.stock === 0
                          ? 'critical'
                          : product.stock <= 5
                            ? 'critical'
                            : 'healthy'
                      }`}
                    />

                    <span>
                      {product.stock === 0
                        ? 'Out of stock'
                        : product.stock <= 5
                          ? `Low stock: ${product.stock} units remaining`
                          : `In stock: ${product.stock} units`}
                    </span>
                  </div>

                  {getCartQty(product.id) > 0 && (
                    <p className="catalog-reserved-note">
                      {getCartQty(product.id)} unit(s) in your bag
                    </p>
                  )}

                  <div className="price-action-row">
                    <div className="price-display-block">
                      <span className="current-price">
                        {formatMoney(product.price)}
                      </span>

                      {product.originalPrice && (
                        <span className="slashed-price">
                          <del>{formatMoney(product.originalPrice)}</del>
                        </span>
                      )}
                    </div>

                    <div className="card-btn-group">
                      <button
                        type="button"
                        className="quick-spec-btn"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        Specs
                      </button>

                      <button
                        type="button"
                        className={`catalog-compare-btn ${
                          isCompared ? 'active-tab' : ''
                        }`}
                        onClick={() => toggleCompare(product)}
                        aria-pressed={isCompared}
                      >
                        {isCompared ? 'Comparing' : 'Compare'}
                      </button>

                      <button
                        type="button"
                        className="add-to-bag-btn"
                        disabled={availableToAdd <= 0}
                        onClick={() => addToCart(product)}
                      >
                        {product.stock === 0
                          ? 'Unavailable'
                          : availableToAdd <= 0
                            ? 'Limit reached'
                            : 'Acquire Item'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>

      {quickViewProduct && (
        <div
          className="spec-modal-overlay"
          onClick={() => setQuickViewProduct(null)}
        >
          <section
            className="spec-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spec-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="spec-modal-header">
              <h3 id="spec-modal-title">
                Technical Product Specification
              </h3>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setQuickViewProduct(null)}
                aria-label="Close product specifications"
              >
                ✕
              </button>
            </div>

            <div className="spec-modal-body">
              <span className="sku-tag-modal">
                {quickViewProduct.sku}
              </span>

              <h2>{quickViewProduct.title}</h2>
              <p className="spec-desc">
                {quickViewProduct.description}
              </p>

              <div className="spec-detail-grid">
                <div>
                  <strong>Category:</strong> {quickViewProduct.category}
                </div>
                <div>
                  <strong>Material:</strong> {quickViewProduct.material}
                </div>
                <div>
                  <strong>Available sizes:</strong> {quickViewProduct.size}
                </div>
                <div>
                  <strong>Stock:</strong> {quickViewProduct.stock} units
                </div>
                <div>
                  <strong>Unit price:</strong>{' '}
                  {formatMoney(quickViewProduct.price)}
                </div>
                <div>
                  <strong>SKU:</strong> {quickViewProduct.sku}
                </div>
                <div>
                  <strong>Featured:</strong>{' '}
                  {quickViewProduct.featured ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Availability:</strong>{' '}
                  {quickViewProduct.stock > 0
                    ? 'Available'
                    : 'Out of stock'}
                </div>
              </div>

              <div className="spec-modal-footer">
                <button
                  type="button"
                  className="add-to-bag-btn"
                  disabled={
                    getAvailableStock(quickViewProduct) <= 0
                  }
                  onClick={() => {
                    addToCart(quickViewProduct);
                  }}
                >
                  Add to Bag · {formatMoney(quickViewProduct.price)}
                </button>

                <button
                  type="button"
                  className="quick-spec-btn"
                  onClick={() => toggleFavorite(quickViewProduct.id)}
                >
                  {favorites.includes(quickViewProduct.id)
                    ? '♥ Saved'
                    : '♡ Save Item'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {isCartOpen && (
        <div
          className="cart-drawer-overlay"
          onClick={() => setIsCartOpen(false)}
        >
          <section
            className="cart-drawer-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <h2 id="cart-drawer-title">
                Shopping Bag ({totalCartUnits})
              </h2>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close shopping bag"
              >
                ✕
              </button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="empty-cart-msg">
                  <p>Your shopping bag is empty.</p>
                  <button
                    type="button"
                    className="quick-spec-btn"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const product = inventory.find(
                    (entry) => entry.id === item.id
                  );

                  return (
                    <div key={item.id} className="cart-item-row">
                      <div className="cart-item-info">
                        <strong>{item.title}</strong>
                        <span>{item.sku}</span>
                        <span>{formatMoney(item.price)} each</span>
                        <strong>
                          Line total: {formatMoney(item.price * item.qty)}
                        </strong>

                        {product && (
                          <span>
                            Available stock: {product.stock} units
                          </span>
                        )}
                      </div>

                      <div className="cart-item-controls">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.id, -1)}
                          aria-label={`Decrease ${item.title} quantity`}
                        >
                          −
                        </button>

                        <span>{item.qty}</span>

                        <button
                          type="button"
                          disabled={!product || item.qty >= product.stock}
                          onClick={() => updateCartQty(item.id, 1)}
                          aria-label={`Increase ${item.title} quantity`}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                {cartSavings > 0 && (
                  <div className="subtotal-row">
                    <span>Estimated savings</span>
                    <strong>-{formatMoney(cartSavings)}</strong>
                  </div>
                )}

                <div className="subtotal-row">
                  <span>Subtotal</span>
                  <strong>{formatMoney(cartSubtotal)}</strong>
                </div>

                <div className="subtotal-row">
                  <span>Shipping</span>
                  <strong>
                    {shippingCost === 0
                      ? 'Free'
                      : formatMoney(shippingCost)}
                  </strong>
                </div>

                <div className="subtotal-row">
                  <span>Estimated tax (7.5%)</span>
                  <strong>{formatMoney(estimatedTax)}</strong>
                </div>

                <div className="subtotal-row cart-grand-total">
                  <span>Estimated total</span>
                  <strong>{formatMoney(orderTotal)}</strong>
                </div>

                <p className="catalog-shipping-note">
                  Standard shipping is free on orders of $250 or more.
                  Tax and shipping are illustrative demo estimates.
                </p>

                <button
                  type="button"
                  className="checkout-btn"
                  onClick={startCheckout}
                >
                  Continue to Checkout
                </button>

                <button
                  type="button"
                  className="catalog-clear-cart-btn"
                  onClick={clearCart}
                >
                  Clear shopping bag
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {isCompareOpen && (
        <div
          className="spec-modal-overlay"
          onClick={() => setIsCompareOpen(false)}
        >
          <section
            className="spec-modal-card catalog-compare-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="spec-modal-header">
              <h3 id="compare-modal-title">Product Comparison</h3>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsCompareOpen(false)}
                aria-label="Close comparison"
              >
                ✕
              </button>
            </div>

            <div className="spec-modal-body">
              {compareItems.length === 0 ? (
                <p>
                  No products selected. Add up to three products using
                  the Compare button on a product card.
                </p>
              ) : (
                <div className="catalog-compare-table-wrap">
                  <table className="catalog-compare-table">
                    <thead>
                      <tr>
                        <th scope="col">Specification</th>
                        {compareItems.map((product) => (
                          <th scope="col" key={product.id}>
                            {product.title}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <th scope="row">SKU</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>{product.sku}</td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Price</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>
                            {formatMoney(product.price)}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Category</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>{product.category}</td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Material</th>
                        {compareItems.map((product) => (
                       <td key={product.id}>{product.category}</td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Material</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>{product.material}</td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Sizes</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>{product.size}</td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Stock</th>
                        {compareItems.map((product) => {
                          const current = inventory.find(
                            (item) => item.id === product.id
                          );

                          return (
                            <td key={product.id}>
                              {current?.stock ?? 0} units
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <th scope="row">Description</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>
                            {product.description}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <th scope="row">Actions</th>
                        {compareItems.map((product) => (
                          <td key={product.id}>
                            <button
                              type="button"
                              className="quick-spec-btn"
                              onClick={() => {
                                setIsCompareOpen(false);
                                setQuickViewProduct(product);
                              }}
                            >
                              View specs
                            </button>

                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => toggleCompare(product)}
                            >
                              Remove
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {checkoutOpen && (
        <div
          className="spec-modal-overlay"
          onClick={() => setCheckoutOpen(false)}
        >
          <section
            className="spec-modal-card catalog-checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="spec-modal-header">
              <h3 id="checkout-modal-title">Demo Checkout</h3>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setCheckoutOpen(false)}
                aria-label="Close checkout"
              >
                ✕
              </button>
            </div>

            <form
              className="spec-modal-body catalog-checkout-form"
              onSubmit={submitDemoOrder}
            >
              <p>
                This is a portfolio checkout simulation. It does not
                collect payment information or create a real transaction.
              </p>

              <label className="catalog-form-field">
                Full name
                <input
                  type="text"
                  autoComplete="name"
                  value={checkoutDetails.customerName}
                  onChange={(event) =>
                    setCheckoutDetails((previous) => ({
                      ...previous,
                      customerName: event.target.value
                    }))
                  }
                  required
                />
              </label>

              <label className="catalog-form-field">
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  value={checkoutDetails.email}
                  onChange={(event) =>
                    setCheckoutDetails((previous) => ({
                      ...previous,
                      email: event.target.value
                    }))
                  }
                  required
                />
              </label>

              <label className="catalog-form-field">
                Shipping method
                <select
                  value={checkoutDetails.shippingMethod}
                  onChange={(event) =>
                    setCheckoutDetails((previous) => ({
                      ...previous,
                      shippingMethod: event.target.value
                    }))
                  }
                >
                  <option value="standard">
                    Standard shipping
                  </option>
                  <option value="express">
                    Express shipping
                  </option>
                </select>
              </label>

              <div className="catalog-checkout-summary">
                <div className="subtotal-row">
                  <span>Items ({totalCartUnits} units)</span>
                  <strong>{formatMoney(cartSubtotal)}</strong>
                </div>

                <div className="subtotal-row">
                  <span>Shipping</span>
                  <strong>
                    {shippingCost === 0
                      ? 'Free'
                      : formatMoney(shippingCost)}
                  </strong>
                </div>

                <div className="subtotal-row">
                  <span>Estimated tax</span>
                  <strong>{formatMoney(estimatedTax)}</strong>
                </div>

                <div className="subtotal-row cart-grand-total">
                  <span>Demo order total</span>
                  <strong>{formatMoney(orderTotal)}</strong>
                </div>
              </div>

              {checkoutError && (
                <p className="catalog-filter-error" role="alert">
                  {checkoutError}
                </p>
              )}

              <button type="submit" className="checkout-btn">
                Create Demo Order
              </button>
            </form>
          </section>
        </div>
      )}

      {checkoutOrder && (
        <div
          className="spec-modal-overlay"
          onClick={() => setCheckoutOrder(null)}
        >
          <section
            className="spec-modal-card catalog-order-success"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-success-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="spec-modal-header">
              <h3 id="order-success-title">Demo Order Created</h3>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setCheckoutOrder(null)}
                aria-label="Close order confirmation"
              >
                ✕
              </button>
            </div>

            <div className="spec-modal-body">
              <p>
                The portfolio checkout simulation completed successfully.
              </p>

              <div className="spec-detail-grid">
                <div>
                  <strong>Reference:</strong> {checkoutOrder.reference}
                </div>
                <div>
                  <strong>Status:</strong> {checkoutOrder.status}
                </div>
                <div>
                  <strong>Customer:</strong> {checkoutOrder.customerName}
                </div>
                <div>
                  <strong>Email:</strong> {checkoutOrder.email}
                </div>
                <div>
                  <strong>Units:</strong>{' '}
                  {checkoutOrder.items.reduce(
                    (total, item) => total + item.qty,
                    0
                  )}
                </div>
                <div>
                  <strong>Total:</strong>{' '}
                  {formatMoney(checkoutOrder.total)}
                </div>
                <div>
                  <strong>Created:</strong>{' '}
                  {new Date(checkoutOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <p className="catalog-shipping-note">
                This order exists only in the current frontend session.
                No payment was processed and no order was sent to a server.
              </p>

              <button
                type="button"
                className="checkout-btn"
                onClick={() => setCheckoutOrder(null)}
              >
                Return to Catalog
              </button>
            </div>
          </section>
        </div>
      )}

      {toastMessage && (
        <div
          className="custom-notification-toast"
          role="status"
          aria-live="polite"
        >
          <span>{toastMessage}</span>

          <button
            type="button"
            onClick={() => {
              setToastMessage('');

              if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
                toastTimerRef.current = null;
              }
            }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

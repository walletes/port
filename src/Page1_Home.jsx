import React, { useState, useEffect } from 'react';
import './Page1_Home.css';

export default function Page1_Home({ setPage }) {
  // --- Typewriter Effect for Subtitle ---
  const [typedText, setTypedText] = useState('');
  const fullSubtitle = "FULL-STACK DEVELOPER • SYSTEMS & UI ENGINEER";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText(fullSubtitle.slice(0, index + 1));
      index++;
      if (index === fullSubtitle.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // --- Filtering & Search State ---
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Explicit mapping of your 11 applications
  const applications = [
    {
      page: 'login',
      title: '👉 Global Entry Portal',
      skills: 'Proves: Form validation, error handling, session management.',
      className: 'double-width',
      category: 'Security & Ops',
    },
    {
      page: 'support',
      title: '👉 Support Helpdesk',
      skills: 'Proves: Complex data lists, ticket priority filtering.',
      category: 'Security & Ops',
    },
    {
      page: 'bank',
      title: '👉 Bank Ledger',
      skills: 'Proves: Financial tables, currency math.',
      category: 'Fintech & Billing',
    },
    {
      page: 'project',
      title: '👉 Team Task Board',
      skills: 'Proves: Drag-and-drop mechanics, workflow sorting.',
      className: 'double-width',
      category: 'Data & Systems',
    },
    {
      page: 'warehouse',
      title: '👉 Warehouse Manifest',
      skills: 'Proves: Inventory counters, list filters.',
      category: 'Security & Ops',
    },
    {
      page: 'invoice',
      title: '👉 Invoice Generator',
      skills: 'Proves: Dynamic row expansion, math formula processing.',
      category: 'Fintech & Billing',
    },
    {
      page: 'terminal',
      title: '👉 Live Server Log Monitor',
      skills: 'Proves: Stream rendering, auto-scrolling log arrays.',
      className: 'double-width',
      category: 'Data & Systems',
    },
    {
      page: 'product',
      title: '👉 Product Grid Catalog',
      skills: 'Proves: Multi-select arrays, filter queries.',
      category: 'Data & Systems',
    },
    {
      page: 'staff',
      title: '👉 Company Directory',
      skills: 'Proves: Search indices, profile modals.',
      category: 'Security & Ops',
    },
    {
      page: 'pricing',
      title: '👉 Subscription Matrix',
      skills: 'Proves: High-performance tabular layouts, feature states.',
      className: 'double-width',
      category: 'Fintech & Billing',
    },
    {
      page: 'checkout',
      title: '👉 Premium Stripe Gateway Terminal',
      skills: 'Proves: Async pipeline delays, card masking regex arrays, custom state loading UI.',
      className: 'full-span-highlight',
      accent: true,
      category: 'Fintech & Billing',
    },
  ];

  const handleCardKeyDown = (event, page) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setPage(page);
    }
  };

  // Filter based on selected category tag and search term
  const filteredApps = applications.filter((app) => {
    const matchesCategory = activeCategory === 'ALL' || app.category === activeCategory;
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.skills.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="home-wrapper">
      <header className="hero-card">
        <h1 className="home-title">Prince Osinachi</h1>
        <p className="home-subtitle">
          {typedText}
          <span className="typewriter-cursor">|</span>
        </p>

        <div className="home-intro-box">
          <p className="home-paragraph">
            A developer who focuses on building clean, fast, and functional software layout systems. Instead of just showing a static resume, I built this portfolio as a live ecosystem containing{' '}
            <em>11 distinct, real-world business applications</em> that I designed from scratch.
          </p>

          <p className="home-paragraph">
            Every single page on this site represents a practical tool used in modern corporate operations—ranging from secure login gates and banking ledgers to live logistics dashboards and ticketing queues. Each application operates independently with its own dedicated layout logic, state management, and custom styling.
          </p>

          <p className="home-paragraph">
            Use the directory navigation below to jump into any system and review the live code implementation.{' '}
            <span className="crossed-out">
              No generic templates or fillers allowed
            </span>
            —just raw production utility.
          </p>
        </div>
      </header>

      {/* Directory Filter & Search Control Bar */}
      <div className="directory-controls">
        <div className="directory-header-group">
          <h2 className="directory-header">System Directory Index</h2>
          <span className="app-count-badge">{filteredApps.length} / 11 Loaded</span>
        </div>

        <div className="filter-and-search-row">
          <div className="category-tabs">
            {['ALL', 'Fintech & Billing', 'Security & Ops', 'Data & Systems'].map((cat) => (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search systems or technical skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="bento-grid">
        {filteredApps.map((application) => (
          <div
            key={application.page}
            className={`bento-card ${application.className || ''}`.trim()}
            role="button"
            tabIndex={0}
            onClick={() => setPage(application.page)}
            onKeyDown={(event) => handleCardKeyDown(event, application.page)}
          >
            <div className="card-header-row">
              <span
                className={`item-link ${application.accent ? 'accent-purple-text' : ''}`.trim()}
              >
                {application.title}
              </span>
              <span className="category-tag">{application.category}</span>
            </div>

            <span className="item-skills">
              {application.skills}
            </span>
          </div>
        ))}
      </main>
    </div>
  );
}

import React from 'react';
import './Page1_Home.css';

export default function Page1_Home({ setPage }) {
  return (
    <div className="home-wrapper">
      {/* Dynamic Typography: Big Bold Title */}
      <h1 className="home-title">Prince Osinachi</h1>

      {/* Small Clean Status Subtitle */}
      <p className="home-subtitle">FULL-STACK DEVELOPER</p>

      {/* Human Introduction with Mixed Typographic Styles */}
      <div className="home-intro-box">
        <p className="home-paragraph">
          I am a self-taught developer who focuses on building clean, fast, and functional software layout systems. Instead of just showing a static resume, I built this portfolio as a live ecosystem containing <em>10 distinct, real-world business applications</em> that I designed from scratch.
        </p>

        <p className="home-paragraph">
          Every single page on this site represents a practical tool used in modern corporate operations—ranging from secure login gates and banking ledgers to live logistics dashboards and ticketing queues. Each application operates independently with its own dedicated layout logic, state management, and custom styling.
        </p>

        <p className="home-paragraph">
          Use the directory navigation below to jump into any system and review the live code implementation. <span className="crossed-out">No generic templates or fillers allowed</span>—just raw production utility.
        </p>
      </div>

      {/* Directory System Index */}
      <h2 className="directory-header">System Directory Index</h2>

      <div className="directory-list">
        <div className="directory-item" onClick={() => setPage('login')}>
          <span className="item-link">👉 Go to Global Entry Portal</span>
          <span className="item-skills">
            Proves: Form validation, error handling, session management.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('support')}>
          <span className="item-link">👉 Go to Customer Support Helpdesk</span>
          <span className="item-skills">
            Proves: Complex data lists, ticket priority filtering, live state updates.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('bank')}>
          <span className="item-link">👉 Go to Personal Bank Ledger</span>
          <span className="item-skills">
            Proves: Clear data tables, currency math, ledger components.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('project')}>
          <span className="item-link">👉 Go to Team Task Board</span>
          <span className="item-skills">
            Proves: Drag-and-drop mechanics, column workflow sorting.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('warehouse')}>
          <span className="item-link">👉 Go to Active Warehouse Manifest</span>
          <span className="item-skills">
            Proves: Inventory counters, state arithmetic, quick list filters.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('invoice')}>
          <span className="item-link">👉 Go to Digital Invoice Generator</span>
          <span className="item-skills">
            Proves: Dynamic row expansion, math formula processing, print layouts.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('terminal')}>
          <span className="item-link">👉 Go to Live Server Log Monitor</span>
          <span className="item-skills">
            Proves: Stream rendering, continuous auto-scrolling log arrays.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('product')}>
          <span className="item-link">👉 Go to Retail Product Catalog</span>
          <span className="item-skills">
            Proves: Grid structures, dynamic multi-select arrays, filter queries.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('staff')}>
          <span className="item-link">👉 Go to Company Directory</span>
          <span className="item-skills">
            Proves: Multi-level hierarchy layouts, search indices, profile modals.
          </span>
        </div>

        <div className="directory-item" onClick={() => setPage('pricing')}>
          <span className="item-link">👉 Go to Cloud Subscription Matrix</span>
          <span className="item-skills">
            Proves: High-performance tabular layouts, conditional feature checklist states.
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import './Page1_Home.css';

export default function Page1_Home({ setPage }) {
  const applications = [
    {
      page: 'login',
      title: '👉 Global Entry Portal',
      skills: 'Proves: Form validation, error handling, session management.',
      className: 'double-width',
    },
    {
      page: 'support',
      title: '👉 Support Helpdesk',
      skills: 'Proves: Complex data lists, ticket priority filtering.',
    },
    {
      page: 'bank',
      title: '👉 Bank Ledger',
      skills: 'Proves: Financial tables, currency math.',
    },
    {
      page: 'project',
      title: '👉 Team Task Board',
      skills: 'Proves: Drag-and-drop mechanics, workflow sorting.',
      className: 'double-width',
    },
    {
      page: 'warehouse',
      title: '👉 Warehouse Manifest',
      skills: 'Proves: Inventory counters, list filters.',
    },
    {
      page: 'invoice',
      title: '👉 Invoice Generator',
      skills: 'Proves: Dynamic row expansion, math formula processing.',
    },
    {
      page: 'terminal',
      title: '👉 Live Server Log Monitor',
      skills: 'Proves: Stream rendering, auto-scrolling log arrays.',
      className: 'double-width',
    },
    {
      page: 'product',
      title: '👉 Product Grid Catalog',
      skills: 'Proves: Multi-select arrays, filter queries.',
    },
    {
      page: 'staff',
      title: '👉 Company Directory',
      skills: 'Proves: Search indices, profile modals.',
    },
    {
      page: 'pricing',
      title: '👉 Subscription Matrix',
      skills: 'Proves: High-performance tabular layouts, feature states.',
      className: 'double-width',
    },
    {
      page: 'checkout',
      title: '👉 Premium Stripe Gateway Terminal',
      skills: 'Proves: Async pipeline delays, card masking regex arrays, custom state loading UI.',
      className: 'full-span-highlight',
      accent: true,
    },
  ];

  const handleCardKeyDown = (event, page) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setPage(page);
    }
  };

  return (
    <div className="home-wrapper">
      <header className="hero-card">
        <h1 className="home-title">Prince Osinachi</h1>
        <p className="home-subtitle">FULL-STACK DEVELOPER</p>

        <div className="home-intro-box">
          <p className="home-paragraph">
            I am a self-taught developer who focuses on building clean, fast, and functional software layout systems. Instead of just showing a static resume, I built this portfolio as a live ecosystem containing{' '}
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

      <h2 className="directory-header">System Directory Index</h2>

      <main className="bento-grid">
        {applications.map((application) => (
          <div
            key={application.page}
            className={`bento-card ${application.className || ''}`.trim()}
            role="button"
            tabIndex={0}
            onClick={() => setPage(application.page)}
            onKeyDown={(event) => handleCardKeyDown(event, application.page)}
          >
            <span
              className={`item-link ${application.accent ? 'accent-purple-text' : ''}`.trim()}
            >
              {application.title}
            </span>

            <span className="item-skills">
              {application.skills}
            </span>
          </div>
        ))}
      </main>
    </div>
  );
}

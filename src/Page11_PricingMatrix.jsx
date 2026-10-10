import React, { useState } from 'react';
import './Page11_PricingMatrix.css';

export default function Page11_PricingMatrix({ setPage }) {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');

  const tiers = [
    {
      name: "Starter Sandbox",
      monthlyPrice: 0,
      yearlyPrice: 0,
      limits: "Up to 3 operational endpoints",
      features: ["Standard log streaming access", "Basic SSL endpoint verification", "Community support channels"],
      excluded: ["Advanced matrix metrics tracking", "Custom domain binding allocation"]
    },
    {
      name: "Enterprise Pipeline",
      monthlyPrice: 49,
      yearlyPrice: 39,
      limits: "Unlimited node cluster targets",
      features: ["Standard log streaming access", "Basic SSL endpoint verification", "Community support channels", "Advanced matrix metrics tracking", "Custom domain binding allocation"],
      excluded: []
    }
  ];

  return (
    <div className="pricing-wrapper">
      <header className="pricing-header-bar">
        <button className="pricing-exit-btn" onClick={() => setPage('home')}>← Corporate Portal</button>
        <span className="pricing-system-tag">SUBSCRIPTION ENGINE MODULE</span>
      </header>

      <section className="pricing-control-center">
        <h1 className="pricing-main-title">Flexible Platform Billing Plans</h1>
        <p className="pricing-intro-note">Select the infrastructure tier required for your scale operations.</p>

        {/* State Toggle Selector Box */}
        <div className="toggle-container-block">
          <button
            className={`toggle-option ${billingCycle === 'MONTHLY' ? 'selected' : ''}`}
            onClick={() => setBillingCycle('MONTHLY')}
          >
            Monthly Terms
          </button>
          <button
            className={`toggle-option ${billingCycle === 'YEARLY' ? 'selected' : ''}`}
            onClick={() => setBillingCycle('YEARLY')}
          >
            Annual Allocation <em>(Save 20%)</em>
          </button>
        </div>
      </section>

      {/* The browser natively maps grid matrices across display viewpoints */}
      <main className="pricing-matrix-layout">
        {tiers.map((tier, idx) => {
          const currentPrice = billingCycle === 'MONTHLY' ? tier.monthlyPrice : tier.yearlyPrice;
          const isPremium = tier.monthlyPrice > 0;

          return (
            <div key={idx} className={`pricing-plan-card ${isPremium ? 'premium-focus' : ''}`}>

              <h2 className="plan-name-heading">{tier.name}</h2>
              <p className="plan-volume-limits"><em>{tier.limits}</em></p>
            </div>

            <div className="plan-cost-display">
              <span className="currency-symbol">\$</span>
              <span className="price-num-label">{currentPrice}</span>
              <span className="time-scale-label">/ month</span>
            </div>

            <div className="plan-feature-list">
              <h3 className="checklist-header">Included Subsystems:</h3>
              <ul className="feature-checklist">
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} className="feature-item positive-check">
                    <span className="check-bullet">✓</span> {feat}
                  </li>
                ))}
                {tier.excluded.map((excl, eIdx) => (
                  <li key={eIdx} className="feature-item negative-check">
                    <span className="check-bullet">✕</span> <del>{excl}</del>
                  </li>
                ))}
              </ul>
            </div>

            <button className="plan-action-trigger-btn">
              {isPremium ? 'Provision Cluster License' : 'Initialize Developer Tier'}
            </button>
          </div>
          );
        })}
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import './Page11_PricingMatrix.css';

export default function Page11_PricingMatrix({ setPage }) {
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' or 'YEARLY'
  const [currency, setCurrency] = useState('USD'); // 'USD', 'EUR', 'GBP'
  const [allocatedNodes, setAllocatedNodes] = useState(25);
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Currency multiplier map
  const currencyMap = {
    USD: { symbol: "$", rate: 1.0 },
    EUR: { symbol: "€", rate: 0.92 },
    GBP: { symbol: "£", rate: 0.78 }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tiers = [
    {
      id: "plan-sandbox",
      name: "Developer Sandbox",
      badge: "COMMUNITY",
      monthlyPrice: 0,
      yearlyPrice: 0,
      limits: "Up to 3 operational endpoints",
      nodeLimit: 5,
      features: [
        "Standard log streaming access",
        "Basic SSL endpoint verification",
        "Community support channels",
        "1GB Shared telemetry buffer"
      ],
      excluded: [
        "Advanced matrix metrics tracking",
        "Custom domain binding allocation",
        "24/7 Dedicated SLA support",
        "Zero-Knowledge audit logs"
      ],
      specs: {
        sla: "99.0% Uptime",
        retention: "7 Days Log History",
        rateLimit: "1,000 req/min"
      }
    },
    {
      id: "plan-pro",
      name: "Professional Growth",
      badge: "POPULAR",
      monthlyPrice: 29,
      yearlyPrice: 22,
      limits: "Up to 25 operational endpoints",
      nodeLimit: 25,
      features: [
        "Standard log streaming access",
        "Basic SSL endpoint verification",
        "Advanced matrix metrics tracking",
        "Custom domain binding allocation",
        "10GB Isolated telemetry buffer"
      ],
      excluded: [
        "24/7 Dedicated SLA support",
        "Zero-Knowledge audit logs"
      ],
      specs: {
        sla: "99.9% Uptime SLA",
        retention: "30 Days Log History",
        rateLimit: "10,000 req/min"
      }
    },
    {
      id: "plan-enterprise",
      name: "Enterprise Pipeline",
      badge: "RECOMMENDED",
      monthlyPrice: 89,
      yearlyPrice: 69,
      limits: "Unlimited node cluster targets",
      nodeLimit: 100,
      features: [
        "Standard log streaming access",
        "Basic SSL endpoint verification",
        "Community & priority support",
        "Advanced matrix metrics tracking",
        "Custom domain binding allocation",
        "24/7 Dedicated SLA support",
        "100GB High-speed telemetry buffer"
      ],
      excluded: [
        "Zero-Knowledge audit logs"
      ],
      specs: {
        sla: "99.99% Uptime SLA",
        retention: "90 Days Log History",
        rateLimit: "100,000 req/min"
      }
    },
    {
      id: "plan-sovereign",
      name: "Sovereign Grid",
      badge: "CUSTOM HARDWARE",
      monthlyPrice: 249,
      yearlyPrice: 199,
      limits: "Dedicated physical cluster nodes",
      nodeLimit: 500,
      features: [
        "Standard log streaming access",
        "Basic SSL endpoint verification",
        "24/7 Dedicated SLA support",
        "Advanced matrix metrics tracking",
        "Custom domain binding allocation",
        "Zero-Knowledge audit logs",
        "Uncapped telemetry data vault",
        "Custom C / Rust native hooks"
      ],
      excluded: [],
      specs: {
        sla: "99.999% Fault-Tolerant SLA",
        retention: "365 Days Log History",
        rateLimit: "Unlimited Throughput"
      }
    }
  ];

  const handleProvision = (plan) => {
    setSelectedPlanModal(null);
    triggerToast(`Provisioned ${plan.name} license on ${billingCycle.toLowerCase()} terms.`);
  };

  return (
    <div className="pricing-wrapper">
      <header className="pricing-header-bar">
        <button
          className="pricing-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Corporate Portal
        </button>
      </header>

      <section className="pricing-control-center">
        <h1 className="pricing-main-title">
          Flexible Platform Billing Plans
        </h1>

        <p className="pricing-intro-note">
          Select the infrastructure tier required for your scale operations or configure dynamic cluster allocations.
        </p>

        {/* Global Controls Row: Billing Terms & Currency Switcher */}
        <div className="pricing-global-controls">
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

          <div className="currency-selector-group">
            {['USD', 'EUR', 'GBP'].map(curr => (
              <button
                key={curr}
                className={`currency-btn ${currency === curr ? 'active' : ''}`}
                onClick={() => setCurrency(curr)}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Dynamic Node Estimator Slider */}
        <div className="node-estimator-box">
          <div className="estimator-header">
            <span>Estimatation: <strong>{allocatedNodes} Active Nodes</strong></span>
            <span className="estimator-hint">Recommended Tier: {
              allocatedNodes <= 5 ? "Developer Sandbox" :
              allocatedNodes <= 25 ? "Professional Growth" :
              allocatedNodes <= 100 ? "Enterprise Pipeline" : "Sovereign Grid"
            }</span>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            value={allocatedNodes}
            onChange={(e) => setAllocatedNodes(parseInt(e.target.value))}
            className="node-slider-input"
          />
        </div>
      </section>

      {/* Pricing Matrix Tier Cards */}
      <main className="pricing-matrix-layout">
        {tiers.map((tier) => {
          const rawPrice = billingCycle === 'MONTHLY' ? tier.monthlyPrice : tier.yearlyPrice;
          const convertedPrice = Math.round(rawPrice * currencyMap[currency].rate);
          const isPremium = tier.monthlyPrice > 0;
          const isRecommended = allocatedNodes <= tier.nodeLimit && (
            tier.id === "plan-sandbox" ? allocatedNodes <= 5 :
            tier.id === "plan-pro" ? allocatedNodes > 5 && allocatedNodes <= 25 :
            tier.id === "plan-enterprise" ? allocatedNodes > 25 && allocatedNodes <= 100 : allocatedNodes > 100
          );

          return (
            <div
              key={tier.id}
              className={`pricing-plan-card ${isPremium ? 'premium-focus' : ''} ${isRecommended ? 'recommended-highlight' : ''}`}
            >
              <div className="plan-heading-section">
                <div className="plan-badge-row">
                  <span className="plan-badge-tag">{tier.badge}</span>
                  {isRecommended && <span className="recommended-tag">MATCH</span>}
                </div>

                <h2 className="plan-name-heading">
                  {tier.name}
                </h2>

                <p className="plan-volume-limits">
                  <em>{tier.limits}</em>
                </p>
              </div>

              <div className="plan-cost-display">
                <span className="currency-symbol">{currencyMap[currency].symbol}</span>

                <span className="price-num-label">
                  {convertedPrice}
                </span>

                <span className="time-scale-label">
                  / month
                </span>
              </div>

              <div className="plan-feature-list">
                <h3 className="checklist-header">
                  Included Subsystems:
                </h3>

                <ul className="feature-checklist">
                  {tier.features.map((feat, fIdx) => (
                    <li
                      key={fIdx}
                      className="feature-item positive-check"
                    >
                      <span className="check-bullet">✓</span>
                      {feat}
                    </li>
                  ))}

                  {tier.excluded.map((excl, eIdx) => (
                    <li
                      key={eIdx}
                      className="feature-item negative-check"
                    >
                      <span className="check-bullet">✕</span>
                      <del>{excl}</del>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-footer-actions">
                <button
                  className="spec-inspect-btn"
                  onClick={() => setSelectedPlanModal(tier)}
                >
                  Inspect Specs
                </button>

                <button
                  className="plan-action-trigger-btn"
                  onClick={() => handleProvision(tier)}
                >
                  {isPremium
                    ? 'Proceed'
                    : 'Developer Tier'}
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* SLA Inspection Modal Drawer */}
      {selectedPlanModal && (
        <div className="pricing-modal-overlay" onClick={() => setSelectedPlanModal(null)}>
          <div className="pricing-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h2>{selectedPlanModal.name} SLA </h2>
              <button className="close-modal-btn" onClick={() => setSelectedPlanModal(null)}>✕</button>
            </div>

            <div className="modal-body-specs">
              <p><strong>Target Endpoint Limits:</strong> {selectedPlanModal.limits}</p>
              <p><strong>Guaranteed Service Uptime:</strong> {selectedPlanModal.specs.sla}</p>
              <p><strong>Log Retention Period:</strong> {selectedPlanModal.specs.retention}</p>
              <p><strong>API Rate Capacity:</strong> {selectedPlanModal.specs.rateLimit}</p>

              <div className="modal-checklist-block">
                <h4>Full System Feature Capability:</h4>
                <ul>
                  {selectedPlanModal.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              className="plan-action-trigger-btn modal-submit-btn"
              onClick={() => handleProvision(selectedPlanModal)}
            >
              Confirm & Proceed ({currencyMap[currency].symbol}{Math.round((billingCycle === 'MONTHLY' ? selectedPlanModal.monthlyPrice : selectedPlanModal.yearlyPrice) * currencyMap[currency].rate)} / mo)
            </button>
          </div>
        </div>
      )}

      {/* Custom In-App Notification Toast */}
      {toastMessage && (
        <div className="custom-notification-toast">
          <span>● {toastMessage}</span>
        </div>
      )}
    </div>
  );
}

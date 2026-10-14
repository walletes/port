
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Page11_PricingMatrix.css';

const CURRENCY_MAP = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 }
};

const STORAGE_KEY = 'platform-pricing-preferences-v2';
const SUBSCRIPTIONS_KEY = 'platform-pricing-subscriptions-v2';
const COUPONS = {
  GRID20: { discount: 20, label: '20% launch discount' },
  LAUNCH10: { discount: 10, label: '10% launch discount' },
  DEV15: { discount: 15, label: '15% developer discount' }
};

const TIERS = [
  {
    id: 'plan-sandbox',
    name: 'Developer Sandbox',
    badge: 'COMMUNITY',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: 'Up to 3 operational endpoints',
    nodeLimit: 5,
    description: 'For prototypes, individual developers and early experiments.',
    features: [
      'Standard log streaming access',
      'Basic SSL endpoint verification',
      'Community support channels',
      '1GB shared telemetry buffer'
    ],
    excluded: [
      'Advanced matrix metrics tracking',
      'Custom domain binding allocation',
      '24/7 dedicated SLA support',
      'Zero-Knowledge audit logs'
    ],
    specs: {
      sla: '99.0% uptime target',
      retention: '7 days',
      rateLimit: '1,000 req/min',
      support: 'Community',
      storage: '1GB',
      endpoints: 3,
      auditLogs: false,
      customDomains: false
    }
  },
  {
    id: 'plan-pro',
    name: 'Professional Growth',
    badge: 'POPULAR',
    monthlyPrice: 29,
    yearlyPrice: 22,
    nodeLimit: 25,
    limits: 'Up to 25 operational endpoints',
    description: 'For growing products that need reliable monitoring and flexible integrations.',
    features: [
      'Standard log streaming access',
      'Basic SSL endpoint verification',
      'Advanced matrix metrics tracking',
      'Custom domain binding allocation',
      '10GB isolated telemetry buffer'
    ],
    excluded: [
      '24/7 dedicated SLA support',
      'Zero-Knowledge audit logs'
    ],
    specs: {
      sla: '99.9% uptime target',
      retention: '30 days',
      rateLimit: '10,000 req/min',
      support: 'Priority business hours',
      storage: '10GB',
      endpoints: 25,
      auditLogs: false,
      customDomains: true
    }
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Pipeline',
    badge: 'RECOMMENDED',
    monthlyPrice: 89,
    yearlyPrice: 69,
    nodeLimit: 100,
    limits: 'Up to 100 operational endpoints',
    description: 'For production infrastructure requiring priority assistance and higher capacity.',
    features: [
      'Standard log streaming access',
      'Basic SSL endpoint verification',
      'Community and priority support',
      'Advanced matrix metrics tracking',
      'Custom domain binding allocation',
      '24/7 dedicated SLA support',
      '100GB high-speed telemetry buffer'
    ],
    excluded: ['Zero-Knowledge audit logs'],
    specs: {
      sla: '99.99% uptime target',
      retention: '90 days',
      rateLimit: '100,000 req/min',
      support: '24/7 dedicated support',
      storage: '100GB',
      endpoints: 100,
      auditLogs: false,
      customDomains: true
    }
  },
  {
    id: 'plan-sovereign',
    name: 'Sovereign Grid',
    badge: 'CUSTOM HARDWARE',
    monthlyPrice: 249,
    yearlyPrice: 199,
    nodeLimit: 500,
    limits: 'Dedicated physical cluster nodes',
    description: 'For mission-critical workloads needing dedicated capacity and advanced controls.',
    features: [
      'Standard log streaming access',
      'Basic SSL endpoint verification',
      '24/7 dedicated SLA support',
      'Advanced matrix metrics tracking',
      'Custom domain binding allocation',
      'Zero-Knowledge audit logs',
      'Uncapped telemetry data vault',
      'Custom C / Rust native hooks'
    ],
    excluded: [],
    specs: {
      sla: '99.999% stated target',
      retention: '365 days',
      rateLimit: 'Unlimited throughput',
      support: 'Dedicated account support',
      storage: 'Uncapped',
      endpoints: 500,
      auditLogs: true,
      customDomains: true
    }
  }
];

const DEFAULT_PREFERENCES = {
  billingCycle: 'MONTHLY',
  currency: 'USD',
  allocatedNodes: 25,
  compareMode: false,
  couponCode: ''
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function formatMoney(amount, currency = 'USD', maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(amount);
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escapeCsv = (value) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Page11_Pricing({ setPage }) {
  const savedPreferences = useMemo(
    () => readStorage(STORAGE_KEY, DEFAULT_PREFERENCES),
    []
  );

  const [billingCycle, setBillingCycle] = useState(
    savedPreferences.billingCycle || 'MONTHLY'
  );
  const [currency, setCurrency] = useState(
    savedPreferences.currency || 'USD'
  );
  const [allocatedNodes, setAllocatedNodes] = useState(
    Number(savedPreferences.allocatedNodes) || 25
  );
  const [compareMode, setCompareMode] = useState(
    Boolean(savedPreferences.compareMode)
  );

  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [quotePlan, setQuotePlan] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [couponInput, setCouponInput] = useState(
    savedPreferences.couponCode || ''
  );
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const [subscriptions, setSubscriptions] = useState(
    () => readStorage(SUBSCRIPTIONS_KEY, [])
  );

  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutCompany, setCheckoutCompany] = useState('');
  const [checkoutSeats, setCheckoutSeats] = useState(1);
  const [checkoutAccepted, setCheckoutAccepted] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [billingCountry, setBillingCountry] = useState('US');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const [quoteEmail, setQuoteEmail] = useState('');
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const [showUsageEstimator, setShowUsageEstimator] = useState(true);
  const [estimatedRequests, setEstimatedRequests] = useState(250000);
  const [estimatedStorage, setEstimatedStorage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  const [toastId, setToastId] = useState(0);

  const triggerToast = useCallback((message) => {
    setToastMessage(message);
    setToastId((id) => id + 1);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;

    const timeout = setTimeout(() => {
      setToastMessage(null);
    }, 3200);

    return () => clearTimeout(timeout);
  }, [toastMessage, toastId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          billingCycle,
          currency,
          allocatedNodes,
          compareMode,
          couponCode: couponInput
        })
      );
    } catch {
      // Preferences remain available for the current session.
    }
  }, [
    billingCycle,
    currency,
    allocatedNodes,
    compareMode,
    couponInput
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SUBSCRIPTIONS_KEY,
        JSON.stringify(subscriptions)
      );
    } catch {
      triggerToast('Subscription history could not be saved locally.');
    }
  }, [subscriptions, triggerToast]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedPlanModal(null);
        setCheckoutPlan(null);
        setQuotePlan(null);
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'e'
      ) {
        event.preventDefault();
        exportPricingMatrix();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const currencyConfig = CURRENCY_MAP[currency] || CURRENCY_MAP.USD;

  const getBaseMonthlyPrice = useCallback(
    (tier) => billingCycle === 'MONTHLY'
      ? tier.monthlyPrice
      : tier.yearlyPrice,
    [billingCycle]
  );

  const getDiscount = useCallback(
    () => appliedCoupon?.discount || 0,
    [appliedCoupon]
  );

  const getMonthlyPrice = useCallback(
    (tier) => {
      const base = getBaseMonthlyPrice(tier);
      return base * (1 - getDiscount() / 100) * currencyConfig.rate;
    },
    [getBaseMonthlyPrice, getDiscount, currencyConfig]
  );

  const getAnnualTotal = useCallback(
    (tier) => getMonthlyPrice(tier) * 12,
    [getMonthlyPrice]
  );

  const recommendedTier = useMemo(() => {
    return TIERS.find((tier) => allocatedNodes <= tier.nodeLimit) ||
      TIERS[TIERS.length - 1];
  }, [allocatedNodes]);

  const filteredTiers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let results = TIERS.filter((tier) => {
      if (!query) return true;

      return [
        tier.name,
        tier.badge,
        tier.description,
        ...tier.features,
        ...tier.excluded
      ].some((value) => value.toLowerCase().includes(query));
    });

    if (sortBy === 'price-low') {
      results = [...results].sort(
        (a, b) => getBaseMonthlyPrice(a) - getBaseMonthlyPrice(b)
      );
    } else if (sortBy === 'price-high') {
      results = [...results].sort(
        (a, b) => getBaseMonthlyPrice(b) - getBaseMonthlyPrice(a)
      );
    } else if (sortBy === 'capacity') {
      results = [...results].sort(
        (a, b) => a.nodeLimit - b.nodeLimit
      );
    } else {
      results = [...results].sort((a, b) => {
        if (a.id === recommendedTier.id) return -1;
        if (b.id === recommendedTier.id) return 1;
        return a.monthlyPrice - b.monthlyPrice;
      });
    }

    return results;
  }, [searchQuery, sortBy, getBaseMonthlyPrice, recommendedTier]);

  const projectedAnnualSavings = useMemo(() => {
    const monthly = TIERS.map((tier) => tier.monthlyPrice);
    const annual = TIERS.map((tier) => tier.yearlyPrice);

    return Math.max(...monthly.map((price, index) => {
      return (price - annual[index]) * 12;
    }));
  }, []);

  const estimateCapacity = useMemo(() => {
    const tier = recommendedTier;
    const requestCapacity = {
      'plan-sandbox': 100000,
      'plan-pro': 1000000,
      'plan-enterprise': 10000000,
      'plan-sovereign': Infinity
    }[tier.id];

    const storageCapacity = {
      'plan-sandbox': 1,
      'plan-pro': 10,
      'plan-enterprise': 100,
      'plan-sovereign': Infinity
    }[tier.id];

    return {
      tier,
      requestCapacity,
      storageCapacity,
      requestsFit: estimatedRequests <= requestCapacity,
      storageFits: estimatedStorage <= storageCapacity
    };
  }, [recommendedTier, estimatedRequests, estimatedStorage]);

  const totalSubscriptions = subscriptions.length;

  const monthlyRecurringRevenue = subscriptions.reduce(
    (total, subscription) => {
      if (subscription.status !== 'ACTIVE') return total;
      return total + Number(subscription.monthlyEquivalent || 0);
    },
    0
  );

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'ACTIVE'
  ).length;

  const applyCoupon = () => {
    const normalizedCode = couponInput.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedCoupon(null);
      setCouponError('Enter a discount code first.');
      return;
    }

    const coupon = COUPONS[normalizedCode];

    if (!coupon) {
      setAppliedCoupon(null);
      setCouponError('This code is invalid or has expired.');
      return;
    }

    setAppliedCoupon({
      code: normalizedCode,
      discount: coupon.discount,
      label: coupon.label
    });
    setCouponInput(normalizedCode);
    setCouponError('');
    triggerToast(`${coupon.label} applied.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    triggerToast('Discount removed.');
  };

  const exportPricingMatrix = useCallback(() => {
    const rows = TIERS.map((tier) => ({
      plan: tier.name,
      planId: tier.id,
      billingCycle,
      currency,
      monthlyEquivalent: getMonthlyPrice(tier).toFixed(2),
      annualTotal: getAnnualTotal(tier).toFixed(2),
      nodeCapacity: tier.nodeLimit,
      sla: tier.specs.sla,
      retention: tier.specs.retention,
      rateLimit: tier.specs.rateLimit,
      features: tier.features.join('; '),
      excludedFeatures: tier.excluded.join('; '),
      recommended: tier.id === recommendedTier.id ? 'Yes' : 'No',
      discountCode: appliedCoupon?.code || ''
    }));

    downloadCsv(rows, 'platform-pricing-matrix.csv');
    triggerToast('Pricing matrix exported.');
  }, [
    billingCycle,
    currency,
    getMonthlyPrice,
    getAnnualTotal,
    recommendedTier,
    appliedCoupon,
    triggerToast
  ]);

  const exportSubscriptions = useCallback(() => {
    if (!subscriptions.length) {
      triggerToast('There are no subscription records to export.');
      return;
    }

    downloadCsv(
      subscriptions.map((subscription) => ({
        ...subscription,
        monthlyEquivalent: Number(
          subscription.monthlyEquivalent || 0
        ).toFixed(2)
      })),
      'subscription-register.csv'
    );

    triggerToast('Subscription register exported.');
  }, [subscriptions, triggerToast]);

  const openCheckout = (tier) => {
    setSelectedPlanModal(null);
    setQuotePlan(null);
    setCheckoutPlan(tier);
    setCheckoutEmail('');
    setCheckoutCompany('');
    setCheckoutSeats(1);
    setCheckoutAccepted(false);
    setCheckoutError('');
  };

  const handleProvision = (tier) => {
    if (tier.id === 'plan-sovereign') {
      setQuotePlan(tier);
      setSelectedPlanModal(null);
      setCheckoutPlan(null);
      setQuoteEmail('');
      setQuoteCompany('');
      setQuoteNotes('');
      return;
    }

    openCheckout(tier);
  };

  const confirmSubscription = (event) => {
    event.preventDefault();

    if (!checkoutPlan) return;

    if (!checkoutEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutEmail)) {
      setCheckoutError('Enter a valid business email address.');
      return;
    }

    if (!checkoutAccepted) {
      setCheckoutError('Accept the subscription terms to continue.');
      return;
    }

    if (checkoutSeats < 1 || checkoutSeats > 1000) {
      setCheckoutError(' must be between 1 and 1,000.');
      return;
    }

    const monthlyPrice = getMonthlyPrice(checkoutPlan);
    const annualTotal = getAnnualTotal(checkoutPlan);

    const subscription = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      planId: checkoutPlan.id,
      planName: checkoutPlan.name,
      email: checkoutEmail.trim(),
      company: checkoutCompany.trim() || 'Individual',
      seats: Number(checkoutSeats),
      currency,
      billingCycle,
      monthlyEquivalent: monthlyPrice,
      annualTotal,
      status: 'ACTIVE',
      paymentMethod,
      billingCountry,
      discountCode: appliedCoupon?.code || '',
      createdAt: new Date().toISOString(),
      reference: `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    };

    setSubscriptions((current) => [subscription, ...current]);
    setCheckoutPlan(null);

    triggerToast(
      `Demo subscription created: ${checkoutPlan.name}. No payment was processed.`
    );
  };

  const submitQuoteRequest = (event) => {
    event.preventDefault();

    if (!quoteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteEmail)) {
      triggerToast('Enter a valid email to prepare your quote request.');
      return;
    }

    const quote = {
      plan: quotePlan?.name || 'Custom infrastructure',
      company: quoteCompany.trim() || 'Not provided',
      email: quoteEmail.trim(),
      requestedNodes: allocatedNodes,
      currency,
      billingCycle,
      notes: quoteNotes.trim(),
      createdAt: new Date().toISOString()
    };

    downloadCsv([quote], 'enterprise-quote-request.csv');
    setQuotePlan(null);
    triggerToast('Quote request prepared and exported locally.');
  };

  const resetPricingPreferences = () => {
    setBillingCycle(DEFAULT_PREFERENCES.billingCycle);
    setCurrency(DEFAULT_PREFERENCES.currency);
    setAllocatedNodes(DEFAULT_PREFERENCES.allocatedNodes);
    setCompareMode(DEFAULT_PREFERENCES.compareMode);
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponError('');
    setSearchQuery('');
    setSortBy('recommended');
    triggerToast('Pricing preferences reset.');
  };

  const isPlanRecommended = (tier) => tier.id === recommendedTier.id;

  return (
    <div className="pricing-wrapper">
      <header className="pricing-header-bar">
        <button
          className="pricing-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Corporate Portal
        </button>

        <div className="pricing-header-actions">
          <span className="pricing-demo-indicator">
            DEMO ENVIRONMENT
          </span>

          <button
            className="pricing-export-btn"
            onClick={exportPricingMatrix}
            title="Export pricing matrix (Ctrl/Cmd + E)"
          >
            Export
          </button>
        </div>
      </header>

      <section className="pricing-control-center">
        <div className="pricing-title-row">
          <div>
            <p className="pricing-eyebrow">COMMERCIAL OPERATIONS </p>
            <h1 className="pricing-main-title">
              Flexible Platform Plans
            </h1>
            <p className="pricing-intro-note">
              Configure infrastructure capacity, compare subscription tiers,
              and review pricing before creating a demo subscription.
            </p>
          </div>

          <div className="pricing-session-status">
            <span className="pricing-status-dot" />
            Pricing operational
          </div>
        </div>

        <div className="pricing-global-controls">
          <div className="toggle-container-block">
            <button
              className={`toggle-option ${billingCycle === 'MONTHLY' ? 'selected' : ''}`}
              onClick={() => setBillingCycle('MONTHLY')}
              aria-pressed={billingCycle === 'MONTHLY'}
            >
              Monthly Terms
            </button>

            <button
              className={`toggle-option ${billingCycle === 'YEARLY' ? 'selected' : ''}`}
              onClick={() => setBillingCycle('YEARLY')}
              aria-pressed={billingCycle === 'YEARLY'}
            >
              Annual Allocation
              <em>Save up to 24%</em>
            </button>
          </div>

<div className="currency-selector-group">
            <span className="pricing-control-label">Currency</span>

            {Object.keys(CURRENCY_MAP).map((curr) => (
              <button
                key={curr}
                className={`currency-btn ${currency === curr ? 'active' : ''}`}
                onClick={() => setCurrency(curr)}
                aria-pressed={currency === curr}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        <div className="pricing-disclaimer">
          <span>ⓘ</span>
          Currency rates are illustrative demo conversion rates, not live exchange rates.
          Annual prices are monthly equivalents billed for 12 months.
        </div>

        <div className="node-estimator-box">
          <div className="estimator-header">
            <div>
              <span className="pricing-control-label">Infrastructure estimator</span>
              <h3>
                {allocatedNodes.toLocaleString()} Active Nodes
              </h3>
            </div>

            <div className="estimator-recommendation">
              <span>Recommended tier</span>
              <strong>{recommendedTier.name}</strong>
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="500"
            step="1"
            value={allocatedNodes}
            onChange={(event) => setAllocatedNodes(Number(event.target.value))}
            className="node-slider-input"
            aria-label="Number of allocated nodes"
          />

          <div className="pricing-slider-labels">
            <span>50 node</span>
            <span>125 nodes</span>
            <span>250 nodes</span>
            <span>500 nodes</span>
          </div>

          <div className="pricing-estimator-summary">
            <span>
              <strong>{recommendedTier.nodeLimit.toLocaleString()}</strong> node capacity
            </span>
            <span>
              <strong>{recommendedTier.specs.retention}</strong> log retention
            </span>
            <span>
              <strong>{recommendedTier.specs.sla}</strong>
            </span>
          </div>
        </div>

        <div className="pricing-coupon-panel">
          <div>
            <h3>Promotional allocation</h3>
            <p>Apply a demo coupon to eligible plan prices.</p>
          </div>

          <div className="pricing-coupon-controls">
            <input
              value={couponInput}
              onChange={(event) => {
                setCouponInput(event.target.value.toUpperCase());
                setCouponError('');
              }}
              placeholder="Enter code"
              aria-label="Promotional code"
            />

            {appliedCoupon ? (
              <button
                type="button"
                className="pricing-secondary-btn"
                onClick={removeCoupon}
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                className="pricing-secondary-btn"
                onClick={applyCoupon}
              >
                Apply code
              </button>
            )}
          </div>

          {appliedCoupon && (
            <p className="pricing-coupon-success">
              ✓ {appliedCoupon.code}: {appliedCoupon.label}
            </p>
          )}

          {couponError && (
            <p className="pricing-coupon-error">{couponError}</p>
          )}

          <p className="pricing-coupon-hint">
            Demo codes: GRID20, LAUNCH10, DEV15.
          </p>
        </div>
      </section>

      <section className="pricing-analytics-strip">
        <div className="pricing-analytics-card">
          <span>Total subscriptions</span>
          <strong>{totalSubscriptions}</strong>
          <small>Stored in this browser</small>
        </div>

        <div className="pricing-analytics-card">
          <span>Active subscriptions</span>
          <strong>{activeSubscriptions}</strong>
          <small>records marked active</small>
        </div>

        <div className="pricing-analytics-card">
          <span> monthly revenue</span>
          <strong>{formatMoney(monthlyRecurringRevenue, currency)}</strong>
          <small>Based on active records</small>
        </div>

        <div className="pricing-analytics-card">
          <span>Annual billing </span>
          <strong>{formatMoney(projectedAnnualSavings, currency)}</strong>
          <small>Maximum modeled savings per year before coupons</small>
        </div>
      </section>

      <section className="pricing-catalog-controls">
        <div>
          <h2>Infrastructure plans</h2>
          <p>Compare capacity, operational features and service targets.</p>
        </div>

        <div className="pricing-catalog-actions">
          <input
            className="pricing-plan-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search plans or features..."
            aria-label="Search plans"
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort pricing plans"
          >
            <option value="recommended">Recommended first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="capacity"> capacity</option>
          </select>

          <button
            className="pricing-secondary-btn"
            onClick={() => setCompareMode((current) => !current)}
            aria-pressed={compareMode}
          >
            {compareMode ? 'Card view' : 'Compact compare'}
          </button>

          <button
            className="pricing-secondary-btn"
            onClick={resetPricingPreferences}
          >
            Reset
          </button>
        </div>
      </section>

      {compareMode ? (
        <div className="pricing-compact-table-wrap">
          <table className="pricing-compact-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Monthly equivalent</th>
                <th>Annual total</th>
                <th>Node limit</th>
                <th>SLA target</th>
                <th>Retention</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTiers.map((tier) => (
                <tr key={tier.id}>
                  <td>
                    <strong>{tier.name}</strong>
                    {isPlanRecommended(tier) && (
                      <span className="pricing-inline-match">MATCH</span>
                    )}
                  </td>
                  <td>{formatMoney(getMonthlyPrice(tier), currency)}</td>
                  <td>{formatMoney(getAnnualTotal(tier), currency)}</td>
                  <td>{tier.nodeLimit.toLocaleString()}</td>
                  <td>{tier.specs.sla}</td>
                  <td>{tier.specs.retention}</td>
                  <td>
                    <button
                      className="spec-inspect-btn"
                      onClick={() => setSelectedPlanModal(tier)}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <main className="pricing-matrix-layout">
          {filteredTiers.map((tier) => {
            const isRecommended = isPlanRecommended(tier);
            const monthlyPrice = getMonthlyPrice(tier);
            const annualTotal = getAnnualTotal(tier);
            const originalMonthly = getBaseMonthlyPrice(tier) *
              currencyConfig.rate;

            return (
              <article
                key={tier.id}
                className={`pricing-plan-card ${tier.monthlyPrice > 0 ? 'premium-focus' : ''} ${isRecommended ? 'recommended-highlight' : ''}`}
              >
                <div className="plan-heading-section">
                  <div className="plan-badge-row">
                    <span className="plan-badge-tag">{tier.badge}</span>

                    {isRecommended && (
                      <span className="recommended-tag">BEST MATCH</span>
                    )}
                  </div>

                  <h2 className="plan-name-heading">{tier.name}</h2>

                  <p className="plan-volume-limits">
                    <em>{tier.limits}</em>
                  </p>

                  <p className="pricing-plan-description">
                    {tier.description}
                  </p>
                </div>

                <div className="plan-cost-display">
                  <span className="currency-symbol">
                    {currencyConfig.symbol}
                  </span>

                  <span className="price-num-label">
                    {monthlyPrice === 0
                      ? '0'
                      : monthlyPrice.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })}
                  </span>

                  <span className="time-scale-label">/ month</span>
                </div>

                {billingCycle === 'YEARLY' && tier.monthlyPrice > 0 && (
                  <div className="pricing-annual-summary">
                    <span>
                      Billed annually: {formatMoney(annualTotal, currency)}
                    </span>

                    <span>
                      Save {formatMoney(
                        (tier.monthlyPrice - tier.yearlyPrice) *
                          12 *
                          currencyConfig.rate,
                        currency
                      )} / year
                    </span>
                  </div>
                )}

                {appliedCoupon && tier.monthlyPrice > 0 && (
                  <p className="pricing-discount-line">
                    {appliedCoupon.discount}% discount applied
                    <span>
                      Standard price: {formatMoney(originalMonthly, currency)}/mo
                    </span>
                  </p>
                )}

                <div className="pricing-plan-metrics">
                  <div>
                    <span>Service target</span>
                    <strong>{tier.specs.sla}</strong>
                  </div>

                  <div>
                    <span>Log retention</span>
                    <strong>{tier.specs.retention}</strong>
                  </div>

                  <div>
                    <span>API throughput</span>
                    <strong>{tier.specs.rateLimit}</strong>
                  </div>
                </div>

                <div className="plan-feature-list">
                  <h3 className="checklist-header">Included subsystems</h3>

                  <ul className="feature-checklist">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="feature-item positive-check"
                      >
                        <span className="check-bullet">✓</span>
                        {feature}
                      </li>
                    ))}

                    {tier.excluded.map((feature) => (
                      <li
                        key={feature}
                        className="feature-item negative-check"
                      >
                        <span className="check-bullet">✕</span>
                        <del>{feature}</del>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pricing-plan-footer-meta">
                  <span>Support: {tier.specs.support}</span>
                  <span>Telemetry: {tier.specs.storage}</span>
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
                    {tier.id === 'plan-sandbox'
                      ? 'Start Free'
                      : tier.id === 'plan-sovereign'
                        ? 'Request Quote'
                        : 'Select Plan'}
                  </button>
                </div>
              </article>
            );
          })}

          {filteredTiers.length === 0 && (
            <div className="empty-pricing-state">
              <h3>No matching plans</h3>
              <p>Try another plan name, feature or search term.</p>
              <button
                className="pricing-secondary-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            </div>
          )}
        </main>
      )}

      <section className="pricing-feature-comparison">
        <button
          className="pricing-section-toggle"
          onClick={() => setShowFeatureComparison((current) => !current)}
          aria-expanded={showFeatureComparison}
        >
          <span>
            <strong>Feature capability </strong>
            <small>Compare access levels across every plan</small>
          </span>
          <span>{showFeatureComparison ? '−' : '+'}</span>
        </button>

        {showFeatureComparison && (
          <div className="pricing-comparison-table-wrap">
            <table className="pricing-comparison-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  {TIERS.map((tier) => (
                    <th key={tier.id}>{tier.name}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    label: 'Standard log streaming',
                    test: (tier) => tier.features.some((f) => f.toLowerCase().includes('log streaming'))
                  },
                  {
                    label: 'Advanced metrics',
                    test: (tier) => tier.features.some((f) => f.toLowerCase().includes('advanced matrix'))
                  },
                  {
                    label: 'Custom domains',
                    test: (tier) => tier.specs.customDomains
                  },
                  {
                    label: '24/7 dedicated support',
                    test: (tier) => tier.features.some((f) => f.toLowerCase().includes('24/7'))
                  },
                  {
                    label: 'Zero-Knowledge audit logs',
                    test: (tier) => tier.specs.auditLogs
                  },
                  {
                    label: 'Custom native hooks',
                    test: (tier) => tier.features.some((f) => f.toLowerCase().includes('native hooks'))
                  }
                ].map((feature) => (
                  <tr key={feature.label}>
                    <td>{feature.label}</td>
                    {TIERS.map((tier) => (
                      <td key={tier.id}>
                        {feature.test(tier) ? (
                          <span className="pricing-feature-enabled">✓ Included</span>
                        ) : (
                          <span className="pricing-feature-disabled">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="pricing-usage-estimator">
        <button
          className="pricing-section-toggle"
          onClick={() => setShowUsageEstimator((current) => !current)}
          aria-expanded={showUsageEstimator}
        >
          <span>
            <strong>Workload analysis</strong>
            <small>Check the selected recommendation against estimated usage</small>
          </span>
          <span>{showUsageEstimator ? '−' : '+'}</span>
        </button>

        {showUsageEstimator && (
          <div className="pricing-usage-grid">
            <div className="pricing-usage-control">
              <label htmlFor="request-volume">
                Estimated monthly requests
              </label>

              <input
                id="request-volume"
                type="number"
                min="0"
                max="100000000000"
                value={estimatedRequests}
                onChange={(event) => setEstimatedRequests(
                  Math.max(0, Number(event.target.value) || 0)
                )}
              />

              <span>
                {estimatedRequests.toLocaleString()} requests / month
              </span>
            </div>

            <div className="pricing-usage-control">
              <label htmlFor="storage-volume">
                Estimated storage (GB)
              </label>

              <input
                id="storage-volume"
                type="number"
                min="0"
                max="1000000000"
                value={estimatedStorage}
                onChange={(event) => setEstimatedStorage(
                  Math.max(0, Number(event.target.value) || 0)
                )}
              />

              <span>{estimatedStorage.toLocaleString()} GB required</span>
            </div>

            <div className="pricing-usage-result">
              <span>Capacity assessment</span>
              <h3>{estimateCapacity.tier.name}</h3>

              <p className={
                estimateCapacity.requestsFit
                  ? 'pricing-capacity-pass'
                  : 'pricing-capacity-warning'
              }>
                {estimateCapacity.requestsFit
                  ? '✓ Request estimate is within the illustrative capacity.'
                  : '⚠ Request estimate exceeds the illustrative capacity.'}
              </p>

              <p className={
                estimateCapacity.storageFits
                  ? 'pricing-capacity-pass'
                  : 'pricing-capacity-warning'
              }>
                {estimateCapacity.storageFits
                  ? '✓ Storage estimate is within the stated allocation.'
                  : '⚠ Storage estimate exceeds the stated allocation.'}
              </p>

              <small>
                Capacity thresholds are illustrative assumptions,
                not guaranteed performance specifications.
              </small>
            </div>
          </div>
        )}
      </section>

      <section className="pricing-subscription-register">
        <div className="pricing-register-header">
          <div>
            <h2>Subscription register</h2>
            <p> subscriptions created from this browser session.</p>
          </div>

          <button
            className="pricing-secondary-btn"
            onClick={exportSubscriptions}
          >
            Export register
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="pricing-register-empty">
            <span>▤</span>
            <h3>No subscriptions created</h3>
            <p>Select a plan to create a subscription record.</p>
          </div>
        ) : (
          <div className="pricing-register-table-wrap">
            <table className="pricing-register-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Plan</th>
                  <th>Customer</th>
                  <th>Billing</th>
                  <th>Monthly equivalent</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>{subscription.reference}</td>
                    <td>{subscription.planName}</td>
                    <td>{subscription.company}</td>
                    <td>{subscription.billingCycle}</td>
                    <td>
                      {formatMoney(
                        Number(subscription.monthlyEquivalent || 0),
                        subscription.currency
                      )}
                    </td>
                    <td>
                      <span className={`pricing-subscription-status status-${subscription.status.toLowerCase()}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td>
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="pricing-cancel-subscription-btn"
                        onClick={() => {
                          setSubscriptions((current) => current.map((item) =>
                            item.id === subscription.id
                              ? { ...item, status: item.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE' }
                              : item
                          ));

                          triggerToast(
                            subscription.status === 'ACTIVE'
                              ? 'Demo subscription cancelled.'
                              : 'Demo subscription reactivated.'
                          );
                        }}
                      >
                        {subscription.status === 'ACTIVE' ? 'Cancel' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="pricing-register-disclaimer">
          This register is stored in your browser. It is not connected
          to a payment gateway, server-side billing system or real customer account.
        </p>
      </section>

      {selectedPlanModal && (
        <div
          className="pricing-modal-overlay"
          onClick={() => setSelectedPlanModal(null)}
          role="presentation"
        >
          <section
            className="pricing-modal-card pricing-spec-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-spec-title"
          >
            <div className="modal-header-row">
              <div>
                <span className="pricing-modal-eyebrow">PLAN SPECIFICATION</span>
                <h2 id="pricing-spec-title">
                  {selectedPlanModal.name}
                </h2>
              </div>

              <button
                className="close-modal-btn"
                onClick={() => setSelectedPlanModal(null)}
                aria-label="Close specifications"
              >
                ✕
              </button>
            </div>

            <div className="modal-body-specs">
              <p>
                <strong>Description:</strong> {selectedPlanModal.description}
              </p>

              <p>
                <strong>Endpoint limits:</strong> {selectedPlanModal.limits}
              </p>

              <p>
                <strong>Service uptime target:</strong> {selectedPlanModal.specs.sla}
              </p>

              <p>
                <strong>Log retention:</strong> {selectedPlanModal.specs.retention}
              </p>

              <p>
                <strong>API capacity:</strong> {selectedPlanModal.specs.rateLimit}
              </p>

              <p>
                <strong>Support:</strong> {selectedPlanModal.specs.support}
              </p>

              <p>
                <strong>Telemetry allocation:</strong> {selectedPlanModal.specs.storage}
              </p>

              <p>
                <strong>Custom domain binding:</strong>{' '}
                {selectedPlanModal.specs.customDomains ? 'Included' : 'Not included'}
              </p>

              <p>
                <strong>Zero-Knowledge audit logs:</strong>{' '}
                {selectedPlanModal.specs.auditLogs ? 'Included' : 'Not included'}
              </p>

              <div className="modal-checklist-block">
                <h4>Included features</h4>
                <ul>
                  {selectedPlanModal.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              {selectedPlanModal.excluded.length > 0 && (
                <div className="modal-checklist-block pricing-excluded-features">
                  <h4>Not included</h4>
                  <ul>
                    {selectedPlanModal.excluded.map((feature) => (
                      <li key={feature}>✕ {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pricing-modal-total">
              <span>Monthly equivalent</span>
              <strong>
                {formatMoney(getMonthlyPrice(selectedPlanModal), currency)}
                <small> / month</small>
              </strong>

              <span>
                Annual total: {formatMoney(getAnnualTotal(selectedPlanModal), currency)}
              </span>
            </div>

            <button
              className="plan-action-trigger-btn modal-submit-btn"
              onClick={() => handleProvision(selectedPlanModal)}
            >
              {selectedPlanModal.id === 'plan-sovereign'
                ? 'Request Enterprise Quote'
                : 'Continue to Review'}
            </button>
          </section>
        </div>
      )}

      {checkoutPlan && (
        <div
          className="pricing-modal-overlay"
          onClick={() => setCheckoutPlan(null)}
          role="presentation"
        >
          <section
            className="pricing-modal-card pricing-checkout-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-checkout-title"
          >
            <div className="modal-header-row">
              <div>
                <span className="pricing-modal-eyebrow">SUBSCRIPTION REVIEW</span>
                <h2 id="pricing-checkout-title">Confirm </h2>
              </div>

              <button
                className="close-modal-btn"
                onClick={() => setCheckoutPlan(null)}
                aria-label="Close checkout"
              >
                ✕
              </button>
            </div>

            <div className="pricing-checkout-summary">
              <div>
                <span>Selected plan</span>
                <strong>{checkoutPlan.name}</strong>
              </div>

              <div>
                <span>Billing frequency</span>
                <strong>{billingCycle}</strong>
              </div>

              <div>
                <span>Monthly equivalent</span>
                <strong>{formatMoney(getMonthlyPrice(checkoutPlan), currency)}</strong>
              </div>

              <div>
                <span>Annual total</span>
                <strong>{formatMoney(getAnnualTotal(checkoutPlan), currency)}</strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  {appliedCoupon
                    ? `${appliedCoupon.discount}% (${appliedCoupon.code})`
                    : 'None'}
                </strong>
              </div>
            </div>

            <form onSubmit={confirmSubscription} className="pricing-checkout-form">
              <label>
                Business email *
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </label>

              <label>
                Company or account name
                <input
                  value={checkoutCompany}
                  onChange={(event) => setCheckoutCompany(event.target.value)}
                  placeholder="Your organization"
                />
              </label>

              <label>
                Allocated seats
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={checkoutSeats}
                  onChange={(event) => setCheckoutSeats(Number(event.target.value))}
                  required
                />
              </label>

              <label>
                Billing country
                <select
                  value={billingCountry}
                  onChange={(event) => setBillingCountry(event.target.value)}
                >
                  <option value="NG">Nigeria</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label>
                Payment method preference
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="INVOICE">Invoice / manual settlement</option>
                </select>
              </label>

              <label className="pricing-terms-checkbox">
                <input
                  type="checkbox"
                  checked={checkoutAccepted}
                  onChange={(event) => setCheckoutAccepted(event.target.checked)}
                />
                I have reviewed the selected plan and demo billing summary.
              </label>

              {checkoutError && (
                <p className="pricing-form-error">{checkoutError}</p>
              )}

              <p className="pricing-checkout-disclaimer">
                Demo only: this form creates a local subscription record. It does not
                charge a payment method, contact a billing API, or activate a real service.
              </p>

              <button
                className="plan-action-trigger-btn modal-submit-btn"
                type="submit"
              >
                Confirm Subscription
              </button>
            </form>
          </section>
        </div>
      )}

      {quotePlan && (
        <div
          className="pricing-modal-overlay"
          onClick={() => setQuotePlan(null)}
          role="presentation"
        >
          <section
            className="pricing-modal-card pricing-quote-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-quote-title"
          >
            <div className="modal-header-row">
              <div>
                <span className="pricing-modal-eyebrow">ENTERPRISE PROCUREMENT</span>
                <h2 id="pricing-quote-title">Request a custom quote</h2>
              </div>

              <button
                className="close-modal-btn"
                onClick={() => setQuotePlan(null)}
                aria-label="Close quote request"
              >
                ✕
              </button>
            </div>

            <div className="pricing-quote-summary">
              <h3>{quotePlan.name}</h3>
              <p>{quotePlan.description}</p>
              <p>Estimated allocation: {allocatedNodes.toLocaleString()} nodes</p>
              <p>Currency preference: {currency}</p>
              <p>Billing preference: {billingCycle}</p>
            </div>

            <form onSubmit={submitQuoteRequest} className="pricing-checkout-form">
              <label>
                Business email *
                <input
                  type="email"
                  value={quoteEmail}
                  onChange={(event) => setQuoteEmail(event.target.value)}
                  placeholder="procurement@company.com"
                  required
                />
              </label>

              <label>
                Organization
                <input
                  value={quoteCompany}
                  onChange={(event) => setQuoteCompany(event.target.value)}
                  placeholder="Registered business name"
                />
              </label>

              <label>
                Infrastructure requirements
                <textarea
                  value={quoteNotes}
                  onChange={(event) => setQuoteNotes(event.target.value)}
                  placeholder="Dedicated nodes, security requirements, integrations..."
                  rows={4}
                />
              </label>

              <p className="pricing-checkout-disclaimer">
                This creates a downloadable quote-request record. It does not send an email
                or create a binding commercial offer.
              </p>

              <button className="plan-action-trigger-btn modal-submit-btn" type="submit">
                Prepare Quote Request
              </button>
            </form>
          </section>
        </div>
      )}

      {toastMessage && (
        <div
          key={toastId}
          className="custom-notification-toast"
          role="status"
          aria-live="polite"
        >
          <span>● {toastMessage}</span>
        </div>
      )}

      <footer className="pricing-page-footer">
        <span>Platform Commercial </span>
        <span>Demo environment · Local storage</span>
        <button onClick={exportPricingMatrix}>Download current pricing</button>
      </footer>
    </div>
  );
}


import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './Page12_Checkout.css';

const ORDER = {
  id: 'ORD-2026-10482',
  reference: 'API-CORE-LICENSE',
  title: 'Enterprise Core API License',
  description: 'Platform access and infrastructure provisioning',
  basePrice: 45,
  processingFee: 4,
  currency: 'USD'
};

const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Credit / Debit', icon: '💳' },
  { id: 'CRYPTO', label: 'Web3 Crypto', icon: '🪙' },
  { id: 'WIRE', label: 'Bank Transfer', icon: '🏦' }
];

const NETWORKS = [
  { id: 'BASE', label: 'Base', asset: 'USDC', fee: 0.15 },
  { id: 'ETHEREUM', label: 'Ethereum', asset: 'USDC', fee: 3.5 },
  { id: 'POLYGON', label: 'Polygon', asset: 'USDC', fee: 0.1 }
];

const COUPONS = {
  CHECKOUT10: { discount: 10, label: '10% checkout discount' },
  DEMO15: { discount: 15, label: '15% demonstration discount' }
};

const STORAGE_KEY = 'checkout-demo-transactions-v3';

function safeReadTransactions() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function money(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function generateReference(prefix = 'TXN') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

function maskCardNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '•••• •••• •••• ••••';
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

function detectCardBrand(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (/^4/.test(digits)) return 'VISA';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return 'MASTERCARD';
  }
  if (/^3[47]/.test(digits)) return 'AMEX';
  if (/^6(?:011|5)/.test(digits)) return 'DISCOVER';

  return 'CARD';
}

function passesLuhn(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function getExpiryError(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (!/^\d{4}$/.test(digits)) {
    return 'Enter the expiration date as MM/YY.';
  }

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));

  if (month < 1 || month > 12) {
    return 'Expiration month must be between 01 and 12.';
  }

  const now = new Date();
  const expiryEnd = new Date(year, month, 0, 23, 59, 59);

  if (expiryEnd < now) {
    return 'This card appears to have expired.';
  }

  return '';
}

function downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadCsv(rows, filename) {
  if (!rows.length) return false;

  const headers = Object.keys(rows[0]);

  const escapeValue = (value) => {
    const normalized = String(value ?? '');
    return `"${normalized.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.map(escapeValue).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeValue(row[header])).join(',')
    )
  ].join('\r\n');

  downloadFile(`\uFEFF${csv}`, filename, 'text/csv;charset=utf-8');
  return true;
}

function createReceipt(transaction) {
  return [
    'DEMO PAYMENT RECEIPT',
    '====================',
    '',
    'SIMULATION ONLY — NO REAL PAYMENT WAS PROCESSED',
    '',
    `Transaction: ${transaction.id}`,
    `Order: ${transaction.orderId}`,
    `Created: ${transaction.createdAt}`,
    `Status: ${transaction.status}`,
    `Method: ${transaction.paymentMethod}`,
    `Payment reference: ${transaction.paymentReference}`,
    `Amount: ${money(transaction.total, transaction.currency)}`,
    `Customer: ${transaction.customerName || 'Not provided'}`,
    `Email: ${transaction.email || 'Not provided'}`,
    '',
    'ITEMIZATION',
    `License: ${money(transaction.basePrice, transaction.currency)}`,
    `Processing fee: ${money(transaction.processingFee, transaction.currency)}`,
    `Discount: -${money(transaction.discountAmount, transaction.currency)}`,
    `Tax: ${money(transaction.taxAmount, transaction.currency)}`,
    `Total: ${money(transaction.total, transaction.currency)}`,
    '',
    'This receipt records a frontend demonstration only.',
    'It is not proof of payment or a merchant settlement.'
  ].join('\n');
}

export default function Page12_Checkout({ setPage }) {
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [paymentStatus, setPaymentStatus] = useState('IDLE');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastId, setToastId] = useState(0);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('NG');
  const [billingAddress, setBillingAddress] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const [selectedNetwork, setSelectedNetwork] = useState('BASE');
  const [cryptoAsset, setCryptoAsset] = useState('USDC');
  const [cryptoReference, setCryptoReference] = useState('');
  const [wireReference, setWireReference] = useState('');

  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [transactions, setTransactions] = useState(safeReadTransactions);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [showHistory, setShowHistory] = useState(true);

  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [testMode, setTestMode] = useState(true);

  const attemptLock = useRef(false);
  const attemptTimer = useRef(null);
  const toastTimer = useRef(null);
  const currentAttemptId = useRef(null);

  const currency = ORDER.currency;
  const cardDigits = cardNumber.replace(/\D/g, '');
  const cardBrand = detectCardBrand(cardNumber);
  const network = NETWORKS.find((item) => item.id === selectedNetwork) || NETWORKS[0];

  const discountRate = appliedCoupon?.discount || 0;
  const subtotal = ORDER.basePrice * Math.max(1, orderQuantity);
  const processingFee = ORDER.processingFee;
  const discountAmount = subtotal * discountRate / 100;
  const taxAmount = 0;
  const total = Math.max(0, subtotal + processingFee - discountAmount + taxAmount);

  const cryptoFee = paymentMethod === 'CRYPTO' ? network.fee : 0;
  const displayedTotal = total + cryptoFee;

  const activeTransaction = useMemo(
    () => transactions.find((item) => item.id === activeTransactionId) || null,
    [transactions, activeTransactionId]
  );

  const filteredTransactions = useMemo(() => {
    const query = historySearch.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesStatus =
        historyFilter === 'ALL' || transaction.status === historyFilter;

      const matchesSearch = !query || [
        transaction.id,
        transaction.orderId,
        transaction.paymentReference,
        transaction.paymentMethod,
        transaction.email,
        transaction.status
      ].some((value) => String(value || '').toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [transactions, historySearch, historyFilter]);

  const metrics = useMemo(() => ({
    total: transactions.length,
    completed: transactions.filter((item) => item.status === 'SUCCESS').length,
    failed: transactions.filter((item) => item.status === 'ERROR').length,
    pending: transactions.filter((item) => item.status === 'PROCESSING').length,
    grossDemoVolume: transactions
      .filter((item) => item.status === 'SUCCESS')
      .reduce((sum, item) => sum + Number(item.total || 0), 0)
  }), [transactions]);

  const triggerToast = useCallback((message) => {
    setToastMessage(message);
    setToastId((value) => value + 1);

    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      triggerToast('Transaction history could not be saved in this browser.');
    }
  }, [transactions, triggerToast]);

  useEffect(() => {
    return () => {
      if (attemptTimer.current) clearTimeout(attemptTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowTransactionDetails(false);
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'e'
      ) {
        event.preventDefault();
        exportTransactions();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const updateTransaction = useCallback((id, updates) => {
    setTransactions((current) => current.map((transaction) =>
      transaction.id === id
        ? {
            ...transaction,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : transaction
    ));
  }, []);

  const addTransaction = useCallback((transaction) => {
    setTransactions((current) => [transaction, ...current]);
  }, []);

  const validateCustomerDetails = () => {
    const errors = {};

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!acceptedTerms) {
      errors.terms = 'Confirm the demo payment terms to continue.';
    }

    if (!Number.isInteger(Number(orderQuantity)) || orderQuantity < 1 || orderQuantity > 100) {
      errors.quantity = 'Quantity must be between 1 and 100.';
    }

    return errors;
  };

  const validatePaymentDetails = () => {
    const errors = {};

    if (paymentMethod === 'CARD') {
      if (!cardName.trim()) {
        errors.cardName = 'Enter the cardholder name.';
      }

      if (!passesLuhn(cardDigits)) {
        errors.cardNumber = 'Enter a valid test card number.';
      }

      const expiryError = getExpiryError(expiry);
      if (expiryError) errors.expiry = expiryError;

      const requiredCvcLength = cardBrand === 'AMEX' ? 4 : 3;

      if (!new RegExp(`^\\d{${requiredCvcLength}}$`).test(cvc)) {
        errors.cvc = `Enter a ${requiredCvcLength}-digit security code.`;
      }
    }

    if (paymentMethod === 'CRYPTO' && !riskAcknowledged) {
      errors.risk = 'Acknowledge that this is a simulated transfer.';
    }

    if (paymentMethod === 'WIRE' && !riskAcknowledged) {
      errors.risk = 'Acknowledge that this is a simulated bank transfer.';
    }

    return errors;
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setAppliedCoupon(null);
      setCouponError('Enter a coupon code.');
      return;
    }

    const coupon = COUPONS[code];

    if (!coupon) {
      setAppliedCoupon(null);
      setCouponError('Coupon is not recognized.');
      return;
    }

    setAppliedCoupon({ code, ...coupon });
    setCouponInput(code);
    setCouponError('');
    triggerToast(`${coupon.label} applied to this demo order.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    triggerToast('Coupon removed.');
  };

  const handleCardInput = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 19);
    const groups = digits.match(/.{1,4}/g) || [];
    setCardNumber(groups.join(' '));

    setValidationErrors((current) => ({
      ...current,
      cardNumber: undefined
    }));
  };

  const handleExpiryInput = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);

    setExpiry(
      digits.length > 2
        ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
        : digits
    );

    setValidationErrors((current) => ({
      ...current,
      expiry: undefined
    }));
  };

  const copyToClipboard = async (value, label) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement('textarea');
        input.value = value;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();

        const copied = document.execCommand('copy');
        input.remove();

        if (!copied) throw new Error('Copy failed');
      }

      triggerToast(`${label} copied.`);
    } catch {
      triggerToast(`Could not copy ${label.toLowerCase()}. Please copy it manually.`);
    }
  };

  const resetPaymentFields = () => {
    setPaymentStatus('IDLE');
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setCryptoReference('');
    setWireReference('');
    setValidationErrors({});
    setAcceptedTerms(false);
    setRiskAcknowledged(false);
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setShowTransactionDetails(false);
    setActiveTransactionId(null);
    attemptLock.current = false;
    currentAttemptId.current = null;
  };

  const executePayment = (event) => {
    event?.preventDefault();

    if (attemptLock.current || paymentStatus === 'PROCESSING') {
      triggerToast('A transaction attempt is already in progress.');
      return;
    }

    const customerErrors = validateCustomerDetails();
    const paymentErrors = validatePaymentDetails();
    const errors = { ...customerErrors, ...paymentErrors };

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setPaymentStatus('ERROR');
      triggerToast('Review the highlighted fields before continuing.');
      return;
    }

    if (!testMode) {
      triggerToast('Live payments are disabled. Switch to demonstration mode.');
      return;
    }

    attemptLock.current = true;

    const attemptId = generateReference('ATT');
    const transactionId = generateReference('TXN');
    currentAttemptId.current = attemptId;

    const paymentReference = generateReference('DEMO');

    const transaction = {
      id: transactionId,
      attemptId,
      orderId: ORDER.id,
      orderReference: ORDER.reference,
      paymentReference,
      customerName: paymentMethod === 'CARD' ? cardName.trim() : company.trim(),
      email: email.trim(),
      company: company.trim(),
      country,
      billingAddress: billingAddress.trim(),
      paymentMethod,
      paymentNetwork: paymentMethod === 'CRYPTO' ? selectedNetwork : null,
      cryptoAsset: paymentMethod === 'CRYPTO' ? cryptoAsset : null,
      cardBrand: paymentMethod === 'CARD' ? cardBrand : null,
      maskedCard: paymentMethod === 'CARD' ? maskCardNumber(cardDigits) : null,
      quantity: Number(orderQuantity),
      currency,
      basePrice: subtotal,
      processingFee,
      cryptoFee,
      discountCode: appliedCoupon?.code || '',
      discountAmount,
      taxAmount,
      total: displayedTotal,
      status: 'PROCESSING',
      mode: 'SIMULATION',
      riskLevel: paymentMethod === 'CARD' ? 'LOW' : 'REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          label: 'Checkout validation passed',
          timestamp: new Date().toISOString(),
          status: 'SUCCESS'
        },
        {
          label: 'Demo authorization initiated',
          timestamp: new Date().toISOString(),
          status: 'PROCESSING'
        }
      ]
    };

    addTransaction(transaction);
    setActiveTransactionId(transactionId);
    setPaymentStatus('PROCESSING');

    triggerToast('Demo payment authorization initiated.');

    attemptTimer.current = setTimeout(() => {
      if (currentAttemptId.current !== attemptId) return;

      const completedAt = new Date().toISOString();

      updateTransaction(transactionId, {
        status: 'SUCCESS',
        updatedAt: completedAt,
        authorizationCode: generateReference('AUTH'),
        settlementReference: generateReference('SET'),
        timeline: [
          ...transaction.timeline,
          {
            label: 'Demo gateway response received',
            timestamp: completedAt,
            status: 'SUCCESS'
          },
          {
            label: 'Demo authorization recorded',
            timestamp: completedAt,
            status: 'SUCCESS'
          }
        ]
      });

      setPaymentStatus('SUCCESS');
      attemptLock.current = false;
      triggerToast('Demo transaction completed. No real payment was processed.');
    }, 1800);
  };

  const retryTransaction = (transaction) => {
    if (!transaction) return;

    setActiveTransactionId(null);
    setShowTransactionDetails(false);
    setPaymentStatus('IDLE');
    setPaymentMethod(transaction.paymentMethod);
    setEmail(transaction.email || '');
    setCompany(transaction.company || '');
    setCountry(transaction.country || 'NG');
    setOrderQuantity(Math.max(1, Number(transaction.quantity || 1)));
    setRiskAcknowledged(false);

    triggerToast('Review the payment details and start a new demo attempt.');
  };

  const cancelProcessing = () => {
    if (paymentStatus !== 'PROCESSING' || !activeTransactionId) return;

    if (attemptTimer.current) clearTimeout(attemptTimer.current);

    currentAttemptId.current = null;
    attemptLock.current = false;

    updateTransaction(activeTransactionId, {
      status: 'ERROR',
      errorMessage: 'Demo attempt cancelled by user.',
      timeline: [
        ...(transactions.find((item) => item.id === activeTransactionId)?.timeline || []),
        {
          label: 'Attempt cancelled by user',
          timestamp: new Date().toISOString(),
          status: 'ERROR'
        }
      ]
    });

    setPaymentStatus('ERROR');
    triggerToast('Demo payment attempt cancelled.');
  };

  const exportTransactions = () => {
    if (!transactions.length) {
      triggerToast('There are no transactions to export.');
      return;
    }

    const rows = transactions.map((transaction) => ({
      transactionId: transaction.id,
      orderId: transaction.orderId,
      paymentReference: transaction.paymentReference,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      currency: transaction.currency,
      total: transaction.total,
      email: transaction.email,
      customer: transaction.customerName,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      mode: transaction.mode
    }));

    downloadCsv(rows, 'checkout-demo-transactions.csv');
    triggerToast('Transaction report exported.');
  };

  const exportCurrentReceipt = () => {
    const transaction = transactions.find((item) => item.id === activeTransactionId);

    if (!transaction) {
      triggerToast('No transaction receipt is available.');
      return;
    }

    downloadFile(
      createReceipt(transaction),
      `${transaction.id}-demo-receipt.txt`
    );

    triggerToast('Demo receipt downloaded.');
  };

  const clearHistory = () => {
    if (!transactions.length) {
      triggerToast('Transaction history is already empty.');
      return;
    }

    setTransactions([]);
    setActiveTransactionId(null);
    setShowTransactionDetails(false);
    triggerToast('Local demo transaction history cleared.');
  };

  const choosePaymentMethod = (method) => {
    if (paymentStatus === 'PROCESSING') {
      triggerToast('Cancel the current attempt before switching methods.');
      return;
    }

    setPaymentMethod(method);
    setPaymentStatus('IDLE');
    setValidationErrors({});
    setRiskAcknowledged(false);
  };

  const activeTimelineTransaction = activeTransaction ||
    transactions.find((item) => item.id === activeTransactionId);

  return (
    <div className="gateway-wrapper">
      <header className="gateway-top-bar">
        <button
          type="button"
          className="gateway-exit-btn"
          onClick={() => {
            if (paymentStatus === 'PROCESSING') {
              triggerToast('Cancel the current attempt before leaving checkout.');
              return;
            }

            setPage('home');
          }}
        >
          ← Corporate Portal
        </button>

        <div className="gateway-top-status">
          <span className="gateway-secure-tag">DEMO PAYMENT ENVIRONMENT</span>
          <span className="gateway-session-id">
          </span>
        </div>
      </header>

      <main className="gateway-container">
        <div className="gateway-page-heading">
          <div>
            <span className="gateway-eyebrow">COMMERCE / TRANSACTION CONTROL</span>
            <h1>Payment Operations </h1>
            <p>
              Review the order, validate payment details and inspect the simulated
              transaction lifecycle.
            </p>
          </div>

          <div className="gateway-environment-badge">
            <span className="gateway-status-dot" />
            Simulation only
          </div>
        </div>

        <section className="gateway-metrics-grid">
          <article className="gateway-metric-card">
            <span>Total attempts</span>
            <strong>{metrics.total}</strong>
            <small>Local transaction records</small>
          </article>

          <article className="gateway-metric-card">
            <span>Successful simulations</span>
            <strong>{metrics.completed}</strong>
            <small>Demo authorizations</small>
          </article>

          <article className="gateway-metric-card">
            <span>Failed or cancelled</span>
            <strong>{metrics.failed}</strong>
            <small>Recorded unsuccessful attempts</small>
          </article>

          <article className="gateway-metric-card">
            <span>Simulated volume</span>
            <strong>{money(metrics.grossDemoVolume, currency)}</strong>
            <small>Not real merchant revenue</small>
          </article>
        </section>

        {paymentStatus === 'SUCCESS' && activeTimelineTransaction ? (
          <section className="payment-alert success-state">
            <div className="success-badge-icon">✓</div>

            <span className="gateway-eyebrow">TRANSACTION COMPLETE</span>
            <h2 className="state-title">Authorization successful</h2>

            <p className="state-desc">
              The local payment completed. No real funds were transferred,
              no payment gateway was contacted, and no merchant settlement occurred.
            </p>

            <div className="success-summary-card">
              <div>
                <strong>Transaction reference:</strong>
                <code>{activeTimelineTransaction.id}</code>
              </div>

              <div>
                <strong>Order:</strong>
                <span>{activeTimelineTransaction.orderId}</span>
              </div>

              <div>
                <strong> amount:</strong>
                <span>{money(activeTimelineTransaction.total, activeTimelineTransaction.currency)}</span>
              </div>

              <div>
                <strong>Payment method:</strong>
                <span>{activeTimelineTransaction.paymentMethod}</span>
              </div>

              <div>
                <strong>Result:</strong>
                <span>SUCCESS</span>
              </div>
            </div>

            <div className="gateway-success-actions">
              <button
                type="button"
                className="gateway-submit-trigger"
                onClick={exportCurrentReceipt}
              >
                Export Receipt
              </button>

              <button
                type="button"
                className="gateway-reset-btn"
                onClick={() => {
                  resetPaymentFields();
                  setEmail('');
                  setCompany('');
                  setOrderQuantity(1);
                }}
              >
                Start New Checkout
              </button>

              <button
                type="button"
                className="gateway-secondary-btn"
                onClick={() => setShowHistory(true)}
              >
                View Transaction History
              </button>
            </div>
          </section>
        ) : (
          <div className="gateway-core-sheet">
            <section className="order-summary-box">
              <div className="summary-header-row">
                <div>
                  <span className="summary-title">ORDER SUMMARY</span>
                  <p className="gateway-order-reference">
                    {ORDER.id} · {ORDER.reference}
                  </p>
                </div>

                <button
                  type="button"
                  className="toggle-itemization-btn"
                  onClick={() => setShowOrderDetails((current) => !current)}
                  aria-expanded={showOrderDetails}
                >
                  {showOrderDetails ? 'Hide itemization ▲' : 'Inspect itemization ▼'}
                </button>
              </div>

              <h2 className="summary-total">
                {money(displayedTotal, currency)}
                <span className="time-metric"> / one-time order</span>
              </h2>

              <p className="state-desc">
                {ORDER.title} — {ORDER.description}.
              </p>

              {showOrderDetails && (
                <div className="order-itemization-drawer">
                  <div className="item-line">
                    <span>Enterprise Core API License × {orderQuantity}</span>
                    <span>{money(subtotal, currency)}</span>
                  </div>

                  <div className="item-line">
                    <span>Network / processing fee</span>
                    <span>{money(processingFee, currency)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="item-line gateway-discount-line">
                      <span>
                        {appliedCoupon.code} ({appliedCoupon.discount}%)
                      </span>
                      <span>-{money(discountAmount, currency)}</span>
                    </div>
                  )}

                  {cryptoFee > 0 && (
                    <div className="item-line">
                      <span>{network.label} network fee</span>
                      <span>{money(cryptoFee, currency)}</span>
                    </div>
                  )}

                  <div className="item-line">
                    <span>Estimated tax</span>
                    <span>{money(taxAmount, currency)}</span>
                  </div>

                  <div className="item-line total-line">
                    <span>Total amount</span>
                    <span>{money(displayedTotal, currency)}</span>
                  </div>
                </div>
              )}

              <div className="gateway-order-controls">
                <label>
                  License quantity
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={orderQuantity}
                    disabled={paymentStatus === 'PROCESSING'}
                    onChange={(event) => setOrderQuantity(
                      Math.max(1, Math.min(100, Number(event.target.value) || 1))
                    )}
                  />
                </label>

                <div className="gateway-coupon-controls">
                  <label htmlFor="checkout-coupon">Coupon code</label>

                  <div>
                    <input
                      id="checkout-coupon"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="CHECKOUT10"
                      disabled={paymentStatus === 'PROCESSING'}
                    />

                    {appliedCoupon ? (
                      <button
                        type="button"
                        className="gateway-secondary-btn"
                        onClick={removeCoupon}
                        disabled={paymentStatus === 'PROCESSING'}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="gateway-secondary-btn"
                        onClick={applyCoupon}
                        disabled={paymentStatus === 'PROCESSING'}
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponError && (
                    <small className="gateway-error-msg">{couponError}</small>
                  )}
                </div>
              </div>

              <div className="gateway-simulation-notice">
                <strong>Simulation mode is enabled.</strong>
                <span>Do not enter real payment credentials or send funds.</span>
              </div>
            </section>

            <section className="gateway-customer-panel">
              <div className="gateway-section-heading">
                <div>
                  <span className="gateway-eyebrow">STEP 01</span>
                  <h2>Billing information</h2>
                </div>

                <button
                  type="button"
                  className="gateway-secondary-btn"
                  onClick={() => setShowBillingDetails((current) => !current)}
                  aria-expanded={showBillingDetails}
                >
                  {showBillingDetails ? 'Collapse' : 'Edit details'}
                </button>
              </div>

              <div className="gateway-customer-summary">
                <div>
                  <span>Contact email</span>
                  <strong>{email || 'Not provided'}</strong>
                </div>

                <div>
                  <span>Account</span>
                  <strong>{company || 'Individual / personal account'}</strong>
                </div>

                <div>
                  <span>Billing country</span>
                  <strong>{country}</strong>
                </div>
              </div>

              {showBillingDetails && (
                <div className="gateway-billing-form">
                  <div className="input-field-group">
                    <label htmlFor="billing-email">Contact email *</label>
                    <input
                      id="billing-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                    {validationErrors.email && (
                      <small className="gateway-error-msg">
                        {validationErrors.email}
                      </small>
                    )}
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="billing-company">Company or account name</label>
                    <input
                      id="billing-company"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="Your organization"
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="billing-country">Country</label>
                    <select
                      id="billing-country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      disabled={paymentStatus === 'PROCESSING'}
                    >
                      <option value="NG">Nigeria</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="ES">Spain</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="billing-address">Billing address (optional)</label>
                    <input
                      id="billing-address"
                      value={billingAddress}
                      onChange={(event) => setBillingAddress(event.target.value)}
                      placeholder="City or billing address"
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="gateway-payment-panel">
              <div className="gateway-section-heading">
                <div>
                  <span className="gateway-eyebrow">STEP 02</span>
                  <h2>Select payment </h2>
                </div>

                <span className="gateway-test-badge">TEST MODE</span>
              </div>

              <div className="payment-method-tabs">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`method-tab-btn ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => choosePaymentMethod(method.id)}
                    disabled={paymentStatus === 'PROCESSING'}
                    aria-pressed={paymentMethod === method.id}
                  >
                    {method.icon} {method.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'CARD' && (
                <form onSubmit={executePayment} className="gateway-card-form">
                  <div className={`virtual-card-preview ${cardBrand.toLowerCase()}`}>
                    <div className="card-top-row">
                      <span className="chip-icon" />
                      <span className="brand-logo">{cardBrand}</span>
                    </div>

                    <div className="card-number-display">
                      {maskCardNumber(cardNumber)}
                    </div>

                    <div className="card-bottom-row">
                      <div className="card-holder-block">
                        <span className="label-tiny">CARDHOLDER</span>
                        <span>{cardName || 'TEST CARDHOLDER'}</span>
                      </div>

                      <div className="card-exp-block">
                        <span className="label-tiny">EXPIRES</span>
                        <span>{expiry || 'MM / YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="gateway-test-card-hint">
                    Use a payment processor's official test card numbers in a real
                    test integration. This local demo does not authorize cards.
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="cardholder-name">Test cardholder name *</label>
                    <input
                      id="cardholder-name"
                      type="text"
                      autoComplete="off"
                      placeholder="TEST CARDHOLDER"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                    {validationErrors.cardName && (
                      <small className="gateway-error-msg">
                        {validationErrors.cardName}
                      </small>
                    )}
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="card-number">Test card number *</label>
                    <input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Enter a test card number"
                      value={cardNumber}
                      onChange={handleCardInput}
                      maxLength={23}
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                    {validationErrors.cardNumber && (
                      <small className="gateway-error-msg">
                        {validationErrors.cardNumber}
                      </small>
                    )}
                  </div>

                  <div className="inline-input-matrix">
                    <div className="input-field-group">
                      <label htmlFor="card-expiry">Expiration *</label>
                      <input
                        id="card-expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="MM / YY"
                        maxLength={7}
                        value={expiry}
                        onChange={handleExpiryInput}
                        disabled={paymentStatus === 'PROCESSING'}
                      />
                      {validationErrors.expiry && (
                        <small className="gateway-error-msg">
                          {validationErrors.expiry}
                        </small>
                      )}
                    </div>

                   <div className="input-field-group">
                      <label htmlFor="card-cvc">
                        Test security code *
                      </label>
                      <input
                        id="card-cvc"
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={cardBrand === 'AMEX' ? '••••' : '•••'}
                        maxLength={4}
                        value={cvc}
                        onChange={(event) => setCvc(
                          event.target.value.replace(/\D/g, '').slice(0, 4)
                        )}
                        disabled={paymentStatus === 'PROCESSING'}
                      />
                      {validationErrors.cvc && (
                        <small className="gateway-error-msg">
                          {validationErrors.cvc}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="gateway-validation-status">
                    <span className={passesLuhn(cardDigits) ? 'gateway-validation-pass' : ''}>
                      {passesLuhn(cardDigits) ? '✓' : '○'} Card number format
                    </span>
                    <span className={!getExpiryError(expiry) ? 'gateway-validation-pass' : ''}>
                      {!getExpiryError(expiry) ? '✓' : '○'} Expiration
                    </span>
                    <span className={
                      new RegExp(`^\\d{${cardBrand === 'AMEX' ? 4 : 3}}$`).test(cvc)
                        ? 'gateway-validation-pass'
                        : ''
                    }>
                      {new RegExp(`^\\d{${cardBrand === 'AMEX' ? 4 : 3}}$`).test(cvc)
                        ? '✓'
                        : '○'} Security code
                    </span>
                  </div>

                  {paymentStatus === 'ERROR' && (
                    <p className="gateway-error-msg" role="alert">
                      Validation or transaction error. Review the fields and try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    className={`gateway-submit-trigger ${paymentStatus.toLowerCase()}`}
                    disabled={paymentStatus === 'PROCESSING'}
                  >
                    {paymentStatus === 'PROCESSING'
                      ? 'Processing demo authorization…'
                      : `Simulate Authorization (${money(displayedTotal, currency)})`}
                  </button>
                </form>
              )}

              {paymentMethod === 'CRYPTO' && (
                <form
                  className="crypto-payment-box"
                  onSubmit={(event) => {
                    event.preventDefault();
                    executePayment(event);
                  }}
                >
                  <div className="gateway-method-warning">
                    <strong>Simulated Web3 checkout</strong>
                    <span>
                      This screen does not connect a wallet, generate a deposit
                      address, or monitor a blockchain. Do not send real tokens.
                    </span>
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="crypto-network">Network simulation</label>
                    <select
                      id="crypto-network"
                      value={selectedNetwork}
                      onChange={(event) => setSelectedNetwork(event.target.value)}
                      disabled={paymentStatus === 'PROCESSING'}
                    >
                      {NETWORKS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label} — illustrative fee {money(item.fee, currency)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="crypto-asset">Asset</label>
                    <select
                      id="crypto-asset"
                      value={cryptoAsset}
                      onChange={(event) => setCryptoAsset(event.target.value)}
                      disabled={paymentStatus === 'PROCESSING'}
                    >
                      <option value="USDC">USDC (simulation)</option>
                      <option value="USDT">USDT (simulation)</option>
                      <option value="ETH">ETH (simulation)</option>
                    </select>
                  </div>

                  <div className="gateway-crypto-summary">
                    <div>
                      <span>Order total</span>
                      <strong>{money(total, currency)}</strong>
                    </div>
                    <div>
                      <span>Illustrative network fee</span>
                      <strong>{money(network.fee, currency)}</strong>
                    </div>
                    <div>
                      <span>Simulation total</span>
                      <strong>{money(total + network.fee, currency)}</strong>
                    </div>
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="crypto-reference">
                      Optional transaction reference
                    </label>
                    <input
                      id="crypto-reference"
                      value={cryptoReference}
                      onChange={(event) => setCryptoReference(event.target.value)}
                      placeholder="DEMO-TX-REFERENCE"
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                  </div>

                  <label className="gateway-acknowledgment">
                    <input
                      type="checkbox"
                      checked={riskAcknowledged}
                      onChange={(event) => setRiskAcknowledged(event.target.checked)}
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                    I understand this is a local simulation and will not send funds.
                  </label>

                  {validationErrors.risk && (
                    <p className="gateway-error-msg">{validationErrors.risk}</p>
                  )}

                  <button
                    type="submit"
                    className="gateway-submit-trigger"
                    disabled={paymentStatus === 'PROCESSING'}
                  >
                    {paymentStatus === 'PROCESSING'
                      ? 'Simulating confirmation…'
                      : 'Simulate On-Chain Confirmation'}
                  </button>
                </form>
              )}

              {paymentMethod === 'WIRE' && (
                <form
                  className="wire-payment-box"
                  onSubmit={(event) => {
                    event.preventDefault();
                    executePayment(event);
                  }}
                >
                  <div className="gateway-method-warning">
                    <strong>bank transfer</strong>
                    <span>
                      No bank account or routing instructions are provided here.
                      This demo will not initiate or verify a bank transfer.
                    </span>
                  </div>

                  <div className="wire-details-table">
                    <div>
                      <strong>Transfer method:</strong>
                      <span>Manual transfer simulation</span>
                    </div>
                    <div>
                      <strong>Order reference:</strong>
                      <span>{ORDER.id}</span>
                    </div>
                    <div>
                      <strong>Amount to reconcile:</strong>
                      <span>{money(total, currency)}</span>
                    </div>
                    <div>
                      <strong>Settlement status:</strong>
                      <span>Not initiated</span>
                    </div>
                    <div>
                      <strong>Beneficiary details:</strong>
                      <span>Not configured in demo</span>
                    </div>
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="wire-reference">
                      Optional internal transfer reference
                    </label>
                    <input
                      id="wire-reference"
                      value={wireReference}
                      onChange={(event) => setWireReference(event.target.value)}
                      placeholder="INTERNAL-DEMO-REFERENCE"
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                  </div>

                  <label className="gateway-acknowledgment">
                    <input
                      type="checkbox"
                      checked={riskAcknowledged}
                      onChange={(event) => setRiskAcknowledged(event.target.checked)}
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                    I understand this only records a simulated transfer confirmation.
                  </label>

                  {validationErrors.risk && (
                    <p className="gateway-error-msg">{validationErrors.risk}</p>
                  )}

                  <button
                    type="submit"
                    className="gateway-submit-trigger"
                    disabled={paymentStatus === 'PROCESSING'}
                  >
                    {paymentStatus === 'PROCESSING'
                      ? 'Simulating reconciliation…'
                      : 'Simulate Transfer Confirmation'}
                  </button>
                </form>
              )}

              <div className="gateway-checkout-footer">
                <label className="gateway-acknowledgment">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    disabled={paymentStatus === 'PROCESSING'}
                  />
                  I confirm the order details and understand this is a demonstration.
                </label>

                {validationErrors.terms && (
                  <p className="gateway-error-msg">{validationErrors.terms}</p>
                )}

                {validationErrors.quantity && (
                  <p className="gateway-error-msg">{validationErrors.quantity}</p>
                )}

                {validationErrors.email && (
                  <p className="gateway-error-msg">{validationErrors.email}</p>
                )}
              </div>

              {paymentStatus === 'PROCESSING' && (
                <section className="gateway-processing-panel" aria-live="polite">
                  <div className="gateway-processing-indicator" />
                  <div>
                    <h3>In progress</h3>
                    <p>
                      Recording transaction. No external gateway
                      or blockchain is being contacted.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="gateway-secondary-btn"
                    onClick={cancelProcessing}
                  >
                    Cancel attempt
                  </button>
                </section>
              )}

              {paymentStatus === 'ERROR' && (
                <section className="gateway-error-panel" role="alert">
                  <strong>Attempt not completed</strong>
                  <p>
                    Correct the highlighted information and try again. Any recorded
                    unsuccessful attempt remains available in the local transaction register.
                  </p>

                  <button
                    type="button"
                    className="gateway-secondary-btn"
                    onClick={() => {
                      setPaymentStatus('IDLE');
                      setValidationErrors({});
                    }}
                  >
                    Review details
                  </button>
                </section>
              )}
            </section>
          </div>
        )}

        <section className="gateway-transaction-history">
          <div className="gateway-section-heading">
            <div>
              <span className="gateway-eyebrow">AUDIT </span>
              <h2>Transaction register</h2>
              <p>Inspect, filter and export locally recorded demo attempts.</p>
            </div>

            <div className="gateway-history-actions">
              <button
                type="button"
                className="gateway-secondary-btn"
                onClick={exportTransactions}
              >
                Export CSV
              </button>

              <button
                type="button"
                className="gateway-secondary-btn"
                onClick={() => setShowHistory((current) => !current)}
                aria-expanded={showHistory}
              >
                {showHistory ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          {showHistory && (
            <>
              <div className="gateway-history-controls">
                <input
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder="Search ID, email, reference..."
                  aria-label="Search transaction history"
                />

                <select
                  value={historyFilter}
                  onChange={(event) => setHistoryFilter(event.target.value)}
                  aria-label="Filter transaction status"
                >
                  <option value="ALL">All statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="ERROR">Failed / cancelled</option>
                </select>

                <button
                  type="button"
                  className="gateway-secondary-btn"
                  onClick={clearHistory}
                >
                  Clear history
                </button>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="gateway-history-empty">
                  <span>▤</span>
                  <h3>No matching transactions</h3>
                  <p>Try another search term or change the status filter.</p>
                </div>
              ) : (
                <div className="gateway-history-table-wrap">
                  <table className="gateway-history-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <strong>{transaction.id}</strong>
                            <small>{transaction.orderId}</small>
                          </td>

                          <td>
                            {transaction.paymentMethod}
                            {transaction.cardBrand && (
                              <small>{transaction.cardBrand}</small>
                            )}
                          </td>

                          <td>{money(transaction.total, transaction.currency)}</td>

                          <td>
                            <span className={`gateway-transaction-status status-${transaction.status.toLowerCase()}`}>
                              {transaction.status}
                            </span>
                          </td>

                          <td>
                            {new Date(transaction.createdAt).toLocaleString()}
                          </td>

                          <td>
                            <div className="gateway-row-actions">
                              <button
                                type="button"
                                className="gateway-secondary-btn"
                                onClick={() => {
                                  setActiveTransactionId(transaction.id);
                                  setShowTransactionDetails(true);
                                }}
                              >
                                Details
                              </button>

                              {transaction.status !== 'SUCCESS' && (
                                <button
                                  type="button"
                                  className="gateway-secondary-btn"
                                  onClick={() => retryTransaction(transaction)}
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <section className="gateway-audit-timeline">
          <div className="gateway-section-heading">
            <div>
              <span className="gateway-eyebrow">EVENT OBSERVABILITY</span>
              <h2>Latest transaction </h2>
            </div>

            <span className="gateway-test-badge">EVENTS</span>
          </div>

          {activeTimelineTransaction ? (
            <div className="gateway-timeline-list">
              {(activeTimelineTransaction.timeline || []).map((event, index) => (
                <div className="gateway-timeline-item" key={`${event.label}-${index}`}>
                  <span className={`gateway-timeline-dot timeline-${event.status.toLowerCase()}`} />

                  <div>
                    <strong>{event.label}</strong>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>

                  <span className={`gateway-transaction-status status-${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="gateway-history-empty">
              <p>Select a transaction to inspect its events.</p>
            </div>
          )}
        </section>

        {showTransactionDetails && activeTransaction && (
          <div
            className="gateway-modal-overlay"
            onClick={() => setShowTransactionDetails(false)}
            role="presentation"
          >
            <section
              className="gateway-modal-card"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="gateway-transaction-details-title"
            >
              <div className="gateway-section-heading">
                <div>
                  <span className="gateway-eyebrow">TRANSACTION INSPECTOR</span>
                  <h2 id="gateway-transaction-details-title">
{activeTransaction.id}
                  </h2>
                </div>

                <button
                  type="button"
                  className="gateway-secondary-btn"
                  onClick={() => setShowTransactionDetails(false)}
                >
                  Close
                </button>
              </div>

              <div className="gateway-detail-grid">
                {[
                  ['Order ID', activeTransaction.orderId],
                  ['Payment reference', activeTransaction.paymentReference],
                  ['Status', activeTransaction.status],
                  ['Method', activeTransaction.paymentMethod],
                  ['Currency', activeTransaction.currency],
                  ['Total', money(activeTransaction.total, activeTransaction.currency)],
                  ['Customer', activeTransaction.customerName || 'Not provided'],
                  ['Email', activeTransaction.email || 'Not provided'],
                  ['Company', activeTransaction.company || 'Not provided'],
                  ['Country', activeTransaction.country || 'Not provided'],
                  ['Network', activeTransaction.paymentNetwork || 'Not applicable'],
                  ['Asset', activeTransaction.cryptoAsset || 'Not applicable'],
                  ['Card brand', activeTransaction.cardBrand || 'Not applicable'],
                  ['Masked card', activeTransaction.maskedCard || 'Not applicable'],
                  ['Discount', activeTransaction.discountCode || 'None'],
                  ['Mode', activeTransaction.mode],
                  ['Created at', new Date(activeTransaction.createdAt).toLocaleString()],
                  ['Updated at', new Date(activeTransaction.updatedAt).toLocaleString()]
                ].map(([label, value]) => (
                  <div className="gateway-detail-field" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="gateway-modal-actions">
                <button
                  type="button"
                  className="gateway-submit-trigger"
                  onClick={() => {
                    downloadFile(
                      createReceipt(activeTransaction),
                      `${activeTransaction.id}-demo-receipt.txt`
                    );
                    triggerToast('Demo receipt exported.');
                  }}
                >
                  Download Receipt
                </button>

                {activeTransaction.status !== 'SUCCESS' && (
                  <button
                    type="button"
                    className="gateway-secondary-btn"
                    onClick={() => retryTransaction(activeTransaction)}
                  >
                    Review for Retry
                  </button>
                )}
              </div>

              <p className="gateway-modal-disclaimer">
                This record is a frontend simulation and does not represent a verified
                payment, financial settlement, or blockchain transaction.
              </p>
            </section>
          </div>
        )}

        <section className="gateway-advanced-controls">
          <button
            type="button"
            className="gateway-section-toggle"
            onClick={() => setShowAdvanced((current) => !current)}
            aria-expanded={showAdvanced}
          >
            <span>
              <strong> controls</strong>
              <small> configuration and testing safeguards</small>
            </span>
            <span>{showAdvanced ? '−' : '+'}</span>
          </button>

          {showAdvanced && (
            <div className="gateway-advanced-body">
              <div className="gateway-advanced-row">
                <div>
                  <strong>Environment</strong>
                  <p>Real payment processing is not implemented in this page.</p>
                </div>

                <span className="gateway-test-badge">SIMULATION ONLY</span>
              </div>

              <div className="gateway-advanced-row">
                <div>
                  <strong>Demo processing</strong>
                  <p>Creates local status changes for interface testing.</p>
                </div>

                <label className="gateway-toggle-control">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(event) => setTestMode(event.target.checked)}
                    disabled={paymentStatus === 'PROCESSING'}
                  />
                  Enabled
                </label>
              </div>

              <div className="gateway-advanced-row">
                <div>
                  <strong>Data handling</strong>
                  <p>
                    Card number, expiry and security code are not written into the
                    transaction history or browser storage by this component.
                  </p>
                </div>
              </div>

              <div className="gateway-advanced-row">
                <div>
                  <strong>Keyboard shortcuts</strong>
                  <p>Escape closes the transaction inspector. Ctrl/Cmd + E exports transaction history.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="gateway-page-footer">
        <span>Payment Gateway</span>
        <span>Local demo data · No gateway integration</span>

        <button
          type="button"
          onClick={exportTransactions}
        >
          Export audit data
        </button>
      </footer>

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
    </div>
  );
}

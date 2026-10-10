import React, { useState } from 'react';
import './Page12_Checkout.css';

export default function Page12_Checkout({ setPage }) {
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD', 'CRYPTO', 'WIRE'
  const [cardName, setCardName] = useState('PRINCE OSINACHI');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  
  // Payment Execution & UI State
  const [paymentStatus, setPaymentStatus] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS, ERROR
  const [toastMessage, setToastMessage] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Merchant Crypto Wallet Address (Base / Ethereum Mainnet)
  const cryptoWalletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCardInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const parts = [];

    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }

    setCardNumber(parts.join(' '));
  };

  const handleExpiryInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);

    if (value.length >= 3) {
      setExpiry(`${value.substring(0, 2)} / ${value.substring(2)}`);
    } else {
      setExpiry(value);
    }
  };

  // Auto-detect Card Brand Network
  const detectCardBrand = () => {
    const firstDigit = cardNumber.replace(/\D/g, '')[0];
    if (firstDigit === '4') return 'VISA';
    if (firstDigit === '5') return 'MASTERCARD';
    if (firstDigit === '3') return 'AMEX';
    return 'GENERIC';
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard`);
  };

  const executePayment = (e) => {
    e.preventDefault();

    if (paymentMethod === 'CARD') {
      const digitsOnly = cardNumber.replace(/\D/g, '');
      const expiryMatch = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      const validExpiry = expiryMatch
        && Number(expiryMatch[1]) >= 1
        && Number(expiryMatch[1]) <= 12;
      const validCvc = /^\d{3}$/.test(cvc);

      if (digitsOnly.length !== 16 || !validExpiry || !validCvc) {
        setPaymentStatus('ERROR');
        triggerToast('⚠️ Card validation failed. Verify card parameters.');
        return;
      }
    }

    setPaymentStatus('PROCESSING');
    triggerToast('Initiating handshake with payment gateway settlement node...');

    // Simulate asynchronous gateway processing response
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
      triggerToast('✓ Transaction successfully authorized and committed.');
    }, 2500);
  };

  return (
    <div className="gateway-wrapper">
      <header className="gateway-top-bar">
        <button
          type="button"
          className="gateway-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Terminate Session
        </button>

        <span className="gateway-secure-tag">
          PAYMENT SIMULATION
        </span>
      </header>

      <main className="gateway-container">
        {paymentStatus === 'SUCCESS' ? (
          <div className="payment-alert success-state">
            <div className="success-badge-icon">✓</div>
            <h2 className="state-title">Demo Settlement Complete</h2>

            <p className="state-desc">
              Your simulated authorization was finalized on thread core-0.
              Transaction hash reference: <code>0x8f2a...e91c</code>. No real funds were deducted.
            </p>

            <div className="success-summary-card">
              <div><strong>Settlement Amount:</strong> $49.00 USD</div>
              <div><strong>Payment Method:</strong> {paymentMethod}</div>
              <div><strong>Status:</strong> COMPLETED & VERIFIED</div>
            </div>

            <button
              type="button"
              className="gateway-reset-btn"
              onClick={() => {
                setPaymentStatus('IDLE');
                setCardNumber('');
                setExpiry('');
                setCvc('');
              }}
            >
              Initialize New Settlement Session
            </button>
          </div>
        ) : (
          <div className="gateway-core-sheet">
            {/* Order Summary Block */}
            <div className="order-summary-box">
              <div className="summary-header-row">
                <span className="summary-title">API CORE LICENSE PROVISIONING</span>
                <button 
                  type="button"
                  className="toggle-itemization-btn" 
                  onClick={() => setShowOrderDetails(!showOrderDetails)}
                >
                  {showOrderDetails ? 'Hide Itemization ▲' : 'Inspect Itemization ▼'}
                </button>
              </div>

              <h1 className="summary-total">
                $49.00{' '}
                <span className="time-metric">
                  / single execute
                </span>
              </h1>

              {showOrderDetails && (
                <div className="order-itemization-drawer">
                  <div className="item-line"><span>Enterprise Core API License</span><span>$45.00</span></div>
                  <div className="item-line"><span>Network Gas / Processing Surcharge</span><span>$4.00</span></div>
                  <div className="item-line total-line"><span>Aggregate Due</span><span>$49.00</span></div>
                </div>
              )}

              <p className="state-desc">
                Demo checkout environment — no actual credit card or token charges will occur.
              </p>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="payment-method-tabs">
              <button
                type="button"
                className={`method-tab-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => { setPaymentMethod('CARD'); setPaymentStatus('IDLE'); }}
              >
                💳 Credit / Debit
              </button>
              <button
                type="button"
                className={`method-tab-btn ${paymentMethod === 'CRYPTO' ? 'active' : ''}`}
                onClick={() => { setPaymentMethod('CRYPTO'); setPaymentStatus('IDLE'); }}
              >
                🪙 Web3 Crypto
              </button>
              <button
                type="button"
                className={`method-tab-btn ${paymentMethod === 'WIRE' ? 'active' : ''}`}
                onClick={() => { setPaymentMethod('WIRE'); setPaymentStatus('IDLE'); }}
              >
                🏦 Bank Wire
              </button>
            </div>

            {/* Payment Method 1: Credit / Debit Card Form & Visualizer */}
            {paymentMethod === 'CARD' && (
              <form onSubmit={executePayment} className="gateway-card-form">
                {/* Interactive Card Visualizer */}
                <div className={`virtual-card-preview ${detectCardBrand().toLowerCase()}`}>
                  <div className="card-top-row">
                    <span className="chip-icon"></span>
                    <span className="brand-logo">{detectCardBrand()}</span>
                  </div>
                  <div className="card-number-display">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div className="card-bottom-row">
                    <div className="card-holder-block">
                      <span className="label-tiny">CARDHOLDER</span>
                      <span>{cardName || "PRINCE OSINACHI"}</span>
                    </div>
                    <div className="card-exp-block">
                      <span className="label-tiny">EXPIRES</span>
                      <span>{expiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="cardholder-name">
                    Cardholder Identification Name
                  </label>

                  <input
                    id="cardholder-name"
                    type="text"
                    placeholder="PRINCE OSINACHI"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    autoComplete="cc-name"
                    required
                    disabled={paymentStatus === 'PROCESSING'}
                  />
                </div>

                <div className="input-field-group">
                  <label htmlFor="card-number">
                    Credit Card Number Reference
                  </label>

                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardInput}
                    maxLength={19}
                    required
                    disabled={paymentStatus === 'PROCESSING'}
                  />
                </div>

                <div className="inline-input-matrix">
                  <div className="input-field-group">
                    <label htmlFor="card-expiry">
                      Expiration
                    </label>

                    <input
                      id="card-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      maxLength={7}
                      value={expiry}
                      onChange={handleExpiryInput}
                      required
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="card-cvc">
                      Secure CVC
                    </label>

                    <input
                      id="card-cvc"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="•••"
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => {
                        setCvc(
                          e.target.value.replace(/\D/g, '').substring(0, 3)
                        );
                      }}
                      required
                      disabled={paymentStatus === 'PROCESSING'}
                    />
                  </div>
                </div>

                {paymentStatus === 'ERROR' && (
                  <p className="gateway-error-msg" role="alert">
                    ⚠️ Validation Error:{' '}
                    <span className="struck-error-txt">
                      Check your card number, expiration month, and CVC.
                    </span>
                  </p>
                )}

                <button
                  type="submit"
                  className={`gateway-submit-trigger ${paymentStatus.toLowerCase()}`}
                  disabled={paymentStatus === 'PROCESSING'}
                >
                  {paymentStatus === 'PROCESSING'
                    ? 'Processing Authorization...'
                    : 'Authorize Transaction ($49.00)'}
                </button>
              </form>
            )}

            {/* Payment Method 2: Web3 Crypto Transfer */}
            {paymentMethod === 'CRYPTO' && (
              <div className="crypto-payment-box">
                <p className="crypto-instruct">
                  Transmit exactly <strong>49.00 USDC / USDT</strong> to the merchant treasury smart contract address below:
                </p>

                <div className="wallet-address-card">
                  <code>{cryptoWalletAddress}</code>
                  <button 
                    type="button"
                    className="copy-addr-btn" 
                    onClick={() => copyToClipboard(cryptoWalletAddress, 'Wallet Address')}
                  >
                    Copy 📋
                  </button>
                </div>

                <div className="network-pill-row">
                  <span className="network-tag">Base Mainnet</span>
                  <span className="network-tag">Ethereum</span>
                  <span className="network-tag">Polygon</span>
                </div>

                <button
                  type="button"
                  className="gateway-submit-trigger"
                  onClick={executePayment}
                  disabled={paymentStatus === 'PROCESSING'}
                >
                  {paymentStatus === 'PROCESSING'
                    ? 'Listening for On-Chain Event...'
                    : 'I Have Completed Deposit ($49.00)'}
                </button>
              </div>
            )}

            {/* Payment Method 3: Direct Bank Wire */}
            {paymentMethod === 'WIRE' && (
              <div className="wire-payment-box">
                <p className="wire-instruct">
                  Remit ACH / SWIFT transfer using the institutional instructions below:
                </p>

                <div className="wire-details-table">
                  <div><strong>Beneficiary Bank:</strong> Federal Reserve System / First Treasury</div>
                  <div><strong>Account Title:</strong> Corporate SaaS Treasury Inc.</div>
                  <div><strong>Routing (ABA):</strong> 021000021</div>
                  <div><strong>SWIFT / BIC:</strong> CHASUS33XXX</div>
                  <div><strong>Reference Code:</strong> REF-2026-1010</div>
                </div>

                <button
                  type="button"
                  className="gateway-submit-trigger"
                  onClick={executePayment}
                  disabled={paymentStatus === 'PROCESSING'}
                >
                  {paymentStatus === 'PROCESSING'
                    ? 'Awaiting Bank Clearance...'
                    : 'Confirm Wire Remittance'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom In-App Notification Toast */}
      {toastMessage && (
        <div className="custom-notification-toast">
          <span>● {toastMessage}</span>
        </div>
      )}
    </div>
  );
}

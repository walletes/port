import React, { useState } from 'react';
import './Page12_Checkout.css';

export default function Page12_Checkout({ setPage }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('IDLE');
  // IDLE, PROCESSING, SUCCESS, ERROR

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

  const executePayment = (e) => {
    e.preventDefault();

    const digitsOnly = cardNumber.replace(/\D/g, '');
    const expiryMatch = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    const validExpiry = expiryMatch
      && Number(expiryMatch[1]) >= 1
      && Number(expiryMatch[1]) <= 12;
    const validCvc = /^\d{3}$/.test(cvc);

    if (
      digitsOnly.length !== 16
      || !validExpiry
      || !validCvc
    ) {
      setPaymentStatus('ERROR');
      return;
    }

    setPaymentStatus('PROCESSING');

    // Simulate an asynchronous payment gateway response.
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
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
          STRIPE_MOCK_GATEWAY // TLS_1.3
        </span>
      </header>

      <main className="gateway-container">
        {paymentStatus === 'SUCCESS' ? (
          <div className="payment-alert success-state">
            <h2 className="state-title">Demo Transaction Complete</h2>

            <p className="state-desc">
              This simulated transaction completed successfully.
              No real payment was processed.
            </p>

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
              Initialize New Session
            </button>
          </div>
        ) : (
          <div className="gateway-core-sheet">
            <div className="order-summary-box">
              <span className="summary-title">
                API CORE LICENSE PROV
              </span>

              <h1 className="summary-total">
                $49.00{' '}
                <span className="time-metric">
                  / single execute
                </span>
              </h1>

              <p className="state-desc">
                Demo checkout — no actual payment will be taken.
              </p>
            </div>

            <form
              onSubmit={executePayment}
              className="gateway-card-form"
            >
              <div className="input-field-group">
                <label htmlFor="cardholder-name">
                  Cardholder Identification Name
                </label>

                <input
                  id="cardholder-name"
                  type="text"
                  placeholder="PRINCE OSINACHI"
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
                  ? 'Processing Demo Transaction...'
                  : 'Authorize Transaction'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

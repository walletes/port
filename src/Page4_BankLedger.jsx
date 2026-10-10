import React, { useState } from 'react';
import './Page4_BankLedger.css';

export default function Page4_BankLedger({ setPage }) {
  const [transactions, setTransactions] = useState([
    {
      id: "TX-401",
      description: "Cloud Infrastructure License",
      type: "debit",
      amount: 120.00,
      date: "2026-10-08",
      channel: "API billing"
    },
    {
      id: "TX-402",
      description: "Contract Invoicing Payout",
      type: "credit",
      amount: 1450.00,
      date: "2026-10-05",
      channel: "Direct deposit"
    },
    {
      id: "TX-403",
      description: "Domain Name Renewal",
      type: "debit",
      amount: 15.99,
      date: "2026-10-02",
      channel: "Stripe gate"
    }
  ]);

  // Let the JavaScript engine handle the ledger sums on the fly
  const currentBalance = transactions.reduce((acc, current) => {
    return current.type === 'credit'
      ? acc + current.amount
      : acc - current.amount;
  }, 3500.00);

  return (
    <div className="ledger-wrapper">
      <header className="ledger-header">
        <button
          className="exit-system-btn"
          onClick={() => setPage('home')}
        >
          ← Close Terminal
        </button>

        <span className="system-flag">
          LEDGER MODULE // VERIFIED SECURE
        </span>
      </header>

      <section className="balance-summary-section">
        <p className="summary-label">TOTAL AVAILABLE LIQUIDITY</p>

        <h1 className="balance-display">
          \${currentBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </h1>
      </section>

      <section className="ledger-table-section">
        <h2 className="table-heading">Historical Balance Entries</h2>

        {/* The browser calculates layout widths based on the matrix table container */}
        <div className="table-scroll-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>ID Reference</th>
                <th>Description / Scope</th>
                <th>Execution Date</th>
                <th>Payment Channel</th>
                <th className="text-right">Transaction Volume</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(item => (
                <tr key={item.id} className={item.type}>
                  <td className="font-mono">{item.id}</td>

                  <td>
                    <strong>{item.description}</strong>
                  </td>

                  <td>{item.date}</td>

                  <td>
                    <em>{item.channel}</em>
                  </td>

                  <td className={`text-right volume-cell ${item.type}`}>
                    {item.type === 'credit'
                      ? `+ $${item.amount.toFixed(2)}`
                      : `- $${item.amount.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

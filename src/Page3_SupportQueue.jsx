import React, { useState } from 'react';
import './Page3_SupportQueue.css';

export default function Page3_SupportQueue({ setPage }) {
  const [tickets, setTickets] = useState([
    {
      id: "TK-902",
      user: "alpha_mod",
      category: "Database",
      status: "Open",
      text: "Database cluster latency spiking over 400ms during routine batch sync loops.",
      priority: "High"
    },
    {
      id: "TK-711",
      user: "dev_sinachi",
      category: "API Gate",
      status: "Open",
      text: "Webhook payload structural integrity validation failure on payment hooks.",
      priority: "High"
    },
    {
      id: "TK-404",
      user: "user_kalu",
      category: "Auth Lock",
      status: "Closed",
      text: "Session expiration loop triggering false positives on mobile clients.",
      priority: "Low"
    }
  ]);

  const toggleResolve = (id) => {
    setTickets(tickets.map(t =>
      t.id === id
        ? { ...t, status: t.status === "Open" ? "Closed" : "Open" }
        : t
    ));
  };

  return (
    <div className="support-wrapper">
      <header className="support-header">
        <button
          className="nav-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Main System
        </button>

        <div className="header-meta">
          <h1 className="support-title">Enterprise Support Desk</h1>
          <p className="support-badge">TICKET QUEUE MONITOR</p>
        </div>
      </header>

      <main className="support-grid">
        {tickets.map(ticket => (
          <div
            key={ticket.id}
            className={`ticket-card ${ticket.status.toLowerCase()}`}
          >
            <div className="ticket-top">
              <span className="ticket-id">{ticket.id}</span>
              <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                {ticket.priority} Priority
              </span>
            </div>

            <p className="ticket-meta">
              User: <strong>{ticket.user}</strong> | Module: <em>{ticket.category}</em>
            </p>

            <p className="ticket-body">
              {ticket.status === "Closed" ? <del>{ticket.text}</del> : ticket.text}
            </p>

            <div className="ticket-actions">
              <span className="status-indicator">
                Status: <strong>{ticket.status}</strong>
              </span>

              <button
                className="resolve-toggle-btn"
                onClick={() => toggleResolve(ticket.id)}
              >
                {ticket.status === "Open" ? "Resolve Ticket" : "Reopen Issue"}
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

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
      priority: "High",
      timestamp: "12m ago"
    },
    {
      id: "TK-711",
      user: "dev_sinachi",
      category: "API Gate",
      status: "Open",
      text: "Webhook payload structural integrity validation failure on payment hooks.",
      priority: "High",
      timestamp: "45m ago"
    },
    {
      id: "TK-404",
      user: "user_kalu",
      category: "Auth Lock",
      status: "Closed",
      text: "Session expiration loop triggering false positives on mobile clients.",
      priority: "Low",
      timestamp: "2h ago"
    }
  ]);

  // Filtering and Search States
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New Ticket Form States
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState('');
  const [newCategory, setNewCategory] = useState('Database');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newText, setNewText] = useState('');

  const toggleResolve = (id) => {
    setTickets(tickets.map(t =>
      t.id === id
        ? { ...t, status: t.status === "Open" ? "Closed" : "Open" }
        : t
    ));
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newUser.trim() || !newText.trim()) return;

    const newTicket = {
      id: `TK-${Math.floor(100 + Math.random() * 900)}`,
      user: newUser.toLowerCase().replace(/\s+/g, '_'),
      category: newCategory,
      status: "Open",
      text: newText,
      priority: newPriority,
      timestamp: "Just now"
    };

    setTickets([newTicket, ...tickets]);
    setNewUser('');
    setNewText('');
    setIsCreating(false);
  };

  // Filter & Search Evaluation
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

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

      {/* Operations Telemetry Bar */}
      <div className="support-stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Tickets</span>
          <span className="stat-value">{tickets.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Open Issues</span>
          <span className="stat-value open-text">{openCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Resolved</span>
          <span className="stat-value resolved-text">{closedCount}</span>
        </div>
        <button
          className="create-ticket-btn"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "✕ Cancel" : "+ Log New Ticket"}
        </button>
      </div>

      {/* New Ticket Drawer Form */}
      {isCreating && (
        <form onSubmit={handleCreateTicket} className="create-ticket-form">
          <h3>File New Support Ticket</h3>
          <div className="form-row">
            <div className="form-field">
              <label>User Handle</label>
              <input
                type="text"
                placeholder="e.g. operator_alex"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Module / Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Database">Database</option>
                <option value="API Gate">API Gate</option>
                <option value="Auth Lock">Auth Lock</option>
                <option value="UI/UX Layout">UI/UX Layout</option>
                <option value="Billing">Billing</option>
              </select>
            </div>
            <div className="form-field">
              <label>Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Issue Description</label>
            <textarea
              rows="3"
              placeholder="Describe the operational incident or glitch..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-ticket-btn">
            Submit Incident Ticket
          </button>
        </form>
      )}

      {/* Control Filter & Search Toolbar */}
      <div className="support-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by ID, user, or incident keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-group">
          <div className="filter-item">
            <span>Status:</span>
            {['All', 'Open', 'Closed'].map(status => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="filter-item">
            <span>Priority:</span>
            {['All', 'High', 'Medium', 'Low'].map(priority => (
              <button
                key={priority}
                className={`filter-btn ${priorityFilter === priority ? 'active' : ''}`}
                onClick={() => setPriorityFilter(priority)}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="support-grid">
        {filteredTickets.length === 0 ? (
          <div className="empty-queue-message">
            <p>No tickets match the current filter criteria.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-card ${ticket.status.toLowerCase()}`}
            >
              <div className="ticket-top">
                <div className="ticket-id-group">
                  <span className="ticket-id">{ticket.id}</span>
                  <span className="ticket-timestamp">{ticket.timestamp}</span>
                </div>
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

                <div className="action-button-group">
                  <button
                    className="resolve-toggle-btn"
                    onClick={() => toggleResolve(ticket.id)}
                  >
                    {ticket.status === "Open" ? "Resolve Ticket" : "Reopen Issue"}
                  </button>
                  <button
                    className="delete-ticket-btn"
                    onClick={() => deleteTicket(ticket.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

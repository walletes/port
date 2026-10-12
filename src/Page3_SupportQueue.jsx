import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Page3_SupportQueue.css';

const STORAGE_KEY = 'portfolio-support-desk-v2';
const PAGE_SIZE = 8;
const SLA_HOURS = { High: 4, Medium: 12, Low: 24 };

const CATEGORIES = [
  'Database',
  'API Gate',
  'Auth Lock',
  'UI/UX Layout',
  'Billing',
  'Infrastructure',
  'Other'
];

const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
const TEAM_MEMBERS = ['Unassigned', 'Prince', 'Alex Morgan', 'Sarah Chen', 'Daniel Okafor'];

const makeActivity = (action, detail, actor = 'Prince') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  action,
  detail,
  actor,
  at: new Date().toISOString()
});

function createInitialTickets() {
  const now = Date.now();

  return [
    {
      id: 'TK-902',
      user: 'alpha_mod',
      category: 'Database',
      status: 'Open',
      text: 'Database cluster latency spiking over 400ms during routine batch sync loops.',
      priority: 'High',
      assignee: 'Unassigned',
      tags: ['latency', 'database'],
      createdAt: now - 12 * 60 * 1000,
      updatedAt: now - 12 * 60 * 1000,
      dueAt: now + 3 * 60 * 60 * 1000,
      notes: [],
      activity: [
        makeActivity('Ticket created', 'Initial support request recorded.', 'alpha_mod')
      ]
    },
    {
      id: 'TK-711',
      user: 'dev_sinachi',
      category: 'API Gate',
      status: 'In Progress',
      text: 'Webhook payload structural integrity validation failure on payment hooks.',
      priority: 'High',
      assignee: 'Prince',
      tags: ['webhook', 'payments'],
      createdAt: now - 45 * 60 * 1000,
      updatedAt: now - 20 * 60 * 1000,
      dueAt: now + 3 * 60 * 60 * 1000,
      notes: [],
      activity: [
        makeActivity('Ticket created', 'Initial support request recorded.', 'dev_sinachi'),
        makeActivity('Assigned', 'Assigned to Prince.', 'Prince'),
        makeActivity('Status changed', 'Moved to In Progress.', 'Prince')
      ]
    },
    {
      id: 'TK-404',
      user: 'user_kalu',
      category: 'Auth Lock',
      status: 'Resolved',
      text: 'Session expiration loop triggering false positives on mobile clients.',
      priority: 'Low',
      assignee: 'Sarah Chen',
      tags: ['authentication', 'mobile'],
      createdAt: now - 2 * 60 * 60 * 1000,
      updatedAt: now - 30 * 60 * 1000,
      dueAt: now + 22 * 60 * 60 * 1000,
      notes: [],
      activity: [
        makeActivity('Ticket created', 'Initial support request recorded.', 'user_kalu'),
        makeActivity('Assigned', 'Assigned to Sarah Chen.', 'Prince'),
        makeActivity('Status changed', 'Marked as resolved.', 'Sarah Chen')
      ]
    }
  ];
}

function normalizeTicket(ticket) {
  const now = Date.now();
  const createdAt = Number(ticket.createdAt) || now;
  const priority = PRIORITIES.includes(ticket.priority) ? ticket.priority : 'Medium';

  return {
    id: String(ticket.id || 'TK-100'),
    user: String(ticket.user || 'unknown_user'),
    category: CATEGORIES.includes(ticket.category) ? ticket.category : 'Other',
    status: STATUSES.includes(ticket.status) ? ticket.status : 'Open',
    text: String(ticket.text || ''),
    priority,
    assignee: TEAM_MEMBERS.includes(ticket.assignee) ? ticket.assignee : 'Unassigned',
    tags: Array.isArray(ticket.tags) ? ticket.tags.map(String).slice(0, 12) : [],
    createdAt,
    updatedAt: Number(ticket.updatedAt) || createdAt,
    dueAt: Number(ticket.dueAt) || createdAt + SLA_HOURS[priority] * 60 * 60 * 1000,
    notes: Array.isArray(ticket.notes) ? ticket.notes : [],
    activity: Array.isArray(ticket.activity) ? ticket.activity : []
  };
}

function loadTickets() {
  if (typeof window === 'undefined') return createInitialTickets();

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) return createInitialTickets();

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return createInitialTickets();

    return parsed.map(normalizeTicket);
  } catch {
    return createInitialTickets();
  }
}

function formatAge(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isFinished(ticket) {
  return ticket.status === 'Resolved' || ticket.status === 'Closed';
}

function isOverdue(ticket, now = Date.now()) {
  return !isFinished(ticket) && ticket.dueAt < now;
}

function getTimeRemaining(timestamp, now = Date.now()) {
  const difference = timestamp - now;

  if (difference <= 0) return 'Overdue';

  const hours = Math.floor(difference / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);

  if (hours >= 24) {
    return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`;
  }

  if (hours > 0) return `${hours}h ${minutes}m remaining`;

  return `${Math.max(1, minutes)}m remaining`;
}

function makeTicketId(tickets) {
  const used = new Set(
    tickets.map(ticket => Number(ticket.id.replace(/^TK-/, '')))
  );

  let number = 100;

  while (used.has(number)) number += 1;

  return `TK-${String(number).padStart(3, '0')}`;
}

function downloadCSV(tickets) {
  const headers = [
    'Ticket ID',
    'User',
    'Category',
    'Status',
    'Priority',
    'Assignee',
    'Description',
    'Tags',
    'Created At',
    'Updated At',
    'SLA Deadline'
  ];

  const escapeCell = value => {
    let text = String(value ?? '');

    if (/^[=+\-@\t\r]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = tickets.map(ticket => [
    ticket.id,
    ticket.user,
    ticket.category,
    ticket.status,
    ticket.priority,
    ticket.assignee,
    ticket.text,
    ticket.tags.join(', '),
    formatDate(ticket.createdAt),
    formatDate(ticket.updatedAt),
    formatDate(ticket.dueAt)
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `support-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ label, value, detail, icon, className = '' }) {
  return (
    <article className={`stat-card support-metric ${className}`}>
      <div className="support-metric-heading">
        <span className="stat-label">{label}</span>
        <span className="support-metric-icon" aria-hidden="true">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="support-metric-detail">{detail}</span>
    </article>
  );
}

function TicketField({ label, children, className = '' }) {
  return (
    <div className={`support-detail-field ${className}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function EmptyQueue({ hasFilters, onReset, onCreate }) {
  return (
    <section className="empty-queue-message support-empty-state">
      <span className="support-empty-icon" aria-hidden="true">⌕</span>
      <h3>{hasFilters ? 'No matching tickets' : 'Your queue is clear'}</h3>
      <p>
        {hasFilters
          ? 'Try changing the search or filters to find what you need.'
          : 'Create a ticket when a new support issue comes in.'}
      </p>
      {hasFilters ? (
        <button type="button" className="support-secondary-btn" onClick={onReset}>
          Clear filters
        </button>
      ) : (
        <button type="button" className="support-secondary-btn" onClick={onCreate}>
          Create a ticket
        </button>
      )}
    </section>
  );
}
export default function Page3_SupportQueue({ setPage }) {
  const [tickets, setTickets] = useState(loadTickets);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [slaFilter, setSlaFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [savedView, setSavedView] = useState('All Tickets');

  const [isCreating, setIsCreating] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState('Prince');

  const [newUser, setNewUser] = useState('');
  const [newCategory, setNewCategory] = useState('Database');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newAssignee, setNewAssignee] = useState('Unassigned');
  const [newTags, setNewTags] = useState('');
  const [newText, setNewText] = useState('');

  const [editUser, setEditUser] = useState('');
  const [editCategory, setEditCategory] = useState('Database');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editAssignee, setEditAssignee] = useState('Unassigned');
  const [editTags, setEditTags] = useState('');
  const [editText, setEditText] = useState('');

  const [noteText, setNoteText] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');
  const [undoTicket, setUndoTicket] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [tickets]);

  useEffect(() => {
    if (!undoTicket) return undefined;

    const timeout = window.setTimeout(() => setUndoTicket(null), 8000);
    return () => window.clearTimeout(timeout);
  }, [undoTicket]);

  const showNotice = useCallback((message, type = 'success') => {
    setNotice(message);
    setNoticeType(type);
  }, []);

  const updateTicket = useCallback((id, updater, activity) => {
    setTickets(current => current.map(ticket => {
      if (ticket.id !== id) return ticket;

      const updated = typeof updater === 'function'
        ? updater(ticket)
        : { ...ticket, ...updater };

      return {
        ...updated,
        updatedAt: Date.now(),
        activity: activity
          ? [...updated.activity, makeActivity(activity.action, activity.detail)]
          : updated.activity
      };
    }),);
  }, []);

  const openCount = tickets.filter(ticket => ticket.status === 'Open').length;
  const inProgressCount = tickets.filter(ticket => ticket.status === 'In Progress').length;
  const resolvedCount = tickets.filter(isFinished).length;
  const highPriorityCount = tickets.filter(
    ticket => ticket.priority === 'High' && !isFinished(ticket)
  ).length;
  const overdueCount = tickets.filter(ticket => isOverdue(ticket, now)).length;
  const unassignedCount = tickets.filter(
    ticket => ticket.assignee === 'Unassigned' && !isFinished(ticket)
  ).length;

  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId) || null;
  const editingTicket = tickets.find(ticket => ticket.id === editingTicketId) || null;

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tickets.filter(ticket => {
      let matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
      let matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
      let matchesCategory = categoryFilter === 'All' || ticket.category === categoryFilter;
      let matchesAssignee = assigneeFilter === 'All' || ticket.assignee === assigneeFilter;
      let matchesSLA = slaFilter === 'All' ||
        (slaFilter === 'Overdue' && isOverdue(ticket, now)) ||
        (slaFilter === 'Within SLA' && !isFinished(ticket) && !isOverdue(ticket, now));

      if (savedView === 'My Tickets') {
        matchesAssignee = ticket.assignee === 'Prince';
      } else if (savedView === 'Open Issues') {
        matchesStatus = ticket.status === 'Open';
      } else if (savedView === 'High Priority') {
        matchesPriority = ticket.priority === 'High' && !isFinished(ticket);
      } else if (savedView === 'Overdue') {
        matchesSLA = isOverdue(ticket, now);
      } else if (savedView === 'Unassigned') {
        matchesAssignee = ticket.assignee === 'Unassigned' && !isFinished(ticket);
      }

      const searchable = [
        ticket.id,
        ticket.user,
        ticket.text,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.assignee,
        ...ticket.tags,
        ...ticket.notes.map(note => note.text)
      ].join(' ').toLowerCase();

      return matchesStatus && matchesPriority && matchesCategory &&
        matchesAssignee && matchesSLA && (!query || searchable.includes(query));
    }).sort((a, b) => {
      if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
      if (sortOrder === 'updated') return b.updatedAt - a.updatedAt;
      if (sortOrder === 'sla') return a.dueAt - b.dueAt;

      if (sortOrder === 'priority') {
        const rank = { High: 0, Medium: 1, Low: 2 };
        return rank[a.priority] - rank[b.priority] || b.createdAt - a.createdAt;
      }

      return b.createdAt - a.createdAt;
    });
  }, [
    tickets,
    statusFilter,
    priorityFilter,
    categoryFilter,
    assigneeFilter,
    slaFilter,
    searchQuery,
    sortOrder,
    savedView,
    now
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const pageTickets = filteredTickets.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const visibleIds = pageTickets.map(ticket => ticket.id);
  const allVisibleSelected = visibleIds.length > 0 &&
    visibleIds.every(id => selectedIds.includes(id));

  const hasActiveFilters = statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    assigneeFilter !== 'All' ||
    slaFilter !== 'All' ||
    searchQuery.trim() !== '' ||
    savedView !== 'All Tickets';

  const resetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setAssigneeFilter('All');
    setSlaFilter('All');
    setSearchQuery('');
    setSortOrder('newest');
    setSavedView('All Tickets');
    setCurrentPage(1);
  };

  const applySavedView = view => {
    setSavedView(view);
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setAssigneeFilter('All');
    setSlaFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleResolve = id => {
    const ticket = tickets.find(item => item.id === id);
    if (!ticket) return;

    const nextStatus = ticket.status === 'Resolved' || ticket.status === 'Closed'
      ? 'Open'
      : 'Resolved';

    updateTicket(
      id,
      { status: nextStatus },
      {
        action: 'Status changed',
        detail: `Status changed from ${ticket.status} to ${nextStatus}.`
      }
    );

    showNotice(`${id} ${nextStatus === 'Resolved' ? 'resolved' : 'reopened'}.`);
  };

  const changeStatus = (id, status) => {
    const ticket = tickets.find(item => item.id === id);
    if (!ticket || ticket.status === status) return;

    updateTicket(id, { status }, {
      action: 'Status changed',
      detail: `Status changed from ${ticket.status} to ${status}.`
    });

    showNotice(`${id} status updated to ${status}.`);
  };

  const changePriority = (id, priority) => {
    const ticket = tickets.find(item => item.id === id);
    if (!ticket || ticket.priority === priority) return;

    updateTicket(id, current => ({
      ...current,
      priority,
      dueAt: current.createdAt + SLA_HOURS[priority] * 3600000
    }), {
      action: 'Priority changed',
      detail: `Priority changed from ${ticket.priority} to ${priority}. SLA deadline recalculated.`
    });

    showNotice(`${id} priority changed to ${priority}.`);
  };

  const assignTicket = (id, assignee) => {
    const ticket = tickets.find(item => item.id === id);
    if (!ticket || ticket.assignee === assignee) return;

    updateTicket(id, { assignee }, {
      action: 'Assignment changed',
      detail: `Assigned to ${assignee}.`
    });

    showNotice(`${id} assigned to ${assignee}.`);
  };

  const beginEdit = ticket => {
    setEditingTicketId(ticket.id);
    setEditUser(ticket.user);
    setEditCategory(ticket.category);
    setEditPriority(ticket.priority);
    setEditAssignee(ticket.assignee);
    setEditTags(ticket.tags.join(', '));
    setEditText(ticket.text);
  };

  const saveEdit = event => {
    event.preventDefault();

    if (!editingTicket) return;

    const user = editUser.trim().replace(/^@+/, '');
    const description = editText.trim();

    if (!user || !description) {
      showNotice('User handle and issue description are required.', 'error');
      return;
    }

    const tags = [...new Set(
      editTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
    )].slice(0, 12);

    updateTicket(editingTicket.id, current => ({
      ...current,
      user: user.toLowerCase().replace(/\s+/g, '_'),
      category: editCategory,
      priority: editPriority,
      assignee: editAssignee,
      tags,
      text: description,
      dueAt: current.createdAt + SLA_HOURS[editPriority] * 3600000
    }), {
      action: 'Ticket edited',
      detail: 'Ticket description, category, priority or assignment was updated.'
    });

    setEditingTicketId(null);
    showNotice(`${editingTicket.id} updated successfully.`);
  };

  const handleCreateTicket = event => {
    event.preventDefault();

    const user = newUser.trim().replace(/^@+/, '');
    const description = newText.trim();

    if (!user || !description) {
      showNotice('Enter a user handle and issue description.', 'error');
      return;
    }

    const createdAt = Date.now();
    const tags = [...new Set(
      newTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
    )].slice(0, 12);

    const ticket = {
      id: makeTicketId(tickets),
      user: user.toLowerCase().replace(/\s+/g, '_'),
      category: newCategory,
      status: 'Open',
      text: description,
      priority: newPriority,
      assignee: newAssignee,
      tags,
      createdAt,
      updatedAt: createdAt,
      dueAt: createdAt + SLA_HOURS[newPriority] * 3600000,
      notes: [],
      activity: [
        makeActivity('Ticket created', 'Support ticket submitted.', user)
      ]
    };

    setTickets(current => [ticket, ...current]);
    setNewUser('');
    setNewCategory('Database');
    setNewPriority('Medium');
    setNewAssignee('Unassigned');
    setNewTags('');
    setNewText('');
    setIsCreating(false);
    setSelectedIds([]);
    setCurrentPage(1);
    resetFilters();
    showNotice(`${ticket.id} created successfully.`);
  };
const requestDelete = id => setConfirmDelete(id);

  const deleteTicket = () => {
    if (!confirmDelete) return;

    const ticket = tickets.find(item => item.id === confirmDelete);
    if (!ticket) {
      setConfirmDelete(null);
      return;
    }

    setUndoTicket(ticket);
    setTickets(current => current.filter(item => item.id !== confirmDelete));
    setSelectedIds(current => current.filter(id => id !== confirmDelete));

    if (selectedTicketId === confirmDelete) setSelectedTicketId(null);
    if (editingTicketId === confirmDelete) setEditingTicketId(null);

    showNotice(`${confirmDelete} deleted. You can undo this action for 8 seconds.`);
    setConfirmDelete(null);
  };

  const undoDelete = () => {
    if (!undoTicket) return;

    setTickets(current => {
      if (current.some(ticket => ticket.id === undoTicket.id)) return current;
      return [...current, undoTicket].sort((a, b) => b.createdAt - a.createdAt);
    });

    showNotice(`${undoTicket.id} restored.`);
    setUndoTicket(null);
  };

  const toggleSelected = id => {
    setSelectedIds(current =>
      current.includes(id)
        ? current.filter(selectedId => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleSelectVisible = () => {
    setSelectedIds(current => allVisibleSelected
      ? current.filter(id => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])]
    );
  };

  const runBulkAction = action => {
    if (!selectedIds.length) return;

    const ids = new Set(selectedIds);
    const detail = {
      resolve: 'Resolved through bulk action.',
      reopen: 'Reopened through bulk action.',
      assign: `Assigned to ${bulkAssignee} through bulk action.`,
      delete: 'Deleted through bulk action.'
    }[action];

    if (action === 'delete') {
      const count = selectedIds.length;
      setTickets(current => current.filter(ticket => !ids.has(ticket.id)));
      setSelectedIds([]);
      showNotice(`${count} selected tickets deleted.`);
      return;
    }

    setTickets(current => current.map(ticket => {
      if (!ids.has(ticket.id)) return ticket;

      let changes = {};

      if (action === 'resolve') changes.status = 'Resolved';
      if (action === 'reopen') changes.status = 'Open';
      if (action === 'assign') changes.assignee = bulkAssignee;

      return {
        ...ticket,
        ...changes,
        updatedAt: Date.now(),
        activity: [...ticket.activity, makeActivity('Bulk update', detail)]
      };
    }));

    showNotice(`${selectedIds.length} tickets updated.`);
    setSelectedIds([]);
  };

  const addInternalNote = event => {
    event.preventDefault();

    const text = noteText.trim();

    if (!selectedTicket || !text) {
      showNotice('Write a note before submitting.', 'error');
      return;
    }

    const note = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      author: 'Prince',
      createdAt: Date.now()
    };

    updateTicket(selectedTicket.id, ticket => ({
      ...ticket,
      notes: [...ticket.notes, note]
    }), {
      action: 'Internal note added',
      detail: 'An internal note was added to the ticket.'
    });

    setNoteText('');
    showNotice('Internal note added.');
  };

  const exportTickets = () => {
    try {
      downloadCSV(filteredTickets);
      showNotice(`Exported ${filteredTickets.length} tickets to CSV.`);
    } catch {
      showNotice('CSV export failed in this browser.', 'error');
    }
  };

  return (
    <div className="support-wrapper">
      <header className="support-header">
        <button
          type="button"
          className="nav-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Main System
        </button>

        <div className="header-meta">
          <p className="support-badge">SUPPORT OPERATIONS / TICKET MANAGEMENT</p>
          <h1 className="support-title">Enterprise Support Desk</h1>
          <p className="support-subtitle">
            Track incidents, manage ownership and keep support work moving.
          </p>
        </div>

        <div className="support-environment-badge">
          <span className="support-status-dot" aria-hidden="true" />
          Local demo
        </div>
      </header>

      {!storageAvailable && (
        <div className="support-notice error" role="status">
          Browser storage is unavailable. Changes may not survive a refresh.
        </div>
      )}

      {notice && (
        <div className={`support-notice ${noticeType}`} role="status" aria-live="polite">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">
            ×
          </button>
        </div>
      )}

      <section className="support-overview">
        <div className="support-section-heading">
          <div>
            <span className="support-eyebrow">QUEUE OVERVIEW</span>
            <h2>Support at a glance</h2>
          </div>
          <span className="support-total-label">
            {tickets.length} recorded {tickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>

        <div className="support-stats-row">
          <MetricCard
            label="Total tickets"
            value={tickets.length}
            detail="All recorded incidents"
            icon="▤"
          />
          <MetricCard
            label="Open issues"
            value={openCount}
            detail={`${inProgressCount} currently in progress`}
            icon="◷"
            className="open-text"
          />
          <MetricCard
            label="Resolved"
            value={resolvedCount}
            detail="Resolved or closed"
            icon="✓"
            className="resolved-text"
          />
          <MetricCard
            label="High priority"
            value={highPriorityCount}
            detail={`${overdueCount} overdue · ${unassignedCount} unassigned`}
            icon="!"
          />
        </div>
      </section>

      <section className="support-workspace">
        <div className="support-section-heading support-queue-heading">
          <div>
            <span className="support-eyebrow">INCIDENT MANAGEMENT</span>
            <h2>Ticket queue</h2>
            <p>Search, prioritise, assign and resolve support requests.</p>
          </div>

          <div className="support-header-actions">
            <button type="button" className="support-secondary-btn" onClick={exportTickets}>
              Export CSV
            </button>
            <button
              type="button"
              className="create-ticket-btn"
              onClick={() => setIsCreating(current => !current)}
              aria-expanded={isCreating}
              aria-controls="support-create-form"
            >
              {isCreating ? '× Cancel' : '+ Log new ticket'}
            </button>
          </div>
        </div>

        <div className="support-saved-views" aria-label="Saved ticket views">
          <span className="support-control-label">Saved views</span>
          {[
            'All Tickets',
            'My Tickets',
            'Open Issues',
            'High Priority',
            'Overdue',
            'Unassigned'
          ].map(view => (
            <button
              key={view}
              type="button"
              className={`support-view-btn ${savedView === view ? 'active' : ''}`}
              aria-pressed={savedView === view}
              onClick={() => applySavedView(view)}
            >
              {view}
            </button>
          ))}
        </div>
     {isCreating && (
          <form
            id="support-create-form"
            onSubmit={handleCreateTicket}
            className="create-ticket-form support-enhanced-form"
          >
            <div className="support-form-heading">
              <div>
                <span className="support-eyebrow">NEW INCIDENT</span>
                <h3>File a support ticket</h3>
              </div>
              <span className="support-form-note">Required fields marked below</span>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="new-ticket-user">User handle *</label>
                <input
                  id="new-ticket-user"
                  value={newUser}
                  onChange={event => setNewUser(event.target.value)}
                  placeholder="e.g. operator_alex"
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-ticket-category">Category</label>
                <select
                  id="new-ticket-category"
                  value={newCategory}
                  onChange={event => setNewCategory(event.target.value)}
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="new-ticket-priority">Priority</label>
                <select
                  id="new-ticket-priority"
                  value={newPriority}
                  onChange={event => setNewPriority(event.target.value)}
                >
                  {PRIORITIES.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="new-ticket-assignee">Assign to</label>
                <select
                  id="new-ticket-assignee"
                  value={newAssignee}
                  onChange={event => setNewAssignee(event.target.value)}
                >
                  {TEAM_MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="new-ticket-tags">Tags</label>
              <input
                id="new-ticket-tags"
                value={newTags}
                onChange={event => setNewTags(event.target.value)}
                placeholder="payments, webhook, production (comma-separated)"
                maxLength={200}
              />
            </div>

            <div className="form-field">
              <label htmlFor="new-ticket-description">Issue description *</label>
              <textarea
                id="new-ticket-description"
                rows={4}
                value={newText}
                onChange={event => setNewText(event.target.value)}
                placeholder="Describe the issue, impact and observed behaviour..."
                maxLength={2000}
                required
              />
              <span className="support-character-count">{newText.length}/2000</span>
            </div>

            <div className="support-form-actions">
              <button
                type="button"
                className="support-secondary-btn"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
              <button type="submit" className="submit-ticket-btn">
                Create ticket →
              </button>
            </div>
          </form>
        )}

        {editingTicket && (
          <form className="create-ticket-form support-enhanced-form" onSubmit={saveEdit}>
            <div className="support-form-heading">
              <div>
                <span className="support-eyebrow">EDIT TICKET</span>
                <h3>{editingTicket.id}</h3>
              </div>
              <button
                type="button"
                className="support-secondary-btn"
                onClick={() => setEditingTicketId(null)}
              >
                Cancel editing
              </button>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="edit-ticket-user">User handle</label>
                <input
                  id="edit-ticket-user"
                  value={editUser}
                  onChange={event => setEditUser(event.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-ticket-category">Category</label>
                <select
                  id="edit-ticket-category"
                  value={editCategory}
                  onChange={event => setEditCategory(event.target.value)}
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="edit-ticket-priority">Priority</label>
                <select
                  id="edit-ticket-priority"
                  value={editPriority}
                  onChange={event => setEditPriority(event.target.value)}
                >
                  {PRIORITIES.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="edit-ticket-assignee">Assignee</label>
                <select
                  id="edit-ticket-assignee"
                  value={editAssignee}
                  onChange={event => setEditAssignee(event.target.value)}
                >
                  {TEAM_MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="edit-ticket-tags">Tags</label>
              <input
                id="edit-ticket-tags"
                value={editTags}
                onChange={event => setEditTags(event.target.value)}
                placeholder="Comma-separated tags"
                maxLength={200}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-ticket-description">Issue description</label>
              <textarea
                id="edit-ticket-description"
                rows={4}
                value={editText}
                onChange={event => setEditText(event.target.value)}
                maxLength={2000}
                required
              />
            </div>

            <div className="support-form-actions">
              <button
                type="button"
                className="support-secondary-btn"
                onClick={() => setEditingTicketId(null)}
              >
                Cancel
              </button>
              <button type="submit" className="submit-ticket-btn">
                Save changes
              </button>
            </div>
          </form>
        )}

        <div className="support-controls support-advanced-controls">
          <div className="support-search-wrap">
            <label htmlFor="support-search">Search tickets</label>
            <span className="support-search-icon" aria-hidden="true">⌕</span>
            <input
              id="support-search"
              type="search"
              className="search-input"
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="ID, user, description, assignee or tag..."
            />
          </div>

          <div className="support-filter-selects">
            <div className="form-field">
              <label htmlFor="support-category-filter">Category</label>
              <select
                id="support-category-filter"
                value={categoryFilter}
                onChange={event => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="support-assignee-filter">Assignee</label>
              <select
                id="support-assignee-filter"
                value={assigneeFilter}
                onChange={event => {
                  setAssigneeFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All assignees</option>
                {TEAM_MEMBERS.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="support-sla-filter">SLA</label>
              <select
                id="support-sla-filter"
                value={slaFilter}
                onChange={event => {
                  setSlaFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All SLA states</option>
                <option value="Within SLA">Within SLA</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="support-sort">Sort by</label>
              <select
                id="support-sort"
                value={sortOrder}
                onChange={event => setSortOrder(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="updated">Recently updated</option>
                <option value="priority">Priority</option>
                <option value="sla">SLA deadline</option>
              </select>
            </div>
          </div>

          <div className="support-filter-row">
            <div className="filter-item">
              <span>Status</span>
              {['All', ...STATUSES].map(status => (
                <button
                  key={status}
                  type="button"
                  className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                  aria-pressed={statusFilter === status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="filter-item">
              <span>Priority</span>
              {['All', ...PRIORITIES].map(priority => (
                <button
                  key={priority}
                  type="button"
                  className={`filter-btn ${priorityFilter === priority ? 'active' : ''}`}
                  aria-pressed={priorityFilter === priority}
                  onClick={() => {
                    setPriorityFilter(priority);
                    setCurrentPage(1);
                  }}
                >
                  {priority}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="support-clear-filters"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="support-results-bar">
          <span>
            Showing <strong>{pageTickets.length}</strong> of{' '}
            <strong>{filteredTickets.length}</strong> matching tickets
          </span>
          <button type="button" className="support-export-inline" onClick={exportTickets}>
            Export filtered results ↓
          </button>
        </div>

        {selectedIds.length > 0 && (
          <section className="support-bulk-toolbar" aria-label="Bulk ticket actions">
            <div>
              <strong>{selectedIds.length} selected</strong>
              <button
                type="button"
                className="support-clear-selection"
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </button>
            </div>

            <div className="support-bulk-actions">
              <button type="button" onClick={() => runBulkAction('resolve')}>
                Resolve
              </button>
              <button type="button" onClick={() => runBulkAction('reopen')}>
                Reopen
              </button>
              <select
                aria-label="Assignee for bulk assignment"
                value={bulkAssignee}
                onChange={event => setBulkAssignee(event.target.value)}
              >
                {TEAM_MEMBERS.filter(member => member !== 'Unassigned').map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              <button type="button" onClick={() => runBulkAction('assign')}>
                Assign
              </button>
              <button type="button" onClick={() => runBulkAction('delete')}>
                Delete selected
              </button>
            </div>
          </section>
        )}
      <main className="support-grid">
          {pageTickets.length === 0 ? (
            <EmptyQueue
              hasFilters={hasActiveFilters || tickets.length > 0}
              onReset={resetFilters}
              onCreate={() => setIsCreating(true)}
            />
          ) : (
            pageTickets.map(ticket => {
              const overdue = isOverdue(ticket, now);
              const finished = isFinished(ticket);

              return (
                <article
                  key={ticket.id}
                  className={`ticket-card ${ticket.status.toLowerCase().replace(/\s+/g, '-')} ${overdue ? 'overdue' : ''}`}
                >
                  <div className="ticket-top">
                    <label className="support-ticket-select">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ticket.id)}
                        onChange={() => toggleSelected(ticket.id)}
                        aria-label={`Select ${ticket.id}`}
                      />
                      <span>{ticket.id}</span>
                    </label>

                    <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                      {ticket.priority} priority
                    </span>
                  </div>

                  <div className="support-ticket-title-row">
                    <span className="support-category-label">{ticket.category}</span>
                    <span className={`support-ticket-status ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="support-status-dot" aria-hidden="true" />
                      {ticket.status}
                    </span>
                  </div>

                  <p className="ticket-meta">
                    Reported by <strong>{ticket.user}</strong>
                  </p>

                  <p className="ticket-body">{ticket.text}</p>

                  <div className="support-ticket-tags">
                    {ticket.tags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className="support-tag"
                        onClick={() => {
                          setSearchQuery(tag);
                          setCurrentPage(1);
                        }}
                        aria-label={`Search tickets tagged ${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <div className="support-ticket-owner">
                    <span className="support-avatar" aria-hidden="true">
                      {ticket.assignee === 'Unassigned'
                        ? '?'
                        : ticket.assignee.charAt(0).toUpperCase()}
                    </span>
                    <div className="support-owner-copy">
                      <span className="support-owner-label">Assigned to</span>
                      <select
                        value={ticket.assignee}
                        onChange={event => assignTicket(ticket.id, event.target.value)}
                        aria-label={`Assign ${ticket.id}`}
                      >
                        {TEAM_MEMBERS.map(member => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={`support-sla ${overdue ? 'overdue' : ''}`}>
                    <span>SLA deadline</span>
                    <strong>
                      {finished ? 'Completed' : getTimeRemaining(ticket.dueAt, now)}
                    </strong>
                  </div>

                  <div className="support-ticket-quick-controls">
                    <label htmlFor={`status-${ticket.id}`}>Status</label>
                    <select
                      id={`status-${ticket.id}`}
                      value={ticket.status}
                      onChange={event => changeStatus(ticket.id, event.target.value)}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>

                    <label htmlFor={`priority-${ticket.id}`}>Priority</label>
                    <select
                      id={`priority-${ticket.id}`}
                      value={ticket.priority}
                      onChange={event => changePriority(ticket.id, event.target.value)}
                    >
                      {PRIORITIES.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ticket-actions">
                    <button
                      type="button"
                      className="support-details-btn"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      Details · {ticket.activity.length + ticket.notes.length}
                    </button>

                    <div className="action-button-group">
                      <button
                        type="button"
                        className="resolve-toggle-btn"
                        onClick={() => toggleResolve(ticket.id)}
                      >
                        {finished ? 'Reopen' : 'Resolve'}
                      </button>
                      <button
                        type="button"
                        className="delete-ticket-btn"
                        onClick={() => requestDelete(ticket.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="support-ticket-updated">
                    Updated {formatAge(ticket.updatedAt)}
                  </div>
                </article>
              );
            })
          )}
        </main>

        {filteredTickets.length > PAGE_SIZE && (
          <nav className="support-pagination" aria-label="Ticket pages">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            >
              ← Previous
            </button>

            <span>
              Page <strong>{safePage}</strong> of <strong>{pageCount}</strong>
            </span>

            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))}
            >
              Next →
            </button>
          </nav>
        )}
      </section>

      {selectedTicket && (
        <div
          className="support-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedTicketId(null);
          }}
        >
          <section
            className="support-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-detail-title"
          >
            <div className="support-modal-header">
              <div>
                <span className="support-eyebrow">TICKET RECORD</span>
                <h2 id="support-detail-title">{selectedTicket.id}</h2>
              </div>
              <button
                type="button"
                className="support-modal-close"
                onClick={() => setSelectedTicketId(null)}
                aria-label="Close ticket details"
              >
                ×
              </button>
            </div>

            <div className="support-detail-badges">
              <span className={`priority-tag ${selectedTicket.priority.toLowerCase()}`}>
                {selectedTicket.priority} priority
              </span>
              <span className={`support-ticket-status ${selectedTicket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {selectedTicket.status}
              </span>
            </div>

            <p className="support-detail-description">{selectedTicket.text}</p>

            <dl className="support-detail-list">
              <TicketField label="Reported by">{selectedTicket.user}</TicketField>
              <TicketField label="Category">{selectedTicket.category}</TicketField>
              <TicketField label="Assignee">{selectedTicket.assignee}</TicketField>
              <TicketField label="Created">{formatDate(selectedTicket.createdAt)}</TicketField>
              <TicketField label="Last updated">{formatDate(selectedTicket.updatedAt)}</TicketField>
              <TicketField label="SLA deadline">{formatDate(selectedTicket.dueAt)}</TicketField>
              <TicketField label="SLA status">
                {isFinished(selectedTicket)
                  ? 'Completed'
                  : isOverdue(selectedTicket, now)
                    ? 'Overdue'
                    : getTimeRemaining(selectedTicket.dueAt, now)}
              </TicketField>
              <TicketField label="Tags">
                {selectedTicket.tags.length ? selectedTicket.tags.join(', ') : 'No tags'}
              </TicketField>
            </dl>

            <div className="support-notes-section">
              <div className="support-section-heading">
                <div>
                  <span className="support-eyebrow">TEAM COLLABORATION</span>
                  <h3>Internal notes</h3>
                </div>
                <span>{selectedTicket.notes.length} notes</span>
              </div>

              {selectedTicket.notes.length === 0 ? (
                <p className="support-muted-copy">No internal notes have been added.</p>
              ) : (
                <div className="support-notes-list">
                  {selectedTicket.notes.map(note => (
                    <article key={note.id} className="support-note">
                      <div className="support-note-meta">
                        <strong>{note.author}</strong>
                        <time dateTime={new Date(note.createdAt).toISOString()}>
                          {formatDate(note.createdAt)}
                        </time>
                      </div>
                      <p>{note.text}</p>
                    </article>
                  ))}
                </div>
              )}

              <form onSubmit={addInternalNote} className="support-note-form">
                <label htmlFor="support-internal-note">Add an internal note</label>
                <textarea
                  id="support-internal-note"
                  rows={3}
                  value={noteText}
                  onChange={event => setNoteText(event.target.value)}
                  placeholder="Record investigation findings or the next action..."
                  maxLength={1000}
                  required
                />
                <button type="submit" className="submit-ticket-btn">
                  Add note
                </button>
              </form>
            </div>

            <div className="support-activity-section">
              <div className="support-section-heading">
                <div>
                  <span className="support-eyebrow">AUDIT TRAIL</span>
                  <h3>Activity history</h3>
                </div>
                <span>{selectedTicket.activity.length} events</span>
              </div>

              {selectedTicket.activity.length === 0 ? (
                <p className="support-muted-copy">No activity has been recorded.</p>
              ) : (
                <ol className="support-activity-list">
                  {[...selectedTicket.activity].reverse().map(item => (
                    <li key={item.id} className="support-activity-item">
                      <span className="support-activity-marker" aria-hidden="true" />
                      <div>
                        <strong>{item.action}</strong>
                        <p>{item.detail}</p>
                        <span>{item.actor} · {formatDate(new Date(item.at).getTime())}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="support-modal-actions">
              <button
                type="button"
                className="support-secondary-btn"
                onClick={() => {
                  beginEdit(selectedTicket);
                  setSelectedTicketId(null);
                }}
              >
                Edit ticket
              </button>

              <button
                type="button"
                className="resolve-toggle-btn"
                onClick={() => toggleResolve(selectedTicket.id)}
              >
                {isFinished(selectedTicket) ? 'Reopen ticket' : 'Resolve ticket'}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmDelete && (
        <div
          className="support-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setConfirmDelete(null);
          }}
        >
          <section
            className="support-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="support-delete-title"
            aria-describedby="support-delete-description"
          >
            <span className="support-eyebrow">CONFIRM ACTION</span>
            <h2 id="support-delete-title">Delete {confirmDelete}?</h2>
            <p id="support-delete-description">
              This removes the ticket from the active queue. You can restore it
              for a short time after deletion.
            </p>
            <div className="support-modal-actions">
              <button
                type="button"
                className="support-secondary-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-ticket-btn"
                onClick={deleteTicket}
              >
                Delete ticket
              </button>
            </div>
          </section>
        </div>
      )}
      {undoTicket && (
        <div className="support-undo-bar" role="status">
          <span>{undoTicket.id} deleted.</span>
          <button type="button" onClick={undoDelete}>Undo</button>
          <button
            type="button"
            onClick={() => setUndoTicket(null)}
            aria-label="Dismiss undo option"
          >
            ×
          </button>
        </div>
      )}

      <footer className="support-footer">
        <span>Support Operations</span>
        <span>Frontend demo · Local browser storage · No live backend connected</span>
      </footer>
    </div>
  );
}

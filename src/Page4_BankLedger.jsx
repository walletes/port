import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Page4_BankLedger.css';

const STORAGE_KEY = 'corporate_treasury_ledger_v2';
const AUDIT_STORAGE_KEY = 'corporate_treasury_audit_v2';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TX-401',
    description: 'Cloud Infrastructure License',
    type: 'debit',
    amount: 120,
    date: '2026-10-08',
    channel: 'API billing',
    status: 'Settled',
    createdAt: '2026-10-08T10:30:00.000Z',
    updatedAt: '2026-10-08T10:30:00.000Z',
    reference: 'REF-CLOUD-401',
    notes: 'Monthly cloud infrastructure subscription',
  },
  {
    id: 'TX-402',
    description: 'Contract Invoicing Payout',
    type: 'credit',
    amount: 1450,
    date: '2026-10-05',
    channel: 'Direct deposit',
    status: 'Settled',
    createdAt: '2026-10-05T14:20:00.000Z',
    updatedAt: '2026-10-05T14:20:00.000Z',
    reference: 'REF-PAYOUT-402',
    notes: 'Contract development payment',
  },
  {
    id: 'TX-403',
    description: 'Domain Name Renewal',
    type: 'debit',
    amount: 15.99,
    date: '2026-10-02',
    channel: 'Stripe gateway',
    status: 'Settled',
    createdAt: '2026-10-02T09:15:00.000Z',
    updatedAt: '2026-10-02T09:15:00.000Z',
    reference: 'REF-DOMAIN-403',
    notes: 'Annual domain renewal',
  },
];

const FX_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  BTC: 0.000015,
};

const FX_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BTC: '₿',
};

const TRANSACTION_STATUSES = [
  'Pending',
  'Processing',
  'Settled',
  'Failed',
  'Reversed',
];

const PAYMENT_CHANNELS = [
  'Direct Deposit',
  'API Billing',
  'Stripe Gateway',
  'Wire Transfer',
  'Bank Transfer',
  'Digital Wallet',
  'Other',
];

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);

    if (!stored) return fallback;

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function createTransactionId(existingTransactions) {
  const existingIds = new Set(existingTransactions.map((tx) => tx.id));
  let id;

  do {
    const randomPart =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()
        : `${Date.now().toString(36).toUpperCase()}${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`;

    id = `TX-${randomPart}`;
  } while (existingIds.has(id));

  return id;
}

function escapeCSV(value) {
  const normalized = String(value ?? '');

  return `"${normalized.replace(/"/g, '""')}"`;
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function Page4_BankLedger({ setPage }) {
  const [transactions, setTransactions] = useState(() =>
    readStorage(STORAGE_KEY, INITIAL_TRANSACTIONS)
  );

  const [auditLog, setAuditLog] = useState(() =>
    readStorage(AUDIT_STORAGE_KEY, [])
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currency, setCurrency] = useState('USD');

  const [selectedIds, setSelectedIds] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [notification, setNotification] = useState(null);
  const [syncStatus, setSyncStatus] = useState('DEMO');

  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState('debit');
  const [newChannel, setNewChannel] = useState('Direct Deposit');
  const [newStatus, setNewStatus] = useState('Settled');
  const [newDate, setNewDate] = useState(getToday());
  const [newNotes, setNewNotes] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      setNotification({
        type: 'error',
        message: 'Unable to save ledger data in this browser.',
      });
    }
  }, [transactions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        AUDIT_STORAGE_KEY,
        JSON.stringify(auditLog)
      );
    } catch {
      setNotification({
        type: 'error',
        message: 'Unable to audit history.',
      });
    }
  }, [auditLog]);

  useEffect(() => {
    if (!notification) return undefined;

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const recordAudit = useCallback((action, transaction, details = '') => {
    const entry = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      action,
      transactionId: transaction?.id ?? 'SYSTEM',
      description: transaction?.description ?? 'System operation',
      details,
      timestamp: new Date().toISOString(),
    };

    setAuditLog((previous) => [entry, ...previous].slice(0, 500));
  }, []);

  const convert = useCallback(
    (value) => {
      const converted = Number(value || 0) * FX_RATES[currency];

      if (currency === 'BTC') {
        return converted.toFixed(8);
      }

      return converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    [currency]
  );

  const formatMoney = useCallback(
    (value) => `${FX_SYMBOLS[currency]}${convert(value)}`,
    [currency, convert]
  );

  const totalCredits = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'credit' && tx.status === 'Settled')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [transactions]
  );

  const totalDebits = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'debit' && tx.status === 'Settled')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [transactions]
  );

  const currentBalance = 3500 + totalCredits - totalDebits;
  const netCashFlow = totalCredits - totalDebits;

  const pendingTransactions = useMemo(
    () => transactions.filter((tx) => tx.status === 'Pending'),
    [transactions]
  );

  const processingTransactions = useMemo(
    () => transactions.filter((tx) => tx.status === 'Processing'),
    [transactions]
  );

  const failedTransactions = useMemo(
    () => transactions.filter((tx) => tx.status === 'Failed'),
    [transactions]
  );

  const settledTransactions = useMemo(
    () => transactions.filter((tx) => tx.status === 'Settled'),
    [transactions]
  );

  const largestCredit = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'credit' && tx.status === 'Settled')
        .reduce(
          (largest, tx) => (!largest || tx.amount > largest.amount ? tx : largest),
          null
        ),
    [transactions]
  );

  const largestDebit = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'debit' && tx.status === 'Settled')
        .reduce(
          (largest, tx) => (!largest || tx.amount > largest.amount ? tx : largest),
          null
        ),
    [transactions]
  );

  const settledCount = settledTransactions.length;

  const averageTransaction = settledCount
    ? transactions
        .filter((tx) => tx.status === 'Settled')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0) /
      settledCount
    : 0;

  const totalFlow = totalCredits + totalDebits;
  const creditPercent = totalFlow
    ? Math.round((totalCredits / totalFlow) * 100)
    : 0;

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        const matchesType =
          typeFilter === 'all' || tx.type === typeFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          tx.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesSearch =
          !query ||
          [
            tx.id,
            tx.description,
            tx.channel,
            tx.status,
            tx.reference,
            tx.notes,
          ].some((value) =>
            String(value ?? '').toLowerCase().includes(query)
          );

        const matchesFrom = !dateFrom || tx.date >= dateFrom;
        const matchesTo = !dateTo || tx.date <= dateTo;

        return (
          matchesType &&
          matchesStatus &&
          matchesSearch &&
          matchesFrom &&
          matchesTo
        );
      })
      .sort((a, b) => {
        const first = a[sortConfig.key] ?? '';
        const second = b[sortConfig.key] ?? '';

        let comparison;

        if (sortConfig.key === 'amount') {
          comparison = Number(first) - Number(second);
        } else {
          comparison = String(first).localeCompare(String(second), undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortConfig,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const visibleIds = paginatedTransactions.map((tx) => tx.id);

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));

  const selectedTransactions = useMemo(
    () => transactions.filter((tx) => selectedIds.includes(tx.id)),
    [transactions, selectedIds]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleSort = (key) => {
    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds((previous) =>
        Array.from(new Set([...previous, ...visibleIds]))
      );
    } else {
      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id))
      );
    }
  };
const resetForm = () => {
    setNewDesc('');
    setNewAmount('');
    setNewType('debit');
    setNewChannel('Direct Deposit');
    setNewStatus('Settled');
    setNewDate(getToday());
    setNewNotes('');
    setEditingId(null);
    setIsEditing(false);
  };

  const handleAddTransaction = (event) => {
    event.preventDefault();

    const description = newDesc.trim();
    const amount = Number(newAmount);

    if (!description) {
      setNotification({
        type: 'error',
        message: 'Enter a transaction description.',
      });
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotification({
        type: 'error',
        message: 'Enter a valid amount greater than zero.',
      });
      return;
    }

    if (!newDate || newDate > getToday()) {
      setNotification({
        type: 'error',
        message: 'Select a valid transaction date.',
      });
      return;
    }

    if (isEditing && editingId) {
      const existing = transactions.find((tx) => tx.id === editingId);

      if (!existing) {
        setNotification({
          type: 'error',
          message: 'The transaction could not be found.',
        });
        resetForm();
        return;
      }

      const updatedTransaction = {
        ...existing,
        description,
        amount: Math.round((amount + Number.EPSILON) * 100) / 100,
        type: newType,
        channel: newChannel,
        status: newStatus,
        date: newDate,
        notes: newNotes.trim(),
        updatedAt: new Date().toISOString(),
      };

      setTransactions((previous) =>
        previous.map((tx) =>
          tx.id === editingId ? updatedTransaction : tx
        )
      );

      recordAudit('TRANSACTION_UPDATED', updatedTransaction);

      setNotification({
        type: 'success',
        message: `${updatedTransaction.id} updated successfully.`,
      });
    } else {
      const now = new Date().toISOString();

      const transaction = {
        id: createTransactionId(transactions),
        description,
        amount: Math.round((amount + Number.EPSILON) * 100) / 100,
        type: newType,
        channel: newChannel,
        status: newStatus,
        date: newDate,
        notes: newNotes.trim(),
        reference: `REF-${Date.now().toString(36).toUpperCase()}`,
        createdAt: now,
        updatedAt: now,
      };

      setTransactions((previous) => [transaction, ...previous]);

      recordAudit('TRANSACTION_CREATED', transaction);

      setNotification({
        type: 'success',
        message: `${transaction.id} added to the ledger.`,
      });
    }

    resetForm();
    setIsAdding(false);
    setCurrentPage(1);
  };

  const handleEditTransaction = (transaction) => {
    setEditingId(transaction.id);
    setNewDesc(transaction.description);
    setNewAmount(String(transaction.amount));
    setNewType(transaction.type);
    setNewChannel(transaction.channel);
    setNewStatus(transaction.status);
    setNewDate(transaction.date);
    setNewNotes(transaction.notes ?? '');
    setIsEditing(true);
    setIsAdding(true);
    setSelectedTransaction(null);
  };

  const handleUpdateStatus = (id, status) => {
    const transaction = transactions.find((tx) => tx.id === id);

    if (!transaction || transaction.status === status) return;

    const updated = {
      ...transaction,
      status,
      updatedAt: new Date().toISOString(),
    };

    setTransactions((previous) =>
      previous.map((tx) => (tx.id === id ? updated : tx))
    );

    recordAudit('STATUS_CHANGED', updated, `${transaction.status} → ${status}`);

    setSelectedTransaction(updated);

    setNotification({
      type: 'success',
      message: `${id} status changed to ${status}.`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected transaction(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    selectedTransactions.forEach((tx) => {
      recordAudit('TRANSACTION_DELETED', tx);
    });

    setTransactions((previous) =>
      previous.filter((tx) => !selectedIds.includes(tx.id))
    );

    setSelectedIds([]);
    setSelectedTransaction(null);

    setNotification({
      type: 'success',
      message: 'Selected transactions deleted.',
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Description',
      'Date',
      'Channel',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'Reference',
      'Notes',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.description,
      tx.date,
      tx.channel,
      tx.type,
      tx.amount,
      'USD',
      tx.status,
      tx.reference,
      tx.notes,
    ]);

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `treasury-ledger-${getToday()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    recordAudit(
      'CSV_EXPORTED',
      null,
      `${filteredTransactions.length} filtered transaction(s)`
    );

    setNotification({
      type: 'success',
      message: 'Filtered ledger exported successfully.',
    });
  };

  const handleExportJSON = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      currency,
      startingBalance: 3500,
      transactionCount: transactions.length,
      transactions,
      auditLog,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `treasury-backup-${getToday()}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    recordAudit('JSON_BACKUP_EXPORTED', null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handlePrintReport = () => {
    setIsExporting(true);

    window.setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 100);
  };

  const handleClearAuditLog = () => {
    if (auditLog.length === 0) return;

    const confirmed = window.confirm(
      'Clear the locally stored audit history? This does not change ledger transactions.'
    );

    if (!confirmed) return;

    setAuditLog([]);

    setNotification({
      type: 'success',
      message: 'Audit history cleared.',
    });
  };

  return (
    <div className="ledger-wrapper">
      <header className="ledger-header">
        <button
          type="button"
          className="exit-system-btn"
          onClick={() => setPage('home')}
        >
          ← Back to Directory
        </button>

        <div className="header-meta-group">
          <div className="ledger-system-status" aria-live="polite">
            <span className="status-indicator" />
            <span>{syncStatus}</span>
          </div>

          <div
            className="currency-selector"
            role="group"
            aria-label="Display currency"
          >
            {Object.keys(FX_RATES).map((curr) => (
              <button
                type="button"
                key={curr}
                className={`curr-btn ${currency === curr ? 'active' : ''}`}
                aria-pressed={currency === curr}
                onClick={() => setCurrency(curr)}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </header>

      {notification && (
        <div
          className={`ledger-notification ${notification.type}`}
          role="status"
        >
          <span>{notification.message}</span>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <section className="ledger-page-intro">
        <div>
          <p className="ledger-eyebrow">FINANCIAL OPERATIONS / TREASURY</p>
          <h1>Bank Ledger Intelligence</h1>
          <p>
            Monitor balances, investigate transactions, and manage financial
            records from one dashboard.
          </p>
        </div>

        <div className="ledger-intro-meta">
          <span>LEDGER</span>
          <strong>{transactions.length} total records</strong>
          <small>Updated {new Date().toLocaleString()}</small>
        </div>
      </section>

      <section className="balance-summary-section">
        <div className="summary-card main-balance glass-card">
          <p className="summary-label">
            Available Balance ({currency})
          </p>

          <h2 className="balance-display">
            {formatMoney(currentBalance)}
          </h2>

          <div className="cashflow-ratio-bar">
            <div
              className="ratio-fill"
              style={{ width: `${creditPercent}%` }}
            />
          </div>

          <small className="ratio-caption">
            Settled inflow composition: {creditPercent}%
          </small>

          <div className="balance-card-footer">
            <span>Opening balance</span>
            <strong>{formatMoney(3500)}</strong>
          </div>
        </div>

        <div className="summary-card inflows-card glass-card">
          <p className="summary-label">Settled Inflows</p>
          <h2 className="flow-display credit-text">
            +{formatMoney(totalCredits)}
          </h2>
          <small>{transactions.filter((tx) => tx.type === 'credit').length} credit entries</small>
        </div>

        <div className="summary-card outflows-card glass-card">
          <p className="summary-label">Settled Outflows</p>
          <h2 className="flow-display debit-text">
            −{formatMoney(totalDebits)}
          </h2>
          <small>{transactions.filter((tx) => tx.type === 'debit').length} debit entries</small>
        </div>

        <div className="summary-card net-flow-card glass-card">
          <p className="summary-label">Net Cash Flow</p>
          <h2 className={`flow-display ${netCashFlow >= 0 ? 'credit-text' : 'debit-text'}`}>
            {netCashFlow >= 0 ? '+' : '−'}
            {formatMoney(Math.abs(netCashFlow))}
          </h2>
          <small>Settled credits minus settled debits</small>
        </div>

        <div className="summary-card pending-card glass-card">
          <p className="summary-label">Pending Exposure</p>
          <h2 className="flow-display">
            {pendingTransactions.length}
          </h2>
          <small>{processingTransactions.length} currently processing</small>
        </div>
      </section>
      <section className="ledger-analytics-section">
        <div className="analytics-section-heading">
          <div>
            <p className="ledger-eyebrow">PERFORMANCE </p>
            <h2>Ledger Analytics</h2>
          </div>

          <button
            type="button"
            className="analytics-toggle-btn"
            onClick={() => setShowAnalytics((previous) => !previous)}
            aria-expanded={showAnalytics}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>

        {showAnalytics && (
          <div className="analytics-grid">
            <article className="analytics-card glass-card">
              <span className="analytics-card-label">
                Settled Transaction
              </span>
              <strong>{formatMoney(averageTransaction)}</strong>
              <small>Average value per settled record</small>
            </article>

            <article className="analytics-card glass-card">
              <span className="analytics-card-label">
                Settled Inflow
              </span>
              <strong>
                {largestCredit ? formatMoney(largestCredit.amount) : formatMoney(0)}
              </strong>
              <small>
                {largestCredit ? largestCredit.description : 'No settled inflows'}
              </small>
            </article>

            <article className="analytics-card glass-card">
              <span className="analytics-card-label">
                Settled Outflow
              </span>
              <strong>
                {largestDebit ? formatMoney(largestDebit.amount) : formatMoney(0)}
              </strong>
              <small>
                {largestDebit ? largestDebit.description : 'No settled outflows'}
              </small>
            </article>

            <article className="analytics-card glass-card">
              <span className="analytics-card-label">
                Failed Transactions
              </span>
              <strong>{failedTransactions.length}</strong>
              <small>Records requiring review</small>
            </article>
          </div>
        )}
      </section>

      <section className="ledger-insights-panel glass-card">
        <div>
          <p className="ledger-eyebrow">OBSERVATIONS</p>
          <h2>Financial Insights</h2>
        </div>

        <div className="ledger-insights-list">
          <article className="ledger-insight-item">
            <span className="insight-icon">↗</span>
            <div>
              <strong>
                {netCashFlow >= 0 ? 'Positive net cash flow' : 'Negative net cash flow'}
              </strong>
              <p>
                Settled inflows exceed settled outflows by{' '}
                {formatMoney(Math.abs(netCashFlow))} in net movement.
              </p>
            </div>
          </article>

          <article className="ledger-insight-item">
            <span className="insight-icon">◷</span>
            <div>
              <strong>Outstanding activity</strong>
              <p>
                {pendingTransactions.length + processingTransactions.length}{' '}
                transaction(s) are pending or processing.
              </p>
            </div>
          </article>

          <article className="ledger-insight-item">
            <span className="insight-icon">!</span>
            <div>
              <strong>Transaction exceptions</strong>
              <p>
                {failedTransactions.length} failed transaction(s) currently
                require review.
              </p>
            </div>
          </article>
        </div>

        <small className="analytics-disclaimer">
          Insights are calculated from the current ledger. They are
          informational and are not a substitute for reconciled bank statements.
        </small>
      </section>

      <section className="ledger-management-panel">
        <div className="ledger-actions-bar">
          <div className="ledger-controls">
            <input
              type="search"
              className="search-input"
              placeholder="Search ID, description, reference, notes..."
              aria-label="Search transactions"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="filter-tabs">
              {['all', 'credit', 'debit'].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`tab-btn ${typeFilter === type ? 'active' : ''}`}
                  aria-pressed={typeFilter === type}
                  onClick={() => {
                    setTypeFilter(type);
                    setCurrentPage(1);
                  }}
                >
                  {type === 'all'
                    ? 'All Entries'
                    : type === 'credit'
                      ? 'Inflows (+)'
                      : 'Outflows (−)'}
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="bulk-delete-btn"
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}

            <button
              type="button"
              className="add-tx-btn"
              onClick={() => {
                if (isAdding) {
                  resetForm();
                  setIsAdding(false);
                } else {
                  resetForm();
                  setIsAdding(true);
                }
              }}
            >
              {isAdding ? '× Cancel' : '+ Record Entry'}
            </button>

            <button
              type="button"
              className="export-btn"
              onClick={handleExportCSV}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        <div className="advanced-filters glass-card">
          <div className="advanced-filter-field">
            <label htmlFor="status-filter">Transaction status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All statuses</option>
              {TRANSACTION_STATUSES.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="advanced-filter-field">
            <label htmlFor="date-from">From date</label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              max={dateTo || getToday()}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="advanced-filter-field">
            <label htmlFor="date-to">To date</label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              max={getToday()}
              onChange={(event) => {
                setDateTo(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>

          <button
            type="button"
            className="export-btn"
            onClick={handleExportJSON}
          >
            JSON Backup
          </button>

          <button
            type="button"
            className="export-btn"
            onClick={handlePrintReport}
            disabled={isExporting}
          >
            {isExporting ? 'Preparing...' : 'Print Report'}
          </button>
        </div>
      </section>

      {isAdding && (
        <form
          onSubmit={handleAddTransaction}
          className="add-transaction-form"
        >
          <div className="form-heading-row">
            <div>
              <p className="ledger-eyebrow">
                TRANSACTION MANAGEMENT
              </p>
              <h3>
                {isEditing ? 'Edit Ledger Entry' : 'Record New Ledger Entry'}
              </h3>
            </div>

            <span className="form-mode-badge">
              {isEditing ? 'EDIT MODE' : 'NEW ENTRY'}
            </span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="transaction-description">
                Description / Vendor
              </label>
              <input
                id="transaction-description"
                type="text"
                maxLength={160}
                placeholder="e.g. Cloud infrastructure services"
                value={newDesc}
                onChange={(event) => setNewDesc(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="transaction-amount">
                Amount (USD base)
              </label>
              <input
                id="transaction-amount"
                type="number"
                min="0.01"
                max="1000000000"
                step="0.01"
                placeholder="0.00"
                value={newAmount}
                onChange={(event) => setNewAmount(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="transaction-type">Entry type</label>
              <select
                id="transaction-type"
                value={newType}
                onChange={(event) => setNewType(event.target.value)}
              >
                <option value="debit">Debit (Outflow)</option>
                <option value="credit">Credit (Inflow)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transaction-channel">Payment channel</label>
              <select
                id="transaction-channel"
                value={newChannel}
                onChange={(event) => setNewChannel(event.target.value)}
              >
                {PAYMENT_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transaction-status">Initial status</label>
              <select
                id="transaction-status"
                value={newStatus}
                onChange={(event) => setNewStatus(event.target.value)}
              >
                {TRANSACTION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transaction-date">Execution date</label>
              <input
                id="transaction-date"
                type="date"
                value={newDate}
                max={getToday()}
                onChange={(event) => setNewDate(event.target.value)}
                required
              />
            </div>

            <div className="form-group form-notes-group">
              <label htmlFor="transaction-notes">Internal notes</label>
              <textarea
                id="transaction-notes"
                maxLength={1000}
                rows={3}
                placeholder="Add a description for audit and reconciliation..."
                value={newNotes}
                onChange={(event) => setNewNotes(event.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-entry-btn">
              {isEditing ? 'Save Changes' : 'Post to Ledger'}
            </button>

            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                resetForm();
                setIsAdding(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
     <section className="ledger-table-section">
        <div className="table-header-row">
          <div>
            <p className="ledger-eyebrow">RECORDS & RECONCILIATION</p>
            <h2 className="table-heading">Historical Balance Entries</h2>
          </div>

          <span className="entry-count-badge">
            {filteredTransactions.length} matching records
          </span>
        </div>

        <div className="table-toolbar">
          <span>
            {selectedIds.length > 0
              ? `${selectedIds.length} record(s) selected`
              : 'Select entries to perform bulk actions'}
          </span>

          <div className="table-toolbar-controls">
            <label htmlFor="page-size">Rows per page</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-scroll-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    aria-label="Select all transactions on this page"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                  />
                </th>

                <th>
                  <button
                    type="button"
                    className="table-sort-btn"
                    onClick={() => handleSort('id')}
                  >
                    ID Reference
                    {sortConfig.key === 'id' &&
                      (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="table-sort-btn"
                    onClick={() => handleSort('description')}
                  >
                    Description / Scope
                    {sortConfig.key === 'description' &&
                      (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="table-sort-btn"
                    onClick={() => handleSort('date')}
                  >
                    Execution Date
                    {sortConfig.key === 'date' &&
                      (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>

                <th>Payment Channel</th>
                <th>Status</th>

                <th className="text-right">
                  <button
                    type="button"
                    className="table-sort-btn"
                    onClick={() => handleSort('amount')}
                  >
                    Transaction Volume
                    {sortConfig.key === 'amount' &&
                      (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    <div className="empty-ledger-state">
                      <span className="empty-ledger-icon">⌕</span>
                      <strong>No matching transactions</strong>
                      <p>
                        Adjust your search or filters, or record a new entry.
                      </p>

                      <button
                        type="button"
                        className="reset-filters-btn"
                        onClick={handleResetFilters}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((item) => (
                  <tr
                    key={item.id}
                    className={`${item.type} ${
                      selectedIds.includes(item.id) ? 'selected-row' : ''
                    }`}
                  >
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.id}`}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                      />
                    </td>

                    <td className="font-mono">{item.id}</td>

                    <td>
                      <button
                        type="button"
                        className="transaction-description-btn"
                        onClick={() => setSelectedTransaction(item)}
                      >
                        <strong>{item.description}</strong>
                        <small>{item.reference || 'No reference'}</small>
                      </button>
                    </td>

                    <td>{item.date}</td>

                    <td>
                      <em>{item.channel}</em>
                    </td>

                    <td>
                      <span
                        className={`status-pill status-${item.status
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className={`text-right volume-cell ${item.type}`}>
                      {item.type === 'credit' ? '+ ' : '− '}
                      {formatMoney(item.amount)}
                    </td>

                    <td>
                      <div className="transaction-row-actions">
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => setSelectedTransaction(item)}
                          aria-label={`View ${item.id}`}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => handleEditTransaction(item)}
                          aria-label={`Edit ${item.id}`}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ledger-pagination">
          <span>
            {filteredTransactions.length === 0
              ? 'Showing 0 records'
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  filteredTransactions.length
                )} of ${filteredTransactions.length}`}
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selectedTransaction && (
        <div
          className="transaction-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTransaction(null);
            }
          }}
        >
          <section
            className="transaction-detail-modal glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
          >
            <div className="modal-heading-row">
              <div>
                <p className="ledger-eyebrow">TRANSACTION INSPECTOR</p>
                <h2 id="transaction-detail-title">
                  Transaction Details
                </h2>
                <span className="font-mono">
                  {selectedTransaction.id}
                </span>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                aria-label="Close transaction details"
                onClick={() => setSelectedTransaction(null)}
              >
                ×
              </button>
            </div>

            <div className="transaction-detail-grid">
              <div>
                <span>Description</span>
                <strong>{selectedTransaction.description}</strong>
              </div>

              <div>
                <span>Amount</span>
                <strong className={selectedTransaction.type}>
                  {selectedTransaction.type === 'credit' ? '+ ' : '− '}
                  {formatMoney(selectedTransaction.amount)}
                </strong>
              </div>

              <div>
                <span>Type</span>
                <strong>{selectedTransaction.type}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedTransaction.status}</strong>
              </div>

              <div>
                <span>Execution date</span>
                <strong>{selectedTransaction.date}</strong>
              </div>

              <div>
                <span>Payment channel</span>
                <strong>{selectedTransaction.channel}</strong>
              </div>

              <div>
                <span>Reference</span>
                <strong>{selectedTransaction.reference || 'N/A'}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {selectedTransaction.createdAt
                    ? new Date(selectedTransaction.createdAt).toLocaleString()
                    : 'N/A'}
                </strong>
              </div>

              <div className="transaction-detail-notes">
                <span>Internal notes</span>
                <p>{selectedTransaction.notes || 'No notes available.'}</p>
              </div>
            </div>

            <div className="transaction-status-controls">
              <label htmlFor="detail-status">Update status</label>
              <select
                id="detail-status"
                value={selectedTransaction.status}
                onChange={(event) =>
                  handleUpdateStatus(
                    selectedTransaction.id,
                    event.target.value
                  )
                }
              >
                {TRANSACTION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="add-tx-btn"
                onClick={() => handleEditTransaction(selectedTransaction)}
              >
                Edit Transaction
              </button>

              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="ledger-audit-section glass-card">
        <div className="audit-section-heading">
          <div>
            <p className="ledger-eyebrow">ACTIVITY MONITOR</p>
            <h2>Audit Trail</h2>
            <small>
              {auditLog.length} locally recorded action(s)
            </small>
          </div>

          <button
            type="button"
            className="analytics-toggle-btn"
            onClick={() => setShowAuditLog((previous) => !previous)}
            aria-expanded={showAuditLog}
          >
            {showAuditLog ? 'Hide History' : 'View History'}
          </button>
        </div>

        {showAuditLog && (
          <>
            <div className="audit-log-list">
              {auditLog.length === 0 ? (
                <p>No recorded actions yet.</p>
              ) : (
                auditLog.map((entry) => (
                  <article className="audit-log-item" key={entry.id}>
                    <span className="audit-event-indicator" />

                    <div className="audit-event-content">
                      <strong>{entry.action.replaceAll('_', ' ')}</strong>
                      <span>
                        {entry.transactionId} · {entry.description}
                      </span>

                      {entry.details && <small>{entry.details}</small>}

                      <time dateTime={entry.timestamp}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </article>
                ))
              )}
            </div>

            {auditLog.length > 0 && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleClearAuditLog}
              >
                Clear Audit History
              </button>
            )}
          </>
        )}
      </section>

      <footer className="ledger-footer">
        <div>
          <strong>Corporate Treasury Ledger</strong>
          <span>Client-side demonstration environment</span>
        </div>

        <div>
          <span>{transactions.length} records</span>
          <span>·</span>
          <span>{settledTransactions.length} settled</span>
          <span>·</span>
          <span>{auditLog.length} audit events</span>
        </div>

        <small>
          Balances and exchange rates are illustrative. This component does
          not connect to a bank or external financial data provider.
        </small>
      </footer>
    </div>
  );
}

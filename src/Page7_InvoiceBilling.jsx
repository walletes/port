import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Page7_InvoiceBilling.css';

const STORAGE_KEY = 'portfolio_invoice_billing_v2';

const SERVICE_PRESETS = [
  {
    label: 'Frontend Layout Engineering',
    description: 'Responsive frontend implementation and UI engineering',
    price: 850,
    category: 'Development'
  },
  {
    label: 'State Architecture Setup',
    description: 'Application state management and architecture configuration',
    price: 400,
    category: 'Development'
  },
  {
    label: 'Smart Contract Security Audit',
    description: 'Smart contract review, vulnerability assessment, and reporting',
    price: 2500,
    category: 'Security'
  },
  {
    label: 'Full-Stack Microservice API',
    description: 'API architecture, implementation, testing, and integration',
    price: 1200,
    category: 'Development'
  },
  {
    label: 'CI/CD Pipeline Automation',
    description: 'Deployment pipeline configuration and automation',
    price: 600,
    category: 'Infrastructure'
  },
  {
    label: 'Database Latency Optimization',
    description: 'Database performance profiling and query optimization',
    price: 950,
    category: 'Infrastructure'
  },
  {
    label: 'Technical Consultation',
    description: 'Technical consultation and implementation planning',
    price: 150,
    category: 'Consulting'
  },
  {
    label: 'Maintenance & Support',
    description: 'Ongoing technical maintenance and support services',
    price: 300,
    category: 'Support'
  }
];

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', locale: 'en-US' },
  { code: 'NGN', label: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'EUR', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB' }
];

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Card Payment',
  'Cash',
  'Mobile Money',
  'Cryptocurrency',
  'Other'
];

const PAYMENT_TERMS = [
  { value: 0, label: 'Due on Receipt' },
  { value: 7, label: 'Net-7' },
  { value: 14, label: 'Net-14' },
  { value: 30, label: 'Net-30' },
  { value: 45, label: 'Net-45' },
  { value: 60, label: 'Net-60' }
];

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const addDays = (dateString, days) => {
  if (!dateString) return '';

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return '';

  date.setDate(date.getDate() + Number(days));

  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const createInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const sequence = String(Date.now()).slice(-6);

  return `INV-${year}-${sequence}`;
};

const createInitialInvoice = () => {
  const issueDate = getToday();

  return {
    id: createId(),
    invoiceNumber: createInvoiceNumber(),
    reference: '',
    status: 'Pending',
    issueDate,
    dueDate: addDays(issueDate, 30),
    paymentTerms: 30,
    currency: 'USD',

    client: {
      name: 'Acme Corporation',
      email: 'billing@acme.io',
      phone: '',
      company: 'Acme Corporation',
      address: '',
      city: '',
      country: '',
      taxId: ''
    },

    issuer: {
      name: 'Your Business',
      email: 'accounts@yourbusiness.com',
      phone: '',
      address: '',
      taxId: ''
    },

    items: [
      {
        id: createId(),
        label: 'Frontend Layout Engineering',
        description: 'Responsive interface implementation',
        category: 'Development',
        price: 850,
        qty: 1
      },
      {
        id: createId(),
        label: 'State Architecture Setup',
        description: 'Application state architecture and setup',
        category: 'Development',
        price: 400,
        qty: 2
      }
    ],

    taxRate: 7.5,
    discountType: 'percentage',
    discountValue: 0,
    shipping: 0,
    adjustment: 0,

    payments: [],

    notes:
      'Thank you for your business. Please include the invoice number when making payment.',
    terms:
      'Payment is due according to the agreed payment terms. Please contact us regarding any billing discrepancies.',

    purchaseOrder: '',
    projectName: '',
    footer: 'Thank you for your business.'
  };
};

const loadStoredInvoice = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return createInitialInvoice();

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.items) ||
      !parsed.client ||
      !parsed.issuer
    ) {
      return createInitialInvoice();
    }

    return {
      ...createInitialInvoice(),
      ...parsed,
      client: {
        ...createInitialInvoice().client,
        ...parsed.client
      },
      issuer: {
        ...createInitialInvoice().issuer,
        ...parsed.issuer
      },
      items: parsed.items,
      payments: Array.isArray(parsed.payments) ? parsed.payments : []
    };
  } catch {
    return createInitialInvoice();
  }
};

const formatMoney = (amount, currency = 'USD') => {
  const currencyInfo =
    CURRENCIES.find((entry) => entry.code === currency) || CURRENCIES[0];

  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${(Number(amount) || 0).toFixed(2)}`;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const escapeCSV = (value) => {
  const text = String(value ?? '');

  return `"${text.replace(/"/g, '""')}"`;
};

export default function Page7_InvoiceBilling({ setPage }) {
  const [invoice, setInvoice] = useState(loadStoredInvoice);

  const [activeTab, setActiveTab] = useState('invoice');
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Development');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('1');

  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [presetSelection, setPresetSelection] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const [clientSearch, setClientSearch] = useState('');
  const [showClientEditor, setShowClientEditor] = useState(false);
  const [showIssuerEditor, setShowIssuerEditor] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');

  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [savedAt, setSavedAt] = useState(null);

  const [showTaxEditor, setShowTaxEditor] = useState(false);
  const [showDiscountEditor, setShowDiscountEditor] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);

  const [discountDraft, setDiscountDraft] = useState({
    type: invoice.discountType,
    value: String(invoice.discountValue)
  });

  const [taxDraft, setTaxDraft] = useState(String(invoice.taxRate));

  const [showNewInvoiceOptions, setShowNewInvoiceOptions] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
      setSavedAt(new Date());
    } catch {
      setToast({
        type: 'error',
        message: 'Unable to save the invoice in this browser.'
      });
    }
  }, [invoice]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowConfirm(null);
        setShowClientEditor(false);
        setShowIssuerEditor(false);
        setShowPaymentForm(false);
        setShowTaxEditor(false);
        setShowDiscountEditor(false);
        setShowNotesEditor(false);
        setShowHistory(false);
        setShowNewInvoiceOptions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const recordHistory = useCallback((message, metadata = {}) => {
    setHistory((previous) =>
      [
        {
          id: createId(),
          message,
          timestamp: new Date().toISOString(),
          ...metadata
        },
        ...previous
      ].slice(0, 100)
    );
  }, []);

  const updateInvoice = useCallback((updates) => {
    setInvoice((previous) => ({
      ...previous,
      ...updates
    }));
  }, []);

  const updateClient = useCallback((field, value) => {
    setInvoice((previous) => ({
      ...previous,
      client: {
        ...previous.client,
        [field]: value
      }
    }));
  }, []);

  const updateIssuer = useCallback((field, value) => {
    setInvoice((previous) => ({
      ...previous,
      issuer: {
        ...previous.issuer,
        [field]: value
      }
    }));
  }, []);

  const calculations = useMemo(() => {
    const subtotal = invoice.items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.qty || 0),
      0
    );

    const discountInput = Math.max(
      0,
      Number(invoice.discountValue) || 0
    );

    const discount =
      invoice.discountType === 'percentage'
        ? subtotal * Math.min(discountInput, 100) / 100
        : Math.min(discountInput, subtotal);

    const taxableAmount = Math.max(0, subtotal - discount);

    const tax = taxableAmount * Math.max(0, Number(invoice.taxRate) || 0) / 100;

    const shipping = Math.max(0, Number(invoice.shipping) || 0);
    const adjustment = Number(invoice.adjustment) || 0;

    const total = Math.max(
      0,
      taxableAmount + tax + shipping + adjustment
    );

    const amountPaid = invoice.payments.reduce(
      (sum, payment) => sum + Math.max(0, Number(payment.amount) || 0),
      0
    );

    const balanceDue = Math.max(0, total - amountPaid);
    const overpayment = Math.max(0, amountPaid - total);

    return {
      subtotal,
      discount,
      taxableAmount,
      tax,
      shipping,
      adjustment,
      total,
      amountPaid,
      balanceDue,
      overpayment
    };
  }, [invoice]);

  const effectiveStatus = useMemo(() => {
    if (calculations.balanceDue <= 0 && calculations.total > 0) {
      return 'Paid';
    }

    if (calculations.amountPaid > 0 && calculations.balanceDue > 0) {
      return 'Partially Paid';
    }

    if (
      invoice.dueDate &&
      invoice.dueDate < getToday() &&
      calculations.balanceDue > 0
    ) {
      return 'Overdue';
    }

    return invoice.status === 'Draft' ? 'Draft' : 'Pending';
  }, [
    calculations.amountPaid,
    calculations.balanceDue,
    calculations.total,
    invoice.dueDate,
    invoice.status
  ]);

  const filteredItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();

    if (!query) return invoice.items;

    return invoice.items.filter((item) =>
      [
        item.label,
        item.description,
        item.category,
        item.price,
        item.qty
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(query)
      )
    );
  }, [invoice.items, itemSearch]);

  const invoiceMetrics = useMemo(() => {
    const categoryCount = new Set(
      invoice.items.map((item) => item.category || 'Uncategorized')
    ).size;

    return {
      lineItems: invoice.items.length,
      categories: categoryCount,
      averageLineValue:
        invoice.items.length > 0
          ? calculations.subtotal / invoice.items.length
          : 0,
      completion:
        calculations.total > 0
          ? Math.min(
              100,
              (calculations.amountPaid / calculations.total) * 100
            )
          : 0
    };
  }, [invoice.items, calculations]);

  const isOverdue =
    Boolean(invoice.dueDate) &&
    invoice.dueDate < getToday() &&
    calculations.balanceDue > 0;

  const addItem = (event) => {
    event.preventDefault();

    const label = newLabel.trim();
    const price = Number(newPrice);
    const qty = Number(newQty);

    if (!label) {
      setToast({
        type: 'error',
        message: 'Enter a service description.'
      });
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setToast({
        type: 'error',
        message: 'Enter a valid, non-negative unit price.'
      });
      return;
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 100000) {
      setToast({
        type: 'error',
        message: 'Quantity must be a whole number greater than zero.'
      });
      return;
    }

    const item = {
      id: createId(),
      label,
      description: newDescription.trim(),
      category: newCategory,
      price,
      qty
    };

    updateInvoice({
      items: [...invoice.items, item]
    });

    recordHistory(`Added invoice line: ${label}.`, {
      itemId: item.id
    });

    setNewLabel('');
    setNewDescription('');
    setNewPrice('');
    setNewQty('1');
    setNewCategory('Development');
    setPresetSelection('');

    setToast({
      type: 'success',
      message: 'Invoice line added.'
    });
  };

  const selectPreset = (event) => {
    const selected = SERVICE_PRESETS.find(
      (preset) => preset.label === event.target.value
    );

    setPresetSelection(event.target.value);

    if (!selected) return;

    setNewLabel(selected.label);
    setNewDescription(selected.description);
    setNewCategory(selected.category);
    setNewPrice(String(selected.price));
    setNewQty('1');
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setEditingItem({
      ...item,
      price: String(item.price),
      qty: String(item.qty)
    });
  };

  const saveEditedItem = (event) => {
    event.preventDefault();

    if (!editingItem || !editingItem.label.trim()) {
      setToast({
        type: 'error',
        message: 'A line item must have a description.'
      });
      return;
    }

    const price = Number(editingItem.price);
    const qty = Number(editingItem.qty);

    if (!Number.isFinite(price) || price < 0) {
      setToast({
        type: 'error',
        message: 'Enter a valid unit price.'
      });
      return;
    }

    if (!Number.isInteger(qty) || qty < 1) {
      setToast({
        type: 'error',
        message: 'Quantity must be a whole number greater than zero.'
      });
      return;
    }

    updateInvoice({
      items: invoice.items.map((item) =>
        item.id === editingItemId
          ? {
              ...editingItem,
              label: editingItem.label.trim(),
              description: (editingItem.description || '').trim(),
              price,
              qty
            }
          : item
      )
    });

    recordHistory(`Updated invoice line: ${editingItem.label}.`);

    setEditingItemId(null);
    setEditingItem(null);

    setToast({
      type: 'success',
      message: 'Invoice line updated.'
    });
  };

  const removeItem = (itemId) => {
    const item = invoice.items.find((entry) => entry.id === itemId);

    if (!item) return;

    setShowConfirm({
      title: 'Remove invoice line?',
      message: `Remove "${item.label}" from this invoice? The invoice totals will be recalculated.`,
      confirmLabel: 'Remove Line',
      variant: 'danger',
      onConfirm: () => {
        updateInvoice({
          items: invoice.items.filter((entry) => entry.id !== itemId)
        });

        recordHistory(`Removed invoice line: ${item.label}.`);

        setToast({
          type: 'success',
          message: 'Invoice line removed.'
        });
      }
    });
  };

  const duplicateItem = (item) => {
    const duplicated = {
      ...item,
      id: createId(),
      label: `${item.label} (Copy)`
    };

    updateInvoice({
      items: [...invoice.items, duplicated]
    });

    recordHistory(`Duplicated invoice line: ${item.label}.`);

    setToast({
      type: 'success',
      message: 'Invoice line duplicated.'
    });
  };

  const applyDiscount = (event) => {
    event.preventDefault();

    const value = Number(discountDraft.value);

    if (!Number.isFinite(value) || value < 0) {
      setToast({
        type: 'error',
        message: 'Enter a valid discount.'
      });
      return;
    }

    if (discountDraft.type === 'percentage' && value > 100) {
      setToast({
        type: 'error',
        message: 'Percentage discount cannot exceed 100%.'
      });
      return;
    }

    updateInvoice({
      discountType: discountDraft.type,
      discountValue: value
    });

    recordHistory('Updated invoice discount.');

    setShowDiscountEditor(false);

    setToast({
      type: 'success',
      message: 'Discount applied.'
    });
  };

  const applyTax = (event) => {
    event.preventDefault();

    const rate = Number(taxDraft);

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      setToast({
        type: 'error',
        message: 'Tax rate must be between 0% and 100%.'
      });
      return;
    }

    updateInvoice({
      taxRate: rate
    });

    recordHistory(`Updated tax rate to ${rate}%.`);

    setShowTaxEditor(false);

    setToast({
      type: 'success',
      message: 'Tax configuration updated.'
    });
  };

  const recordPayment = (event) => {
    event.preventDefault();

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setToast({
        type: 'error',
        message: 'Enter a valid payment amount greater than zero.'
      });
      return;
    }

    if (!paymentDate) {
      setToast({
        type: 'error',
        message: 'Select the payment date.'
      });
      return;
    }

    const payment = {
      id: createId(),
      amount,
      date: paymentDate,
      method: paymentMethod,
      reference: paymentReference.trim(),
      recordedAt: new Date().toISOString()
    };

    updateInvoice({
      payments: [...invoice.payments, payment]
    });

    recordHistory(
      `Recorded ${formatMoney(amount, invoice.currency)} payment via ${paymentMethod}.`,
      {
        paymentId: payment.id
      }
    );

    setPaymentAmount('');
    setPaymentReference('');
    setPaymentDate(getToday());
    setShowPaymentForm(false);

    setToast({
      type: 'success',
      message: 'Payment recorded.'
    });
  };

  const removePayment = (paymentId) => {
    const payment = invoice.payments.find(
      (entry) => entry.id === paymentId
    );

    if (!payment) return;

    setShowConfirm({
      title: 'Reverse recorded payment?',
message:
        `Remove the recorded payment of ${formatMoney(payment.amount, invoice.currency)}? ` +
        'This updates the outstanding balance but does not reverse an actual bank transaction.',
      confirmLabel: 'Reverse Record',
      variant: 'danger',
      onConfirm: () => {
        updateInvoice({
          payments: invoice.payments.filter(
            (entry) => entry.id !== paymentId
          )
        });

        recordHistory(
          `Removed payment record of ${formatMoney(payment.amount, invoice.currency)}.`
        );

        setToast({
          type: 'success',
          message: 'Payment record removed.'
        });
      }
    });
  };

  const changeStatus = (status) => {
    updateInvoice({ status });

    recordHistory(`Invoice status changed to ${status}.`);

    setToast({
      type: 'success',
      message: `Invoice status set to ${status}.`
    });
  };

  const updatePaymentTerms = (days) => {
    const numericDays = Number(days);

    updateInvoice({
      paymentTerms: numericDays,
      dueDate: addDays(invoice.issueDate, numericDays)
    });

    recordHistory(`Payment terms changed to Net-${numericDays}.`);
  };

  const markAsPaid = () => {
    const outstanding = calculations.balanceDue;

    if (outstanding <= 0) {
      setToast({
        type: 'info',
        message: 'This invoice has no outstanding balance.'
      });
      return;
    }

    setShowConfirm({
      title: 'Mark invoice as paid?',
      message:
        `This records ${formatMoney(outstanding, invoice.currency)} as a payment using ${paymentMethod}. ` +
        'Use this only if payment has actually been received.',
      confirmLabel: 'Record Full Payment',
      variant: 'success',
      onConfirm: () => {
        updateInvoice({
          payments: [
            ...invoice.payments,
            {
              id: createId(),
              amount: outstanding,
              date: getToday(),
              method: paymentMethod,
              reference: 'FULL-PAYMENT',
              recordedAt: new Date().toISOString()
            }
          ],
          status: 'Paid'
        });

        recordHistory('Invoice marked as paid.');

        setToast({
          type: 'success',
          message: 'Full payment recorded.'
        });
      }
    });
  };

  const createNewInvoice = (duplicateCurrent = false) => {
    const fresh = createInitialInvoice();

    const nextInvoice = duplicateCurrent
      ? {
          ...invoice,
          id: createId(),
          invoiceNumber: createInvoiceNumber(),
          reference: '',
          status: 'Draft',
          issueDate: getToday(),
          dueDate: addDays(getToday(), invoice.paymentTerms),
          payments: [],
          items: invoice.items.map((item) => ({
            ...item,
            id: createId()
          }))
        }
      : fresh;

    setShowConfirm({
      title: duplicateCurrent ? 'Duplicate this invoice?' : 'Create a new invoice?',
      message: duplicateCurrent
        ? 'A new draft will be created with the current client and line items. The invoice number and payment history will be reset.'
        : 'Create a fresh invoice? Your current invoice will be replaced in the active workspace. Export a copy first if you need to keep it.',
      confirmLabel: duplicateCurrent ? 'Create Duplicate' : 'Create New Invoice',
      variant: 'warning',
      onConfirm: () => {
        setInvoice(nextInvoice);
        setHistory([]);
        setEditingItemId(null);
        setEditingItem(null);
        setActiveTab('invoice');
        setShowNewInvoiceOptions(false);

        recordHistory(
          duplicateCurrent
            ? 'Created a duplicate invoice draft.'
            : 'Created a new invoice.'
        );

        setToast({
          type: 'success',
          message: duplicateCurrent
            ? 'Invoice draft duplicated.'
            : 'New invoice created.'
        });
      }
    });
  };

  const exportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      schemaVersion: 2,
      invoice,
      calculations,
      activityHistory: history
    };

    downloadFile(
      JSON.stringify(payload, null, 2),
      `${invoice.invoiceNumber}-backup.json`,
      'application/json;charset=utf-8;'
    );

    recordHistory('Exported invoice backup as JSON.');

    setToast({
      type: 'success',
      message: 'JSON backup exported.'
    });
  };

  const exportCSV = () => {
    const rows = [
      ['Invoice Number', invoice.invoiceNumber],
      ['Invoice Status', effectiveStatus],
      ['Issue Date', invoice.issueDate],
      ['Due Date', invoice.dueDate],
      ['Client', invoice.client.name],
      ['Client Email', invoice.client.email],
      ['Currency', invoice.currency],
      [],
      ['Description', 'Category', 'Quantity', 'Unit Price', 'Line Total'],
      ...invoice.items.map((item) => [
        item.label,
        item.category,
        item.qty,
        item.price,
        item.qty * item.price
      ]),
      [],
      ['Subtotal', calculations.subtotal],
      ['Discount', calculations.discount],
      ['Tax Rate (%)', invoice.taxRate],
      ['Tax Amount', calculations.tax],
      ['Shipping', calculations.shipping],
      ['Adjustment', calculations.adjustment],
      ['Invoice Total', calculations.total],
      ['Amount Paid', calculations.amountPaid],
      ['Balance Due', calculations.balanceDue]
    ];

    const csv = rows
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n');

    downloadFile(
      csv,
      `${invoice.invoiceNumber}.csv`,
      'text/csv;charset=utf-8;'
    );

    recordHistory('Exported invoice as CSV.');

    setToast({
      type: 'success',
      message: 'CSV export generated.'
    });
  };

  const importJSON = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));

        const candidate = parsed.invoice || parsed;

        if (
          !candidate ||
          typeof candidate !== 'object' ||
          !Array.isArray(candidate.items) ||
          !candidate.client ||
          !candidate.issuer
        ) {
          throw new Error('Invalid invoice structure.');
        }

        const validItems = candidate.items.every(
          (item) =>
            typeof item.label === 'string' &&
            Number.isFinite(Number(item.price)) &&
            Number(item.price) >= 0 &&
            Number.isInteger(Number(item.qty)) &&
            Number(item.qty) >= 1
        );

        if (!validItems) {
          throw new Error('One or more invoice line items are invalid.');
        }

        const restored = {
          ...createInitialInvoice(),
          ...candidate,
          id: createId(),
          client: {
            ...createInitialInvoice().client,
            ...candidate.client
          },
          issuer: {
            ...createInitialInvoice().issuer,
            ...candidate.issuer
          },
          items: candidate.items.map((item) => ({
            ...item,
            id: createId(),
            price: Number(item.price),
            qty: Number(item.qty)
          })),
          payments: Array.isArray(candidate.payments)
            ? candidate.payments.map((payment) => ({
                ...payment,
                id: createId(),
                amount: Number(payment.amount)
              }))
            : []
        };

        setShowConfirm({
          title: 'Import invoice backup?',
          message:
            `Import ${restored.invoiceNumber} and replace the current active invoice? ` +
            'Export your current invoice first if you need to preserve it.',
          confirmLabel: 'Import Invoice',
          variant: 'warning',
          onConfirm: () => {
            setInvoice(restored);
            setHistory([]);
            setActiveTab('invoice');

            recordHistory(`Imported invoice backup ${restored.invoiceNumber}.`);

            setToast({
              type: 'success',
              message: 'Invoice backup imported.'
            });
          }
        });
      } catch (error) {
        setToast({
          type: 'error',
          message: error.message || 'Unable to import this invoice file.'
        });
      }

      event.target.value = '';
    };

    reader.onerror = () => {
      setToast({
        type: 'error',
        message: 'Unable to read the selected file.'
      });

      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const handlePrint = () => {
    if (!invoice.client.name.trim()) {
      setToast({
        type: 'error',
        message: 'Enter the client name before printing.'
      });
      return;
    }

    window.print();

    recordHistory('Opened the print / PDF workflow.');
  };

  const copyInvoiceNumber = async () => {
    try {
      await navigator.clipboard.writeText(invoice.invoiceNumber);

      setToast({
        type: 'success',
        message: 'Invoice number copied.'
      });
    } catch {
      setToast({
        type: 'error',
        message: 'Clipboard access is unavailable in this browser.'
      });
    }
  };

  const emailInvoice = () => {
    if (!invoice.client.email.trim()) {
      setToast({
        type: 'error',
        message: 'Enter the client email address first.'
      });
      return;
    }

    const subject = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber} - ${invoice.client.name}`
    );

    const body = encodeURIComponent(
      [
        `Hello ${invoice.client.name},`,
        '',
        `Please find the details for invoice ${invoice.invoiceNumber}.`,
        `Invoice total: ${formatMoney(calculations.total, invoice.currency)}`,
        `Amount paid: ${formatMoney(calculations.amountPaid, invoice.currency)}`,
        `Balance due: ${formatMoney(calculations.balanceDue, invoice.currency)}`,
        `Due date: ${formatDate(invoice.dueDate)}`,
        '',
        invoice.notes,
        '',
        'Thank you.'
      ].join('\n')
    );

    recordHistory('Opened an email draft for the invoice.');

    window.location.href =
      `mailto:${encodeURIComponent(invoice.client.email)}` +
      `?subject=${subject}&body=${body}`;
  };

  return (
    <div className="invoice-wrapper">
      <header className="invoice-controls-header">
        <button
          type="button"
          className="invoice-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Exit Subsystem
        </button>

        <div className="invoice-toolbar">
          <span className="invoice-save-indicator">
            <span className="invoice-save-dot" />
            {savedAt
              ? `Saved locally at ${savedAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}`
              : 'Preparing workspace'}
          </span>

          <button
            type="button"
            className="invoice-exit-btn"
            onClick={() => setShowNewInvoiceOptions((previous) => !previous)}
          >
            + New Invoice
          </button>

          <button
            type="button"
            className="invoice-exit-btn"
            onClick={exportJSON}
          >
            Export Backup
          </button>

          <button
            type="button"
            className="invoice-exit-btn"
            onClick={handlePrint}
          >
            Print / PDF
          </button>
        </div>
      </header>

      {showNewInvoiceOptions && (
        <section className="invoice-action-panel">
          <div>
            <h3>Invoice Workspace</h3>
            <p>Create a fresh invoice or duplicate the current invoice as a new draft.</p>
          </div>

          <button
            type="button"
            className="invoice-add-btn"
            onClick={() => createNewInvoice(false)}
          >
            Create Blank Invoice
          </button>

          <button
            type="button"
            className="invoice-add-btn"
            onClick={() => createNewInvoice(true)}
          >
            Duplicate Current
          </button>
        </section>
      )}

      <section className="invoice-kpi-grid">
        <article className="invoice-kpi-card">
          <span>Invoice Total</span>
          <strong>{formatMoney(calculations.total, invoice.currency)}</strong>
          <small>Before any external processing fees</small>
        </article>

        <article className="invoice-kpi-card">
          <span>Amount Collected</span>
          <strong>{formatMoney(calculations.amountPaid, invoice.currency)}</strong>
          <small>{invoice.payments.length} recorded payment(s)</small>
        </article>

        <article className="invoice-kpi-card">
          <span>Outstanding Balance</span>
          <strong>{formatMoney(calculations.balanceDue, invoice.currency)}</strong>
          <small>
            {calculations.total > 0
              ? `${invoiceMetrics.completion.toFixed(1)}% collected`
              : 'No billable amount'}
          </small>
        </article>

        <article className="invoice-kpi-card">
          <span>Invoice Status</span>
          <strong className={`invoice-status-text invoice-status-${effectiveStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {effectiveStatus}
          </strong>
          <small>
            {isOverdue
              ? `${Math.ceil(
                  (new Date(`${getToday()}T12:00:00`) -
                    new Date(`${invoice.dueDate}T12:00:00`)) /
                    86400000
                )} day(s) overdue`
              : `Due ${formatDate(invoice.dueDate)}`}
          </small>
        </article>
      </section>

      <nav className="invoice-workspace-tabs" aria-label="Invoice workspace">
        <button
          type="button"
          className={activeTab === 'invoice' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveTab('invoice')}
        >
          Invoice Editor
        </button>

        <button
          type="button"
          className={activeTab === 'payments' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveTab('payments')}
        >
          Payments ({invoice.payments.length})
        </button>

        <button
          type="button"
          className={activeTab === 'analytics' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveTab('analytics')}
        >
          Financial Summary
        </button>

        <button
          type="button"
          className={activeTab === 'activity' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => {
            setActiveTab('activity');
            setShowHistory(true);
          }}
        >
          Activity Log
        </button>
      </nav>

      {activeTab === 'invoice' && (
        <main className="invoice-sheet">
          <div className="invoice-meta-row">
            <div className="invoice-heading-group">
              <span className="invoice-eyebrow">ACCOUNTS RECEIVABLE</span>

              <h1 className="invoice-brand-title">Enterprise Invoice</h1>

              <button
                type="button"
                className="invoice-number-copy"
                onClick={copyInvoiceNumber}
                title="Copy invoice number"
              >
                {invoice.invoiceNumber} ⧉
              </button>

              <div className="invoice-document-actions">
                <button
                  type="button"
                  className="invoice-text-action"
                  onClick={() => setShowClientEditor(true)}
                >
                  Edit Client
                </button>

                <button
                  type="button"
                  className="invoice-text-action"
                  onClick={() => setShowIssuerEditor(true)}
                >
                  Edit Issuer
                </button>
              </div>
            </div>

            <div className="date-block text-right">
              <label className="invoice-field">
                <span>Invoice Status</span>

                <select
                  value={invoice.status}
                  onChange={(event) => changeStatus(event.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>

              <label className="invoice-field">
                <span>Issue Date</span>

                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(event) => {
                    const issueDate = event.target.value;

                    updateInvoice({
                      issueDate,
                      dueDate: addDays(issueDate, invoice.paymentTerms)
                    });
                  }}
                />
              </label>

              <label className="invoice-field">
                <span>Due Date</span>

                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(event) =>
                    updateInvoice({ dueDate: event.target.value })
                  }
                />
              </label>

              <label className="invoice-field">
                <span>Payment Terms</span>

                <select
                  value={invoice.paymentTerms}
                  onChange={(event) => updatePaymentTerms(event.target.value)}
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term.value} value={term.value}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="invoice-field">
                <span>Currency</span>

                <select
                  value={invoice.currency}
                  onChange={(event) =>
                    updateInvoice({ currency: event.target.value })
                  }
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} · {currency.label}
                    </option>
                  ))}
                </select>
              </label>

              <span className={`invoice-status-badge invoice-status-${effectiveStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {effectiveStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <section className="invoice-party-grid">
            <article className="invoice-party-card">
              <span className="invoice-eyebrow">FROM</span>

              <h3>{invoice.issuer.name || 'Your Business'}</h3>

              <p>{invoice.issuer.email || 'No issuer email configured'}</p>

              {invoice.issuer.phone && <p>{invoice.issuer.phone}</p>}
              {invoice.issuer.address && <p>{invoice.issuer.address}</p>}
              {invoice.issuer.taxId && <p>Tax ID: {invoice.issuer.taxId}</p>}

              <button
                type="button"
                className="invoice-text-action"
                onClick={() => setShowIssuerEditor(true)}
              >
                Edit Business Details
              </button>
            </article>

            <article className="invoice-party-card">
              <span className="invoice-eyebrow">BILL TO</span>

              <h3>{invoice.client.name || 'Client not specified'}</h3>

              {invoice.client.company && <p>{invoice.client.company}</p>}
              {invoice.client.email && <p>{invoice.client.email}</p>}
              {invoice.client.phone && <p>{invoice.client.phone}</p>}

              {invoice.client.address && <p>{invoice.client.address}</p>}

              {[
                invoice.client.city,
                invoice.client.country
              ].filter(Boolean).join(', ') && (
                <p>
                  {[invoice.client.city, invoice.client.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}

              {invoice.client.taxId && <p>Tax ID: {invoice.client.taxId}</p>}

              <button
                type="button"
                className="invoice-text-action"
                onClick={() => setShowClientEditor(true)}
              >
                Edit Client Details
              </button>
            </article>
          </section>

          <section className="invoice-reference-grid">
            <label className="invoice-field">
              <span>Project / Contract</span>

              <input
                type="text"
                value={invoice.projectName}
                onChange={(event) =>
                  updateInvoice({ projectName: event.target.value })
                }
                placeholder="e.g. Website modernization"
              />
            </label>

            <label className="invoice-field">
              <span>Purchase Order</span>

              <input
                type="text"
                value={invoice.purchaseOrder}
                onChange={(event) =>
                  updateInvoice({ purchaseOrder: event.target.value })
                }
                placeholder="PO reference (optional)"
              />
            </label>

            <label className="invoice-field">
              <span>External Reference</span>

              <input
                type="text"
                value={invoice.reference}
                onChange={(event) =>
                  updateInvoice({ reference: event.target.value })
                }
                placeholder="Client reference (optional)"
              />
            </label>
          </section>

          <section className="invoice-line-items-section">
            <div className="invoice-section-heading">
              <div>
                <span className="invoice-eyebrow">BILLING BREAKDOWN</span>
                <h2>Invoice Line Items</h2>
                <p>
                  {invoiceMetrics.lineItems} line(s) across {invoiceMetrics.categories} categor{invoiceMetrics.categories === 1 ? 'y' : 'ies'}.
                </p>
              </div>

              <button
                type="button"
                className="invoice-add-btn"
                onClick={exportCSV}
              >
                Export CSV
              </button>
            </div>

            <div className="invoice-template-controls">
              <label className="invoice-field">
                <span>Service Templates</span>

                <select
                  value={presetSelection}
                  onChange={selectPreset}
                >
                  <option value="">Select a service template...</option>

                  {SERVICE_PRESETS.map((preset) => (
                    <option key={preset.label} value={preset.label}>
                      {preset.label} · {formatMoney(preset.price, invoice.currency)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="invoice-field">
                <span>Search Existing Lines</span>

                <input
                  type="search"
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search description or category..."
                />
              </label>
            </div>

            <form onSubmit={addItem} className="invoice-item-form">
              <input
                type="text"
                placeholder="Service or product name"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                maxLength={160}
                required
              />

              <input
                type="text"
                placeholder="Scope / description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                maxLength={300}
              />

              <select
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              >
                <option value="Development">Development</option>
                <option value="Consulting">Consulting</option>
                <option value="Security">Security</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Support">Support</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit price"
                value={newPrice}
                onChange={(event) => setNewPrice(event.target.value)}
                required
              />

              <input
                type="number"
                min="1"
                max="100000"
                step="1"
                placeholder="Qty"
                value={newQty}
                onChange={(event) => setNewQty(event.target.value)}
                required
              />

              <button type="submit" className="invoice-add-btn">
                + Add Line
              </button>
            </form>

            <div className="invoice-table-scroll">
              <table className="invoice-item-table">
                <thead>
                  <tr>
                    <th>Service Details / Scope</th>
                    <th>Category</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Line Total</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.label}</strong>

                        {item.description && (
                          <small className="invoice-item-description">
                            {item.description}
                          </small>
                        )}
                      </td>

                      <td>
                        <span className="invoice-category-badge">
                          {item.category || 'Other'}
                        </span>
                      </td>

                      <td className="text-center font-mono">{item.qty}</td>

                      <td className="text-right font-mono">
                        {formatMoney(item.price, invoice.currency)}
                      </td>

                      <td className="text-right font-mono">
                        {formatMoney(item.price * item.qty, invoice.currency)}
                      </td>

                      <td className="text-center">
                        <div className="invoice-row-actions">
                          <button
                            type="button"
                            className="invoice-text-action"
                            onClick={() => startEditItem(item)}
                            aria-label={`Edit ${item.label}`}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="invoice-text-action"
                            onClick={() => duplicateItem(item)}
                            aria-label={`Duplicate ${item.label}`}
                          >
                            Copy
                          </button>

                          <button
                            type="button"
                            className="invoice-del-btn"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.label}`}
                          >
                            Drop
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="invoice-empty-state">
                        {invoice.items.length === 0
                          ? 'No line items have been added yet.'
                          : 'No invoice lines match your search.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="invoice-financial-layout">
            <div className="invoice-adjustment-panel">
              <span className="invoice-eyebrow">ADJUSTMENTS</span>

              <h3>Tax & Pricing Controls</h3>

              <div className="invoice-adjustment-row">
                <div>
                  <strong>Tax Rate</strong>
                  <p>Applied to the discounted subtotal.</p>
                </div>

                <button
                  type="button"
                  className="invoice-text-action"
                  onClick={() => {
                    setTaxDraft(String(invoice.taxRate));
                    setShowTaxEditor(true);
                  }}
                >
                  {invoice.taxRate}% · Edit
                </button>
              </div>

              <div className="invoice-adjustment-row">
                <div>
                  <strong>Discount</strong>
                  <p>
                    {invoice.discountType === 'percentage'
                      ? `${invoice.discountValue}% off`
                      : `${formatMoney(invoice.discountValue, invoice.currency)} off`}
                  </p>
                </div>

                <button
                  type="button"
                  className="invoice-text-action"
                  onClick={() => {
                    setDiscountDraft({
                      type: invoice.discountType,
                      value: String(invoice.discountValue)
                    });
                    setShowDiscountEditor(true);
                  }}
                >
                  Configure
                </button>
              </div>

              <label className="invoice-field">
                <span>Shipping / Service Fees</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoice.shipping}
                  onChange={(event) =>
                    updateInvoice({
                      shipping: Math.max(0, Number(event.target.value) || 0)
                    })
                  }
                />
              </label>

              <label className="invoice-field">
                <span>Other Adjustment (+ / -)</span>

                <input
                  type="number"
                  step="0.01"
                  value={invoice.adjustment}
                  onChange={(event) =>
                    updateInvoice({
                      adjustment: Number(event.target.value) || 0
                    })
                  }
                />
              </label>

              <small className="invoice-helper-text">
                Tax is calculated after the discount and before shipping or other adjustments.
              </small>
            </div>

            <div className="invoice-summary-block">
              <div className="invoice-summary-heading">
                <h3>Financial Summary</h3>
                <span>{invoice.currency}</span>
              </div>

              <div className="summary-line">
                <span>Subtotal</span>
                <span className="font-mono">
                  {formatMoney(calculations.subtotal, invoice.currency)}
                </span>
              </div>

              <div className="summary-line">
                <span>Discount</span>
                <span className="font-mono invoice-negative-value">
                  −{formatMoney(calculations.discount, invoice.currency)}
                </span>
              </div>

              <div className="summary-line">
                <span>Taxable Amount</span>
                <span className="font-mono">
                  {formatMoney(calculations.taxableAmount, invoice.currency)}
                </span>
              </div>

              <div className="summary-line">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono">
                  {formatMoney(calculations.tax, invoice.currency)}
                </span>
              </div>

              <div className="summary-line">
                <span>Shipping / Fees</span>
                <span className="font-mono">
                  {formatMoney(calculations.shipping, invoice.currency)}
                </span>
              </div>

              <div className="summary-line">
                <span>Other Adjustment</span>
                <span className="font-mono">
                  {formatMoney(calculations.adjustment, invoice.currency)}
                </span>
              </div>

              <div className="summary-line grand-total-line">
                <span className="bold-total-label">INVOICE TOTAL</span>
                <span className="font-mono grand-total-display">
                  {formatMoney(calculations.total, invoice.currency)}
                </span>
              </div>

              <div className="summary-line">
                <span>Payments Received</span>
                <span className="font-mono">
                  −{formatMoney(calculations.amountPaid, invoice.currency)}
                </span>
              </div>

              <div className="summary-line invoice-balance-line">
                <span className="bold-total-label">BALANCE DUE</span>
                <span className="font-mono grand-total-display">
                  {formatMoney(calculations.balanceDue, invoice.currency)}
                </span>
              </div>

              {calculations.overpayment > 0 && (
                <div className="invoice-warning-banner">
                  Recorded payments exceed the invoice total by{' '}
                  {formatMoney(calculations.overpayment, invoice.currency)}.
                  Review the payment records.
                </div>
              )}
            </div>
          </section>

          <section className="invoice-notes-section">
            <div className="invoice-section-heading">
              <div>
                <span className="invoice-eyebrow">ADDITIONAL INFORMATION</span>
                <h3>Notes & Terms</h3>
              </div>

              <button
                type="button"
                className="invoice-text-action"
                onClick={() => setShowNotesEditor((previous) => !previous)}
              >
                {showNotesEditor ? 'Close Editor' : 'Edit Notes'}
              </button>
            </div>

            {showNotesEditor ? (
              <div className="invoice-notes-editor">
                <label className="invoice-field">
                  <span>Client Notes</span>

                  <textarea
                    rows="3"
                    value={invoice.notes}
                    onChange={(event) =>
                      updateInvoice({ notes: event.target.value })
                    }
                  />
                </label>

                <label className="invoice-field">
                  <span>Payment Terms & Conditions</span>

                  <textarea
                    rows="4"
                    value={invoice.terms}
                    onChange={(event) =>
                      updateInvoice({ terms: event.target.value })
                    }
                  />
                </label>

                <label className="invoice-field">
                  <span>Invoice Footer</span>

                  <input
                    type="text"
                    value={invoice.footer}
                    onChange={(event) =>
                      updateInvoice({ footer: event.target.value })
                    }
                  />
                </label>
              </div>
            ) : (
              <>
                <p>{invoice.notes || 'No additional notes.'}</p>
                <p>{invoice.terms || 'No payment terms specified.'}</p>
              </>
            )}
          </section>

          <footer className="invoice-footer-notes">
            <p>{invoice.footer}</p>
            <p>
              Invoice {invoice.invoiceNumber} · Issued {formatDate(invoice.issueDate)}
            </p>
          </footer>

          <div className="invoice-primary-actions">
            <button
              type="button"
              className="invoice-add-btn"
              onClick={emailInvoice}
            >
              Prepare Email
            </button>

            <button
              type="button"
              className="invoice-add-btn"
              onClick={() => setShowPaymentForm(true)}
            >
              + Record Payment
            </button>

            <button
              type="button"
              className="invoice-add-btn"
              onClick={markAsPaid}
              disabled={calculations.balanceDue <= 0}
            >
              Mark as Paid
            </button>

            <button
              type="button"
              className="invoice-exit-btn"
              onClick={exportJSON}
            >
              Export JSON
            </button>
          </div>
        </main>
      )}

      {activeTab === 'payments' && (
        <main className="invoice-sheet">
          <div className="invoice-section-heading">
            <div>
              <span className="invoice-eyebrow">ACCOUNTS RECEIVABLE</span>
              <h2>Payment Register</h2>
              <p>Track payments recorded against this invoice.</p>
            </div>

            <button
              type="button"
              className="invoice-add-btn"
              onClick={() => setShowPaymentForm(true)}
            >
              + Record Payment
            </button>
          </div>

          <section className="invoice-payment-overview">
            <article className="invoice-kpi-card">
              <span>Total Invoice</span>
              <strong>{formatMoney(calculations.total, invoice.currency)}</strong>
            </article>

            <article className="invoice-kpi-card">
              <span>Collected</span>
              <strong>{formatMoney(calculations.amountPaid, invoice.currency)}</strong>
            </article>

            <article className="invoice-kpi-card">
              <span>Outstanding</span>
              <strong>{formatMoney(calculations.balanceDue, invoice.currency)}</strong>
            </article>
          </section>

          <div
            className="invoice-payment-progress"
            role="progressbar"
            aria-label="Invoice payment progress"
            aria-valuenow={Math.round(invoiceMetrics.completion)}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="invoice-payment-progress-fill"
              style={{ width: `${invoiceMetrics.completion}%` }}
            />
          </div>

          <p className="invoice-progress-caption">
 {invoiceMetrics.completion.toFixed(1)}% of the invoice total has been collected.
          </p>

          <div className="invoice-table-scroll">
            <table className="invoice-item-table">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.date)}</td>
                    <td>{payment.method}</td>
                    <td>{payment.reference || '—'}</td>
                    <td className="text-right font-mono">
                      {formatMoney(payment.amount, invoice.currency)}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="invoice-del-btn"
                        onClick={() => removePayment(payment.id)}
                      >
                        Reverse Record
                      </button>
                    </td>
                  </tr>
                ))}

                {invoice.payments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="invoice-empty-state">
                      No payments have been recorded for this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-primary-actions">
            <button
              type="button"
              className="invoice-add-btn"
              onClick={markAsPaid}
              disabled={calculations.balanceDue <= 0}
            >
              Record Remaining Balance
            </button>

            <button
              type="button"
              className="invoice-exit-btn"
              onClick={() => setActiveTab('invoice')}
            >
              Return to Invoice
            </button>
          </div>
        </main>
      )}

      {activeTab === 'analytics' && (
        <main className="invoice-sheet">
          <div className="invoice-section-heading">
            <div>
              <span className="invoice-eyebrow">FINANCIAL INTELLIGENCE</span>
              <h2>Invoice Analysis</h2>
              <p>A breakdown of the current invoice's financial position.</p>
            </div>
          </div>

          <section className="invoice-kpi-grid">
            <article className="invoice-kpi-card">
              <span>Gross Subtotal</span>
              <strong>{formatMoney(calculations.subtotal, invoice.currency)}</strong>
              <small>Before discounts and tax</small>
            </article>

            <article className="invoice-kpi-card">
              <span>Total Discounts</span>
              <strong>{formatMoney(calculations.discount, invoice.currency)}</strong>
              <small>
                {calculations.subtotal > 0
                  ? `${((calculations.discount / calculations.subtotal) * 100).toFixed(2)}% of subtotal`
                  : 'No discount applied'}
              </small>
            </article>

            <article className="invoice-kpi-card">
              <span>Tax Contribution</span>
              <strong>{formatMoney(calculations.tax, invoice.currency)}</strong>
              <small>{invoice.taxRate}% configured tax rate</small>
            </article>

            <article className="invoice-kpi-card">
              <span>Average Line Value</span>
              <strong>{formatMoney(invoiceMetrics.averageLineValue, invoice.currency)}</strong>
              <small>Average subtotal per line item</small>
            </article>
          </section>

          <section className="invoice-analysis-panel">
            <h3>Revenue Composition</h3>

            {[
              {
                label: 'Net Billable Subtotal',
                value: calculations.taxableAmount
              },
              {
                label: 'Tax',
                value: calculations.tax
              },
              {
                label: 'Shipping / Fees',
                value: calculations.shipping
              },
              {
                label: 'Other Adjustment',
                value: calculations.adjustment
              }
            ].map((entry) => (
              <div className="invoice-analysis-row" key={entry.label}>
                <div className="invoice-analysis-row-heading">
                  <span>{entry.label}</span>
                  <strong>{formatMoney(entry.value, invoice.currency)}</strong>
                </div>

                <div className="invoice-analysis-track">
                  <div
                    className="invoice-analysis-fill"
                    style={{
                      width: `${
                        calculations.total > 0
                          ? Math.min(
                              100,
                              Math.max(0, entry.value / calculations.total * 100)
                            )
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="invoice-analysis-panel">
            <h3>Invoice Health</h3>

            <div className="invoice-analysis-row">
              <span>Payment Collection</span>
              <strong>{invoiceMetrics.completion.toFixed(1)}%</strong>
            </div>

            <div className="invoice-analysis-row">
              <span>Number of Line Items</span>
              <strong>{invoiceMetrics.lineItems}</strong>
            </div>

            <div className="invoice-analysis-row">
              <span>Number of Payment Records</span>
              <strong>{invoice.payments.length}</strong>
            </div>

            <div className="invoice-analysis-row">
              <span>Due Date</span>
              <strong>{formatDate(invoice.dueDate)}</strong>
            </div>

            <div className="invoice-analysis-row">
              <span>Days Until Due</span>
              <strong>
                {invoice.dueDate
                  ? Math.ceil(
                      (new Date(`${invoice.dueDate}T12:00:00`) -
                        new Date(`${getToday()}T12:00:00`)) /
                        86400000
                    )
                  : '—'}
              </strong>
            </div>

            <div className="invoice-analysis-row">
              <span>Current Collection Status</span>
              <strong>{effectiveStatus}</strong>
            </div>
          </section>

          <div className="invoice-primary-actions">
            <button
              type="button"
              className="invoice-add-btn"
              onClick={exportCSV}
            >
              Export Financial CSV
            </button>

            <button
              type="button"
              className="invoice-add-btn"
              onClick={exportJSON}
            >
              Download Full Backup
            </button>
          </div>
        </main>
      )}

      {activeTab === 'activity' && (
        <main className="invoice-sheet">
          <div className="invoice-section-heading">
            <div>
              <span className="invoice-eyebrow">AUDIT TRAIL</span>
              <h2>Invoice Activity</h2>
              <p>Recent changes recorded during this workspace session.</p>
            </div>
          </div>

          <div className="invoice-activity-list">
            {history.map((entry) => (
              <article className="invoice-activity-entry" key={entry.id}>
                <span className="invoice-activity-dot" />

                <div>
                  <strong>{entry.message}</strong>
                  <small>
                    {new Date(entry.timestamp).toLocaleString()}
                  </small>
                </div>
              </article>
            ))}

            {history.length === 0 && (
              <div className="invoice-empty-state">
                No activity has been recorded during this session.
              </div>
            )}
          </div>

          <p className="invoice-helper-text">
            This activity log is held in component state. Export a JSON backup to preserve it with the invoice.
          </p>
        </main>
      )}

      {showClientEditor && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => setShowClientEditor(false)}
        >
          <section
            className="glassmorphism-card task-glass-card invoice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-client-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span className="invoice-eyebrow">BILLING CONTACT</span>
                <h2 id="invoice-client-heading">Client Details</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setShowClientEditor(false)}
                aria-label="Close client editor"
              >
                ×
              </button>
            </div>

            <form
              className="invoice-modal-form"
              onSubmit={(event) => {
                event.preventDefault();

                if (!invoice.client.name.trim()) {
                  setToast({
                    type: 'error',
                    message: 'Client name is required.'
                  });
                  return;
                }

                if (
                  invoice.client.email &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.client.email)
                ) {
                  setToast({
                    type: 'error',
                    message: 'Enter a valid client email address.'
                  });
                  return;
                }

                recordHistory('Updated client billing details.');
                setShowClientEditor(false);

                setToast({
                  type: 'success',
                  message: 'Client details updated.'
                });
              }}
            >
              <label className="invoice-field">
                <span>Client / Contact Name *</span>

                <input
                  autoFocus
                  required
                  value={invoice.client.name}
                  onChange={(event) => updateClient('name', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Company</span>

                <input
                  value={invoice.client.company}
                  onChange={(event) => updateClient('company', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Email Address</span>

                <input
                  type="email"
                  value={invoice.client.email}
                  onChange={(event) => updateClient('email', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Phone</span>

                <input
                  value={invoice.client.phone}
                  onChange={(event) => updateClient('phone', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Billing Address</span>

                <textarea
                  rows="2"
                  value={invoice.client.address}
                  onChange={(event) => updateClient('address', event.target.value)}
                />
              </label>

              <div className="invoice-modal-grid">
                <label className="invoice-field">
                  <span>City</span>

                  <input
                    value={invoice.client.city}
                    onChange={(event) => updateClient('city', event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>Country</span>

                  <input
                    value={invoice.client.country}
                    onChange={(event) => updateClient('country', event.target.value)}
                  />
                </label>
              </div>

              <label className="invoice-field">
                <span>Tax Identification Number</span>

                <input
                  value={invoice.client.taxId}
                  onChange={(event) => updateClient('taxId', event.target.value)}
                />
              </label>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Save Client Details
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => setShowClientEditor(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showIssuerEditor && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => setShowIssuerEditor(false)}
        >
          <section
            className="glassmorphism-card task-glass-card invoice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-issuer-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span className="invoice-eyebrow">ISSUING BUSINESS</span>
                <h2 id="invoice-issuer-heading">Your Business Details</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setShowIssuerEditor(false)}
                aria-label="Close business editor"
              >
                ×
              </button>
            </div>

            <form
              className="invoice-modal-form"
              onSubmit={(event) => {
                event.preventDefault();

                recordHistory('Updated issuer business details.');
                setShowIssuerEditor(false);

                setToast({
                  type: 'success',
                  message: 'Business details updated.'
                });
              }}
            >
              <label className="invoice-field">
                <span>Business Name *</span>

                <input
                  required
                  value={invoice.issuer.name}
                  onChange={(event) => updateIssuer('name', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Business Email</span>

                <input
                  type="email"
                  value={invoice.issuer.email}
                  onChange={(event) => updateIssuer('email', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Phone Number</span>

                <input
                  value={invoice.issuer.phone}
                  onChange={(event) => updateIssuer('phone', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Business Address</span>

                <textarea
                  rows="3"
                  value={invoice.issuer.address}
                  onChange={(event) => updateIssuer('address', event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Tax Identification Number</span>

                <input
                  value={invoice.issuer.taxId}
                  onChange={(event) => updateIssuer('taxId', event.target.value)}
                />
              </label>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Save Business Details
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => setShowIssuerEditor(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingItem && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => {
            setEditingItemId(null);
            setEditingItem(null);
          }}
        >
          <section
            className="glassmorphism-card task-glass-card invoice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-edit-line-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span className="invoice-eyebrow">LINE ITEM EDITOR</span>
                <h2 id="invoice-edit-line-heading">Edit Invoice Line</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => {
                  setEditingItemId(null);
                  setEditingItem(null);
                }}
                aria-label="Close line editor"
              >
                ×
              </button>
            </div>

            <form className="invoice-modal-form" onSubmit={saveEditedItem}>
              <label className="invoice-field">
                <span>Description *</span>

                <input
                  autoFocus
                  required
                  value={editingItem.label}
                  onChange={(event) =>
                    setEditingItem((previous) => ({
                      ...previous,
                      label: event.target.value
                    }))
                  }
                />
              </label>

              <label className="invoice-field">
                <span>Scope / Description</span>

                <textarea
                  rows="3"
                  value={editingItem.description || ''}
                  onChange={(event) =>
                    setEditingItem((previous) => ({
                      ...previous,
                      description: event.target.value
                    }))
                  }
                />
              </label>

              <label className="invoice-field">
                <span>Category</span>

                <select
                  value={editingItem.category || 'Other'}
                  onChange={(event) =>
                    setEditingItem((previous) => ({
                      ...previous,
                      category: event.target.value
                    }))
                  }
                >
                  <option value="Development">Development</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Security">Security</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Support">Support</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
</select>
              </label>

              <div className="invoice-modal-grid">
                <label className="invoice-field">
                  <span>Unit Price</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editingItem.price}
                    onChange={(event) =>
                      setEditingItem((previous) => ({
                        ...previous,
                        price: event.target.value
                      }))
                    }
                  />
                </label>

                <label className="invoice-field">
                  <span>Quantity</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={editingItem.qty}
                    onChange={(event) =>
                      setEditingItem((previous) => ({
                        ...previous,
                        qty: event.target.value
                      }))
                    }
                  />
                </label>
              </div>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => {
                    setEditingItemId(null);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showPaymentForm && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => setShowPaymentForm(false)}
        >
          <section
            className="glassmorphism-card task-glass-card invoice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-payment-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span className="invoice-eyebrow">ACCOUNTS RECEIVABLE</span>
                <h2 id="invoice-payment-heading">Record Payment</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setShowPaymentForm(false)}
                aria-label="Close payment form"
              >
                ×
              </button>
            </div>

            <div className="invoice-payment-due-card">
              <span>Outstanding Balance</span>
              <strong>
                {formatMoney(calculations.balanceDue, invoice.currency)}
              </strong>
            </div>

            <form className="invoice-modal-form" onSubmit={recordPayment}>
              <label className="invoice-field">
                <span>Payment Amount ({invoice.currency}) *</span>

                <input
                  autoFocus
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  placeholder={calculations.balanceDue.toFixed(2)}
                />
              </label>

              <button
                type="button"
                className="invoice-text-action"
                onClick={() =>
                  setPaymentAmount(calculations.balanceDue.toFixed(2))
                }
                disabled={calculations.balanceDue <= 0}
              >
                Fill Outstanding Balance
              </button>

              <label className="invoice-field">
                <span>Payment Date *</span>

                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>Payment Method</span>

                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="invoice-field">
                <span>Transaction Reference</span>

                <input
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="Bank reference / transaction ID"
                />
              </label>

              <div className="invoice-warning-banner">
                This records a payment in the local invoice workspace. It does not charge a card or verify receipt from a bank.
              </div>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Record Payment
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showTaxEditor && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => setShowTaxEditor(false)}
        >
          <section
            className="glassmorphism-card task-glass-card invoice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-tax-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span className="invoice-eyebrow">TAX CONFIGURATION</span>
                <h2 id="invoice-tax-heading">Configure Tax Rate</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setShowTaxEditor(false)}
                aria-label="Close tax editor"
              >
                ×
              </button>
            </div>

            <form className="invoice-modal-form" onSubmit={applyTax}>
              <label className="invoice-field">
                <span>Tax Rate (%)</span>

                <input
                  autoFocus
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  value={taxDraft}
                  onChange={(event) => setTaxDraft(event.target.value)}
                />
              </label>

              <div className="invoice-preset-buttons">
                {[0, 5, 7.5, 10, 15, 20].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    className="filter-tab"
                    onClick={() => setTaxDraft(String(rate))}
                  >
                    {rate}%
                  </button>
                ))}
              </div>

              <div className="invoice-modal-preview">
                Estimated tax: {formatMoney(
                  calculations.taxableAmount *
                    Math.max(0, Number(taxDraft) || 0) /
                    100,
                  invoice.currency
                )}
              </div>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Apply Tax Rate
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => setShowTaxEditor(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showDiscountEditor && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => setShowDiscountEditor(false)}
        >
          <section
            className="glassmorphism-card task-glass-card invoice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-discount-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <div>
                <span className="invoice-eyebrow">PRICING ADJUSTMENT</span>
                <h2 id="invoice-discount-heading">Configure Discount</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setShowDiscountEditor(false)}
                aria-label="Close discount editor"
              >
                ×
              </button>
            </div>

            <form className="invoice-modal-form" onSubmit={applyDiscount}>
              <label className="invoice-field">
                <span>Discount Type</span>

                <select
                  value={discountDraft.type}
                  onChange={(event) =>
                    setDiscountDraft((previous) => ({
                      ...previous,
                      type: event.target.value
                    }))
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </label>

              <label className="invoice-field">
                <span>
                  Discount {discountDraft.type === 'percentage' ? '(%)' : `(${invoice.currency})`}
                </span>

                <input
                  autoFocus
                  type="number"
                  min="0"
                  max={discountDraft.type === 'percentage' ? 100 : undefined}
                  step="0.01"
                  required
                  value={discountDraft.value}
                  onChange={(event) =>
                    setDiscountDraft((previous) => ({
                      ...previous,
                      value: event.target.value
                    }))
                  }
                />
              </label>

              <div className="invoice-modal-preview">
                Estimated discount:{' '}
                {formatMoney(
                  discountDraft.type === 'percentage'
                    ? calculations.subtotal *
                        Math.min(100, Math.max(0, Number(discountDraft.value) || 0)) /
                        100
                    : Math.min(
                        calculations.subtotal,
                        Math.max(0, Number(discountDraft.value) || 0)
                      ),
                  invoice.currency
                )}
              </div>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Apply Discount
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => setShowDiscountEditor(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showConfirm && (
        <div
          className="task-modal-overlay invoice-modal-overlay"
          onClick={() => setShowConfirm(null)}
        >
          <section
            className={`glassmorphism-card task-glass-card invoice-confirm-modal invoice-confirm-${showConfirm.variant}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="invoice-confirm-heading"
            aria-describedby="invoice-confirm-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="invoice-confirm-icon">
              {showConfirm.variant === 'danger'
                ? '!'
                : showConfirm.variant === 'success'
                  ? '✓'
                  : '⚠'}
            </div>

            <div className="invoice-confirm-content">
              <span className="invoice-eyebrow">CONFIRM ACTION</span>

              <h2 id="invoice-confirm-heading">{showConfirm.title}</h2>

              <p id="invoice-confirm-description">{showConfirm.message}</p>
            </div>

            <div className="task-form-actions">
              <button
                type="button"
                className={
                  showConfirm.variant === 'danger'
                    ? 'stock-danger-action'
                    : 'submit-task-btn'
                }
                onClick={() => {
                  const action = showConfirm.onConfirm;

                  setShowConfirm(null);
                  action();
                }}
              >
                {showConfirm.confirmLabel}
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {showHistory && activeTab === 'activity' && (
        <div className="invoice-history-toolbar">
          <button
            type="button"
            className="invoice-exit-btn"
            onClick={() => setShowHistory(false)}
          >
            Hide Activity Details
          </button>
        </div>
      )}

      <div className="invoice-import-controls">
        <label className="invoice-text-action invoice-import-label">
          Import JSON Backup

          <input
            type="file"
            accept=".json,application/json"
            onChange={importJSON}
          />
        </label>

        <button
          type="button"
          className="invoice-text-action"
          onClick={() => {
            setShowConfirm({
              title: 'Clear all payment records?',
              message:
                'This removes every payment record from the current invoice and recalculates the full outstanding balance.',
              confirmLabel: 'Clear Payments',
              variant: 'danger',
              onConfirm: () => {
                updateInvoice({ payments: [] });

                recordHistory('Cleared all payment records.');

                setToast({
                  type: 'success',
                  message: 'Payment records cleared.'
                });
              }
            });
          }}
          disabled={invoice.payments.length === 0}
        >
          Clear Payment Records
        </button>
      </div>

      {toast && (
        <div
          className={`invoice-toast invoice-toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{toast.type === 'error' ? '!' : toast.type === 'success' ? '✓' : 'i'}</span>
          <p>{toast.message}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

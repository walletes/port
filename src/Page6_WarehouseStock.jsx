import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './Page6_WarehouseStock.css';

const STORAGE_KEY = 'portfolio_warehouse_inventory_v2';
const ACTIVITY_KEY = 'portfolio_warehouse_activity_v2';

const INITIAL_ITEMS = [
  {
    sku: 'SKU-882',
    label: 'ARM Core System Control Boards',
    quantity: 42,
    bay: 'A-04',
    limit: 15,
    unitPrice: 240,
    category: 'Electronics',
    supplier: 'Core Systems Ltd',
    description: 'Embedded system control boards for hardware integration.',
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    sku: 'SKU-419',
    label: 'Cat6 External Shielded Network Cables',
    quantity: 8,
    bay: 'B-12',
    limit: 10,
    unitPrice: 18.5,
    category: 'Networking',
    supplier: 'Network Supply Co',
    description: 'Shielded outdoor-grade Ethernet cables.',
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    sku: 'SKU-301',
    label: 'Solid-State Flash System Disks (2TB)',
    quantity: 156,
    bay: 'C-01',
    limit: 20,
    unitPrice: 110,
    category: 'Storage',
    supplier: 'DataCore Distribution',
    description: 'High-performance solid-state storage drives.',
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    sku: 'SKU-504',
    label: 'Power Distribution Rail Modules (48V)',
    quantity: 5,
    bay: 'D-09',
    limit: 8,
    unitPrice: 320,
    category: 'Power',
    supplier: 'PowerGrid Components',
    description: '48V power distribution modules for rack systems.',
    updatedAt: new Date().toISOString(),
    archived: false
  }
];

const STOCK_CATEGORIES = [
  'Electronics',
  'Networking',
  'Storage',
  'Power',
  'Cables',
  'Hardware',
  'Peripherals',
  'Other'
];

const PRIORITY_OPTIONS = ['Critical', 'High', 'Normal', 'Low'];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const formatCurrency = (amount) => currencyFormatter.format(amount);

const formatDate = (value) => {
  if (!value) return 'Not recorded';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const getStockStatus = (item) => {
  if (item.quantity === 0) return 'out';
  if (item.quantity <= item.limit) return 'low';
  return 'healthy';
};

const createId = (prefix = 'MOV') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const escapeCSV = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export default function Page6_WarehouseStock({ setPage }) {
  const [items, setItems] = useState(() => {
    const stored = readStorage(STORAGE_KEY, null);

    if (!Array.isArray(stored)) return INITIAL_ITEMS;

    return stored
      .filter((item) =>
        item &&
        typeof item.sku === 'string' &&
        typeof item.label === 'string'
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(0, Number(item.quantity) || 0),
        limit: Math.max(0, Number(item.limit) || 0),
        unitPrice: Math.max(0, Number(item.unitPrice) || 0),
        category: item.category || 'Other',
        supplier: item.supplier || '',
        description: item.description || '',
        updatedAt: item.updatedAt || new Date().toISOString(),
        archived: Boolean(item.archived)
      }));
  });

  const [activity, setActivity] = useState(() => {
    const stored = readStorage(ACTIVITY_KEY, []);
    return Array.isArray(stored) ? stored.slice(0, 100) : [];
  });

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showArchived, setShowArchived] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards');

  const [isAdding, setIsAdding] = useState(false);
  const [editingSku, setEditingSku] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [adjustmentItem, setAdjustmentItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('1');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const [bulkAction, setBulkAction] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState('1');

  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');

  const [form, setForm] = useState({
    sku: '',
    label: '',
    quantity: '',
    bay: 'A-01',
    limit: '10',
    unitPrice: '50.00',
    category: 'Electronics',
    supplier: '',
    description: ''
  });

  const searchRef = useRef(null);
  const importRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      showToast('Storage is full. Export a backup to preserve your inventory.');
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
    } catch {
      // Inventory operations remain available if activity storage fails.
    }
  }, [activity]);

  useEffect(() => {
    if (!toast) return undefined;

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(toastTimerRef.current);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        );

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === 'Escape') {
        setIsAdding(false);
        setEditingSku(null);
        setSelectedSku(null);
        setAdjustmentItem(null);
        setImportPreview(null);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const recordActivity = useCallback((message, metadata = {}) => {
    const entry = {
      id: createId('ACT'),
      message,
      metadata,
      timestamp: new Date().toISOString()
    };

    setActivity((previous) => [entry, ...previous].slice(0, 100));
  }, []);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm({
      sku: '',
      label: '',
      quantity: '',
      bay: 'A-01',
      limit: '10',
      unitPrice: '50.00',
      category: 'Electronics',
      supplier: '',
      description: ''
    });

    setEditingSku(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsAdding(true);
  };

  const openEditForm = (item) => {
    setForm({
      sku: item.sku,
      label: item.label,
      quantity: String(item.quantity),
      bay: item.bay,
      limit: String(item.limit),
      unitPrice: String(item.unitPrice),
      category: item.category || 'Other',
      supplier: item.supplier || '',
      description: item.description || ''
    });

    setEditingSku(item.sku);
    setSelectedSku(null);
    setIsAdding(true);
  };

  const handleSaveItem = (event) => {
    event.preventDefault();

    const normalizedSku = form.sku.trim().toUpperCase();
    const normalizedLabel = form.label.trim();
    const normalizedBay = form.bay.trim().toUpperCase();

    const quantity = Number(form.quantity);
    const limit = Number(form.limit);
    const unitPrice = Number(form.unitPrice);

    if (!normalizedLabel || !normalizedBay) {
      showToast('Item name and shelf location are required.', 'error');
      return;
    }

    if (
      form.quantity.trim() === '' ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      showToast('Enter a valid non-negative whole-number quantity.', 'error');
      return;
    }

    if (
      form.limit.trim() === '' ||
      !Number.isInteger(limit) ||
      limit < 0
    ) {
      showToast('The reorder threshold must be a non-negative whole number.', 'error');
      return;
    }

    if (
      form.unitPrice.trim() === '' ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      showToast('Enter a valid non-negative unit price.', 'error');
      return;
    }

    const sku = normalizedSku || `SKU-${Date.now().toString().slice(-8)}`;

    const duplicate = items.some((item) =>
      item.sku.toUpperCase() === sku &&
      item.sku !== editingSku
    );

    if (duplicate) {
      showToast(`SKU ${sku} already exists. Choose a unique identifier.`, 'error');
      return;
    }

    const timestamp = new Date().toISOString();

    const itemData = {
      sku,
      label: normalizedLabel,
      quantity,
      bay: normalizedBay,
      limit,
      unitPrice,
      category: form.category,
      supplier: form.supplier.trim(),
      description: form.description.trim(),
      updatedAt: timestamp,
      archived: false
    };

    if (editingSku) {
      const previousItem = items.find((item) => item.sku === editingSku);

      setItems((previous) =>
        previous.map((item) =>
          item.sku === editingSku
            ? { ...itemData, archived: item.archived }
            : item
        )
      );

      recordActivity(`Updated inventory record ${sku}.`, {
        sku,
        previousQuantity: previousItem?.quantity,
        newQuantity: quantity
      });

      showToast(`${sku} updated successfully.`);
    } else {
      setItems((previous) => [itemData, ...previous]);

      recordActivity(`Registered new inventory item ${sku}.`, {
        sku,
        quantity
      });

      showToast(`${sku} added to inventory.`);
    }

    resetForm();
    setIsAdding(false);
  };

  const adjustStock = (sku, amount, reason = 'Manual stock adjustment') => {
    const item = items.find((entry) => entry.sku === sku);

    if (!item) {
      showToast('Inventory item could not be found.', 'error');
      return;
    }

    const nextQuantity = item.quantity + amount;

    if (nextQuantity < 0) {
      showToast('Insufficient stock for this adjustment.', 'error');
      return;
    }

    setItems((previous) =>
      previous.map((entry) =>
        entry.sku === sku
          ? {
              ...entry,
              quantity: nextQuantity,
              updatedAt: new Date().toISOString()
            }
          : entry
      )
    );

    recordActivity(
      `${amount >= 0 ? 'Received' : 'Removed'} ${Math.abs(amount)} units of ${sku}.`,
      {
        sku,
        amount,
        previousQuantity: item.quantity,
        newQuantity: nextQuantity,
        reason
      }
    );

    showToast(`${sku}: stock updated to ${nextQuantity} units.`);
  };

  const openAdjustment = (item, type) => {
    setAdjustmentItem(item);
    setAdjustmentType(type);
    setAdjustmentQuantity('1');
    setAdjustmentReason('');
  };

  const handleAdjustmentSubmit = (event) => {
    event.preventDefault();

    if (!adjustmentItem) return;

    const quantity = Number(adjustmentQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      showToast('Enter a positive whole-number quantity.', 'error');
      return;
    }

    const amount = adjustmentType === 'in' ? quantity : -quantity;

    if (adjustmentItem.quantity + amount < 0) {
      showToast('This transaction would reduce stock below zero.', 'error');
      return;
    }

    adjustStock(
      adjustmentItem.sku,
      amount,
      adjustmentReason.trim() || (
        adjustmentType === 'in' ? 'Stock received' : 'Stock issued'
      )
    );

    setAdjustmentItem(null);
  };

const handleDeleteItem = (sku) => {
  const item = items.find((entry) => entry.sku === sku);

  if (!item) return;

  setConfirmAction({
  title: 'Delete Inventory Item?',
  message: `You're about to permanently delete ${item.sku} (${item.label}). This action cannot be undone.`,
  confirmLabel: 'Delete Permanently',
  variant: 'danger',
  onConfirm: () => {
  setItems((previous) =>
  previous.filter((entry) => entry.sku !== sku)
  );

  setSelectedItems((previous) =>
  previous.filter((entry) => entry !== sku)
  );

  setSelectedSku(null);

  recordActivity(`Permanently deleted inventory item ${sku}.`, { sku });

  showToast(`${sku} deleted.`);
  }
  });
  };

  const toggleArchive = (sku) => {
    const item = items.find((entry) => entry.sku === sku);

    if (!item) return;

    const archived = !item.archived;

    setItems((previous) =>
      previous.map((entry) =>
        entry.sku === sku
          ? {
              ...entry,
              archived,
              updatedAt: new Date().toISOString()
            }
          : entry
      )
    );

    recordActivity(
      `${archived ? 'Archived' : 'Restored'} inventory item ${sku}.`,
      { sku }
    );

    setSelectedSku(null);
    showToast(`${sku} ${archived ? 'archived' : 'restored'}.`);
  };

  const metrics = useMemo(() => {
    const activeItems = items.filter((item) => !item.archived);
    const totalUnits = activeItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = activeItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const lowStockCount = activeItems.filter(
      (item) => getStockStatus(item) === 'low'
    ).length;

    const outOfStockCount = activeItems.filter(
      (item) => item.quantity === 0
    ).length;

    const healthyCount = activeItems.filter(
      (item) => getStockStatus(item) === 'healthy'
    ).length;

    const potentialReorderUnits = activeItems.reduce((sum, item) => {
      const shortage = Math.max(0, item.limit - item.quantity);
      return sum + shortage;
    }, 0);

    return {
      totalSKUs: activeItems.length,
      totalUnits,
      totalValue,
      lowStockCount,
      outOfStockCount,
      healthyCount,
      potentialReorderUnits
    };
  }, [items]);

  const availableCategories = useMemo(() => {
    return [...new Set(items.map((item) => item.category || 'Other'))].sort();
  }, [items]);

  const availableSuppliers = useMemo(() => {
    return [...new Set(items.map((item) => item.supplier).filter(Boolean))].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = items.filter((item) => {
      if (showArchived ? !item.archived : item.archived) return false;

      const searchableText = [
        item.sku,
        item.label,
        item.bay,
        item.category,
        item.supplier,
        item.description
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(normalizedSearch);
      const status = getStockStatus(item);

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && status === 'low') ||
        (stockFilter === 'out' && status === 'out') ||
        (stockFilter === 'healthy' && status === 'healthy');

      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      const matchesSupplier =
        supplierFilter === 'all' || item.supplier === supplierFilter;

      return (
        matchesSearch &&
        matchesStock &&
        matchesCategory &&
        matchesSupplier
      );
    });

    const priorityRank = { out: 0, low: 1, healthy: 2 };

    result.sort((a, b) => {
      switch (sortBy) {
        case 'quantity-low':
          return a.quantity - b.quantity;

        case 'quantity-high':
          return b.quantity - a.quantity;

        case 'value-high':
          return (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice);

        case 'sku':
          return a.sku.localeCompare(b.sku);

        case 'location':
          return a.bay.localeCompare(b.bay);

        case 'status':
          return priorityRank[getStockStatus(a)] - priorityRank[getStockStatus(b)];

        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

        case 'name':
        default:
          return a.label.localeCompare(b.label);
      }
    });

    return result;
  }, [
    items,
    search,
    stockFilter,
    categoryFilter,
    supplierFilter,
    sortBy,
    showArchived
  ]);

  const selectedItem = useMemo(
    () => items.find((item) => item.sku === selectedSku) || null,
    [items, selectedSku]
  );

  const selectedVisibleItems = filteredItems.filter(
    (item) => selectedItems.includes(item.sku)
  );

  const allVisibleSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedItems.includes(item.sku));

  const toggleItemSelection = (sku) => {
    setSelectedItems((previous) =>
      previous.includes(sku)
        ? previous.filter((entry) => entry !== sku)
        : [...previous, sku]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleSkus = new Set(filteredItems.map((item) => item.sku));
      setSelectedItems((previous) =>
        previous.filter((sku) => !visibleSkus.has(sku))
      );
    } else {
      setSelectedItems((previous) => [
        ...new Set([
          ...previous,
          ...filteredItems.map((item) => item.sku)
        ])
      ]);
    }
  };

  const handleBulkAction = () => {
    if (!selectedItems.length) {
      showToast('Select at least one inventory item.', 'error');
      return;
    }

    if (bulkAction === 'archive') {
      const confirmed = window.confirm(
        `Archive ${selectedItems.length} selected inventory items?`
      );

      if (!confirmed) return;

      setItems((previous) =>
        previous.map((item) =>
          selectedItems.includes(item.sku)
            ? { ...item, archived: true, updatedAt: new Date().toISOString() }
            : item
        )
      );

      recordActivity(`Archived ${selectedItems.length} inventory items.`, {
        skus: selectedItems
      });

      setSelectedItems([]);
      setBulkAction('');
      showToast('Selected inventory items archived.');
      return;
    }

    if (bulkAction === 'delete') {
      const confirmed = window.confirm(
        `Permanently delete ${selectedItems.length} selected inventory items?`
      );

      if (!confirmed) return;

      const skus = [...selectedItems];

      setItems((previous) =>
        previous.filter((item) => !skus.includes(item.sku))
      );

      recordActivity(`Deleted ${skus.length} inventory items.`, { skus });

      setSelectedItems([]);
      setBulkAction('');
  showToast('Selected inventory items deleted.');
      return;
    }

    if (bulkAction === 'restore') {
      setItems((previous) =>
        previous.map((item) =>
          selectedItems.includes(item.sku)
            ? { ...item, archived: false, updatedAt: new Date().toISOString() }
            : item
        )
      );

      recordActivity(`Restored ${selectedItems.length} inventory items.`, {
        skus: selectedItems
      });

      setSelectedItems([]);
      setBulkAction('');
      showToast('Selected inventory items restored.');
      return;
    }

    if (bulkAction === 'receive' || bulkAction === 'issue') {
      const quantity = Number(bulkQuantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        showToast('Enter a valid positive quantity.', 'error');
        return;
      }

      const amount = bulkAction === 'receive' ? quantity : -quantity;
      const selected = items.filter((item) => selectedItems.includes(item.sku));

      const invalidItem = selected.find((item) => item.quantity + amount < 0);

      if (invalidItem) {
        showToast(
          `Cannot issue ${quantity} units: ${invalidItem.sku} only has ${invalidItem.quantity}.`,
          'error'
        );
        return;
      }

      setItems((previous) =>
        previous.map((item) =>
          selectedItems.includes(item.sku)
            ? {
                ...item,
                quantity: item.quantity + amount,
                updatedAt: new Date().toISOString()
              }
            : item
        )
      );

      recordActivity(
        `${bulkAction === 'receive' ? 'Received' : 'Issued'} ${quantity} units for each of ${selected.length} selected items.`,
        {
          skus: selectedItems,
          amountPerItem: amount
        }
      );

      setSelectedItems([]);
      setBulkAction('');
      showToast('Bulk stock adjustment completed.');
      return;
    }

    showToast('Choose a bulk operation first.', 'error');
  };

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Description',
      'Category',
      'Supplier',
      'Shelf Bay',
      'Quantity',
      'Reorder Limit',
      'Unit Price',
      'Total Value',
      'Status',
      'Archived',
      'Last Updated'
    ];

    const rows = filteredItems.map((item) => [
      item.sku,
      item.label,
      item.category,
      item.supplier,
      item.bay,
      item.quantity,
      item.limit,
      item.unitPrice.toFixed(2),
      (item.quantity * item.unitPrice).toFixed(2),
      getStockStatus(item),
      item.archived ? 'Yes' : 'No',
      item.updatedAt
    ]);

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\r\n');

    downloadFile(
      `warehouse_manifest_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv;charset=utf-8;'
    );

    showToast('CSV manifest exported.');
  };

  const handleExportJSON = () => {
    const backup = {
      application: 'Portfolio Warehouse Inventory',
      version: 2,
      exportedAt: new Date().toISOString(),
      items,
      activity
    };

    downloadFile(
      JSON.stringify(backup, null, 2),
      `warehouse_backup_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );

    showToast('Workspace backup exported.');
  };

  const handleChooseImport = () => {
    setImportError('');
    setImportPreview(null);
    importRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedItems = Array.isArray(parsed) ? parsed : parsed.items;

      if (!Array.isArray(importedItems)) {
        throw new Error('The selected file does not contain an inventory item array.');
      }

      const seenSkus = new Set();

      const normalizedItems = importedItems.map((item, index) => {
        if (
          !item ||
          typeof item.sku !== 'string' ||
          typeof item.label !== 'string' ||
          !item.sku.trim() ||
          !item.label.trim()
        ) {
          throw new Error(`Invalid item at row ${index + 1}: SKU and description are required.`);
        }

        const sku = item.sku.trim().toUpperCase();

        if (seenSkus.has(sku)) {
          throw new Error(`Duplicate SKU found in backup: ${sku}.`);
        }

        seenSkus.add(sku);

        const quantity = Number(item.quantity);
        const limit = Number(item.limit);
        const unitPrice = Number(item.unitPrice);

        if (
          !Number.isInteger(quantity) ||
          quantity < 0 ||
          !Number.isInteger(limit) ||
          limit < 0 ||
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          throw new Error(`Invalid stock values for ${sku}.`);
        }

        return {
          sku,
          label: item.label.trim(),
          quantity,
          bay: String(item.bay || 'UNASSIGNED').trim().toUpperCase(),
          limit,
          unitPrice,
          category: item.category || 'Other',
          supplier: item.supplier || '',
          description: item.description || '',
          updatedAt: item.updatedAt || new Date().toISOString(),
          archived: Boolean(item.archived)
        };
      });

      setImportPreview({
        fileName: file.name,
        items: normalizedItems
      });

      setImportError('');
    } catch (error) {
      setImportPreview(null);
      setImportError(error.message || 'Could not read this backup file.');
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;

    const confirmed = window.confirm(
      `Replace your current inventory with ${importPreview.items.length} items from "${importPreview.fileName}"? Export a backup first if you need to keep the current inventory.`
    );

    if (!confirmed) return;

    setItems(importPreview.items);
    setSelectedItems([]);
    setSelectedSku(null);
    setImportPreview(null);

    recordActivity(
      `Imported ${importPreview.items.length} inventory records from a backup.`,
      { fileName: importPreview.fileName }
    );

    showToast('Inventory backup imported successfully.');
  };

const handleResetDemoData = () => {
  setConfirmAction({
  title: 'Reset Demo Inventory?',
  message:
  'This will replace your current inventory with the original data. Your existing inventory records will be lost unless you export a backup first.',
  confirmLabel: 'Reset Inventory',
  variant: 'warning',
  onConfirm: () => {
  setItems(INITIAL_ITEMS);
  setSelectedItems([]);
  setSelectedSku(null);

  recordActivity('Restored inventory.');

  showToast('Inventory restored.');
  }
  });
  };

  const renderStatusBadge = (item) => {
    const status = getStockStatus(item);

    const label =
      status === 'out'
        ? 'Out of Stock'
        : status === 'low'
          ? 'Low Stock'
          : 'Healthy';

    return (
      <span className={`stock-status-badge stock-status-${status}`}>
        {status === 'out' ? '●' : status === 'low' ? '⚠' : '✓'} {label}
      </span>
    );
  };

  const renderStockProgress = (item) => {
    const percentage =
      item.limit > 0
        ? Math.min(100, Math.round((item.quantity / item.limit) * 100))
        : item.quantity > 0
          ? 100
          : 0;

    return (
      <div className="stock-progress-group">
        <div
          className="stock-progress-track"
          role="progressbar"
          aria-label={`Stock level for ${item.label}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div
            className={`stock-progress-fill stock-progress-${getStockStatus(item)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span className="stock-progress-label">
          {item.quantity} / {item.limit} reorder threshold
        </span>
      </div>
    );
  };

  const renderItemActions = (item) => (
    <div className="stock-item-actions">
      <button
        type="button"
        className="qty-adjust-btn"
        onClick={() => openAdjustment(item, 'out')}
        disabled={item.quantity === 0}
        aria-label={`Issue stock for ${item.label}`}
        title="Issue stock"
      >
        −
      </button>

      <button
        type="button"
        className="qty-adjust-btn"
        onClick={() => openAdjustment(item, 'in')}
        aria-label={`Receive stock for ${item.label}`}
        title="Receive stock"
      >
        +
      </button>

      <button
        type="button"
        className="stock-secondary-action"
        onClick={() => setSelectedSku(item.sku)}
      >
        Details
      </button>

      <button
        type="button"
        className="stock-secondary-action"
        onClick={() => openEditForm(item)}
      >
        Edit
      </button>
    </div>
  );

  const renderItemCard = (item) => {
    const status = getStockStatus(item);
    const totalValue = item.quantity * item.unitPrice;

    return (
      <article
        key={item.sku}
        className={`manifest-card ${status === 'low' || status === 'out' ? 'low-stock-alert' : ''} stock-record-card stock-record-${status}`}
      >
        <div className="stock-card-selection">
          <label className="stock-select-label">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.sku)}
              onChange={() => toggleItemSelection(item.sku)}
              aria-label={`Select ${item.sku}`}
            />
            Select item
          </label>

          {renderStatusBadge(item)}
        </div>

        <div className="card-identity-row">
          <span className="sku-tag">{item.sku}</span>

          <span className="bay-location">
            Location: Shelf <strong>{item.bay}</strong>
          </span>
        </div>

        <h2 className="item-label-text">{item.label}</h2>

        <div className="stock-card-metadata">
          <span>{item.category}</span>
          {item.supplier && <span>Supplier: {item.supplier}</span>}
        </div>

        {item.description && (
          <p className="stock-item-description">{item.description}</p>
        )}

        <div className="stock-counter-row">
          <div className="counter-display">
            <span className="count-number">{item.quantity}</span>
            <span className="count-unit">Units on hand</span>
          </div>

          <div className="stock-value-display">
            <span>Inventory value</span>
            <strong>{formatCurrency(totalValue)}</strong>
            <small>{formatCurrency(item.unitPrice)} per unit</small>
          </div>
        </div>

        {renderStockProgress(item)}

        {(status === 'low' || status === 'out') && (
          <div className="low-stock-notice" role="status">
            <strong>{status === 'out' ? 'Critical stock alert' : 'Reorder recommended'}</strong>
            <p>
              {status === 'out'
                ? 'This item is currently out of stock.'
                : `Current stock is at or below its reorder threshold of ${item.limit} units.`}
            </p>
          </div>
        )}

        <div className="stock-card-footer">
          <span>Updated {formatDate(item.updatedAt)}</span>
          {renderItemActions(item)}
        </div>

        <div className="stock-archive-actions">
          <button
            type="button"
            className="stock-secondary-action"
            onClick={() => toggleArchive(item.sku)}
          >
            Archive
          </button>

          <button
            type="button"
            className="stock-danger-action"
            onClick={() => handleDeleteItem(item.sku)}
          >
            Delete
          </button>
        </div>
      </article>
    );
  };

  const renderItemRow = (item) => (
    <tr key={item.sku} className={`stock-table-row stock-table-${getStockStatus(item)}`}>
      <td>
        <input
          type="checkbox"
          checked={selectedItems.includes(item.sku)}
          onChange={() => toggleItemSelection(item.sku)}
          aria-label={`Select ${item.sku}`}
        />
      </td>
      <td>{item.sku}</td>
      <td>
        <button
          type="button"
          className="stock-table-item-link"
          onClick={() => setSelectedSku(item.sku)}
        >
          {item.label}
        </button>
        <small>{item.category}</small>
      </td>
      <td>{item.bay}</td>
      <td>{item.quantity}</td>
      <td>{item.limit}</td>
      <td>{formatCurrency(item.unitPrice)}</td>
      <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
      <td>{renderStatusBadge(item)}</td>
      <td>{renderItemActions(item)}</td>
    </tr>
  );

  return (
    <div className="stock-wrapper">
      <header className="stock-header">
        <button
          type="button"
          className="exit-terminal-btn"
          onClick={() => setPage('home')}
        >
          ← Close Operations
        </button>

        <div className="stock-header-identity">
          <span className="terminal-badge">DEMO</span>
          <span className="stock-live-indicator">
            </span>
        </div>

        <button
          type="button"
          className="exit-terminal-btn"
          onClick={handleExportJSON}
        >
          Create Backup
        </button>
      </header>

      <section className="stock-dashboard-heading">
        <div>
          <p className="stock-eyebrow">OPERATIONS / WAREHOUSE / INVENTORY</p>

          <h1 className="stock-title">Warehouse Inventory Console</h1>

          <p className="stock-subtitle">
            Inventory intelligence, stock movement, reorder monitoring and asset valuation.
          </p>
        </div>

        <div className="stock-dashboard-heading-actions">
          <button
            type="button"
            className="exit-terminal-btn"
            onClick={openAddForm}
          >
            + Register SKU
          </button>

          <button
            type="button"
            className="exit-terminal-btn"
            onClick={handleExportCSV}
          >
            ↓ Export Manifest
          </button>
        </div>
      </section>

      <section className="stock-kpi-grid" aria-label="Inventory summary">
        <article className="stock-kpi-card">
          <span className="stock-kpi-label">Active SKUs</span>
          <strong className="stock-kpi-value">{metrics.totalSKUs}</strong>
          <span className="stock-kpi-footnote">Unique active inventory records</span>
        </article>

        <article className="stock-kpi-card">
          <span className="stock-kpi-label">Total Units</span>
          <strong className="stock-kpi-value">
            {metrics.totalUnits.toLocaleString()}
          </strong>
          <span className="stock-kpi-footnote">Physical units recorded</span>
        </article>

        <article className="stock-kpi-card">
          <span className="stock-kpi-label">Inventory Valuation</span>
          <strong className="stock-kpi-value">
            {formatCurrency(metrics.totalValue)}
          </strong>
          <span className="stock-kpi-footnote">Quantity × recorded unit cost</span>
        </article>

        <article className="stock-kpi-card stock-kpi-warning">
          <span className="stock-kpi-label">Low Stock</span>
          <strong className="stock-kpi-value">{metrics.lowStockCount}</strong>
          <span className="stock-kpi-footnote">
            {metrics.outOfStockCount} items currently out of stock
          </span>
        </article>
      </section>

      {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
        <section className="stock-alert-center" aria-live="polite">
          <div className="stock-alert-center-heading">
            <span className="stock-alert-icon">⚠</span>
            <div>
              <h2>Inventory attention required</h2>
              <p>
                {metrics.outOfStockCount > 0
                  ? `${metrics.outOfStockCount} item(s) are out of stock.`
                  : `${metrics.lowStockCount} item(s) are at or below their reorder threshold.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="exit-terminal-btn"
            onClick={() => {
              setStockFilter('low');
              setShowArchived(false);
            }}
          >
            Review Low Stock
          </button>
        </section>
      )}

      <section className="manifest-controls">
        <div className="stock-toolbar-heading">
          <div>
            <h2>Inventory Manifest</h2>
            <p>
              Showing {filteredItems.length} of {items.filter((item) => item.archived === showArchived).length} records
            </p>
          </div>

          <div className="stock-toolbar-view-switch">
            <button
              type="button"
              className={`filter-tab ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              aria-pressed={viewMode === 'cards'}
            >
              Card View
            </button>

            <button
              type="button"
              className={`filter-tab ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
            >
              Table View
            </button>
          </div>
        </div>

        <div className="stock-search-toolbar">
          <input
            ref={searchRef}
            type="search"
            placeholder="Search SKU, item, bay, category, supplier...  (press / to focus)"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="stock-search-input"
            aria-label="Search inventory"
          />

          <button
            type="button"
            className="exit-terminal-btn"
            onClick={() => setShowFilters((previous) => !previous)}
            aria-expanded={showFilters}
          >
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>

          <button
            type="button"
            className="exit-terminal-btn"
            onClick={() => {
              setSearch('');
              setStockFilter('all');
              setCategoryFilter('all');
              setSupplierFilter('all');
              setSortBy('name');
            }}
          >
            Reset
          </button>
        </div>

        <div className="priority-filter-tabs stock-status-filters">
          {[
            ['all', 'All Stock'],
            ['low', 'Low Stock'],
            ['out', 'Out of Stock'],
            ['healthy', 'Healthy']
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`filter-tab ${stockFilter === value ? 'active' : ''}`}
              onClick={() => setStockFilter(value)}
              aria-pressed={stockFilter === value}
            >
              {label}
              {value === 'low' && ` (${metrics.lowStockCount})`}
              {value === 'out' && ` (${metrics.outOfStockCount})`}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="stock-advanced-filters glass-card">
            <div className="stock-filter-field">
              <label htmlFor="stock-category-filter">Category</label>
              <select
                id="stock-category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
{availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="stock-filter-field">
              <label htmlFor="stock-supplier-filter">Supplier</label>
              <select
                id="stock-supplier-filter"
                value={supplierFilter}
                onChange={(event) => setSupplierFilter(event.target.value)}
              >
                <option value="all">All suppliers</option>
                {availableSuppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="stock-filter-field">
              <label htmlFor="stock-sort-filter">Sort by</label>
              <select
                id="stock-sort-filter"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="name">Item name</option>
                <option value="sku">SKU identifier</option>
                <option value="location">Shelf location</option>
                <option value="quantity-low">Quantity: lowest first</option>
                <option value="quantity-high">Quantity: highest first</option>
                <option value="value-high">Inventory value: highest first</option>
                <option value="status">Stock status</option>
                <option value="updated">Recently updated</option>
              </select>
            </div>

            <div className="stock-filter-field">
              <label htmlFor="stock-archive-toggle">Archived records</label>
              <button
                id="stock-archive-toggle"
                type="button"
                className="filter-tab"
                onClick={() => {
                  setShowArchived((previous) => !previous);
                  setSelectedItems([]);
                }}
                aria-pressed={showArchived}
              >
                {showArchived ? 'Viewing Archived' : 'View Archived'}
              </button>
            </div>
          </div>
        )}

        <div className="stock-bulk-toolbar">
          <label className="stock-select-all">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              disabled={filteredItems.length === 0}
            />
            Select all visible ({filteredItems.length})
          </label>

          <span>{selectedItems.length} selected</span>

          <select
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
            aria-label="Bulk inventory action"
          >
            <option value="">Choose bulk action</option>
            <option value="receive">Receive stock per item</option>
            <option value="issue">Issue stock per item</option>
            {showArchived && <option value="restore">Restore selected</option>}
            {!showArchived && <option value="archive">Archive selected</option>}
            <option value="delete">Permanently delete selected</option>
          </select>

          {(bulkAction === 'receive' || bulkAction === 'issue') && (
            <input
              type="number"
              min="1"
              step="1"
              value={bulkQuantity}
              onChange={(event) => setBulkQuantity(event.target.value)}
              aria-label="Quantity per selected item"
            />
          )}

          <button
            type="button"
            className="exit-terminal-btn"
            onClick={handleBulkAction}
            disabled={selectedItems.length === 0 || !bulkAction}
          >
            Apply to Selected
          </button>
        </div>
      </section>

      <main className="manifest-list">
        {filteredItems.length === 0 ? (
          <div className="empty-stock-message stock-empty-state">
            <span className="stock-empty-icon">⌕</span>
            <h2>No inventory records found</h2>
            <p>
              Try changing your search or filters, or register a new inventory item.
            </p>
            <button
              type="button"
              className="exit-terminal-btn"
              onClick={openAddForm}
            >
              + Register SKU
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="stock-card-grid">
            {filteredItems.map(renderItemCard)}
          </div>
        ) : (
          <div className="stock-table-container">
            <table className="stock-inventory-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Reorder Limit</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{filteredItems.map(renderItemRow)}</tbody>
            </table>
          </div>
        )}
      </main>

      <section className="stock-bottom-insights">
        <article className="stock-insight-card">
          <span>Healthy Inventory</span>
          <strong>{metrics.healthyCount} SKUs</strong>
          <p>Items currently above their reorder thresholds.</p>
        </article>

        <article className="stock-insight-card">
          <span>Potential Reorder Shortfall</span>
          <strong>{metrics.potentialReorderUnits} units</strong>
          <p>
            Combined gap between current stock and reorder limits for items below their thresholds.
          </p>
        </article>

        <article className="stock-insight-card">
          <span>Archived Records</span>
          <strong>{items.filter((item) => item.archived).length}</strong>
          <p>Inactive items excluded from active inventory valuation.</p>
        </article>
      </section>

      <section className="board-footer-toolbar stock-footer-toolbar">
        <div>
          <strong>Workspace management</strong>
          <span>
            {items.length} records · {activity.length} activity events
          </span>
        </div>

        <div className="board-export-actions">
          <button
            type="button"
            className="filter-tab"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={handleExportJSON}
          >
            Backup JSON
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={handleChooseImport}
          >
            Import Backup
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={() => setShowActivity((previous) => !previous)}
            aria-expanded={showActivity}
          >
            {showActivity ? 'Hide Activity' : 'Activity Log'}
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={handleResetDemoData}
          >
            Reset Demo Data
          </button>
        </div>

        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          hidden
        />
      </section>

      {showActivity && (
        <section className="stock-activity-panel glass-card">
          <div className="stock-panel-heading">
            <div>
              <h2> Activity Log</h2>
              <p>Recent inventory changes.</p>
            </div>

            <button
              type="button"
              className="filter-tab"
              onClick={() => setActivity([])}
            >
              Clear Log
            </button>
          </div>

          {activity.length === 0 ? (
            <p className="empty-stock-message">No activity has been recorded yet.</p>
          ) : (
            <div className="stock-activity-list">
              {activity.map((entry) => (
                <article key={entry.id} className="stock-activity-entry">
                  <span className="stock-activity-marker" />
                  <div>
                    <strong>{entry.message}</strong>
                    <time dateTime={entry.timestamp}>
                      {formatDate(entry.timestamp)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {isAdding && (
        <div
          className="task-modal-overlay stock-modal-overlay"
          onClick={() => {
            setIsAdding(false);
            resetForm();
          }}
        >
          <section
            className="glassmorphism-card task-glass-card stock-editor-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-editor-heading"
          >
            <header className="task-modal-header">
              <div>
                <span className="stock-eyebrow">
                  WAREHOUSE / {editingSku ? 'EDIT RECORD' : 'NEW RECORD'}
                </span>
                <h2 id="stock-editor-heading">
                  {editingSku ? `Edit ${editingSku}` : 'Register Inventory Item'}
                </h2>
                <p>Manage item identity, stock levels, location and valuation.</p>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
                aria-label="Close inventory form"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveItem} className="stock-editor-form">
              <div className="stock-editor-grid">
                <div className="form-group">
                  <label htmlFor="stock-sku">SKU Identifier</label>
                  <input
                    id="stock-sku"
                    type="text"
                    value={form.sku}
                    onChange={(event) => updateForm('sku', event.target.value)}
                    placeholder="e.g. SKU-910"
                    disabled={Boolean(editingSku)}
                  />
                  <small>Leave blank to generate an identifier.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="stock-label">Item Description</label>
                  <input
                    id="stock-label"
                    type="text"
                    value={form.label}
                    onChange={(event) => updateForm('label', event.target.value)}
                    placeholder="e.g. Fiber Patch Cables"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock-quantity">Units on Hand</label>
                  <input
                    id="stock-quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={(event) => updateForm('quantity', event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock-limit">Reorder Threshold</label>
                  <input
                    id="stock-limit"
                    type="number"
                    min="0"
                    step="1"
                    value={form.limit}
                    onChange={(event) => updateForm('limit', event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock-bay">Shelf / Bay Location</label>
                  <input
                    id="stock-bay"
                    type="text"
                    value={form.bay}
                    onChange={(event) => updateForm('bay', event.target.value)}
                    placeholder="e.g. A-04"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock-price">Unit Cost (USD)</label>
                  <input
                    id="stock-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(event) => updateForm('unitPrice', event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock-category">Category</label>
                  <select
                    id="stock-category"
                    value={form.category}
                    onChange={(event) => updateForm('category', event.target.value)}
                  >
                    {STOCK_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="stock-supplier">Supplier</label>
                  <input
                    id="stock-supplier"
                    type="text"
                    value={form.supplier}
                    onChange={(event) => updateForm('supplier', event.target.value)}
                    placeholder="Supplier or distributor"
                  />
                </div>

                <div className="form-group stock-description-field">
                  <label htmlFor="stock-description">Additional Notes</label>
                  <textarea
                    id="stock-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    placeholder="Technical specifications, handling notes or other details..."
                  />
                </div>
              </div>

              <div className="stock-editor-preview">
                <span>Projected stock valuation</span>
                <strong>
                  {formatCurrency(
                    Math.max(0, Number(form.quantity) || 0) *
                    Math.max(0, Number(form.unitPrice) || 0)
                  )}
                </strong>
              </div>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  {editingSku ? 'Save Changes' : 'Commit Inventory Record'}
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {adjustmentItem && (
        <div
          className="task-modal-overlay stock-modal-overlay"
          onClick={() => setAdjustmentItem(null)}
        >
          <section
            className="glassmorphism-card task-glass-card stock-adjustment-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-adjustment-heading"
          >
            <header className="task-modal-header">
              <div>
                <span className="stock-eyebrow">STOCK MOVEMENT</span>
                <h2 id="stock-adjustment-heading">
                  {adjustmentType === 'in' ? 'Receive Inventory' : 'Issue Inventory'}
                </h2>
                <p>{adjustmentItem.sku} · {adjustmentItem.label}</p>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setAdjustmentItem(null)}
                aria-label="Close stock adjustment"
              >
                ✕
              </button>
            </header>

            <div className="stock-adjustment-current">
              <span>Current quantity</span>
              <strong>{adjustmentItem.quantity} units</strong>
            </div>

            <form onSubmit={handleAdjustmentSubmit}>
              <div className="form-group">
                <label htmlFor="stock-adjustment-quantity">Quantity</label>
                <input
                  id="stock-adjustment-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={adjustmentQuantity}
                  onChange={(event) => setAdjustmentQuantity(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock-adjustment-reason">Reason / Reference</label>
                <input
                  id="stock-adjustment-reason"
                  type="text"
                  value={adjustmentReason}
                  onChange={(event) => setAdjustmentReason(event.target.value)}
                  placeholder={
                    adjustmentType === 'in'
                      ? 'e.g. Supplier delivery / PO reference'
                      : 'e.g. Order fulfilment / damaged units'
                  }
                />
              </div>

              <div className="stock-adjustment-projection">
                <span>Projected quantity</span>
                <strong>
                  {adjustmentItem.quantity +
                    (adjustmentType === 'in' ? 1 : -1) *
                    Math.max(0, Number(adjustmentQuantity) || 0)}
                </strong>
              </div>

              <div className="task-form-actions">
                <button type="submit" className="submit-task-btn">
                  Confirm {adjustmentType === 'in' ? 'Receipt' : 'Issue'}
                </button>

                <button
                  type="button"
                  className="filter-tab"
                  onClick={() => setAdjustmentItem(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedItem && (
        <div
          className="task-modal-overlay stock-modal-overlay"
          onClick={() => setSelectedSku(null)}
        >
          <section
            className="glassmorphism-card task-glass-card stock-details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-details-heading"
          >
            <header className="task-modal-header">
              <div>
                <span className="stock-eyebrow">INVENTORY RECORD / {selectedItem.sku}</span>
                <h2 id="stock-details-heading">{selectedItem.label}</h2>
                {renderStatusBadge(selectedItem)}
              </div>

              <button
                type="button"
                className="task-modal-close"
onClick={() => setSelectedSku(null)}
                aria-label="Close item details"
              >
                ✕
              </button>
            </header>

            <div className="stock-details-grid">
              <div>
                <span>SKU</span>
                <strong>{selectedItem.sku}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{selectedItem.bay}</strong>
              </div>
              <div>
                <span>Available Units</span>
                <strong>{selectedItem.quantity}</strong>
              </div>
              <div>
                <span>Reorder Threshold</span>
                <strong>{selectedItem.limit}</strong>
              </div>
              <div>
                <span>Unit Cost</span>
                <strong>{formatCurrency(selectedItem.unitPrice)}</strong>
              </div>
              <div>
                <span>Total Valuation</span>
                <strong>
                  {formatCurrency(selectedItem.quantity * selectedItem.unitPrice)}
                </strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{selectedItem.category}</strong>
              </div>
              <div>
                <span>Supplier</span>
                <strong>{selectedItem.supplier || 'Not specified'}</strong>
              </div>
              <div>
                <span>Last Updated</span>
                <strong>{formatDate(selectedItem.updatedAt)}</strong>
              </div>
            </div>

            <div className="stock-details-description">
              <h3>Item Notes</h3>
              <p>{selectedItem.description || 'No additional notes recorded.'}</p>
            </div>

            {renderStockProgress(selectedItem)}

            <div className="task-form-actions">
              <button
                type="button"
                className="submit-task-btn"
                onClick={() => openEditForm(selectedItem)}
              >
                Edit Record
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => openAdjustment(selectedItem, 'in')}
              >
                Receive Stock
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => openAdjustment(selectedItem, 'out')}
                disabled={selectedItem.quantity === 0}
              >
                Issue Stock
              </button>
            </div>
          </section>
        </div>
      )}

      {importError && (
        <div className="stock-import-error" role="alert">
          <strong>Import failed</strong>
          <p>{importError}</p>
          <button
            type="button"
            className="task-modal-close"
            onClick={() => setImportError('')}
          >
            ✕
          </button>
        </div>
      )}

      {importPreview && (
        <div
          className="task-modal-overlay stock-modal-overlay"
          onClick={() => setImportPreview(null)}
        >
          <section
            className="glassmorphism-card task-glass-card stock-import-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-import-heading"
          >
            <header className="task-modal-header">
              <div>
                <span className="stock-eyebrow">WORKSPACE RESTORE</span>
                <h2 id="stock-import-heading">Review Inventory Import</h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => setImportPreview(null)}
                aria-label="Cancel import"
              >
                ✕
              </button>
            </header>

            <div className="stock-import-summary">
              <span>Selected backup</span>
              <strong>{importPreview.fileName}</strong>
              <span>Validated inventory records</span>
              <strong>{importPreview.items.length}</strong>
              <span>Estimated inventory value</span>
              <strong>
                {formatCurrency(
                  importPreview.items.reduce(
                    (sum, item) => sum + item.quantity * item.unitPrice,
                    0
                  )
                )}
              </strong>
            </div>

            <p>
              Confirming this import replaces the current inventory. Export a backup
              first if you need to preserve the existing records.
            </p>

            <div className="task-form-actions">
              <button
                type="button"
                className="submit-task-btn"
                onClick={confirmImport}
              >
                Replace Inventory
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => setImportPreview(null)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
{confirmAction && (
  <div
  className="task-modal-overlay stock-modal-overlay"
  onClick={() => setConfirmAction(null)}
  >
  <section
  className={`glassmorphism-card task-glass-card stock-confirm-modal stock-confirm-${confirmAction.variant}`}
  onClick={(event) => event.stopPropagation()}
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="stock-confirm-heading"
  aria-describedby="stock-confirm-description"
  >
  <div className="stock-confirm-icon">
  {confirmAction.variant === 'danger' ? '!' : '⚠'}
  </div>

  <div className="stock-confirm-content">
  <span className="stock-eyebrow">CONFIRM ACTION</span>

  <h2 id="stock-confirm-heading">
  {confirmAction.title}
  </h2>

  <p id="stock-confirm-description">
  {confirmAction.message}
  </p>
  </div>

  <div className="task-form-actions stock-confirm-actions">
  <button
  type="button"
  className={
  confirmAction.variant === 'danger'
  ? 'stock-danger-action'
  : 'submit-task-btn'
  }
  onClick={() => {
  const action = confirmAction.onConfirm;
  setConfirmAction(null);
  action();
  }}
  >
  {confirmAction.confirmLabel}
  </button>

  <button
  type="button"
  className="filter-tab"
  onClick={() => setConfirmAction(null)}
  >
  Cancel
  </button>
  </div>
  </section>
  </div>
  )}
      {toast && (
        <div
          className={`stock-toast stock-toast-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span>{toast.type === 'error' ? '⚠' : '✓'}</span>
          <p>{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

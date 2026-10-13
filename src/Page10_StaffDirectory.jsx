
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './Page10_StaffDirectory.css';

const INITIAL_TEAM = [
  {
    id: 'EMP-01',
    name: 'Prince Osinachi',
    title: 'Principal Systems Engineer',
    dept: 'ENGINEERING',
    email: 'prince@company.com',
    phone: '+234 808 354 3955',
    clearance: 'L4 - Omega',
    location: 'China',
    skills: ['Rust', 'C Native', 'React', 'Smart Contracts', 'FFmpeg'],
    status: 'Active',
    joinedAt: '2024-02-12',
    accessReviewedAt: null,
    notes: '',
    clearanceHistory: [],
    createdAt: '2024-02-12T09:00:00.000Z',
    updatedAt: '2024-02-12T09:00:00.000Z'
  },
  {
    id: 'EMP-02',
    name: 'Kalu',
    title: 'Product Operations Lead',
    dept: 'PRODUCT',
    email: 'ama@company.com',
    phone: '+234 701 442 1199',
    clearance: 'L3 - Executive',
    location: 'Spain',
    skills: ['Agile Management', 'Roadmap', 'Sprint Telemetry'],
    status: 'Active',
    joinedAt: '2024-04-08',
    accessReviewedAt: null,
    notes: '',
    clearanceHistory: [],
    createdAt: '2024-04-08T09:00:00.000Z',
    updatedAt: '2024-04-08T09:00:00.000Z'
  },
  {
    id: 'EMP-03',
    name: ' Bakare',
    title: 'Lead Security Auditor',
    dept: 'SECURITY',
    email: 'tunde@company.com',
    phone: '+234 812 009 8833',
    clearance: 'L4 - Omega',
    location: 'England',
    skills: ['Zero-Knowledge', 'C Auditing', 'Penetration Testing'],
    status: 'Active',
    joinedAt: '2023-11-20',
    accessReviewedAt: null,
    notes: '',
    clearanceHistory: [],
    createdAt: '2023-11-20T09:00:00.000Z',
    updatedAt: '2023-11-20T09:00:00.000Z'
  },
  {
    id: 'EMP-04',
    name: 'Ebere',
    title: 'Logistics & Chain Supervisor',
    dept: 'OPERATIONS',
    email: 'ebere@company.com',
    phone: '+234 903 112 4455',
    clearance: 'L2 - Elevated',
    location: 'Nigeria',
    skills: ['Supply Manifests', 'Inventory Systems', 'ERP Sync'],
    status: 'Active',
    joinedAt: '2024-06-17',
    accessReviewedAt: null,
    notes: '',
    clearanceHistory: [],
    createdAt: '2024-06-17T09:00:00.000Z',
    updatedAt: '2024-06-17T09:00:00.000Z'
  },
  {
    id: 'EMP-05',
    name: ' Okafor',
    title: 'Legacy Component Manager',
    dept: 'DEPRECATED',
    email: 'chinedu@company.com',
    phone: 'Discontinued',
    clearance: 'L1 - Revoked',
    location: 'USA',
    skills: ['COBOL', 'Legacy DB'],
    status: 'Inactive',
    joinedAt: '2022-01-10',
    accessReviewedAt: null,
    notes: 'Legacy profile retained for demonstration.',
    clearanceHistory: [],
    createdAt: '2022-01-10T09:00:00.000Z',
    updatedAt: '2022-01-10T09:00:00.000Z'
  }
];

const DEPARTMENTS = [
  'ENGINEERING',
  'PRODUCT',
  'SECURITY',
  'OPERATIONS',
  'DEPRECATED'
];

const CLEARANCES = [
  'L4 - Omega',
  'L3 - Executive',
  'L2 - Elevated',
  'L1 - Revoked'
];

const STATUSES = ['Active', 'Inactive', 'Archived'];

const STORAGE_KEY = 'staff-directory-v2';
const AUDIT_KEY = 'staff-directory-audit-v2';

const emptyForm = {
  name: '',
  title: '',
  dept: 'ENGINEERING',
  email: '',
  phone: '',
  clearance: 'L2 - Elevated',
  location: 'Lagos, Nigeria',
  skills: '',
  status: 'Active',
  joinedAt: new Date().toISOString().slice(0, 10),
  notes: ''
};

const safeReadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const clearanceRank = (clearance) => {
  const rank = Number(String(clearance).match(/^L(\d)/)?.[1]);
  return Number.isFinite(rank) ? rank : 0;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const escapeCsv = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const formatDate = (value) => {
  if (!value) return 'Never reviewed';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function Page10_StaffDirectory({ setPage }) {
  const [team, setTeam] = useState(() =>
    safeReadStorage(STORAGE_KEY, INITIAL_TEAM)
  );

  const [auditLog, setAuditLog] = useState(() =>
    safeReadStorage(AUDIT_KEY, [])
  );

  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState('grid');

  const [activeProfile, setActiveProfile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAllVisible, setSelectAllVisible] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);

  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL');

  const toastTimerRef = useRef(null);
  const searchRef = useRef(null);
  const formRef = useRef(null);

  const triggerToast = useCallback((message) => {
    setToastMessage(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    } catch {
      triggerToast('Roster could not be saved to local storage.');
    }
  }, [team, triggerToast]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLog.slice(0, 500)));
    } catch {
      triggerToast('Audit history could not be saved locally.');
    }
  }, [auditLog, triggerToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const recordAudit = useCallback((action, person, details = '') => {
    const event = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      employeeId: person?.id || 'SYSTEM',
      employeeName: person?.name || 'System',
      details,
      timestamp: new Date().toISOString()
    };

    setAuditLog((previous) => [event, ...previous].slice(0, 500));
  }, []);

  const getNextEmployeeId = useCallback(() => {
    const maxId = team.reduce((max, person) => {
      const match = person.id.match(/^EMP-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `EMP-${String(maxId + 1).padStart(2, '0')}`;
  }, [team]);

  const locationOptions = useMemo(() => {
    return [...new Set(team.map((person) => person.location).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [team]);

  const metrics = useMemo(() => {
    const visibleRoster = team.filter((person) =>
      showArchived ? true : person.status !== 'Archived'
    );

    const active = visibleRoster.filter(
      (person) => person.status === 'Active'
    ).length;

    const inactive = visibleRoster.filter(
      (person) => person.status === 'Inactive'
    ).length;

    const archived = team.filter(
      (person) => person.status === 'Archived'
    ).length;

    const clearanceCounts = CLEARANCES.map((clearance) => ({
      clearance,
      count: visibleRoster.filter(
        (person) => person.clearance === clearance
      ).length
    }));

    const departmentCounts = DEPARTMENTS.map((dept) => ({
      dept,
      count: visibleRoster.filter((person) => person.dept === dept).length
    }));

    const reviewDue = visibleRoster.filter((person) => {
      if (person.status !== 'Active') return false;
      if (!person.accessReviewedAt) return true;

      const age =
        Date.now() - new Date(person.accessReviewedAt).getTime();

      return !Number.isFinite(age) || age > 90 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: visibleRoster.length,
      active,
      inactive,
      archived,
      reviewDue,
      clearanceCounts,
      departmentCounts
    };
  }, [team, showArchived]);

  const filteredTeam = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const skillQuery = skillFilter.trim().toLowerCase();

    return team
      .filter((person) => {
        if (!showArchived && person.status === 'Archived') {
          return false;
        }

        const matchesDept =
          selectedDept === 'ALL' || person.dept === selectedDept;

        const matchesClearance =
          clearanceFilter === 'ALL' ||
          person.clearance.startsWith(clearanceFilter);

        const matchesStatus =
          statusFilter === 'ALL' || person.status === statusFilter;

        const matchesLocation =
          locationFilter === 'ALL' || person.location === locationFilter;

        const searchable = [
          person.id,
          person.name,
          person.title,
          person.email,
          person.phone,
          person.dept,
          person.location,
          person.clearance,
          person.status,
          ...(person.skills || [])
        ].join(' ').toLowerCase();

        const matchesSearch = !query || searchable.includes(query);

        const matchesSkill =
          !skillQuery ||
          (person.skills || []).some((skill) =>
            skill.toLowerCase().includes(skillQuery)
          );

        return (
          matchesDept &&
          matchesClearance &&
          matchesStatus &&
          matchesLocation &&
          matchesSearch &&
          matchesSkill
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'department':
            return a.dept.localeCompare(b.dept) ||
              a.name.localeCompare(b.name);
          case 'clearance-high':
            return clearanceRank(b.clearance) - clearanceRank(a.clearance);
          case 'clearance-low':
            return clearanceRank(a.clearance) - clearanceRank(b.clearance);
          case 'newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'oldest':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case 'name-asc':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [
    team,
    showArchived,
    selectedDept,
    clearanceFilter,
    statusFilter,
    locationFilter,
    searchQuery,
    skillFilter,
    sortBy
  ]);

  const filteredAuditLog = useMemo(() => {
    const query = auditSearch.trim().toLowerCase();

    return auditLog.filter((event) => {
      const matchesType =
        auditTypeFilter === 'ALL' || event.action === auditTypeFilter;

      const searchable = [
        event.id,
        event.action,
        event.employeeId,
        event.employeeName,
        event.details
      ].join(' ').toLowerCase();

      return matchesType && (!query || searchable.includes(query));
    });
  }, [auditLog, auditSearch, auditTypeFilter]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormError('');
    setIsAdding(true);
    setActiveProfile(null);
  };

  const openEditForm = (person) => {
    setEditingId(person.id);
    setFormData({
      name: person.name || '',
      title: person.title || '',
      dept: person.dept || 'ENGINEERING',
      email: person.email || '',
      phone: person.phone || '',
      clearance: person.clearance || 'L2 - Elevated',
      location: person.location || '',
      skills: (person.skills || []).join(', '),
      status: person.status || 'Active',
      joinedAt: person.joinedAt || '',
      notes: person.notes || ''
    });

    setFormError('');
    setIsAdding(true);
    setActiveProfile(null);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormError('');
  };

  const updateFormField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Full name is required.';
    }

    if (!formData.title.trim()) {
      return 'Assignment title is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Enter a valid email address.';
    }

    const duplicateEmail = team.some(
      (person) =>
        person.id !== editingId &&
        normalizeEmail(person.email) === normalizeEmail(formData.email)
    );

    if (duplicateEmail) {
      return 'This email address is already assigned to another record.';
    }

    if (!formData.dept || !formData.clearance || !formData.status) {
      return 'Department, clearance, and status are required.';
    }

    if (formData.joinedAt && Number.isNaN(Date.parse(formData.joinedAt))) {
      return 'Enter a valid joining date.';
    }

    return '';
  };

  const handleSavePersonnel = (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const now = new Date().toISOString();

    const normalizedSkills = [
      ...new Set(
        formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    ];

    const existing = team.find((person) => person.id === editingId);

    const updatedPerson = {
      ...(existing || {}),
      id: editingId || getNextEmployeeId(),
      name: formData.name.trim(),
      title: formData.title.trim(),
      dept: formData.dept,
      email: normalizeEmail(formData.email),
      phone: formData.phone.trim() || 'Not provided',
      clearance: formData.clearance,
      location: formData.location.trim() || 'Unassigned',
      skills: normalizedSkills,
      status: formData.dept === 'DEPRECATED'
        ? 'Inactive'
        : formData.status,
      joinedAt: formData.joinedAt || '',
      notes: formData.notes.trim(),
      accessReviewedAt: existing?.accessReviewedAt || null,
      clearanceHistory: existing?.clearanceHistory || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    if (existing && existing.clearance !== updatedPerson.clearance) {
      updatedPerson.clearanceHistory = [
        {
          from: existing.clearance,
          to: updatedPerson.clearance,
          changedAt: now,
          note: 'Clearance changed through personnel editor.'
        },
        ...(existing.clearanceHistory || [])
      ];

      recordAudit(
        'CLEARANCE_CHANGED',
        updatedPerson,
        `${existing.clearance} → ${updatedPerson.clearance}`
      );
    }

    if (existing) {
      setTeam((previous) =>
        previous.map((person) =>
          person.id === editingId ? updatedPerson : person
        )
      );

      recordAudit('PERSON_UPDATED', updatedPerson, 'Personnel profile updated.');
      triggerToast(`Updated personnel record ${updatedPerson.id}.`);
    } else {
      setTeam((previous) => [updatedPerson, ...previous]);

      recordAudit('PERSON_CREATED', updatedPerson, 'New personnel profile created.');
      triggerToast(`Created personnel record ${updatedPerson.id}.`);
    }

    closeForm();
  };

  const updateStatus = (person, nextStatus) => {
    if (person.status === nextStatus) return;

    const updatedPerson = {
      ...person,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    setTeam((previous) =>
      previous.map((entry) =>
        entry.id === person.id ? updatedPerson : entry
      )
    );

    recordAudit(
      'STATUS_CHANGED',
      updatedPerson,
      `${person.status} → ${nextStatus}`
    );

    setActiveProfile(updatedPerson);
    triggerToast(`${person.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const changeClearance = (person, nextClearance) => {
    if (person.clearance === nextClearance) return;

    const now = new Date().toISOString();

    const updatedPerson = {
      ...person,
      clearance: nextClearance,
      updatedAt: now,
      clearanceHistory: [
        {
          from: person.clearance,
          to: nextClearance,
          changedAt: now,
          note: 'Manual clearance review.'
        },
        ...(person.clearanceHistory || [])
      ]
    };

    setTeam((previous) =>
      previous.map((entry) =>
        entry.id === person.id ? updatedPerson : entry
      )
    );

    recordAudit(
      'CLEARANCE_CHANGED',
      updatedPerson,
      `${person.clearance} → ${nextClearance}`
    );

    setActiveProfile(updatedPerson);
    triggerToast(`Updated clearance for ${person.name}.`);
  };

  const markAccessReviewed = (person) => {
    const now = new Date().toISOString();

    const updatedPerson = {
      ...person,
      accessReviewedAt: now,
      updatedAt: now
    };

    setTeam((previous) =>
      previous.map((entry) =>
        entry.id === person.id ? updatedPerson : entry
      )
    );

    recordAudit(
      'ACCESS_REVIEWED',
      updatedPerson,
      'Access review marked complete.'
    );

    setActiveProfile(updatedPerson);
    triggerToast(`Access review completed for ${person.name}.`);
  };

  const toggleSelection = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const toggleSelectVisible = () => {
    const visibleIds = filteredTeam.map((person) => person.id);

    if (selectAllVisible) {
      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((previous) =>
        [...new Set([...previous, ...visibleIds])]
      );
    }

    setSelectAllVisible((previous) => !previous);
  };

  const bulkUpdateStatus = (nextStatus) => {
    if (selectedIds.length === 0) {
      triggerToast('Select at least one personnel record first.');
      return;
    }

    const selectedPeople = team.filter((person) =>
      selectedIds.includes(person.id)
    );

    setTeam((previous) =>
      previous.map((person) => {
        if (!selectedIds.includes(person.id)) return person;

        return {
          ...person,
          status: person.dept === 'DEPRECATED'
            ? 'Inactive'
            : nextStatus,
          updatedAt: new Date().toISOString()
        };
      })
    );

    selectedPeople.forEach((person) => {
      recordAudit(
        'STATUS_CHANGED',
        person,
        `Bulk status update requested: ${nextStatus}`
      );
    });

    setSelectedIds([]);
    setSelectAllVisible(false);
    triggerToast(`Bulk status update applied to ${selectedPeople.length} record(s).`);
  };

  const bulkReviewAccess = () => {
    if (selectedIds.length === 0) {
      triggerToast('Select at least one personnel record first.');
      return;
    }

    const now = new Date().toISOString();

    const selectedPeople = team.filter((person) =>
      selectedIds.includes(person.id)
    );

    setTeam((previous) =>
      previous.map((person) =>
        selectedIds.includes(person.id)
        ? { ...person, accessReviewedAt: now, updatedAt: now }
          : person
      )
    );

    selectedPeople.forEach((person) => {
      recordAudit(
        'ACCESS_REVIEWED',
        person,
        'Access review completed through bulk operation.'
      );
    });

    setSelectedIds([]);
    setSelectAllVisible(false);
    triggerToast(`Reviewed access for ${selectedPeople.length} record(s).`);
  };

  const bulkExport = () => {
    const records = team.filter((person) =>
      selectedIds.includes(person.id)
    );

    if (records.length === 0) {
      triggerToast('Select personnel records to export.');
      return;
    }

    downloadCsv(records, 'staff-selected-export.csv');
    recordAudit('DATA_EXPORTED', null, `Exported ${records.length} selected personnel records.`);
  };

  const downloadCsv = (records, filename = 'staff-directory.csv') => {
    const columns = [
      'id',
      'name',
      'title',
      'dept',
      'email',
      'phone',
      'clearance',
      'location',
      'skills',
      'status',
      'joinedAt',
      'accessReviewedAt',
      'notes'
    ];

    const rows = records.map((person) =>
      columns.map((column) => {
        const value = column === 'skills'
          ? (person.skills || []).join('; ')
          : person[column];

        return escapeCsv(value);
      }).join(',')
    );

    const csv = [
      columns.map(escapeCsv).join(','),
      ...rows
    ].join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    triggerToast(`Exported ${records.length} personnel record(s).`);
  };

  const copyToClipboard = async (text, label) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand('copy');
        textarea.remove();

        if (!copied) throw new Error('Clipboard copy failed.');
      }

      triggerToast(`Copied ${label} to clipboard.`);
    } catch {
      triggerToast(`Unable to copy ${label}. Check browser permissions.`);
    }
  };

  const resetFilters = () => {
    setSelectedDept('ALL');
    setSearchQuery('');
    setClearanceFilter('ALL');
    setStatusFilter('ALL');
    setLocationFilter('ALL');
    setSkillFilter('');
    setSortBy('name-asc');
    setShowArchived(false);
    setSelectedIds([]);
    setSelectAllVisible(false);
  };

  const clearAuditLog = () => {
    setPendingAction({ type: 'CLEAR_AUDIT' });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (event.key === 'Escape') {
        setActiveProfile(null);
        setIsAdding(false);
        setShowAuditLog(false);
        setPendingAction(null);
        return;
      }

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openCreateForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const confirmPendingAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'CLEAR_AUDIT') {
      setAuditLog([]);
      triggerToast('Local audit history cleared.');
    }

    if (pendingAction.type === 'ARCHIVE_PERSON') {
      const person = team.find(
        (entry) => entry.id === pendingAction.personId
      );

      if (person) {
        updateStatus(person, 'Archived');
      }
    }

    setPendingAction(null);
  };

  return (
    <div className="staff-wrapper">
      <header className="staff-control-header">
        <button
          type="button"
          className="staff-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Dashboard
        </button>

        <div className="staff-header-actions">
          <button
            type="button"
            className="staff-toolbar-btn"
            onClick={() => setShowAuditLog((previous) => !previous)}
          >
            {showAuditLog ? 'Hide Audit Log' : 'Audit Log'}
          </button>

          <button
            type="button"
            className="staff-toolbar-btn"
            onClick={() => downloadCsv(filteredTeam)}
          >
            Export CSV
          </button>
        </div>
      </header>

      <section className="staff-controls">
        <div className="title-action-row">
          <div>
            <p className="staff-eyebrow"> ACCESS </p>
            <h1 className="staff-title">Internal Staff Registry</h1>
            <p className="staff-subtext">
              Personnel records, clearance reviews, workforce analytics, and administrative events.
            </p>
          </div>

          <div className="toolbar-btn-group">
            <button
              type="button"
              className="staff-exit-btn primary-btn"
              onClick={openCreateForm}
            >
              + Recruit Personnel
            </button>
          </div>
        </div>

        <div className="staff-analytics-toolbar">
          <button
            type="button"
            className="staff-toolbar-btn"
            onClick={() => setShowAnalytics((previous) => !previous)}
            aria-expanded={showAnalytics}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>

          <button
            type="button"
            className="staff-toolbar-btn"
            onClick={() => setShowArchived((previous) => !previous)}
            aria-pressed={showArchived}
          >
            {showArchived ? 'Hide Archived' : `Show Archived (${metrics.archived})`}
          </button>

          <span className="staff-shortcut-hint">
            Shortcuts: / or Ctrl+K to search · Ctrl+N to recruit · Esc to close
          </span>
        </div>

        {showAnalytics && (
          <section className="staff-analytics-panel">
            <div className="staff-metric-grid">
              <article className="staff-metric-card">
                <span>Total Personnel</span>
                <strong>{metrics.total}</strong>
                <small>Current directory scope</small>
              </article>

              <article className="staff-metric-card">
                <span>Active Personnel</span>
                <strong>{metrics.active}</strong>
                <small>Active records</small>
              </article>

              <article className="staff-metric-card">
                <span>Inactive Personnel</span>
                <strong>{metrics.inactive}</strong>
                <small>Not currently active</small>
              </article>

              <article className="staff-metric-card">
                <span>Access Reviews Due</span>
                <strong>{metrics.reviewDue}</strong>
                <small>Missing or older than 90 days</small>
              </article>
            </div>

            <div className="staff-analytics-detail-grid">
              <section className="staff-breakdown-panel">
                <h3>Department Distribution</h3>

                {metrics.departmentCounts.map(({ dept, count }) => {
                  const percentage = metrics.total
                    ? (count / metrics.total) * 100
                    : 0;

                  return (
                    <div className="staff-breakdown-row" key={dept}>
                      <div className="staff-breakdown-label">
                        <span>{dept}</span>
                        <strong>{count}</strong>
                      </div>

                      <div
                        className="staff-meter-track"
                        role="progressbar"
                        aria-label={`${dept} personnel distribution`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percentage)}
                      >
                        <span
                          className="staff-meter-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="staff-breakdown-panel">
                <h3>Clearance Distribution</h3>

                {metrics.clearanceCounts.map(({ clearance, count }) => {
                  const percentage = metrics.total
                    ? (count / metrics.total) * 100
                    : 0;

                  return (
                    <div className="staff-breakdown-row" key={clearance}>
                      <div className="staff-breakdown-label">
                        <span>{clearance}</span>
                        <strong>{count}</strong>
                      </div>

                      <div
                        className="staff-meter-track"
                        role="progressbar"
                        aria-label={`${clearance} personnel distribution`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percentage)}
                      >
                        <span
                          className="staff-meter-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          </section>
        )}

        <div className="staff-search-bar">
          <input
            ref={searchRef}
            type="search"
            className="staff-search-input"
            placeholder="Search name, ID, title, email, location, or skill... (press /)"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search personnel"
          />

          <select
            className="staff-clearance-select"
            value={clearanceFilter}
            onChange={(event) => setClearanceFilter(event.target.value)}
            aria-label="Filter by clearance"
          >
            <option value="ALL">All Clearance Levels</option>
            <option value="L4">L4 - Omega Clearance</option>
            <option value="L3">L3 - Executive Clearance</option>
            <option value="L2">L2 - Elevated Clearance</option>
            <option value="L1">L1 - Revoked / Standard</option>
          </select>

          <select
            className="staff-status-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="staff-advanced-filter-row">
          <label className="staff-filter-field">
            Location
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
            >
              <option value="ALL">All Locations</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="staff-filter-field">
            Skill
            <input
              type="search"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
            />
          </label>

          <label className="staff-filter-field">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="department">Department</option>
              <option value="clearance-high">Highest Clearance</option>
              <option value="clearance-low">Lowest Clearance</option>
              <option value="newest">Recently Created</option>
              <option value="oldest">Oldest Records</option>
            </select>
          </label>

          <div className="staff-view-switch">
            <button
              type="button"
              className={viewMode === 'grid' ? 'active-filter' : ''}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
            >
              Grid View
            </button>

            <button
              type="button"
              className={viewMode === 'list' ? 'active-filter' : ''}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              List View
            </button>
          </div>

          <button
            type="button"
            className="staff-toolbar-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>

        <div className="dept-filter-row">
          {['ALL', ...DEPARTMENTS].map((dept) => (
            <button
              type="button"
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={selectedDept === dept ? 'active-filter' : ''}
              aria-pressed={selectedDept === dept}
            >
              {dept === 'ALL'
                ? 'Full Roster'
                : dept === 'DEPRECATED'
                  ? 'Legacy / Deprecated'
                  : dept}
            </button>
          ))}
        </div>

        <div className="staff-results-toolbar">
          <span>
            Displaying {filteredTeam.length} of {team.length} records
          </span>

          <label className="staff-select-visible">
            <input
              type="checkbox"
              checked={
                filteredTeam.length > 0 &&
                filteredTeam.every((person) => selectedIds.includes(person.id))
              }
              onChange={toggleSelectVisible}
            />
            Select all visible
          </label>
        </div>

        {selectedIds.length > 0 && (
          <div className="staff-bulk-toolbar">
            <strong>{selectedIds.length} selected</strong>

            <button
              type="button"
              onClick={() => bulkUpdateStatus('Active')}
            >
              Set Active
            </button>

            <button
              type="button"
              onClick={() => bulkUpdateStatus('Inactive')}
            >
              Set Inactive
            </button>

            <button type="button" onClick={bulkReviewAccess}>
              Mark Access Reviewed
            </button>

            <button type="button" onClick={bulkExport}>
              Export Selected
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedIds([]);
                setSelectAllVisible(false);
              }}
            >
              Clear Selection
            </button>
          </div>
        )}
      </section>

      {isAdding && (
        <form
          ref={formRef}
          onSubmit={handleSavePersonnel}
          className="add-personnel-drawer"
        >
          <div className="staff-form-heading-row">
            <div>
              <h3>
                {editingId ? 'Edit Personnel Record' : 'Register New Personnel'}
              </h3>
              <p>
                {editingId
                  ? `Editing record ${editingId}`
                  : 'Create a new personnel profile in the local demo directory.'}
              </p>
            </div>

            <button
              type="button"
              className="staff-toolbar-btn"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>

          <div className="drawer-form-grid">
            <div>
              <label htmlFor="staff-name">Full Legal Name</label>
              <input
                id="staff-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Olayinka"
                value={formData.name}
                onChange={(event) => updateFormField('name', event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="staff-title">Role / Assignment Title</label>
              <input
                id="staff-title"
                type="text"
                placeholder="e.g. Smart Contract Architect"
                value={formData.title}
                onChange={(event) => updateFormField('title', event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="staff-dept">Department Unit</label>
              <select
                id="staff-dept"
                value={formData.dept}
                onChange={(event) => updateFormField('dept', event.target.value)}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staff-email">Email Address</label>
              <input
                id="staff-email"
                type="email"
                autoComplete="email"
                placeholder="employee@company.com"
                value={formData.email}
                onChange={(event) => updateFormField('email', event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="staff-phone">Phone Number</label>
              <input
                id="staff-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234 800 000 0000"
                value={formData.phone}
                onChange={(event) => updateFormField('phone', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="staff-clearance">Clearance Level</label>
              <select
                id="staff-clearance"
                value={formData.clearance}
                onChange={(event) => updateFormField('clearance', event.target.value)}
              >
                {CLEARANCES.map((clearance) => (
                  <option key={clearance} value={clearance}>
                    {clearance}
                  </option>
                ))}
              </select>
            </div>

            <div>
   <label htmlFor="staff-location">Primary Location</label>
              <input
                id="staff-location"
                type="text"
                placeholder=" Nigeria"
                value={formData.location}
                onChange={(event) => updateFormField('location', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="staff-skills">Skills (comma separated)</label>
              <input
                id="staff-skills"
                type="text"
                placeholder="React, Python, Others"
                value={formData.skills}
                onChange={(event) => updateFormField('skills', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="staff-status">Employment Status</label>
              <select
                id="staff-status"
                value={formData.status}
                onChange={(event) => updateFormField('status', event.target.value)}
                disabled={formData.dept === 'DEPRECATED'}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="staff-joined">Joining Date</label>
              <input
                id="staff-joined"
                type="date"
                value={formData.joinedAt}
                onChange={(event) => updateFormField('joinedAt', event.target.value)}
              />
            </div>

            <div className="staff-form-full-width">
              <label htmlFor="staff-notes">Administrative Notes</label>
              <textarea
                id="staff-notes"
                rows={3}
                placeholder="Optional internal notes for this demo profile..."
                value={formData.notes}
                onChange={(event) => updateFormField('notes', event.target.value)}
              />
            </div>
          </div>

          {formError && (
            <p className="staff-form-error" role="alert">{formError}</p>
          )}

          <div className="staff-form-actions">
            <button type="submit" className="submit-personnel-btn">
              {editingId ? 'Save Personnel Changes' : 'Commit Record to Registry'}
            </button>

            <button
              type="button"
              className="staff-toolbar-btn"
              onClick={closeForm}
            >
              Discard
            </button>
          </div>
        </form>
      )}

      <main
        className={`staff-list-layout ${
          viewMode === 'list' ? 'staff-list-view' : ''
        }`}
      >
        {filteredTeam.length === 0 ? (
          <div className="empty-staff-card">
            <h2>No personnel records found</h2>
            <p>
              No records match your current filters. Try changing your search
              or resetting the filters.
            </p>

            <button
              type="button"
              className="staff-toolbar-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTeam.map((person) => {
            const selected = selectedIds.includes(person.id);

            const reviewDue =
              person.status === 'Active' &&
              (!person.accessReviewedAt ||
                Date.now() - new Date(person.accessReviewedAt).getTime() >
                  90 * 24 * 60 * 60 * 1000);

            return (
              <article
                key={person.id}
                className={`staff-card ${person.dept.toLowerCase()} ${
                  selected ? 'staff-card-selected' : ''
                } ${person.status.toLowerCase()}`}
              >
                <div className="staff-card-selection-row">
                  <label className="staff-card-checkbox">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelection(person.id)}
                      aria-label={`Select ${person.name}`}
                    />
                    Select record
                  </label>

                  <span className={`staff-status-badge status-${person.status.toLowerCase()}`}>
                    {person.status}
                  </span>
                </div>

                <div className="card-top-identity">
                  <span className="staff-id-tag">{person.id}</span>
                  <span className="clearance-tag-pill">{person.clearance}</span>
                  <span className="dept-tag">{person.dept}</span>
                </div>

                <h2 className="staff-name-heading">
                  {person.dept === 'DEPRECATED' ? (
                    <del>{person.name}</del>
                  ) : (
                    person.name
                  )}
                </h2>

                <p className="staff-title-sub">
                  <em>{person.title}</em>
                </p>

                <p className="staff-card-location">
                  <strong>Location:</strong> {person.location}
                </p>

                <div className="skills-badge-list">
                  {(person.skills || []).map((skill) => (
                    <span key={skill} className="skill-chip">{skill}</span>
                  ))}
                </div>

                {reviewDue && (
                  <p className="staff-review-warning">
                    Access review due
                  </p>
                )}

                <div className="staff-card-footer">
                  <span className="staff-email-txt">{person.email}</span>

                  <button
                    type="button"
                    className="view-profile-link"
                    onClick={() => setActiveProfile(person)}
                  >
                    View Sheet →
                  </button>
                </div>

                <div className="staff-card-actions">
                  <button
                    type="button"
                    className="staff-inline-action"
                    onClick={() => openEditForm(person)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="staff-inline-action"
                    onClick={() => copyToClipboard(person.email, 'email')}
                  >
                    Copy Email
                  </button>

                  {person.status === 'Active' ? (
                    <button
                      type="button"
                      className="staff-inline-action"
                      onClick={() => setPendingAction({
                        type: 'CHANGE_STATUS',
                        personId: person.id,
                        nextStatus: 'Inactive'
                      })}
                    >
                      Deactivate
                    </button>
                  ) : person.status === 'Inactive' ? (
                    <button
                      type="button"
                      className="staff-inline-action"
                      onClick={() => setPendingAction({
                        type: 'CHANGE_STATUS',
                        personId: person.id,
                        nextStatus: 'Active'
                      })}
                    >
                      Reactivate
                    </button>
                  ) : null}

                  {person.status !== 'Archived' && (
                    <button
                      type="button"
                      className="staff-inline-action staff-danger-action"
                      onClick={() => setPendingAction({
                        type: 'ARCHIVE_PERSON',
                        personId: person.id
                      })}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </main>

      {activeProfile && (
        <div
          className="modal-overlay"
          onClick={() => setActiveProfile(null)}
        >
          <section
            className="modal-container staff-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-profile-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-profile-heading-row">
              <div>
                <span className="staff-id-tag">{activeProfile.id}</span>
                <h3 id="staff-profile-title" className="modal-header-title">
                  Personnel Properties
                </h3>
                <p className="staff-profile-subtitle">
                  Record updated {formatDate(activeProfile.updatedAt)}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveProfile(null)}
                aria-label="Close personnel profile"
              >
                ✕
              </button>
            </div>

            <div className="modal-data-table">
              <p><strong>Full Name:</strong> {activeProfile.name}</p>
              <p><strong>Assignment:</strong> <em>{activeProfile.title}</em></p>
              <p><strong>Department:</strong> {activeProfile.dept}</p>
              <p><strong>Status:</strong> {activeProfile.status}</p>
              <p><strong>Location:</strong> {activeProfile.location}</p>
              <p><strong>Joining Date:</strong> {formatDate(activeProfile.joinedAt)}</p>
              <p>
                <strong>Email:</strong>{' '}
                <button
                  type="button"
                  className="quick-copy-btn"
                  onClick={() => copyToClipboard(activeProfile.email, 'email')}
                >
                  {activeProfile.email} 📋
                </button>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <button
                  type="button"
                  className="quick-copy-btn"
                  onClick={() => copyToClipboard(activeProfile.phone, 'phone')}
                >
                  {activeProfile.phone} 📋
                </button>
              </p>

              <div className="staff-profile-clearance">
                <strong>Security Clearance</strong>
                <select
                  value={activeProfile.clearance}
                  onChange={(event) =>
                    changeClearance(activeProfile, event.target.value)
                  }
                  aria-label="Change personnel clearance"
                >
                  {CLEARANCES.map((clearance) => (
                    <option key={clearance} value={clearance}>
                      {clearance}
                    </option>
                  ))}
                </select>
                <small>
                  Demo field only. This does not grant or revoke real system access.
                </small>
              </div>

              <div className="staff-access-review-panel">
                <strong>Access Review</strong>
                <p>
                  Last reviewed: {formatDate(activeProfile.accessReviewedAt)}
                </p>
                <button
                  type="button"
                  className="staff-toolbar-btn"
                  onClick={() => markAccessReviewed(activeProfile)}
                >
                  Mark Review Complete
                </button>
              </div>

              <div className="modal-skills-block">
                <strong>Verified Competencies</strong>
                <div className="modal-skills-flex">
                  {(activeProfile.skills || []).map((skill) => (
                    <span key={skill} className="skill-chip">{skill}</span>
                  ))}
                  {(activeProfile.skills || []).length === 0 && (
                    <span>No skills recorded.</span>
                  )}
                </div>
              </div>

              <div className="staff-profile-notes">
                <strong>Administrative Notes</strong>
                <p>{activeProfile.notes || 'No notes recorded.'}</p>
              </div>

              <div className="staff-clearance-history">
                <h4>Clearance Change History</h4>

                {(activeProfile.clearanceHistory || []).length === 0 ? (
                  <p>No clearance changes recorded.</p>
                ) : (
                  activeProfile.clearanceHistory.map((entry, index) => (
                    <div
                      key={`${entry.changedAt}-${index}`}
                      className="staff-history-entry"
                    >
                      <strong>{entry.from} → {entry.to}</strong>
                      <span>{formatDate(entry.changedAt)}</span>
                      <small>{entry.note}</small>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="staff-profile-actions">
              <button
                type="button"
                className="staff-toolbar-btn"
                onClick={() => openEditForm(activeProfile)}
              >
                Edit Record
              </button>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveProfile(null)}
              >
                Dismiss Sheet
              </button>
            </div>
          </section>
        </div>
      )}

      {showAuditLog && (
        <section className="staff-audit-panel">
          <div className="staff-audit-heading-row">
            <div>
              <h2>Administrative Audit Log</h2>
              <p>
                Local demo history of changes made through this interface.
              </p>
            </div>

            <div className="staff-audit-actions">
              <button
                type="button"
                className="staff-toolbar-btn"
                onClick={() =>
                  downloadCsv(
                  filteredAuditLog.map((event) => ({
                  ...event,
                  skills: [],
                  notes: event.details,
                  name: event.employeeName,
                  id: event.id,
                  dept: '',
                  title: event.action,
                  email: '',
                  phone: '',
                  clearance: '',
                  location: '',
                  status: '',
                  joinedAt: '',
                  accessReviewedAt: event.timestamp
                  })),
                  'staff-audit-log.csv'
                  )}
              >
                Export Audit
              </button>

              <button
                type="button"
                className="staff-toolbar-btn staff-danger-action"
                onClick={clearAuditLog}
              >
                Clear History
              </button>
            </div>
          </div>

          <div className="staff-audit-filters">
            <input
              type="search"
              placeholder="Search audit events..."
              value={auditSearch}
              onChange={(event) => setAuditSearch(event.target.value)}
              aria-label="Search audit log"
            />

            <select
              value={auditTypeFilter}
              onChange={(event) => setAuditTypeFilter(event.target.value)}
              aria-label="Filter audit event type"
            >
              <option value="ALL">All Events</option>
              <option value="PERSON_CREATED">Personnel Created</option>
              <option value="PERSON_UPDATED">Personnel Updated</option>
              <option value="STATUS_CHANGED">Status Changes</option>
              <option value="CLEARANCE_CHANGED">Clearance Changes</option>
              <option value="ACCESS_REVIEWED">Access Reviews</option>
              <option value="DATA_EXPORTED">Data Exports</option>
            </select>
          </div>

          <div className="staff-audit-list">
            {filteredAuditLog.length === 0 ? (
              <p>No matching audit events.</p>
            ) : (
              filteredAuditLog.map((event) => (
                <article className="staff-audit-entry" key={event.id}>
                  <div>
                    <strong>{event.action.replaceAll('_', ' ')}</strong>
                    <span>{event.employeeName} · {event.employeeId}</span>
                    <p>{event.details}</p>
                  </div>

                  <time dateTime={event.timestamp}>
                    {new Date(event.timestamp).toLocaleString()}
                  </time>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {pendingAction && (
        <div
          className="modal-overlay"
          onClick={() => setPendingAction(null)}
        >
          <section
            className="modal-container staff-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="staff-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="staff-confirm-title">Confirm Administrative Action</h3>

            <p>
              {pendingAction.type === 'CLEAR_AUDIT'
                ? 'Clear the locally stored audit history? This cannot be undone from this interface.'
                : pendingAction.type === 'ARCHIVE_PERSON'
                  ? 'Archive this personnel record? It will be hidden from the standard roster but retained in archived records.'
                  : `Change this employee's status to ${pendingAction.nextStatus}?`}
            </p>

            <div className="staff-confirm-actions">
              <button
                type="button"
                className="staff-danger-confirm-btn"
                onClick={() => {
                  if (pendingAction.type === 'CHANGE_STATUS') {
                    const person = team.find(
                      (entry) => entry.id === pendingAction.personId
                    );

                    if (person) {
                      updateStatus(person, pendingAction.nextStatus);
                    }
                    setPendingAction(null);
                  } else {
                    confirmPendingAction();
                  }
                }}
              >
                Confirm
              </button>

              <button
                type="button"
                className="staff-toolbar-btn"
                onClick={() => setPendingAction(null)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {toastMessage && (
        <div className="custom-notification-toast" role="status" aria-live="polite">
          <span>● {toastMessage}</span>

          <button
            type="button"
            onClick={() => {
              setToastMessage('');

              if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
                toastTimerRef.current = null;
              }
            }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

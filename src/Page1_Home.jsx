import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Page1_Home.css';

const PROJECTS = [
  {
    page: 'login',
    id: 'PRJ-001',
    title: 'Global Entry Portal',
    description:
      'An authentication interface focused on form validation, predictable error states, and a clear sign-in experience.',
    skills: [
      'Form validation',
      'Authentication UI',
      'Error handling',
      'Session management',
    ],
    category: 'Security & Ops',
    type: 'Authentication',
    featured: true,
    complexity: 'Authentication flows',
    problem:
      'Authentication interfaces need to communicate failures clearly without losing user input or exposing unnecessary implementation details.',
    engineering:
      'The interface is organized around form state, validation feedback, and explicit submission states. Verify the authentication backend and session lifecycle in the implementation.',
    questions: [
      'How are invalid credentials handled?',
      'Where does authentication state live?',
      'What prevents duplicate submissions?',
    ],
  },
  {
    page: 'support',
    id: 'PRJ-002',
    title: 'Support Helpdesk',
    description:
      'A ticket-management interface for finding support requests and organizing work by priority.',
    skills: [
      'Search and filtering',
      'Ticket priorities',
      'List rendering',
      'State management',
    ],
    category: 'Security & Ops',
    type: 'Operations',
    complexity: 'Data-driven UI',
    problem:
      'Support teams need to locate important requests quickly without manually scanning an unstructured list.',
    engineering:
      'The interface demonstrates the organization of ticket data, filtering controls, and priority-oriented presentation.',
    questions: [
      'How are multiple filters combined?',
      'What happens when no tickets match?',
      'How would pagination be introduced?',
    ],
  },
  {
    page: 'bank',
    id: 'PRJ-003',
    title: 'Bank Ledger',
    description:
      'A financial-record interface designed around readable transaction rows and consistent numeric presentation.',
    skills: [
      'Financial tables',
      'Currency formatting',
      'Data presentation',
      'Numeric precision',
    ],
    category: 'Fintech & Billing',
    type: 'Finance',
    complexity: 'Financial data',
    problem:
      'Financial records become difficult to review when amounts, dates, and transaction details are presented inconsistently.',
    engineering:
      'The interface focuses on tabular organization and financial information. Inspect the implementation to establish how balances are calculated and how monetary precision is handled.',
    questions: [
      'Are amounts stored as decimal-safe values?',
      'How are totals reconciled?',
      'How are transactions sorted?',
    ],
  },
  {
    page: 'project',
    id: 'PRJ-004',
    title: 'Team Task Board',
    description:
      'A task-management interface for organizing work into a visual workflow.',
    skills: [
      'Task state',
      'Workflow organization',
      'Drag and drop',
      'Interactive lists',
    ],
    category: 'Data & Systems',
    type: 'Productivity',
    featured: true,
    complexity: 'Interactive workflows',
    problem:
      'Teams need to understand task progress and move work between stages without navigating through disconnected screens.',
    engineering:
      'The project provides a place to examine task organization, workflow transitions, and the relationship between interaction state and rendered columns.',
    questions: [
      'How is a task moved between columns?',
      'Does reordering persist?',
      'How are invalid transitions prevented?',
    ],
  },
  {
    page: 'warehouse',
    id: 'PRJ-005',
    title: 'Warehouse Manifest',
    description:
      'An inventory-oriented interface for reviewing item records and narrowing large lists.',
    skills: [
      'Inventory views',
      'Search and filtering',
      'Record organization',
      'Operational UI',
    ],
    category: 'Security & Ops',
    type: 'Logistics',
    complexity: 'Operational data',
    problem:
      'Warehouse operators need a straightforward way to find records and review inventory information.',
    engineering:
      'The interface centers on item presentation, inventory-oriented information, and record filtering.',
    questions: [
      'How are inventory changes represented?',
      'How are missing records handled?',
      'Can records be filtered by multiple attributes?',
    ],
  },
  {
    page: 'invoice',
    id: 'PRJ-006',
    title: 'Invoice Generator',
    description:
      'An invoice-building interface with editable line items and calculated amounts.',
    skills: [
      'Dynamic form rows',
      'Line-item calculations',
      'Input validation',
      'Document workflows',
    ],
    category: 'Fintech & Billing',
    type: 'Billing',
    featured: true,
    complexity: 'Dynamic calculations',
    problem:
      'Invoice forms need to support changing line items while keeping quantities, rates, and totals consistent.',
    engineering:
      'The project demonstrates dynamic form structures and calculation-oriented UI. Verify rounding, tax rules, and document generation against the actual implementation.',
    questions: [
      'Are totals derived from source values?',
      'How is rounding handled?',
      'What happens when a line item is removed?',
    ],
  },
  {
    page: 'terminal',
    id: 'PRJ-007',
    title: 'Server Log Monitor',
    description:
      'A log-viewing interface for examining sequential events and monitoring changes in displayed output.',
    skills: [
      'Event rendering',
      'Scrollable output',
      'Array state',
      'Diagnostic interfaces',
    ],
    category: 'Data & Systems',
    type: 'Developer Tools',
    complexity: 'Event-oriented UI',
    problem:
      'Logs become difficult to inspect when new entries disrupt reading position or important events are hard to distinguish.',
    engineering:
      'The interface offers an opportunity to examine event presentation, scrolling behavior, and log-list updates. A real server stream should only be claimed if a backend connection exists.',
    questions: [
      'Is log data streamed or simulated?',
      'How is output size controlled?',
      'How are errors distinguished from informational events?',
    ],
  },
  {
    page: 'product',
    id: 'PRJ-008',
    title: 'Product Catalog',
    description:
      'A product-browsing interface with searchable records and selection-oriented interactions.',
    skills: [
      'Product grids',
      'Search queries',
      'Selection state',
      'Collection filtering',
    ],
    category: 'Data & Systems',
    type: 'Commerce',
    complexity: 'Collection management',
    problem:
      'As a catalog grows, visitors need to narrow the collection and identify relevant items without losing context.',
    engineering:
      'The interface demonstrates collection rendering, filtering, and selection behavior.',
    questions: [
      'How are search queries normalized?',
      'Can selections survive filtering?',
      'How are empty collections presented?',
    ],
  },
  {
    page: 'staff',
    id: 'PRJ-009',
    title: 'Company Directory',
    description:
      'A staff directory for locating people and reviewing structured profile information.',
    skills: [
      'Directory search',
      'Profile views',
      'Record filtering',
      'Accessible dialogs',
    ],
    category: 'Security & Ops',
    type: 'Administration',
    complexity: 'Searchable records',
    problem:
      'Finding a colleague becomes slower when staff information is scattered across unstructured records.',
    engineering:
      'The project focuses on staff discovery and profile presentation. Inspect how the interface handles dialog focus and dismissal.',
    questions: [
      'How is search implemented?',
      'Can a profile dialog be operated by keyboard?',
      'What happens when a staff record is incomplete?',
    ],
  },
  {
    page: 'pricing',
    id: 'PRJ-010',
    title: 'Subscription Matrix',
    description:
      'A comparison interface for reviewing subscription tiers and their available features.',
    skills: [
      'Comparison tables',
      'Feature states',
      'Responsive layouts',
      'Information hierarchy',
    ],
    category: 'Fintech & Billing',
    type: 'Subscriptions',
    complexity: 'Comparative data',
    problem:
      'Visitors need to compare subscription options without losing track of which features belong to each tier.',
    engineering:
      'The interface emphasizes consistent feature alignment, clear plan distinctions, and readable comparisons across screen sizes.',
    questions: [
      'How are unavailable features represented?',
      'Does the layout work on narrow screens?',
      'How would plan data be maintained?',
    ],
  },
  {
    page: 'checkout',
    id: 'PRJ-011',
    title: 'Checkout Flow',
    description:
      'A checkout-oriented interface for examining form state, payment details, validation, and submission feedback.',
    skills: [
      'Form validation',
      'Loading states',
      'Input masking',
      'Asynchronous UI',
    ],
    category: 'Fintech & Billing',
    type: 'Checkout',
    featured: true,
    complexity: 'Multi-state interactions',
    problem:
      'Checkout interfaces need to communicate progress and validation errors while preventing confusing submission behavior.',
    engineering:
      'The project provides a place to inspect payment-form interactions and asynchronous state handling. A simulated checkout must not be represented as a real payment processor integration.',
    questions: [
      'Is the payment provider actually integrated?',
      'How are duplicate submissions prevented?',
      'How are failed and pending payments represented?',
    ],
  },
];
const CATEGORIES = [
  'All projects',
  'Fintech & Billing',
  'Security & Ops',
  'Data & Systems',
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'name', label: 'Name: A–Z' },
  { value: 'category', label: 'Category' },
];

const CAPABILITIES = [
  {
    number: '01',
    title: 'Frontend engineering',
    description:
      'Building interactive interfaces with React, component-based architecture, forms, and state-driven rendering.',
    topics: ['React', 'JavaScript', 'Component design', 'Accessibility'],
  },
  {
    number: '02',
    title: 'APIs and application logic',
    description:
      'Connecting interfaces to application logic, handling asynchronous operations, and making errors understandable.',
    topics: ['Node.js', 'REST APIs', 'Validation', 'Error handling'],
  },
  {
    number: '03',
    title: 'Data and persistence',
    description:
      'Structuring application data and working with database-backed features where the implementation requires them.',
    topics: ['SQL', 'PostgreSQL', 'Supabase', 'Data modeling'],
  },
  {
    number: '04',
    title: 'Tools and automation',
    description:
      'Developing practical utilities and workflow integrations that reduce repetitive work and improve reliability.',
    topics: ['Git', 'Automation', 'Integrations', 'Debugging'],
  },
];

const INITIAL_COMPARE = [];

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchesProject(project, query) {
  if (!query) return true;

  const searchableText = [
    project.id,
    project.title,
    project.description,
    project.category,
    project.type,
    project.complexity,
    project.problem,
    project.engineering,
    ...project.skills,
    ...project.questions,
  ]
    .join(' ')
    .toLowerCase();

  return normalizeText(searchableText).includes(normalizeText(query));
}

export default function Page1_Home({ setPage }) {
  const [activeCategory, setActiveCategory] = useState('All projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [compareIds, setCompareIds] = useState(INITIAL_COMPARE);
  const [showComparison, setShowComparison] = useState(false);
  const [showAllCapabilities, setShowAllCapabilities] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState('');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const selectedProject = useMemo(
    () =>
      PROJECTS.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    const results = PROJECTS.filter((project) => {
      const categoryMatches =
        activeCategory === 'All projects' ||
        project.category === activeCategory;

      return categoryMatches && matchesProject(project, searchQuery);
    });

    return [...results].sort((first, second) => {
      if (sortBy === 'name') {
        return first.title.localeCompare(second.title);
      }

      if (sortBy === 'category') {
        return (
          first.category.localeCompare(second.category) ||
          first.title.localeCompare(second.title)
        );
      }

      if (first.featured !== second.featured) {
        return Number(Boolean(second.featured)) -
          Number(Boolean(first.featured));
      }

      return first.id.localeCompare(second.id);
    });
  }, [activeCategory, searchQuery, sortBy]);

  const featuredProjects = useMemo(
    () => PROJECTS.filter((project) => project.featured),
    []
  );

  const comparedProjects = useMemo(
    () => PROJECTS.filter((project) => compareIds.includes(project.id)),
    [compareIds]
  );

  const categoryCounts = useMemo(() => {
    const counts = { 'All projects': PROJECTS.length };

    for (const project of PROJECTS) {
      counts[project.category] = (counts[project.category] ?? 0) + 1;
    }

    return counts;
  }, []);

  const resetDirectory = useCallback(() => {
    setActiveCategory('All projects');
    setSearchQuery('');
    setSortBy('featured');
  }, []);

  const openProject = useCallback(
    (page) => {
      if (typeof setPage === 'function') {
        setPage(page);
      }
    },
    [setPage]
  );

  const toggleCompare = useCallback((projectId) => {
    setCompareIds((current) => {
      if (current.includes(projectId)) {
        return current.filter((id) => id !== projectId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, projectId];
    });
  }, []);

  const copyProjectReference = useCallback(async (project) => {
    const reference = `${project.id} — ${project.title}`;

    if (!navigator.clipboard?.writeText) {
      setCopiedProjectId('');
      return;
    }

    try {
      await navigator.clipboard.writeText(reference);
      setCopiedProjectId(project.id);
    } catch {
      setCopiedProjectId('');
    }
  }, []);

  useEffect(() => {
    if (!copiedProjectId) return undefined;

    const timer = window.setTimeout(() => {
      setCopiedProjectId('');
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copiedProjectId]);

  useEffect(() => {
    if (!selectedProjectId && !showKeyboardHelp && !showComparison) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedProjectId(null);
        setShowKeyboardHelp(false);
        setShowComparison(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectId, showKeyboardHelp, showComparison]);

  return (
    <div className="home-wrapper">
      <a className="home-skip-link" href="#project-directory">
        Skip to projects
      </a>

      <header className="hero-card">
        <div className="home-topline">
          <a
            className="home-brand"
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            PO<span>.</span>
          </a>

          <nav className="home-navigation" aria-label="Main navigation">
            <a href="#project-directory">Projects</a>
            <a href="#engineering">Engineering</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>

        <div id="home" className="home-hero-content">
          <p className="home-eyebrow">
            DEVELOPER PORTFOLIO <span> / </span> 2026
          </p>

          <h1 className="home-title">
            Prince Christian
            <br />
            <span>Developer &amp; Builder</span>
          </h1>

          <p className="home-subtitle">
            FULL-STACK DEVELOPMENT · APPLICATION ENGINEERING
          </p>

          <div className="home-intro-box">
            <p className="home-paragraph">
              I build web applications, interactive interfaces, API
              integrations, and practical software tools. My focus is on
              understanding how an application works, not just how it looks.
            </p>

            <p className="home-paragraph">
              This portfolio is a collection of eleven application interfaces
              covering finance, operations, workflow management, and developer
              tools. Each project can be opened and inspected individually.
            </p>
          </div>

          <div className="home-hero-actions">
            <a className="home-primary-action" href="#project-directory">
              Explore the projects <span aria-hidden="true">↘</span>
            </a>

            <button
              type="button"
              className="home-secondary-action"
              onClick={() => setShowKeyboardHelp(true)}
            >
              Navigation guide
            </button>
          </div>

          <div className="home-hero-meta">
            <div>
              <span className="home-meta-label">PORTFOLIO CONTENTS</span>
              <strong>11 applications</strong>
            </div>

            <div>
              <span className="home-meta-label">AREAS OF INTEREST</span>
              <strong>Frontend · APIs · Systems</strong>
            </div>

            <div>
              <span className="home-meta-label">APPROACH</span>
              <strong>Build, inspect, improve</strong>
            </div>
          </div>
        </div>
      </header>

      <section
        className="home-featured-section"
        aria-labelledby="featured-heading"
      >
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">SELECTED WORK</p>
            <h2 id="featured-heading">A closer look at the work</h2>
          </div>

          <span className="home-section-index">01 / 04</span>
        </div>
        <div className="home-featured-grid">
          {featuredProjects.map((project, index) => (
            <article
              className={`home-featured-card home-featured-card-${index + 1}`}
              key={project.id}
            >
              <div className="home-featured-card-top">
                <span>{project.id}</span>
                <span>{project.category}</span>
              </div>

              <div className="home-featured-card-content">
                <p className="home-featured-type">{project.type}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>

              <div className="home-featured-card-bottom">
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  aria-label={`Inspect ${project.title}`}
                >
                  Inspect project <span aria-hidden="true">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => openProject(project.page)}
                  aria-label={`Open ${project.title}`}
                >
                  Open application
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="project-directory"
        className="home-directory-section"
        aria-labelledby="directory-heading"
      >
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">PROJECT INDEX</p>
            <h2 id="directory-heading">Explore the applications</h2>
            <p className="home-section-description">
              Search by name, category, or engineering concept. Open an
              application to explore its interface.
            </p>
          </div>

          <span className="home-section-index">02 / 04</span>
        </div>

        <div className="directory-controls">
          <div className="directory-header-group">
            <h3 className="directory-header">Application directory</h3>

            <span className="app-count-badge" aria-live="polite">
              {filteredProjects.length} / {PROJECTS.length} projects
            </span>
          </div>

          <div className="home-directory-toolbar">
            <label className="home-search-label" htmlFor="project-search">
              Find a project
            </label>

            <input
              id="project-search"
              type="search"
              className="search-input"
              placeholder="Try 'validation' or 'financial tables'..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoComplete="off"
            />

            <label className="home-sort-label" htmlFor="project-sort">
              Sort by
            </label>

            <select
              id="project-sort"
              className="home-sort-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className="category-tabs"
            role="group"
            aria-label="Filter projects by category"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`tab-btn ${
                  activeCategory === category ? 'active' : ''
                }`.trim()}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
                <span className="home-tab-count">
                  {categoryCounts[category] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="home-directory-summary">
            <span>
              Showing {filteredProjects.length} of {PROJECTS.length} projects
            </span>

            <div className="home-directory-actions">
              <button
                type="button"
                onClick={() => setShowComparison((current) => !current)}
                disabled={compareIds.length === 0}
              >
                Compare selected ({compareIds.length})
              </button>

              <button type="button" onClick={resetDirectory}>
                Reset filters
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="bento-grid">
            {filteredProjects.map((project, index) => {
              const isCompared = compareIds.includes(project.id);

              return (
                <article
                  key={project.id}
                  className={`bento-card ${
                    project.featured ? 'home-project-featured' : ''
                  }`.trim()}
                >
                  <div className="home-project-topline">
                    <span className="home-project-id">{project.id}</span>
                    <span className="home-project-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="card-header-row">
                    <span className="item-link">{project.title}</span>

                    <span className="category-tag">{project.category}</span>
                  </div>

                  <p className="home-project-description">
                    {project.description}
                  </p>

                  <div className="home-project-skills">
                    {project.skills.slice(0, 3).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <div className="home-project-footer">
                    <button
                      type="button"
                      className="home-project-inspect"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      Inspect <span aria-hidden="true">↗</span>
                    </button>

                    <button
                      type="button"
                      className={`home-project-compare ${
                        isCompared ? 'selected' : ''
                      }`.trim()}
                      onClick={() => toggleCompare(project.id)}
                      aria-pressed={isCompared}
                      aria-label={`${
                        isCompared ? 'Remove' : 'Add'
                      } ${project.title} ${
                        isCompared ? 'from' : 'to'
                      } comparison`}
                      disabled={!isCompared && compareIds.length >= 3}
                    >
                      {isCompared ? 'Selected ✓' : 'Compare +'}
                    </button>

                    <button
                      type="button"
                      className="home-project-open"
                      onClick={() => openProject(project.page)}
                    >
                      Open application
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="home-empty-state" role="status">
            <p className="home-eyebrow">NO MATCHES</p>
            <h3>No projects found</h3>
            <p>
              Try a different search term or remove the category filter.
            </p>

            <button type="button" onClick={resetDirectory}>
              Show all projects
            </button>
          </div>
        )}
      </section>

      <section
        id="engineering"
        className="home-engineering-section"
        aria-labelledby="engineering-heading"
      >
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">HOW I BUILD</p>
            <h2 id="engineering-heading">Engineering beyond the interface</h2>
            <p className="home-section-description">
              The areas I work across when building and connecting software.
            </p>
          </div>

          <span className="home-section-index">03 / 04</span>
        </div>

        <div className="home-capabilities-grid">
          {CAPABILITIES.slice(
            0,
            showAllCapabilities ? CAPABILITIES.length : 3
          ).map((capability) => (
            <article className="home-capability-card" key={capability.number}>
              <span className="home-capability-number">
                {capability.number}
              </span>

              <h3>{capability.title}</h3>
              <p>{capability.description}</p>

              <div className="home-capability-topics">
                {capability.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="home-expand-capabilities"
          onClick={() => setShowAllCapabilities((current) => !current)}
          aria-expanded={showAllCapabilities}
        >
          {showAllCapabilities
            ? 'Show fewer areas'
            : 'Explore all engineering areas'}
          <span aria-hidden="true">
            {showAllCapabilities ? '↑' : '↓'}
          </span>
        </button>

        <div className="home-engineering-note">
          <div>
            <p className="home-eyebrow">WHAT MATTERS TO ME</p>
            <h3>Code should explain itself.</h3>
          </div>

          <p>
            Good software is more than a working screen. It should have
            understandable state transitions, sensible error handling,
            predictable data flow, and a structure another developer can
            maintain.
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="home-contact-section"
        aria-labelledby="contact-heading"
      >
        <div className="home-contact-content">
          <p className="home-eyebrow">NEXT STEP</p>
          <h2 id="contact-heading">
            Let's talk about the work.
          </h2>

          <p>
            I'm interested in opportunities where I can contribute to real
            software, learn from experienced engineers, and keep improving
            through practical work.
          </p>

          <div className="home-contact-actions">
            <a href="mailto:">
              Email me about an opportunity
            </a>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Back to top ↑
            </button>
          </div>

          <p className="home-contact-note">
            Add your preferred professional email and CV link before
            publishing this portfolio.
          </p>
        </div>
      </section>

      <footer className="home-footer">
        <a
          className="home-footer-brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Prince Osinachi
        </a>

        <p>Developer portfolio · Built to be explored.</p>

        <span>© {new Date().getFullYear()}</span>
      </footer>

      {selectedProject && (
        <div
          className="home-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProjectId(null);
            }
          }}
        >
          <section
            className="home-project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-modal-title"
            aria-describedby="home-modal-description"
          >
            <div className="home-modal-topline">
              <span>{selectedProject.id}</span>

              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                aria-label="Close project details"
                autoFocus
              >
                Close ×
              </button>
            </div>

            <p className="home-eyebrow">{selectedProject.category}</p>

            <h2 id="home-modal-title">{selectedProject.title}</h2>
<p id="home-modal-description">
              {selectedProject.description}
            </p>

            <div className="home-modal-detail">
              <h3>Problem being addressed</h3>
              <p>{selectedProject.problem}</p>
            </div>

            <div className="home-modal-detail">
              <h3>Engineering considerations</h3>
              <p>{selectedProject.engineering}</p>
            </div>

            <div className="home-modal-detail">
              <h3>Areas to inspect</h3>

              <ul>
                {selectedProject.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>

            <div className="home-modal-detail">
              <h3>Relevant skills</h3>

              <div className="home-project-skills">
                {selectedProject.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="home-modal-actions">
              <button
                type="button"
                onClick={() => openProject(selectedProject.page)}
              >
                Open application ↗
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(selectedProject.id)}
              >
                {compareIds.includes(selectedProject.id)
                  ? 'Remove from comparison'
                  : 'Add to comparison'}
              </button>

              <button
                type="button"
                onClick={() => copyProjectReference(selectedProject)}
              >
                {copiedProjectId === selectedProject.id
                  ? 'Reference copied'
                  : 'Copy project reference'}
              </button>
            </div>

            <p className="home-modal-footnote">
              Implementation details should be verified against the actual
              application and its source code.
            </p>
          </section>
        </div>
      )}

      {showComparison && (
        <div
          className="home-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowComparison(false);
            }
          }}
        >
          <section
            className="home-comparison-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-comparison-heading"
          >
            <div className="home-modal-topline">
              <span>PROJECT COMPARISON</span>

              <button
                type="button"
                onClick={() => setShowComparison(false)}
                aria-label="Close comparison"
                autoFocus
              >
                Close ×
              </button>
            </div>

            <h2 id="home-comparison-heading">Compare applications</h2>

            <p>
              Compare up to three projects by their purpose, category, and
              engineering considerations.
            </p>

            <div className="home-comparison-grid">
              {comparedProjects.map((project) => (
                <article
                  className="home-comparison-card"
                  key={project.id}
                >
                  <span>{project.id}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  <h4>Category</h4>
                  <p>{project.category}</p>

                  <h4>Engineering focus</h4>
                  <p>{project.complexity}</p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowComparison(false);
                      setSelectedProjectId(project.id);
                    }}
                  >
                    Inspect details
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCompare(project.id)}
                  >
                    Remove from comparison
                  </button>
                </article>
              ))}
            </div>

            {comparedProjects.length < 3 && (
              <p>
                Select more projects in the directory to compare up to three.
              </p>
            )}
          </section>
        </div>
      )}

      {showKeyboardHelp && (
        <div
          className="home-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowKeyboardHelp(false);
            }
          }}
        >
          <section
            className="home-keyboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-keyboard-heading"
          >
            <div className="home-modal-topline">
              <span>QUICK GUIDE</span>

              <button
                type="button"
                onClick={() => setShowKeyboardHelp(false)}
                aria-label="Close navigation guide"
                autoFocus
              >
                Close ×
              </button>
            </div>

            <h2 id="home-keyboard-heading">Finding your way around</h2>

            <ul>
              <li>Use the project search to find a title or technical topic.</li>
              <li>Choose a category to narrow the project directory.</li>
              <li>Use Inspect to read project details without leaving the page.</li>
              <li>Use Open application to navigate to a project.</li>
              <li>Select up to three projects for side-by-side comparison.</li>
              <li>Press Escape to close an open dialog.</li>
            </ul>

            <button
              type="button"
              onClick={() => setShowKeyboardHelp(false)}
            >
              Start exploring
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

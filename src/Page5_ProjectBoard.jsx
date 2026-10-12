import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import './Page5_ProjectBoard.css';

const TASK_STORAGE_KEY = 'engineering_project_board_v2';
const SPRINT_STORAGE_KEY = 'engineering_project_sprints_v2';
const ACTIVITY_STORAGE_KEY = 'engineering_project_activity_v2';

const STAGES = [
  { id: 'todo', label: 'Backlog / To Do' },
  { id: 'progress', label: 'In Progress' },
  { id: 'review', label: 'Code Review' },
  { id: 'done', label: 'Completed & Tested' },
];

const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Security',
  'DevOps',
  'Testing',
  'Database',
  'Infrastructure',
  'Documentation',
];

const ASSIGNEES = [
  'Prince Osinachi',
  'Kalu E.',
  'Dev Team',
  'Unassigned',
];

const TASK_STATUSES = ['todo', 'progress', 'review', 'done', 'blocked'];

const INITIAL_TASKS = [
  {
    id: 'DEV-101',
    title: 'Refactor core API routing middleware and error handling',
    description:
      'Improve API routing consistency, centralize error handling, and standardize responses.',
    stage: 'todo',
    assignee: 'Prince Osinachi',
    priority: 'High',
    category: 'Backend',
    status: 'todo',
    storyPoints: 5,
    labels: ['api', 'refactoring'],
    dueDate: '',
    sprintId: 'SPRINT-01',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    acceptanceCriteria: [
      'All routes use consistent error responses.',
      'Unexpected errors are logged centrally.',
      'Existing API behavior remains backward compatible.',
    ],
    comments: [],
    activity: [],
    blockedReason: '',
    archived: false,
  },
  {
    id: 'DEV-102',
    title: 'Review input form validation schemas for authentication flow',
    description:
      'Audit authentication forms and implement consistent validation rules.',
    stage: 'progress',
    assignee: 'Kalu E.',
    priority: 'Urgent',
    category: 'Security',
    status: 'progress',
    storyPoints: 8,
    labels: ['authentication', 'validation'],
    dueDate: '',
    sprintId: 'SPRINT-01',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
    acceptanceCriteria: [
      'Required fields are validated.',
      'Invalid input receives useful feedback.',
      'Sensitive values are never included in validation errors.',
    ],
    comments: [],
    activity: [],
    blockedReason: '',
    archived: false,
  },
  {
    id: 'DEV-103',
    title: 'Map modular data components into directory file layout',
    description:
      'Organize reusable components and improve the project directory structure.',
    stage: 'done',
    assignee: 'Prince Osinachi',
    priority: 'Medium',
    category: 'Frontend',
    status: 'done',
    storyPoints: 3,
    labels: ['architecture', 'components'],
    dueDate: '',
    sprintId: 'SPRINT-01',
    createdAt: '2026-10-03T11:00:00.000Z',
    updatedAt: '2026-10-06T11:00:00.000Z',
    acceptanceCriteria: [
      'Shared components have a consistent location.',
      'Imports resolve correctly.',
    ],
    comments: [],
    activity: [],
    blockedReason: '',
    archived: false,
  },
];

const INITIAL_SPRINTS = [
  {
    id: 'SPRINT-01',
    name: 'Sprint 01',
    goal: 'Stabilize core application architecture and authentication.',
    startDate: '2026-10-01',
    endDate: '2026-10-14',
    status: 'active',
  },
  {
    id: 'SPRINT-02',
    name: 'Sprint 02',
    goal: 'Improve product reliability and testing coverage.',
    startDate: '2026-10-15',
    endDate: '2026-10-28',
    status: 'planned',
  },
];

const INITIAL_FILTERS = {
  priority: 'All',
  category: 'All',
  assignee: 'All',
  status: 'All',
  sprint: 'All',
  dueDate: 'All',
};

function readStoredArray(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function getToday() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function generateId(prefix, existingItems) {
  const existingIds = new Set(existingItems.map((item) => item.id));

  let id;

  do {
    const randomPart =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()
        : `${Date.now().toString(36).toUpperCase()}${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`;

    id = `${prefix}-${randomPart}`;
  } while (existingIds.has(id));

  return id;
}

function escapeCSV(value) {
  let normalized = String(value ?? '');

  if (/^[\s]*[=+\-@]/.test(normalized)) {
    normalized = `'${normalized}`;
  }

  return `"${normalized.replace(/"/g, '""')}"`;
}

function createActivity(action, details = '') {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
}

function normalizeTask(task) {
  const validStages = STAGES.map((stage) => stage.id);

  const stage = validStages.includes(task.stage) ? task.stage : 'todo';

  return {
    description: '',
    status: stage,
    storyPoints: 1,
    labels: [],
    dueDate: '',
    sprintId: '',
    acceptanceCriteria: [],
    comments: [],
    activity: [],
    blockedReason: '',
    archived: false,
    ...task,
    stage,
    status: task.status === 'blocked' ? 'blocked' : stage,
  };
}

export default function Page5_ProjectBoard({ setPage }) {
  const [tasks, setTasks] = useState(() =>
    readStoredArray(TASK_STORAGE_KEY, INITIAL_TASKS).map(normalizeTask)
  );

  const [sprints, setSprints] = useState(() =>
    readStoredArray(SPRINT_STORAGE_KEY, INITIAL_SPRINTS)
  );

  const [activityLog, setActivityLog] = useState(() =>
    readStoredArray(ACTIVITY_STORAGE_KEY, [])
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [showSprintManager, setShowSprintManager] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [activeSprintId, setActiveSprintId] = useState('SPRINT-01');

  const [sortBy, setSortBy] = useState('priority');
  const [sortDirection, setSortDirection] = useState('desc');

  const [notification, setNotification] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('Prince Osinachi');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Frontend');
  const [newStoryPoints, setNewStoryPoints] = useState('3');
  const [newDueDate, setNewDueDate] = useState('');
  const [newSprintId, setNewSprintId] = useState('SPRINT-01');
  const [newLabels, setNewLabels] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  const [commentText, setCommentText] = useState('');

  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStart, setNewSprintStart] = useState(getToday());
  const [newSprintEnd, setNewSprintEnd] = useState('');

  const [isImporting, setIsImporting] = useState(false);
useEffect(() => {
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      setNotification({
        type: 'error',
        message: 'Unable to save tasks in local browser storage.',
      });
    }
  }, [tasks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(sprints));
    } catch {
      setNotification({
        type: 'error',
        message: 'Unable to save sprint settings.',
      });
    }
  }, [sprints]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ACTIVITY_STORAGE_KEY,
        JSON.stringify(activityLog.slice(0, 500))
      );
    } catch {
      setNotification({
        type: 'error',
        message: 'Unable to save activity history.',
      });
    }
  }, [activityLog]);

  useEffect(() => {
    if (!notification) return undefined;

    const timer = window.setTimeout(() => setNotification(null), 3500);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const addActivity = useCallback((action, details = '', taskId = 'WORKSPACE') => {
    const entry = {
      ...createActivity(action, details),
      taskId,
    };

    setActivityLog((previous) => [entry, ...previous].slice(0, 500));
  }, []);

  const activeSprint = useMemo(
    () => sprints.find((sprint) => sprint.id === activeSprintId) ?? null,
    [sprints, activeSprintId]
  );

  const visibleTasks = useMemo(
    () => tasks.filter((task) => showArchived || !task.archived),
    [tasks, showArchived]
  );

  const activeSprintTasks = useMemo(
    () =>
      visibleTasks.filter(
        (task) => task.sprintId === activeSprintId
      ),
    [visibleTasks, activeSprintId]
  );

  const completedTasks = useMemo(
    () => visibleTasks.filter((task) => task.stage === 'done'),
    [visibleTasks]
  );

  const blockedTasks = useMemo(
    () =>
      visibleTasks.filter(
        (task) => task.status === 'blocked' || task.stage === 'blocked'
      ),
    [visibleTasks]
  );

  const overdueTasks = useMemo(
    () =>
      visibleTasks.filter(
        (task) =>
          task.dueDate &&
          task.dueDate < getToday() &&
          task.stage !== 'done'
      ),
    [visibleTasks]
  );

  const totalStoryPoints = useMemo(
    () => visibleTasks.reduce((sum, task) => sum + Number(task.storyPoints || 0), 0),
    [visibleTasks]
  );

  const completedStoryPoints = useMemo(
    () =>
      completedTasks.reduce(
        (sum, task) => sum + Number(task.storyPoints || 0),
        0
      ),
    [completedTasks]
  );

  const completionRate = visibleTasks.length
    ? Math.round((completedTasks.length / visibleTasks.length) * 100)
    : 0;

  const sprintTasks = activeSprintTasks.filter((task) => !task.archived);

  const sprintCompletedTasks = sprintTasks.filter(
    (task) => task.stage === 'done'
  );

  const sprintProgress = sprintTasks.length
    ? Math.round((sprintCompletedTasks.length / sprintTasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return visibleTasks
      .filter((task) => {
        const matchesSearch =
          !query ||
          [
            task.id,
            task.title,
            task.description,
            task.assignee,
            task.category,
            task.priority,
            ...(task.labels || []),
          ].some((value) =>
            String(value ?? '').toLowerCase().includes(query)
          );

        const matchesPriority =
          filters.priority === 'All' ||
          task.priority === filters.priority;

        const matchesCategory =
          filters.category === 'All' ||
          task.category === filters.category;

        const matchesAssignee =
          filters.assignee === 'All' ||
          task.assignee === filters.assignee;

        const matchesStatus =
          filters.status === 'All' ||
          (filters.status === 'blocked'
            ? task.status === 'blocked' || task.stage === 'blocked'
            : task.stage === filters.status);

        const matchesSprint =
          filters.sprint === 'All' ||
          task.sprintId === filters.sprint;

        const matchesDueDate =
          filters.dueDate === 'All' ||
          (filters.dueDate === 'Overdue' &&
            task.dueDate &&
            task.dueDate < getToday() &&
            task.stage !== 'done') ||
          (filters.dueDate === 'Today' && task.dueDate === getToday()) ||
          (filters.dueDate === 'No deadline' && !task.dueDate);

        return (
          matchesSearch &&
          matchesPriority &&
          matchesCategory &&
          matchesAssignee &&
          matchesStatus &&
          matchesSprint &&
          matchesDueDate
        );
      })
      .sort((a, b) => {
        const priorityRank = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        let result = 0;

        if (sortBy === 'priority') {
          result =
            (priorityRank[a.priority] || 0) -
            (priorityRank[b.priority] || 0);
        } else if (sortBy === 'dueDate') {
          result = String(a.dueDate || '9999-12-31').localeCompare(
            String(b.dueDate || '9999-12-31')
          );
        } else if (sortBy === 'storyPoints') {
          result = Number(a.storyPoints || 0) - Number(b.storyPoints || 0);
        } else if (sortBy === 'title') {
          result = a.title.localeCompare(b.title);
        } else {
          result = String(a.createdAt || '').localeCompare(
            String(b.createdAt || '')
          );
        }

        return sortDirection === 'asc' ? result : -result;
      });
  }, [
    visibleTasks,
    searchQuery,
    filters,
    sortBy,
    sortDirection,
  ]);

  const taskCounts = useMemo(
    () =>
      STAGES.reduce((counts, stage) => {
        counts[stage.id] = filteredTasks.filter(
          (task) => task.stage === stage.id
        ).length;

        return counts;
      }, {}),
    [filteredTasks]
  );

  const workload = useMemo(
    () =>
      ASSIGNEES.map((assignee) => {
        const assignedTasks = visibleTasks.filter(
          (task) =>
            task.assignee === assignee &&
            task.stage !== 'done' &&
            task.status !== 'blocked'
        );

        const points = assignedTasks.reduce(
          (sum, task) => sum + Number(task.storyPoints || 0),
          0
        );

        return {
          assignee,
          taskCount: assignedTasks.length,
          storyPoints: points,
          overCapacity: points > 15,
        };
      }),
    [visibleTasks]
  );

  const resetTaskForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewAssignee('Prince Osinachi');
    setNewPriority('Medium');
    setNewCategory('Frontend');
    setNewStoryPoints('3');
    setNewDueDate('');
    setNewSprintId(activeSprintId);
    setNewLabels('');
    setNewCriteria('');
    setNewBlockedReason('');
    setEditingTaskId(null);
  };

  const openCreateForm = () => {
    resetTaskForm();
    setIsCreating(true);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDescription(task.description || '');
    setNewAssignee(task.assignee);
    setNewPriority(task.priority);
    setNewCategory(task.category);
    setNewStoryPoints(String(task.storyPoints ?? 1));
    setNewDueDate(task.dueDate || '');
    setNewSprintId(task.sprintId || '');
    setNewLabels((task.labels || []).join(', '));
    setNewCriteria((task.acceptanceCriteria || []).join('\n'));
    setNewBlockedReason(task.blockedReason || '');

    setSelectedTask(null);
    setIsCreating(true);
  };

  const handleCreateTask = (event) => {
    event.preventDefault();

    const title = newTitle.trim();
    const storyPoints = Number(newStoryPoints);

    if (!title) {
      setNotification({
        type: 'error',
        message: 'A task title is required.',
      });
      return;
    }

    if (
      !Number.isInteger(storyPoints) ||
      storyPoints < 1 ||
      storyPoints > 100
    ) {
      setNotification({
        type: 'error',
        message: 'Story points must be a whole number between 1 and 100.',
      });
      return;
    }

    if (newDueDate && newDueDate < '1970-01-01') {
      setNotification({
        type: 'error',
        message: 'Enter a valid due date.',
      });
      return;
    }

    const now = new Date().toISOString();

    const labels = [
      ...new Set(
        newLabels
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean)
      ),
    ];

    const acceptanceCriteria = newCriteria
      .split('\n')
      .map((criterion) => criterion.trim())
      .filter(Boolean);

    if (editingTaskId) {
      const existingTask = tasks.find(
        (task) => task.id === editingTaskId
      );

      if (!existingTask) {
        setNotification({
          type: 'error',
          message: 'The task no longer exists.',
        });
        resetTaskForm();
        setIsCreating(false);
        return;
      }

      const updatedTask = {
        ...existingTask,
        title,
        description: newDescription.trim(),
        assignee: newAssignee,
        priority: newPriority,
        category: newCategory,
        storyPoints,
        dueDate: newDueDate,
        sprintId: newSprintId,
        labels,
        acceptanceCriteria,
        blockedReason: newBlockedReason.trim(),
        updatedAt: now,
        activity: [
          ...(existingTask.activity || []),
          createActivity('TASK_UPDATED', 'Task details updated'),
        ],
      };

      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTaskId ? updatedTask : task
        )
      );

      addActivity('TASK_UPDATED', title, editingTaskId);

      setNotification({
        type: 'success',
        message: `${editingTaskId} updated successfully.`,
      });
    } else {
      const task = {
        id: generateId('DEV', tasks),
        title,
        description: newDescription.trim(),
        stage: 'todo',
        status: 'todo',
        assignee: newAssignee,
        priority: newPriority,
        category: newCategory,
        storyPoints,
        labels,
        dueDate: newDueDate,
        sprintId: newSprintId,
        createdAt: now,
        updatedAt: now,
        acceptanceCriteria,
        comments: [],
        activity: [createActivity('TASK_CREATED', 'Task created')],
        blockedReason: '',
        archived: false,
      };

      setTasks((previous) => [task, ...previous]);

      addActivity('TASK_CREATED', title, task.id);

      setNotification({
        type: 'success',
        message: `${task.id} added to the backlog.`,
      });
    }

    resetTaskForm();
    setIsCreating(false);
  };
const advanceTask = (id) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const stageOrder = STAGES.map((stage) => stage.id);
    const currentIndex = stageOrder.indexOf(task.stage);
    const nextStage = stageOrder[
      (currentIndex + 1 + stageOrder.length) % stageOrder.length
    ];

    const now = new Date().toISOString();

    setTasks((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              stage: nextStage,
              status: nextStage,
              updatedAt: now,
              activity: [
                ...(item.activity || []),
                createActivity(
                  'STAGE_CHANGED',
                  `${item.stage} → ${nextStage}`
                ),
              ],
            }
          : item
      )
    );

    addActivity('STAGE_CHANGED', `${task.stage} → ${nextStage}`, id);

    setNotification({
      type: 'success',
      message: `${id} moved to ${nextStage}.`,
    });
  };

  const moveTaskToStage = (id, stage) => {
    if (!STAGES.some((item) => item.id === stage)) return;

    const task = tasks.find((item) => item.id === id);

    if (!task || task.stage === stage) return;

    setTasks((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              stage,
              status: stage,
              updatedAt: new Date().toISOString(),
              activity: [
                ...(item.activity || []),
                createActivity('STAGE_CHANGED', `${item.stage} → ${stage}`),
              ],
            }
          : item
      )
    );

    addActivity('STAGE_CHANGED', `${task.stage} → ${stage}`, id);
  };

  const handleToggleBlocked = (task) => {
    const shouldBlock = task.status !== 'blocked';

    if (shouldBlock && !task.blockedReason.trim()) {
      const reason = window.prompt(
        'Why is this task blocked?'
      );

      if (!reason?.trim()) {
        setNotification({
          type: 'error',
          message: 'A reason is required to block a task.',
        });
        return;
      }

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: 'blocked',
                blockedReason: reason.trim(),
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      addActivity('TASK_BLOCKED', reason.trim(), task.id);
    } else {
      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: item.stage,
                blockedReason: '',
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      addActivity('TASK_UNBLOCKED', 'Task unblocked', task.id);
    }
  };

  const handleDeleteTask = (id) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const confirmed = window.confirm(
      `Delete ${task.id}: "${task.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setTasks((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setSelectedIds((previous) =>
      previous.filter((itemId) => itemId !== id)
    );

    setSelectedTask(null);

    addActivity('TASK_DELETED', task.title, id);

    setNotification({
      type: 'success',
      message: `${id} deleted.`,
    });
  };

  const handleDuplicateTask = (task) => {
    const now = new Date().toISOString();

    const duplicate = {
      ...task,
      id: generateId('DEV', tasks),
      title: `${task.title} (Copy)`,
      stage: 'todo',
      status: 'todo',
      createdAt: now,
      updatedAt: now,
      comments: [],
      activity: [createActivity('TASK_DUPLICATED', task.id)],
      archived: false,
    };

    setTasks((previous) => [duplicate, ...previous]);

    addActivity('TASK_DUPLICATED', task.id, duplicate.id);

    setNotification({
      type: 'success',
      message: `Created ${duplicate.id}.`,
    });
  };

  const handleArchiveTask = (task) => {
    const nextArchivedState = !task.archived;

    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id
          ? {
              ...item,
              archived: nextArchivedState,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    setSelectedTask(null);

    addActivity(
      nextArchivedState ? 'TASK_ARCHIVED' : 'TASK_RESTORED',
      task.title,
      task.id
    );
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    );
  };

  const handleSelectVisible = (event) => {
    const visibleIds = filteredTasks.map((task) => task.id);

    setSelectedIds((previous) =>
      event.target.checked
        ? Array.from(new Set([...previous, ...visibleIds]))
        : previous.filter((id) => !visibleIds.includes(id))
    );
  };

  const handleBulkMove = (stage) => {
    if (selectedIds.length === 0) return;

    setTasks((previous) =>
      previous.map((task) =>
        selectedIds.includes(task.id)
          ? {
              ...task,
              stage,
              status: stage,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );

    addActivity(
      'BULK_STAGE_CHANGED',
      `${selectedIds.length} task(s) moved to ${stage}`
    );

    setSelectedIds([]);

    setNotification({
      type: 'success',
      message: `Selected tasks moved to ${stage}.`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected task(s)?`
    );

    if (!confirmed) return;

    const selectedTasks = tasks.filter((task) =>
      selectedIds.includes(task.id)
    );

    selectedTasks.forEach((task) => {
      addActivity('TASK_DELETED', task.title, task.id);
    });

    setTasks((previous) =>
      previous.filter((task) => !selectedIds.includes(task.id))
    );

    setSelectedIds([]);

    setNotification({
      type: 'success',
      message: 'Selected tasks deleted.',
    });
  };

  const handleAddComment = (event) => {
    event.preventDefault();

    if (!selectedTask || !commentText.trim()) return;

    const comment = {
      ...createActivity('COMMENT_ADDED', commentText.trim()),
      author: 'Current User',
    };

    setTasks((previous) =>
      previous.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              comments: [...(task.comments || []), comment],
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );

    setSelectedTask((previous) => ({
      ...previous,
      comments: [...(previous.comments || []), comment],
    }));

    addActivity('COMMENT_ADDED', commentText.trim(), selectedTask.id);

    setCommentText('');
  };

  const handleCreateSprint = (event) => {
    event.preventDefault();

    if (!newSprintName.trim()) {
      setNotification({
        type: 'error',
        message: 'Enter a sprint name.',
      });
      return;
    }

    if (
      !newSprintStart ||
      !newSprintEnd ||
      newSprintEnd < newSprintStart
    ) {
      setNotification({
        type: 'error',
        message: 'The sprint end date must be on or after its start date.',
      });
      return;
    }

    const sprint = {
      id: generateId('SPRINT', sprints),
      name: newSprintName.trim(),
      goal: newSprintGoal.trim(),
      startDate: newSprintStart,
      endDate: newSprintEnd,
      status: 'planned',
    };

    setSprints((previous) => [...previous, sprint]);

    setActiveSprintId(sprint.id);
    setNewSprintId(sprint.id);
    setNewSprintName('');
    setNewSprintGoal('');
    setNewSprintStart(getToday());
    setNewSprintEnd('');
    setShowSprintManager(false);

    addActivity('SPRINT_CREATED', sprint.name);

    setNotification({
      type: 'success',
      message: `${sprint.name} created.`,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Description',
      'Stage',
      'Status',
      'Assignee',
      'Priority',
      'Category',
      'Story Points',
      'Due Date',
      'Sprint',
      'Labels',
      'Blocked Reason',
    ];

    const rows = filteredTasks.map((task) => [
      task.id,
      task.title,
      task.description,
      task.stage,
      task.status,
      task.assignee,
      task.priority,
      task.category,
      task.storyPoints,
      task.dueDate,
      task.sprintId,
      (task.labels || []).join('; '),
      task.blockedReason,
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
    link.download = `engineering-board-${getToday()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    addActivity('TASKS_EXPORTED', `${filteredTasks.length} task(s)`);

    setNotification({
      type: 'success',
      message: 'Filtered tasks exported.',
    });
  };

  const handleExportJSON = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      tasks,
      sprints,
      activityLog,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `engineering-workspace-${getToday()}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    addActivity('WORKSPACE_BACKUP_EXPORTED');
  };

  const handleImportJSON = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (
        !data ||
        !Array.isArray(data.tasks) ||
        !Array.isArray(data.sprints)
      ) {
        throw new Error('Invalid workspace backup format.');
      }

      const confirmed = window.confirm(
        `Import ${data.tasks.length} tasks and ${data.sprints.length} sprints? This replaces the current workspace data.`
      );

      if (!confirmed) return;

      const normalizedTasks = data.tasks.map(normalizeTask);

      const uniqueTaskIds = new Set(
        normalizedTasks.map((task) => task.id)
      );

      if (uniqueTaskIds.size !== normalizedTasks.length) {
        throw new Error('The backup contains duplicate task IDs.');
      }

      setTasks(normalizedTasks);
      setSprints(data.sprints);
      setActivityLog(
        Array.isArray(data.activityLog) ? data.activityLog : []
      );

      setSelectedIds([]);
      setSelectedTask(null);

      setNotification({
        type: 'success',
        message: 'Workspace backup imported successfully.',
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Unable to import workspace backup.',
      });
    } finally {
      event.target.value = '';
      setIsImporting(false);
    }
  };
const resetFilters = () => {
    setSearchQuery('');
    setFilters(INITIAL_FILTERS);
  };

  const renderColumn = (stageName, headingText) => {
    const columnTasks = filteredTasks.filter(
      (task) => task.stage === stageName
    );

    const columnPoints = columnTasks.reduce(
      (sum, task) => sum + Number(task.storyPoints || 0),
      0
    );

    return (
      <section className="kanban-column" key={stageName}>
        <div className="column-header">
          <div>
            <h2 className="column-title">{headingText}</h2>
            <small className="column-story-points">
              {columnPoints} story points
            </small>
          </div>

          <span className="task-count-badge">
            {columnTasks.length}
          </span>
        </div>

        <div className="column-card-track">
          {columnTasks.length === 0 ? (
            <div className="empty-column-slot">
              <span>◇</span>
              <p>No tasks in this stage</p>
            </div>
          ) : (
            columnTasks.map((task) => {
              const isOverdue =
                task.dueDate &&
                task.dueDate < getToday() &&
                task.stage !== 'done';

              return (
                <article
                  key={task.id}
                  className={`task-card ${task.stage} ${
                    task.status === 'blocked' ? 'blocked-task' : ''
                  }`}
                >
                  <div className="task-card-top">
                    <div className="task-id-group">
                      <span className="task-id">{task.id}</span>
                      <span className="category-tag">{task.category}</span>
                    </div>

                    <span
                      className={`priority-pill ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="task-title-button"
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.stage === 'done' ? (
                      <span className="completed-strike">
                        {task.title}
                      </span>
                    ) : (
                      task.title
                    )}
                  </button>

                  {task.description && (
                    <p className="task-description-preview">
                      {task.description.length > 130
                        ? `${task.description.slice(0, 130)}…`
                        : task.description}
                    </p>
                  )}

                  <div className="task-metadata-row">
                    <span className="story-point-badge">
                      {task.storyPoints} SP
                    </span>

                    {task.dueDate && (
                      <span
                        className={`task-due-date ${
                          isOverdue ? 'overdue' : ''
                        }`}
                      >
                        {isOverdue ? 'Overdue · ' : 'Due · '}
                        {task.dueDate}
                      </span>
                    )}
                  </div>

                  {(task.labels || []).length > 0 && (
                    <div className="task-label-list">
                      {task.labels.map((label) => (
                        <span className="task-label" key={label}>
                          #{label}
                        </span>
                      ))}
                    </div>
                  )}

                  {task.status === 'blocked' && (
                    <div className="blocked-task-warning">
                      <strong>Blocked</strong>
                      <p>{task.blockedReason || 'No reason provided.'}</p>
                    </div>
                  )}

                  <div className="task-card-footer">
                    <span className="assignee-text">
                      Assignee: <strong>{task.assignee}</strong>
                    </span>

                    <div className="task-action-group">
                      <button
                        type="button"
                        className="advance-btn"
                        onClick={() => advanceTask(task.id)}
                        disabled={task.status === 'blocked'}
                      >
                        {task.stage === 'done' ? 'Reopen' : 'Advance →'}
                      </button>

                      <button
                        type="button"
                        className="delete-task-btn"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                        aria-label={`Delete ${task.id}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="task-secondary-actions">
                    <button
                      type="button"
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateTask(task)}
                    >
                      Duplicate
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBlocked(task)}
                    >
                      {task.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleArchiveTask(task)}
                    >
                      Archive
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="board-wrapper">
      <header className="board-header">
        <button
          type="button"
          className="workspace-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Back to Directory
        </button>

        <div className="board-meta">
          <h1 className="board-title">Engineering Command Center</h1>
          <p className="board-subtitle">
            Sprint planning, delivery intelligence, and issue tracking
          </p>
        </div>

        <button
          type="button"
          className="create-task-btn"
          onClick={() => {
            if (isCreating) {
              resetTaskForm();
              setIsCreating(false);
            } else {
              openCreateForm();
            }
          }}
        >
          {isCreating ? '× Cancel' : '+ New Task'}
        </button>
      </header>

      {notification && (
        <div
          className={`board-notification ${notification.type}`}
          role="status"
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <section className="board-overview-panel glass-card">
        <div className="board-overview-heading">
          <div>
            <p className="board-eyebrow">WORKSPACE OVERVIEW</p>
            <h2>Delivery Intelligence</h2>
            <p>Monitor execution, workload, and sprint health.</p>
          </div>

          <button
            type="button"
            className="analytics-toggle-btn"
            onClick={() => setShowAnalytics((previous) => !previous)}
            aria-expanded={showAnalytics}
          >
            {showAnalytics ? 'Hide Metrics' : 'Show Metrics'}
          </button>
        </div>

        {showAnalytics && (
          <div className="board-metrics-grid">
            <article className="board-metric-card glass-card">
              <span>Total Active Tasks</span>
              <strong>
                {visibleTasks.filter((task) => task.stage !== 'done').length}
              </strong>
              <small>Across the current workspace</small>
            </article>

            <article className="board-metric-card glass-card">
              <span>Completion Rate</span>
              <strong>{completionRate}%</strong>
              <div className="board-progress-track">
                <div
                  className="board-progress-fill"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <small>
                {completedTasks.length} of {visibleTasks.length} tasks completed
              </small>
            </article>

            <article className="board-metric-card glass-card">
              <span>Story Points Delivered</span>
              <strong>{completedStoryPoints}</strong>
              <small>{totalStoryPoints} total planned points</small>
            </article>

            <article className="board-metric-card glass-card">
              <span>Overdue Tasks</span>
              <strong>{overdueTasks.length}</strong>
              <small>Unfinished tasks past their due date</small>
            </article>

            <article className="board-metric-card glass-card">
              <span>Blocked Tasks</span>
              <strong>{blockedTasks.length}</strong>
              <small>Issues requiring intervention</small>
            </article>

            <article className="board-metric-card glass-card">
              <span>Tracked Activity</span>
              <strong>{activityLog.length}</strong>
              <small>Locally recorded workspace events</small>
            </article>
          </div>
        )}
      </section>

      <section className="sprint-control-panel glass-card">
        <div className="sprint-control-heading">
          <div>
            <p className="board-eyebrow">SPRINT OPERATIONS</p>
            <h2>Sprint Workspace</h2>
          </div>

          <button
            type="button"
            className="analytics-toggle-btn"
            onClick={() => setShowSprintManager((previous) => !previous)}
            aria-expanded={showSprintManager}
          >
            {showSprintManager ? 'Close Sprint Manager' : '+ Manage Sprints'}
          </button>
        </div>

        <div className="sprint-selector-row">
          <div className="board-form-field">
            <label htmlFor="active-sprint">Active sprint view</label>
            <select
              id="active-sprint"
              value={activeSprintId}
              onChange={(event) => setActiveSprintId(event.target.value)}
            >
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} · {sprint.status}
                </option>
              ))}
            </select>
          </div>

          {activeSprint && (
            <div className="sprint-summary">
              <div>
                <span>Sprint goal</span>
                <strong>
                  {activeSprint.goal || 'No sprint goal defined.'}
                </strong>
              </div>

              <div>
                <span>Schedule</span>
                <strong>
                  {activeSprint.startDate} → {activeSprint.endDate}
                </strong>
              </div>

              <div>
                <span>Completion</span>
                <strong>{sprintProgress}%</strong>
              </div>
            </div>
          )}
        </div>

        {activeSprint && (
          <div className="sprint-progress-track">
            <div
              className="sprint-progress-fill"
              style={{ width: `${sprintProgress}%` }}
            />
          </div>
        )}

        {showSprintManager && (
          <form
            className="sprint-create-form"
            onSubmit={handleCreateSprint}
          >
            <h3>Create Sprint</h3>

            <div className="board-form-grid">
              <div className="board-form-field">
                <label htmlFor="sprint-name">Sprint name</label>
                <input
                  id="sprint-name"
                  value={newSprintName}
                  onChange={(event) => setNewSprintName(event.target.value)}
                  placeholder="e.g. Sprint 03"
                  maxLength={100}
                  required
                />
              </div>

              <div className="board-form-field">
                <label htmlFor="sprint-goal">Sprint goal</label>
                <input
                  id="sprint-goal"
                  value={newSprintGoal}
                  onChange={(event) => setNewSprintGoal(event.target.value)}
                  placeholder="What should the team deliver?"
                  maxLength={300}
                />
              </div>

              <div className="board-form-field">
                <label htmlFor="sprint-start">Start date</label>
                <input
                  id="sprint-start"
                  type="date"
                  value={newSprintStart}
                  onChange={(event) => setNewSprintStart(event.target.value)}
                  required
                />
              </div>
          <div className="board-form-field">
                <label htmlFor="sprint-end">End date</label>
                <input
                  id="sprint-end"
                  type="date"
                  min={newSprintStart}
                  value={newSprintEnd}
                  onChange={(event) => setNewSprintEnd(event.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-task-btn">
              Create Sprint
            </button>
          </form>
        )}
      </section>

      <section className="workload-panel glass-card">
        <div className="workload-panel-heading">
          <div>
            <p className="board-eyebrow">RESOURCE ALLOCATION</p>
            <h2>Team Workload</h2>
          </div>
        </div>

        <div className="workload-grid">
          {workload.map((member) => (
            <article className="workload-card glass-card" key={member.assignee}>
              <strong>{member.assignee}</strong>
              <span>{member.taskCount} active tasks</span>
              <div className="workload-progress-track">
                <div
                  className="workload-progress-fill"
                  style={{
                    width: `${Math.min((member.storyPoints / 15) * 100, 100)}%`,
                  }}
                />
              </div>
              <small>{member.storyPoints} assigned story points</small>

              {member.overCapacity && (
                <span className="workload-warning">
                  Capacity threshold exceeded
                </span>
              )}
            </article>
          ))}
        </div>

        <small className="board-disclaimer">
          Capacity warnings use a configurable demonstration threshold of 15
          unfinished story points per assignee.
        </small>
      </section>

      <section className="board-toolbar-section">
        <div className="board-toolbar">
          <input
            type="search"
            className="board-search"
            placeholder="Search ID, title, description, labels..."
            aria-label="Search tasks"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <div className="priority-filter-tabs">
            <span>Priority:</span>

            {['All', ...PRIORITIES].map((priority) => (
              <button
                type="button"
                key={priority}
                className={`filter-tab ${
                  filters.priority === priority ? 'active' : ''
                }`}
                aria-pressed={filters.priority === priority}
                onClick={() =>
                  setFilters((previous) => ({
                    ...previous,
                    priority,
                  }))
                }
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <div className="advanced-board-filters glass-card">
          <div className="board-form-field">
            <label htmlFor="filter-category">Category</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  category: event.target.value,
                }))
              }
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="board-form-field">
            <label htmlFor="filter-assignee">Assignee</label>
            <select
              id="filter-assignee"
              value={filters.assignee}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  assignee: event.target.value,
                }))
              }
            >
              <option value="All">All assignees</option>
              {ASSIGNEES.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          <div className="board-form-field">
            <label htmlFor="filter-status">Stage</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
            >
              <option value="All">All stages</option>
              {STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="board-form-field">
            <label htmlFor="filter-sprint">Sprint</label>
            <select
              id="filter-sprint"
              value={filters.sprint}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  sprint: event.target.value,
                }))
              }
            >
              <option value="All">All sprints</option>
              <option value="">No sprint</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>

          <div className="board-form-field">
            <label htmlFor="filter-due-date">Due date</label>
            <select
              id="filter-due-date"
              value={filters.dueDate}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  dueDate: event.target.value,
                }))
              }
            >
              <option value="All">All deadlines</option>
              <option value="Overdue">Overdue</option>
              <option value="Today">Due today</option>
              <option value="No deadline">No deadline</option>
            </select>
          </div>

          <div className="board-form-field">
            <label htmlFor="board-sort">Sort by</label>
            <select
              id="board-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due date</option>
              <option value="storyPoints">Story points</option>
              <option value="title">Title</option>
              <option value="createdAt">Created date</option>
            </select>
          </div>

          <button
            type="button"
            className="filter-tab"
            onClick={() =>
              setSortDirection((previous) =>
                previous === 'asc' ? 'desc' : 'asc'
              )
            }
          >
            {sortDirection === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section className="board-bulk-actions glass-card">
        <label className="bulk-select-label">
          <input
            type="checkbox"
            checked={
              filteredTasks.length > 0 &&
              filteredTasks.every((task) => selectedIds.includes(task.id))
            }
            onChange={handleSelectVisible}
          />
          Select all filtered tasks ({filteredTasks.length})
        </label>

        {selectedIds.length > 0 && (
          <div className="bulk-action-controls">
            <span>{selectedIds.length} selected</span>

            <label htmlFor="bulk-stage">Move selected to</label>
            <select
              id="bulk-stage"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  handleBulkMove(event.target.value);
                  event.target.value = '';
                }
              }}
            >
              <option value="" disabled>
                Choose stage
              </option>
              {STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="delete-task-btn"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </div>
        )}
      </section>

      {isCreating && (
        <form
          onSubmit={handleCreateTask}
          className="create-task-form"
        >
          <div className="task-form-heading">
            <div>
              <p className="board-eyebrow">ISSUE MANAGEMENT</p>
              <h3>{editingTaskId ? 'Edit Task' : 'Create Sprint Ticket'}</h3>
            </div>

            <span className="task-form-mode">
              {editingTaskId ? 'EDIT MODE' : 'NEW ISSUE'}
            </span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="task-title">Task title</label>
              <input
                id="task-title"
                type="text"
                maxLength={200}
                placeholder="e.g. Implement refresh token rotation"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-assignee">Assignee</label>
              <select
                id="task-assignee"
                value={newAssignee}
                onChange={(event) => setNewAssignee(event.target.value)}
              >
                {ASSIGNEES.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-category">Category</label>
              <select
                id="task-category"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={newPriority}
                onChange={(event) => setNewPriority(event.target.value)}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-points">Story points</label>
              <input
                id="task-points"
                type="number"
                min="1"
                max="100"
                step="1"
                value={newStoryPoints}
                onChange={(event) => setNewStoryPoints(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-due-date">Due date</label>
              <input
                id="task-due-date"
                type="date"
                value={newDueDate}
                onChange={(event) => setNewDueDate(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-sprint">Sprint</label>
              <select
                id="task-sprint"
                value={newSprintId}
                onChange={(event) => setNewSprintId(event.target.value)}
              >
                <option value="">No sprint assigned</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-labels">Labels</label>
              <input
                id="task-labels"
                value={newLabels}
                onChange={(event) => setNewLabels(event.target.value)}
                placeholder="api, authentication, performance"
              />
            </div>

            <div className="form-group form-description-group">
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                rows={4}
                maxLength={5000}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Explain the technical scope and expected outcome..."
              />
            </div>

            <div className="form-group form-description-group">
              <label htmlFor="task-criteria">Acceptance criteria</label>
              <textarea
                id="task-criteria"
                rows={4}
                value={newCriteria}
                onChange={(event) => setNewCriteria(event.target.value)}
                placeholder={'One criterion per line\nValidation errors are handled\nTests cover failure cases'}
              />
            </div>

            <div className="form-group form-description-group">
              <label htmlFor="task-blocked-reason">
                Blocking reason (optional)
              </label>
              <textarea
                id="task-blocked-reason"
                rows={2}
                value={newBlockedReason}
                onChange={(event) => setNewBlockedReason(event.target.value)}
                placeholder="Record any known dependencies or blockers..."
              />
            </div>
          </div>

          <div className="task-form-actions">
            <button type="submit" className="submit-task-btn">
              {editingTaskId ? 'Save Changes' : 'Add to Backlog'}
            </button>

            <button
              type="button"
              className="filter-tab"
              onClick={() => {
                resetTaskForm();
                setIsCreating(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <main className="kanban-board-grid">
        {STAGES.map((stage) => renderColumn(stage.id, stage.label))}
      </main>

      <section className="board-footer-toolbar">
        <div>
          <strong>Workspace data</strong>
          <span>{tasks.length} total tasks · {sprints.length} sprints</span>
        </div>

        <div className="board-export-actions">
          <button
            type="button"
            className="filter-tab"
            onClick={handleExportCSV}
          >
            Export Filtered CSV
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={handleExportJSON}
          >
            Backup Workspace
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={() => setIsImporting((previous) => !previous)}
          >
            Import Backup
          </button>

          <button
            type="button"
            className="filter-tab"
            onClick={() => setShowArchived((previous) => !previous)}
            aria-pressed={showArchived}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </section>

      {isImporting && (
        <section className="workspace-import-panel glass-card">
          <h3>Import Workspace Backup</h3>
          <p>
            Importing replaces your current local workspace. Export a backup
            first if you need to preserve the current data.
          </p>

          <label htmlFor="workspace-backup-file">
            Select a JSON backup
          </label>

          <input
            id="workspace-backup-file"
            type="file"
            accept="application/json,.json"
            onChange={handleImportJSON}
          />
        </section>
      )}

      {selectedTask && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTask(null);
              setCommentText('');
            }
          }}
        >
          <section
            className="task-detail-modal glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-detail-heading"
          >
            <div className="task-detail-header">
              <div>
                <p className="board-eyebrow">ISSUE INSPECTOR</p>
                <h2 id="task-detail-heading">{selectedTask.title}</h2>
                <span>{selectedTask.id}</span>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                aria-label="Close task details"
                onClick={() => {
                  setSelectedTask(null);
                  setCommentText('');
                }}
              >
                ×
              </button>
            </div>

            <div className="task-detail-metadata">
              <div>
                <span>Stage</span>
                <strong>{selectedTask.stage}</strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>{selectedTask.priority}</strong>
              </div>

              <div>
                <span>Assignee</span>
                <strong>{selectedTask.assignee}</strong>
              </div>

              <div>
                <span>Story points</span>
                <strong>{selectedTask.storyPoints}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{selectedTask.category}</strong>
              </div>

              <div>
                <span>Due date</span>
                <strong>{selectedTask.dueDate || 'Not scheduled'}</strong>
              </div>
            </div>

            <div className="task-detail-section">
              <h3>Description</h3>
              <p>{selectedTask.description || 'No description provided.'}</p>
            </div>

            <div className="task-detail-section">
              <h3>Acceptance Criteria</h3>

              {(selectedTask.acceptanceCriteria || []).length === 0 ? (
                <p>No acceptance criteria defined.</p>
              ) : (
                <ul>
                  {selectedTask.acceptanceCriteria.map((criterion, index) => (
                    <li key={`${selectedTask.id}-criterion-${index}`}>
                      {criterion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="task-detail-section">
              <h3>Comments</h3>

              {(selectedTask.comments || []).map((comment) => (
                <article className="task-comment" key={comment.id}>
                  <strong>{comment.author || 'Workspace user'}</strong>
                  <p>{comment.details}</p>
                  <time dateTime={comment.timestamp}>
                    {new Date(comment.timestamp).toLocaleString()}
                  </time>
                </article>
              ))}

              <form onSubmit={handleAddComment} className="task-comment-form">
                <label htmlFor="task-comment-input">Add comment</label>

                <textarea
                  id="task-comment-input"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Add implementation notes or review feedback..."
                  maxLength={2000}
                  rows={3}
                  required
                />

                <button type="submit" className="submit-task-btn">
                  Add Comment
                </button>
              </form>
            </div>

            <div className="task-detail-section">
              <h3>Task Activity</h3>

              {(selectedTask.activity || []).length === 0 ? (
                <p>No task activity recorded.</p>
              ) : (
                selectedTask.activity.map((entry) => (
                  <article className="task-activity-item" key={entry.id}>
                    <strong>{entry.action.replaceAll('_', ' ')}</strong>
                    <p>{entry.details}</p>
                    <time dateTime={entry.timestamp}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </time>
                  </article>
                ))
              )}
            </div>

            <div className="task-detail-actions">
              <button
                type="button"
                className="create-task-btn"
                onClick={() => handleEditTask(selectedTask)}
              >
                Edit Task
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => handleDuplicateTask(selectedTask)}
              >
                Duplicate
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => handleArchiveTask(selectedTask)}
              >
                {selectedTask.archived ? 'Restore' : 'Archive'}
              </button>

              <button
                type="button"
                className="filter-tab"
                onClick={() => {
                  setSelectedTask(null);
                  setCommentText('');
                }}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="board-activity-section glass-card">
        <div className="board-activity-heading">
          <div>
            <p className="board-eyebrow">WORKSPACE HISTORY</p>
            <h2>Recent Activity</h2>
            <small>{activityLog.length} recorded events</small>
          </div>

          <button
            type="button"
            className="analytics-toggle-btn"
            onClick={() => setShowActivity((previous) => !previous)}
            aria-expanded={showActivity}
          >
            {showActivity ? 'Hide Activity' : 'View Activity'}
          </button>
        </div>

        {showActivity && (
          <div className="board-activity-list">
            {activityLog.length === 0 ? (
              <p>No activity has been recorded yet.</p>
            ) : (
              activityLog.map((entry) => (
                <article className="board-activity-item" key={entry.id}>
                  <span className="activity-timeline-dot" />

                  <div>
                    <strong>{entry.action.replaceAll('_', ' ')}</strong>
                    <p>{entry.details || 'Workspace event'}</p>
                    <small>
                      {entry.taskId} ·{' '}
                      {new Date(entry.timestamp).toLocaleString()}
                    </small>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      <footer className="board-footer">
        <div>
          <strong>Engineering Command Center</strong>
          <span>Local project management demonstration</span>
        </div>

        <small>
          Tasks, sprint data, and activity are stored in this browser.
          Multi-user collaboration, authentication, and server-side
          persistence require a backend.
        </small>
      </footer>
    </div>
  );
}

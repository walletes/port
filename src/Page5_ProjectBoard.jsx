import React, { useState } from 'react';
import './Page5_ProjectBoard.css';

export default function Page5_ProjectBoard({ setPage }) {
  const [tasks, setTasks] = useState([
    {
      id: "DEV-101",
      title: "Refactor core API routing middleware and error handling",
      stage: "todo",
      assignee: "Prince Osinachi",
      priority: "High",
      category: "Backend"
    },
    {
      id: "DEV-102",
      title: "Review input form validation schemas for authentication flow",
      stage: "progress",
      assignee: "Kalu E.",
      priority: "Urgent",
      category: "Security"
    },
    {
      id: "DEV-103",
      title: "Map modular data components into directory file layout",
      stage: "done",
      assignee: "Prince Osinachi",
      priority: "Medium",
      category: "Frontend"
    }
  ]);

  // Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isCreating, setIsCreating] = useState(false);

  // New Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Prince Osinachi');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Frontend');

  const advanceTask = (id, currentStage) => {
    const stageOrder = ["todo", "progress", "done"];
    const nextIndex = (stageOrder.indexOf(currentStage) + 1) % stageOrder.length;
    const nextStage = stageOrder[nextIndex];

    setTasks(tasks.map(t =>
      t.id === id ? { ...t, stage: nextStage } : t
    ));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: `DEV-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      stage: "todo",
      assignee: newAssignee,
      priority: newPriority,
      category: newCategory
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesSearch;
  });

  const renderColumn = (stageName, headingText) => {
    const columnTasks = filteredTasks.filter(t => t.stage === stageName);

    return (
      <div className="kanban-column">
        <div className="column-header">
          <h2 className="column-title">{headingText}</h2>
          <span className="task-count-badge">{columnTasks.length}</span>
        </div>

        <div className="column-card-track">
          {columnTasks.length === 0 ? (
            <div className="empty-column-slot">No tasks in this stage</div>
          ) : (
            columnTasks.map(task => (
              <div key={task.id} className={`task-card ${task.stage}`}>
                <div className="task-card-top">
                  <div className="task-id-group">
                    <span className="task-id">{task.id}</span>
                    <span className="category-tag">{task.category}</span>
                  </div>
                  <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>

                <p className="task-title-text">
                  {task.stage === 'done' ? (
                    <span className="completed-strike">{task.title}</span>
                  ) : (
                    task.title
                  )}
                </p>

                <div className="task-card-footer">
                  <span className="assignee-text">
                    Assignee: <strong>{task.assignee}</strong>
                  </span>

                  <div className="task-action-group">
                    <button
                      className="advance-btn"
                      onClick={() => advanceTask(task.id, task.stage)}
                    >
                      {task.stage === 'done' ? 'Reopen' : 'Advance →'}
                    </button>
                    <button
                      className="delete-task-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="board-wrapper">
      <header className="board-header">
        <button
          className="workspace-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Back to Directory
        </button>

        <div className="board-meta">
          <h1 className="board-title">Sprint Pipeline Tracker</h1>
          <p className="board-subtitle">Engineering Workspace & Issue Tracking</p>
        </div>

        <button
          className="create-task-btn"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "✕ Cancel" : "+ New Task"}
        </button>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="board-toolbar">
        <input
          type="text"
          className="board-search"
          placeholder="Filter tasks by ID, title, assignee, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="priority-filter-tabs">
          <span>Priority:</span>
          {['All', 'Urgent', 'High', 'Medium'].map(pri => (
            <button
              key={pri}
              className={`filter-tab ${priorityFilter === pri ? 'active' : ''}`}
              onClick={() => setPriorityFilter(pri)}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* New Task Form Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateTask} className="create-task-form">
          <h3>Create New Sprint Ticket</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Task Description / Title</label>
              <input
                type="text"
                placeholder="e.g. Implement JWT refresh token rotation"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Assignee</label>
              <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                <option value="Prince Osinachi">Prince Osinachi</option>
                <option value="Kalu E.">Kalu E.</option>
                <option value="Dev Team">Dev Team</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Security">Security</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>
          <button type="submit" className="submit-task-btn">
            Add to Backlog
          </button>
        </form>
      )}

      {/* Kanban Board Grid */}
      <main className="kanban-board-grid">
        {renderColumn("todo", "Backlog / To Do")}
        {renderColumn("progress", "In Progress")}
        {renderColumn("done", "Completed & Tested")}
      </main>
    </div>
  );
}

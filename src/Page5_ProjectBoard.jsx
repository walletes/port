import React, { useState } from 'react';
import './Page5_ProjectBoard.css';

export default function Page5_ProjectBoard({ setPage }) {
  const [tasks, setTasks] = useState([
    {
      id: "DEV-101",
      title: "Refactor core API switch router blocks",
      stage: "todo",
      worker: "Prince O.",
      due: "Oct 12"
    },
    {
      id: "DEV-102",
      title: "Review input form sanitation schema layouts",
      stage: "progress",
      worker: "Kalu E.",
      due: "URGENT"
    },
    {
      id: "DEV-103",
      title: "Map flat data components into file layout system",
      stage: "done",
      worker: "Prince O.",
      due: "Completed"
    }
  ]);

  const advanceTask = (id, currentStage) => {
    const stageOrder = ["todo", "progress", "done"];
    const nextIndex = (stageOrder.indexOf(currentStage) + 1) % stageOrder.length;
    const nextStage = stageOrder[nextIndex];

    setTasks(tasks.map(t =>
      t.id === id ? { ...t, stage: nextStage } : t
    ));
  };

  const renderColumn = (stageName, headingText) => {
    const filtered = tasks.filter(t => t.stage === stageName);

    return (
      <div className="kanban-column">
        <h2 className="column-title">
          {headingText} <span className="card-count">({filtered.length})</span>
        </h2>

        <div className="column-card-track">
          {filtered.map(task => (
            <div key={task.id} className={`task-card ${task.stage}`}>
              <div className="card-header">
                <span className="task-id">{task.id}</span>

                <span className={`due-tag ${task.due === 'URGENT' ? 'urgent-alert' : ''}`}>
                  {task.due}
                </span>
              </div>

              <p className="task-title-text">
                {task.stage === 'done' ? (
                  <span className="completed-strike">{task.title}</span>
                ) : (
                  task.title
                )}
              </p>

              <div className="card-footer">
                <span className="assignee-text">
                  Assignee: <strong>{task.worker}</strong>
                </span>

                <button
                  className="stage-cycle-btn"
                  onClick={() => advanceTask(task.id, task.stage)}
                >
                  {task.stage === 'done' ? 'Reset Status' : 'Move Forward →'}
                </button>
              </div>
            </div>
          ))}
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
          ← Exit Workspace
        </button>

        <div className="board-meta">
          <h1 className="board-title">Sprint Pipeline Tracker</h1>
          <p className="board-indicator">INTERNAL TECHNICAL WORKFLOW MANAGER</p>
        </div>
      </header>

      {/* The browser automatically builds the column alignment matrix based on width tracks */}
      <main className="kanban-board-layout">
        {renderColumn("todo", "Backlog Queue")}
        {renderColumn("progress", "Active Execution")}
        {renderColumn("done", "Verified Releases")}
      </main>
    </div>
  );
}

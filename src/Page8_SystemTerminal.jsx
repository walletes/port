import React, { useState, useEffect, useRef } from 'react';
import './Page8_SystemTerminal.css';

export default function Page8_SystemTerminal({ setPage }) {
  const [logs, setLogs] = useState([
    { id: 1, time: "09:05:12", status: "INFO", message: "Kernel process listener successfully spawned on virtual thread core-0." },
    { id: 2, time: "09:06:01", status: "WARN", message: "Inbound connection queue load threshold peaked at 84% capacity." },
    { id: 3, time: "09:07:44", status: "CRIT", message: "Database query timeout detected on cluster sub-node index reference." }
  ]);

  const [filter, setFilter] = useState('ALL');
  const terminalEndRef = useRef(null);

  // Simulate a live backend streaming pings via JavaScript runtime intervals
  useEffect(() => {
    const messages = [
      { status: "INFO", txt: "API gateway connection handshake authorized with external route worker." },
      { status: "WARN", txt: "Suppressed duplicate memory allocation call inside system runtime engine loop." },
      { status: "INFO", txt: "Garbage collection execution cycle finalized in 4.2 milliseconds clean." },
      { status: "CRIT", txt: "Security firewall alert: Multiple unauthorized access pings from isolated socket." }
    ];

    const timer = setInterval(() => {
      const target = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];

      setLogs(prev => [...prev, {
        id: Date.now(),
        time: timestamp,
        status: target.status,
        message: target.txt
      }]);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Force browser to handle immediate alignment scroll positioning adjustments
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => filter === 'ALL' || log.status === filter);

  return (
    <div className="terminal-wrapper">
      <header className="terminal-control-panel">
        <button className="terminal-exit-btn" onClick={() => setPage('home')}>← Terminate Hook</button>
        <div className="filter-button-cluster">
          <button onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'active' : ''}>ALL LOGS</button>
          <button onClick={() => setFilter('INFO')} className={filter === 'INFO' ? 'active' : ''}>INFO</button>
          <button onClick={() => setFilter('WARN')} className={filter === 'WARN' ? 'active' : ''}>WARN</button>
          <button onClick={() => setFilter('CRIT')} className={filter === 'CRIT' ? 'active' : ''}>CRIT</button>
        </div>
      </header>

      <main className="terminal-body-monitor">
        <div className="terminal-screen-output">
          <p className="system-boot-banner">SYSTEM MONITOR TELEMETRY FEED // RUNNING STABLE</p>

          {filteredLogs.map(log => (
            <div key={log.id} className={`log-row-item ${log.status.toLowerCase()}`}>
              <span className="log-time">[{log.time}]</span>
              <span className="log-badge-status">{log.status} :</span>
              <span className="log-message-body">
                {log.message.includes("Suppressed") ? <del>{log.message}</del> : log.message}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </main>
    </div>
  );
}

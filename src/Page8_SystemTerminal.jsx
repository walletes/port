import React, { useState, useEffect, useRef } from 'react';
import './Page8_SystemTerminal.css';

export default function Page8_SystemTerminal({ setPage }) {
  const [logs, setLogs] = useState([
    { id: 1, time: "09:05:12", status: "INFO", message: "Kernel process listener successfully spawned on virtual thread core-0." },
    { id: 2, time: "09:06:01", status: "WARN", message: "Inbound connection queue load threshold peaked at 84% capacity." },
    { id: 3, time: "09:07:44", status: "CRIT", message: "Database query timeout detected on cluster sub-node index reference." }
  ]);

  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [commandInput, setCommandInput] = useState('');

  const terminalEndRef = useRef(null);

  // Simulate a live backend streaming pings via JavaScript runtime intervals
  useEffect(() => {
    if (!isStreaming) return;

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
  }, [isStreaming]);

  // Force browser to handle immediate alignment scroll positioning adjustments
  useEffect(() => {
    if (isStreaming) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isStreaming]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    let responseMsg = `Command executed: ${cmd}`;
    let statusType = "INFO";

    if (cmd === 'help') {
      responseMsg = "Available commands: clear, status, pause, resume, export, ping [host]";
    } else if (cmd === 'clear') {
      setLogs([]);
      setCommandInput('');
      return;
    } else if (cmd === 'status') {
      responseMsg = "System health: STABLE. Uptime: 99.99%. Active virtual threads: 4. Queue load: nominal.";
    } else if (cmd === 'pause') {
      setIsStreaming(false);
      responseMsg = "Live log stream paused by operator command.";
    } else if (cmd === 'resume') {
      setIsStreaming(true);
      responseMsg = "Live log stream resumed.";
    } else if (cmd === 'export') {
      handleExportLogs();
      responseMsg = "Log history exported successfully to local download buffer.";
    } else if (cmd.startsWith('ping')) {
      const targetHost = cmd.split(' ')[1] || 'localhost';
      responseMsg = `PING ${targetHost} (127.0.0.1) 56(84) bytes of data. 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms`;
    } else {
      statusType = "WARN";
      responseMsg = `Unknown command: '${cmd}'. Type 'help' for available directives.`;
    }

    setLogs(prev => [
      ...prev,
      { id: Date.now(), time: timestamp, status: "INFO", message: `> ${commandInput}` },
      { id: Date.now() + 1, time: timestamp, status: statusType, message: responseMsg }
    ]);

    setCommandInput('');
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `system_terminal_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.status === filter;
    const matchesSearch = searchQuery === '' || log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="terminal-wrapper">
      <header className="terminal-control-panel">
        <button className="terminal-exit-btn" onClick={() => setPage('home')}>← Terminate Hook</button>
        
        <div className="terminal-top-toolbar">
          <input
            type="text"
            className="terminal-search-input"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={() => setIsStreaming(!isStreaming)} 
            className={`terminal-exit-btn stream-btn ${isStreaming ? 'streaming' : 'paused'}`}
          >
            {isStreaming ? '● LIVE STREAM' : '❚❚ PAUSED'}
          </button>
          <button onClick={handleExportLogs} className="terminal-exit-btn">↓ EXPORT</button>
          <button onClick={() => setLogs([])} className="terminal-exit-btn clear-btn">CLEAR</button>

          <div className="filter-button-cluster">
            <button onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'active' : ''}>ALL LOGS</button>
            <button onClick={() => setFilter('INFO')} className={filter === 'INFO' ? 'active' : ''}>INFO</button>
            <button onClick={() => setFilter('WARN')} className={filter === 'WARN' ? 'active' : ''}>WARN</button>
            <button onClick={() => setFilter('CRIT')} className={filter === 'CRIT' ? 'active' : ''}>CRIT</button>
          </div>
        </div>
      </header>

      <main className="terminal-body-monitor">
        <div className="terminal-screen-output">
          <p className="system-boot-banner">SYSTEM MONITOR TELEMETRY FEED // RUNNING STABLE (PID: 4092)</p>

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

        {/* Interactive CLI Command Bar */}
        <form onSubmit={handleCommandSubmit} className="terminal-command-form">
          <span className="cli-prompt">root@system:~#</span>
          <input
            type="text"
            className="cli-input"
            placeholder="Type command ('help', 'status', 'ping [host]', 'clear')..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
          />
          <button type="submit" className="cli-exec-btn">EXEC</button>
        </form>
      </main>
    </div>
  );
}

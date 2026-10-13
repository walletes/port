
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './Page8_SystemTerminal.css';

const MAX_LOGS = 2500;
const MAX_COMMAND_HISTORY = 100;
const STREAM_INTERVAL = 2500;

const SEVERITIES = ['INFO', 'DEBUG', 'WARN', 'CRIT'];

const SERVICES = [
  'api-gateway',
  'auth-service',
  'database-cluster',
  'worker-pool',
  'cache-engine',
  'event-bus',
  'scheduler',
  'network-proxy'
];

const SERVICE_CONFIG = {
  'api-gateway': { status: 'HEALTHY', latency: 24, version: '2.8.1' },
  'auth-service': { status: 'HEALTHY', latency: 38, version: '1.9.4' },
  'database-cluster': { status: 'DEGRADED', latency: 186, version: '5.2.0' },
  'worker-pool': { status: 'HEALTHY', latency: 31, version: '3.4.2' },
  'cache-engine': { status: 'HEALTHY', latency: 8, version: '2.1.7' },
  'event-bus': { status: 'HEALTHY', latency: 17, version: '1.6.3' },
  'scheduler': { status: 'HEALTHY', latency: 12, version: '1.4.0' },
  'network-proxy': { status: 'HEALTHY', latency: 29, version: '2.0.1' }
};

const INITIAL_EVENTS = [
  {
    status: 'INFO',
    service: 'api-gateway',
    message: 'Gateway initialized successfully. Listening on internal port 8080.',
    metadata: { port: 8080, protocol: 'HTTP/2' }
  },
  {
    status: 'WARN',
    service: 'database-cluster',
    message: 'Connection pool utilization exceeded the 80% warning threshold.',
    metadata: { utilization: 84, threshold: 80 }
  },
  {
    status: 'CRIT',
    service: 'database-cluster',
    message: 'Query execution timeout detected on replica node db-replica-03.',
    metadata: { node: 'db-replica-03', timeoutMs: 5000 }
  },
  {
    status: 'INFO',
    service: 'auth-service',
    message: 'Authentication provider handshake completed successfully.',
    metadata: { provider: 'internal', retries: 0 }
  },
  {
    status: 'DEBUG',
    service: 'cache-engine',
    message: 'Cache eviction cycle completed. No stale entries remain.',
    metadata: { evictedEntries: 12, durationMs: 4.2 }
  }
];

const STREAM_TEMPLATES = [
  {
    status: 'INFO',
    service: 'api-gateway',
    message: 'Inbound request processed successfully.',
    metadata: { method: 'GET', route: '/api/v1/health', responseCode: 200 }
  },
  {
    status: 'DEBUG',
    service: 'cache-engine',
    message: 'Cache lookup completed within the expected latency budget.',
    metadata: { hit: true, durationMs: 3.4 }
  },
  {
    status: 'INFO',
    service: 'worker-pool',
    message: 'Background job completed and acknowledged by the worker.',
    metadata: { queue: 'default', attempts: 1 }
  },
  {
    status: 'WARN',
    service: 'database-cluster',
    message: 'Database connection pool is approaching its configured limit.',
    metadata: { utilization: 87, threshold: 80 }
  },
  {
    status: 'INFO',
    service: 'event-bus',
    message: 'Event successfully published to the internal message broker.',
    metadata: { topic: 'system.events', partition: 2 }
  },
  {
    status: 'WARN',
    service: 'network-proxy',
    message: 'Upstream response latency exceeded the normal operating window.',
    metadata: { latencyMs: 420, thresholdMs: 300 }
  },
  {
    status: 'INFO',
    service: 'auth-service',
    message: 'Token validation completed successfully.',
    metadata: { provider: 'internal', result: 'accepted' }
  },
  {
    status: 'CRIT',
    service: 'database-cluster',
    message: 'Simulated replica timeout detected during query execution.',
    metadata: { node: 'db-replica-03', timeoutMs: 5000 }
  },
  {
    status: 'DEBUG',
    service: 'scheduler',
    message: 'Scheduled task evaluated and dispatched to the worker queue.',
    metadata: { schedule: '*/5 * * * *', queue: 'scheduled' }
  }
];

function createId(prefix = 'evt') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function createTraceId() {
  return Array.from({ length: 4 }, () =>
    Math.random().toString(16).slice(2, 6)
  ).join('');
}

function getTimestamp() {
  return new Date().toISOString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour12: false
  });
}

function createLog(event, overrides = {}) {
  const timestamp = getTimestamp();

  return {
    id: createId(),
    timestamp,
    time: formatTime(timestamp),
    status: event.status || 'INFO',
    service: event.service || 'system-runtime',
    message: event.message || 'System event recorded.',
    traceId: createTraceId(),
    correlationId: createId('corr'),
    environment: 'development',
    host: `${event.service || 'system-runtime'}.internal`,
    metadata: event.metadata || {},
    acknowledged: false,
    ...overrides
  };
}

function escapeCsv(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function matchesLogSearch(log, query) {
  if (!query.trim()) return true;

  const searchable = [
    log.id,
    log.time,
    log.timestamp,
    log.status,
    log.service,
    log.message,
    log.traceId,
    log.correlationId,
    log.host,
    log.environment,
    JSON.stringify(log.metadata)
  ].join(' ').toLowerCase();

  return searchable.includes(query.trim().toLowerCase());
}

export default function Page8_SystemTerminal({ setPage }) {
  const [logs, setLogs] = useState(() =>
    INITIAL_EVENTS.map((event, index) =>
      createLog(event, {
        timestamp: new Date(Date.now() - (5 - index) * 45000).toISOString()
      })
    )
  );

  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedTraceId, setSelectedTraceId] = useState('');
  const [timeRange, setTimeRange] = useState('ALL');
  const [pageSize, setPageSize] = useState(100);
  const [visibleCount, setVisibleCount] = useState(100);
  const [activeTab, setActiveTab] = useState('LOGS');
  const [commandOutput, setCommandOutput] = useState(
    'System console initialized. Type "help" to inspect available commands.'
  );
  const [commandStatus, setCommandStatus] = useState('INFO');
  const [notifications, setNotifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [serviceOverrides, setServiceOverrides] = useState({});
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showDebug, setShowDebug] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [streamRate, setStreamRate] = useState(1);
  const [isCommandHelpOpen, setIsCommandHelpOpen] = useState(false);

  const terminalEndRef = useRef(null);
  const terminalOutputRef = useRef(null);
  const commandInputRef = useRef(null);
  const streamCounterRef = useRef(0);
  const commandHistoryRef = useRef([]);

  const pushNotification = useCallback((message, type = 'INFO') => {
    const id = createId('notice');

    setNotifications(previous => [
      ...previous.slice(-4),
      { id, message, type, timestamp: getTimestamp() }
    ]);

    return id;
  }, []);

  const appendLogs = useCallback((newLogs) => {
    if (!newLogs.length) return;

    setLogs(previous =>
      [...previous, ...newLogs].slice(-MAX_LOGS)
    );
  }, []);

  const emitEvent = useCallback((event) => {
    const log = createLog(event);

    appendLogs([log]);

    if (log.status === 'CRIT') {
      const incident = {
        id: createId('inc'),
        title: log.message,
        service: log.service,
        traceId: log.traceId,
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
        status: 'OPEN',
        severity: 'CRIT',
        acknowledged: false,
        resolvedAt: null,
        relatedLogIds: [log.id]
      };

      setIncidents(previous => [incident, ...previous]);

      pushNotification(
        `Critical incident opened: ${log.service}`,
        'CRIT'
      );
    }

    return log;
  }, [appendLogs, pushNotification]);

  const getServiceStatus = useCallback((service) => {
    if (serviceOverrides[service]) {
      return serviceOverrides[service];
    }

    return SERVICE_CONFIG[service]?.status || 'HEALTHY';
  }, [serviceOverrides]);

  const serviceMetrics = useMemo(() => {
    return SERVICES.map(service => {
      const serviceLogs = logs.filter(log => log.service === service);
      const criticalCount = serviceLogs.filter(
        log => log.status === 'CRIT'
      ).length;
      const warningCount = serviceLogs.filter(
        log => log.status === 'WARN'
      ).length;

      const configured = SERVICE_CONFIG[service];

      let status = getServiceStatus(service);

      if (status === 'HEALTHY' && criticalCount > 0) {
        status = 'DEGRADED';
      }

      return {
        name: service,
        status,
        version: configured.version,
        latency: configured.latency,
        eventCount: serviceLogs.length,
        criticalCount,
        warningCount
      };
    });
  }, [logs, getServiceStatus]);

  const metrics = useMemo(() => {
    const counts = {
      total: logs.length,
      INFO: 0,
      DEBUG: 0,
      WARN: 0,
      CRIT: 0
    };

    logs.forEach(log => {
      counts[log.status] = (counts[log.status] || 0) + 1;
    });

    const criticalEvents = logs.filter(
      log => log.status === 'CRIT'
    ).length;

    const errorRate = logs.length
      ? ((criticalEvents / logs.length) * 100).toFixed(2)
      : '0.00';

    const activeIncidents = incidents.filter(
      incident => incident.status !== 'RESOLVED'
    ).length;

    const healthyServices = serviceMetrics.filter(
      service => service.status === 'HEALTHY'
    ).length;

    return {
      ...counts,
      errorRate,
      activeIncidents,
      healthyServices,
      totalServices: SERVICES.length,
      retentionCapacity: MAX_LOGS,
      retentionUsage: ((logs.length / MAX_LOGS) * 100).toFixed(1)
    };
  }, [logs, incidents, serviceMetrics]);

  const filteredLogs = useMemo(() => {
    const now = Date.now();

    return logs.filter(log => {
      if (filter !== 'ALL' && log.status !== filter) return false;

      if (!showDebug && log.status === 'DEBUG') return false;

      if (
        selectedService !== 'ALL' &&
        log.service !== selectedService
      ) {
        return false;
      }

      if (
        selectedTraceId &&
        log.traceId !== selectedTraceId &&
        log.correlationId !== selectedTraceId
      ) {
        return false;
      }

      if (!matchesLogSearch(log, searchQuery)) return false;

      const timestamp = new Date(log.timestamp).getTime();

      if (timeRange === '5M' && now - timestamp > 5 * 60 * 1000) {
        return false;
      }

      if (timeRange === '15M' && now - timestamp > 15 * 60 * 1000) {
        return false;
      }

      if (timeRange === '1H' && now - timestamp > 60 * 60 * 1000) {
        return false;
      }

      if (timeRange === '24H' && now - timestamp > 24 * 60 * 60 * 1000) {
        return false;
      }

      return true;
    });
  }, [
    logs,
    filter,
    showDebug,
    selectedService,
    selectedTraceId,
    searchQuery,
    timeRange
  ]);

  const displayedLogs = useMemo(
    () => filteredLogs.slice(-visibleCount),
    [filteredLogs, visibleCount]
  );

  const selectedLog = useMemo(
    () => logs.find(log => log.id === selectedLogId) || null,
    [logs, selectedLogId]
  );

  const selectedLogIncidents = useMemo(() => {
    if (!selectedLog) return [];

    return incidents.filter(incident =>
      incident.relatedLogIds.includes(selectedLog.id) ||
      incident.traceId === selectedLog.traceId
    );
  }, [selectedLog, incidents]);

  const recentActivity = useMemo(
    () => [...logs].slice(-12).reverse(),
    [logs]
  );

  useEffect(() => {
    if (!isStreaming) return undefined;

    const timer = window.setInterval(() => {
      streamCounterRef.current += 1;

      const index =
        (streamCounterRef.current - 1) % STREAM_TEMPLATES.length;

      const template = STREAM_TEMPLATES[index];

      const event = {
        ...template,
        metadata: {
          ...template.metadata,
          sequence: streamCounterRef.current,
          simulated: true
        }
      };

      if (serviceOverrides[event.service] === 'OFFLINE') {
        emitEvent({
          status: 'CRIT',
          service: event.service,
          message: `Service health check failed: ${event.service} is marked offline.`,
          metadata: { simulated: true, source: 'health-monitor' }
        });

        return;
      }

      emitEvent(event);
    }, STREAM_INTERVAL / streamRate);

    return () => window.clearInterval(timer);
  }, [isStreaming, streamRate, serviceOverrides, emitEvent]);

  useEffect(() => {
    if (!isAutoScroll || !isStreaming) return;

    const output = terminalOutputRef.current;

    if (output) {
      output.scrollTop = output.scrollHeight;
    }
  }, [logs, isAutoScroll, isStreaming]);

  useEffect(() => {
    const handleKeyboard = event => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        commandInputRef.current?.focus();
        return;
      }

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        document.querySelector('.terminal-search-input')?.focus();
        return;
      }

      if (event.key === 'Escape') {
        setSelectedLogId(null);
        setIsCommandHelpOpen(false);
        return;
      }

      if (event.key === 'F1') {
        event.preventDefault();
        setIsCommandHelpOpen(previous => !previous);
      }
    };

    window.addEventListener('keydown', handleKeyboard);

    return () => {
      window.removeEventListener('keydown', handleKeyboard);
    };
  }, []);

  useEffect(() => {
    commandHistoryRef.current = commandHistory;
  }, [commandHistory]);

  const acknowledgeIncident = useCallback((incidentId) => {
    setIncidents(previous =>
      previous.map(incident =>
        incident.id === incidentId
          ? { ...incident, acknowledged: true, status: 'ACKNOWLEDGED' }
          : incident
      )
    );

    pushNotification(`Incident ${incidentId} acknowledged.`, 'INFO');
  }, [pushNotification]);

  const resolveIncident = useCallback((incidentId) => {
    setIncidents(previous =>
      previous.map(incident =>
        incident.id === incidentId
          ? {
              ...incident,
              status: 'RESOLVED',
              resolvedAt: getTimestamp()
            }
          : incident
      )
    );

    pushNotification(`Incident ${incidentId} resolved.`, 'INFO');
  }, [pushNotification]);

  const exportLogs = useCallback((format = 'json', useFiltered = false) => {
    const dataset = useFiltered ? filteredLogs : logs;
    const date = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const headers = [
        'id',
        'timestamp',
        'severity',
        'service',
        'message',
        'traceId',
        'correlationId',
        'host',
        'environment',
        'metadata'
      ];

      const rows = dataset.map(log => [
        log.id,
        log.timestamp,
        log.status,
        log.service,
        log.message,
        log.traceId,
        log.correlationId,
        log.host,
        log.environment,
        JSON.stringify(log.metadata)
      ]);

      const csv = [
        headers.map(escapeCsv).join(','),
        ...rows.map(row => row.map(escapeCsv).join(','))
      ].join('\r\n');

      downloadFile(
        '\uFEFF' + csv,
        `system-logs-${date}.csv`,
        'text/csv;charset=utf-8'
      );
    } else {
      const payload = {
        exportedAt: getTimestamp(),
        exportType: useFiltered ? 'filtered' : 'complete',
        recordCount: dataset.length,
        simulated: true,
        metrics,
        logs: dataset
      };

      downloadFile(
        JSON.stringify(payload, null, 2),
        `system-logs-${date}.json`,
        'application/json;charset=utf-8'
      );
    }

    pushNotification(
      `Export prepared: ${dataset.length} records (${format.toUpperCase()}).`,
      'INFO'
    );
  }, [filteredLogs, logs, metrics, pushNotification]);

  const getHelpText = useCallback(() => {
    return [
      'AVAILABLE SYSTEM CONSOLE COMMANDS',
      '',
      'help                         Display this command reference',
      'status                       Display simulated system health',
      'metrics                      Display event and service metrics',
      'services                     List monitored services',
      'incidents                    List incident records',
      'clear                        Clear retained logs',
      'pause                        Pause simulated event streaming',
      'resume                       Resume simulated event streaming',
      'export [json|csv]            Export all retained logs',
      'export filtered [json|csv]   Export the current filtered view',
      'filter [ALL|INFO|DEBUG|WARN|CRIT]',
      'search <text>                Search log messages and metadata',
      'service <name|all>           Filter by service',
      'trace <trace-id>             Filter by trace or correlation ID',
      'range [ALL|5M|15M|1H|24H]   Filter by event age',
      'incident ack <id>            Acknowledge an incident',
      'incident resolve <id>        Resolve an incident',
      'simulate error [service]     Generate a simulated critical event',
      'simulate warning [service]   Generate a simulated warning event',
      'simulate offline <service>   Mark a service offline',
      'simulate online <service>    Restore a simulated service',
      'rate <1|2|4>                 Set simulated event generation speed',
      'debug [on|off]               Toggle DEBUG log visibility',
      'compact [on|off]             Toggle compact log rendering',
      'scroll [on|off]              Toggle automatic scrolling',
      'select <log-id>              Inspect a log record',
      'ping [host]                  Run a simulated connectivity check',
      'uptime                       Display simulated uptime',
      'whoami                       Display the console identity',
      'version                      Display the console version',
      'exit                          Return to the portfolio home page',
      '',
      'SHORTCUTS',
      'Ctrl + K    Focus command input',
      '/           Focus log search',
      'F1          Toggle command reference',
      'Escape      Close log inspector or command reference',
      '',
      'Note: All telemetry and operational commands are simulated locally.'
    ].join('\n');
  }, []);

  const executeCommand = useCallback((rawCommand) => {
    const raw = rawCommand.trim();

    if (!raw) return;

    setCommandHistory(previous =>
      [...previous, raw].slice(-MAX_COMMAND_HISTORY)
    );

    setHistoryIndex(-1);

    const [first = '', second = '', ...remaining] = raw.split(/\s+/);
    const command = first.toLowerCase();
    const argument = second.toLowerCase();
    const rest = remaining.join(' ');
    const now = getTimestamp();

    let output = '';
let status = 'INFO';

    switch (command) {
      case 'help':
        output = getHelpText();
        break;

      case 'clear':
        setLogs([]);
        setIncidents([]);
        setSelectedLogId(null);
        output = 'Retained logs and incident records cleared.';
        break;

      case 'pause':
        setIsStreaming(false);
        output = 'Simulated event stream paused.';
        break;

      case 'resume':
        setIsStreaming(true);
        output = 'Simulated event stream resumed.';
        break;

      case 'status':
        output = [
          'SYSTEM STATUS: SIMULATED',
          `Event stream: ${isStreaming ? 'RUNNING' : 'PAUSED'}`,
          `Retained logs: ${logs.length}/${MAX_LOGS}`,
          `Active incidents: ${metrics.activeIncidents}`,
          `Critical events: ${metrics.CRIT}`,
          `Warning events: ${metrics.WARN}`,
          `Healthy services: ${metrics.healthyServices}/${metrics.totalServices}`,
          `Error rate: ${metrics.errorRate}%`,
          `Current timestamp: ${now}`
        ].join('\n');
        break;

      case 'metrics':
        output = [
          'OBSERVABILITY METRICS',
          `Total events: ${metrics.total}`,
          `INFO: ${metrics.INFO}`,
          `DEBUG: ${metrics.DEBUG}`,
          `WARN: ${metrics.WARN}`,
          `CRIT: ${metrics.CRIT}`,
          `Critical event ratio: ${metrics.errorRate}%`,
          `Open incidents: ${metrics.activeIncidents}`,
          `Retention utilization: ${metrics.retentionUsage}%`
        ].join('\n');
        break;

      case 'services':
        output = serviceMetrics.map(service =>
          `${service.name.padEnd(20)} ${service.status.padEnd(10)} latency=${service.latency}ms events=${service.eventCount}`
        ).join('\n');
        break;

      case 'incidents':
        output = incidents.length
          ? incidents.map(incident =>
              `${incident.id} | ${incident.status} | ${incident.service} | ${incident.title}`
            ).join('\n')
          : 'No incidents have been recorded.';
        break;

      case 'filter': {
        const allowed = ['ALL', ...SEVERITIES];

        if (!allowed.includes(argument.toUpperCase())) {
          status = 'WARN';
          output = `Invalid severity. Use: ${allowed.join(', ')}`;
          break;
        }

        setFilter(argument.toUpperCase());
        setActiveTab('LOGS');
        output = `Severity filter set to ${argument.toUpperCase()}.`;
        break;
      }

      case 'search':
        setSearchQuery(raw.slice(first.length).trim());
        setActiveTab('LOGS');
        output = `Search query updated: ${raw.slice(first.length).trim() || '(empty)'}`;
        break;

      case 'service':
        if (argument === 'all') {
          setSelectedService('ALL');
          output = 'Service filter cleared.';
        } else if (SERVICES.includes(argument)) {
          setSelectedService(argument);
          output = `Service filter set to ${argument}.`;
        } else {
          status = 'WARN';
          output = `Unknown service. Available services: ${SERVICES.join(', ')}`;
        }

        setActiveTab('LOGS');
        break;

      case 'trace':
        setSelectedTraceId(raw.slice(first.length).trim());
        setActiveTab('LOGS');
        output = `Trace filter set to ${raw.slice(first.length).trim() || '(cleared)'}`;
        break;

      case 'range': {
        const allowed = ['ALL', '5M', '15M', '1H', '24H'];

        if (!allowed.includes(argument.toUpperCase())) {
          status = 'WARN';
          output = `Invalid range. Use: ${allowed.join(', ')}`;
          break;
        }

        setTimeRange(argument.toUpperCase());
        setActiveTab('LOGS');
        output = `Time range set to ${argument.toUpperCase()}.`;
        break;
      }

      case 'export': {
        const filtered = argument === 'filtered';
        const format = (filtered ? rest.split(/\s+/)[0] : argument) || 'json';

        if (!['json', 'csv'].includes(format.toLowerCase())) {
          status = 'WARN';
          output = 'Supported export formats: json, csv.';
          break;
        }

        exportLogs(format.toLowerCase(), filtered);
        output = `Export requested in ${format.toUpperCase()} format.`;
        break;
      }

      case 'incident': {
        const action = argument;
        const incidentId = remaining.join(' ');

        const incident = incidents.find(item =>
          item.id.toLowerCase() === incidentId.toLowerCase()
        );

        if (!incident) {
          status = 'WARN';
          output = `Incident not found: ${incidentId || '(missing ID)'}`;
          break;
        }

        if (action === 'ack') {
          acknowledgeIncident(incident.id);
          output = `Incident ${incident.id} acknowledged.`;
        } else if (action === 'resolve') {
          resolveIncident(incident.id);
          output = `Incident ${incident.id} resolved.`;
        } else {
          status = 'WARN';
          output = 'Usage: incident ack <id> | incident resolve <id>';
        }
        break;
      }

      case 'simulate': {
        const type = argument;
        const service = rest || 'api-gateway';

        if (type === 'error' || type === 'warning') {
          if (!SERVICES.includes(service)) {
            status = 'WARN';
            output = `Unknown service: ${service}`;
            break;
          }

          const event = emitEvent({
            status: type === 'error' ? 'CRIT' : 'WARN',
            service,
            message: type === 'error'
              ? `Manually injected simulated critical event for ${service}.`
              : `Manually injected simulated warning event for ${service}.`,
            metadata: {
              source: 'operator-console',
              simulated: true,
              injectedAt: now
            }
          });

          output = `Simulated ${type} generated. Event ID: ${event.id}`;
        } else if (type === 'offline' || type === 'online') {
          if (!SERVICES.includes(service)) {
            status = 'WARN';
            output = `Unknown service: ${service}`;
            break;
          }

          setServiceOverrides(previous => ({
            ...previous,
            [service]: type === 'offline' ? 'OFFLINE' : 'HEALTHY'
          }));

          emitEvent({
            status: type === 'offline' ? 'CRIT' : 'INFO',
            service,
            message: `${service} manually marked ${type.toUpperCase()} in the simulation.`,
            metadata: { source: 'operator-console', simulated: true }
          });

          output = `${service} is now marked ${type.toUpperCase()}.`;
        } else {
          status = 'WARN';
          output = 'Usage: simulate error|warning|offline|online [service]';
        }

        break;
      }

      case 'rate': {
        const rate = Number(argument);

        if (![1, 2, 4].includes(rate)) {
          status = 'WARN';
          output = 'Allowed simulation rates: 1, 2, or 4.';
          break;
        }

        setStreamRate(rate);
        output = `Simulation rate set to ${rate}x.`;
        break;
      }

      case 'debug':
        if (argument === 'on') setShowDebug(true);
        else if (argument === 'off') setShowDebug(false);
        else {
          status = 'WARN';
          output = 'Usage: debug on|off';
          break;
        }

        output = `DEBUG visibility ${argument === 'on' ? 'enabled' : 'disabled'}.`;
        break;

      case 'compact':
        if (argument === 'on') setIsCompact(true);
        else if (argument === 'off') setIsCompact(false);
        else {
          status = 'WARN';
          output = 'Usage: compact on|off';
          break;
        }

        output = `Compact rendering ${argument === 'on' ? 'enabled' : 'disabled'}.`;
        break;

      case 'scroll':
        if (argument === 'on') setIsAutoScroll(true);
        else if (argument === 'off') setIsAutoScroll(false);
        else {
          status = 'WARN';
          output = 'Usage: scroll on|off';
          break;
        }

        output = `Automatic scrolling ${argument === 'on' ? 'enabled' : 'disabled'}.`;
        break;

      case 'select': {
        const log = logs.find(item =>
          item.id.toLowerCase() === argument
        );

        if (!log) {
          status = 'WARN';
          output = `Log not found: ${argument || '(missing ID)'}`;
          break;
        }

        setSelectedLogId(log.id);
        output = `Selected log ${log.id}.`;
        break;
      }

      case 'ping': {
        const host = argument || 'localhost';
        const simulatedLatency = Math.floor(Math.random() * 45) + 5;

        output = [
          `PING ${host}`,
          `64 bytes from ${host}: seq=1 ttl=64 time=${simulatedLatency}ms`,
          `64 bytes from ${host}: seq=2 ttl=64 time=${simulatedLatency + 2}ms`,
          `64 bytes from ${host}: seq=3 ttl=64 time=${simulatedLatency - 1}ms`,
          '--- simulated ping statistics ---',
          '3 packets transmitted, 3 received, 0% packet loss'
        ].join('\n');
        break;
      }

      case 'uptime':
        output = 'Simulated runtime uptime: 14 days, 6 hours, 22 minutes.';
        break;

      case 'whoami':
        output = 'operator@portfolio-console | role=SIMULATED_ADMIN';
        break;

      case 'version':
        output = 'System Terminal v3.0.0 | React observability demo';
        break;

      case 'exit':
        setPage('home');
        output = 'Returning to portfolio home.';
        break;

      default:
        status = 'WARN';
        output = `Unknown command: "${raw}". Type "help" for available commands.`;
    }

    setCommandOutput(`> ${raw}\n${output}`);
    setCommandStatus(status);
  }, [
    getHelpText,
    isStreaming,
    logs,
    metrics,
    serviceMetrics,
    incidents,
    exportLogs,
    acknowledgeIncident,
    resolveIncident,
    emitEvent,
    setPage
  ]);

  const handleCommandSubmit = event => {
    event.preventDefault();

    const command = commandInput.trim();

    if (!command) return;

    executeCommand(command);
    setCommandInput('');
  };

  const handleCommandKeyDown = event => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();

      const history = commandHistoryRef.current;

      if (!history.length) return;

      const nextIndex = historyIndex < 0
        ? history.length - 1
        : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      setCommandInput(history[nextIndex]);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      const history = commandHistoryRef.current;

      if (historyIndex < 0) return;

      const nextIndex = historyIndex + 1;

      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIndex);
        setCommandInput(history[nextIndex]);
      }
    }
  };

  const clearFilters = () => {
    setFilter('ALL');
    setSearchQuery('');
    setSelectedService('ALL');
    setSelectedTraceId('');
    setTimeRange('ALL');
    setVisibleCount(pageSize);
  };

  const resetConsole = () => {
    setLogs([]);
    setIncidents([]);
    setSelectedLogId(null);
    setNotifications([]);
    setCommandOutput('Console reset completed.');
    setCommandStatus('INFO');
  };

  return (
    <div
      className={`terminal-wrapper ${isCompact ? 'terminal-compact' : ''}`}
      data-console-version="3.0.0"
    >
      <header className="terminal-control-panel">
        <div className="terminal-header-main">
          <button
            type="button"
            className="terminal-exit-btn"
            onClick={() => setPage('home')}
            aria-label="Return to portfolio home"
          >
            ← Terminate Hook
          </button>

          <div className="terminal-heading">
            <h1>System Console</h1>
            <p>
              LOCAL SIMULATION
            </p>
          </div>

          <div className="terminal-runtime-indicator">
            <span
              className={`runtime-status-dot ${isStreaming ? 'runtime-online' : 'runtime-paused'}`}
              aria-hidden="true"
            />
            <span>{isStreaming ? 'STREAMING' : 'PAUSED'}</span>
            <span>PID: 4092</span>
          </div>
        </div>

        <div className="terminal-top-toolbar">
          <label className="terminal-search-label">
            <span>Search telemetry</span>
            <input
              type="search"
              className="terminal-search-input"
              placeholder="Search messages, IDs, traces, metadata..."
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.target.value);
                setVisibleCount(pageSize);
              }}
              aria-label="Search telemetry logs"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsStreaming(previous => !previous)}
            className={`terminal-exit-btn stream-btn ${isStreaming ? 'streaming' : 'paused'}`}
            aria-pressed={isStreaming}
          >
            {isStreaming ? '● LIVE STREAM' : '❚❚ PAUSED'}
          </button>

          <button
            type="button"
            onClick={() => exportLogs('json')}
            className="terminal-exit-btn"
          >
            EXPORT JSON
          </button>

          <button
            type="button"
            onClick={() => exportLogs('csv')}
            className="terminal-exit-btn"
          >
            EXPORT CSV
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="terminal-exit-btn"
          >
            RESET FILTERS
          </button>

          <button
            type="button"
            onClick={resetConsole}
            className="terminal-exit-btn clear-btn"
          >
            RESET CONSOLE
          </button>
        </div>

        <nav className="terminal-navigation" aria-label="Console sections">
          {['OVERVIEW', 'LOGS', 'SERVICES', 'INCIDENTS', 'ACTIVITY'].map(tab => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
              {tab === 'INCIDENTS' && metrics.activeIncidents > 0
                ? ` (${metrics.activeIncidents})`
                : ''}
            </button>
          ))}
        </nav>
      </header>

      <section className="terminal-metrics-grid" aria-label="System metrics">
        <article className="terminal-metric-card">
          <span>RETAINED EVENTS</span>
          <strong>{metrics.total.toLocaleString()}</strong>
          <small>Capacity: {MAX_LOGS.toLocaleString()}</small>
        </article>

        <article className="terminal-metric-card">
          <span>CRITICAL EVENTS</span>
          <strong>{metrics.CRIT.toLocaleString()}</strong>
          <small>Critical event ratio: {metrics.errorRate}%</small>
        </article>

        <article className="terminal-metric-card">
          <span>WARNING EVENTS</span>
          <strong>{metrics.WARN.toLocaleString()}</strong>
          <small>Requires review</small>
        </article>

        <article className="terminal-metric-card">
          <span>ACTIVE INCIDENTS</span>
          <strong>{metrics.activeIncidents}</strong>
          <small>Unresolved incident records</small>
        </article>

        <article className="terminal-metric-card">
          <span>HEALTHY SERVICES</span>
          <strong>
            {metrics.healthyServices}/{metrics.totalServices}
          </strong>
          <small>Simulated health checks</small>
        </article>

        <article className="terminal-metric-card">
          <span>STREAM ENGINE</span>
          <strong>{isStreaming ? `${streamRate}x` : 'PAUSED'}</strong>
          <small>Interval: {Math.round(STREAM_INTERVAL / streamRate)} ms</small>
        </article>
      </section>

      <main className="terminal-body-monitor">
        {activeTab === 'OVERVIEW' && (
          <section className="terminal-overview-panel">
            <header>
              <h2>Operational Overview</h2>
              <p>
                Metrics are calculated from locally retained simulated events.
              </p>
            </header>

            <div className="terminal-severity-breakdown">
              {SEVERITIES.map(severity => {
                const count = metrics[severity] || 0;
                const percentage = metrics.total
                  ? ((count / metrics.total) * 100).toFixed(1)
                  : '0.0';

                return (
                  <article
                    key={severity}
                    className={`terminal-severity-card severity-${severity.toLowerCase()}`}
                  >
                    <span>{severity}</span>
                    <strong>{count}</strong>
                    <progress
                      value={Number(percentage)}
                      max="100"
                      aria-label={`${severity} event percentage`}
                    />
                    <small>{percentage}% of retained events</small>
                  </article>
                );
              })}
            </div>

            <section className="terminal-service-summary">
              <h3>Service Health Summary</h3>

              {serviceMetrics.map(service => (
                <article
                  key={service.name}
                  className="terminal-service-summary-row"
                >
                  <span>{service.name}</span>
                  <span className={`service-status service-${service.status.toLowerCase()}`}>
                    {service.status}
                  </span>
                  <span>{service.latency} ms</span>
                  <span>{service.eventCount} events</span>
                </article>
              ))}
            </section>

            <section className="terminal-recent-activity">
              <h3>Recent Activity</h3>

              {recentActivity.map(log => (
                <button
                  type="button"
                  key={log.id}
                  className={`terminal-activity-row ${log.status.toLowerCase()}`}
                  onClick={() => {
                    setSelectedLogId(log.id);
                    setActiveTab('LOGS');
                  }}
                >
                  <time dateTime={log.timestamp}>{log.time}</time>
                  <span>{log.status}</span>
                  <span>{log.service}</span>
                  <span>{log.message}</span>
                </button>
              ))}
            </section>
          </section>
        )}

        {activeTab === 'LOGS' && (
          <section className="terminal-log-workspace">
            <div className="terminal-filter-panel">
              <div className="filter-button-cluster">
                {['ALL', ...SEVERITIES].map(severity => (
                  <button
                    type="button"
                    key={severity}
                    onClick={() => {
                      setFilter(severity);
                      setVisibleCount(pageSize);
                    }}
                    className={filter === severity ? 'active' : ''}
                    aria-pressed={filter === severity}
                  >
                    {severity === 'ALL' ? 'ALL LOGS' : severity}
                  </button>
                ))}
              </div>

              <label>
                Service
                <select
                  value={selectedService}
                  onChange={event => setSelectedService(event.target.value)}
                >
<option value="ALL">All services</option>
                  {SERVICES.map(service => (
                    <option value={service} key={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Time range
                <select
                  value={timeRange}
                  onChange={event => setTimeRange(event.target.value)}
                >
                  <option value="ALL">All time</option>
                  <option value="5M">Last 5 minutes</option>
                  <option value="15M">Last 15 minutes</option>
                  <option value="1H">Last hour</option>
                  <option value="24H">Last 24 hours</option>
                </select>
              </label>

              <label>
                Records per view
                <select
                  value={pageSize}
                  onChange={event => {
                    const size = Number(event.target.value);
                    setPageSize(size);
                    setVisibleCount(size);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                </select>
              </label>

              <label className="terminal-toggle-option">
                <input
                  type="checkbox"
                  checked={showDebug}
                  onChange={event => setShowDebug(event.target.checked)}
                />
                Show DEBUG
              </label>

              <label className="terminal-toggle-option">
                <input
                  type="checkbox"
                  checked={isAutoScroll}
                  onChange={event => setIsAutoScroll(event.target.checked)}
                />
                Auto-scroll
              </label>

              <button
                type="button"
                onClick={() => setIsCompact(previous => !previous)}
                aria-pressed={isCompact}
              >
                {isCompact ? 'EXPANDED VIEW' : 'COMPACT VIEW'}
              </button>

              <button type="button" onClick={clearFilters}>
                CLEAR FILTERS
              </button>
            </div>

            <div className="terminal-log-layout">
              <section className="terminal-log-list-panel">
                <div className="terminal-log-summary">
                  <span>
                    Showing {displayedLogs.length} of {filteredLogs.length} matching records
                  </span>
                  <span>
                    {logs.length} retained / {MAX_LOGS} maximum
                  </span>
                </div>

                <div
                  className="terminal-screen-output"
                  ref={terminalOutputRef}
                  role="log"
                  aria-label="System telemetry log"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  <p className="system-boot-banner">
                    SYSTEM MONITOR
                  </p>

                  {displayedLogs.length === 0 && (
                    <div className="terminal-empty-state">
                      <strong>No matching telemetry events</strong>
                      <p>Change your filters or wait for new events.</p>
                    </div>
                  )}

                  {displayedLogs.map(log => (
                    <button
                      type="button"
                      key={log.id}
                      className={[
                        'log-row-item',
                        log.status.toLowerCase(),
                        selectedLogId === log.id ? 'selected' : '',
                        log.acknowledged ? 'acknowledged' : ''
                      ].filter(Boolean).join(' ')}
                      onClick={() => setSelectedLogId(log.id)}
                      title={`Inspect event ${log.id}`}
                    >
                      <time
                        className="log-time"
                        dateTime={log.timestamp}
                      >
                        [{log.time}]
                      </time>

                      <span className="log-badge-status">
                        {log.status} :
                      </span>

                      <span className="log-service-name">
                        [{log.service}]
                      </span>

                      <span className="log-message-body">
                        {log.message}
                      </span>

                      <span className="log-trace-reference">
                        {log.traceId}
                      </span>
                    </button>
                  ))}

                  <div ref={terminalEndRef} />
                </div>

                {filteredLogs.length > visibleCount && (
                  <button
                    type="button"
                    className="terminal-load-more"
                    onClick={() =>
                      setVisibleCount(previous => previous + pageSize)
                    }
                  >
                    LOAD OLDER EVENTS
                  </button>
                )}
              </section>

              {selectedLog && (
                <aside className="terminal-log-inspector">
                  <header>
                    <h3>Event Inspector</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedLogId(null)}
                      aria-label="Close event inspector"
                    >
                      CLOSE
                    </button>
                  </header>

                  <dl>
                    <dt>Event ID</dt>
                    <dd>{selectedLog.id}</dd>

                    <dt>Timestamp</dt>
                    <dd>{selectedLog.timestamp}</dd>

                    <dt>Severity</dt>
                    <dd>{selectedLog.status}</dd>

                    <dt>Service</dt>
                    <dd>{selectedLog.service}</dd>

                    <dt>Host</dt>
                    <dd>{selectedLog.host}</dd>

                    <dt>Environment</dt>
                    <dd>{selectedLog.environment}</dd>

                    <dt>Trace ID</dt>
                    <dd>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTraceId(selectedLog.traceId);
                          setSelectedLogId(null);
                        }}
                      >
                        {selectedLog.traceId}
                      </button>
                    </dd>

                    <dt>Correlation ID</dt>
                    <dd>{selectedLog.correlationId}</dd>

                    <dt>Message</dt>
                    <dd>{selectedLog.message}</dd>
                  </dl>

                  <section>
                    <h4>Structured Metadata</h4>
                    <pre>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </section>

                  <section>
                    <h4>Related Incidents</h4>

                    {selectedLogIncidents.length === 0
                      ? <p>No related incidents recorded.</p>
                      : selectedLogIncidents.map(incident => (
                          <article key={incident.id}>
                            <strong>{incident.id}</strong>
                            <span>{incident.status}</span>
                            <p>{incident.title}</p>
                          </article>
                        ))}
                  </section>

                  <button
                    type="button"
                    onClick={() => {
                      downloadFile(
                        JSON.stringify(selectedLog, null, 2),
                        `${selectedLog.id}.json`,
                        'application/json;charset=utf-8'
                      );
                    }}
                  >
                    EXPORT THIS EVENT
                  </button>
                </aside>
              )}
            </div>
          </section>
        )}

        {activeTab === 'SERVICES' && (
          <section className="terminal-services-panel">
            <header>
              <h2>Service Registry</h2>
              <p>Simulated service health and operational counters.</p>
            </header>

            <div className="terminal-service-table">
              <div className="terminal-service-table-header">
                <span>Service</span>
                <span>Status</span>
                <span>Version</span>
                <span>Latency</span>
                <span>Events</span>
                <span>Critical</span>
                <span>Warnings</span>
                <span>Actions</span>
              </div>

              {serviceMetrics.map(service => (
                <article
                  key={service.name}
                  className="terminal-service-table-row"
                >
                  <span>{service.name}</span>
                  <span className={`service-status service-${service.status.toLowerCase()}`}>
                    {service.status}
                  </span>
                  <span>{service.version}</span>
                  <span>{service.latency} ms</span>
                  <span>{service.eventCount}</span>
                  <span>{service.criticalCount}</span>
                  <span>{service.warningCount}</span>

                  <div className="terminal-service-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(service.name);
                        setActiveTab('LOGS');
                      }}
                    >
                      VIEW LOGS
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        executeCommand(
                          `simulate ${getServiceStatus(service.name) === 'OFFLINE' ? 'online' : 'offline'} ${service.name}`
                        );
                      }}
                    >
                      {getServiceStatus(service.name) === 'OFFLINE'
                        ? 'RESTORE'
                        : 'SIMULATE OFFLINE'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        emitEvent({
                          status: 'INFO',
                          service: service.name,
                          message: `Manual health check requested for ${service.name}.`,
                          metadata: {
                            checkType: 'manual',
                            simulated: true,
                            result: getServiceStatus(service.name)
                          }
                        });
                      }}
                    >
                      HEALTH CHECK
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'INCIDENTS' && (
          <section className="terminal-incidents-panel">
            <header>
              <h2>Incident Management</h2>
              <p>
                Critical simulated events create incident records.
              </p>
            </header>

            <div className="terminal-incident-summary">
              <article>
                <span>OPEN</span>
                <strong>
                  {incidents.filter(item => item.status === 'OPEN').length}
                </strong>
              </article>

              <article>
                <span>ACKNOWLEDGED</span>
                <strong>
                  {incidents.filter(item => item.status === 'ACKNOWLEDGED').length}
                </strong>
              </article>

              <article>
                <span>RESOLVED</span>
                <strong>
                  {incidents.filter(item => item.status === 'RESOLVED').length}
                </strong>
              </article>
            </div>

            {incidents.length === 0 && (
              <div className="terminal-empty-state">
                <strong>No incident records</strong>
                <p>Use the simulated error command to create an incident.</p>
              </div>
            )}

            {incidents.map(incident => (
              <article
                key={incident.id}
                className={`terminal-incident-card incident-${incident.status.toLowerCase()}`}
              >
                <header>
                  <span>{incident.id}</span>
                  <span>{incident.severity}</span>
                  <span>{incident.status}</span>
                </header>

                <h3>{incident.title}</h3>

                <dl>
                  <dt>Service</dt>
                  <dd>{incident.service}</dd>

                  <dt>First seen</dt>
                  <dd>{incident.firstSeen}</dd>

                  <dt>Last seen</dt>
                  <dd>{incident.lastSeen}</dd>

                  <dt>Trace</dt>
                  <dd>{incident.traceId}</dd>

                  {incident.resolvedAt && (
                    <>
                      <dt>Resolved at</dt>
                      <dd>{incident.resolvedAt}</dd>
                    </>
                  )}
                </dl>

                <div className="terminal-incident-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTraceId(incident.traceId);
                      setActiveTab('LOGS');
                    }}
                  >
                    VIEW RELATED LOGS
                  </button>

                  {incident.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={() => acknowledgeIncident(incident.id)}
                    >
                      ACKNOWLEDGE
                    </button>
                  )}

                  {incident.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      onClick={() => resolveIncident(incident.id)}
                    >
                      RESOLVE
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'ACTIVITY' && (
          <section className="terminal-activity-panel">
            <header>
              <h2>Runtime Activity</h2>
              <p>Recent notifications generated by this console session.</p>
            </header>

            {notifications.length === 0 && (
              <div className="terminal-empty-state">
                <p>No runtime notifications.</p>
              </div>
            )}

            {notifications.slice().reverse().map(notification => (
              <article
                key={notification.id}
                className={`terminal-notification notification-${notification.type.toLowerCase()}`}
              >
                <time dateTime={notification.timestamp}>
                  {notification.timestamp}
                </time>
                <span>{notification.type}</span>
                <p>{notification.message}</p>
              </article>
            ))}
          </section>
        )}

        <section className="terminal-command-console">
          <header>
            <div>
              <h2>Command Interface</h2>
              <p>
                Local simulation only. Commands do not execute against real servers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCommandHelpOpen(previous => !previous)}
              aria-expanded={isCommandHelpOpen}
            >
              {isCommandHelpOpen ? 'HIDE HELP' : 'COMMAND REFERENCE'}
            </button>
          </header>

          {isCommandHelpOpen && (
            <pre className="terminal-command-help">
              {getHelpText()}
            </pre>
          )}

          <form
            onSubmit={handleCommandSubmit}
            className="terminal-command-form"
          >
            <label htmlFor="terminal-cli-input" className="cli-prompt">
              operator@system:~$
            </label>

            <input
              id="terminal-cli-input"
              ref={commandInputRef}
              type="text"
              className="cli-input"
              placeholder="Type help, status, metrics, services..."
              value={commandInput}
              onChange={event => setCommandInput(event.target.value)}
              onKeyDown={handleCommandKeyDown}
              autoComplete="off"
              spellCheck="false"
              aria-label="Console command input"
            />

            <button type="submit" className="cli-exec-btn">
              EXECUTE
            </button>
          </form>

          <section
            className={`terminal-command-output output-${commandStatus.toLowerCase()}`}
            aria-live="polite"
            aria-label="Command result"
          >
            <header>
              <span>LAST COMMAND RESULT</span>
              <span>{commandStatus}</span>
              <button
                type="button"
                onClick={() => setCommandOutput('')}
              >
                CLEAR OUTPUT
              </button>
            </header>

            <pre>{commandOutput}</pre>
          </section>

          <footer className="terminal-command-footer">
            <span>History: {commandHistory.length} commands</span>
            <span>Ctrl + K: Focus CLI</span>
            <span>/: Search logs</span>
            <span>F1: Help</span>
            <button
              type="button"
              onClick={() => {
                setCommandHistory([]);
                setHistoryIndex(-1);
                pushNotification('Command history cleared.', 'INFO');
              }}
            >
              CLEAR HISTORY
            </button>
          </footer>
        </section>

        <footer className="terminal-system-footer">
          <span>CONSOLE: LOCAL SIMULATION</span>
          <span>EVENTS: {metrics.total}</span>
          <span>RETENTION: {metrics.retentionUsage}%</span>
          <span>SERVICES: {metrics.totalServices}</span>
          <span>STREAM: {isStreaming ? 'ACTIVE' : 'PAUSED'}</span>
          <span>VERSION: 3.0.0</span>
        </footer>
      </main>
    </div>
  );
}

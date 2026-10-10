import React, { useState } from 'react';
import './Page10_StaffDirectory.css';

export default function Page10_StaffDirectory({ setPage }) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('ALL');
  const [activeProfile, setActiveProfile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initial Expanded Roster
  const [team, setTeam] = useState([
    {
      id: "EMP-01",
      name: "Prince Osinachi",
      title: "Principal Systems Engineer",
      dept: "ENGINEERING",
      email: "prince@company.com",
      phone: "+234 808 354 3955",
      clearance: "L4 - Omega",
      location: "Lagos, Nigeria",
      skills: ["Rust", "C Native", "React", "Smart Contracts", "FFmpeg"],
      status: "Active"
    },
    {
      id: "EMP-02",
      name: "Amarachi Kalu",
      title: "Product Operations Lead",
      dept: "PRODUCT",
      email: "ama@company.com",
      phone: "+234 701 442 1199",
      clearance: "L3 - Executive",
      location: "Abuja, Nigeria",
      skills: ["Agile Management", "Roadmap", "Sprint Telemetry"],
      status: "Active"
    },
    {
      id: "EMP-03",
      name: "Tunde Bakare",
      title: "Lead Security Auditor",
      dept: "SECURITY",
      email: "tunde@company.com",
      phone: "+234 812 009 8833",
      clearance: "L4 - Omega",
      location: "Port Harcourt, Nigeria",
      skills: ["Zero-Knowledge", "C Auditing", "Penetration Testing"],
      status: "Active"
    },
    {
      id: "EMP-04",
      name: "Ebere Nwosu",
      title: "Logistics & Chain Supervisor",
      dept: "OPERATIONS",
      email: "ebere@company.com",
      phone: "+234 903 112 4455",
      clearance: "L2 - Elevated",
      location: "Enugu, Nigeria",
      skills: ["Supply Manifests", "Inventory Systems", "ERP Sync"],
      status: "Active"
    },
    {
      id: "EMP-05",
      name: "Chinedu Okafor",
      title: "Legacy Component Manager",
      dept: "DEPRECATED",
      email: "chinedu@company.com",
      phone: "Discontinued",
      clearance: "L1 - Revoked",
      location: "Decommissioned Node",
      skills: ["COBOL", "Legacy DB"],
      status: "Inactive"
    }
  ]);

  // New Employee Form State
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('ENGINEERING');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newClearance, setNewClearance] = useState('L2 - Elevated');
  const [newLocation, setNewLocation] = useState('Lagos, Nigeria');
  const [newSkills, setNewSkills] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddPersonnel = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newEmp = {
      id: `EMP-${Math.floor(10 + Math.random() * 90)}`,
      name: newName,
      title: newTitle || "Software Engineer",
      dept: newDept,
      email: newEmail,
      phone: newPhone || "+234 000 000 0000",
      clearance: newClearance,
      location: newLocation,
      skills: newSkills ? newSkills.split(',').map(s => s.trim()) : ["Core Systems"],
      status: newDept === 'DEPRECATED' ? 'Inactive' : 'Active'
    };

    setTeam([newEmp, ...team]);
    setNewName('');
    setNewTitle('');
    setNewEmail('');
    setNewPhone('');
    setNewSkills('');
    setIsAdding(false);
    triggerToast(`Personnel record created for ${newName}`);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} (${text}) to clipboard`);
  };

  const filteredTeam = team.filter(emp => {
    const matchesDept = selectedDept === 'ALL' || emp.dept === selectedDept;
    const matchesClearance = clearanceFilter === 'ALL' || emp.clearance.startsWith(clearanceFilter);
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDept && matchesClearance && matchesSearch;
  });

  return (
    <div className="staff-wrapper">
      <header className="staff-control-header">
        <button
          className="staff-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Corporate Dashboard
        </button>
      </header>

      {/* Main Registry Controls & Toolbar */}
      <section className="staff-controls">
        <div className="title-action-row">
          <div>
            <h1 className="staff-title">Internal Staff Registry</h1>
            <p className="staff-subtext">Verified personnel nodes, security clearance indexes, and communication routing.</p>
          </div>

          <div className="toolbar-btn-group">
            <button
              className="staff-exit-btn primary-btn"
              onClick={() => setIsAdding(!isAdding)}
            >
              {isAdding ? "✕ Cancel Entry" : "+ Recruit Personnel"}
            </button>
          </div>
        </div>

        {/* Search & Clearance Bar */}
        <div className="staff-search-bar">
          <input
            type="text"
            className="staff-search-input"
            placeholder="Filter personnel by name, ID, title, email, or technical skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="staff-clearance-select"
            value={clearanceFilter}
            onChange={(e) => setClearanceFilter(e.target.value)}
          >
            <option value="ALL">All Clearance Levels</option>
            <option value="L4">L4 - Omega Clearance</option>
            <option value="L3">L3 - Executive Clearance</option>
            <option value="L2">L2 - Elevated Clearance</option>
            <option value="L1">L1 - Revoked / Standard</option>
          </select>
        </div>

        {/* Department Filters */}
        <div className="dept-filter-row">
          {['ALL', 'ENGINEERING', 'PRODUCT', 'SECURITY', 'OPERATIONS', 'DEPRECATED'].map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={selectedDept === dept ? 'active-filter' : ''}
            >
              {dept === 'ALL' ? 'Full Roster' : dept === 'DEPRECATED' ? 'Inactive Nodes' : dept}
            </button>
          ))}
        </div>
      </section>

      {/* Recruit Personnel Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAddPersonnel} className="add-personnel-drawer">
          <h3>Register New Personnel Profile</h3>
          <div className="drawer-form-grid">
            <div>
              <label>Full Legal Name</label>
              <input
                type="text"
                placeholder="e.g. Olayinka Bello"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Role / Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Smart Contract Architect"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Department Unit</label>
              <select value={newDept} onChange={(e) => setNewDept(e.target.value)}>
                <option value="ENGINEERING">ENGINEERING</option>
                <option value="PRODUCT">PRODUCT</option>
                <option value="SECURITY">SECURITY</option>
                <option value="OPERATIONS">OPERATIONS</option>
                <option value="DEPRECATED">DEPRECATED</option>
              </select>
            </div>
            <div>
              <label>Secure Email Route</label>
              <input
                type="email"
                placeholder="yinka@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Comms Phone</label>
              <input
                type="text"
                placeholder="+234 800 000 0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div>
              <label>Security Clearance Level</label>
              <select value={newClearance} onChange={(e) => setNewClearance(e.target.value)}>
                <option value="L4 - Omega">L4 - Omega</option>
                <option value="L3 - Executive">L3 - Executive</option>
                <option value="L2 - Elevated">L2 - Elevated</option>
                <option value="L1 - Revoked">L1 - Revoked</option>
              </select>
            </div>
            <div>
              <label>Primary Station / Location</label>
              <input
                type="text"
                placeholder="Lagos, Nigeria"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            <div>
              <label>Technical Skills (comma separated)</label>
              <input
                type="text"
                placeholder="React, Python, FFmpeg"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="submit-personnel-btn">
            Commit Record to Matrix
          </button>
        </form>
      )}

      {/* Staff Roster Layout */}
      <main className="staff-list-layout">
        {filteredTeam.length === 0 ? (
          <div className="empty-staff-card">
            <p>No personnel records match your specified search and security parameters.</p>
          </div>
        ) : (
          filteredTeam.map(person => (
            <div
              key={person.id}
              className={`staff-card ${person.dept.toLowerCase()}`}
              onClick={() => setActiveProfile(person)}
            >
              <div className="card-top-identity">
                <span className="staff-id-tag">
                  {person.id}
                </span>

                <span className="clearance-tag-pill">
                  {person.clearance}
                </span>

                <span className="dept-tag">
                  {person.dept}
                </span>
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

              <div className="skills-badge-list">
                {person.skills.map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
              </div>

              <div className="staff-card-footer">
                <span className="staff-email-txt">
                  {person.email}
                </span>
                <span className="view-profile-link">View Sheet →</span>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Profile Modal Property Sheet */}
      {activeProfile && (
        <div
          className="modal-overlay"
          onClick={() => setActiveProfile(null)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-header-title">
              System Node Properties // {activeProfile.id}
            </h3>

            <div className="modal-data-table">
              <p>
                <strong>Full Label:</strong> {activeProfile.name}
              </p>

              <p>
                <strong>Assignment Title:</strong>{' '}
                <em>{activeProfile.title}</em>
              </p>

              <p>
                <strong>Department Link:</strong>{' '}
                <span className="modal-teal-highlight">
                  {activeProfile.dept}
                </span>
              </p>

              <p>
                <strong>Clearance Status:</strong>{' '}
                <span className="clearance-modal-badge">{activeProfile.clearance}</span>
              </p>

              <p>
                <strong>Station Location:</strong> {activeProfile.location}
              </p>

              <p>
                <strong>Secure Route (Email):</strong>{' '}
                <button
                  className="quick-copy-btn"
                  onClick={() => copyToClipboard(activeProfile.email, 'Email')}
                >
                  {activeProfile.email} 📋
                </button>
              </p>

              <p>
                <strong>Secure Comms (Phone):</strong>{' '}
                <button
                  className="quick-copy-btn"
                  onClick={() => copyToClipboard(activeProfile.phone, 'Phone')}
                >
                  {activeProfile.phone} 📋
                </button>
              </p>

              <div className="modal-skills-block">
                <strong>Verified Competencies:</strong>
                <div className="modal-skills-flex">
                  {activeProfile.skills.map((s, idx) => (
                    <span key={idx} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="modal-close-btn"
              onClick={() => setActiveProfile(null)}
            >
              Dismiss Sheet
            </button>
          </div>
        </div>
      )}

      {/* Custom In-App Notification Toast */}
      {toastMessage && (
        <div className="custom-notification-toast">
          <span>● {toastMessage}</span>
        </div>
      )}
    </div>
  );
}

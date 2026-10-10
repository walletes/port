import React, { useState } from 'react';
import './Page10_StaffDirectory.css';

export default function Page10_StaffDirectory({ setPage }) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeProfile, setActiveProfile] = useState(null);

  const team = [
    { id: "EMP-01", name: "Prince Osinachi", title: "Principal Systems Engineer", dept: "ENGINEERING", email: "prince@company.com", phone: "+234 808 354 3955" },
    { id: "EMP-02", name: "Amarachi Kalu", title: "Product Operations Lead", dept: "PRODUCT", email: "ama@company.com", phone: "+234 701 442 1199" },
    { id: "EMP-03", name: "Chinedu Okafor", title: "Legacy Component Manager", dept: "DEPRECATED", email: "chinedu@company.com", phone: "Discontinued" }
  ];

  const filteredTeam = selectedDept === 'ALL'
    ? team
    : team.filter(emp => emp.dept === selectedDept);

  return (
    <div className="staff-wrapper">
      <header className="staff-control-header">
        <button
          className="staff-exit-btn"
          onClick={() => setPage('home')}
        >
          ← Corporate Dashboard
        </button>

        <span className="staff-badge">
          ORGANIZATIONAL MATRIX INDEX
        </span>
      </header>

      <section className="staff-controls">
        <h1 className="staff-title">Internal Staff Registry</h1>

        <div className="dept-filter-row">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={selectedDept === 'ALL' ? 'active-filter' : ''}
          >
            Full Roster
          </button>

          <button
            onClick={() => setSelectedDept('ENGINEERING')}
            className={selectedDept === 'ENGINEERING' ? 'active-filter' : ''}
          >
            Engineering
          </button>

          <button
            onClick={() => setSelectedDept('PRODUCT')}
            className={selectedDept === 'PRODUCT' ? 'active-filter' : ''}
          >
            Product
          </button>

          <button
            onClick={() => setSelectedDept('DEPRECATED')}
            className={selectedDept === 'DEPRECATED' ? 'active-filter' : ''}
          >
            Inactive Nodes
          </button>
        </div>
      </section>

      <main className="staff-list-layout">
        {filteredTeam.map(person => (
          <div
            key={person.id}
            className={`staff-card ${person.dept.toLowerCase()}`}
            onClick={() => setActiveProfile(person)}
          >
            <div className="card-top-identity">
              <span className="staff-id-tag">
                {person.id}
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

            <p className="staff-email-txt">
              {person.email}
            </p>
          </div>
        ))}
      </main>

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
              System Node Properties
            </h3>

            <div className="modal-data-table">
              <p>
                <strong>Full Label:</strong> {activeProfile.name}
              </p>

              <p>
                <strong>Assignment:</strong>{' '}
                <em>{activeProfile.title}</em>
              </p>

              <p>
                <strong>Department Link:</strong>{' '}
                <span className="modal-teal-highlight">
                  {activeProfile.dept}
                </span>
              </p>

              <p>
                <strong>Secure Route:</strong> {activeProfile.email}
              </p>

              <p>
                <strong>Secure Comms:</strong> {activeProfile.phone}
              </p>
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
    </div>
  );
}

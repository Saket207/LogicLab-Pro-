import React, { useState } from 'react';
import HelpModal from '../HelpModal';

const AppHeader = ({
  toggleSidebar,
  sidebarVisible,
  saveCircuit,
  loadCircuit,
  clearCircuit,
  exportCircuit,
  openTeacherDashboard,
  openStudentDashboard,
  userRole,
  onLogout
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 1v3" />
            <path d="M15 1v3" />
            <path d="M9 20v3" />
            <path d="M15 20v3" />
            <path d="M20 9h3" />
            <path d="M20 14h3" />
            <path d="M1 9h3" />
            <path d="M1 14h3" />
          </svg>
          <span>Logic Gate Simulator</span>
        </div>
        <div className="app-nav">
          <button onClick={toggleSidebar} className="nav-button">
            {sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          <button onClick={saveCircuit} className="nav-button">Save</button>
          <button onClick={loadCircuit} className="nav-button">Load</button>
          <button onClick={clearCircuit} className="nav-button">Clear</button>
          <button onClick={exportCircuit} className="nav-button share-button">Share</button>
          {userRole === 'teacher' && (
            <button onClick={openTeacherDashboard} className="nav-button teacher-button">
              🎓 Teacher
            </button>
          )}
          {userRole === 'student' && (
            <button onClick={openStudentDashboard} className="nav-button student-button" style={{ backgroundColor: '#10b981' }}>
              🎒 Dashboard
            </button>
          )}
          <button onClick={onLogout} className="nav-button logout-button" style={{ backgroundColor: '#ef4444' }}>
            Log Out
          </button>
          <button onClick={() => setIsHelpModalOpen(true)} className="nav-button help-button">
            Help
          </button>
        </div>
      </header>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

export default AppHeader;
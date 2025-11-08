import React from 'react';

// --- SVG ICONS ---
const icons = {
  file: (
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  ),
  pen: (
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00-.33-1.82A1.65 1.65 0 013 13a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 .51z" />
    </svg>
  ),
  user: (
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const Icon = ({ icon }) => <div className="w-5 h-5 flex items-center justify-center">{icon}</div>;

// --- Single Nav Button ---
const NavButton = ({ icon, label, onClick, isActive, color }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className="no-drag w-full flex justify-center items-center my-1 py-3 transition-all duration-200"
    >
      <div
        className={`w-10 h-10 flex justify-center items-center rounded-xl transition-all duration-200 ${
          isActive
            ? `${color} text-white shadow-lg scale-105`
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-zinc-800/80'
        }`}
      >
        <Icon icon={icon} />
      </div>
    </button>
  );
};

// --- Premium NavigationBar ---
export function NavigationBar({ activePanel, onPanelClick }) {
  const handleClick = (panel) => {
    onPanelClick(activePanel === panel ? null : panel);
  };

  return (
    <div
      className="w-20 flex flex-col justify-between py-4 border-r border-gray-200/60 dark:border-zinc-700/60 
                 backdrop-blur-md bg-white/60 dark:bg-zinc-900/70 shadow-lg transition-all duration-300"
    >
      {/* --- Top: Core Panels --- */}
      <div className="flex flex-col items-center space-y-3">
        <NavButton
          icon={icons.file}
          label="Files"
          onClick={() => handleClick('files')}
          isActive={activePanel === 'files'}
          color="bg-blue-600"
        />
        <NavButton
          icon={icons.pen}
          label="Draw"
          onClick={() => handleClick('draw')}
          isActive={activePanel === 'draw'}
          color="bg-purple-600"
        />
        <NavButton
          icon={icons.settings}
          label="Settings"
          onClick={() => handleClick('settings')}
          isActive={activePanel === 'settings'}
          color="bg-gray-500"
        />
      </div>

      {/* --- Bottom: Profile --- */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-px bg-gray-300 dark:bg-zinc-700 my-2"></div>
        <NavButton
          icon={icons.user}
          label="Profile"
          onClick={() => handleClick('profile')}
          isActive={activePanel === 'profile'}
          color="bg-blue-500"
        />
      </div>
    </div>
  );
}

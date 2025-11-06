import React, { useState } from 'react';

// Icons using Feather syntax (simple, clean SVG)
const icons = {
    file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
    search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    settings: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51z"></path></svg>,
};

const NavButton = ({ icon, label, onClick, isActive }) => {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`
                no-drag w-full h-12 flex justify-center items-center fill-current 
                text-gray-400 hover:text-white transition-colors
                ${isActive ? 'bg-blue-800/50 text-blue-400 border-l-4 border-blue-600' : 'hover:bg-zinc-700'}
            `}
        >
            <div className="w-5 h-5">
                {icon}
            </div>
        </button>
    );
};

// Main Navigation Bar component
// 💡 FIX: Renamed props to match App.jsx's usage: activePanel and onPanelClick
export function NavigationBar({ activePanel, onPanelClick }) {
    // ❌ REMOVED: Internal state (useState) and local toggling logic are no longer needed.
    // Logic is handled by the parent App.jsx and passed down via props.
    
    // Helper function to handle the click and ensure toggle behavior
    const handleClick = (panelName) => {
        // Toggles the panel: if the clicked panel is already active, set it to null (close it), otherwise set it to the clicked panel.
        onPanelClick(activePanel === panelName ? null : panelName);
    };

    return (
        // Fixed vertical bar, dark background, slightly thicker border to separate it from the file sidebar
        <div className="w-14 flex flex-col bg-zinc-900 border-r border-zinc-700/50 flex-shrink-0">
            {/* Top Buttons */}
            <div className="flex flex-col pt-4 space-y-2">
                <NavButton 
                    icon={icons.file} 
                    label="Files" 
                    onClick={() => handleClick('files')} 
                    isActive={activePanel === 'files'}
                />
                
                {/* Search Button */}
                <NavButton 
                    icon={icons.search} 
                    label="Search" 
                    onClick={() => handleClick('search')} 
                    isActive={activePanel === 'search'}
                />

                <div className="w-10 h-px bg-zinc-700 mx-auto my-2"></div> {/* Separator */}

                {/* Settings Button */}
                <NavButton 
                    icon={icons.settings} 
                    label="Settings" 
                    onClick={() => handleClick('settings')} 
                    isActive={activePanel === 'settings'}
                />
            </div>
        </div>
    );
}
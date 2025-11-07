import React from 'react';

// Icons
const MinimizeIcon = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const MaximizeIcon = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="2"/></svg>;
const CloseIcon = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;


export function WindowControls() {
    const handleMinimize = () => window.electronAPI.minimizeWindow();
    const handleMaximize = () => window.electronAPI.maximizeWindow();
    const handleClose = () => window.electronAPI.closeWindow();

    // 💡 UPDATED: Theme-aware button classes
    const buttonClass = "no-drag p-2 rounded-md transition-colors text-gray-500 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-zinc-700";
    const closeButtonClass = "no-drag p-2 rounded-md transition-colors text-gray-500 hover:bg-red-500 hover:text-white dark:text-gray-400 dark:hover:bg-red-600 dark:hover:text-white";

    return (
        <div className="flex items-center space-x-1">
            <button onClick={handleMinimize} className={buttonClass} title="Minimize">
                <MinimizeIcon />
            </button>
            <button onClick={handleMaximize} className={buttonClass} title="Maximize">
                <MaximizeIcon />
            </button>
            <button onClick={handleClose} className={closeButtonClass} title="Close">
                <CloseIcon />
            </button>
        </div>
    );
}
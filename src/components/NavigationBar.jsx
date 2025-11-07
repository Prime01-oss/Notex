import React from 'react';
// Assuming you add your logo at this path
// import ProfileLogo from '../assets/images/image_322768.png'; 

// Icons
const icons = {
    file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
    search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    settings: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51z"></path></svg>,
    // 💡 ADDED: Pen Icon definition
    pen: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
    user: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    // user: ProfileLogo, // Uncomment this line to use your logo
};

const Icon = ({ icon }) => (
    <div className="w-5 h-5 flex items-center justify-center">
        {/* Check if icon is a string (path to logo) or an SVG object */}
        {typeof icon === 'string' ? (
            <img src={icon} alt="Profile Icon" className="w-5 h-5 object-contain" />
        ) : (
            icon
        )}
    </div>
);

const NavButton = ({ icon, label, onClick, isActive, isProfile = false }) => {
    const baseClasses = `
        no-drag w-full h-12 flex justify-center items-center fill-current 
        transition-colors
    `;

    if (isProfile) {
        const profileHighlightClasses = `
            w-8 h-8 flex justify-center items-center rounded-full
            transition-all fill-current
            ${isActive 
                ? 'bg-blue-600 text-white' // Active: Solid blue, white icon (same for both themes)
                : 'bg-gray-300 text-gray-600 hover:bg-gray-400 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600'
            }
        `;
        return (
            <button onClick={onClick} title={label} className={baseClasses}>
                <div className={profileHighlightClasses}>
                    <Icon icon={icon} />
                </div>
            </button>
        );
    } else {
        const defaultClasses = `
            ${baseClasses}
            text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white
            ${isActive 
                ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-800/50 dark:text-blue-400' 
                : 'hover:bg-gray-200 dark:hover:bg-zinc-700'
            }
        `;
        return (
            <button onClick={onClick} title={label} className={defaultClasses}>
                <Icon icon={icon} />
            </button>
        );
    }
};

export function NavigationBar({ activePanel, onPanelClick }) {
    
    const handleClick = (panelName) => {
        onPanelClick(activePanel === panelName ? null : panelName);
    };

    return (
        // 💡 UPDATED: Theme-aware main container
        <div className="w-14 flex flex-col bg-gray-100 border-r border-gray-300/50 dark:bg-zinc-900 dark:border-zinc-700/50 flex-shrink-0">
            
            <div className="flex flex-col pt-2">
                <NavButton 
                    icon={icons.file} 
                    label="Files" 
                    onClick={() => handleClick('files')} 
                    isActive={activePanel === 'files'}
                />
                
                {/* 💡 FIXED: Uses the newly defined icons.pen */}
                <NavButton 
                    icon={icons.pen} 
                    label="Draw" 
                    onClick={() => handleClick('draw')} 
                    isActive={activePanel === 'draw'}
                />

                {/* <NavButton 
                    icon={icons.search} 
                    label="Search" 
                    onClick={() => handleClick('search')} 
                    isActive={activePanel === 'search'}
                /> */}
                
                {/* 💡 UPDATED: Theme-aware separator */}
                <div className="w-10 h-px bg-gray-300 dark:bg-zinc-700 mx-auto my-2"></div> 

                <NavButton 
                    icon={icons.settings} 
                    label="Settings" 
                    onClick={() => handleClick('settings')} 
                    isActive={activePanel === 'settings'}
                />
            </div>

            <div className="flex flex-col mt-auto pb-2">
                <NavButton 
                    icon={icons.user} 
                    label="Profile" 
                    onClick={() => handleClick('profile')} 
                    isActive={activePanel === 'profile'}
                    isProfile={true}
                />
            </div>
        </div>
    );
}
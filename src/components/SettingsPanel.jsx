import React from 'react';

// Main Settings Panel component
export function SettingsPanel({ theme, setTheme, notebookFont, setNotebookFont, language, setLanguage }) {
    
    const fontOptions = [
        { label: 'System Sans-Serif', value: 'sans' },
        { label: 'Serif (Classic)', value: 'serif' },
        { label: 'Monospace (Code)', value: 'monospace' },
    ];

    return (
        // 💡 UPDATED: Added light mode classes and dark: prefixes
        <div className="w-full h-full p-6 flex flex-col 
                      bg-gray-100 border-r border-gray-300/50
                      dark:bg-zinc-800 dark:border-zinc-700/50">
            
            <h2 className="text-xl font-bold mb-6 border-b border-gray-300 pb-2 dark:border-zinc-600">
                Application Settings
            </h2>

            {/* 1. Theme/Light-Dark Mode */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setTheme('light')}
                        // 💡 UPDATED: Theme-aware classes for the button
                        className={`px-4 py-2 rounded text-sm transition-colors ${
                            theme === 'light' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 hover:bg-gray-400 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600'
                        }`}
                    >
                        Light Mode
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        // 💡 UPDATED: Theme-aware classes for the button
                        className={`px-4 py-2 rounded text-sm transition-colors ${
                            theme === 'dark' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 hover:bg-gray-400 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600'
                        }`}
                    >
                        Dark Mode
                    </button>
                </div>
            </div>

            {/* 2. Notebook Appearance/Font */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notebook Font</label>
                <select
                    value={notebookFont}
                    onChange={(e) => setNotebookFont(e.target.value)}
                    // 💡 UPDATED: Theme-aware classes for select
                    className="w-full p-2 rounded text-sm 
                               bg-white border border-gray-300 text-black 
                               dark:bg-zinc-700 dark:border-zinc-600 dark:text-white 
                               focus:ring-blue-500 focus:border-blue-500"
                >
                    {fontOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            
            {/* 3. Language */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    // 💡 UPDATED: Theme-aware classes for select
                    className="w-full p-2 rounded text-sm 
                               bg-white border border-gray-300 text-black 
                               dark:bg-zinc-700 dark:border-zinc-600 dark:text-white 
                               focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            
            {/* Additional Setting Placeholder */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-300 dark:border-zinc-700">
                Tip: Notebook appearance changes (color/font) will require updating the global CSS/Tailwind configuration files to apply based on the 'theme' and 'font' state variables.
            </div>
        </div>
    );
}
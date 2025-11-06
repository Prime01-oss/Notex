import React from 'react';

// Main Settings Panel component
export function SettingsPanel({ theme, setTheme, notebookFont, setNotebookFont, language, setLanguage }) {
    
    // Hardcoded theme options (to be styled in index.css)
    const fontOptions = [
        { label: 'System Sans-Serif', value: 'sans' },
        { label: 'Serif (Classic)', value: 'serif' },
        { label: 'Monospace (Code)', value: 'monospace' },
    ];

    return (
        // Settings panel structure
        <div className="w-full h-full p-6 flex flex-col bg-zinc-800 border-r border-zinc-700/50">
            
            <h2 className="text-xl font-bold mb-6 border-b border-zinc-600 pb-2">Application Settings</h2>

            {/* 1. Theme/Light-Dark Mode */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded text-sm transition-colors ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                    >
                        Light Mode
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded text-sm transition-colors ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}
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
                    className="w-full p-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            
            {/* Additional Setting Placeholder */}
            <div className="text-sm text-gray-400 mt-auto pt-4 border-t border-zinc-700">
                Tip: Notebook appearance changes (color/font) will require updating the global CSS/Tailwind configuration files to apply based on the 'theme' and 'font' state variables.
            </div>
        </div>
    );
}
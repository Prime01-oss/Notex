import React from 'react';

export function ProfilePanel() {
  return (
    // 💡 UPDATED: Theme-aware pop-up
    <div className="
      absolute bottom-4 left-16 w-64 p-4 z-50
      bg-white/95 backdrop-blur-sm 
      rounded-lg shadow-xl border border-gray-300/50
      dark:bg-zinc-800/95 dark:border-zinc-700/50
    ">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
      
      <div className="flex flex-col items-center space-y-4">
        {/* Placeholder */}
        <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        
        <h3 className="text-lg text-gray-900 dark:text-white">Samarjit Patar</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">samarjit@example.com</p>

        <button className="no-drag w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Edit Profile
        </button>

        <button className="no-drag w-full px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
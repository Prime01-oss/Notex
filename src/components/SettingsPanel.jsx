import React from "react";

const sunIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const moonIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

export function SettingsPanel({
  theme,
  setTheme,
  notebookFont,
  setNotebookFont,
  language,
  setLanguage,
  country,
  setCountry,
}) {
  const fontOptions = [
    { label: "System Sans-Serif", value: "sans" },
    { label: "Serif (Classic)", value: "serif" },
    { label: "Monospace (Code)", value: "monospace" },
    { label: "Comic Sans MS (Fun)", value: "comic-sans-ms" },
    { label: "Arial", value: "arial" },
    { label: "Georgia", value: "georgia" },
    { label: "Courier New", value: "courier-new" },
    { label: "Times New Roman", value: "times-new-roman" },
    { label: "Verdana", value: "verdana" },
  ];

  const languageOptions = [
    { label: "English", value: "en" },
    { label: "हिन्दी", value: "hi" },
    { label: "Español", value: "es" },
    { label: "Français", value: "fr" },
    { label: "Deutsch", value: "de" },
    { label: "中文 (简体)", value: "zh" },
    { label: "日本語", value: "ja" },
    { label: "한국어", value: "ko" },
    { label: "Русский", value: "ru" },
    { label: "Português (Brasil)", value: "pt-BR" },
    { label: "Italiano", value: "it" },
    { label: "Nederlands", value: "nl" },
    { label: "Türkçe", value: "tr" },
    { label: "العربية", value: "ar" },
    { label: "עברית", value: "he" },
  ];

  // 🌍 Country / Region options (with common time zones)
  const countryOptions = [
    { label: "India (IST, UTC+5:30)", value: "Asia/Kolkata" },
    { label: "United States (EST, UTC−5)", value: "America/New_York" },
    { label: "United Kingdom (GMT, UTC+0)", value: "Europe/London" },
    { label: "Japan (JST, UTC+9)", value: "Asia/Tokyo" },
    { label: "China (CST, UTC+8)", value: "Asia/Shanghai" },
    { label: "Australia (AEST, UTC+10)", value: "Australia/Sydney" },
    { label: "Germany (CET, UTC+1)", value: "Europe/Berlin" },
    { label: "Brazil (BRT, UTC−3)", value: "America/Sao_Paulo" },
    { label: "Canada (EST, UTC−5)", value: "America/Toronto" },
    { label: "United Arab Emirates (GST, UTC+4)", value: "Asia/Dubai" },
    { label: "South Africa (SAST, UTC+2)", value: "Africa/Johannesburg" },
  ];

  const controlClasses =
    "w-full p-3 rounded-xl text-sm font-medium appearance-none cursor-pointer " +
    "bg-white/60 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 text-gray-800 dark:text-gray-100 " +
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 hover:shadow-md backdrop-blur-md";

  return (
    <div className="w-full h-full p-8 flex flex-col bg-gradient-to-br from-white/70 to-gray-100/60 dark:from-zinc-900/80 dark:to-zinc-950/80 backdrop-blur-xl border-r border-gray-300/30 dark:border-zinc-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
      <h2 className="text-3xl font-extrabold mb-10 text-gray-900 dark:text-gray-50 tracking-tight">
        Global Settings
      </h2>

      {/* Theme Toggle */}
      <div className="mb-10">
        <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Application Theme
        </label>
        <div className="relative w-full h-11 p-1 rounded-2xl bg-gray-200/70 dark:bg-zinc-800/70 shadow-inner backdrop-blur-sm overflow-hidden border border-gray-300/40 dark:border-zinc-700/50">
          <div
            className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transition-transform duration-300 ease-in-out rounded-xl"
            style={{
              transform: theme === "dark" ? "translateX(100%)" : "translateX(0)",
            }}
          />
          <div className="relative z-10 flex h-full">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center space-x-2 text-sm font-medium transition-colors duration-300 ${
                theme === "light"
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {sunIcon}
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center space-x-2 text-sm font-medium transition-colors duration-300 ${
                theme === "dark"
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {moonIcon}
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Font */}
      <div className="mb-10">
        <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Notebook Font Style
        </label>
        <select
          value={notebookFont}
          onChange={(e) => setNotebookFont(e.target.value)}
          className={controlClasses}
        >
          {fontOptions.map((o) => (
            <option key={o.value} value={o.value} className="dark:bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="mb-10">
        <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Interface Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={controlClasses}
        >
          {languageOptions.map((o) => (
            <option key={o.value} value={o.value} className="dark:bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 🌍 Country / Region */}
      <div className="mb-12">
        <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Country / Region (for Timezone)
        </label>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            localStorage.setItem("userCountry", e.target.value);
          }}
          className={controlClasses}
        >
          {countryOptions.map((o) => (
            <option key={o.value} value={o.value} className="dark:bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-6 border-t border-gray-200 dark:border-zinc-800/80">
        <p className="font-mono opacity-80">Notex v1.0.1</p>
        <p className="mt-1 leading-relaxed opacity-70">
          Font, language, and region changes may require reload for full effect.
        </p>
      </div>
    </div>
  );
}

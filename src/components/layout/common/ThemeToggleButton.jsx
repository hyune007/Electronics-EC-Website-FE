export default function ThemeToggleButton({ onToggle }) {
return(
        <button
          className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          onClick={onToggle}
        >
          <span className="material-symbols-outlined" id="theme-icon">
            dark_mode
          </span>
        </button>
)
}
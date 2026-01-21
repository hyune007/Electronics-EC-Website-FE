export default function ThemeToggleButton({ onToggle }) {
return(
          <div
              className="h-8 w-14 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex items-center cursor-pointer relative"
              onClick={onToggle}
            >
              <div className="size-6 bg-white dark:bg-primary rounded-full shadow-sm flex items-center justify-center transition-all duration-300 transform translate-x-0 dark:translate-x-6">
                <span className="material-symbols-outlined text-[14px] text-gray-600 dark:text-white">
                  dark_mode
                </span>
              </div>
            </div>
)
}
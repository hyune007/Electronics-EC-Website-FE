const THEME_KEY = 'theme';
export default function useTheme() {
const toggleTheme = () => {
     const html = document.documentElement;
     const isDark = html.classList.contains('dark');
            if (isDark) {
                html.classList.remove('dark');
                localStorage.setItem(THEME_KEY, 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem(THEME_KEY, 'dark');
            }
            
  };
    return {toggleTheme};
}
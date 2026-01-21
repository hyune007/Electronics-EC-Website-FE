const THEME_KEY = 'theme';
export default function useTheme() {
const toggleTheme = () => {
     const html = document.documentElement;
     const isDark = html.classList.contains('dark');
            // const icon = document.getElementById('theme-icon');
            if (isDark) {
                html.classList.remove('dark');
                // icon.innerText = 'dark_mode';
                localStorage.setItem(THEME_KEY, 'light');
            } else {
                html.classList.add('dark');
                // icon.innerText = 'light_mode';
                localStorage.setItem(THEME_KEY, 'dark');
            }
            
  };
    return {toggleTheme};
}
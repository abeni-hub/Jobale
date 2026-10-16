import { useEffect } from 'react';

/**
 * ThemeToggle — Dark theme toggle commented out.
 * Ensures the 'dark' class is removed so the website is always displayed in clean light theme.
 */
export default function ThemeToggle() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  return null;

  /* Dark theme toggle implementation commented out:
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    window.localStorage.setItem('jobale-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((current) => !current)}
      className="p-2 rounded-lg text-brand-navy dark:text-surface-steel hover:bg-surface-offwhite dark:hover:bg-brand-navy-light transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
  */
}

import { useRegisterActions } from 'kbar';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  const t = useTranslations('Controls');

  const themeAction = [
    // {
    //   id: 'toggleTheme',
    //   name: 'Toggle Theme',
    //   shortcut: ['t', 't'],
    //   section: 'Theme',
    //   perform: toggleTheme
    // },
    {
      id: 'setLightTheme',
      name: t('toggleLight'),
      section: 'Theme',
      perform: () => setTheme('light')
    },
    {
      id: 'setDarkTheme',
      name: t('toggleNight'),
      section: 'Theme',
      perform: () => setTheme('dark')
    }
  ];

  useRegisterActions(themeAction, [theme]);
};

export default useThemeSwitching;

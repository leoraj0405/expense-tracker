import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';

const STORAGE_KEY = 'et-color-scheme';

export function useAppTheme() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      setColorScheme(stored);
    }
  }, [setColorScheme]);

  const toggleTheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const isDark = colorScheme === 'dark';

  return { colorScheme, isDark, toggleTheme };
}

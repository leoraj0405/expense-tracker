'use client';

import { useEffect, useState, type ReactNode } from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { theme } from '@/theme';
import '@/styles/et-theme.css';

dayjs.locale('en');

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('et-color-scheme');
    if (stored === 'dark' || stored === 'light') {
      setColorScheme(stored);
    }
  }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0, consistentWeeks: true }}>
        <ModalsProvider>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  );
}

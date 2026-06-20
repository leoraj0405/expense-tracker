import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './styles/et-theme.css';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { theme } from './theme';
import App from './App';

dayjs.locale('en');

const storedScheme = localStorage.getItem('et-color-scheme');
const defaultColorScheme =
  storedScheme === 'dark' || storedScheme === 'light' ? storedScheme : 'light';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
        <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0, consistentWeeks: true }}>
          <ModalsProvider>
            <Notifications position="top-right" />
            <App />
          </ModalsProvider>
        </DatesProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}

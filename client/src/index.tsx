import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-right" />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}

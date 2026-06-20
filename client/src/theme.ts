import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'navy',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  colors: {
    navy: [
      '#e8ecf0',
      '#c5d0db',
      '#9fb0c2',
      '#7890a9',
      '#5a7694',
      '#1c2a3a',
      '#182433',
      '#141e2c',
      '#101926',
      '#0c1219',
    ],
    amber: [
      '#fef6eb',
      '#fbeed9',
      '#f5d5a8',
      '#efbc77',
      '#e8a23d',
      '#d4922f',
      '#b87a24',
      '#9c6319',
      '#804c0f',
      '#643604',
    ],
  },
  other: {
    etInk: '#14181f',
    etSurface: '#f6f5f1',
    etCard: '#ffffff',
    etLine: '#e7e4dc',
    etGreen: '#2f8f5b',
    etRed: '#c0503c',
    etViolet: '#6a63d1',
  },
});

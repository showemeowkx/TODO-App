import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  fontFamily:
    '"DM Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: '"Fraunces", Georgia, "Times New Roman", serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  colors: {
    teal: [
      '#e8f7f4',
      '#d1efe8',
      '#a3dfd1',
      '#70cbb8',
      '#45b5a0',
      '#2a9d8f',
      '#218277',
      '#1c6a61',
      '#18554e',
      '#13433e',
    ],
  },
  other: {
    appBg: '#f3f6f4',
    ink: '#1a2421',
    muted: '#5c6b66',
  },
});

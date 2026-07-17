import { MantineProvider } from '@mantine/core';
import { HomePage } from './pages/HomePage';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <HomePage />
    </MantineProvider>
  );
}

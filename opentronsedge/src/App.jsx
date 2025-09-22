import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { RtlProvider } from 'react-rtl';
import { useTheme } from '@mui/material/styles';

const App = () => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RtlProvider rtl={false}>
        {/* ... rest of the components ... */}
      </RtlProvider>
    </ThemeProvider>
  );
};

export default App; 
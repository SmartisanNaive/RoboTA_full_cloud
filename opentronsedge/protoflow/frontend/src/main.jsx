// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';
import App from './App';
import Home from './components/Home';
import Timeline from './components/Timeline';
import { fixSVGMirroring, observeSVGChanges } from './components/SVGFix';

const theme = createTheme();

// Fix SVG mirroring issues
document.addEventListener('DOMContentLoaded', () => {
  fixSVGMirroring();
  observeSVGChanges();
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/:id/timeline',
        element: <Timeline />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
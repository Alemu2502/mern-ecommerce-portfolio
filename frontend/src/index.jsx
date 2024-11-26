import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes';

// Create a root container
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Render the application with future flags enabled
root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);

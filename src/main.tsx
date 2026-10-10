import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';

// Initialize @axe-core/react in development environment
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000, {
      rules: [
        { id: 'color-contrast', enabled: true },
        { id: 'aria-valid-attr', enabled: true },
        { id: 'aria-roles', enabled: true },
        { id: 'label', enabled: true },
      ],
    });
  }).catch((err) => {
    console.warn('Axe-core runtime could not be loaded:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/animations.css';

import { AuthProvider } from './context/AuthContext';
import { AppProvider }  from './context/AppContext';
import App              from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </StrictMode>
);

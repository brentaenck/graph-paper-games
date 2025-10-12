import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
// Import framework CSS
import '../../../packages/framework/src/styles/dual-system/system-boundaries.css';
import '../../../packages/framework/src/styles/modern-ui/ui-components.css';

// Add demo-specific CSS
const demoStyles = document.createElement('style');
demoStyles.textContent = `
  .demo-interactive-grid {
    display: grid !important;
  }
  .demo-interactive-grid > button {
    width: auto !important;
    height: auto !important;
  }
`;
document.head.appendChild(demoStyles);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

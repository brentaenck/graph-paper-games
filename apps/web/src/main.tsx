/**
 * Graph Paper Games - Classic grid-based strategy games for the web
 * Copyright (c) 2025 Brent A. Enck
 * 
 * This file is part of Graph Paper Games.
 * 
 * Graph Paper Games is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file
 * included with this source code.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 */

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
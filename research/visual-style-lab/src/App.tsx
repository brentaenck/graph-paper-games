import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DualStyleDemo from './components/DualStyleDemo';
import GridExperiments from './components/GridExperiments';
import HandDrawnComponents from './components/HandDrawnComponents';
import TicTacToeDemo from './components/TicTacToeDemo';
import TruePaperLayout from './components/TruePaperLayout';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Modern UI Navigation */}
        <nav className="ui-nav p-6 mb-6">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="ui-nav-brand mb-1">
                  Visual Style Lab
                </h1>
                <p className="ui-text-muted ui-text-sm mb-0">
                  Dual Design System Research - Modern UI + Hand-drawn Game Elements
                </p>
              </div>
              
              <div className="ui-nav-links">
                <Link 
                  to="/" 
                  className="ui-nav-link"
                >
                  Dual Styles
                </Link>
                <Link 
                  to="/grids" 
                  className="ui-nav-link"
                >
                  Grid Lab
                </Link>
                <Link 
                  to="/components" 
                  className="ui-nav-link"
                >
                  Components
                </Link>
                <Link 
                  to="/demo" 
                  className="ui-nav-link"
                >
                  Game Demo
                </Link>
                <Link 
                  to="/true-paper" 
                  className="ui-nav-link"
                  style={{ fontWeight: 'bold', color: 'var(--ui-primary)' }}
                >
                  True Paper Layout
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <main className="container">
          <Routes>
            <Route path="/" element={<DualStyleDemo />} />
            <Route path="/grids" element={<GridExperiments />} />
            <Route path="/components" element={<HandDrawnComponents />} />
            <Route path="/demo" element={<TicTacToeDemo />} />
            <Route path="/true-paper" element={<TruePaperLayout />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
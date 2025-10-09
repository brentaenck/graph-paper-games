import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DualStyleDemo from './components/DualStyleDemo';
import GridExperiments from './components/GridExperiments';
import HandDrawnComponents from './components/HandDrawnComponents';
import TicTacToeDemo from './components/TicTacToeDemo';
import TicTacToeFramework from './components/TicTacToeFramework';
import TicTacToeFrameworkEnhanced from './components/TicTacToeFrameworkEnhanced';
import TicTacToeFrameworkDebug from './components/TicTacToeFrameworkDebug';
import ComparisonDemo from './components/ComparisonDemo';
import TruePaperLayout from './components/TruePaperLayout';
import FrameworkDemo from './components/FrameworkDemo';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Modern UI Navigation */}
        <nav className="ui-nav p-6 mb-6">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="ui-nav-brand mb-1">Visual Style Lab</h1>
                <p className="ui-text-muted ui-text-sm mb-0">
                  Dual Design System Research - Modern UI + Hand-drawn Game Elements
                </p>
              </div>

              <div className="ui-nav-links">
                <Link to="/" className="ui-nav-link">
                  Dual Styles
                </Link>
                <Link to="/grids" className="ui-nav-link">
                  Grid Lab
                </Link>
                <Link to="/components" className="ui-nav-link">
                  Components
                </Link>
                <Link to="/demo" className="ui-nav-link">
                  Game Demo
                </Link>
                <Link to="/true-paper" className="ui-nav-link">
                  True Paper Layout
                </Link>
                <Link to="/framework" className="ui-nav-link">
                  🏗️ Framework Preview
                </Link>
                <Link to="/production" className="ui-nav-link">
                  🎯 Production Integration
                </Link>
                <Link to="/enhanced" className="ui-nav-link">
                  ✨ Enhanced Animations
                </Link>
                <Link to="/comparison" className="ui-nav-link">
                  📊 Phase 2 Complete
                </Link>
                <Link
                  to="/debug"
                  className="ui-nav-link"
                  style={{ fontWeight: 'bold', color: 'var(--ui-danger)' }}
                >
                  🐛 Debug
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
            <Route path="/framework" element={<FrameworkDemo />} />
            <Route path="/production" element={<TicTacToeFramework />} />
            <Route path="/enhanced" element={<TicTacToeFrameworkEnhanced />} />
            <Route path="/comparison" element={<ComparisonDemo />} />
            <Route path="/debug" element={<TicTacToeFrameworkDebug />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

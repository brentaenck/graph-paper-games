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

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="hero-section">
        <h1>About Graph Paper Games</h1>
        <p>A production-ready platform for classic grid-based strategy games</p>
        <div className="version-badge">
          <span className="version">Version 0.6.1</span>
          <span className="status">🎆 Phase 3: Game Library Expansion</span>
        </div>
      </div>

      <div className="content-section">
        <div className="about-content">
          <section className="mission">
            <h2>Our Mission</h2>
            <p>
              Graph Paper Games brings beloved pen-and-paper games to the digital world with 
              professional-grade technology, intelligent AI opponents, and comprehensive accessibility. 
              We've built not just games, but a complete platform that respects both the simplicity 
              of classic games and the sophistication of modern web development.
            </p>
          </section>

          <section className="achievements">
            <h2>🏆 Current Achievements</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">2</div>
                <div className="stat-label">Production Games</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">96%</div>
                <div className="stat-label">Test Coverage</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">&lt;100ms</div>
                <div className="stat-label">Move Rendering</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">6</div>
                <div className="stat-label">AI Difficulty Levels</div>
              </div>
            </div>
          </section>

          <section className="games">
            <h2>🎮 Available Games</h2>
            <div className="games-grid">
              <div className="game-item production">
                <h3>Dots and Boxes</h3>
                <span className="game-status">v1.0.0 - Production Ready</span>
                <p>Complete squares by drawing lines. Features advanced coordinate system, 
                   scalable grids, strategic AI, and hand-drawn aesthetics.</p>
              </div>
              <div className="game-item stable">
                <h3>Tic-Tac-Toe</h3>
                <span className="game-status">v0.2.0 - Complete</span>
                <p>Classic 3×3 game with 6-level progressive AI system from random moves 
                   to unbeatable minimax with alpha-beta pruning.</p>
              </div>
              <div className="game-item planned">
                <h3>Connect Four</h3>
                <span className="game-status">📋 Planned</span>
                <p>Gravity-based gameplay with strategic AI - next in development.</p>
              </div>
              <div className="game-item planned">
                <h3>Battleship</h3>
                <span className="game-status">📋 Spec Ready</span>
                <p>Strategic ship placement with intelligent discovery algorithms.</p>
              </div>
            </div>
          </section>

          <section className="features">
            <h2>🌟 Platform Features</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <h3>🤖 Intelligent AI</h3>
                <p>Six progressive difficulty levels with minimax algorithms, 
                   alpha-beta pruning, and strategic gameplay patterns</p>
              </div>
              <div className="feature-item">
                <h3>🎨 Dual Design System</h3>
                <p>Modern UI components combined with hand-drawn game aesthetics 
                   for authentic pencil-and-paper feel</p>
              </div>
              <div className="feature-item">
                <h3>⚡ High Performance</h3>
                <p>Sub-100ms move rendering with efficient canvas and SVG rendering, 
                   optimized for smooth gameplay</p>
              </div>
              <div className="feature-item">
                <h3>📱 Cross-Platform</h3>
                <p>Responsive design with touch support, tested across mobile, 
                   tablet, and desktop devices</p>
              </div>
              <div className="feature-item">
                <h3>♿ Accessibility First</h3>
                <p>WCAG 2.1 compliance with screen reader support, keyboard navigation, 
                   and high contrast themes</p>
              </div>
              <div className="feature-item">
                <h3>🧪 Quality Assurance</h3>
                <p>96%+ test coverage with comprehensive unit, integration, 
                   and end-to-end testing</p>
              </div>
            </div>
          </section>

          <section className="technology">
            <h2>🏗️ Architecture & Technology</h2>
            <p>
              Built as a professional TypeScript monorepo with industry-standard practices 
              and cutting-edge technologies:
            </p>
            <div className="tech-grid">
              <div className="tech-category">
                <h4>Frontend Excellence</h4>
                <ul>
                  <li><strong>React 18:</strong> Modern hooks and functional components</li>
                  <li><strong>TypeScript:</strong> Strict mode with comprehensive type safety</li>
                  <li><strong>Vite 7:</strong> Lightning-fast development and optimized builds</li>
                  <li><strong>Canvas/SVG:</strong> High-performance graphics rendering</li>
                </ul>
              </div>
              <div className="tech-category">
                <h4>Game Framework</h4>
                <ul>
                  <li><strong>Custom Engine:</strong> Standardized GameEngineAPI interface</li>
                  <li><strong>Event System:</strong> Typed EventBus with wildcard support</li>
                  <li><strong>Grid System:</strong> Mathematical precision coordinate handling</li>
                  <li><strong>Turn Manager:</strong> Sophisticated state management</li>
                </ul>
              </div>
              <div className="tech-category">
                <h4>Quality & DevOps</h4>
                <ul>
                  <li><strong>Testing:</strong> Vitest + Testing Library (96%+ coverage)</li>
                  <li><strong>Linting:</strong> ESLint v9 with modern flat config</li>
                  <li><strong>CI/CD:</strong> GitHub Actions with automated validation</li>
                  <li><strong>Monorepo:</strong> pnpm workspaces with automated releases</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="development">
            <h2>🚀 Development Journey</h2>
            <div className="phase-timeline">
              <div className="phase completed">
                <h3>Phase 0: Foundations ✅</h3>
                <p>Professional monorepo setup, GitHub Actions CI/CD, comprehensive documentation, 
                   and modern development tooling</p>
              </div>
              <div className="phase completed">
                <h3>Phase 1: Framework MVP ✅</h3>
                <p>Production-ready game framework with EventBus, GridRenderer, TurnManager, 
                   theme system, and dual design components</p>
              </div>
              <div className="phase completed">
                <h3>Phase 2: First Games ✅</h3>
                <p><strong>EXCEEDED:</strong> Two complete games - Tic-Tac-Toe (6-level AI) 
                   and Dots & Boxes (production v1.0.0) with comprehensive testing</p>
              </div>
              <div className="phase in-progress">
                <h3>Phase 3: Library Expansion 🎆</h3>
                <p><strong>IN PROGRESS:</strong> Connect Four development, enhanced multiplayer 
                   infrastructure, tournament system, and additional games</p>
              </div>
              <div className="phase planned">
                <h3>Phase 4: Platform Maturity 📋</h3>
                <p><strong>READY FOR:</strong> Stable framework APIs, PWA features, 
                   WebGL optimization, and 1000+ concurrent player support</p>
              </div>
            </div>
          </section>

          <section className="metrics">
            <h2>📊 Quality Metrics</h2>
            <div className="metrics-grid">
              <div className="metric-item success">
                <h4>Performance ⚡</h4>
                <p><strong>Target:</strong> &lt;150ms move rendering<br/>
                   <strong>Achieved:</strong> &lt;100ms (33% better)</p>
              </div>
              <div className="metric-item success">
                <h4>Testing 🧪</h4>
                <p><strong>Target:</strong> 80%+ coverage<br/>
                   <strong>Achieved:</strong> 96%+ (20% better)</p>
              </div>
              <div className="metric-item success">
                <h4>AI Quality 🤖</h4>
                <p><strong>Target:</strong> Smart opponents<br/>
                   <strong>Achieved:</strong> Unbeatable minimax AI</p>
              </div>
              <div className="metric-item success">
                <h4>Architecture 🏗️</h4>
                <p><strong>Target:</strong> Stable framework<br/>
                   <strong>Achieved:</strong> Production-ready APIs</p>
              </div>
            </div>
          </section>

          <section className="contributing">
            <h2>🤝 Join the Community</h2>
            <p>
              Graph Paper Games is a thriving open-source project that demonstrates how 
              quality-first development can create exceptional user experiences. We welcome 
              contributions from developers who value craftsmanship, comprehensive testing, 
              and thoughtful architecture.
            </p>
            
            <div className="contribution-areas">
              <div className="contrib-item">
                <h4>🎮 Game Development</h4>
                <p>Implement new games using our production-ready framework with 
                   comprehensive documentation and examples</p>
              </div>
              <div className="contrib-item">
                <h4>🧠 AI Enhancement</h4>
                <p>Improve game AI algorithms, add new difficulty levels, 
                   or optimize performance</p>
              </div>
              <div className="contrib-item">
                <h4>🏗️ Framework Evolution</h4>
                <p>Enhance core framework components, add new features, 
                   or improve developer experience</p>
              </div>
              <div className="contrib-item">
                <h4>♿ Accessibility</h4>
                <p>Improve WCAG compliance, add new accessibility features, 
                   or enhance usability</p>
              </div>
            </div>

            <div className="contribution-links">
              <a
                href="https://github.com/brentaenck/graph-paper-games"
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                🌟 Star on GitHub
              </a>
              <a
                href="https://github.com/brentaenck/graph-paper-games/blob/main/CONTRIBUTING.md"
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                📚 Contribution Guide
              </a>
              <a
                href="https://github.com/brentaenck/graph-paper-games/issues"
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                🐛 Report Issues
              </a>
            </div>

            <div className="project-recognition">
              <p className="recognition-text">
                <strong>Built with ❤️ by Ben Enck and the open source community.</strong><br/>
                A testament to quality-first development and modern web architecture.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
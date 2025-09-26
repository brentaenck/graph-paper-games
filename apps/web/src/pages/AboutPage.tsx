
const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="hero-section">
        <h1>About Graph Paper Games</h1>
        <p>An open-source platform for classic grid-based strategy games</p>
      </div>

      <div className="content-section">
        <div className="about-content">
          <section className="mission">
            <h2>Our Mission</h2>
            <p>
              Graph Paper Games brings beloved pen-and-paper games to the digital world with 
              modern web technology, AI opponents, and accessibility features. We believe 
              these timeless games deserve a platform that respects both their simplicity 
              and strategic depth.
            </p>
          </section>

          <section className="features">
            <h2>Platform Features</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <h3>🤖 AI Opponents</h3>
                <p>Six difficulty levels from beginner-friendly to expert challenge</p>
              </div>
              <div className="feature-item">
                <h3>👥 Local Multiplayer</h3>
                <p>Pass-and-play on the same device with friends and family</p>
              </div>
              <div className="feature-item">
                <h3>📱 Responsive Design</h3>
                <p>Optimized for mobile, tablet, and desktop experiences</p>
              </div>
              <div className="feature-item">
                <h3>♿ Accessibility</h3>
                <p>Screen reader support, keyboard navigation, and high contrast modes</p>
              </div>
              <div className="feature-item">
                <h3>🎨 Customizable Themes</h3>
                <p>Multiple visual themes to match your preferences</p>
              </div>
              <div className="feature-item">
                <h3>🔧 Open Source</h3>
                <p>Built with modern TypeScript, React, and community contributions</p>
              </div>
            </div>
          </section>

          <section className="technology">
            <h2>Technology Stack</h2>
            <p>
              Graph Paper Games is built as a TypeScript monorepo using modern web technologies:
            </p>
            <ul>
              <li><strong>Frontend:</strong> React 18 with TypeScript and Vite</li>
              <li><strong>Framework:</strong> Custom game framework with standardized APIs</li>
              <li><strong>Testing:</strong> Comprehensive test suite with Vitest and Testing Library</li>
              <li><strong>Package Management:</strong> pnpm workspaces for efficient dependency management</li>
              <li><strong>Development:</strong> ESLint, TypeScript strict mode, and conventional commits</li>
            </ul>
          </section>

          <section className="development">
            <h2>Development Phases</h2>
            <div className="phase-timeline">
              <div className="phase completed">
                <h3>Phase 0: Foundations ✅</h3>
                <p>Repository setup, CI/CD, and development tooling</p>
              </div>
              <div className="phase in-progress">
                <h3>Phase 1: Framework MVP 🚧</h3>
                <p>Core game framework, grid renderer, and web app shell</p>
              </div>
              <div className="phase planned">
                <h3>Phase 2: First Game 📋</h3>
                <p>Complete implementation of Tic-Tac-Toe with AI</p>
              </div>
              <div className="phase planned">
                <h3>Phase 3: Game Library 📋</h3>
                <p>Additional games: Connect Four, Dots and Boxes, Battleship</p>
              </div>
            </div>
          </section>

          <section className="contributing">
            <h2>Get Involved</h2>
            <p>
              Graph Paper Games is an open-source project welcoming contributions from developers 
              of all skill levels. Whether you want to implement a new game, improve the framework, 
              or enhance accessibility, there's a place for you!
            </p>
            <div className="contribution-links">
              <a href="https://github.com/GraphPaperGames" className="btn-primary" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
              <a href="https://github.com/GraphPaperGames/issues" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                Browse Issues
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
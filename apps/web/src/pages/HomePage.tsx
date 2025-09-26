import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="p-6 text-center">
        <h1 className="mb-6">Welcome to Graph Paper Games</h1>
        <p className="text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
          Play classic pen-and-paper games online with friends or challenge our AI opponents. 
          Built with modern web technology for smooth, responsive gameplay.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/demo" className="btn btn-primary">
            Try the Demo
          </Link>
          <Link to="/games" className="btn btn-secondary">
            Browse Games
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="p-6">
        <h2 className="text-center mb-6">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">🎮</div>
            <h3>Classic Games</h3>
            <p className="text-gray-600">
              Enjoy timeless pen-and-paper games like Dots and Boxes, Tic-Tac-Toe, 
              and Battleship with modern digital enhancements.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3>AI Opponents</h3>
            <p className="text-gray-600">
              Challenge AI opponents with adjustable difficulty levels, 
              from beginner-friendly to expert-level gameplay.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3>Multiplayer</h3>
            <p className="text-gray-600">
              Play with friends locally or online with real-time synchronization 
              and spectator mode support.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3>Customizable</h3>
            <p className="text-gray-600">
              Choose from multiple themes including paper texture and high-contrast 
              modes for accessibility.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3>Responsive</h3>
            <p className="text-gray-600">
              Optimized for desktop, tablet, and mobile devices with touch-friendly 
              controls and adaptive layouts.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3>Fast & Smooth</h3>
            <p className="text-gray-600">
              Built with performance in mind, featuring sub-150ms move rendering 
              and smooth animations.
            </p>
          </div>
        </div>
      </section>

      {/* Framework Showcase */}
      <section className="p-6 bg-white mx-6 rounded-lg shadow-sm">
        <h2 className="text-center mb-6">Powered by Our Custom Framework</h2>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 mb-4">
            Graph Paper Games is built on a custom TypeScript framework designed specifically 
            for turn-based grid games. Our framework provides:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Flexible grid rendering system</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Turn-based game management</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Event-driven architecture</span>
              </li>
            </ul>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Theme system with accessibility</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Comprehensive test coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>TypeScript strict mode</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <Link to="/demo" className="btn btn-primary">
              See the Framework in Action
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
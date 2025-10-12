import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="nav">
        <div className="container">
          <div className="flex justify-between items-center p-4">
            <Link to="/" className="nav-brand">
              Graph Paper Games
            </Link>

            <nav>
              <ul className="nav-links">
                <li>
                  <Link to="/" className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/demo" className={`nav-link ${isActiveRoute('/demo') ? 'active' : ''}`}>
                    Demo
                  </Link>
                </li>
                <li>
                  <Link
                    to="/games"
                    className={`nav-link ${isActiveRoute('/games') ? 'active' : ''}`}
                  >
                    Games
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`nav-link ${isActiveRoute('/about') ? 'active' : ''}`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container">
          <div className="p-4 text-center text-sm text-gray-600">
            © 2024 Graph Paper Games. Built with React, TypeScript, and our custom game framework.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

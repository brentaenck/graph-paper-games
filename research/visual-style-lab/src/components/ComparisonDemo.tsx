/**
 * @fileoverview ComparisonDemo - Side-by-side comparison of original vs enhanced framework
 *
 * This component demonstrates the improvements gained by migrating from the original
 * implementation to the enhanced dual design system framework.
 */

import React, { useState } from 'react';
import TicTacToeDemo from './TicTacToeDemo';
import TicTacToeFrameworkEnhanced from './TicTacToeFrameworkEnhanced';

type ViewMode = 'split' | 'original' | 'enhanced';
type ComparisonMetric = {
  metric: string;
  original: string;
  enhanced: string;
  improvement: string;
};

const ComparisonDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showMetrics, setShowMetrics] = useState(true);

  const comparisonMetrics: ComparisonMetric[] = [
    {
      metric: 'Visual Design',
      original: 'Basic HTML styling',
      enhanced: 'Dual design system with hand-drawn aesthetics',
      improvement: 'Professional, cohesive visual identity',
    },
    {
      metric: 'Animations',
      original: 'Static placement',
      enhanced: 'Real-time symbol drawing + progressive grid',
      improvement: 'Engaging, delightful user experience',
    },
    {
      metric: 'Pen Styles',
      original: 'Fixed appearance',
      enhanced: '4 dynamic styles (ballpoint, pencil, marker, fountain)',
      improvement: 'Customizable, tactile feel',
    },
    {
      metric: 'Layout System',
      original: 'Mixed UI/game elements',
      enhanced: 'Clean separation: Modern UI + Pure paper game',
      improvement: 'Better UX architecture',
    },
    {
      metric: 'Component Architecture',
      original: 'Monolithic component',
      enhanced: 'Modular framework (DualSystemProvider, GameSymbol, etc.)',
      improvement: 'Reusable, maintainable code',
    },
    {
      metric: 'Game Engine Integration',
      original: 'Basic state management',
      enhanced: 'Advanced state with animation tracking',
      improvement: 'Robust, extensible system',
    },
    {
      metric: 'Player Experience',
      original: 'Functional game',
      enhanced: 'Immersive, paper-like game experience',
      improvement: 'Memorable, engaging gameplay',
    },
    {
      metric: 'Developer Experience',
      original: 'Manual styling',
      enhanced: 'Framework-powered components',
      improvement: 'Faster development, consistent results',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="ui-card">
        <div className="ui-card-header">
          <div className="flex justify-between items-center">
            <h1 className="ui-card-title text-2xl">📊 Framework Comparison Demo</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('split')}
                className={`ui-button ui-button-sm ${viewMode === 'split' ? 'ui-button-primary' : 'ui-button-secondary'}`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`ui-button ui-button-sm ${viewMode === 'original' ? 'ui-button-primary' : 'ui-button-secondary'}`}
              >
                Original Only
              </button>
              <button
                onClick={() => setViewMode('enhanced')}
                className={`ui-button ui-button-sm ${viewMode === 'enhanced' ? 'ui-button-primary' : 'ui-button-secondary'}`}
              >
                Enhanced Only
              </button>
            </div>
          </div>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info">
            <strong>Phase 2 Complete:</strong> Compare the original tic-tac-toe implementation with
            the enhanced dual design system framework. Notice the improved animations, visual
            design, and architecture!
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="ui-button ui-button-secondary ui-button-sm"
            >
              {showMetrics ? '📊 Hide' : '📈 Show'} Improvement Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Improvement Metrics */}
      {showMetrics && (
        <div className="ui-card">
          <div className="ui-card-header">
            <h2 className="ui-card-title">🚀 Framework Improvements</h2>
          </div>
          <div className="ui-card-body">
            <div className="overflow-hidden">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ui-gray-200)' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        fontWeight: 600,
                        color: 'var(--ui-gray-700)',
                      }}
                    >
                      Metric
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        fontWeight: 600,
                        color: 'var(--ui-gray-700)',
                      }}
                    >
                      Original
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        fontWeight: 600,
                        color: 'var(--ui-gray-700)',
                      }}
                    >
                      Enhanced Framework
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        fontWeight: 600,
                        color: 'var(--ui-success)',
                      }}
                    >
                      Improvement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMetrics.map((metric, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--ui-gray-100)' }}>
                      <td style={{ padding: '12px', fontWeight: 500, color: 'var(--ui-gray-900)' }}>
                        {metric.metric}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          color: 'var(--ui-gray-600)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {metric.original}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          color: 'var(--ui-primary)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {metric.enhanced}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          color: 'var(--ui-success)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        ✅ {metric.improvement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="ui-card-title">🎮 Live Comparison</h2>
        </div>
        <div className="ui-card-body">
          {viewMode === 'split' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                minHeight: '800px',
              }}
            >
              {/* Original Implementation */}
              <div>
                <div className="mb-4">
                  <h3 className="ui-text font-medium mb-2">🔧 Original Implementation</h3>
                  <div className="ui-alert ui-alert-warning">
                    <small>Basic HTML styling, static gameplay, mixed UI architecture</small>
                  </div>
                </div>
                <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                  <TicTacToeDemo />
                </div>
              </div>

              {/* Enhanced Framework */}
              <div>
                <div className="mb-4">
                  <h3 className="ui-text font-medium mb-2">✨ Enhanced Framework</h3>
                  <div className="ui-alert ui-alert-success">
                    <small>Dual design system, animated symbols, modular architecture</small>
                  </div>
                </div>
                <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                  <TicTacToeFrameworkEnhanced />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'original' && (
            <div>
              <div className="mb-4">
                <div className="ui-alert ui-alert-warning">
                  <strong>Original Implementation:</strong> Basic functionality without framework
                  enhancements
                </div>
              </div>
              <TicTacToeDemo />
            </div>
          )}

          {viewMode === 'enhanced' && (
            <div>
              <div className="mb-4">
                <div className="ui-alert ui-alert-success">
                  <strong>Enhanced Framework:</strong> Full dual design system with animations and
                  modern architecture
                </div>
              </div>
              <TicTacToeFrameworkEnhanced />
            </div>
          )}
        </div>
      </div>

      {/* Technical Implementation Details */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="ui-card-title">⚙️ Technical Implementation</h2>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="ui-text font-medium mb-3">🔧 Original Architecture</h3>
              <div className="space-y-2">
                <div className="ui-text-sm">• Single monolithic component</div>
                <div className="ui-text-sm">• Basic CSS styling</div>
                <div className="ui-text-sm">• Static game rendering</div>
                <div className="ui-text-sm">• Mixed UI/game concerns</div>
                <div className="ui-text-sm">• Manual state management</div>
                <div className="ui-text-sm">• No animation system</div>
              </div>
            </div>

            <div>
              <h3 className="ui-text font-medium mb-3">✨ Framework Architecture</h3>
              <div className="space-y-2">
                <div className="ui-text-sm">
                  • <strong>DualSystemProvider:</strong> Theme and context management
                </div>
                <div className="ui-text-sm">
                  • <strong>TruePaperLayout:</strong> Separation of UI and game areas
                </div>
                <div className="ui-text-sm">
                  • <strong>GameSymbol:</strong> Animated symbol components
                </div>
                <div className="ui-text-sm">
                  • <strong>PlayerDisplay:</strong> Modern player management
                </div>
                <div className="ui-text-sm">
                  • <strong>useGameSymbolAnimation:</strong> Animation state hooks
                </div>
                <div className="ui-text-sm">
                  • <strong>Pen Style System:</strong> Dynamic visual theming
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="ui-text font-medium mb-3">🎯 Key Framework Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="ui-alert ui-alert-info">
                <strong>Developer Experience</strong>
                <br />
                <small>Modular components, consistent APIs, faster development</small>
              </div>
              <div className="ui-alert ui-alert-success">
                <strong>User Experience</strong>
                <br />
                <small>Smooth animations, tactile feel, engaging interactions</small>
              </div>
              <div className="ui-alert ui-alert-warning">
                <strong>Maintainability</strong>
                <br />
                <small>Reusable components, clear separation of concerns</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2 Summary */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="ui-card-title">🎉 Phase 2: Migration Complete</h2>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-success">
            <strong>✅ Phase 2 Successfully Completed!</strong> Your existing tic-tac-toe game has
            been successfully migrated to use the dual design system framework with enhanced
            animations, improved architecture, and professional visual design.
          </div>

          <div className="mt-4">
            <h3 className="ui-text font-medium mb-2">Next Steps:</h3>
            <div className="space-y-2">
              <div className="ui-text-sm">
                🚀 <strong>Phase 3:</strong> Migrate other games (Dots & Boxes, Connect Four, etc.)
              </div>
              <div className="ui-text-sm">
                📦 <strong>Framework Package:</strong> Extract components into @gpg/framework
              </div>
              <div className="ui-text-sm">
                🎨 <strong>Theme System:</strong> Expand pen styles and visual themes
              </div>
              <div className="ui-text-sm">
                📱 <strong>Mobile Optimization:</strong> Touch interactions and responsive design
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonDemo;

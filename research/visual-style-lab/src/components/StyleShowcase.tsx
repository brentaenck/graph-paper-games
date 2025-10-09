import React from 'react';

const StyleShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Typography Showcase */}
      <section className="sketch-border p-6 paper-texture">
        <h2 className="mb-4">Typography & Hand-drawn Text</h2>

        <div className="space-y-4">
          <div>
            <h3 className="handwritten">Handwritten Style (Kalam)</h3>
            <p className="handwritten">
              This is the primary handwritten font we can use for game text and UI elements. It
              feels natural and approachable, like someone actually wrote it by hand.
            </p>
          </div>

          <div>
            <h3 className="casual-text">Casual Style (Indie Flower)</h3>
            <p className="casual-text">
              This is a more casual, playful font that could work well for informal game elements or
              secondary text that needs to feel fun and relaxed.
            </p>
          </div>

          <div>
            <h3>Sketch Style (Caveat)</h3>
            <p style={{ fontFamily: 'var(--font-sketch)' }}>
              This sketchy font is great for headings and titles, giving that authentic hand-drawn
              appearance that looks like quick sketches in a notebook.
            </p>
          </div>

          <div>
            <p>
              Regular text with <span className="sketch-underline">sketch underlines</span> and
              <span className="doodle-arrow">doodle arrows</span> for emphasis.
            </p>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="sketch-border p-6">
        <h2 className="mb-4">Color Palette</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div
              className="w-full h-20 rounded"
              style={{ backgroundColor: 'var(--ink-blue)' }}
            ></div>
            <p className="mt-2 text-sm">Ink Blue</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-20 rounded"
              style={{ backgroundColor: 'var(--pencil-graphite)' }}
            ></div>
            <p className="mt-2 text-sm">Pencil Graphite</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-20 rounded"
              style={{ backgroundColor: 'var(--pencil-eraser)' }}
            ></div>
            <p className="mt-2 text-sm">Eraser Pink/Yellow</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-20 rounded"
              style={{ backgroundColor: 'var(--sketch-danger)' }}
            ></div>
            <p className="mt-2 text-sm">Red Ink</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="ink-color">Text in ink blue - great for primary content</p>
          <p className="pencil-color">Text in pencil graphite - softer, secondary text</p>
          <p className="eraser-color">Text in eraser yellow - for highlights and warnings</p>
        </div>
      </section>

      {/* Game Symbols */}
      <section className="sketch-border p-6 bg-white">
        <h2 className="mb-4">Hand-drawn Game Symbols</h2>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="hand-x text-6xl mb-2">×</div>
            <p>Hand-drawn X</p>
          </div>
          <div className="text-center">
            <div className="hand-o text-6xl mb-2">O</div>
            <p>Hand-drawn O</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-2xl">
          <div className="sketch-cell">
            <div className="hand-x">×</div>
          </div>
          <div className="sketch-cell">
            <div className="hand-o">O</div>
          </div>
          <div className="sketch-cell">
            <span className="handwritten pencil-color">?</span>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section className="sketch-border p-6">
        <h2 className="mb-4">Interactive Elements</h2>

        <div className="space-y-6">
          <div>
            <h3>Hand-drawn Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="sketch-button">Primary Button</button>
              <button
                className="sketch-button"
                style={{
                  background: 'var(--sketch-success)',
                  color: 'white',
                  borderColor: 'var(--sketch-success)',
                }}
              >
                Success Button
              </button>
              <button
                className="sketch-button"
                style={{
                  background: 'var(--sketch-danger)',
                  color: 'white',
                  borderColor: 'var(--sketch-danger)',
                }}
              >
                Danger Button
              </button>
            </div>
          </div>

          <div>
            <h3>Sketch Borders & Containers</h3>
            <div className="sketch-border p-4 mb-4">
              <p className="handwritten mb-0">
                This container has a hand-drawn border effect using CSS pseudo-elements to create
                multiple overlapping border lines with slight rotations.
              </p>
            </div>

            <div className="sketch-shadow p-4" style={{ background: 'var(--paper-white)' }}>
              <p className="handwritten mb-0">
                This container uses sketch-style shadows to create depth and dimension.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section className="sketch-border p-6">
        <h2 className="mb-4">Hand-drawn Animations</h2>

        <div className="text-center">
          <button
            className="sketch-button mb-4"
            onClick={e => {
              const target = e.currentTarget.nextElementSibling;
              if (target) {
                target.classList.remove('animate-hand-drawn');
                // Force reflow
                target.offsetHeight;
                target.classList.add('animate-hand-drawn');
              }
            }}
          >
            Trigger Hand-drawn Animation
          </button>

          <div
            className="sketch-border p-6 bg-white inline-block"
            style={{
              transformOrigin: 'center',
              minWidth: '200px',
            }}
          >
            <div className="hand-x text-4xl">×</div>
            <p className="handwritten mb-0">Animated Element</p>
          </div>
        </div>

        <p className="text-center mt-4 text-sm pencil-color">
          Click the button to see the hand-drawn appearance animation
        </p>
      </section>

      {/* Usage Notes */}
      <section className="notebook-lines notebook-margin p-6">
        <h2 className="mb-4">Design Notes</h2>

        <div className="space-y-4 handwritten">
          <p>
            ✓ The subtle rotations (-0.5deg to 1.5deg) give elements a natural, hand-placed feeling
            without being disorienting.
          </p>
          <p>
            ✓ Multiple border layers create authentic hand-drawn line variation. Each layer has
            different opacity and rotation.
          </p>
          <p>
            ✓ Google Fonts (Kalam, Indie Flower, Caveat) provide good hand-written aesthetics while
            maintaining readability.
          </p>
          <p>
            ✓ Color palette stays true to real pen/pencil colors: blue ink, graphite gray, eraser
            pink/yellow.
          </p>
          <p>⚠ Need to test readability on smaller screens and with accessibility tools.</p>
          <p>
            💡 Could enhance with subtle CSS animations for "drawing" effects when elements appear
            on screen.
          </p>
        </div>
      </section>
    </div>
  );
};

export default StyleShowcase;

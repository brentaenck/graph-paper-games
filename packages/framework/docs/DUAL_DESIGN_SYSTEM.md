# Dual Design System Documentation

## Overview

The Graph Paper Games Dual Design System provides a unique approach to game UI that combines **modern digital interfaces** with **authentic hand-drawn paper-and-pencil aesthetics**. This system enables developers to create games that feel both polished and nostalgic, maintaining clear separation between interface elements and game content.

## Core Philosophy

> **"The paper holds only the game, the interface surrounds the paper."**

The dual design system enforces a clear distinction:
- **Modern UI System**: Digital interface elements (buttons, scores, timers, menus)
- **Hand-drawn Paper System**: Game content that appears "drawn" on paper (game boards, pieces, symbols)

## Architecture

```
┌─────────────────────────────────────────┐
│ Modern UI - Header/Footer/Sidebar      │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │     Hand-drawn Paper Surface        │ │
│ │     (Game Board & Pieces Only)      │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ Modern UI - Controls/Status             │
└─────────────────────────────────────────┘
```

## Quick Start

### 1. Basic Setup

```tsx
import React from 'react';
import { 
  DualSystemProvider, 
  TruePaperLayout,
  PaperSheet,
  PlayerDisplay 
} from '@gpg/framework';

export const MyGame = () => (
  <DualSystemProvider>
    <TruePaperLayout>
      <header>
        <PlayerDisplay player={currentPlayer} isActive />
      </header>
      
      <main>
        <PaperSheet gameWidth={240} gameHeight={240}>
          {/* Hand-drawn game content goes here */}
        </PaperSheet>
      </main>
      
      <footer>
        {/* Modern UI controls go here */}
      </footer>
    </TruePaperLayout>
  </DualSystemProvider>
);
```

### 2. Add Hand-drawn Elements

```tsx
import { HandDrawnGrid, GameSymbol } from '@gpg/framework';

<PaperSheet gameWidth={240} gameHeight={240}>
  <HandDrawnGrid columns={3} rows={3} cellSize={60} />
  
  {gameState.board.map((cell, index) => (
    <GameSymbol 
      key={index}
      symbol={cell.symbol}
      cellPosition={index}
      animate
      autoStart
    />
  ))}
</PaperSheet>
```

## Core Components

### DualSystemProvider

The root context provider that manages theming, pen styles, and system boundaries.

```tsx
interface DualSystemProviderProps {
  children: React.ReactNode;
  initialPenStyle?: PenStyle;
  initialTheme?: UITheme;
  onPenStyleChange?: (penStyle: PenStyle) => void;
  onThemeChange?: (theme: UITheme) => void;
}

// Usage
<DualSystemProvider 
  initialPenStyle="pencil"
  initialTheme="light"
  onPenStyleChange={(style) => console.log('Pen changed to:', style)}
>
  {/* Your game components */}
</DualSystemProvider>
```

**Available Hooks:**
- `useDualSystem()` - Access full system state
- `useModernUI()` - Modern UI specific context
- `useHandDrawn()` - Hand-drawn specific context
- `useLayout()` - Layout and responsive utilities

### TruePaperLayout

Enforces the physical separation between modern UI and paper surfaces.

```tsx
interface TruePaperLayoutProps {
  children: React.ReactNode;
  variant?: 'header-footer' | 'sidebar' | 'minimal' | 'floating';
  className?: string;
  responsive?: boolean;
}

// Usage - Header/Footer Layout
<TruePaperLayout variant="header-footer">
  <header>Modern UI</header>
  <main>Paper Surface</main>
  <footer>Modern UI</footer>
</TruePaperLayout>

// Usage - Sidebar Layout
<TruePaperLayout variant="sidebar">
  <aside>Modern UI Sidebar</aside>
  <main>Paper Surface</main>
</TruePaperLayout>
```

### PaperSheet

Creates an authentic paper background with precise grid alignment for game content.

```tsx
interface PaperSheetProps {
  gameWidth: number;
  gameHeight: number;
  paperType?: PaperType;
  gridSize?: number;
  rotation?: number;
  className?: string;
  children: React.ReactNode;
}

// Usage
<PaperSheet 
  gameWidth={300} 
  gameHeight={300}
  paperType="graph"
  gridSize={20}
  rotation={-0.5}
>
  {/* Hand-drawn game content */}
</PaperSheet>
```

**Paper Types:**
- `graph` - Standard graph paper with blue lines
- `engineering` - Green engineering paper
- `notebook` - Ruled notebook paper
- `dot` - Dot grid paper

## Hand-drawn Components

### HandDrawnGrid

Animated grid lines that appear to be hand-drawn with various pen styles.

```tsx
interface HandDrawnGridProps {
  columns: number;
  rows: number;
  cellSize?: number;
  penStyle?: PenStyle;
  animate?: boolean;
  showImperfections?: boolean;
  winningLinePath?: string;
  onAnimationComplete?: () => void;
}

// Usage
<HandDrawnGrid 
  columns={3} 
  rows={3} 
  cellSize={60}
  penStyle="pencil"
  animate={true}
  showImperfections={true}
  onAnimationComplete={() => console.log('Grid drawn!')}
/>
```

### GameSymbol

Animated game symbols (X, O, dots, lines) with hand-drawn effects.

```tsx
interface GameSymbolProps {
  symbol: 'X' | 'O' | 'dot' | 'line' | 'ship';
  cellPosition: number;
  size?: number;
  penStyle?: PenStyle;
  animate?: boolean;
  autoStart?: boolean;
  onAnimationComplete?: () => void;
}

// Usage
<GameSymbol 
  symbol="X"
  cellPosition={4}
  size={40}
  penStyle="marker"
  animate
  autoStart
  onAnimationComplete={() => console.log('Symbol drawn!')}
/>
```

### WinningLine

Animated victory lines with hand-drawn effects.

```tsx
interface WinningLineProps {
  winningLine: WinningLineData | number[] | null;
  penStyle?: PenStyle;
  cellSize?: number;
  gridColumns?: number;
  animationDuration?: number;
  animationDelay?: number;
  color?: string;
  wobbleEffect?: boolean;
}

// Usage with cell indices
<WinningLine 
  winningLine={[0, 1, 2]} // Top row
  penStyle="marker"
  cellSize={60}
  gridColumns={3}
  color="#f59e0b"
/>

// Usage with coordinates
<WinningLine 
  winningLine={{
    start: { x: 0, y: 0 },
    end: { x: 2, y: 2 },
    type: 'diagonal'
  }}
  penStyle="fountain"
/>
```

## Modern UI Components

### PlayerDisplay

Modern UI component for displaying player information.

```tsx
interface PlayerDisplayProps {
  player: Player;
  isActive?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showScore?: boolean;
  showAvatar?: boolean;
  onClick?: (player: Player) => void;
}

// Usage
<PlayerDisplay 
  player={{
    id: 'player1',
    name: 'Alice',
    isAI: false,
    score: 150,
    isActive: true,
    color: '#3b82f6'
  }}
  isActive
  variant="detailed"
  showScore
  showAvatar
  onClick={(player) => console.log('Clicked:', player.name)}
/>
```

## Pen Styles

The system supports four distinct pen styles that affect all hand-drawn elements:

### Available Pen Styles

```tsx
type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain';
```

**Ballpoint** (`ballpoint`)
- Clean, consistent lines
- Medium opacity
- Minimal texture
- Best for: Clean, precise games

**Pencil** (`pencil`)
- Textured, slightly rough lines
- Variable opacity
- Graphite-like appearance
- Best for: Sketchy, draft-like games

**Marker** (`marker`)
- Bold, saturated lines
- High opacity
- Smooth texture
- Best for: Vibrant, bold games

**Fountain Pen** (`fountain`)
- Elegant, flowing lines
- Variable line width
- Ink-like texture
- Best for: Classic, sophisticated games

### Switching Pen Styles

```tsx
// Using the hook
const { penStyle, setPenStyle } = useDualSystem();

// Programmatically change pen style
setPenStyle('marker');

// Pen style selector component
<select value={penStyle} onChange={(e) => setPenStyle(e.target.value)}>
  <option value="ballpoint">Ballpoint Pen</option>
  <option value="pencil">Pencil</option>
  <option value="marker">Marker</option>
  <option value="fountain">Fountain Pen</option>
</select>
```

## System Boundaries & Type Safety

The dual design system includes runtime and compile-time enforcement to prevent mixing UI paradigms.

### Boundary Enforcement

```tsx
import { withModernUI, withHandDrawn } from '@gpg/framework';

// Automatically enforce modern UI boundaries
const SafeButton = withModernUI(MyButton, 'SafeButton');

// Automatically enforce hand-drawn boundaries  
const SafeSymbol = withHandDrawn(MySymbol, 'SafeSymbol');
```

### Type Safety

```tsx
// Components are automatically typed based on their boundary
interface ModernUIProps {
  theme?: UITheme;
  className?: string;
  accessible?: boolean;
}

interface HandDrawnProps {
  penStyle?: PenStyle;
  animate?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
  onPaper: true; // Enforces usage within PaperSheet
}
```

## Responsive Design

The system includes built-in responsive behavior:

```tsx
// Layout automatically adapts
<TruePaperLayout variant="header-footer" responsive>
  {/* Desktop: Header/Footer */}
  {/* Mobile: Stacked layout */}
</TruePaperLayout>

// Access responsive utilities
const { isDesktop, isMobile, isTablet } = useLayout();

// Conditional rendering
{isDesktop && <DetailedPlayerList />}
{isMobile && <CompactPlayerList />}
```

## Animation System

### Hand-drawn Animation Flow

1. **Grid Animation**: Lines appear to be drawn progressively
2. **Symbol Animation**: Game pieces animate in as they're drawn
3. **Victory Animation**: Winning lines highlight with special effects

```tsx
// Coordinated animation sequence
<HandDrawnGrid 
  animate
  onAnimationComplete={() => setGridReady(true)}
/>

{gridReady && gameState.moves.map((move, index) => (
  <GameSymbol 
    key={move.id}
    symbol={move.symbol}
    cellPosition={move.position}
    animate
    autoStart
  />
))}

{winner && (
  <WinningLine 
    winningLine={winningLine}
    animationDelay={0.5}
  />
)}
```

### Animation Events

```tsx
// Listen to animation events
const handleAnimationComplete = (type: string) => {
  switch(type) {
    case 'grid':
      enablePlayerInput();
      break;
    case 'symbol':
      processNextMove();
      break;
    case 'victory':
      showGameOverDialog();
      break;
  }
};
```

## Utility Functions

### Grid Calculations

```tsx
import { 
  useGridCell, 
  calculateGridAlignment,
  pixelToGrid,
  gridToPixel 
} from '@gpg/framework';

// Convert between coordinate systems
const cellIndex = pixelToGrid(x, y, cellSize, columns);
const {x: pixelX, y: pixelY} = gridToPixel(cellIndex, cellSize, columns);

// Ensure perfect grid alignment
const alignedSize = calculateGridAlignment(desiredSize, gridSize);
```

### Symbol Creation

```tsx
import { 
  createCustomSymbol,
  createTicTacToeGrid,
  generateWinningLinePath 
} from '@gpg/framework';

// Pre-configured grid for common games
const ticTacToeConfig = createTicTacToeGrid(60);

// Custom symbol factory
const CustomSymbol = createCustomSymbol({
  paths: ['M 10 10 L 30 30', 'M 30 10 L 10 30'],
  strokeWidth: 3,
  color: '#ff6b6b'
});
```

## Advanced Usage

### Custom Themes

```tsx
const customTheme: DualSystemTheme = {
  ui: {
    theme: 'dark',
    primaryColor: '#8b5cf6',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif'
  },
  handDrawn: {
    penStyle: 'fountain',
    enablePenSwitching: true,
    paperType: 'engineering',
    paperRotation: -1.2,
    gridSize: 20,
    showGridAnimation: true,
    symbolAnimationDuration: 0.8,
    gridAnimationDelay: [0.1, 0.3, 0.5, 0.7],
    showImperfections: true,
    roughnessIntensity: 0.8
  },
  layout: {
    type: 'sidebar',
    responsive: true
  }
};

<DualSystemProvider theme={customTheme}>
  {/* Your game */}
</DualSystemProvider>
```

### Performance Optimization

```tsx
// Lazy load heavy hand-drawn components
const HandDrawnGrid = React.lazy(() => import('./HandDrawnGrid'));

// Memoize expensive calculations
const GridMemo = React.memo(HandDrawnGrid, (prevProps, nextProps) => {
  return prevProps.columns === nextProps.columns &&
         prevProps.rows === nextProps.rows &&
         prevProps.penStyle === nextProps.penStyle;
});

// Debounce pen style changes
const debouncedPenStyleChange = useCallback(
  debounce((penStyle: PenStyle) => {
    setPenStyle(penStyle);
  }, 200),
  []
);
```

## Best Practices

### 1. Component Organization

```tsx
// ✅ Good: Clear separation
<DualSystemProvider>
  <TruePaperLayout>
    {/* Modern UI only */}
    <header>
      <PlayerDisplay player={player1} />
      <GameTimer />
      <SettingsButton />
    </header>
    
    {/* Hand-drawn only */}
    <main>
      <PaperSheet gameWidth={300} gameHeight={300}>
        <HandDrawnGrid columns={3} rows={3} />
        <GameSymbol symbol="X" cellPosition={4} />
      </PaperSheet>
    </main>
  </TruePaperLayout>
</DualSystemProvider>

// ❌ Bad: Mixed paradigms
<div>
  <Button>Modern button</Button>
  <HandDrawnGrid columns={3} rows={3} />  {/* Missing PaperSheet */}
</div>
```

### 2. Animation Coordination

```tsx
// ✅ Good: Coordinated sequence
const [phase, setPhase] = useState('drawing-grid');

<HandDrawnGrid 
  animate={phase === 'drawing-grid'}
  onAnimationComplete={() => setPhase('drawing-symbols')}
/>

{phase === 'drawing-symbols' && (
  <GameSymbol 
    symbol="X" 
    animate 
    autoStart
    onAnimationComplete={() => setPhase('ready')}
  />
)}
```

### 3. Responsive Considerations

```tsx
// ✅ Good: Responsive sizing
const { isMobile } = useLayout();

<PaperSheet 
  gameWidth={isMobile ? 240 : 360}
  gameHeight={isMobile ? 240 : 360}
>
  <HandDrawnGrid 
    columns={3} 
    rows={3} 
    cellSize={isMobile ? 60 : 80}
  />
</PaperSheet>
```

### 4. Accessibility

```tsx
// ✅ Good: Accessible modern UI
<PlayerDisplay 
  player={player}
  accessible
  aria-label={`Player ${player.name}, score: ${player.score}`}
/>

// ✅ Good: Semantic structure
<TruePaperLayout>
  <header role="banner">
    <h1>Tic Tac Toe</h1>
  </header>
  <main role="main" aria-label="Game board">
    <PaperSheet>
      {/* Game content */}
    </PaperSheet>
  </main>
  <footer role="contentinfo">
    {/* Game controls */}
  </footer>
</TruePaperLayout>
```

## Migration Guide

### From Legacy Components

```tsx
// Before: Mixed paradigm
<div className="game-container">
  <GridRenderer grid={grid} />
  <PlayerInfo player={player} />
</div>

// After: Dual system
<DualSystemProvider>
  <TruePaperLayout>
    <header>
      <PlayerDisplay player={player} />
    </header>
    <main>
      <PaperSheet gameWidth={300} gameHeight={300}>
        <HandDrawnGrid columns={3} rows={3} />
      </PaperSheet>
    </main>
  </TruePaperLayout>
</DualSystemProvider>
```

## Troubleshooting

### Common Issues

**1. Components not animating**
```tsx
// ❌ Problem: Missing animate prop
<GameSymbol symbol="X" cellPosition={0} />

// ✅ Solution: Enable animation
<GameSymbol symbol="X" cellPosition={0} animate autoStart />
```

**2. Hand-drawn components outside paper**
```tsx
// ❌ Problem: Boundary violation
<div>
  <HandDrawnGrid columns={3} rows={3} />
</div>

// ✅ Solution: Wrap in PaperSheet
<PaperSheet gameWidth={200} gameHeight={200}>
  <HandDrawnGrid columns={3} rows={3} />
</PaperSheet>
```

**3. Missing context provider**
```tsx
// ❌ Problem: No context
<GameSymbol symbol="X" cellPosition={0} />

// ✅ Solution: Wrap in provider
<DualSystemProvider>
  <PaperSheet gameWidth={200} gameHeight={200}>
    <GameSymbol symbol="X" cellPosition={0} />
  </PaperSheet>
</DualSystemProvider>
```

## Examples

See the `examples/` directory for complete game implementations:
- `examples/TicTacToe.tsx` - Complete tic-tac-toe with AI
- `examples/ConnectFour.tsx` - Drop-piece game mechanics
- `examples/Battleship.tsx` - Grid-based positioning game
- `examples/CustomGame.tsx` - Template for new games

## API Reference

For detailed API documentation, see:
- [`API_REFERENCE.md`](./API_REFERENCE.md) - Complete component APIs
- [`TYPES.md`](./TYPES.md) - TypeScript type definitions
- [`THEMING.md`](./THEMING.md) - Theming and customization guide
# Dual Design System API Reference

## Table of Contents

- [Core System](#core-system)
  - [DualSystemProvider](#dualsystemprovider)
  - [System Hooks](#system-hooks)
  - [System Boundaries](#system-boundaries)
- [Layout Components](#layout-components)
  - [TruePaperLayout](#truepaperlayout)
- [Modern UI Components](#modern-ui-components)
  - [PlayerDisplay](#playerdisplay)
- [Hand-drawn Components](#hand-drawn-components)
  - [PaperSheet](#papersheet)
  - [HandDrawnGrid](#handdrawnGrid)
  - [GameSymbol](#gamesymbol)
  - [WinningLine](#winningline)
- [Utility Functions](#utility-functions)
- [Types & Interfaces](#types--interfaces)

---

## Core System

### DualSystemProvider

**Root context provider for the dual design system.**

```tsx
interface DualSystemProviderProps {
  children: React.ReactNode;
  initialPenStyle?: PenStyle;
  initialTheme?: UITheme;
  onPenStyleChange?: (penStyle: PenStyle) => void;
  onThemeChange?: (theme: UITheme) => void;
}

const DualSystemProvider: React.FC<DualSystemProviderProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **Required** | Child components |
| `initialPenStyle` | `PenStyle` | `'ballpoint'` | Initial pen style for hand-drawn elements |
| `initialTheme` | `UITheme` | `'light'` | Initial theme for modern UI elements |
| `onPenStyleChange` | `(penStyle: PenStyle) => void` | `undefined` | Callback when pen style changes |
| `onThemeChange` | `(theme: UITheme) => void` | `undefined` | Callback when UI theme changes |

#### Example

```tsx
<DualSystemProvider
  initialPenStyle="pencil"
  initialTheme="light"
  onPenStyleChange={(style) => localStorage.setItem('penStyle', style)}
  onThemeChange={(theme) => localStorage.setItem('theme', theme)}
>
  <MyGame />
</DualSystemProvider>
```

---

### System Hooks

#### useDualSystem()

**Access the complete dual system state and controls.**

```tsx
interface DualSystemState {
  // Pen System
  penStyle: PenStyle;
  setPenStyle: (style: PenStyle) => void;
  
  // UI Theme System
  theme: UITheme;
  setTheme: (theme: UITheme) => void;
  
  // Combined Theme
  dualTheme: DualSystemTheme;
  
  // Animation State
  animationState: AnimationState;
  updateAnimationState: (updates: Partial<AnimationState>) => void;
}

const useDualSystem: () => DualSystemState
```

#### Example

```tsx
const MyComponent = () => {
  const { 
    penStyle, 
    setPenStyle, 
    theme, 
    setTheme,
    animationState 
  } = useDualSystem();
  
  return (
    <div>
      <select value={penStyle} onChange={(e) => setPenStyle(e.target.value)}>
        <option value="ballpoint">Ballpoint</option>
        <option value="pencil">Pencil</option>
        <option value="marker">Marker</option>
        <option value="fountain">Fountain</option>
      </select>
    </div>
  );
};
```

#### useModernUI()

**Access modern UI specific context.**

```tsx
interface ModernUIState {
  theme: UITheme;
  config: {
    borderRadius: string;
    primaryColor: string;
    fontFamily: string;
  };
  responsive: {
    isDesktop: boolean;
    isTablet: boolean;
    isMobile: boolean;
  };
}

const useModernUI: () => ModernUIState
```

#### useHandDrawn()

**Access hand-drawn system context.**

```tsx
interface HandDrawnState {
  penStyle: PenStyle;
  config: {
    paperType: PaperType;
    showAnimations: boolean;
    showImperfections: boolean;
  };
  animationState: AnimationState;
  updateAnimationState: (updates: Partial<AnimationState>) => void;
}

const useHandDrawn: () => HandDrawnState
```

#### useLayout()

**Access layout and responsive utilities.**

```tsx
interface LayoutState {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  orientation: 'portrait' | 'landscape';
}

const useLayout: () => LayoutState
```

---

### System Boundaries

#### withModernUI()

**Higher-order component that enforces modern UI boundaries.**

```tsx
const withModernUI: <P extends ModernUIProps>(
  Component: React.ComponentType<P>,
  displayName: string
) => React.ComponentType<P>
```

#### Example

```tsx
const MyButton = ({ className, children, ...props }) => (
  <button className={`modern-button ${className}`} {...props}>
    {children}
  </button>
);

const SafeButton = withModernUI(MyButton, 'SafeButton');
```

#### withHandDrawn()

**Higher-order component that enforces hand-drawn boundaries.**

```tsx
const withHandDrawn: <P extends HandDrawnProps>(
  Component: React.ComponentType<P>,
  displayName: string
) => React.ComponentType<P>
```

#### Example

```tsx
const MySymbol = ({ penStyle, onPaper, ...props }) => (
  <svg {...props}>
    {/* Hand-drawn symbol implementation */}
  </svg>
);

const SafeSymbol = withHandDrawn(MySymbol, 'SafeSymbol');
```

---

## Layout Components

### TruePaperLayout

**Layout component that enforces physical separation between modern UI and paper surfaces.**

```tsx
interface TruePaperLayoutProps {
  children: React.ReactNode;
  variant?: 'header-footer' | 'sidebar' | 'minimal' | 'floating';
  responsive?: boolean;
  className?: string;
}

const TruePaperLayout: React.FC<TruePaperLayoutProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **Required** | Child components (header, main, footer, aside) |
| `variant` | `'header-footer' \| 'sidebar' \| 'minimal' \| 'floating'` | `'header-footer'` | Layout pattern |
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `className` | `string` | `''` | Additional CSS classes |

#### Variants

**header-footer**
```tsx
<TruePaperLayout variant="header-footer">
  <header>Modern UI controls</header>
  <main>Paper surface with game</main>
  <footer>Additional controls</footer>
</TruePaperLayout>
```

**sidebar**
```tsx
<TruePaperLayout variant="sidebar">
  <aside>Modern UI sidebar</aside>
  <main>Paper surface with game</main>
</TruePaperLayout>
```

**minimal**
```tsx
<TruePaperLayout variant="minimal">
  <main>Paper surface with game</main>
</TruePaperLayout>
```

**floating**
```tsx
<TruePaperLayout variant="floating">
  <main>Paper surface with game</main>
  <div className="floating-controls">Overlay controls</div>
</TruePaperLayout>
```

---

## Modern UI Components

### PlayerDisplay

**Component for displaying player information in modern UI style.**

```tsx
interface PlayerDisplayProps extends ModernUIProps {
  player: Player;
  isActive?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showScore?: boolean;
  showAvatar?: boolean;
  onClick?: (player: Player) => void;
}

const PlayerDisplay: React.FC<PlayerDisplayProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `player` | `Player` | **Required** | Player object with id, name, score, etc. |
| `isActive` | `boolean` | `false` | Whether this player's turn is active |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Display style |
| `showScore` | `boolean` | `true` | Whether to show player score |
| `showAvatar` | `boolean` | `true` | Whether to show player avatar |
| `onClick` | `(player: Player) => void` | `undefined` | Click handler |
| `theme` | `UITheme` | `undefined` | Override theme |
| `className` | `string` | `''` | Additional CSS classes |
| `accessible` | `boolean` | `true` | Enable accessibility features |

#### Example

```tsx
<PlayerDisplay
  player={{
    id: 'player1',
    name: 'Alice',
    score: 150,
    isAI: false,
    isActive: true,
    color: '#3b82f6'
  }}
  isActive
  variant="detailed"
  showScore
  showAvatar
  onClick={(player) => console.log('Player clicked:', player)}
/>
```

---

## Hand-drawn Components

### PaperSheet

**Creates an authentic paper background with precise grid alignment.**

```tsx
interface PaperSheetProps extends HandDrawnProps {
  gameWidth: number;
  gameHeight: number;
  paperType?: PaperType;
  gridSize?: number;
  rotation?: number;
  children: React.ReactNode;
}

const PaperSheet: React.FC<PaperSheetProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gameWidth` | `number` | **Required** | Width of the game content area (px) |
| `gameHeight` | `number` | **Required** | Height of the game content area (px) |
| `paperType` | `PaperType` | `'graph'` | Type of paper background |
| `gridSize` | `number` | `20` | Size of background grid (px) |
| `rotation` | `number` | `-0.5` | Paper rotation angle (degrees) |
| `children` | `React.ReactNode` | **Required** | Hand-drawn game content |
| `penStyle` | `PenStyle` | `undefined` | Override pen style |
| `animate` | `boolean` | `false` | Enable paper entrance animation |
| `onAnimationComplete` | `() => void` | `undefined` | Animation complete callback |
| `className` | `string` | `''` | Additional CSS classes |
| `onPaper` | `true` | **Required** | Boundary enforcement marker |

#### Paper Types

- `graph` - Standard blue graph paper
- `engineering` - Green engineering paper  
- `notebook` - Ruled notebook paper
- `dot` - Dot grid paper

#### Example

```tsx
<PaperSheet
  gameWidth={320}
  gameHeight={320}
  paperType="graph"
  gridSize={20}
  rotation={-0.8}
>
  <HandDrawnGrid columns={3} rows={3} />
  <GameSymbol symbol="X" cellPosition={4} />
</PaperSheet>
```

---

### HandDrawnGrid

**Animated grid lines with hand-drawn aesthetics.**

```tsx
interface HandDrawnGridProps extends HandDrawnProps {
  columns: number;
  rows: number;
  cellSize?: number;
  showAnimation?: boolean;
  animationDelays?: number[];
  showImperfections?: boolean;
  lineVariations?: GridLineVariation[];
  winningLinePath?: string;
  width?: number;
  height?: number;
}

const HandDrawnGrid: React.FC<HandDrawnGridProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number` | **Required** | Number of grid columns |
| `rows` | `number` | **Required** | Number of grid rows |
| `cellSize` | `number` | `60` | Size of each cell (px) |
| `showAnimation` | `boolean` | `true` | Enable grid drawing animation |
| `animationDelays` | `number[]` | `[0.1, 0.3, 0.5, 0.7]` | Animation delays for each line |
| `showImperfections` | `boolean` | `true` | Show hand-drawn imperfections |
| `lineVariations` | `GridLineVariation[]` | `undefined` | Custom line variation data |
| `winningLinePath` | `string` | `undefined` | SVG path for winning line |
| `width` | `number` | `columns * cellSize` | Override grid width |
| `height` | `number` | `rows * cellSize` | Override grid height |
| `penStyle` | `PenStyle` | `undefined` | Override pen style |
| `animate` | `boolean` | `true` | Enable animations |
| `onAnimationComplete` | `() => void` | `undefined` | Animation complete callback |
| `className` | `string` | `''` | Additional CSS classes |
| `onPaper` | `true` | **Required** | Boundary enforcement marker |

#### Example

```tsx
<HandDrawnGrid
  columns={3}
  rows={3}
  cellSize={80}
  showAnimation
  showImperfections
  animationDelays={[0.2, 0.4, 0.6, 0.8]}
  onAnimationComplete={() => console.log('Grid drawn!')}
/>
```

#### Utility Functions

```tsx
// Pre-configured grid for tic-tac-toe
const createTicTacToeGrid: (cellSize?: number) => HandDrawnGridProps

// Pre-configured grid for chess/checkers
const createChessGrid: (cellSize?: number) => HandDrawnGridProps

// Custom grid configuration
const createCustomGrid: (
  columns: number,
  rows: number,
  options?: Partial<HandDrawnGridProps>
) => HandDrawnGridProps
```

---

### GameSymbol

**Animated game symbols with hand-drawn effects.**

```tsx
interface GameSymbolProps extends HandDrawnProps {
  symbol: 'X' | 'O' | 'dot' | 'line' | 'ship';
  cellPosition: number;
  size?: number;
  autoStart?: boolean;
  delay?: number;
}

const GameSymbol: React.FC<GameSymbolProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `symbol` | `'X' \| 'O' \| 'dot' \| 'line' \| 'ship'` | **Required** | Symbol type to draw |
| `cellPosition` | `number` | **Required** | Grid cell position (0-based index) |
| `size` | `number` | `40` | Symbol size (px) |
| `autoStart` | `boolean` | `false` | Start animation automatically |
| `delay` | `number` | `0` | Animation delay (seconds) |
| `penStyle` | `PenStyle` | `undefined` | Override pen style |
| `animate` | `boolean` | `true` | Enable drawing animation |
| `onAnimationComplete` | `() => void` | `undefined` | Animation complete callback |
| `className` | `string` | `''` | Additional CSS classes |
| `onPaper` | `true` | **Required** | Boundary enforcement marker |

#### Symbol Types

- `X` - Tic-tac-toe X symbol
- `O` - Tic-tac-toe O symbol  
- `dot` - Single dot (for games like Go)
- `line` - Line segment (for line-drawing games)
- `ship` - Ship shape (for Battleship)

#### Example

```tsx
<GameSymbol
  symbol="X"
  cellPosition={4}
  size={50}
  autoStart
  delay={0.3}
  onAnimationComplete={() => console.log('Symbol drawn!')}
/>
```

#### Utility Components

```tsx
// Pre-configured symbols
const XSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>>
const OSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>>
const DotSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>>
const LineSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>>
const ShipSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>>

// Custom symbol factory
const createCustomSymbol: (config: CustomSymbolConfig) => React.FC<GameSymbolProps>
```

---

### WinningLine

**Animated victory lines with hand-drawn effects.**

```tsx
interface WinningLineProps extends HandDrawnProps {
  winningLine: WinningLineData | number[] | null;
  cellSize?: number;
  gridColumns?: number;
  animationDuration?: number;
  animationDelay?: number;
  color?: string;
  strokeWidth?: number;
  wobbleEffect?: boolean;
  containerWidth?: number;
  containerHeight?: number;
}

const WinningLine: React.FC<WinningLineProps>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `winningLine` | `WinningLineData \| number[] \| null` | **Required** | Winning line configuration |
| `cellSize` | `number` | `60` | Size of grid cells (px) |
| `gridColumns` | `number` | `3` | Number of grid columns |
| `animationDuration` | `number` | `0.8` | Animation duration (seconds) |
| `animationDelay` | `number` | `0.3` | Animation delay (seconds) |
| `color` | `string` | `'#f59e0b'` | Line color (CSS color) |
| `strokeWidth` | `number` | `undefined` | Override stroke width |
| `wobbleEffect` | `boolean` | `true` | Enable hand-drawn wobble |
| `containerWidth` | `number` | `gridColumns * cellSize` | Container width |
| `containerHeight` | `number` | `gridColumns * cellSize` | Container height |
| `penStyle` | `PenStyle` | `'marker'` | Override pen style |
| `animate` | `boolean` | `true` | Enable drawing animation |
| `onAnimationComplete` | `() => void` | `undefined` | Animation complete callback |
| `className` | `string` | `''` | Additional CSS classes |
| `onPaper` | `true` | **Required** | Boundary enforcement marker |

#### WinningLineData Interface

```tsx
interface WinningLineData {
  start: { x: number; y: number };
  end: { x: number; y: number };
  type?: 'horizontal' | 'vertical' | 'diagonal';
  cells?: number[];
}
```

#### Example

```tsx
// Using cell indices (e.g., top row of tic-tac-toe)
<WinningLine
  winningLine={[0, 1, 2]}
  cellSize={80}
  gridColumns={3}
  color="#f59e0b"
  animationDelay={0.5}
/>

// Using coordinate data
<WinningLine
  winningLine={{
    start: { x: 0, y: 0 },
    end: { x: 2, y: 2 },
    type: 'diagonal'
  }}
  cellSize={80}
/>
```

#### Utility Functions

```tsx
// Generate winning line for tic-tac-toe
const generateTicTacToeWinningLine: (
  winningCells: number[],
  cellSize?: number
) => WinningLineData

// Create custom winning line
const createWinningLine: (
  startX: number,
  startY: number,
  endX: number,
  endY: number
) => WinningLineData

// Pre-configured component for tic-tac-toe
const TicTacToeWinningLine: React.FC<Omit<WinningLineProps, 'gridColumns' | 'cellSize'>>
```

---

## Utility Functions

### Grid Utilities

```tsx
// Calculate perfect grid alignment
const calculateGridAlignment: (desiredSize: number, gridSize: number) => number

// Convert pixel coordinates to grid cell
const pixelToGrid: (
  x: number,
  y: number,
  cellSize: number,
  columns: number
) => number

// Convert grid cell to pixel coordinates
const gridToPixel: (
  cellIndex: number,
  cellSize: number,
  columns: number
) => { x: number; y: number }

// Hook for grid cell utilities
const useGridCell: (cellSize: number, gridColumns: number) => {
  pixelToCell: (x: number, y: number) => number;
  cellToPixel: (cellIndex: number) => { x: number; y: number };
  getCellBounds: (cellIndex: number) => DOMRect;
}
```

### Animation Utilities

```tsx
// Hook for coordinating symbol animations
const useGameSymbolAnimation: (symbols: GameSymbol[]) => {
  isAnimating: boolean;
  animatedSymbols: Set<string>;
  triggerAnimation: (symbolId: string) => void;
  onAnimationComplete: (symbolId: string) => void;
}
```

---

## Types & Interfaces

### Core Types

```tsx
// Pen styles for hand-drawn elements
type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain'

// Modern UI themes
type UITheme = 'light' | 'dark' | 'system'

// Paper types for backgrounds
type PaperType = 'graph' | 'engineering' | 'notebook' | 'dot'
```

### Theme Interfaces

```tsx
interface DualSystemTheme {
  ui: {
    theme: UITheme;
    primaryColor: string;
    borderRadius: string;
    fontFamily: string;
  };
  handDrawn: HandDrawnGridTheme;
  layout: {
    type: 'header-footer' | 'sidebar' | 'floating' | 'minimal';
    responsive: boolean;
  };
}

interface HandDrawnGridTheme {
  penStyle: PenStyle;
  enablePenSwitching: boolean;
  paperType: PaperType;
  paperRotation: number;
  gridSize: number;
  showGridAnimation: boolean;
  symbolAnimationDuration: number;
  gridAnimationDelay: readonly number[];
  showImperfections: boolean;
  roughnessIntensity: number;
}
```

### Component Props

```tsx
// Base props for Modern UI components
interface ModernUIProps {
  theme?: UITheme;
  className?: string;
  accessible?: boolean;
}

// Base props for Hand-drawn components
interface HandDrawnProps {
  penStyle?: PenStyle;
  animate?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
  onPaper: true; // Enforces usage within PaperSheet
}

// Animation state for hand-drawn elements
interface AnimationState {
  animatingCells: ReadonlySet<string>;
  drawnCells: ReadonlySet<string>;
  gridAnimationComplete: boolean;
}
```

### Grid System Types

```tsx
interface GridLineVariation {
  path: string;
  strokeWidth?: number;
  delay?: number;
  dashArray?: number;
}

interface CustomSymbolConfig {
  paths: string[];
  strokeWidth: number;
  color: string;
  animationDuration?: number;
  viewBox?: string;
}
```

---

## Error Handling

### Boundary Violations

```tsx
// Runtime errors for boundary violations
class BoundaryViolationError extends Error {
  constructor(componentName: string, expectedBoundary: string) {
    super(`Component ${componentName} violates ${expectedBoundary} boundary`);
  }
}

// Type-safe boundary checkers
const isModernUIComponent: (component: React.ComponentType) => boolean
const isHandDrawnComponent: (component: React.ComponentType) => boolean

// Runtime validation
const validateModernUI: (props: any) => ValidationResult
const validateHandDrawn: (props: any) => ValidationResult
```

### Context Errors

```tsx
// Errors when components are used outside required context
class ContextError extends Error {
  constructor(hookName: string, providerName: string) {
    super(`${hookName} must be used within a ${providerName}`);
  }
}
```

---

## Performance Optimization

### Component Memoization

```tsx
// All framework components are memoized by default
const HandDrawnGrid = React.memo(HandDrawnGridComponent)
const GameSymbol = React.memo(GameSymbolComponent)
const PlayerDisplay = React.memo(PlayerDisplayComponent)
```

### Animation Performance

```tsx
// Use requestAnimationFrame for smooth animations
// Debounce expensive operations
// Lazy load heavy components
// Use CSS transforms instead of changing layout properties
```

---

This API reference provides complete documentation for all components, hooks, and utilities in the dual design system. For integration examples and best practices, see the [Integration Guide](./INTEGRATION_GUIDE.md).
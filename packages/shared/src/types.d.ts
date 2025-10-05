/**
 * @fileoverview Core types and interfaces for the Graph Paper Games framework
 */
/**
 * Standardized coordinate system for all grid-based games
 */
export interface GridCoordinate {
    readonly x: number;
    readonly y: number;
}
/**
 * Supported grid types for different games
 */
export type GridType = 'square' | 'hexagonal' | 'triangular';
/**
 * Cell state representation
 */
export type CellState = 'empty' | 'occupied' | 'highlighted' | 'disabled';
/**
 * Grid cell with coordinate and state information
 */
export interface GridCell {
    readonly coordinate: GridCoordinate;
    readonly state: CellState;
    readonly owner?: string;
    readonly metadata?: Record<string, unknown>;
}
/**
 * Grid configuration and structure
 */
export interface Grid {
    readonly width: number;
    readonly height: number;
    readonly cells: readonly (readonly GridCell[])[];
    readonly type: GridType;
}
/**
 * Player identification and reference
 */
export interface PlayerRef {
    readonly id: string;
    readonly name: string;
    readonly color?: string;
    readonly avatar?: string;
}
/**
 * Player with extended information
 */
export interface Player extends PlayerRef {
    readonly isAI: boolean;
    readonly difficulty?: number;
    readonly score: number;
    readonly isActive: boolean;
}
/**
 * Player score information
 */
export interface PlayerScore {
    readonly playerId: string;
    readonly score: number;
    readonly rank: number;
}
/**
 * Scoreboard for game results
 */
export interface Scoreboard {
    readonly players: readonly PlayerScore[];
    readonly winner?: string;
    readonly isDraw: boolean;
}
/**
 * Base move interface - extended by specific games
 */
export interface Move {
    readonly id: string;
    readonly playerId: string;
    readonly timestamp: Date;
    readonly type: string;
    readonly data: Record<string, unknown>;
}
/**
 * Move validation result
 */
export interface ValidationResult {
    readonly isValid: boolean;
    readonly error?: string;
    readonly code?: string;
}
/**
 * Game state interface
 */
export interface GameState {
    readonly id: string;
    readonly currentPlayer: number;
    readonly players: readonly Player[];
    readonly grid?: Grid;
    readonly moves: readonly Move[];
    readonly turnNumber: number;
    readonly metadata: Record<string, unknown>;
}
/**
 * Game over result
 */
export interface GameOver {
    readonly isGameOver: true;
    readonly winner?: string;
    readonly reason: 'victory' | 'draw' | 'forfeit' | 'timeout';
    readonly finalScores: Scoreboard;
}
/**
 * Game settings and configuration
 */
export interface GameSettings {
    readonly gameType: string;
    readonly playerCount: number;
    readonly timeLimit?: number;
    readonly enableAI: boolean;
    readonly difficulty?: number;
    readonly gridSize?: {
        readonly width: number;
        readonly height: number;
    };
    readonly customRules?: Record<string, unknown>;
}
/**
 * Game capabilities and metadata
 */
export interface GameCapabilities {
    readonly grid: GridType;
    readonly minPlayers: number;
    readonly maxPlayers: number;
    readonly supportsAI: boolean;
    readonly supportsOnline: boolean;
    readonly supportsLocal: boolean;
    readonly estimatedDuration: number;
}
/**
 * AI difficulty levels (1-6)
 */
export type AIDifficulty = 1 | 2 | 3 | 4 | 5 | 6;
/**
 * AI hint for training mode
 */
export interface Hint {
    readonly suggestion: Move;
    readonly explanation: string;
    readonly confidence: number;
}
/**
 * AI move evaluation
 */
export interface MoveEvaluation {
    readonly move: Move;
    readonly score: number;
    readonly depth: number;
    readonly principalVariation?: readonly Move[];
}
/**
 * Base event interface
 */
export interface GameEvent {
    readonly type: string;
    readonly timestamp: Date;
    readonly data: Record<string, unknown>;
}
/**
 * Event listener function
 */
export type EventListener<T extends GameEvent = GameEvent> = (event: T) => void;
/**
 * Game-specific error types
 */
export type GameErrorCode = 'INVALID_MOVE' | 'GAME_OVER' | 'NOT_YOUR_TURN' | 'PLAYER_NOT_FOUND' | 'INVALID_GAME_STATE' | 'NETWORK_ERROR' | 'AI_ERROR' | 'TIMEOUT';
/**
 * Game error with context
 */
export interface GameError {
    readonly code: GameErrorCode;
    readonly message: string;
    readonly context?: Record<string, unknown>;
}
/**
 * Success result
 */
export interface Ok<T> {
    readonly success: true;
    readonly data: T;
}
/**
 * Error result
 */
export interface Err<E = GameError> {
    readonly success: false;
    readonly error: E;
}
/**
 * Result type for error handling
 */
export type Result<T, E = GameError> = Ok<T> | Err<E>;
/**
 * Pen styles for hand-drawn elements
 */
export type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain';
/**
 * Pen style configuration
 */
export interface PenStyleConfig {
    readonly stroke: string;
    readonly strokeWidth: string;
    readonly opacity: string;
    readonly filter: string;
    readonly name: string;
}
/**
 * Modern UI theme options
 */
export type UITheme = 'light' | 'dark' | 'system';
/**
 * Paper types for different game aesthetics
 */
export type PaperType = 'graph' | 'engineering' | 'notebook' | 'dot';
/**
 * Hand-drawn grid theme extending base GridTheme
 */
export interface HandDrawnGridTheme {
    readonly penStyle: PenStyle;
    readonly enablePenSwitching: boolean;
    readonly paperType: PaperType;
    readonly paperRotation: number;
    readonly gridSize: number;
    readonly showGridAnimation: boolean;
    readonly symbolAnimationDuration: number;
    readonly gridAnimationDelay: readonly number[];
    readonly showImperfections: boolean;
    readonly roughnessIntensity: number;
}
/**
 * Dual system theme combining modern UI and hand-drawn themes
 */
export interface DualSystemTheme {
    readonly ui: {
        readonly theme: UITheme;
        readonly primaryColor: string;
        readonly borderRadius: string;
        readonly fontFamily: string;
    };
    readonly handDrawn: HandDrawnGridTheme;
    readonly layout: {
        readonly type: 'header-footer' | 'sidebar' | 'floating' | 'minimal';
        readonly responsive: boolean;
    };
}
/**
 * Base props for Modern UI components
 */
export interface ModernUIProps {
    readonly theme?: UITheme;
    readonly className?: string;
    readonly accessible?: boolean;
}
/**
 * Base props for Hand-drawn components
 */
export interface HandDrawnProps {
    readonly penStyle?: PenStyle;
    readonly animate?: boolean;
    readonly onAnimationComplete?: () => void;
    readonly className?: string;
    readonly onPaper: true;
}
/**
 * Animation state for hand-drawn elements
 */
export interface AnimationState {
    readonly animatingCells: ReadonlySet<string>;
    readonly drawnCells: ReadonlySet<string>;
    readonly gridAnimationComplete: boolean;
}
/**
 * Enhanced grid theme that can support both canvas and SVG rendering
 */
export interface GridTheme {
    readonly renderer: 'canvas' | 'svg' | 'hybrid';
    readonly cellSize: number;
    readonly borderColor: string;
    readonly backgroundColor: string;
    readonly highlightColor: string;
    readonly handDrawn?: HandDrawnGridTheme;
}
/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
/**
 * Extract keys of T that are of type U
 */
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

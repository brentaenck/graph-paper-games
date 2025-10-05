/**
 * @fileoverview GameSymbol - Universal animated symbol renderer for game pieces
 * 
 * This component renders game symbols (X, O, dots, ships, etc.) with authentic
 * hand-drawn effects and animated drawing. Supports any game piece with SVG paths.
 * Extracted from the visual-style-lab TicTacToeDemo component.
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { useHandDrawn } from '../dual-system/DualSystemProvider';
import { withHandDrawn } from '../dual-system/SystemBoundary';
import type { HandDrawnProps, PenStyle } from '@gpg/shared';

// ============================================================================
// Component Interface
// ============================================================================

interface GameSymbolProps extends HandDrawnProps {
  /** The symbol type - can be predefined or custom */
  symbol: 'X' | 'O' | 'dot' | 'line' | 'ship' | 'custom';
  
  /** Custom SVG content for the symbol (required if symbol="custom") */
  customSymbol?: ReactNode;
  
  /** Symbol size in pixels */
  size?: number;
  
  /** Symbol rotation in degrees */
  rotation?: number;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Animation delay in milliseconds */
  animationDelay?: number;
  
  /** Symbol color override (defaults to pen style color) */
  color?: string;
  
  /** Symbol stroke width override */
  strokeWidth?: number;
  
  /** Whether the symbol should start animation immediately */
  autoStart?: boolean;
  
  /** Callback when drawing animation starts */
  onAnimationStart?: () => void;
  
  /** Cell position for rotation variations */
  cellPosition?: number;
}

// ============================================================================
// Pen Style Configurations (same as HandDrawnGrid)
// ============================================================================

const getPenStyleProps = (penStyle: PenStyle) => {
  switch (penStyle) {
    case 'pencil':
      return {
        stroke: '#374151',
        strokeWidth: '2.5',
        opacity: '0.8',
        filter: 'url(#pencilTexture)'
      };
    case 'marker':
      return {
        stroke: '#1e40af',
        strokeWidth: '3.5',
        opacity: '0.85',
        filter: 'url(#markerTexture)'
      };
    case 'fountain':
      return {
        stroke: '#1e3a8a',
        strokeWidth: '2',
        opacity: '0.9',
        filter: 'url(#fountainTexture)'
      };
    default: // ballpoint
      return {
        stroke: 'var(--sketch-primary)',
        strokeWidth: '2',
        opacity: '1',
        filter: 'url(#roughPaper)'
      };
  }
};

// ============================================================================
// Predefined Symbol Definitions
// ============================================================================

interface SymbolPath {
  path?: string;
  circle?: { cx: number; cy: number; r: number };
  paths?: string[]; // For multi-stroke symbols like X
  dashArray: number;
  delay?: number; // For multiple strokes
}

const getSymbolDefinition = (symbol: GameSymbolProps['symbol'], size: number): SymbolPath[] => {
  const center = size / 2;
  const offset = size * 0.2; // 20% margin
  
  switch (symbol) {
    case 'X':
      return [
        {
          path: `M ${offset} ${offset} L ${size - offset} ${size - offset}`,
          dashArray: Math.sqrt(2) * (size - 2 * offset),
          delay: 0
        },
        {
          path: `M ${size - offset} ${offset} L ${offset} ${size - offset}`,
          dashArray: Math.sqrt(2) * (size - 2 * offset),
          delay: 0.3
        }
      ];
      
    case 'O':
      return [
        {
          circle: { cx: center, cy: center, r: center - offset },
          dashArray: 2 * Math.PI * (center - offset),
          delay: 0
        }
      ];
      
    case 'dot':
      return [
        {
          circle: { cx: center, cy: center, r: size * 0.1 },
          dashArray: 2 * Math.PI * (size * 0.1),
          delay: 0
        }
      ];
      
    case 'line':
      return [
        {
          path: `M ${offset} ${center} L ${size - offset} ${center}`,
          dashArray: size - 2 * offset,
          delay: 0
        }
      ];
      
    case 'ship':
      // Simple ship outline
      return [
        {
          path: `M ${offset} ${center} L ${center} ${offset} L ${size - offset} ${center} L ${center} ${size - offset} Z`,
          dashArray: 4 * (size - 2 * offset),
          delay: 0
        }
      ];
      
    default:
      return [];
  }
};

// ============================================================================
// Cell Variation Utility
// ============================================================================

const getCellVariation = (cellPosition: number = 0): number => {
  // Create slight variations in rotation for each cell to feel more hand-drawn
  const rotations = [-1.5, 0.8, -0.3, 1.2, -0.7, 0.5, -1.1, 0.9, -0.4];
  return rotations[cellPosition % rotations.length] || 0;
};

// ============================================================================
// Main Component
// ============================================================================

const GameSymbolComponent: React.FC<GameSymbolProps> = ({
  symbol,
  customSymbol,
  size = 40,
  rotation = 0,
  animationDuration = 600,
  animationDelay = 0,
  color,
  strokeWidth,
  autoStart = true,
  onAnimationStart,
  onAnimationComplete,
  cellPosition = 0,
  onPaper: _, // Required by HandDrawnProps - unused
  penStyle: propPenStyle,
  animate = true,
  className = ''
}) => {
  const { penStyle: contextPenStyle, config } = useHandDrawn();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(!animate);
  
  // Use prop pen style or fall back to context
  const actualPenStyle = propPenStyle || contextPenStyle;
  const actualAnimate = animate && config.showGridAnimation;
  
  // Get pen style properties
  const penStyleProps = getPenStyleProps(actualPenStyle);
  const finalStroke = color || penStyleProps.stroke;
  const finalStrokeWidth = strokeWidth || penStyleProps.strokeWidth;
  
  // Get symbol definition
  const symbolDefinitions = symbol === 'custom' ? [] : getSymbolDefinition(symbol, size);
  
  // Calculate rotation with cell variation
  const cellVariation = getCellVariation(cellPosition);
  const finalRotation = rotation + (cellVariation * 0.8);
  
  // Animation effect
  useEffect(() => {
    if (actualAnimate && autoStart && !isVisible) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setIsVisible(true);
        if (onAnimationStart) onAnimationStart();
        
        // Complete animation after duration
        setTimeout(() => {
          setIsAnimating(false);
          if (onAnimationComplete) onAnimationComplete();
        }, animationDuration + 200);
        
      }, animationDelay);
      
      return () => clearTimeout(timer);
    }
  }, [actualAnimate, autoStart, isVisible, animationDelay, animationDuration, onAnimationStart, onAnimationComplete]);
  
  
  // Reset when animate prop changes
  useEffect(() => {
    if (actualAnimate) {
      setIsVisible(false);
      setIsAnimating(false);
    } else {
      setIsVisible(true);
    }
  }, [actualAnimate]);
  
  return (
    <div
      className={`game-symbol game-symbol-${symbol} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${finalRotation}deg)`,
        transition: 'transform 0.3s ease-out'
      }}
      data-symbol={symbol}
      data-pen-style={actualPenStyle}
      data-animating={isAnimating}
    >
      {/* Include SVG filters */}
      <PenStyleFilters />
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Custom symbol */}
        {symbol === 'custom' && customSymbol}
        
        {/* Predefined symbols */}
        {symbolDefinitions.map((def, index) => (
          <g key={`symbol-part-${index}`}>
            {def.path && (
              <path
                d={def.path}
                stroke={finalStroke}
                strokeWidth={finalStrokeWidth}
                fill="none"
                strokeLinecap="round"
                opacity={penStyleProps.opacity}
                filter={penStyleProps.filter}
                style={{
                  strokeDasharray: def.dashArray,
                  strokeDashoffset: isVisible ? '0' : def.dashArray,
                  transition: actualAnimate 
                    ? `stroke-dashoffset ${animationDuration / 1000}s ease-out ${(def.delay || 0)}s`
                    : 'none'
                }}
              />
            )}
            
            {def.circle && (
              <circle
                cx={def.circle.cx}
                cy={def.circle.cy}
                r={def.circle.r}
                stroke={finalStroke}
                strokeWidth={finalStrokeWidth}
                fill="none"
                strokeLinecap="round"
                opacity={penStyleProps.opacity}
                filter={penStyleProps.filter}
                style={{
                  strokeDasharray: def.dashArray,
                  strokeDashoffset: isVisible ? '0' : def.dashArray,
                  transition: actualAnimate 
                    ? `stroke-dashoffset ${animationDuration / 1000}s ease-out ${(def.delay || 0)}s`
                    : 'none'
                }}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// Predefined Symbol Components
// ============================================================================

/**
 * Animated X symbol for tic-tac-toe
 */
export const XSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>> = (props) => (
  <GameSymbol symbol="X" {...props} />
);

/**
 * Animated O symbol for tic-tac-toe
 */
export const OSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>> = (props) => (
  <GameSymbol symbol="O" {...props} />
);

/**
 * Dot symbol for dots-and-boxes or other games
 */
export const DotSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>> = (props) => (
  <GameSymbol symbol="dot" size={8} {...props} />
);

/**
 * Line symbol for connecting dots or other games
 */
export const LineSymbol: React.FC<Omit<GameSymbolProps, 'symbol'> & { 
  direction?: 'horizontal' | 'vertical' 
}> = ({ direction = 'horizontal', rotation = 0, ...props }) => (
  <GameSymbol 
    symbol="line" 
    rotation={direction === 'vertical' ? 90 + rotation : rotation}
    {...props} 
  />
);

/**
 * Ship symbol for battleship
 */
export const ShipSymbol: React.FC<Omit<GameSymbolProps, 'symbol'>> = (props) => (
  <GameSymbol symbol="ship" size={60} {...props} />
);

// ============================================================================
// Custom Symbol Helper
// ============================================================================

/**
 * Create a custom symbol with SVG paths
 */
export const createCustomSymbol = (
  paths: string[],
  options?: {
    size?: number;
    strokeWidth?: number;
    animationDurations?: number[];
  }
): React.FC<Omit<GameSymbolProps, 'symbol' | 'customSymbol'>> => {
  return (props) => {
    const size = options?.size || 40;
    const strokeWidth = options?.strokeWidth || 2;
    
    const customSVG = (
      <g>
        {paths.map((path, index) => {
          const pathLength = path.length * 2; // Rough estimate
          return (
            <path
              key={`custom-path-${index}`}
              d={path}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: '0', // Will be controlled by GameSymbol
                transition: `stroke-dashoffset ${(options?.animationDurations?.[index] || 600) / 1000}s ease-out ${index * 0.2}s`
              }}
            />
          );
        })}
      </g>
    );
    
    return (
      <GameSymbol
        symbol="custom"
        customSymbol={customSVG}
        size={size}
        {...props}
      />
    );
  };
};

// ============================================================================
// Enhanced SVG Filter Definitions
// ============================================================================

/**
 * SVG filters for realistic pen effects
 */
export const PenStyleFilters: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
    <defs>
      <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
      </filter>
      <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2"/>
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2"/>
        <feGaussianBlur stdDeviation="0.3"/>
      </filter>
      <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
        <feGaussianBlur stdDeviation="0.2" result="blur"/>
        <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3"/>
        <feDisplacementMap in="blur" in2="texture" scale="0.3"/>
      </filter>
      <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4"/>
        <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6"/>
      </filter>
    </defs>
  </svg>
);

// ============================================================================
// Enhanced Animation Hook
// ============================================================================

/**
 * Enhanced hook for managing symbol animations with pen-specific timing
 */
export const useGameSymbolAnimation = (isVisible: boolean, penStyle: PenStyle) => {
  const [animationState, setAnimationState] = useState<'idle' | 'drawing' | 'complete'>('idle');
  
  useEffect(() => {
    if (isVisible && animationState === 'idle') {
      setAnimationState('drawing');
      const duration = penStyle === 'marker' ? 800 : penStyle === 'fountain' ? 600 : 500;
      setTimeout(() => setAnimationState('complete'), duration);
    }
  }, [isVisible, penStyle, animationState]);
  
  return animationState;
};

/**
 * Hook for managing game-wide symbol animations
 */
export const useGameAnimations = () => {
  const { animationState, updateAnimationState } = useHandDrawn();
  
  const addSymbol = (cellId: string, delay: number = 50) => {
    setTimeout(() => {
      updateAnimationState({
        animatingCells: new Set([...animationState.animatingCells, cellId])
      });
    }, delay);
    
    setTimeout(() => {
      const newAnimating = new Set(animationState.animatingCells);
      newAnimating.delete(cellId);
      const newDrawn = new Set([...animationState.drawnCells, cellId]);
      
      updateAnimationState({
        animatingCells: newAnimating,
        drawnCells: newDrawn
      });
    }, delay + 1200);
  };
  
  const clearSymbols = () => {
    updateAnimationState({
      animatingCells: new Set(),
      drawnCells: new Set()
    });
  };
  
  return {
    animatingCells: animationState.animatingCells,
    drawnCells: animationState.drawnCells,
    addSymbol,
    clearSymbols,
    isAnimating: (cellId: string) => animationState.animatingCells.has(cellId),
    isDrawn: (cellId: string) => animationState.drawnCells.has(cellId)
  };
};

// ============================================================================
// Export
// ============================================================================

// Wrap with boundary enforcement
export const GameSymbol = withHandDrawn(GameSymbolComponent, 'GameSymbol');

export default GameSymbol;
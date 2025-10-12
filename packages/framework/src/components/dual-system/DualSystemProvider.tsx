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

/**
 * @fileoverview DualSystemProvider - Core provider for the dual design system
 *
 * This component manages the state for both the modern UI system and the
 * hand-drawn paper system, ensuring they work together seamlessly while
 * maintaining clear boundaries.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { DualSystemTheme, UITheme, PenStyle, PaperType, AnimationState } from '@gpg/shared';

// ============================================================================
// Context Interfaces
// ============================================================================

interface DualSystemContextValue {
  // Modern UI System
  uiTheme: UITheme;
  setUITheme: (theme: UITheme) => void;

  // Hand-drawn System
  penStyle: PenStyle;
  setPenStyle: (style: PenStyle) => void;
  paperType: PaperType;
  setPaperType: (type: PaperType) => void;

  // Animation System
  animationState: AnimationState;
  updateAnimationState: (update: Partial<AnimationState>) => void;

  // System Configuration
  theme: DualSystemTheme;
  setTheme: (theme: Partial<DualSystemTheme>) => void;

  // System Boundaries
  isPaperContext: boolean;
  setIsPaperContext: (inPaper: boolean) => void;
}

interface DualSystemProviderProps {
  children: ReactNode;
  initialTheme?: Partial<DualSystemTheme>;
  enableAnimations?: boolean;
  enablePenSwitching?: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_THEME: DualSystemTheme = {
  ui: {
    theme: 'light',
    primaryColor: '#3b82f6',
    borderRadius: '0.375rem',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  handDrawn: {
    penStyle: 'ballpoint',
    enablePenSwitching: true,
    paperType: 'graph',
    paperRotation: -0.3,
    gridSize: 20,
    showGridAnimation: true,
    symbolAnimationDuration: 1200,
    gridAnimationDelay: [0, 100, 200, 300, 400, 500, 600, 700, 800],
    showImperfections: true,
    roughnessIntensity: 0.3,
  },
  layout: {
    type: 'header-footer',
    responsive: true,
  },
};

const DEFAULT_ANIMATION_STATE: AnimationState = {
  animatingCells: new Set(),
  drawnCells: new Set(),
  gridAnimationComplete: false,
};

// ============================================================================
// Context Creation
// ============================================================================

const DualSystemContext = createContext<DualSystemContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export const DualSystemProvider: React.FC<DualSystemProviderProps> = ({
  children,
  initialTheme = {},
  enableAnimations = true,
  enablePenSwitching = true,
}) => {
  // Merge initial theme with defaults
  const [theme, setThemeState] = useState<DualSystemTheme>({
    ...DEFAULT_THEME,
    ...initialTheme,
    ui: { ...DEFAULT_THEME.ui, ...initialTheme.ui },
    handDrawn: {
      ...DEFAULT_THEME.handDrawn,
      ...initialTheme.handDrawn,
      enablePenSwitching,
    },
    layout: { ...DEFAULT_THEME.layout, ...initialTheme.layout },
  });

  // Individual system states
  const [uiTheme, setUITheme] = useState<UITheme>(theme.ui.theme);
  const [penStyle, setPenStyle] = useState<PenStyle>(theme.handDrawn.penStyle);
  const [paperType, setPaperType] = useState<PaperType>(theme.handDrawn.paperType);

  // Animation state
  const [animationState, setAnimationState] = useState<AnimationState>(DEFAULT_ANIMATION_STATE);

  // System boundaries
  const [isPaperContext, setIsPaperContext] = useState(false);

  // Theme update handler
  const setTheme = (update: Partial<DualSystemTheme>) => {
    setThemeState(prev => ({
      ...prev,
      ...update,
      ui: { ...prev.ui, ...update.ui },
      handDrawn: { ...prev.handDrawn, ...update.handDrawn },
      layout: { ...prev.layout, ...update.layout },
    }));
  };

  // Animation state update handler
  const updateAnimationState = (update: Partial<AnimationState>) => {
    setAnimationState(prev => ({
      ...prev,
      ...update,
      // Handle Set objects properly
      animatingCells: update.animatingCells ?? prev.animatingCells,
      drawnCells: update.drawnCells ?? prev.drawnCells,
    }));
  };

  // Context value
  const contextValue: DualSystemContextValue = {
    // Modern UI System
    uiTheme,
    setUITheme: newTheme => {
      setUITheme(newTheme);
      setTheme({ ui: { ...theme.ui, theme: newTheme } });
    },

    // Hand-drawn System
    penStyle,
    setPenStyle: newStyle => {
      if (!theme.handDrawn.enablePenSwitching) return;
      setPenStyle(newStyle);
      setTheme({ handDrawn: { ...theme.handDrawn, penStyle: newStyle } });
    },

    paperType,
    setPaperType: newType => {
      setPaperType(newType);
      setTheme({ handDrawn: { ...theme.handDrawn, paperType: newType } });
    },

    // Animation System
    animationState,
    updateAnimationState: enableAnimations ? updateAnimationState : () => {},

    // System Configuration
    theme,
    setTheme,

    // System Boundaries
    isPaperContext,
    setIsPaperContext,
  };

  return (
    <DualSystemContext.Provider value={contextValue}>
      <div
        className={`dual-system-root ui-theme-${uiTheme} paper-pen-${penStyle}`}
        data-ui-theme={uiTheme}
        data-pen-style={penStyle}
        data-paper-type={paperType}
        data-layout-type={theme.layout.type}
        data-animations-enabled={enableAnimations}
      >
        {children}
      </div>
    </DualSystemContext.Provider>
  );
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access the dual system context
 */
export const useDualSystem = (): DualSystemContextValue => {
  const context = useContext(DualSystemContext);
  if (!context) {
    throw new Error('useDualSystem must be used within a DualSystemProvider');
  }
  return context;
};

/**
 * Hook specifically for modern UI components
 */
export const useModernUI = () => {
  const { uiTheme, setUITheme, theme, isPaperContext } = useDualSystem();

  // Warn if trying to use UI components in paper context
  if (isPaperContext) {
    console.warn('Modern UI components should not be used within PaperSheet context');
  }

  return {
    theme: uiTheme,
    setTheme: setUITheme,
    config: theme.ui,
    responsive: theme.layout.responsive,
  };
};

/**
 * Hook specifically for hand-drawn components
 */
export const useHandDrawn = () => {
  const {
    penStyle,
    setPenStyle,
    paperType,
    setPaperType,
    animationState,
    updateAnimationState,
    theme,
    isPaperContext,
  } = useDualSystem();

  // Warn if trying to use hand-drawn components outside paper context
  if (!isPaperContext) {
    console.warn('Hand-drawn components should only be used within PaperSheet context');
  }

  return {
    penStyle,
    setPenStyle,
    paperType,
    setPaperType,
    animationState,
    updateAnimationState,
    config: theme.handDrawn,
    canSwitchPen: theme.handDrawn.enablePenSwitching,
  };
};

/**
 * Hook for layout components
 */
export const useLayout = () => {
  const { theme, setTheme } = useDualSystem();

  return {
    layoutType: theme.layout.type,
    setLayoutType: (type: DualSystemTheme['layout']['type']) => {
      setTheme({ layout: { ...theme.layout, type } });
    },
    responsive: theme.layout.responsive,
    setResponsive: (responsive: boolean) => {
      setTheme({ layout: { ...theme.layout, responsive } });
    },
  };
};

export default DualSystemProvider;
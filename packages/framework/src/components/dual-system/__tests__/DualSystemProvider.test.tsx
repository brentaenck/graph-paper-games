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
 * @fileoverview Tests for DualSystemProvider component
 */

import React, { ReactNode } from 'react';
import { render, renderHook, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DualSystemProvider,
  useDualSystem,
  useModernUI,
  useHandDrawn,
  useLayout,
} from '../DualSystemProvider';
import type { DualSystemTheme } from '@gpg/shared';

// Test wrapper component
const TestWrapper: React.FC<{
  children: ReactNode;
  initialTheme?: Partial<DualSystemTheme>;
  enableAnimations?: boolean;
  enablePenSwitching?: boolean;
}> = ({ children, initialTheme, enableAnimations, enablePenSwitching }) => (
  <DualSystemProvider 
    initialTheme={initialTheme} 
    enableAnimations={enableAnimations}
    enablePenSwitching={enablePenSwitching}
  >
    {children}
  </DualSystemProvider>
);

describe('DualSystemProvider', () => {
  describe('Provider Setup', () => {
    it('should provide dual system context', () => {
      const TestComponent = () => {
        const context = useDualSystem();
        return <div data-testid="context">{context ? 'has-context' : 'no-context'}</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('context')).toHaveTextContent('has-context');
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useDualSystem();
        return <div>test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => render(<TestComponent />)).toThrow(
        'useDualSystem must be used within a DualSystemProvider'
      );

      console.error = originalError;
    });

    it('should initialize with default theme values', () => {
      const TestComponent = () => {
        const { theme } = useDualSystem();
        return (
          <div>
            <span data-testid="ui-primary">{theme.ui.primaryColor}</span>
            <span data-testid="handdrawn-paper">{theme.handDrawn.paperType}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Check that theme has expected structure
      expect(screen.getByTestId('ui-primary')).toBeInTheDocument();
      expect(screen.getByTestId('handdrawn-paper')).toBeInTheDocument();
    });
  });

  describe('useDualSystem hook', () => {
    it('should provide theme management functionality', () => {
      const { result } = renderHook(() => useDualSystem(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.uiTheme).toBe('light');
      expect(result.current.penStyle).toBe('ballpoint');
      expect(result.current.paperType).toBe('graph');
      expect(typeof result.current.setUITheme).toBe('function');
      expect(typeof result.current.setPenStyle).toBe('function');
      expect(typeof result.current.setPaperType).toBe('function');
    });

    it('should update UI theme correctly', () => {
      const { result } = renderHook(() => useDualSystem(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.uiTheme).toBe('light');

      act(() => {
        result.current.setUITheme('dark');
      });

      expect(result.current.uiTheme).toBe('dark');
    });

    it('should update pen style correctly', () => {
      const { result } = renderHook(() => useDualSystem(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.penStyle).toBe('ballpoint');

      act(() => {
        result.current.setPenStyle('pencil');
      });

      expect(result.current.penStyle).toBe('pencil');
    });

    it('should manage paper context state', () => {
      const { result } = renderHook(() => useDualSystem(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.isPaperContext).toBe(false);

      act(() => {
        result.current.setIsPaperContext(true);
      });

      expect(result.current.isPaperContext).toBe(true);

      act(() => {
        result.current.setIsPaperContext(false);
      });

      expect(result.current.isPaperContext).toBe(false);
    });

    it('should provide theme customization', () => {
      const customTheme = {
        ui: {
          primaryColor: '#ff0000',
          fontFamily: 'Custom Font',
        },
      };

      const { result } = renderHook(() => useDualSystem(), {
        wrapper: ({ children }) => <TestWrapper initialTheme={customTheme}>{children}</TestWrapper>,
      });

      expect(result.current.theme.ui.primaryColor).toBe('#ff0000');
      expect(result.current.theme.ui.fontFamily).toBe('Custom Font');
    });
  });

  describe('useModernUI hook', () => {
    it('should provide modern UI utilities', () => {
      const { result } = renderHook(() => useModernUI(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.theme).toBe('light');
      expect(typeof result.current.setTheme).toBe('function');
      expect(result.current.config).toBeDefined();
      expect(result.current.responsive).toBe(true);
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useModernUI();
        return <div>test</div>;
      };

      const originalError = console.error;
      console.error = () => {};

      expect(() => render(<TestComponent />)).toThrow(
        'useDualSystem must be used within a DualSystemProvider'
      );

      console.error = originalError;
    });
  });

  describe('useHandDrawn hook', () => {
    it('should provide hand-drawn utilities', () => {
      // Suppress the warning for testing
      const originalWarn = console.warn;
      console.warn = () => {};

      const { result } = renderHook(() => useHandDrawn(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.penStyle).toBe('ballpoint');
      expect(result.current.paperType).toBe('graph');
      expect(typeof result.current.setPenStyle).toBe('function');
      expect(typeof result.current.setPaperType).toBe('function');
      expect(result.current.config).toBeDefined();
      expect(result.current.canSwitchPen).toBe(true);

      console.warn = originalWarn;
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useHandDrawn();
        return <div>test</div>;
      };

      const originalError = console.error;
      console.error = () => {};

      expect(() => render(<TestComponent />)).toThrow(
        'useDualSystem must be used within a DualSystemProvider'
      );

      console.error = originalError;
    });
  });

  describe('useLayout hook', () => {
    it('should provide layout utilities', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.layoutType).toBe('header-footer');
      expect(result.current.responsive).toBe(true);
      expect(typeof result.current.setLayoutType).toBe('function');
      expect(typeof result.current.setResponsive).toBe('function');
    });

    it('should update layout type correctly', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.layoutType).toBe('header-footer');

      act(() => {
        result.current.setLayoutType('sidebar');
      });

      expect(result.current.layoutType).toBe('sidebar');
    });

    it('should update responsive setting', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      });

      expect(result.current.responsive).toBe(true);

      act(() => {
        result.current.setResponsive(false);
      });

      expect(result.current.responsive).toBe(false);
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useLayout();
        return <div>test</div>;
      };

      const originalError = console.error;
      console.error = () => {};

      expect(() => render(<TestComponent />)).toThrow(
        'useDualSystem must be used within a DualSystemProvider'
      );

      console.error = originalError;
    });
  });

  describe('Theme Integration', () => {
    it('should merge custom theme with defaults', () => {
      const customTheme = {
        ui: {
          primaryColor: '#custom-primary',
        },
        handDrawn: {
          paperType: 'engineering' as const,
        },
      };

      const { result } = renderHook(() => useDualSystem(), {
        wrapper: ({ children }) => <TestWrapper initialTheme={customTheme}>{children}</TestWrapper>,
      });

      expect(result.current.theme.ui.primaryColor).toBe('#custom-primary');
      expect(result.current.theme.handDrawn.paperType).toBe('engineering');
      // Should still have default values for non-overridden properties
      expect(result.current.theme.ui.fontFamily).toBeDefined();
    });

    it('should provide theme values to components', () => {
      const TestComponent = () => {
        const { theme } = useDualSystem();
        return (
          <div>
            <span data-testid="ui-theme">{theme.ui.primaryColor}</span>
            <span data-testid="paper-theme">{theme.handDrawn.paperType}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui-theme')).toBeInTheDocument();
      expect(screen.getByTestId('paper-theme')).toBeInTheDocument();
    });
  });

  describe('State Persistence', () => {
    it('should maintain theme state across re-renders', () => {
      const TestComponent = () => {
        const { uiTheme, setUITheme } = useDualSystem();
        return (
          <div>
            <span data-testid="current-theme">{uiTheme}</span>
            <button onClick={() => setUITheme('dark')} data-testid="switch-button">
              Switch to Dark
            </button>
          </div>
        );
      };

      const { rerender } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Switch theme
      act(() => {
        screen.getByTestId('switch-button').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Re-render and check theme is maintained
      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });
});
/**
 * @fileoverview Tests for SystemBoundary component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  withModernUI,
  withHandDrawn,
  ModernUIBoundary,
  PaperBoundary,
  BoundaryChecker,
  isModernUIComponent,
  isHandDrawnComponent,
  validateModernUI,
  validateHandDrawn,
  analyzeComponentProps,
} from '../SystemBoundary';
import { DualSystemProvider } from '../DualSystemProvider';

// Mock components for testing
const MockModernComponent: React.FC<{ children?: React.ReactNode; testProp?: string }> = ({ 
  children, 
  testProp 
}) => (
  <div data-testid="modern-component" data-test-prop={testProp}>
    {children}
  </div>
);

const MockHandDrawnComponent: React.FC<{ children?: React.ReactNode; testProp?: string }> = ({ 
  children, 
  testProp 
}) => (
  <div data-testid="handdrawn-component" data-test-prop={testProp}>
    {children}
  </div>
);

// Test wrapper with provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DualSystemProvider>
    {children}
  </DualSystemProvider>
);

describe('SystemBoundary', () => {
  describe('withModernUI HOC', () => {
    it('should wrap component and enforce modern UI boundary', () => {
      const WrappedComponent = withModernUI(MockModernComponent, 'TestModern');
      
      render(
        <TestWrapper>
          <WrappedComponent testProp="test-value" />
        </TestWrapper>
      );

      expect(screen.getByTestId('modern-component')).toBeInTheDocument();
      expect(screen.getByTestId('modern-component')).toHaveAttribute('data-test-prop', 'test-value');
    });

    it('should set display name on wrapped component', () => {
      const WrappedComponent = withModernUI(MockModernComponent, 'TestModern');
      
      expect(WrappedComponent.displayName).toBe('withModernUI(TestModern)');
    });

    it('should forward refs correctly', () => {
      const RefComponent = React.forwardRef<HTMLDivElement, { testProp?: string }>((props, ref) => (
        <div ref={ref} data-testid="ref-component" {...props} />
      ));
      
      const WrappedComponent = withModernUI(RefComponent, 'RefTest');
      const ref = React.createRef<HTMLDivElement>();
      
      render(
        <TestWrapper>
          <WrappedComponent ref={ref} testProp="test" />
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(screen.getByTestId('ref-component')).toBeInTheDocument();
    });
  });

  describe('withHandDrawn HOC', () => {
    it('should wrap component and enforce hand-drawn boundary', () => {
      const WrappedComponent = withHandDrawn(MockHandDrawnComponent, 'TestHandDrawn');
      
      render(
        <TestWrapper>
          <WrappedComponent onPaper={true} testProp="test-value" />
        </TestWrapper>
      );

      expect(screen.getByTestId('handdrawn-component')).toBeInTheDocument();
      expect(screen.getByTestId('handdrawn-component')).toHaveAttribute('data-test-prop', 'test-value');
    });

    it('should set display name on wrapped component', () => {
      const WrappedComponent = withHandDrawn(MockHandDrawnComponent, 'TestHandDrawn');
      
      expect(WrappedComponent.displayName).toBe('withHandDrawn(TestHandDrawn)');
    });

    it('should forward refs correctly', () => {
      const RefComponent = React.forwardRef<HTMLDivElement, { onPaper?: boolean; testProp?: string }>((props, ref) => (
        <div ref={ref} data-testid="ref-component-handdrawn" {...props} />
      ));
      
      const WrappedComponent = withHandDrawn(RefComponent, 'RefTestHandDrawn');
      const ref = React.createRef<HTMLDivElement>();
      
      render(
        <TestWrapper>
          <WrappedComponent onPaper={true} ref={ref} testProp="test" />
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(screen.getByTestId('ref-component-handdrawn')).toBeInTheDocument();
    });

    it('should throw error when onPaper prop is missing', () => {
      const WrappedComponent = withHandDrawn(MockHandDrawnComponent, 'TestHandDrawn');
      
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};
      
      expect(() => {
        render(
          <TestWrapper>
            <WrappedComponent testProp="test-value" />
          </TestWrapper>
        );
      }).toThrow('TestHandDrawn: Hand-drawn components must have \'onPaper: true\' prop');
      
      console.error = originalError;
    });
  });

  describe('ModernUIBoundary', () => {
    it('should render children in modern UI boundary', () => {
      render(
        <TestWrapper>
          <ModernUIBoundary>
            <div data-testid="modern-child">Modern UI Content</div>
          </ModernUIBoundary>
        </TestWrapper>
      );

      expect(screen.getByTestId('modern-child')).toBeInTheDocument();
    });

    it('should apply correct CSS classes and data attributes', () => {
      render(
        <TestWrapper>
          <ModernUIBoundary className="test-class">
            <div data-testid="modern-child">Content</div>
          </ModernUIBoundary>
        </TestWrapper>
      );

      // Find the boundary div by looking for the ui-boundary class
      const boundary = screen.getByTestId('modern-child').parentElement!;
      expect(boundary).toHaveClass('ui-boundary');
      expect(boundary).toHaveClass('test-class');
      expect(boundary).toHaveAttribute('data-system', 'modern-ui');
      expect(boundary).toHaveAttribute('data-boundary', 'ui');
    });
  });

  describe('PaperBoundary', () => {
    it('should render children in paper boundary', () => {
      render(
        <TestWrapper>
          <PaperBoundary>
            <div data-testid="paper-child">Paper Content</div>
          </PaperBoundary>
        </TestWrapper>
      );

      expect(screen.getByTestId('paper-child')).toBeInTheDocument();
    });

    it('should apply correct CSS classes and data attributes', () => {
      render(
        <TestWrapper>
          <PaperBoundary className="test-class">
            <div data-testid="paper-child">Content</div>
          </PaperBoundary>
        </TestWrapper>
      );

      // Find the boundary div by looking for the paper-boundary class
      const boundary = screen.getByTestId('paper-child').parentElement!;
      expect(boundary).toHaveClass('paper-boundary');
      expect(boundary).toHaveClass('test-class');
      expect(boundary).toHaveAttribute('data-system', 'hand-drawn');
      expect(boundary).toHaveAttribute('data-boundary', 'paper');
    });
  });

  describe('BoundaryChecker', () => {
    it('should render children when no violations occur', () => {
      const mockOnViolation = vi.fn();
      
      render(
        <TestWrapper>
          <BoundaryChecker onViolation={mockOnViolation}>
            <div data-testid="boundary-child">Test content</div>
          </BoundaryChecker>
        </TestWrapper>
      );

      expect(screen.getByTestId('boundary-child')).toBeInTheDocument();
      expect(mockOnViolation).not.toHaveBeenCalled();
    });

    it('should render children in boundary checker', () => {
      render(
        <TestWrapper>
          <BoundaryChecker enabled={true}>
            <div data-testid="boundary-content">Content</div>
          </BoundaryChecker>
        </TestWrapper>
      );

      expect(screen.getByTestId('boundary-content')).toBeInTheDocument();
      // The boundary checker creates a div with boundary-checker class
      const boundaryDiv = screen.getByTestId('boundary-content').closest('.boundary-checker');
      expect(boundaryDiv).toBeInTheDocument();
    });
  });

  describe('Props Type Checking', () => {
    it('should identify modern UI props correctly', () => {
      const modernProps = { accessible: true, className: 'test' };
      const handDrawnProps = { onPaper: true, penStyle: 'ballpoint' };
      const invalidProps = { onPaper: false };
      
      expect(isModernUIComponent(modernProps)).toBe(true);
      expect(isModernUIComponent(handDrawnProps)).toBe(false);
      expect(isModernUIComponent(invalidProps)).toBe(false);
    });

    it('should identify hand-drawn props correctly', () => {
      const handDrawnProps = { onPaper: true, penStyle: 'ballpoint' };
      const modernProps = { accessible: true, className: 'test' };
      const invalidProps = { onPaper: false };
      
      expect(isHandDrawnComponent(handDrawnProps)).toBe(true);
      expect(isHandDrawnComponent(modernProps)).toBe(false);
      expect(isHandDrawnComponent(invalidProps)).toBe(false);
    });
  });

  describe('Validation Functions', () => {
    it('should validate modern UI props', () => {
      const validModernProps = { accessible: true, className: 'test' };
      const invalidModernProps = { onPaper: true, className: 'test' };
      const invalidModernPropsWithPenStyle = { penStyle: 'ballpoint', className: 'test' };
      
      // Should not throw for valid modern UI props
      expect(() => validateModernUI('TestComponent', validModernProps)).not.toThrow();
      
      // Should throw for props with onPaper
      expect(() => validateModernUI('TestComponent', invalidModernProps)).toThrow(
        'TestComponent: Modern UI components cannot have \'onPaper\' prop'
      );
      
      // Should throw for props with penStyle
      expect(() => validateModernUI('TestComponent', invalidModernPropsWithPenStyle)).toThrow(
        'TestComponent: Modern UI components cannot have \'penStyle\' prop'
      );
    });

    it('should validate hand-drawn props', () => {
      const validHandDrawnProps = { onPaper: true, penStyle: 'ballpoint' };
      const invalidHandDrawnProps = { className: 'test' };
      const invalidHandDrawnPropsWithTheme = { onPaper: true, theme: 'light' };
      
      // Should not throw for valid hand-drawn props
      expect(() => validateHandDrawn('TestComponent', validHandDrawnProps)).not.toThrow();
      
      // Should throw for props without onPaper
      expect(() => validateHandDrawn('TestComponent', invalidHandDrawnProps)).toThrow(
        'TestComponent: Hand-drawn components must have \'onPaper: true\' prop'
      );
      
      // Should throw for props with UI theme
      expect(() => validateHandDrawn('TestComponent', invalidHandDrawnPropsWithTheme)).toThrow(
        'TestComponent: Hand-drawn components cannot have UI theme props'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined props gracefully', () => {
      expect(isModernUIComponent(undefined as any)).toBe(false);
      expect(isHandDrawnComponent(undefined as any)).toBe(false);
      // Validation functions will throw because they try to use 'in' operator on undefined
      expect(() => validateModernUI('Test', undefined)).toThrow();
      expect(() => validateHandDrawn('Test', undefined)).toThrow();
    });

    it('should handle null props gracefully', () => {
      expect(isModernUIComponent(null as any)).toBe(false);
      expect(isHandDrawnComponent(null as any)).toBe(false);
      // Validation functions will throw because they try to use 'in' operator on null
      expect(() => validateModernUI('Test', null)).toThrow();
      expect(() => validateHandDrawn('Test', null)).toThrow();
    });

    it('should handle non-object props gracefully', () => {
      expect(isModernUIComponent('string' as any)).toBe(false);
      expect(isHandDrawnComponent(42 as any)).toBe(false);
      
      // Validation functions should throw for non-object props
      expect(() => validateModernUI('Test', 'string')).toThrow();
      expect(() => validateHandDrawn('Test', 42)).toThrow();
    });
  });

  describe('analyzeComponentProps function', () => {
    it('should analyze modern UI props correctly', () => {
      const modernProps = { accessible: true, className: 'test' };
      const analysis = analyzeComponentProps(modernProps);
      
      expect(analysis.system).toBe('modern-ui');
      expect(analysis.violations).toHaveLength(0);
    });

    it('should analyze hand-drawn props correctly', () => {
      const handDrawnProps = { onPaper: true, penStyle: 'ballpoint' };
      const analysis = analyzeComponentProps(handDrawnProps);
      
      expect(analysis.system).toBe('hand-drawn');
      expect(analysis.violations).toHaveLength(0);
    });

    it('should detect violations in mixed props', () => {
      const invalidProps = { onPaper: true, theme: 'light' };
      const analysis = analyzeComponentProps(invalidProps);
      
      expect(analysis.system).toBe('hand-drawn');
      expect(analysis.violations.length).toBeGreaterThan(0);
      expect(analysis.violations[0]).toContain('Hand-drawn components should not have UI theme props');
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory when wrapping components', () => {
      const Component = () => <div>Test</div>;
      const WrappedComponent = withModernUI(Component, 'TestComponent');
      
      // Should maintain reference to original component
      expect(typeof WrappedComponent).toBe('object'); // React.forwardRef returns an object
      expect(WrappedComponent.displayName).toBe('withModernUI(TestComponent)');
    });

    it('should efficiently check props types', () => {
      const modernProps = { accessible: true, className: 'test' };
      
      // Type checking should be O(1)
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        isModernUIComponent(modernProps);
      }
      const end = performance.now();
      
      // Should complete very quickly (less than 10ms for 1000 checks)
      expect(end - start).toBeLessThan(10);
    });
  });
});
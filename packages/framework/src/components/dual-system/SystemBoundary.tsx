/**
 * @fileoverview SystemBoundary - TypeScript utilities and guards for dual design system
 * 
 * This module provides TypeScript interfaces, type guards, and utility functions
 * that enforce the boundaries between the modern UI system and hand-drawn paper system.
 * It prevents accidental mixing of components across system boundaries.
 */

import React, { ReactNode } from 'react';
import type { ModernUIProps, HandDrawnProps } from '@gpg/shared';

// ============================================================================
// Type Guards and Validators
// ============================================================================

/**
 * Type guard to check if props belong to Modern UI system
 */
export function isModernUIComponent<T extends ModernUIProps>(
  props: any
): props is T & ModernUIProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    !('onPaper' in props) && // Modern UI components should NOT have onPaper prop
    ('accessible' in props ? props.accessible !== false : true) // Default to accessible
  );
}

/**
 * Type guard to check if props belong to Hand-drawn system
 */
export function isHandDrawnComponent<T extends HandDrawnProps>(
  props: any
): props is T & HandDrawnProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    'onPaper' in props &&
    props.onPaper === true // Hand-drawn components MUST have onPaper: true
  );
}

/**
 * Runtime validation for Modern UI components
 */
export function validateModernUI(componentName: string, props: any): void {
  if ('onPaper' in props) {
    throw new Error(
      `${componentName}: Modern UI components cannot have 'onPaper' prop. ` +
      `Use hand-drawn components within PaperSheet instead.`
    );
  }
  
  if ('penStyle' in props) {
    throw new Error(
      `${componentName}: Modern UI components cannot have 'penStyle' prop. ` +
      `This prop is reserved for hand-drawn components.`
    );
  }
}

/**
 * Runtime validation for Hand-drawn components
 */
export function validateHandDrawn(componentName: string, props: any): void {
  if (!('onPaper' in props) || props.onPaper !== true) {
    throw new Error(
      `${componentName}: Hand-drawn components must have 'onPaper: true' prop. ` +
      `This ensures they can only be used within PaperSheet context.`
    );
  }
  
  if ('theme' in props && ['light', 'dark', 'system'].includes(props.theme)) {
    throw new Error(
      `${componentName}: Hand-drawn components cannot have UI theme props. ` +
      `Use 'penStyle' instead for visual styling.`
    );
  }
}

// ============================================================================
// Higher-Order Components for Enforcement
// ============================================================================

/**
 * HOC that enforces Modern UI component boundaries
 */
export function withModernUI<P extends ModernUIProps>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || Component.displayName || Component.name || 'ModernUIComponent';
    
    // Runtime validation
    validateModernUI(name, props);
    
    // Add default accessibility if not specified
    const enhancedProps = {
      accessible: true,
      ...props
    } as P;
    
    return <Component ref={ref} {...enhancedProps} />;
  });
  
  WrappedComponent.displayName = `withModernUI(${componentName || Component.name})`;
  return WrappedComponent;
}

/**
 * HOC that enforces Hand-drawn component boundaries
 */
export function withHandDrawn<P extends HandDrawnProps>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || Component.displayName || Component.name || 'HandDrawnComponent';
    
    // Runtime validation
    validateHandDrawn(name, props);
    
    return <Component ref={ref} {...props} />;
  });
  
  WrappedComponent.displayName = `withHandDrawn(${componentName || Component.name})`;
  return WrappedComponent;
}

// ============================================================================
// Boundary Context Components
// ============================================================================

interface ModernUIBoundaryProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that establishes Modern UI context boundary
 */
export const ModernUIBoundary: React.FC<ModernUIBoundaryProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`ui-boundary ${className}`}
      data-system="modern-ui"
      data-boundary="ui"
    >
      {children}
    </div>
  );
};

interface PaperBoundaryProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that establishes Paper context boundary
 */
export const PaperBoundary: React.FC<PaperBoundaryProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`paper-boundary ${className}`}
      data-system="hand-drawn"
      data-boundary="paper"
    >
      {children}
    </div>
  );
};

// ============================================================================
// Utility Types for Component Definition
// ============================================================================

/**
 * Utility type that enforces Modern UI component structure
 */
export type ModernUIComponent<P = {}> = React.FC<P & ModernUIProps>;

/**
 * Utility type that enforces Hand-drawn component structure  
 */
export type HandDrawnComponent<P = {}> = React.FC<P & HandDrawnProps>;

/**
 * Union type for any component in the dual system
 */
export type DualSystemComponent<P = {}> = ModernUIComponent<P> | HandDrawnComponent<P>;

// ============================================================================
// Development Tools
// ============================================================================

/**
 * Development helper to analyze component props
 */
export function analyzeComponentProps(componentName: string, props: any): {
  system: 'modern-ui' | 'hand-drawn' | 'unknown';
  violations: string[];
  recommendations: string[];
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  let system: 'modern-ui' | 'hand-drawn' | 'unknown' = 'unknown';
  
  // Analyze props to determine intended system
  if ('onPaper' in props && props.onPaper === true) {
    system = 'hand-drawn';
    
    // Check for UI system props in hand-drawn component
    if ('theme' in props && ['light', 'dark', 'system'].includes(props.theme)) {
      violations.push('Hand-drawn components should not have UI theme props');
      recommendations.push('Use penStyle prop instead of theme');
    }
    
    if ('accessible' in props) {
      violations.push('Hand-drawn components should not have accessibility props');
      recommendations.push('Accessibility is handled at the layout level');
    }
    
  } else if (!('onPaper' in props)) {
    system = 'modern-ui';
    
    // Check for hand-drawn props in UI component
    if ('penStyle' in props) {
      violations.push('Modern UI components should not have penStyle props');
      recommendations.push('Move hand-drawn elements to PaperSheet');
    }
    
    if ('animate' in props || 'onAnimationComplete' in props) {
      violations.push('Modern UI components should not have hand-drawn animation props');
      recommendations.push('Use CSS transitions or React animations instead');
    }
    
    if (!('accessible' in props) || props.accessible !== false) {
      recommendations.push('Consider explicitly setting accessible: true for clarity');
    }
    
  } else {
    violations.push('Invalid onPaper prop value - must be true for hand-drawn components');
  }
  
  return { system, violations, recommendations };
}

/**
 * Development-only component boundary checker
 */
export const BoundaryChecker: React.FC<{ 
  children: ReactNode;
  enabled?: boolean;
}> = ({ children, enabled = process.env.NODE_ENV === 'development' }) => {
  if (!enabled) {
    return <>{children}</>;
  }
  
  // In development, add boundary visualization
  return (
    <div className="boundary-checker">
      {children}
      <style jsx>{`
        .boundary-checker [data-boundary="ui"] {
          outline: 2px dashed #3b82f6;
          outline-offset: 2px;
        }
        .boundary-checker [data-boundary="paper"] {
          outline: 2px dashed #f59e0b;
          outline-offset: 2px;
        }
        .boundary-checker [data-boundary="ui"]::before {
          content: "UI System";
          position: absolute;
          top: -20px;
          left: 0;
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          font-size: 10px;
          z-index: 1000;
        }
        .boundary-checker [data-boundary="paper"]::before {
          content: "Paper System";
          position: absolute;
          top: -20px;
          left: 0;
          background: #f59e0b;
          color: white;
          padding: 2px 6px;
          font-size: 10px;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default {
  // Type guards
  isModernUIComponent,
  isHandDrawnComponent,
  
  // Validators
  validateModernUI,
  validateHandDrawn,
  
  // HOCs
  withModernUI,
  withHandDrawn,
  
  // Boundary components
  ModernUIBoundary,
  PaperBoundary,
  
  // Development tools
  analyzeComponentProps,
  BoundaryChecker
};
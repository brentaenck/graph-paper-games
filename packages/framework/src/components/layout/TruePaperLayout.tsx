/**
 * @fileoverview TruePaperLayout - Layout component enforcing dual design system separation
 *
 * This component implements the "true paper reality" layout where the paper contains
 * ONLY the game elements (like real life), while all UI elements exist in the
 * modern digital interface surrounding the paper.
 */

import React, { ReactNode } from 'react';
import { useDualSystem, useLayout } from '../dual-system/DualSystemProvider';
import { ModernUIBoundary, PaperBoundary } from '../dual-system/SystemBoundary';
import type { DualSystemTheme, ModernUIProps } from '@gpg/shared';

// ============================================================================
// Component Interface
// ============================================================================

interface TruePaperLayoutProps extends ModernUIProps {
  /** Modern UI header content (player info, scores, status) */
  header?: ReactNode;

  /** Modern UI footer content (controls, settings, actions) */
  footer?: ReactNode;

  /** Modern UI left sidebar content */
  leftSidebar?: ReactNode;

  /** Modern UI right sidebar content */
  rightSidebar?: ReactNode;

  /** The paper content - MUST contain only hand-drawn elements */
  paper: ReactNode;

  /** Layout variant override */
  layoutType?: DualSystemTheme['layout']['type'];

  /** Enable/disable responsive behavior */
  responsive?: boolean;

  /** Additional CSS classes for the root container */
  containerClassName?: string;

  /** Additional CSS classes for the paper area */
  paperClassName?: string;
}

// ============================================================================
// Layout Variants
// ============================================================================

interface LayoutVariant {
  gridTemplate: string;
  gridAreas: string;
  responsiveTemplate?: string;
  responsiveAreas?: string;
}

const LAYOUT_VARIANTS: Record<DualSystemTheme['layout']['type'], LayoutVariant> = {
  'header-footer': {
    gridTemplate: `
      "header header header" auto
      "left-sidebar paper right-sidebar" 1fr
      "footer footer footer" auto
      / minmax(200px, 1fr) minmax(400px, 2fr) minmax(200px, 1fr)
    `,
    gridAreas: 'header header header, left-sidebar paper right-sidebar, footer footer footer',
    responsiveTemplate: `
      "header" auto
      "paper" 1fr
      "footer" auto
      / 1fr
    `,
    responsiveAreas: 'header, paper, footer',
  },

  sidebar: {
    gridTemplate: `
      "left-sidebar paper right-sidebar" 1fr
      / minmax(250px, 1fr) minmax(500px, 2fr) minmax(250px, 1fr)
    `,
    gridAreas: 'left-sidebar paper right-sidebar',
    responsiveTemplate: `
      "paper" 1fr
      "left-sidebar" auto
      "right-sidebar" auto
      / 1fr
    `,
    responsiveAreas: 'paper, left-sidebar, right-sidebar',
  },

  floating: {
    gridTemplate: `
      "paper" 1fr
      / 1fr
    `,
    gridAreas: 'paper',
  },

  minimal: {
    gridTemplate: `
      "paper" 1fr
      / 1fr
    `,
    gridAreas: 'paper',
  },
};

// ============================================================================
// Main Component
// ============================================================================

export const TruePaperLayout: React.FC<TruePaperLayoutProps> = ({
  header,
  footer,
  leftSidebar,
  rightSidebar,
  paper,
  layoutType: propLayoutType,
  responsive: propResponsive,
  containerClassName = '',
  paperClassName = '',
  theme: propTheme,
  className = '',
  accessible = true,
}) => {
  const { theme } = useDualSystem();
  const { layoutType: contextLayoutType, responsive: contextResponsive } = useLayout();

  // Use prop values or fall back to context values
  const actualLayoutType = propLayoutType || contextLayoutType;
  const actualResponsive = propResponsive !== undefined ? propResponsive : contextResponsive;
  const layoutVariant = LAYOUT_VARIANTS[actualLayoutType];

  // Get UI theme for styling
  const uiTheme = propTheme || theme.ui.theme;

  return (
    <div
      className={`true-paper-layout layout-${actualLayoutType} ui-theme-${uiTheme} ${containerClassName} ${className}`}
      data-layout-type={actualLayoutType}
      data-responsive={actualResponsive}
      data-accessible={accessible}
      style={{
        display: 'grid',
        gridTemplate: actualResponsive
          ? layoutVariant.responsiveTemplate || layoutVariant.gridTemplate
          : layoutVariant.gridTemplate,
        minHeight: '100vh',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      {/* Header - Modern UI */}
      {header && (
        <ModernUIBoundary className="layout-header">
          <header className="ui-layout-section ui-header" style={{ gridArea: 'header' }}>
            {header}
          </header>
        </ModernUIBoundary>
      )}

      {/* Left Sidebar - Modern UI */}
      {leftSidebar && (
        <ModernUIBoundary className="layout-left-sidebar">
          <aside
            className="ui-layout-section ui-sidebar ui-sidebar-left"
            style={{ gridArea: 'left-sidebar' }}
          >
            {leftSidebar}
          </aside>
        </ModernUIBoundary>
      )}

      {/* Paper Area - Hand-drawn System Only */}
      <PaperBoundary className={`layout-paper ${paperClassName}`}>
        <main
          className="paper-layout-section paper-area"
          style={{
            gridArea: 'paper',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
          role="main"
          aria-label="Game board"
        >
          {paper}
        </main>
      </PaperBoundary>

      {/* Right Sidebar - Modern UI */}
      {rightSidebar && (
        <ModernUIBoundary className="layout-right-sidebar">
          <aside
            className="ui-layout-section ui-sidebar ui-sidebar-right"
            style={{ gridArea: 'right-sidebar' }}
          >
            {rightSidebar}
          </aside>
        </ModernUIBoundary>
      )}

      {/* Footer - Modern UI */}
      {footer && (
        <ModernUIBoundary className="layout-footer">
          <footer className="ui-layout-section ui-footer" style={{ gridArea: 'footer' }}>
            {footer}
          </footer>
        </ModernUIBoundary>
      )}
    </div>
  );
};

// ============================================================================
// Responsive Layout Hooks
// ============================================================================

/**
 * Hook for responsive layout management
 */
export const useResponsiveLayout = () => {
  const { layoutType, setLayoutType, responsive, setResponsive } = useLayout();

  // Auto-adjust layout based on screen size
  React.useEffect(() => {
    if (!responsive) return;

    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        // Mobile: stack everything
        if (layoutType !== 'header-footer') {
          setLayoutType('header-footer');
        }
      } else if (width < 1024) {
        // Tablet: sidebar layout
        if (layoutType === 'floating' || layoutType === 'minimal') {
          setLayoutType('sidebar');
        }
      }
      // Desktop: keep current layout
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [responsive, layoutType, setLayoutType]);

  return {
    layoutType,
    setLayoutType,
    responsive,
    setResponsive,
    isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
    isTablet: typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: typeof window !== 'undefined' && window.innerWidth >= 1024,
  };
};

// ============================================================================
// Layout Templates
// ============================================================================

/**
 * Quick template for header-footer layout
 */
export const HeaderFooterLayout: React.FC<{
  header: ReactNode;
  footer: ReactNode;
  paper: ReactNode;
  className?: string;
}> = ({ header, footer, paper, className }) => (
  <TruePaperLayout
    header={header}
    footer={footer}
    paper={paper}
    layoutType="header-footer"
    containerClassName={className}
  />
);

/**
 * Quick template for sidebar layout
 */
export const SidebarLayout: React.FC<{
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  paper: ReactNode;
  className?: string;
}> = ({ leftSidebar, rightSidebar, paper, className }) => (
  <TruePaperLayout
    leftSidebar={leftSidebar}
    rightSidebar={rightSidebar}
    paper={paper}
    layoutType="sidebar"
    containerClassName={className}
  />
);

/**
 * Quick template for minimal layout (just paper)
 */
export const MinimalLayout: React.FC<{
  paper: ReactNode;
  className?: string;
}> = ({ paper, className }) => (
  <TruePaperLayout paper={paper} layoutType="minimal" containerClassName={className} />
);

// ============================================================================
// Export
// ============================================================================

export default TruePaperLayout;

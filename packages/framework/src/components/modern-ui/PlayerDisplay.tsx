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
 * @fileoverview PlayerDisplay - Modern UI component for player information
 *
 * This component displays player information including name, score, status,
 * and avatar in the modern UI system. It automatically adapts to different
 * UI themes and maintains accessibility standards.
 */

import React from 'react';
import { useModernUI } from '../dual-system/DualSystemProvider';
import { withModernUI } from '../dual-system/SystemBoundary';
import type { ModernUIProps, Player } from '@gpg/shared';

// ============================================================================
// Component Interface
// ============================================================================

interface PlayerDisplayProps extends ModernUIProps {
  /** Player information to display */
  player: Player;

  /** Whether this player is currently active/taking turn */
  isActive?: boolean;

  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';

  /** Show avatar if available */
  showAvatar?: boolean;

  /** Show score information */
  showScore?: boolean;

  /** Additional player status text */
  status?: string;

  /** Click handler for player interaction */
  onClick?: () => void;
}

// ============================================================================
// Avatar Component
// ============================================================================

const PlayerAvatar: React.FC<{
  player: Player;
  size: 'sm' | 'md' | 'lg';
  isActive: boolean;
}> = ({ player, size, isActive }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
  };

  const borderClasses = isActive
    ? 'border-2 border-blue-400 ring-2 ring-blue-100'
    : 'border border-gray-200';

  const bgColor = player.color || '#6b7280';

  return (
    <div
      className={`${sizeClasses[size]} ${borderClasses} rounded-lg flex items-center justify-center font-bold transition-all duration-200`}
      style={{
        backgroundColor: isActive ? `${bgColor}20` : '#f3f4f6',
        color: isActive ? bgColor : '#6b7280',
      }}
      aria-label={`${player.name} avatar`}
    >
      {player.avatar ? (
        <img
          src={player.avatar}
          alt={`${player.name} avatar`}
          className="w-full h-full rounded-lg object-cover"
        />
      ) : (
        player.name.charAt(0).toUpperCase()
      )}
    </div>
  );
};

// ============================================================================
// Player Status Badge
// ============================================================================

const PlayerStatusBadge: React.FC<{
  isActive: boolean;
  isAI: boolean;
  status?: string;
}> = ({ isActive, isAI, status }) => {
  if (status) {
    return <span className="ui-badge ui-badge-info ui-badge-sm">{status}</span>;
  }

  if (isActive) {
    return <span className="ui-badge ui-badge-primary ui-badge-sm">Active</span>;
  }

  if (isAI) {
    return <span className="ui-badge ui-badge-secondary ui-badge-sm">AI</span>;
  }

  return null;
};

// ============================================================================
// Main Component
// ============================================================================

const PlayerDisplayComponent: React.FC<PlayerDisplayProps> = ({
  player,
  isActive = false,
  variant = 'default',
  showAvatar = true,
  showScore = true,
  status,
  onClick,
  className = '',
  theme: _theme, // Currently unused - for future theme customization
  accessible = true,
}) => {
  useModernUI(); // Initialize modern UI context

  const isClickable = !!onClick;
  const containerClasses = [
    'ui-player-display',
    `ui-player-display-${variant}`,
    isActive ? 'ui-player-display-active' : 'ui-player-display-inactive',
    isClickable ? 'ui-player-display-clickable cursor-pointer' : '',
    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (onClick && accessible) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick && accessible) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable && accessible ? 0 : -1}
      role={isClickable ? 'button' : 'presentation'}
      aria-label={isClickable ? `Player ${player.name}` : undefined}
      style={{
        backgroundColor: isActive ? 'var(--ui-primary-50)' : 'var(--ui-gray-50)',
        border: isActive ? '2px solid var(--ui-primary-200)' : '1px solid var(--ui-gray-200)',
      }}
    >
      {/* Avatar */}
      {showAvatar && (
        <PlayerAvatar
          player={player}
          size={variant === 'compact' ? 'sm' : variant === 'detailed' ? 'lg' : 'md'}
          isActive={isActive}
        />
      )}

      {/* Player Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="ui-text font-medium truncate">{player.name}</h3>
          <PlayerStatusBadge isActive={isActive} isAI={player.isAI} status={status} />
        </div>

        {/* Score and Details */}
        {(showScore || variant === 'detailed') && (
          <div className="flex items-center gap-4 ui-text-sm ui-text-muted">
            {showScore && (
              <span>
                Score: <strong>{player.score}</strong>
              </span>
            )}

            {variant === 'detailed' && player.isAI && player.difficulty && (
              <span>Level {player.difficulty}</span>
            )}

            {variant === 'detailed' && !isActive && !player.isActive && (
              <span className="text-red-500">Disconnected</span>
            )}
          </div>
        )}
      </div>

      {/* Action Indicator */}
      {isClickable && accessible && (
        <div className="ui-text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Compound Components
// ============================================================================

/**
 * Player list component for displaying multiple players
 */
export const PlayerList: React.FC<{
  players: Player[];
  activePlayerId?: string;
  onPlayerClick?: (player: Player) => void;
  variant?: PlayerDisplayProps['variant'];
  className?: string;
}> = ({ players, activePlayerId, onPlayerClick, variant = 'default', className = '' }) => {
  return (
    <div className={`ui-player-list space-y-2 ${className}`}>
      {players.map(player => (
        <PlayerDisplay
          key={player.id}
          player={player}
          isActive={player.id === activePlayerId}
          variant={variant}
          onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
        />
      ))}
    </div>
  );
};

/**
 * Compact player summary for headers
 */
export const PlayerSummary: React.FC<{
  player: Player;
  isActive?: boolean;
  className?: string;
}> = ({ player, isActive = false, className = '' }) => (
  <PlayerDisplay
    player={player}
    isActive={isActive}
    variant="compact"
    showScore={false}
    className={className}
  />
);

// ============================================================================
// Export
// ============================================================================

// Wrap with boundary enforcement
export const PlayerDisplay = withModernUI(PlayerDisplayComponent, 'PlayerDisplay');

export default PlayerDisplay;
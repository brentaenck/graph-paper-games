/**
 * @fileoverview GameHUD component for displaying game UI elements
 *
 * Provides a heads-up display with player information, scores,
 * current turn indicator, and game controls.
 */

import React from 'react';
import type { Player, Scoreboard } from '@gpg/shared';
import type { TurnInfo } from '../turn-manager';

/**
 * Props for GameHUD component
 */
export interface GameHUDProps {
  /** Current turn information */
  turnInfo: TurnInfo;

  /** Current scores */
  scoreboard?: Scoreboard;

  /** Whether to show timer */
  showTimer?: boolean;

  /** Whether to show undo button */
  showUndoButton?: boolean;

  /** Whether to show skip turn button */
  showSkipButton?: boolean;

  /** Undo callback */
  onUndo?: () => void;

  /** Skip turn callback */
  onSkipTurn?: () => void;

  /** Resign callback */
  onResign?: () => void;

  /** Additional CSS classes */
  className?: string;

  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * Player info component
 */
const PlayerInfo: React.FC<{
  player: Player;
  isCurrentTurn: boolean;
  score?: number;
  rank?: number;
}> = ({ player, isCurrentTurn, score, rank }) => (
  <div className={`player-info ${isCurrentTurn ? 'current-turn' : ''}`}>
    <div className="player-avatar">
      {player.avatar ? (
        <img src={player.avatar} alt={player.name} />
      ) : (
        <div className="avatar-placeholder">{player.name.charAt(0).toUpperCase()}</div>
      )}
    </div>

    <div className="player-details">
      <div className="player-name">{player.name}</div>
      {player.isAI && <div className="ai-indicator">AI</div>}
      {score !== undefined && <div className="player-score">Score: {score}</div>}
      {rank !== undefined && <div className="player-rank">Rank: #{rank}</div>}
    </div>

    {isCurrentTurn && <div className="turn-indicator">Current Turn</div>}
  </div>
);

/**
 * Turn timer component
 */
const TurnTimer: React.FC<{
  timeRemaining?: number;
  totalTime?: number;
}> = ({ timeRemaining, totalTime = 60 }) => {
  if (timeRemaining === undefined) return null;

  const percentage = (timeRemaining / totalTime) * 100;
  const isUrgent = timeRemaining < 10;

  return (
    <div className={`turn-timer ${isUrgent ? 'urgent' : ''}`}>
      <div className="timer-label">Time Remaining</div>
      <div className="timer-display">{Math.ceil(timeRemaining)}s</div>
      <div className="timer-bar">
        <div className="timer-progress" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

/**
 * Game controls component
 */
const GameControls: React.FC<{
  canUndo: boolean;
  showUndoButton: boolean;
  showSkipButton: boolean;
  onUndo?: () => void;
  onSkipTurn?: () => void;
  onResign?: () => void;
}> = ({ canUndo, showUndoButton, showSkipButton, onUndo, onSkipTurn, onResign }) => (
  <div className="game-controls">
    {showUndoButton && (
      <button
        className="control-button undo-button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo last move"
      >
        ↶ Undo
      </button>
    )}

    {showSkipButton && (
      <button className="control-button skip-button" onClick={onSkipTurn} title="Skip current turn">
        ⏭ Skip Turn
      </button>
    )}

    <button className="control-button resign-button" onClick={onResign} title="Resign from game">
      🏳 Resign
    </button>
  </div>
);

/**
 * Game status component
 */
const GameStatus: React.FC<{
  turnInfo: TurnInfo;
  scoreboard?: Scoreboard;
}> = ({ turnInfo, scoreboard }) => {
  const { phase, turnNumber } = turnInfo;

  return (
    <div className="game-status">
      <div className="turn-info">
        <div className="turn-number">Turn {turnNumber}</div>
        <div className="game-phase">Phase: {phase}</div>
      </div>

      {scoreboard && scoreboard.winner && (
        <div className="game-result">
          {scoreboard.isDraw ? (
            <div className="draw-message">Game ended in a draw!</div>
          ) : (
            <div className="winner-message">
              Winner: {scoreboard.players.find((p: any) => p.playerId === scoreboard.winner)?.playerId}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * GameHUD component
 */
export const GameHUD: React.FC<GameHUDProps> = ({
  turnInfo,
  scoreboard,
  showTimer = false,
  showUndoButton = true,
  showSkipButton = false,
  onUndo,
  onSkipTurn,
  onResign,
  className,
  style,
}) => {
  const { currentPlayer, timeRemaining, canUndo } = turnInfo;

  return (
    <div className={`game-hud ${className ?? ''}`} style={style}>
      {/* Current Player Section */}
      <div className="hud-section current-player-section">
        <h3>Current Player</h3>
        <PlayerInfo
          player={currentPlayer}
          isCurrentTurn={true}
          score={scoreboard?.players.find((p: any) => p.playerId === currentPlayer.id)?.score}
          rank={scoreboard?.players.find((p: any) => p.playerId === currentPlayer.id)?.rank}
        />
      </div>

      {/* Timer Section */}
      {showTimer && timeRemaining !== undefined && (
        <div className="hud-section timer-section">
          <TurnTimer timeRemaining={timeRemaining} />
        </div>
      )}

      {/* All Players Section */}
      <div className="hud-section players-section">
        <h3>Players</h3>
        <div className="players-list">
          {turnInfo.currentPlayer && (
            <div className="all-players">
              {/* This would typically show all players, but we only have currentPlayer in turnInfo */}
              <PlayerInfo
                player={currentPlayer}
                isCurrentTurn={true}
                score={scoreboard?.players.find((p: any) => p.playerId === currentPlayer.id)?.score}
                rank={scoreboard?.players.find((p: any) => p.playerId === currentPlayer.id)?.rank}
              />
            </div>
          )}
        </div>
      </div>

      {/* Game Status Section */}
      <div className="hud-section status-section">
        <GameStatus turnInfo={turnInfo} scoreboard={scoreboard} />
      </div>

      {/* Controls Section */}
      <div className="hud-section controls-section">
        <GameControls
          canUndo={canUndo}
          showUndoButton={showUndoButton}
          showSkipButton={showSkipButton}
          onUndo={onUndo}
          onSkipTurn={onSkipTurn}
          onResign={onResign}
        />
      </div>
    </div>
  );
};

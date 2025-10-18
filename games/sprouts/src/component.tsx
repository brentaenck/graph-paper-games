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
 * @fileoverview React component for interactive Sprouts game
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { GameProps } from '@gpg/shared';

import type {
  SproutsMetadata,
  SproutsPoint,
  Point2D,
  SproutsVisualStyle,
  SproutsVisualConfig,
} from './types';

import {
  DEFAULT_VISUAL_STYLE,
  DEFAULT_SPROUTS_VISUAL_CONFIG,
  SPROUTS_CONSTANTS,
  canAcceptConnection,
  DEFAULT_CURVE_CONFIGS,
  DEFAULT_VISUAL_CONFIGS,
} from './types';

import {
  isPointInCircle,
  generateStraightLineWithPoint,
  generateSmootherLinePath,
  distance,
} from './geometry';

import { createSproutsMove } from './engine';

// ============================================================================
// Component State Types
// ============================================================================

interface CanvasState {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  scale: number;
  offset: Point2D;
  canvasSize: { width: number; height: number };
}

interface InteractionState {
  isDrawing: boolean;
  isPlacingPoint: boolean; // New phase: placing the new point
  selectedPointId: string | null;
  targetPointId: string | null; // The target point we're connecting to
  currentPath: Point2D[]; // The current line being drawn
  previewPoint: Point2D | null;
  hoveredPointId: string | null;
  pendingNewPointPosition: Point2D | null; // Where the new point will be placed
}

// ============================================================================
// Main Component
// ============================================================================

export const SproutsGame: React.FC<GameProps> = ({
  gameState,
  currentPlayer,
  isMyTurn,
  onMove,
  onUndo,
  onResign,
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [canvasState, setCanvasState] = useState<CanvasState>({
    canvas: null,
    context: null,
    scale: 1,
    offset: { x: 0, y: 0 },
    canvasSize: { width: 800, height: 600 },
  });

  const [interactionState, setInteractionState] = useState<InteractionState>({
    isDrawing: false,
    isPlacingPoint: false,
    selectedPointId: null,
    targetPointId: null,
    currentPath: [],
    previewPoint: null,
    hoveredPointId: null,
    pendingNewPointPosition: null,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Visual configuration state
  const [visualConfig, setVisualConfig] = useState<SproutsVisualConfig>(DEFAULT_SPROUTS_VISUAL_CONFIG);

  // Extract metadata
  const metadata = useMemo(() => {
    return gameState.metadata as unknown as SproutsMetadata;
  }, [gameState.metadata]);

  // Visual style
  const visualStyle: SproutsVisualStyle = DEFAULT_VISUAL_STYLE;

  // ============================================================================
  // Canvas Setup and Resize Handling
  // ============================================================================

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set up canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    context.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    setCanvasState({
      canvas,
      context,
      scale: 1,
      offset: { x: 0, y: 0 },
      canvasSize: { width: rect.width, height: rect.height },
    });
  }, []);

  useEffect(() => {
    initializeCanvas();

    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // ============================================================================
  // Drawing Functions
  // ============================================================================

  const clearCanvas = useCallback(() => {
    const { context, canvasSize } = canvasState;
    if (!context) return;

    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    context.fillStyle = visualStyle.backgroundColor;
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }, [canvasState, visualStyle.backgroundColor]);

  const drawPoint = useCallback((
    point: SproutsPoint,
    isHovered: boolean = false,
    isSelected: boolean = false
  ) => {
    const { context } = canvasState;
    if (!context) return;

    const radius = visualStyle.pointRadius;
    const color = point.createdAtMove === 0 
      ? visualStyle.pointColor 
      : visualStyle.newPointColor;
    
    const borderColor = isSelected 
      ? visualStyle.highlightColor 
      : isHovered 
        ? visualStyle.highlightColor 
        : visualStyle.pointBorderColor;

    // Draw point
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = borderColor;
    context.lineWidth = isSelected || isHovered ? 2 : 1; // Thinner borders for smaller points
    context.stroke();

    // Draw connection indicators (small lines showing available connections)
    const maxConnections = SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT;
    const availableConnections = maxConnections - point.connections.length;
    
    if (availableConnections > 0) {
      context.strokeStyle = borderColor;
      context.lineWidth = 1;
      
      for (let i = 0; i < maxConnections; i++) {
        const angle = (i * 2 * Math.PI) / maxConnections - Math.PI / 2;
        const startRadius = radius + 1; // Closer to the smaller point
        const endRadius = radius + 4; // Shorter indicator lines
        
        const startX = point.x + Math.cos(angle) * startRadius;
        const startY = point.y + Math.sin(angle) * startRadius;
        const endX = point.x + Math.cos(angle) * endRadius;
        const endY = point.y + Math.sin(angle) * endRadius;
        
        if (i < point.connections.length) {
          // Used connection - draw solid line
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(endX, endY);
          context.stroke();
        } else {
          // Available connection - draw dashed line
          context.setLineDash([2, 2]);
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(endX, endY);
          context.stroke();
          context.setLineDash([]);
        }
      }
    }
  }, [canvasState, visualStyle]);


  const drawPreview = useCallback(() => {
    const { context } = canvasState;
    const { selectedPointId, currentPath, previewPoint, isPlacingPoint } = interactionState;
    
    if (!context || !selectedPointId) return;

    const selectedPoint = metadata.points.find(p => p.id === selectedPointId);
    if (!selectedPoint) return;

    if (isPlacingPoint) {
      // Phase 2: Show the established line and preview new point position
      if (currentPath.length >= 2) {
        // Check if this is a self-loop (drawing from a point to itself)
        const isSelfLoop = distance(currentPath[0], currentPath[1]) < 10;
        
        if (isSelfLoop) {
          // For self-loops, don't apply enhanced smoothing in preview - it's already handled by the loop generation
          context.beginPath();
          context.moveTo(currentPath[0].x, currentPath[0].y);
          context.lineTo(currentPath[1].x, currentPath[1].y);
          context.strokeStyle = visualStyle.highlightColor;
          context.lineWidth = visualStyle.curveWidth + 1;
          context.stroke();
        } else {
          // Generate enhanced line for preview (regular connections only)
          const enhancedPath = generateSmootherLinePath(
            currentPath[0],
            currentPath[1],
            visualConfig.curveGeneration
          );
          
          // Draw the enhanced line
          context.beginPath();
          context.moveTo(enhancedPath[0].x, enhancedPath[0].y);
          for (let i = 1; i < enhancedPath.length; i++) {
            context.lineTo(enhancedPath[i].x, enhancedPath[i].y);
          }
          context.strokeStyle = visualStyle.highlightColor;
          context.lineWidth = visualStyle.curveWidth + 1;
          context.stroke();
        }
        
        // Draw preview of new point at cursor position
        if (previewPoint) {
          context.beginPath();
          context.arc(previewPoint.x, previewPoint.y, visualStyle.pointRadius, 0, 2 * Math.PI);
          context.fillStyle = visualStyle.newPointColor;
          context.fill();
          context.strokeStyle = visualStyle.pointBorderColor;
          context.lineWidth = 2;
          context.stroke();
        }
      }
    } else {
      // Phase 1: Drawing the line with enhanced preview
      if (currentPath.length === 0) return;
      
      const pathToDraw = [...currentPath];
      if (previewPoint) {
        pathToDraw.push(previewPoint);
      }

      if (pathToDraw.length < 2) return;

      // Generate enhanced preview path
      const enhancedPreviewPath = pathToDraw.length === 2 ? 
        generateSmootherLinePath(
          pathToDraw[0],
          pathToDraw[1],
          { 
            ...visualConfig.curveGeneration, 
            segments: Math.max(2, visualConfig.curveGeneration.segments - 2) // Fewer segments for preview
          }
        ) : pathToDraw;

      // Draw enhanced preview line
      context.beginPath();
      context.moveTo(enhancedPreviewPath[0].x, enhancedPreviewPath[0].y);

      for (let i = 1; i < enhancedPreviewPath.length; i++) {
        context.lineTo(enhancedPreviewPath[i].x, enhancedPreviewPath[i].y);
      }

      context.strokeStyle = visualStyle.previewColor;
      context.lineWidth = visualStyle.curveWidth;
      context.setLineDash([5, 5]);
      context.stroke();
      context.setLineDash([]);
    }
  }, [canvasState, interactionState, metadata.points, visualStyle, visualConfig]);

  const render = useCallback(() => {
    clearCanvas();

    // Draw existing curves with enhanced visuals
    metadata.curves.forEach(curve => {
      const { context } = canvasState;
      if (!context) return;

      // Use existing curve path with enhancement option
      const useEnhanced = visualConfig.visualQuality.preset !== 'basic';
      
      let path: Point2D[];
      
      if (useEnhanced && curve.controlPoints.length >= 2) {
        // Check if this is a loop (starts and ends at the same point)
        const isLoop = curve.controlPoints.length > 2 && 
          distance(curve.controlPoints[0], curve.controlPoints[curve.controlPoints.length - 1]) < 5;
        
        if (isLoop) {
          // For loops, use the original control points - they're already properly shaped
          // Don't apply smoothing as it would distort the loop structure
          path = [...curve.controlPoints];
        } else if (curve.controlPoints.length === 2) {
          // Simple line - apply smoothing
          path = generateSmootherLinePath(
            curve.controlPoints[0],
            curve.controlPoints[1],
            visualConfig.curveGeneration
          );
        } else {
          // Multi-segment path (not a loop) - enhance each segment
          path = [];
          for (let i = 0; i < curve.controlPoints.length - 1; i++) {
            const segmentPath = generateSmootherLinePath(
              curve.controlPoints[i],
              curve.controlPoints[i + 1],
              {
                ...visualConfig.curveGeneration,
                segments: Math.max(2, visualConfig.curveGeneration.segments / 2)
              }
            );
            if (i === 0) {
              path.push(...segmentPath);
            } else {
              path.push(...segmentPath.slice(1)); // Skip first to avoid duplication
            }
          }
        }
      } else {
        // Use original control points
        path = [...curve.controlPoints];
      }
      
      if (path.length < 2) return;

      context.beginPath();
      context.moveTo(path[0].x, path[0].y);

      for (let i = 1; i < path.length; i++) {
        context.lineTo(path[i].x, path[i].y);
      }

      // Apply enhanced styling for premium mode
      context.strokeStyle = visualConfig.visualQuality.preset === 'premium' ? 
        '#2563eb' : visualStyle.curveColor; // Enhanced blue for premium mode
      context.lineWidth = useEnhanced ?
        Math.max(visualStyle.curveWidth - 0.5, 1) : visualStyle.curveWidth;
      context.stroke();
    });

    // Draw existing points
    metadata.points.forEach(point => {
      const isHovered = point.id === interactionState.hoveredPointId;
      const isSelected = point.id === interactionState.selectedPointId || 
                         point.id === interactionState.targetPointId;
      drawPoint(point, isHovered, isSelected);
    });

    // Draw preview for both phases
    if (interactionState.isDrawing || interactionState.isPlacingPoint) {
      drawPreview();
    }
  }, [clearCanvas, metadata, interactionState, drawPoint, drawPreview, canvasState, visualConfig, visualStyle]);

  // Render on state changes
  useEffect(() => {
    if (canvasState.context) {
      render();
    }
  }, [canvasState.context, render]);

  // ============================================================================
  // Mouse/Touch Event Handlers
  // ============================================================================

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): Point2D => {
    const canvas = canvasState.canvas;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, [canvasState.canvas]);

  const findPointAtPosition = useCallback((pos: Point2D): SproutsPoint | null => {
    return metadata.points.find(point => 
      isPointInCircle(
        pos, 
        { x: point.x, y: point.y }, 
        SPROUTS_CONSTANTS.POINT_SELECTION_RADIUS
      )
    ) || null;
  }, [metadata.points]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!isMyTurn) return;

    const pos = getCanvasCoordinates(event.clientX, event.clientY);
    const point = findPointAtPosition(pos);

    if (point && canAcceptConnection(point)) {
      setInteractionState(prev => ({
        ...prev,
        isDrawing: true,
        selectedPointId: point.id,
        currentPath: [{ x: point.x, y: point.y }],
        previewPoint: pos,
      }));
      setErrorMessage(null);
    } else if (point && !canAcceptConnection(point)) {
      setErrorMessage(`Point already has maximum connections (${SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT})`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  }, [isMyTurn, getCanvasCoordinates, findPointAtPosition]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const pos = getCanvasCoordinates(event.clientX, event.clientY);
    const point = findPointAtPosition(pos);

    // Update hover state
    setInteractionState(prev => ({
      ...prev,
      hoveredPointId: point?.id || null,
    }));

    // Update preview for both drawing and point placement phases
    if (interactionState.isDrawing || interactionState.isPlacingPoint) {
      setInteractionState(prev => ({
        ...prev,
        previewPoint: pos,
      }));
    }
  }, [getCanvasCoordinates, findPointAtPosition, interactionState.isDrawing, interactionState.isPlacingPoint]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isMyTurn) return;

    const pos = getCanvasCoordinates(event.clientX, event.clientY);

    // Phase 2: Placing the new point along the line
    if (interactionState.isPlacingPoint) {
      const selectedPoint = metadata.points.find(p => p.id === interactionState.selectedPointId);
      const targetPoint = metadata.points.find(p => p.id === interactionState.targetPointId);
      
      if (!selectedPoint || !targetPoint) {
        // Reset if points not found
        setInteractionState({
          isDrawing: false,
          isPlacingPoint: false,
          selectedPointId: null,
          targetPointId: null,
          currentPath: [],
          previewPoint: null,
          hoveredPointId: null,
          pendingNewPointPosition: null,
        });
        return;
      }

      // Create the move with the clicked position as the new point
      try {
        console.log('Creating move with:', {
          selectedPoint: { x: selectedPoint.x, y: selectedPoint.y, id: selectedPoint.id },
          targetPoint: { x: targetPoint.x, y: targetPoint.y, id: targetPoint.id },
          newPointPosition: pos
        });
        
        // Human player: Use 3-point path that includes the manually placed point
        const curvePath = generateStraightLineWithPoint(
          { x: selectedPoint.x, y: selectedPoint.y },
          { x: targetPoint.x, y: targetPoint.y },
          pos,
          metadata.points,
          metadata.curves
        );
        
        console.log('Generated curve path:', curvePath);
        
        // For loops (self-connections), we need to find the point that was inserted into the path
        // The loop generation places the new point at the position closest to the user's click
        let newPointPosition = pos;
        if (selectedPoint.id === targetPoint.id) {
          // For loops, find the inserted point in the curve path
          // It should be the point that's not the start/end point and closest to our click
          let bestPoint = pos;
          let minDistToClick = Infinity;
          
          for (const point of curvePath) {
            // Skip the start point (should appear twice - at beginning and end)
            const distToStart = Math.sqrt((point.x - selectedPoint.x) ** 2 + (point.y - selectedPoint.y) ** 2);
            if (distToStart < 5) continue; // This is the start point, skip it
            
            // Check how close this point is to our original click
            const distToClick = Math.sqrt((point.x - pos.x) ** 2 + (point.y - pos.y) ** 2);
            if (distToClick < minDistToClick) {
              minDistToClick = distToClick;
              bestPoint = point;
            }
          }
          
          newPointPosition = bestPoint;
        }

        const move = createSproutsMove(
          currentPlayer.id,
          selectedPoint.id,
          targetPoint.id,
          curvePath,
          newPointPosition
        );
        
        console.log('Created move:', move);

        onMove(move);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage('Unable to create move: ' + (error instanceof Error ? error.message : 'Unknown error'));
        setTimeout(() => setErrorMessage(null), 3000);
      }

      // Reset state
      setInteractionState({
        isDrawing: false,
        isPlacingPoint: false,
        selectedPointId: null,
        targetPointId: null,
        currentPath: [],
        previewPoint: null,
        hoveredPointId: null,
        pendingNewPointPosition: null,
      });
      return;
    }

    // Phase 1: Finishing the line draw
    if (!interactionState.isDrawing) return;

    const targetPoint = findPointAtPosition(pos);
    const selectedPoint = metadata.points.find(p => p.id === interactionState.selectedPointId);

    if (!selectedPoint) {
      setInteractionState(prev => ({
        ...prev,
        isDrawing: false,
        selectedPointId: null,
        currentPath: [],
        previewPoint: null,
      }));
      return;
    }

    if (targetPoint && canAcceptConnection(targetPoint)) {
      // Check if this is a self-connection (loop)
      if (targetPoint.id === selectedPoint.id) {
        // Self-connection: Need at least 2 free connections for a loop
        if (targetPoint.connections.length >= SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT - 1) {
          setErrorMessage(`Point needs at least 2 free connections for a loop`);
          setTimeout(() => setErrorMessage(null), 3000);
          
          // Reset drawing state
          setInteractionState(prev => ({
            ...prev,
            isDrawing: false,
            selectedPointId: null,
            currentPath: [],
            previewPoint: null,
          }));
          return;
        }
      }
      
      // Valid target point - switch to point placement phase
      setInteractionState(prev => ({
        ...prev,
        isDrawing: false,
        isPlacingPoint: true,
        targetPointId: targetPoint.id,
        currentPath: [{ x: selectedPoint.x, y: selectedPoint.y }, { x: targetPoint.x, y: targetPoint.y }],
        previewPoint: pos,
      }));
      
      const isLoop = targetPoint.id === selectedPoint.id;
      setErrorMessage(isLoop 
        ? 'Now click where you want to place the new point on the loop'
        : 'Now click where you want to place the new point along the line'
      );
      setTimeout(() => setErrorMessage(null), 3000);
    } else if (targetPoint && !canAcceptConnection(targetPoint)) {
      setErrorMessage(`Target point already has maximum connections (${SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT})`);
      setTimeout(() => setErrorMessage(null), 3000);
      
      // Reset drawing state
      setInteractionState(prev => ({
        ...prev,
        isDrawing: false,
        selectedPointId: null,
        currentPath: [],
        previewPoint: null,
      }));
    } else {
      setErrorMessage('Must connect to a valid point (or click the same point for a loop)');
      setTimeout(() => setErrorMessage(null), 3000);
      
      // Reset drawing state
      setInteractionState(prev => ({
        ...prev,
        isDrawing: false,
        selectedPointId: null,
        currentPath: [],
        previewPoint: null,
      }));
    }
  }, [isMyTurn, interactionState, getCanvasCoordinates, findPointAtPosition, metadata.points, currentPlayer.id, onMove]);

  const handleMouseLeave = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      hoveredPointId: null,
      previewPoint: null,
    }));
  }, []);

  // ============================================================================
  // Game Status Display
  // ============================================================================

  const gameStatus = useMemo(() => {
    if (metadata.gamePhase === 'finished') {
      const winner = metadata.winner;
      if (winner) {
        const winnerName = gameState.players.find(p => p.id === winner)?.name || 'Unknown';
        return `Game Over - ${winnerName} wins!`;
      }
      return 'Game Over - Draw!';
    }

    const availablePoints = metadata.points.filter(canAcceptConnection).length;
    const movesRemaining = metadata.legalMovesRemaining;

    return `${availablePoints} points available • ${movesRemaining} legal moves remaining`;
  }, [metadata, gameState.players]);

  const turnStatus = useMemo(() => {
    if (metadata.gamePhase === 'finished') {
      return 'Game completed';
    }
    
    if (isMyTurn) {
      return 'Your turn - Click and drag between points to draw a curve';
    }
    
    return `${currentPlayer.name}'s turn`;
  }, [metadata.gamePhase, isMyTurn, currentPlayer.name]);

  // ============================================================================
  // Render Component
  // ============================================================================

  return (
    <div className="sprouts-game">
      {/* Game Info */}
      <div className="sprouts-header">
        <div className="game-title">Sprouts</div>
        <div className="game-status">{gameStatus}</div>
        <div className="turn-status">{turnStatus}</div>
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
      </div>

      {/* Game Canvas */}
      <div className="sprouts-canvas-container">
        <canvas
          ref={canvasRef}
          className="sprouts-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: '400px',
            border: '2px solid #333',
            borderRadius: '8px',
            cursor: isMyTurn 
              ? (interactionState.hoveredPointId ? 'pointer' : 'crosshair')
              : 'not-allowed',
          }}
        />
      </div>

      {/* Game Controls */}
      <div className="sprouts-controls">
        {onUndo && (
          <button 
            onClick={onUndo} 
            disabled={!isMyTurn || gameState.moves.length === 0}
            className="control-button undo-button"
          >
            ↶ Undo
          </button>
        )}
        {onResign && (
          <button 
            onClick={onResign} 
            disabled={metadata.gamePhase === 'finished'}
            className="control-button resign-button"
          >
            🏳 Resign
          </button>
        )}
      </div>

      {/* Visual Configuration Controls */}
      <div className="sprouts-visual-controls">
        <div className="visual-control-group">
          <label className="visual-control-label">
            <input 
              type="checkbox" 
              checked={visualConfig.visualQuality.preset !== 'basic'}
              onChange={(e) => {
                const preset = e.target.checked ? 'enhanced' : 'basic';
                setVisualConfig({
                  curveGeneration: DEFAULT_CURVE_CONFIGS[preset],
                  visualQuality: DEFAULT_VISUAL_CONFIGS[preset],
                });
              }}
            />
            Enhanced Curves
          </label>
          
          {visualConfig.visualQuality.preset !== 'basic' && (
            <div className="visual-control-item">
              <label>
                Quality: 
                <select 
                  value={visualConfig.visualQuality.preset}
                  onChange={(e) => {
                    const preset = e.target.value as 'basic' | 'enhanced' | 'premium';
                    setVisualConfig({
                      curveGeneration: DEFAULT_CURVE_CONFIGS[preset],
                      visualQuality: DEFAULT_VISUAL_CONFIGS[preset],
                    });
                  }}
                >
                  <option value="basic">Basic</option>
                  <option value="enhanced">Enhanced</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Game Stats */}
      <div className="sprouts-stats">
        <div className="stat">
          <span className="stat-label">Turn:</span>
          <span className="stat-value">{gameState.turnNumber + 1}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Points:</span>
          <span className="stat-value">{metadata.points.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Curves:</span>
          <span className="stat-value">{metadata.curves.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Moves Left:</span>
          <span className="stat-value">{metadata.legalMovesRemaining}</span>
        </div>
      </div>

      {/* Instructions */}
      {metadata.gamePhase === 'playing' && (
        <div className="sprouts-instructions">
          <h4>How to Play (Phase 1 - Simplified):</h4>
          <ul>
            <li><strong>Step 1:</strong> Click and drag from one point to another to draw a straight line</li>
            <li><strong>Step 2:</strong> Click anywhere along the line to place the new point</li>
            <li>Each point can have at most 3 connections</li>
            <li>Lines cannot cross each other or pass through existing points</li>
            <li>The last player able to make a move wins!</li>
          </ul>
          {interactionState.isPlacingPoint && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
              <strong>Click on the line to place your new point!</strong>
            </div>
          )}
        </div>
      )}

      <style>{`
        .sprouts-game {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sprouts-header {
          text-align: center;
        }

        .game-title {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .game-status {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .turn-status {
          font-size: 1rem;
          color: #555;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: 1px solid #fcc;
          margin-top: 0.5rem;
          animation: fadeInOut 3s ease-in-out;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }

        .sprouts-canvas-container {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }

        .sprouts-canvas {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .sprouts-controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .control-button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .undo-button {
          background: #4CAF50;
          color: white;
        }

        .undo-button:hover:not(:disabled) {
          background: #45a049;
        }

        .resign-button {
          background: #f44336;
          color: white;
        }

        .resign-button:hover:not(:disabled) {
          background: #da190b;
        }

        .sprouts-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }

        .sprouts-instructions {
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #bbdefb;
        }

        .sprouts-instructions h4 {
          margin-top: 0;
          color: #1976d2;
        }

        .sprouts-instructions ul {
          margin-bottom: 0;
        }

        .sprouts-instructions li {
          margin-bottom: 0.25rem;
          color: #333;
        }

        .sprouts-visual-controls {
          display: flex;
          justify-content: center;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .visual-control-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .visual-control-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 1.1rem;
        }

        .visual-control-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 1.5rem;
        }

        .visual-control-item label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #555;
          font-size: 0.9rem;
        }

        .visual-control-item select {
          padding: 0.25rem 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          font-size: 0.9rem;
        }

        .visual-control-item input[type="checkbox"] {
          margin-right: 0.25rem;
        }
      `}</style>
    </div>
  );
};
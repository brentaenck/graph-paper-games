/**
 * @fileoverview EventBus system for framework component communication
 *
 * Provides a centralized event system for communication between game components,
 * UI elements, and the framework itself.
 */

import type { GameEvent, EventListener } from '@gpg/shared';

/**
 * Event topics for organizing different types of events
 */
export type EventTopic =
  | 'game' // Game state changes, moves, turn changes
  | 'ui' // UI interactions, clicks, hovers
  | 'net' // Network events, connections, disconnections
  | 'ai' // AI moves, hints, evaluations
  | 'system'; // System events, errors, warnings

/**
 * Typed event interfaces for different topics
 */
export interface GameStateEvent extends GameEvent {
  type: 'game:state-changed' | 'game:move' | 'game:turn-changed' | 'game:ended';
}

export interface UIEvent extends GameEvent {
  type: 'ui:click' | 'ui:hover' | 'ui:focus' | 'ui:resize';
}

export interface NetworkEvent extends GameEvent {
  type: 'net:connected' | 'net:disconnected' | 'net:reconnected' | 'net:error';
}

export interface AIEvent extends GameEvent {
  type: 'ai:move-calculated' | 'ai:hint-ready' | 'ai:evaluation-complete';
}

export interface SystemEvent extends GameEvent {
  type: 'system:error' | 'system:warning' | 'system:info';
}

/**
 * Union type of all possible events
 */
export type FrameworkEvent = GameStateEvent | UIEvent | NetworkEvent | AIEvent | SystemEvent;

/**
 * EventBus class for managing event subscriptions and emissions
 */
class EventBusImpl {
  private listeners: Map<string, Set<EventListener<any>>> = new Map();
  private wildcardListeners: Map<string, Set<EventListener<any>>> = new Map();

  /**
   * Subscribe to events with a specific type or pattern
   * @param pattern - Event type or pattern (supports wildcards like 'game:*')
   * @param listener - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  subscribe<T extends FrameworkEvent>(pattern: string, listener: EventListener<T>): () => void {
    if (pattern.includes('*')) {
      // Handle wildcard subscriptions
      const prefix = pattern.replace('*', '');
      if (!this.wildcardListeners.has(prefix)) {
        this.wildcardListeners.set(prefix, new Set());
      }
      this.wildcardListeners.get(prefix)!.add(listener);

      return () => {
        const listeners = this.wildcardListeners.get(prefix);
        if (listeners) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            this.wildcardListeners.delete(prefix);
          }
        }
      };
    } else {
      // Handle exact type subscriptions
      if (!this.listeners.has(pattern)) {
        this.listeners.set(pattern, new Set());
      }
      this.listeners.get(pattern)!.add(listener);

      return () => {
        const listeners = this.listeners.get(pattern);
        if (listeners) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            this.listeners.delete(pattern);
          }
        }
      };
    }
  }

  /**
   * Subscribe to an event type only once
   * @param pattern - Event type or pattern
   * @param listener - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  once<T extends FrameworkEvent>(pattern: string, listener: EventListener<T>): () => void {
    const unsubscribe = this.subscribe(pattern, (event: T) => {
      listener(event);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Emit an event to all matching subscribers
   * @param event - Event to emit
   */
  emit<T extends FrameworkEvent>(event: T): void {
    // Emit to exact type listeners
    const exactListeners = this.listeners.get(event.type);
    if (exactListeners) {
      exactListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }

    // Emit to wildcard listeners
    this.wildcardListeners.forEach((listeners, prefix) => {
      if (event.type.startsWith(prefix)) {
        listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`Error in wildcard listener for ${prefix}*:`, error);
          }
        });
      }
    });
  }

  /**
   * Remove all listeners for a specific pattern or all listeners
   * @param pattern - Optional pattern to clear (if not provided, clears all)
   */
  clear(pattern?: string): void {
    if (pattern) {
      if (pattern.includes('*')) {
        const prefix = pattern.replace('*', '');
        this.wildcardListeners.delete(prefix);
      } else {
        this.listeners.delete(pattern);
      }
    } else {
      this.listeners.clear();
      this.wildcardListeners.clear();
    }
  }

  /**
   * Get the number of listeners for a pattern
   * @param pattern - Pattern to count listeners for
   * @returns Number of listeners
   */
  listenerCount(pattern: string): number {
    if (pattern.includes('*')) {
      const prefix = pattern.replace('*', '');
      return this.wildcardListeners.get(prefix)?.size ?? 0;
    } else {
      return this.listeners.get(pattern)?.size ?? 0;
    }
  }

  /**
   * Get all active event patterns
   * @returns Array of active patterns
   */
  getPatterns(): string[] {
    const exactPatterns = Array.from(this.listeners.keys());
    const wildcardPatterns = Array.from(this.wildcardListeners.keys()).map(p => p + '*');
    return [...exactPatterns, ...wildcardPatterns];
  }
}

/**
 * Singleton EventBus instance
 */
export const EventBus = new EventBusImpl();

/**
 * Utility functions for creating typed events
 */
export const createEvent = {
  /**
   * Create a game state event
   */
  gameState: (type: GameStateEvent['type'], data: Record<string, unknown>): GameStateEvent => ({
    type,
    timestamp: new Date(),
    data,
  }),

  /**
   * Create a UI event
   */
  ui: (type: UIEvent['type'], data: Record<string, unknown>): UIEvent => ({
    type,
    timestamp: new Date(),
    data,
  }),

  /**
   * Create a network event
   */
  network: (type: NetworkEvent['type'], data: Record<string, unknown>): NetworkEvent => ({
    type,
    timestamp: new Date(),
    data,
  }),

  /**
   * Create an AI event
   */
  ai: (type: AIEvent['type'], data: Record<string, unknown>): AIEvent => ({
    type,
    timestamp: new Date(),
    data,
  }),

  /**
   * Create a system event
   */
  system: (type: SystemEvent['type'], data: Record<string, unknown>): SystemEvent => ({
    type,
    timestamp: new Date(),
    data,
  }),
};

/**
 * React hook for subscribing to events in components
 */
export function useEventBus<T extends FrameworkEvent>(
  pattern: string,
  listener: EventListener<T>,
  dependencies: React.DependencyList = []
): void {
  React.useEffect(() => {
    const unsubscribe = EventBus.subscribe(pattern, listener);
    return unsubscribe;
  }, dependencies);
}

// Import React for the hook
import * as React from 'react';

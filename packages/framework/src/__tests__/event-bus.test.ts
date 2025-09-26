import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EventBus, useEventBus, createEvent } from '../event-bus';
import type { GameStateEvent, UIEvent, NetworkEvent, AIEvent, SystemEvent } from '../event-bus';

describe('EventBus', () => {
  afterEach(() => {
    EventBus.clear();
  });

  describe('Basic functionality', () => {
    it('should subscribe and emit events', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('test:event', callback);
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
      
      expect(callback).toHaveBeenCalledWith(testEvent);
    });

    it('should support multiple subscribers for the same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      EventBus.subscribe('test:event', callback1);
      EventBus.subscribe('test:event', callback2);
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
      
      expect(callback1).toHaveBeenCalledWith(testEvent);
      expect(callback2).toHaveBeenCalledWith(testEvent);
    });

    it('should remove specific listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const unsubscribe1 = EventBus.subscribe('test:event', callback1);
      EventBus.subscribe('test:event', callback2);
      
      unsubscribe1();
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(testEvent);
    });

    it('should clear all listeners for an event type', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      EventBus.subscribe('test:event', callback1);
      EventBus.subscribe('test:event', callback2);
      EventBus.clear('test:event');
      
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should clear all listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      EventBus.subscribe('test1:event', callback1);
      EventBus.subscribe('test2:event', callback2);
      EventBus.clear();
      
      EventBus.emit({ type: 'test1:event' as const, timestamp: new Date(), data: {} });
      EventBus.emit({ type: 'test2:event' as const, timestamp: new Date(), data: {} });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('Wildcard patterns', () => {
    it('should handle wildcard subscriptions', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('game:*', callback);
      
      const moveEvent = { type: 'game:move' as const, timestamp: new Date(), data: { playerId: '1' } };
      const stateEvent = { type: 'game:state-changed' as const, timestamp: new Date(), data: { state: 'playing' } };
      
      EventBus.emit(moveEvent);
      EventBus.emit(stateEvent);
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, moveEvent);
      expect(callback).toHaveBeenNthCalledWith(2, stateEvent);
    });

    it('should not match incorrect wildcard patterns', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('game:*', callback);
      const uiEvent = { type: 'ui:click' as const, timestamp: new Date(), data: { elementId: 'button1' } };
      EventBus.emit(uiEvent);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle global wildcard subscriptions', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('*', callback);
      
      EventBus.emit({ type: 'game:move' as const, timestamp: new Date(), data: { playerId: '1' } });
      EventBus.emit({ type: 'ui:click' as const, timestamp: new Date(), data: { elementId: 'button1' } });
      EventBus.emit({ type: 'system:error' as const, timestamp: new Date(), data: { message: 'Error' } });
      
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('Typed events with createEvent helpers', () => {
    it('should handle GameStateEvent types', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('game:move', callback);
      const gameEvent = createEvent.gameState('game:move', { playerId: 'player1', move: { x: 1, y: 1 } });
      EventBus.emit(gameEvent);
      
      expect(callback).toHaveBeenCalledWith(gameEvent);
    });

    it('should handle UIEvent types', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('ui:click', callback);
      const uiEvent = createEvent.ui('ui:click', { 
        elementId: 'button1', 
        position: { x: 100, y: 50 }
      });
      EventBus.emit(uiEvent);
      
      expect(callback).toHaveBeenCalledWith(uiEvent);
    });

    it('should handle NetworkEvent types', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('net:connected', callback);
      const networkEvent = createEvent.network('net:connected', { 
        playerId: 'player1'
      });
      EventBus.emit(networkEvent);
      
      expect(callback).toHaveBeenCalledWith(networkEvent);
    });

    it('should handle AIEvent types', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('ai:move-calculated', callback);
      const aiEvent = createEvent.ai('ai:move-calculated', { 
        move: { x: 2, y: 3 },
        confidence: 0.85,
        depth: 5
      });
      EventBus.emit(aiEvent);
      
      expect(callback).toHaveBeenCalledWith(aiEvent);
    });

    it('should handle SystemEvent types', () => {
      const callback = vi.fn();
      
      EventBus.subscribe('system:error', callback);
      const systemEvent = createEvent.system('system:error', { 
        message: 'Test error',
        level: 'error'
      });
      EventBus.emit(systemEvent);
      
      expect(callback).toHaveBeenCalledWith(systemEvent);
    });
  });

  describe('Error handling', () => {
    it('should handle errors in event callbacks', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      EventBus.subscribe('test:event', errorCallback);
      EventBus.subscribe('test:event', normalCallback);
      
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: {} };
      EventBus.emit(testEvent);
      
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in event listener for test:event:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle removal of non-existent listeners gracefully', () => {
      expect(() => {
        EventBus.clear('nonexistent:event');
      }).not.toThrow();
    });
  });

  describe('Once functionality', () => {
    it('should support one-time event listeners', () => {
      const callback = vi.fn();
      
      EventBus.once('test:event', callback);
      
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
      EventBus.emit(testEvent);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(testEvent);
    });

    it('should return unsubscribe function for once listeners', () => {
      const callback = vi.fn();
      
      const unsubscribe = EventBus.once('test:event', callback);
      unsubscribe();
      
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Utility methods', () => {
    it('should count listeners correctly', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      expect(EventBus.listenerCount('test:event')).toBe(0);
      
      EventBus.subscribe('test:event', callback1);
      expect(EventBus.listenerCount('test:event')).toBe(1);
      
      EventBus.subscribe('test:event', callback2);
      expect(EventBus.listenerCount('test:event')).toBe(2);
    });

    it('should get active patterns', () => {
      EventBus.subscribe('test:event', vi.fn());
      EventBus.subscribe('game:*', vi.fn());
      
      const patterns = EventBus.getPatterns();
      expect(patterns).toContain('test:event');
      expect(patterns).toContain('game:*');
    });
  });
});

describe('useEventBus hook', () => {
  afterEach(() => {
    EventBus.clear();
  });

  it('should subscribe to events and clean up on unmount', () => {
    const callback = vi.fn();
    
    const { unmount } = renderHook(() => 
      useEventBus('test:event', callback)
    );
    
    act(() => {
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
    });
    
    expect(callback).toHaveBeenCalled();
    
    unmount();
    
    act(() => {
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'world' } };
      EventBus.emit(testEvent);
    });
    
    // Should not be called after unmount since listeners are cleaned up
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle dependency changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const { rerender } = renderHook(
      ({ callback }) => useEventBus('test:event', callback, [callback]),
      { initialProps: { callback: callback1 } }
    );
    
    act(() => {
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'hello' } };
      EventBus.emit(testEvent);
    });
    
    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    
    // Change the callback
    rerender({ callback: callback2 });
    
    act(() => {
      const testEvent = { type: 'test:event' as const, timestamp: new Date(), data: { message: 'world' } };
      EventBus.emit(testEvent);
    });
    
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalled();
  });

  it('should work with wildcard patterns', () => {
    const callback = vi.fn();
    
    renderHook(() => useEventBus('game:*', callback));
    
    act(() => {
      EventBus.emit({ type: 'game:move' as const, timestamp: new Date(), data: { playerId: 'player1' } });
      EventBus.emit({ type: 'game:state-changed' as const, timestamp: new Date(), data: { state: 'playing' } });
      EventBus.emit({ type: 'ui:click' as const, timestamp: new Date(), data: { elementId: 'button' } });
    });
    
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
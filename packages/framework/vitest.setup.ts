/**
 * @fileoverview Vitest setup for framework package
 */

import { beforeEach, vi } from 'vitest';
// Import jest-dom matchers
import '@testing-library/jest-dom';

// Create global mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  roundRect: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  createPattern: vi.fn().mockReturnValue('mock-pattern'),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  globalAlpha: 1,
  font: '',
  textAlign: 'left' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
};

// Create global mock for getBoundingClientRect
const mockGetBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 100,
  height: 100,
  right: 100,
  bottom: 100,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

// Make mocks available globally
global.mockContext = mockContext;
global.mockGetBoundingClientRect = mockGetBoundingClientRect;

// Setup Canvas API mocks
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);
HTMLCanvasElement.prototype.getBoundingClientRect = mockGetBoundingClientRect;

beforeEach(() => {
  // Clear all mock call history before each test
  Object.values(mockContext).forEach(mockFn => {
    if (typeof mockFn === 'function' && typeof mockFn.mockClear === 'function') {
      mockFn.mockClear();
    }
  });
  mockGetBoundingClientRect.mockClear();

  // Reset mock return values
  mockGetBoundingClientRect.mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

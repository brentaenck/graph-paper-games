import '@testing-library/jest-dom';

// Mock Canvas API for testing
const mockContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  strokeRect: vi.fn(),
  strokeText: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 50 })),
  arc: vi.fn(),
  arcTo: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  ellipse: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  rect: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  clip: vi.fn(),
  isPointInPath: vi.fn(),
  isPointInStroke: vi.fn(),
};

// Mock HTMLCanvasElement
class MockHTMLCanvasElement {
  width = 300;
  height = 150;
  
  getContext = vi.fn(() => mockContext);
  toDataURL = vi.fn(() => 'data:image/png;base64,mock');
  toBlob = vi.fn();
  getBoundingClientRect = vi.fn(() => ({
    left: 0,
    top: 0,
    right: 300,
    bottom: 150,
    width: 300,
    height: 150,
  }));
}

// Mock ResizeObserver for responsive components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTMLCanvasElement
(global as any).HTMLCanvasElement = MockHTMLCanvasElement;

// Mock timers for testing timer functionality
vi.useFakeTimers();

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();
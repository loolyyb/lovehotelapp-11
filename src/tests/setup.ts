import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, describe, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Make Vitest's expect, afterEach, etc. available globally
declare global {
  var describe: typeof describe;
  var it: typeof it;
  var expect: typeof expect;
  var beforeEach: typeof beforeEach;
  var afterEach: typeof afterEach;
  var vi: typeof vi;
}

globalThis.expect = expect;
globalThis.afterEach = afterEach;
globalThis.beforeEach = beforeEach;
globalThis.describe = describe;
globalThis.it = it;
globalThis.vi = vi;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Cleanup after each test
afterEach(() => {
  cleanup();
});

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
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

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(() => ({
    onupgradeneeded: vi.fn(),
    onsuccess: vi.fn(),
    onerror: vi.fn(),
  })),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
});

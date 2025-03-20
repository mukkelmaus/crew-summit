
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(() => ({
    onupgradeneeded: jest.fn(),
    onsuccess: jest.fn(),
    onerror: jest.fn(),
  })),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
});

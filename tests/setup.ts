import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(crypto, "randomUUID", {
  value: () => "test-uuid-" + Math.random().toString(36).substring(7),
});

// Mock fetch
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Global test setup file.
 * Auto-loaded by react-scripts (Jest) before each test file.
 */
import '@testing-library/jest-dom';

// Mock Firebase app — prevents real Firebase initialization during tests
jest.mock('./firebase/firebaseApp', () => {
  const mockRef = (path?: string) => ({
    push: () => ({ key: 'mock-push-key' }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    once: jest.fn().mockResolvedValue({ val: () => null }),
    on: jest.fn(),
    off: jest.fn(),
    child: mockRef,
    orderByChild: () => ({
      equalTo: () => ({
        once: jest.fn().mockResolvedValue({ val: () => null }),
      }),
    }),
  });

  return {
    __esModule: true,
    default: {
      database: () => ({
        ref: mockRef,
      }),
      auth: () => ({
        currentUser: null,
        signInWithEmailAndPassword: jest.fn(),
        signOut: jest.fn().mockResolvedValue(undefined),
        setPersistence: jest.fn().mockResolvedValue(undefined),
        onAuthStateChanged: jest.fn(),
      }),
      storage: () => ({
        ref: () => ({
          put: jest.fn(),
          getDownloadURL: jest.fn(),
          child: jest.fn(),
        }),
      }),
    },
  };
});

// Mock window.matchMedia — required by Material-UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
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

// Suppress console noise during tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

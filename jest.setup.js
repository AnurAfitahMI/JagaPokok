// jest.setup.js
// Mock React Native's Animated module
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Add global mocks
global.__DEV__ = true;

// Mock timers
jest.useFakeTimers();

// Mock AsyncStorage if used
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));
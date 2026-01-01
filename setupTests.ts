// setupTests.ts - Keep it minimal
// We already did most setup in jest.setup.js
// Just add test utilities here
import '@testing-library/jest-native';

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'test' } })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ 
    exists: () => true, 
    data: () => ({ name: 'Test Plant' }) 
  })),
}));

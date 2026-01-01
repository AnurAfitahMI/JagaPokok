const mockSetItem = jest.fn(() => Promise.resolve());
const mockGetItem = jest.fn(() => Promise.resolve(null));
const mockRemoveItem = jest.fn(() => Promise.resolve());
const mockClear = jest.fn(() => Promise.resolve());

// Mock AsyncStorage BEFORE importing the service
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: mockSetItem,
  getItem: mockGetItem,
  removeItem: mockRemoveItem,
  clear: mockClear,
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  getIosIdForVendorAsync: jest.fn(() => Promise.resolve('test-ios-id')),
  androidId: 'test-android-id',
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { generateDeviceId, getUserId, getUserName } from '../../services/userService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserId', () => {
    test('returns user ID from AsyncStorage', async () => {
      const mockUserId = 'user_12345';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockUserId);

      const result = await getUserId();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userId');
      expect(result).toBe(mockUserId);
    });

    test('returns null when no user ID exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getUserId();

      expect(result).toBe(null);
    });
  });

  describe('getUserName', () => {
    test('returns user name from AsyncStorage', async () => {
      const mockUserName = 'John Doe';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockUserName);

      const result = await getUserName();

      expect(result).toBe(mockUserName);
    });
  });

  describe('generateDeviceId', () => {
    test('generates iOS device ID', async () => {
      Platform.OS = 'ios';
      const mockIosId = 'ios-device-12345';
      (Application.getIosIdForVendorAsync as jest.Mock).mockResolvedValue(mockIosId);

      const result = await generateDeviceId();

      expect(result).toBe(`user_${mockIosId}`);
    });

    test('generates fallback ID when device ID is null', async () => {
      Platform.OS = 'ios';
      (Application.getIosIdForVendorAsync as jest.Mock).mockResolvedValue(null);

      const result = await generateDeviceId();

      expect(result).toMatch(/^user_device_\d+_[a-z0-9]+$/);
    });
  });
});

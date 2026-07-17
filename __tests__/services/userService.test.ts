jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('expo-application', () => ({
  getIosIdForVendorAsync: jest.fn(),
  getAndroidId: jest.fn(() => 'test-android-id'),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import {
  generateDeviceId,
  getUserId,
  getUserName,
} from '../../services/userService';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockGetIosIdForVendor =
  Application.getIosIdForVendorAsync as jest.Mock;

describe('userService', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';

    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('getUserId', () => {
    test('returns the stored user ID', async () => {
      mockGetItem.mockResolvedValue('user_12345');

      await expect(getUserId()).resolves.toBe('user_12345');
      expect(mockGetItem).toHaveBeenCalledWith('userId');
    });

    test('returns null when no user ID exists', async () => {
      mockGetItem.mockResolvedValue(null);

      await expect(getUserId()).resolves.toBeNull();
      expect(mockGetItem).toHaveBeenCalledWith('userId');
    });

    test('returns null when AsyncStorage fails', async () => {
      const storageError = new Error('Storage unavailable');
      mockGetItem.mockRejectedValue(storageError);

      await expect(getUserId()).resolves.toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting user ID:',
        storageError
      );
    });
  });

  describe('getUserName', () => {
    test('returns the stored user name', async () => {
      mockGetItem.mockResolvedValue('John Doe');

      await expect(getUserName()).resolves.toBe('John Doe');
      expect(mockGetItem).toHaveBeenCalledWith('userName');
    });

    test('returns null when no user name exists', async () => {
      mockGetItem.mockResolvedValue(null);

      await expect(getUserName()).resolves.toBeNull();
      expect(mockGetItem).toHaveBeenCalledWith('userName');
    });

    test('returns null when AsyncStorage fails', async () => {
      const storageError = new Error('Storage unavailable');
      mockGetItem.mockRejectedValue(storageError);

      await expect(getUserName()).resolves.toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting user name:',
        storageError
      );
    });
  });

  describe('generateDeviceId', () => {
    test('generates an ID from the iOS vendor ID', async () => {
      Platform.OS = 'ios';
      mockGetIosIdForVendor.mockResolvedValue('ios-device-12345');

      await expect(generateDeviceId()).resolves.toBe(
        'user_ios-device-12345'
      );
      expect(mockGetIosIdForVendor).toHaveBeenCalledTimes(1);
    });

    test('generates an ID from the Android ID', async () => {
      Platform.OS = 'android';

      await expect(generateDeviceId()).resolves.toBe(
        'user_test-android-id'
      );
      expect(mockGetIosIdForVendor).not.toHaveBeenCalled();
    });

    test('generates a deterministic fallback when the device ID is missing', async () => {
      Platform.OS = 'ios';
      mockGetIosIdForVendor.mockResolvedValue(null);

      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      await expect(generateDeviceId()).resolves.toBe(
        'user_device_1234567890_i'
      );
    });

    test('generates a fallback ID when device lookup fails', async () => {
      Platform.OS = 'ios';
      const deviceError = new Error('Device lookup failed');
      mockGetIosIdForVendor.mockRejectedValue(deviceError);

      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      await expect(generateDeviceId()).resolves.toBe(
        'user_1234567890_i'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating device ID:',
        deviceError
      );
    });
  });
});

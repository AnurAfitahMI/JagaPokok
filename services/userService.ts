import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getUserId = async (): Promise<string | null> => {
  try {
    const savedUserId = await AsyncStorage.getItem('userId');
    return savedUserId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const getUserName = async (): Promise<string | null> => {
  try {
    const userName = await AsyncStorage.getItem('userName');
    return userName;
  } catch (error) {
    console.error('Error getting user name:', error);
    return null;
  }
};

export const generateDeviceId = async (): Promise<string> => {
  try {
    let deviceId;
    
    if (Platform.OS === 'ios') {
      deviceId = await Application.getIosIdForVendorAsync();
    } else {
      deviceId = Application.getAndroidId();
    }
    
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return `user_${deviceId}`;
  } catch (error) {
    console.error('Error generating device ID:', error);
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
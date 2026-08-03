import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../api/axios';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('[push] Not a physical device, skipping');
    return { success: false, reason: 'not_physical_device' };
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1a365d',
      });
    } catch (err) {
      console.log('[push] Failed to set Android channel:', err.message);
    }
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted');
    return { success: false, reason: 'permission_denied' };
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId && projectId !== 'PLACEHOLDER-WILL-FILL-AT-EAS-SETUP'
        ? { projectId }
        : undefined
    );

    const token = tokenResponse.data;
    console.log('[push] Got Expo push token:', token);

    try {
      await api.post('/push/token', { push_token: token });
      console.log('[push] Token saved to backend');
      return { success: true, token };
    } catch (err) {
      console.log('[push] Failed to save token to backend:', err.message);
      return { success: false, reason: 'backend_save_failed', token };
    }
  } catch (err) {
    console.log('[push] Failed to get push token:', err.message);
    return { success: false, reason: 'token_fetch_failed', error: err.message };
  }
}

export async function clearPushToken() {
  try {
    await api.post('/push/token', { push_token: null });
    console.log('[push] Token cleared on backend');
  } catch (err) {
    console.log('[push] Failed to clear token:', err.message);
  }
}

export function addNotificationListeners({ onReceived, onTapped }) {
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response && onTapped) onTapped(response);
    })
    .catch(() => {});

  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[push] Notification received:', notification.request.content);
      if (onReceived) onReceived(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('[push] Notification tapped:', response.notification.request.content);
      if (onTapped) onTapped(response);
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

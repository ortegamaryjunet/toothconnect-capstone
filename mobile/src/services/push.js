import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../api/axios';

const ANDROID_PUSH_CHANNEL_ID = 'appointments-high';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function reportPushRegistrationStatus(status) {
  try {
    await api.post('/push/registration-status', {
      os: Platform.OS,
      device_name: Device.deviceName || Device.modelName || null,
      ...status,
    });
  } catch (err) {
    console.log('[push] Failed to report registration status:', err.message);
  }
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('[push] Not a physical device, skipping');
    const result = { success: false, reason: 'not_physical_device', stage: 'device_check' };
    await reportPushRegistrationStatus(result);
    return result;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(ANDROID_PUSH_CHANNEL_ID, {
        name: 'Appointment Alerts',
        importance: Notifications.AndroidImportance.MAX,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1a365d',
      });
    } catch (err) {
      console.log('[push] Failed to set Android channel:', err.message);
      await reportPushRegistrationStatus({
        success: false,
        reason: 'channel_setup_failed',
        stage: 'android_channel',
        error: err.message,
      });
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
    const result = {
      success: false,
      reason: 'permission_denied',
      stage: 'permission',
      existing_status: existingStatus,
      final_status: finalStatus,
    };
    await reportPushRegistrationStatus(result);
    return result;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  try {
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
      await reportPushRegistrationStatus({
        success: true,
        stage: 'backend_save',
        final_status: finalStatus,
        project_id: projectId || null,
      });
      return { success: true, token };
    } catch (err) {
      console.log('[push] Failed to save token to backend:', err.message);
      const result = {
        success: false,
        reason: 'backend_save_failed',
        stage: 'backend_save',
        error: err.response?.data?.message || err.message,
        final_status: finalStatus,
        project_id: projectId || null,
        token,
      };
      await reportPushRegistrationStatus(result);
      return result;
    }
  } catch (err) {
    console.log('[push] Failed to get push token:', err.message);
    const result = {
      success: false,
      reason: 'token_fetch_failed',
      stage: 'token_fetch',
      error: err.message,
      final_status: finalStatus,
      project_id: projectId || null,
    };
    await reportPushRegistrationStatus(result);
    return result;
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

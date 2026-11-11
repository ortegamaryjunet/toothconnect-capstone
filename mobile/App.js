import { useEffect } from 'react';
import { AuthProvider } from './src/auth/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { addNotificationListeners } from './src/services/push';
import ErrorBoundary from './src/components/ErrorBoundary';
import logger from './src/utils/logger';
import { handleNotificationNavigation } from './src/navigation/rootNavigation';
import { markNotificationRead } from './src/api/notifications';

// Forward fatal native errors to logger so they appear in crash logs
const _originalHandler = global.ErrorUtils?.getGlobalHandler?.();
global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
  logger.error('GlobalError', error?.message, { isFatal, stack: error?.stack });
  _originalHandler?.(error, isFatal);
});

export default function App() {
  useEffect(() => {
    const removeListeners = addNotificationListeners({
      onReceived: (notification) => {
        logger.info('App', 'Notification received', notification.request.content.title);
      },
      onTapped: (response) => {
        logger.info('App', 'Notification tapped', response.notification.request.content.title);
        const notificationId = response?.notification?.request?.content?.data?.notification_id;
        if (notificationId) {
          markNotificationRead(notificationId).catch((err) => {
            logger.error('App', 'Failed to mark tapped notification read', err?.message);
          });
        }
        handleNotificationNavigation(response);
      },
    });
    return removeListeners;
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

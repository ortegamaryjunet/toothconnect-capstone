import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingNotificationRoute = null;

function getNotificationRoute(data = {}) {
  const type = data.type || '';
  const appointmentId = data.appointment_id || data.related_id || null;

  if (type === 'message') {
    return { name: 'MessagesList' };
  }

  if (
    type.startsWith('appointment_') ||
    type === 'receipt_upload_enabled' ||
    type === 'receipt_validated' ||
    type === 'receipt_rejected'
  ) {
    return {
      name: 'Appointments',
      params: appointmentId ? { highlightAppointmentId: appointmentId } : undefined,
    };
  }

  if (type === 'recall' || type === 'system') {
    return { name: 'Notifications' };
  }

  return { name: 'Notifications' };
}

function navigateToRoute(route) {
  if (!route) return;

  if (navigationRef.isReady()) {
    navigationRef.navigate(route.name, route.params);
    pendingNotificationRoute = null;
  } else {
    pendingNotificationRoute = route;
  }
}

export function handleNotificationNavigation(response) {
  const data = response?.notification?.request?.content?.data || {};
  navigateToRoute(getNotificationRoute(data));
}

export function flushPendingNotificationNavigation() {
  if (pendingNotificationRoute) {
    navigateToRoute(pendingNotificationRoute);
  }
}

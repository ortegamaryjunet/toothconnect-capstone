import { useEffect, useState } from 'react';

import { getUnreadNotificationCount } from '../api/notifications';

const badgeStyle = {
  marginLeft: 'auto',
  minWidth: 22,
  height: 22,
  padding: '0 7px',
  borderRadius: 999,
  background: '#ef4444',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1,
  boxSizing: 'border-box',
};

export default function NotificationUnreadBadge({ count }) {
  const [unreadCount, setUnreadCount] = useState(Number(count || 0));
  const hasControlledCount = typeof count === 'number';

  useEffect(() => {
    if (hasControlledCount) {
      setUnreadCount(Number(count || 0));
      return undefined;
    }

    let cancelled = false;

    async function fetchUnreadCount() {
      try {
        const nextCount = await getUnreadNotificationCount();
        if (!cancelled) {
          setUnreadCount(nextCount);
        }
      } catch (err) {
        if (!cancelled) {
          setUnreadCount(0);
        }
      }
    }

    fetchUnreadCount();
    const intervalId = window.setInterval(fetchUnreadCount, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [count, hasControlledCount]);

  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span style={badgeStyle} aria-label={`${unreadCount} unread notifications`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}

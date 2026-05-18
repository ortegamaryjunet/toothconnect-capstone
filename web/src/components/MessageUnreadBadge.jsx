import { useEffect, useState } from 'react';

import { listThreads } from '../api/messages';

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

export default function MessageUnreadBadge({ count }) {
  const [unreadCount, setUnreadCount] = useState(Number(count || 0));
  const hasControlledCount = typeof count === 'number';
  const displayCount = hasControlledCount ? Number(count || 0) : unreadCount;

  useEffect(() => {
    if (hasControlledCount) {
      return undefined;
    }

    let cancelled = false;

    async function fetchUnreadCount() {
      try {
        const threads = await listThreads();
        const nextCount = (Array.isArray(threads) ? threads : []).reduce(
          (total, thread) => total + Number(thread.unread_count || 0),
          0
        );

        if (!cancelled) {
          setUnreadCount(nextCount);
        }
      } catch {
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

  if (displayCount <= 0) {
    return null;
  }

  return (
    <span style={badgeStyle} aria-label={`${displayCount} unread messages`}>
      {displayCount > 99 ? '99+' : displayCount}
    </span>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepNotificationsStyles from '../styles/RecepNotifications';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

export default function RecepNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [notificationError, setNotificationError] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1200;
  const isTablet = screenWidth <= 768;

  const styles = createRecepNotificationsStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
    isTablet,
  });

  const notificationCounts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(
      (notification) => notification.status === 'unread'
    ).length;
    const read = notifications.filter(
      (notification) => notification.status === 'read'
    ).length;

    return {
      total,
      read,
      unread,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return notifications.filter((notification) => {
      const searchableText = `${notification.title} ${notification.message} ${notification.time}`.toLowerCase();

      const matchesSearch = searchableText.includes(searchValue);

      const matchesFilter =
        activeFilter === 'all' || notification.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, activeFilter, searchText]);

  const receptionistName = user?.name || user?.email || 'Receptionist';

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalBodyOverflowY = document.body.style.overflowY;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflowX = originalBodyOverflowX;
      document.body.style.overflowY = originalBodyOverflowY;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function handleTabClick(filter) {
    setActiveFilter(filter);
  }

  async function fetchNotifications() {
    setLoading(true);
    setNotificationError('');

    try {
      const data = await listNotifications();
      setNotifications((data.notifications || []).map(mapNotification));
    } catch (err) {
      setNotificationError(
        err.response?.data?.message || 'Failed to load notifications.'
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      await markNotificationRead(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                status: 'read',
              }
            : notification
        )
      );
    } catch (err) {
      setNotificationError(
        err.response?.data?.message || 'Failed to mark notification as read.'
      );
    }
  }

  function getNotificationItemStyle(status) {
    if (status === 'unread') {
      return { ...styles.notificationItem, ...styles.notificationItemUnread };
    }
    return styles.notificationItem;
  }

  function getNotificationStatusStyle(status) {
    if (status === 'unread') {
      return { ...styles.notificationStatus, ...styles.notificationStatusUnread };
    }
    return { ...styles.notificationStatus, ...styles.notificationStatusRead };
  }

  function markAsUnread(notificationId) {
    api.patch(`/notifications/${notificationId}/unread`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, status: 'unread' } : n)
    );
  }

  async function markAllAsRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch {
      // silently ignore
    }
  }

  async function openNotification(notification) {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }

    if (notification.relatedType === 'payment' && notification.relatedId) {
      navigate(`/receptionistReceipts?highlightPaymentId=${notification.relatedId}`);
      return;
    }

    if (notification.relatedType === 'appointment' && notification.relatedId) {
      navigate('/receptionistAppointments');
      return;
    }

    if (notification.relatedType === 'inquiry') {
      navigate('/receptionistInquiries');
      return;
    }

    if (notification.relatedType === 'message') {
      navigate('/receptionistMessage');
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/receptionist" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/receptionistAppointments" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link to="/receptionistRecords" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/receptionistReceipts" style={styles.menuItem}>
            <i
              className="fi fi-rr-file-invoice-dollar"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Receipt Verification</span>
          </Link>

          <Link to="/receptionistPatientAcc" style={styles.menuItem}>
            <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Patient Account</span>
          </Link>

          <Link to="/receptionistInventory" style={styles.menuItem}>
            <i className="fi fi-rr-boxes" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Inventory</span>
          </Link>

          <Link to="/receptionistMessage" style={styles.menuItem}>
            <i
              className="fi fi-rr-comment-alt"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Messages</span>
            <MessageUnreadBadge />
          </Link>

          <Link to="/receptionistInquiries" style={styles.menuItem}>
            <i className="fi fi-rr-inbox-in" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Online Inquiries</span>
          </Link>

          <Link
            to="/receptionistNotif"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notification</span>
            <NotificationUnreadBadge count={notificationCounts.unread} />
          </Link>
        </nav>

        <div style={styles.logoutSection}>
          <button
            type="button"
            style={{ ...styles.menuItem, ...styles.logoutItem, width: '100%' }}
            onClick={openLogoutModal}
          >
            <i
              className="fi fi-rr-sign-out-alt"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={styles.mainContainer}>
        <header style={styles.topHeader}>
          <div style={styles.headerActions}>
            <div style={styles.profileDropdownWrapper} ref={profileMenuRef}>
              <button
                type="button"
                style={styles.receptProfile}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <div style={styles.avatar}>
                  <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
                </div>

                <div style={styles.receptInfo}>
                  <div style={styles.receptName}>{receptionistName}</div>
                  <div style={styles.receptPosition}>Receptionist</div>
                </div>
              </button>

              {showProfileMenu && (
                <div style={styles.profileDropdown}>
                  <Link
                    to="/receptionistProfile"
                    style={styles.viewProfileButton}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    View Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Clinic Notifications</span>

              <h2 style={styles.heroTitle}>
                Manage clinic alerts, reminders, and system updates.
              </h2>

              <p style={styles.heroText}>
                Monitor appointment cancellations, receipt uploads, messages,
                and important clinic activities.
              </p>
            </div>

            {!isMobile && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-bell-ring"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.notificationSummary}>
            <button
              type="button"
              style={{
                ...styles.summaryTab,
                ...(activeFilter === 'all' ? styles.summaryTabActive : {}),
              }}
              onClick={() => handleTabClick('all')}
            >
              All ({notificationCounts.total})
            </button>

            <button
              type="button"
              style={{
                ...styles.summaryTab,
                ...(activeFilter === 'read' ? styles.summaryTabActive : {}),
              }}
              onClick={() => handleTabClick('read')}
            >
              Read ({notificationCounts.read})
            </button>

            <button
              type="button"
              style={{
                ...styles.summaryTab,
                ...(activeFilter === 'unread' ? styles.summaryTabActive : {}),
              }}
              onClick={() => handleTabClick('unread')}
            >
              Unread ({notificationCounts.unread})
            </button>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search notification"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={styles.searchInput}
              />
            </div>
          </section>

          <section style={styles.notificationCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Notification List</h3>
              {notificationCounts.unread > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={styles.markAllBtn}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={styles.notificationList}>
              {notificationError && (
                <div style={styles.emptyNotification}>
                  <p style={styles.emptyNotificationText}>
                    {notificationError}
                  </p>
                </div>
              )}

              {loading ? (
                <div style={styles.emptyNotification}>
                  <p style={styles.emptyNotificationText}>
                    Loading notifications...
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div style={styles.emptyNotification}>
                  <i
                    className="fi fi-rr-bell-slash"
                    style={styles.emptyNotificationIcon}
                  ></i>
                  <p style={styles.emptyNotificationText}>
                    No notifications found.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{ ...getNotificationItemStyle(notification.status), cursor: 'pointer' }}
                    onClick={() => openNotification(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openNotification(notification);
                      }
                    }}
                  >
                    <span style={getNotificationStatusStyle(notification.status)}></span>

                    <div style={styles.notificationContent}>
                      <h4 style={styles.notificationTitle}>{notification.title}</h4>
                      <p style={styles.notificationMessage}>{notification.message}</p>
                      <div style={styles.notificationTime}>{notification.time}</div>
                    </div>

                    <div style={styles.notificationActions}>
                      {notification.status === 'unread' ? (
                        <button
                          type="button"
                          title="Mark as read"
                          onClick={(event) => {
                            event.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          style={{ ...styles.actionBtn, ...styles.readBtn }}
                        >
                          <i className="fi fi-rr-check"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Mark as unread"
                          onClick={(event) => {
                            event.stopPropagation();
                            markAsUnread(notification.id);
                          }}
                          style={{ ...styles.actionBtn, ...styles.unreadBtn }}
                        >
                          <i className="fi fi-rr-envelope"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {showLogoutModal && (
        <div style={styles.modal} onClick={handleModalOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Logout</h2>
            <p style={styles.modalText}>Are you sure you want to log out?</p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mapNotification(notification = {}) {
  const title = notification.title || formatNotificationType(notification.type);

  return {
    id: notification.id,
    title:
      title === 'New receipt pending validation'
        ? 'New receipt pending acknowledgement'
        : title,
    message: notification.body || '',
    time: formatNotificationTime(notification.created_at),
    status: notification.is_read ? 'read' : 'unread',
    type: notification.type || '',
    relatedType: notification.related_type || '',
    relatedId: notification.related_id || '',
  };
}

function formatNotificationType(type) {
  return String(type || 'notification')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNotificationTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}


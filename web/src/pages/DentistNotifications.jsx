import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import createDentistNotificationsStyles from '../styles/DentistNotifications';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import DentistProfileMenu from '../components/DentistProfileMenu';
import { markAllNotificationsRead } from '../api/notifications';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/clinicLogo/clinic-logo-nav.png';

function formatNotifTime(createdAt) {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DentistNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [serviceNames, setServiceNames] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState([]);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistNotificationsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const totalNotif = notifications.length;

  const readNotif = notifications.filter(
    (notification) => notification.status === 'read'
  ).length;

  const unreadNotif = notifications.filter(
    (notification) => notification.status === 'unread'
  ).length;

  const notificationCount = unreadNotif;

  useEffect(() => {
    api.get('/auth/staff-profile/me')
      .then(res => setServiceNames(res.data.profile?.serviceNames || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    function fetchNotifications() {
      api.get('/notifications')
        .then(res => {
          if (cancelled) return;
          const rows = res.data.notifications || [];
          setNotifications(rows.map(n => ({
            id: n.id,
            status: n.is_read ? 'read' : 'unread',
            title: n.title || '',
            message: n.body || '',
            time: formatNotifTime(n.created_at),
            relatedType: n.related_type,
            relatedId: n.related_id,
          })));
        })
        .catch(() => {});
    }

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
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
    const originalHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return notifications.filter((notification) => {
      const status = String(notification.status || '').toLowerCase();

      const searchableText = [
        notification.title,
        notification.message,
        notification.time,
        notification.relatedType,
        notification.relatedId
      ]
        .filter(value => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      const matchesStatus =
        activeTab === 'all' || status === activeTab;

      const matchesSearch =
        search === '' || searchableText.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [notifications, activeTab, searchValue]);

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

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  function getNotificationItemStyle(status) {
    if (status === 'unread') {
      return {
        ...styles.notificationItem,
        ...styles.notificationItemUnread,
      };
    }

    return styles.notificationItem;
  }

  function getNotificationStatusStyle(status) {
    if (status === 'unread') {
      return {
        ...styles.notificationStatus,
        ...styles.notificationStatusUnread,
      };
    }

    return {
      ...styles.notificationStatus,
      ...styles.notificationStatusRead,
    };
  }

  function markAsRead(notificationId) {
    api.patch(`/notifications/${notificationId}/read`).catch(() => {});
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
    );
  }

  function markAsUnread(notificationId) {
    api.patch(`/notifications/${notificationId}/unread`).catch(() => {});
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, status: 'unread' } : n)
    );
  }

  function markAllAsRead() {
    markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
  }

  function openNotification(notification) {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
    if (notification.relatedType === 'appointment') {
      navigate('/dentistAppointment');
      return;
    }
    if (notification.relatedType === 'patient') {
      navigate('/dentistRecords');
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/dentist" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/dentistAppointment" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link to="/dentistRecords" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/dentistProfile" style={styles.menuItem}>
            <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>View Profile</span>
          </Link>

          <Link to="/dentistSchedule" style={styles.menuItem}>
            <i className="fi fi-rr-calendar" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>My Schedule</span>
          </Link>

          <Link
            to="/dentistNotif"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
            <NotificationUnreadBadge count={notificationCount} />
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
            <DentistProfileMenu
              styles={styles}
              dentistName={user?.name || 'Dentist'}
              specialization="Dentist"
            />
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Dentist Notifications</span>

              <h2 style={styles.heroTitle}>
                Stay updated with your appointments and patient activities.
              </h2>

              <p style={styles.heroText}>
                Review schedule alerts, patient updates, and clinic reminders
                assigned to your care.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i className="fi fi-rr-bell-ring" style={styles.heroIconText}></i>
            </div>
          </section>

          <section style={styles.notificationSummary}>
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              style={{
                ...styles.summaryTab,
                ...(activeTab === 'all' ? styles.summaryTabActive : {}),
              }}
            >
              All ({totalNotif})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('read')}
              style={{
                ...styles.summaryTab,
                ...(activeTab === 'read' ? styles.summaryTabActive : {}),
              }}
            >
              Read ({readNotif})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('unread')}
              style={{
                ...styles.summaryTab,
                ...(activeTab === 'unread' ? styles.summaryTabActive : {}),
              }}
            >
              Unread ({unreadNotif})
            </button>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="search"
                placeholder="Search notification"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSearchValue('');
                  }
                }}
                aria-label="Search notifications"
                style={styles.searchInput}
              />
            </div>
          </section>

          <section style={styles.notificationCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Notification List</h3>
              {unreadNotif > 0 && (
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
              {filteredNotifications.length === 0 ? (
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
                    <span
                      style={getNotificationStatusStyle(notification.status)}
                    ></span>

                    <div style={styles.notificationContent}>
                      <h4 style={styles.notificationTitle}>
                        {notification.title}
                      </h4>

                      <p style={styles.notificationMessage}>
                        {notification.message}
                      </p>

                      <div style={styles.notificationTime}>
                        {notification.time}
                      </div>
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
                          style={{
                            ...styles.actionBtn,
                            ...styles.readBtn,
                          }}
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
                          style={{
                            ...styles.actionBtn,
                            ...styles.unreadBtn,
                          }}
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
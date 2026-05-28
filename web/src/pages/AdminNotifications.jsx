import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import clinicLogo from '../assets/adminImages/clinic-logo.png';
import createAdminNotifStyles from '../styles/AdminNotifications';
import api from '../api/axios';
import { markAllNotificationsRead } from '../api/notifications';
import { useAuth } from '../auth/AuthContext';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

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

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMobile = screenWidth <= 850;
  const isTablet = screenWidth > 850 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminNotifStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const notificationCounts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => n.status === 'unread').length;
    const read = notifications.filter((n) => n.status === 'read').length;
    return { total, read, unread };
  }, [notifications]);

  const { total: totalNotif, read: readNotif, unread: unreadNotif } = notificationCounts;
  const notificationCount = unreadNotif;

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
          setLoading(false);
        })
        .catch(() => { setLoading(false); });
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
    return notifications.filter((notification) => {
      const search = searchValue.toLowerCase().trim();

      const title = String(notification.title).toLowerCase();
      const message = String(notification.message).toLowerCase();
      const time = String(notification.time).toLowerCase();
      const status = String(notification.status).toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        message.includes(search) ||
        time.includes(search);

      const matchesTab = activeTab === 'all' || status === activeTab;

      return matchesSearch && matchesTab;
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

  function markAsRead(notificationId) {
    api.patch(`/notifications/${notificationId}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, status: 'read' } : n)
    );
  }

  function markAsUnread(notificationId) {
    api.patch(`/notifications/${notificationId}/unread`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, status: 'unread' } : n)
    );
  }

  function markAllAsRead() {
    markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
  }

  function openNotification(notification) {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }

    const { relatedType, relatedId } = notification;

    if (relatedType === 'inventory') {
      const qs = relatedId ? `?highlightItemId=${relatedId}` : '';
      navigate(`/adminInventory${qs}`);
      return;
    }

    if (relatedType === 'appointment') {
      navigate('/admin');
      return;
    }

    if (relatedType === 'patient') {
      const qs = relatedId ? `?highlightPatientId=${relatedId}` : '';
      navigate(`/adminPatients${qs}`);
      return;
    }

    if (relatedType === 'schedule_request') {
      const qs = relatedId ? `?highlightRequestId=${relatedId}` : '';
      navigate(`/adminSettings${qs}`);
      return;
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/adminPatients" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/adminEmployees" style={styles.menuItem}>
            <i
              className="fi fi-rr-stethoscope"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Clinic Employee</span>
          </Link>

          <Link to="/adminInventory" style={styles.menuItem}>
            <i className="fi fi-rr-boxes" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Inventory</span>
          </Link>

          <Link to="/adminLogs" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-list"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Audit Logs</span>
          </Link>

          <Link
            to="/adminNotif"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
            <NotificationUnreadBadge count={notificationCount} />
          </Link>

          <Link to="/adminReports" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-line-up"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Reports</span>
          </Link>

          <Link to="/adminSettings" style={styles.menuItem}>
            <i className="fi fi-rr-settings" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Settings</span>
          </Link>
        </nav>

        <div style={styles.logoutSection}>
          <div style={styles.dropdownDivider}></div>

          <button
            type="button"
            style={{ ...styles.menuItem, ...styles.logoutItem, width: '100%' }}
            onClick={openLogoutModal}
          >
            <i className="fi fi-rr-sign-out-alt" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={styles.mainContainer}>
        <header style={styles.topHeader}>
          <div style={styles.headerActions}>
            <div style={styles.adminProfile}>
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.adminInfo}>
                <div style={styles.adminName}>{adminName}</div>
                <div style={styles.adminPosition}>Admin</div>
              </div>
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
                Monitor appointments, inventory alerts, patient updates, and
                important clinic activities.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i className="fi fi-rr-bell-ring" style={styles.heroIcon}></i>
            </div>
          </section>

          <section style={styles.notificationSummary}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                ...styles.summaryTab,
                ...(activeTab === 'all' ? styles.summaryTabActive : {}),
              }}
            >
              All ({totalNotif})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('read')}
              style={{
                ...styles.summaryTab,
                ...(activeTab === 'read' ? styles.summaryTabActive : {}),
              }}
            >
              Read ({readNotif})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unread')}
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
                type="text"
                placeholder="Search notification"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={styles.searchInput}
              />
            </div>
          </section>

          <section style={styles.notificationCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Notification List</h3>
              {notificationCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={styles.markAllBtn}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = '#d4af37';
                    event.currentTarget.style.color = '#ffffff';
                    event.currentTarget.style.borderColor = '#d4af37';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = '#fff8e1';
                    event.currentTarget.style.color = '#b8860b';
                    event.currentTarget.style.borderColor = '#f3d46b';
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={styles.notificationList}>
              {loading ? (
                <div style={styles.emptyNotification}>
                  <p style={styles.emptyNotificationText}>Loading notifications...</p>
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
            <h2 style={styles.modalTitle}>Confirm Logout</h2>

            <div style={styles.modalDivider}></div>

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

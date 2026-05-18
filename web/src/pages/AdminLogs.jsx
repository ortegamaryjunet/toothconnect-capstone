import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import createAdminLogsStyles from '../styles/AdminLogs';
import { listAuditLogs } from '../api/auditLogs';
import { useAuth } from '../auth/AuthContext';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

export default function AdminLogs() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState([]);

  const rowsPerPage = 10;

  const MODULE_MAP = {
    login_success: 'Authentication',
    login_failed: 'Authentication',
    logout: 'Authentication',
    password_changed: 'Authentication',
    appointment_created: 'Appointments',
    appointment_cancelled: 'Appointments',
    appointment_status_changed: 'Appointments',
    appointment_consumption: 'Inventory',
    payment_recorded_by_staff: 'Payments',
    payment_status_updated: 'Payments',
    payment_receipt_reupload_enabled: 'Payments',
    payment_amount_updated: 'Payments',
    treatment_created: 'Patient Records',
    treatment_deleted: 'Patient Records',
    inventory_restock: 'Inventory',
    inventory_purchase_expense: 'Inventory',
  };

  const ACTION_LABEL_MAP = {
    login_success: 'Logged in',
    login_failed: 'Failed login attempt',
    logout: 'Logged out',
    password_changed: 'Changed password',
    appointment_created: 'Created appointment',
    appointment_cancelled: 'Cancelled appointment',
    appointment_status_changed: 'Updated appointment status',
    appointment_consumption: 'Recorded service consumption',
    payment_recorded_by_staff: 'Recorded payment',
    payment_status_updated: 'Updated payment status',
    payment_receipt_reupload_enabled: 'Enabled receipt reupload',
    payment_amount_updated: 'Updated payment amount',
    treatment_created: 'Added treatment',
    treatment_deleted: 'Deleted treatment',
    inventory_restock: 'Restocked inventory',
    inventory_purchase_expense: 'Created purchase expense',
  };

  function formatLogDateTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${year}-${month}-${day} ${time}`;
  }

  useEffect(() => {
    listAuditLogs()
      .then(data => {
        const rows = (data.logs || []).map(row => ({
          id: row.id,
          dateTime: formatLogDateTime(row.created_at),
          role: row.user_role ? row.user_role.charAt(0).toUpperCase() + row.user_role.slice(1) : 'Unknown',
          name: row.user_name || 'Unknown',
          action: ACTION_LABEL_MAP[row.action] || row.action,
          module: MODULE_MAP[row.action] || 'System',
          deviceBrowser: row.device_browser || 'N/A',
          status: row.log_status === 'failed' ? 'Failed' : 'Success',
        }));
        setAuditLogs(rows);
      })
      .catch(() => {});
  }, []);

  const isMobile = screenWidth <= 850;
  const isTablet = screenWidth > 850 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminLogsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

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

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const search = searchValue.toLowerCase().trim();

      const name = String(log.name).toLowerCase();
      const action = String(log.action).toLowerCase();
      const module = String(log.module).toLowerCase();
      const role = String(log.role).toLowerCase();

      const rowDate = String(log.dateTime).substring(0, 10);

      const matchesSearch =
        name.includes(search) ||
        action.includes(search) ||
        module.includes(search);

      const matchesDate = !dateFilter || rowDate === dateFilter;

      const matchesRole =
        roleFilter === 'all' || role === roleFilter.toLowerCase();

      return matchesSearch && matchesDate && matchesRole;
    });
  }, [auditLogs, searchValue, dateFilter, roleFilter]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredLogs.slice(start, end);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, dateFilter, roleFilter]);

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

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  function getStatusStyle(status) {
    if (String(status).toLowerCase() === 'failed') {
      return {
        ...styles.statusBadge,
        ...styles.statusFailed,
      };
    }

    return {
      ...styles.statusBadge,
      ...styles.statusSuccess,
    };
  }

  function getStatusIcon(status) {
    if (String(status).toLowerCase() === 'failed') {
      return 'fi fi-rr-cross-circle';
    }

    return 'fi fi-rr-check-circle';
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i className="fi fi-rr-apps" style={styles.menuItemIcon}></i>
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

          <Link
            to="/adminLogs"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i
              className="fi fi-rr-clipboard-list"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Audit Logs</span>
          </Link>

          <Link to="/adminNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
            <NotificationUnreadBadge />
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
              <span style={styles.heroBadge}>Audit Logs</span>

              <h2 style={styles.heroTitle}>
                Monitor staff activity, access logs, and system records.
              </h2>

              <p style={styles.heroText}>
                Track admin, dentist, and receptionist actions in one organized
                audit log.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i
                className="fi fi-rr-clipboard-list-check"
                style={styles.heroIcon}
              ></i>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search name, action, or module"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.rightActions}>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                style={styles.dateFilter}
              />

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                style={styles.roleFilter}
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Dentist">Dentist</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Activity Records</h3>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.auditTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Date | Time</th>
                    <th style={styles.tableHead}>Role Type</th>
                    <th style={styles.tableHead}>Name</th>
                    <th style={styles.tableHead}>Action Type</th>
                    <th style={styles.tableHead}>Module / Section</th>
                    <th style={styles.tableHead}>Device / Browser</th>
                    <th style={styles.tableHead}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        No audit records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{log.dateTime}</td>
                        <td style={styles.tableCell}>{log.role}</td>
                        <td style={styles.tableCell}>{log.name}</td>
                        <td style={styles.tableCell}>{log.action}</td>
                        <td style={styles.tableCell}>{log.module}</td>
                        <td style={styles.tableCell}>{log.deviceBrowser}</td>
                        <td style={styles.tableCell}>
                          <span style={getStatusStyle(log.status)}>
                            <i
                              className={getStatusIcon(log.status)}
                              style={styles.statusIcon}
                            ></i>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.pagination}>
              <button
                type="button"
                onClick={prevPage}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                }}
              >
                <i className="fi fi-rr-angle-left"></i>
              </button>

              <span style={styles.pageInfo}>
                {filteredLogs.length === 0
                  ? 'Page 0 of 0'
                  : `Page ${currentPage} of ${totalPages}`}
              </span>

              <button
                type="button"
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
                }}
              >
                <i className="fi fi-rr-angle-right"></i>
              </button>
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
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={handleLogout}
              >
                Logout
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

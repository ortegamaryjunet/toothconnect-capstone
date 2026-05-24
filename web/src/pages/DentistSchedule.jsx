import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import createDentistScheduleStyles from '../styles/DentistSchedule';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';

function formatReadableDate(value) {
  if (!value) return '-';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateRange(from, to) {
  const normalize = (value) => {
    if (!value) return '';
    return String(value).split('T')[0];
  };
  const start = normalize(from);
  const end = normalize(to);
  if (start && end) return `${start} - ${end}`;
  return start || end || '-';
}

function formatSubmittedDate(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DentistSchedule() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [serviceNames, setServiceNames] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistScheduleStyles({ isMobile, isTablet, isSmallScreen });

  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Sunday', status: 'Off', time: '-', branchAddress: null },
    { day: 'Monday', status: 'Off', time: '-', branchAddress: null },
    { day: 'Tuesday', status: 'Off', time: '-', branchAddress: null },
    { day: 'Wednesday', status: 'Off', time: '-', branchAddress: null },
    { day: 'Thursday', status: 'Off', time: '-', branchAddress: null },
    { day: 'Friday', status: 'Off', time: '-', branchAddress: null },
    { day: 'Saturday', status: 'Off', time: '-', branchAddress: null },
  ]);
  const [scheduleInfo, setScheduleInfo] = useState({
    branchName: '-',
    workingDays: '-',
    workingTime: '-',
    todayBranchAddress: 'Off',
  });
  const [requestHistory, setRequestHistory] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ dateFrom: '', dateTo: '', reason: '' });

  function loadRequests() {
    setRequestLoading(true);
    api.get('/dentist-dashboard/schedule-requests')
      .then((res) => setRequestHistory(res.data || []))
      .catch(() => {})
      .finally(() => setRequestLoading(false));
  }

  useEffect(() => { loadRequests(); }, []);

  useEffect(() => {
    api.get('/auth/staff-profile/me')
      .then((res) => setServiceNames(res.data.profile?.serviceNames || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/dentist-dashboard/schedule')
      .then((res) => {
        const d = res.data;
        setWeeklySchedule(d.weeklySchedule || []);
        setScheduleInfo({
          branchName: d.branchName || '-',
          workingDays: d.workingDays || '-',
          workingTime: d.workingTime || '-',
          todayBranchAddress: d.todayBranchAddress || 'Off',
        });
      })
      .catch(() => {});
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
    if (showLogoutModal || showLeaveModal || selectedRequest) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showLeaveModal, selectedRequest]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        setShowLeaveModal(false);
        setSelectedRequest(null);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
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

  function handleLeaveOverlayClick(event) {
    if (event.target === event.currentTarget) setShowLeaveModal(false);
  }

  function handleDetailsOverlayClick(event) {
    if (event.target === event.currentTarget) setSelectedRequest(null);
  }

  function handleLeaveChange(field, value) {
    setLeaveForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleLeaveSubmit() {
    setSubmitError('');
    api.post('/dentist-dashboard/schedule-requests', {
      request_type: 'leave',
      date_from: leaveForm.dateFrom,
      date_to: leaveForm.dateTo,
      reason: leaveForm.reason,
    })
      .then(() => {
        setShowLeaveModal(false);
        setLeaveForm({ dateFrom: '', dateTo: '', reason: '' });
        loadRequests();
      })
      .catch((err) => {
        setSubmitError(err.response?.data?.message || 'Failed to submit request');
      });
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

          <Link
            to="/dentistSchedule"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i className="fi fi-rr-calendar" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>My Schedule</span>
          </Link>

          <Link to="/dentistNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
            <NotificationUnreadBadge />
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
            <div style={styles.doctorProfile}>
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.doctorInfo}>
                <div style={styles.doctorName}>{user?.name || 'Dentist'}</div>
                <div style={styles.doctorSpecialization}>{serviceNames || 'Dentist'}</div>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Schedule Overview</span>

              <h2 style={styles.heroTitle}>
                Manage your branch, working days, and schedule requests
              </h2>

              <p style={styles.heroText}>
                View your weekly schedule and track leave and transfer requests.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i className="fi fi-rr-calendar" style={styles.heroIconText}></i>
            </div>
          </section>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>Current Branch</p>
              <h3 style={styles.infoValue}>{scheduleInfo.branchName}</h3>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>Today's Branch</p>
              <h3 style={styles.infoValue}>{scheduleInfo.todayBranchAddress || 'Off'}</h3>
            </div>
            
            <section style={styles.actionCard}>
              <div style={styles.actionRow}>
                <h2 style={styles.actionTitle}>Leave Request</h2>
                <p style={styles.actionText}>
                  Submit a leave request for a day or multiple days.
                </p>
              </div>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => {
                  setSubmitError('');
                  setShowLeaveModal(true);
                }}
              >
                Request Leave
              </button>
            </section>
          </div>

          <div style={styles.mainGrid}>
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Weekly Schedule</h2>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Day</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {weeklySchedule.map((item) => (
                      <tr key={item.day} style={styles.tr}>
                        <td style={styles.td}>{item.day}</td>
                        <td
                          style={{
                            ...styles.td,
                            ...(item.branchAddress
                              ? styles.workingText
                              : styles.offText),
                          }}
                        >
                          {item.branchAddress || 'Off'}
                        </td>
                        <td style={styles.td}>{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Request History</h2>
              </div>

              <div style={styles.requestList}>
                {requestLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '13px' }}>
                    Loading...
                  </div>
                ) : requestHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '13px' }}>
                    No requests found.
                  </div>
                ) : (
                  requestHistory.map((request) => {
                    const isLeave = request.request_type === 'leave';
                    const title = isLeave ? 'Leave Request' : 'Branch Transfer Request';
                    const subtitle = isLeave
                      ? formatDateRange(request.date_from, request.date_to)
                      : `To: ${request.requested_branch_name || '-'} (${request.transfer_type || ''})`;
                    const statusLabel = request.status.charAt(0).toUpperCase() + request.status.slice(1);
                    const isPending = request.status === 'pending';
                    const isApproved = request.status === 'approved';
                    const submittedDate = formatSubmittedDate(request.submitted_at);

                    return (
                      <div key={request.id} style={styles.requestItem}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(isPending
                              ? styles.pendingBadge
                              : isApproved
                                ? styles.approvedBadge
                                : { backgroundColor: '#fee2e2', color: '#b91c1c' }),
                          }}
                        >
                          {statusLabel}
                        </span>

                        <div style={styles.requestInfo}>
                          <h4 style={styles.requestTitle}>{title}</h4>
                          <p style={styles.requestSubtitle}>{subtitle}</p>
                        </div>

                        <div style={styles.requestDate}>
                          <p style={styles.requestDateText}>{submittedDate}</p>
                          <button
                            type="button"
                            style={styles.requestDetailsButton}
                            onClick={() => setSelectedRequest(request)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {requestHistory.length > 0 && (
                <p style={styles.requestCount}>
                  Showing {requestHistory.length} of {requestHistory.length} requests
                </p>
              )}
            </section>
          </div>
        </main>
      </div>

      {showLeaveModal && (
        <div style={styles.modal} onClick={handleLeaveOverlayClick}>
          <div
            style={{
              ...styles.modalContent,
              width: isMobile ? '92vw' : '420px',
              maxWidth: isMobile ? '92vw' : '90vw',
              textAlign: 'left',
              padding: isMobile ? '22px 18px' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ ...styles.modalTitle, margin: 0 }}>Leave Request</h2>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#64748b', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0f1b3d', marginBottom: '6px' }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={leaveForm.dateFrom}
                  onChange={(e) => handleLeaveChange('dateFrom', e.target.value)}
                  style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0f1b3d', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0f1b3d', marginBottom: '6px' }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={leaveForm.dateTo}
                  min={leaveForm.dateFrom || undefined}
                  onChange={(e) => handleLeaveChange('dateTo', e.target.value)}
                  style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0f1b3d', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0f1b3d', marginBottom: '6px' }}>
                Reason
              </label>
              <textarea
                rows={4}
                placeholder="Describe the reason for your leave..."
                value={leaveForm.reason}
                onChange={(e) => handleLeaveChange('reason', e.target.value)}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#0f1b3d', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {submitError ? <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>{submitError}</p> : null}
            <div style={{ ...styles.modalActions, justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => {
                  setShowLeaveModal(false);
                  setSubmitError('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, background: 'linear-gradient(135deg, #8b6508, #d4af37)', color: '#ffffff' }}
                onClick={handleLeaveSubmit}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div style={styles.modal} onClick={handleDetailsOverlayClick}>
          <div style={{ ...styles.modalContent, ...styles.detailsModalContent }}>
            <div style={styles.detailsModalHeader}>
              <h2 style={{ ...styles.modalTitle, margin: 0 }}>Submitted Request Details</h2>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                style={styles.detailsCloseButton}
              >
                &times;
              </button>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.detailsField}>
                <div style={styles.detailsLabel}>Request Type</div>
                <div style={styles.detailsValue}>
                  {selectedRequest.request_type === 'leave' ? 'Leave Request' : 'Branch Transfer Request'}
                </div>
              </div>

              <div style={styles.detailsField}>
                <div style={styles.detailsLabel}>Status</div>
                <div style={styles.detailsValue}>
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </div>
              </div>

              <div style={styles.detailsField}>
                <div style={styles.detailsLabel}>Submitted On</div>
                <div style={styles.detailsValue}>{formatSubmittedDate(selectedRequest.submitted_at)}</div>
              </div>

              {selectedRequest.request_type === 'leave' ? (
                <div style={styles.detailsField}>
                  <div style={styles.detailsLabel}>Date Range</div>
                  <div style={styles.detailsValue}>
                    {formatDateRange(selectedRequest.date_from, selectedRequest.date_to)}
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.detailsField}>
                    <div style={styles.detailsLabel}>Requested Branch</div>
                    <div style={styles.detailsValue}>{selectedRequest.requested_branch_name || '-'}</div>
                  </div>
                  <div style={styles.detailsField}>
                    <div style={styles.detailsLabel}>Transfer Type</div>
                    <div style={styles.detailsValue}>{selectedRequest.transfer_type || '-'}</div>
                  </div>
                </>
              )}

              {selectedRequest.date_from && (
                <div style={styles.detailsField}>
                  <div style={styles.detailsLabel}>From Date</div>
                  <div style={styles.detailsValue}>{formatReadableDate(selectedRequest.date_from)}</div>
                </div>
              )}

              {selectedRequest.date_to && (
                <div style={styles.detailsField}>
                  <div style={styles.detailsLabel}>To Date</div>
                  <div style={styles.detailsValue}>{formatReadableDate(selectedRequest.date_to)}</div>
                </div>
              )}

              {selectedRequest.duration && (
                <div style={styles.detailsField}>
                  <div style={styles.detailsLabel}>Duration</div>
                  <div style={styles.detailsValue}>{selectedRequest.duration}</div>
                </div>
              )}

              <div style={{ ...styles.detailsField, ...styles.detailsFieldFull }}>
                <div style={styles.detailsLabel}>Reason</div>
                <div style={styles.detailsTextarea}>
                  {selectedRequest.reason?.trim() || 'No reason provided.'}
                </div>
              </div>
            </div>

            <div style={{ ...styles.modalActions, justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

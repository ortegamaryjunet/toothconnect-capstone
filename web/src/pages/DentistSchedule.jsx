import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import createDentistScheduleStyles from '../styles/DentistSchedule';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import DentistProfileMenu from '../components/DentistProfileMenu';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';

function normalizeDate(value) {
  if (!value) return '';
  return String(value).split('T')[0];
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatReadableDate(value) {
  const cleanValue = normalizeDate(value);

  if (!cleanValue) return '-';

  const parsed = new Date(`${cleanValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return cleanValue;

  return parsed.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateRange(from, to) {
  const start = normalizeDate(from);
  const end = normalizeDate(to);

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

function getLeaveDays(from, to) {
  const start = normalizeDate(from);
  const end = normalizeDate(to);

  if (!start || !end) return 0;

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  const difference = endDate.getTime() - startDate.getTime();

  if (difference < 0) return 0;

  return Math.floor(difference / 86400000) + 1;
}

function dateRangesOverlap(aFrom, aTo, bFrom, bTo) {
  const aStart = new Date(`${normalizeDate(aFrom)}T00:00:00`);
  const aEnd = new Date(`${normalizeDate(aTo)}T00:00:00`);
  const bStart = new Date(`${normalizeDate(bFrom)}T00:00:00`);
  const bEnd = new Date(`${normalizeDate(bTo)}T00:00:00`);

  if (
    Number.isNaN(aStart.getTime()) ||
    Number.isNaN(aEnd.getTime()) ||
    Number.isNaN(bStart.getTime()) ||
    Number.isNaN(bEnd.getTime())
  ) {
    return false;
  }

  return aStart <= bEnd && bStart <= aEnd;
}

export default function DentistSchedule() {
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showLeaveCancelConfirmModal, setShowLeaveCancelConfirmModal] = useState(false);
  const [showLeaveConflictModal, setShowLeaveConflictModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

  const [validationTitle, setValidationTitle] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [leaveConflicts, setLeaveConflicts] = useState([]);

  const [serviceNames, setServiceNames] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [requestHistory, setRequestHistory] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    dateFrom: '',
    dateTo: '',
    reason: '',
  });

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

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistScheduleStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const todayDateKey = getLocalDateKey();
  const toDateMin = leaveForm.dateFrom && leaveForm.dateFrom > todayDateKey
    ? leaveForm.dateFrom
    : todayDateKey;

  const leaveDays = useMemo(() => {
    return getLeaveDays(leaveForm.dateFrom, leaveForm.dateTo);
  }, [leaveForm.dateFrom, leaveForm.dateTo]);

  const hasLeaveFormChanges = useMemo(() => {
    return Boolean(
      leaveForm.dateFrom || leaveForm.dateTo || leaveForm.reason.trim()
    );
  }, [leaveForm.dateFrom, leaveForm.dateTo, leaveForm.reason]);

  const pendingLeaveRequest = useMemo(() => {
    return requestHistory.find((request) => {
      return (
        request.request_type === 'leave' &&
        String(request.status || '').toLowerCase() === 'pending'
      );
    });
  }, [requestHistory]);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    api
      .get('/auth/staff-profile/me')
      .then((res) => setServiceNames(res.data.profile?.serviceNames || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get('/dentist-dashboard/schedule')
      .then((res) => {
        const data = res.data;

        setWeeklySchedule(data.weeklySchedule || []);
        setScheduleInfo({
          branchName: data.branchName || '-',
          workingDays: data.workingDays || '-',
          workingTime: data.workingTime || '-',
          todayBranchAddress: data.todayBranchAddress || 'Off',
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
    const hasOpenModal =
      showLogoutModal ||
      showLeaveModal ||
      selectedRequest ||
      showValidationModal ||
      showCancelConfirmModal ||
      showLeaveCancelConfirmModal ||
      showLeaveConflictModal ||
      showLeaveConfirmModal;

    document.body.style.overflow = hasOpenModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    showLogoutModal,
    showLeaveModal,
    selectedRequest,
    showValidationModal,
    showCancelConfirmModal,
    showLeaveCancelConfirmModal,
    showLeaveConflictModal,
    showLeaveConfirmModal,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeValidationModal();
        closeCancelConfirmModal();
        closeLeaveCancelConfirmModal();
        closeLeaveConflictModal();
        closeLeaveConfirmModal();
        setSelectedRequest(null);

        if (showLeaveModal) {
          requestCloseLeaveModal();
        }
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showLeaveModal, hasLeaveFormChanges, submitLoading]);

  function loadRequests() {
    setRequestLoading(true);

    api
      .get('/dentist-dashboard/schedule-requests')
      .then((res) => setRequestHistory(res.data || []))
      .catch(() => {})
      .finally(() => setRequestLoading(false));
  }

  function openValidationModal(title, message) {
    setValidationTitle(title);
    setValidationMessage(message);
    setShowValidationModal(true);
  }

  function closeValidationModal() {
    setShowValidationModal(false);
    setValidationTitle('');
    setValidationMessage('');
  }

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function resetLeaveForm() {
    setLeaveForm({
      dateFrom: '',
      dateTo: '',
      reason: '',
    });
    setLeaveConflicts([]);
  }

  function closeLeaveModal() {
    setShowLeaveModal(false);
    setSubmitError('');
  }

  function requestCloseLeaveModal() {
    if (submitLoading) return;

    if (hasLeaveFormChanges) {
      setShowLeaveCancelConfirmModal(true);
      return;
    }

    closeLeaveModal();
  }

  function handleLeaveFormCancel() {
    requestCloseLeaveModal();
  }

  function confirmCloseLeaveModal() {
    setShowLeaveCancelConfirmModal(false);
    setShowLeaveConfirmModal(false);
    closeLeaveModal();
    resetLeaveForm();
  }

  function closeLeaveCancelConfirmModal() {
    setShowLeaveCancelConfirmModal(false);
  }

  function closeCancelConfirmModal() {
    setShowCancelConfirmModal(false);
    setRequestToCancel(null);
  }

  function closeLeaveConflictModal() {
    if (submitLoading) return;

    setShowLeaveConflictModal(false);
  }

  function closeLeaveConfirmModal() {
    if (submitLoading) return;

    setShowLeaveConfirmModal(false);
  }

  function requestCancelLeaveConfirmModal() {
    if (submitLoading) return;

    setShowLeaveCancelConfirmModal(true);
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function handleLeaveOverlayClick(event) {
    if (event.target === event.currentTarget) {
      requestCloseLeaveModal();
    }
  }

  function handleDetailsOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setSelectedRequest(null);
    }
  }

  function handleValidationOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeValidationModal();
    }
  }

  function handleCancelConfirmOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeCancelConfirmModal();
    }
  }

  function handleLeaveCancelConfirmOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLeaveCancelConfirmModal();
    }
  }

  function handleLeaveConflictOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLeaveConflictModal();
    }
  }

  function handleLeaveConfirmOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLeaveConfirmModal();
    }
  }

  function handleLeaveChange(field, value) {
    setSubmitError('');

    setLeaveForm((prev) => {
      let nextValue = value;

      if ((field === 'dateFrom' || field === 'dateTo') && nextValue) {
        nextValue = nextValue < todayDateKey ? todayDateKey : nextValue;
      }

      if (field === 'dateTo' && nextValue && prev.dateFrom && nextValue < prev.dateFrom) {
        nextValue = prev.dateFrom;
      }

      const nextForm = {
        ...prev,
        [field]: nextValue,
      };

      if (
        field === 'dateFrom' &&
        nextForm.dateTo &&
        nextValue &&
        nextForm.dateTo < nextValue
      ) {
        nextForm.dateTo = nextValue;
      }

      return nextForm;
    });
  }

  function validateLeaveForm() {
    if (pendingLeaveRequest) {
      openValidationModal(
        'Pending Leave Request',
        'You already have a pending leave request awaiting admin approval. Please cancel it first before submitting another request.'
      );
      return false;
    }

    if (!leaveForm.dateFrom || !leaveForm.dateTo) {
      openValidationModal(
        'Incomplete Leave Date',
        'Please select both From Date and To Date before submitting your leave request.'
      );
      return false;
    }

    if (leaveForm.dateFrom < todayDateKey || leaveForm.dateTo < todayDateKey) {
      openValidationModal(
        'Invalid Leave Date',
        'Leave dates must be today or a future date.'
      );
      return false;
    }

    if (leaveForm.dateTo < leaveForm.dateFrom) {
      openValidationModal(
        'Invalid Date Range',
        'To Date must not be earlier than From Date.'
      );
      return false;
    }

    if (!leaveForm.reason.trim()) {
      openValidationModal(
        'Reason Required',
        'Please enter the reason for your leave request.'
      );
      return false;
    }

    const duplicateRequest = requestHistory.find((request) => {
      const status = String(request.status || '').toLowerCase();

      if (request.request_type !== 'leave') return false;
      if (!['pending', 'approved'].includes(status)) return false;

      return dateRangesOverlap(
        leaveForm.dateFrom,
        leaveForm.dateTo,
        request.date_from,
        request.date_to
      );
    });

    if (duplicateRequest) {
      openValidationModal(
        'Leave Request Already Exists',
        'You already have a leave request with the same or overlapping date range. Please cancel the first leave request before changing the date range.'
      );
      return false;
    }

    return true;
  }

  function submitLeaveRequest() {
    setSubmitLoading(true);

    return api
      .post('/dentist-dashboard/schedule-requests', {
        request_type: 'leave',
        date_from: leaveForm.dateFrom,
        date_to: leaveForm.dateTo,
        duration: `${leaveDays} ${leaveDays === 1 ? 'day' : 'days'}`,
        reason: leaveForm.reason,
      })
      .then(() => {
        setShowLeaveModal(false);
        setShowLeaveConflictModal(false);
        setShowLeaveConfirmModal(false);
        resetLeaveForm();
        loadRequests();
        openValidationModal(
          'Leave Request Submitted',
          'Your leave request has been submitted successfully.'
        );
      })
      .catch((err) => {
        setSubmitError(
          err.response?.data?.message || 'Failed to submit request.'
        );
        setShowLeaveConflictModal(false);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  }

  function handleLeaveSubmit() {
    setSubmitError('');

    if (!validateLeaveForm()) {
      return;
    }

    setSubmitLoading(true);

    api
      .get('/dentist-dashboard/schedule-requests/leave-conflicts', {
        params: {
          date_from: leaveForm.dateFrom,
          date_to: leaveForm.dateTo,
        },
      })
      .then((res) => {
        const conflicts = res.data?.conflicts || [];

        if (conflicts.length > 0) {
          setLeaveConflicts(conflicts);
          setShowLeaveConflictModal(true);
          return null;
        }

        setShowLeaveConfirmModal(true);
        return null;
      })
      .catch((err) => {
        setSubmitError(
          err.response?.data?.message || 'Failed to check leave appointments.'
        );
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  }

  function openCancelRequestModal(request) {
    setRequestToCancel(request);
    setShowCancelConfirmModal(true);
  }

  function handleCancelRequest() {
    if (!requestToCancel) return;

    setCancelLoading(true);

    api
      .patch(`/dentist-dashboard/schedule-requests/${requestToCancel.id}/cancel`)
      .then(() => {
        closeCancelConfirmModal();
        setSelectedRequest(null);
        loadRequests();
        openValidationModal(
          'Leave Request Cancelled',
          'Your leave request has been cancelled successfully.'
        );
      })
      .catch((err) => {
        openValidationModal(
          'Cancel Failed',
          err.response?.data?.message || 'Failed to cancel leave request.'
        );
      })
      .finally(() => {
        setCancelLoading(false);
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
            <i className="fi fi-rr-calendar-clock" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link to="/dentistRecords" style={styles.menuItem}>
            <i className="fi fi-rr-clipboard-user" style={styles.menuItemIcon}s></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/dentistProfile" style={styles.menuItem}>
            <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>View Profile</span>
          </Link>

          <Link to="/dentistSchedule" style={{ ...styles.menuItem, ...styles.menuItemActive }}>
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
          <button type="button" style={{ ...styles.menuItem, ...styles.logoutItem, width: '100%' }} onClick={openLogoutModal}>
            <i className="fi fi-rr-sign-out-alt" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={styles.mainContainer}>
        <header style={styles.topHeader}>
          <div style={styles.headerActions}>
            <DentistProfileMenu styles={styles} dentistName={user?.name || 'Dentist'} specialization="Dentist"/>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Schedule Overview</span>

              <h2 style={styles.heroTitle}>Manage your branch, working days, and schedule requests</h2>

              <p style={styles.heroText}>View your weekly schedule and track leave and transfer requests.</p>
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
              <h3 style={styles.infoValue}>
                {scheduleInfo.todayBranchAddress || 'Off'}
              </h3>
            </div>

            <section style={styles.actionCard}>
              <div style={styles.actionRow}>
                <h2 style={styles.actionTitle}>Leave Request</h2>
                <p style={styles.actionText}>
                  Submit a leave request for a day or multiple days.
                </p>

                {pendingLeaveRequest && (
                  <p style={styles.warningText}>
                    You have a pending leave request. Cancel it first before
                    submitting another date range.
                  </p>
                )}
              </div>

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(pendingLeaveRequest ? styles.primaryButtonDisabled : {}),
                }}
                disabled={Boolean(pendingLeaveRequest)}
                onClick={() => {
                  setSubmitError('');
                  setLeaveConflicts([]);
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
                <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                  Request History
                </h2>
              </div>

              <div style={styles.requestList}>
                {requestLoading ? (
                  <div style={styles.emptyState}>Loading...</div>
                ) : requestHistory.length === 0 ? (
                  <div style={styles.emptyState}>No requests found.</div>
                ) : (
                  requestHistory.map((request) => {
                    const isLeave = request.request_type === 'leave';
                    const title = isLeave
                      ? 'Leave Request'
                      : 'Branch Transfer Request';

                    const subtitle = isLeave
                      ? `${formatDateRange(
                          request.date_from,
                          request.date_to
                        )} • ${getLeaveDays(
                          request.date_from,
                          request.date_to
                        )} ${
                          getLeaveDays(request.date_from, request.date_to) === 1
                            ? 'day'
                            : 'days'
                        }`
                      : `To: ${request.requested_branch_name || '-'} (${
                          request.transfer_type || ''
                        })`;

                    const status = String(request.status || '').toLowerCase();
                    const statusLabel =
                      status.charAt(0).toUpperCase() + status.slice(1);

                    const isPending = status === 'pending';
                    const isApproved = status === 'approved';
                    const isRejected = status === 'rejected';
                    const isCancelled = status === 'cancelled';
                    const cancelDisabled = isApproved || isRejected || isCancelled;
                    const submittedDate = formatSubmittedDate(
                      request.submitted_at
                    );

                    return (
                      <div key={request.id} style={styles.requestItem}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(isPending
                              ? styles.pendingBadge
                              : isApproved
                                ? styles.approvedBadge
                                : isRejected
                                  ? styles.rejectedBadge || {
                                      backgroundColor: '#fee2e2',
                                      color: '#b91c1c',
                                    }
                                  : isCancelled
                                    ? styles.cancelledBadge
                                    : {
                                        backgroundColor: '#fee2e2',
                                        color: '#b91c1c',
                                      }),
                          }}
                        >
                          {statusLabel}
                        </span>

                        <div style={styles.requestInfo}>
                          <h4 style={styles.requestTitle}>{title}</h4>
                          <p style={styles.requestSubtitle}>{subtitle}</p>
                        </div>

                        <div style={styles.requestDate}>
                          <p style={styles.requestDateText}>
                            {submittedDate}
                          </p>

                          <div style={styles.requestButtonGroup}>
                            <button
                              type="button"
                              style={styles.requestDetailsButton}
                              onClick={() => setSelectedRequest(request)}
                            >
                              View Details
                            </button>

                            {isLeave && (
                              <button
                                type="button"
                                style={{
                                  ...styles.requestCancelButton,
                                  ...(cancelDisabled
                                    ? styles.requestCancelButtonDisabled || {
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#f1f5f9',
                                        color: '#94a3b8',
                                        cursor: 'not-allowed',
                                        opacity: 0.75,
                                      }
                                    : {}),
                                }}
                                onClick={() => {
                                  if (!cancelDisabled && isPending) {
                                    openCancelRequestModal(request);
                                  }
                                }}
                                disabled={cancelDisabled || !isPending}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {requestHistory.length > 0 && (
                <p style={styles.requestCount}>
                  Showing {requestHistory.length} of {requestHistory.length}{' '}
                  requests
                </p>
              )}
            </section>
          </div>
        </main>
      </div>

      {showLeaveModal && (
        <div style={styles.modal} onClick={handleLeaveOverlayClick}>
          <div style={styles.leaveModalContent}>
            <div style={styles.leaveModalHeader}>
              <h2 style={{ ...styles.modalTitle, margin: 0 }}>
                Leave Request
              </h2>

              <button
                type="button"
                onClick={requestCloseLeaveModal}
                style={styles.detailsCloseButton}
                disabled={submitLoading}
              >
                &times;
              </button>
            </div>

            <div style={styles.leaveDateRow}>
              <div style={styles.leaveDateField}>
                <label style={styles.leaveLabel}>From Date</label>

                <input
                  type="date"
                  value={leaveForm.dateFrom}
                  min={todayDateKey}
                  onChange={(event) =>
                    handleLeaveChange('dateFrom', event.target.value)
                  }
                  style={styles.leaveInput}
                />
              </div>

              <div style={styles.leaveDateField}>
                <label style={styles.leaveLabel}>To Date</label>

                <input
                  type="date"
                  value={leaveForm.dateTo}
                  min={toDateMin}
                  onChange={(event) =>
                    handleLeaveChange('dateTo', event.target.value)
                  }
                  style={styles.leaveInput}
                />
              </div>
            </div>

            <div style={styles.leaveDaysBox}>
              Leave Duration:{' '}
              <strong>
                {leaveDays > 0
                  ? `${leaveDays} ${leaveDays === 1 ? 'day' : 'days'}`
                  : '0 day'}
              </strong>
            </div>

            <div style={styles.leaveReasonBox}>
              <label style={styles.leaveLabel}>Reason</label>

              <textarea
                rows={4}
                placeholder="Describe the reason for your leave..."
                value={leaveForm.reason}
                onChange={(event) =>
                  handleLeaveChange('reason', event.target.value)
                }
                style={styles.leaveTextarea}
              />
            </div>

            {submitError ? (
              <p style={styles.submitErrorText}>{submitError}</p>
            ) : null}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.leaveCancelButton}
                onClick={handleLeaveFormCancel}
                disabled={submitLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.submitLeaveButton}
                onClick={handleLeaveSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveConflictModal && (
        <div
          style={styles.modal}
          onClick={handleLeaveConflictOverlayClick}
        >
          <div style={styles.leaveConflictModalContent}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#fff8df',
                color: '#d4af37',
              }}
            >
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Appointments Found</h2>
            <p style={styles.modalText}>
              You already have scheduled appointments within your selected leave dates. Please review the affected appointments and choose a different date range before submitting a leave request.
            </p>

            <div style={styles.leaveConflictList}>
              {leaveConflicts.map((appointment) => (
                <div key={appointment.id} style={styles.leaveConflictItem}>
                  <div>
                    <strong style={styles.leaveConflictDate}>
                      {appointment.date} at {appointment.time}
                    </strong>
                    <p style={styles.leaveConflictMeta}>
                      {appointment.patientName} • {appointment.serviceName}
                      {appointment.branchName ? ` • ${appointment.branchName}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {submitError ? (
              <p style={styles.submitErrorText}>{submitError}</p>
            ) : null}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.confirmGoldBtn }}
                onClick={closeLeaveConflictModal}
                disabled={submitLoading}
              >
                Review Dates
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirmModal && (
        <div style={styles.modal} onClick={handleLeaveConfirmOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-calendar-check" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Leave Request</h2>
            <p style={styles.modalText}>
              No scheduled appointments were found in this date range. Please review the details before saving this leave request.
            </p>

            <div style={styles.leaveConfirmDetails}>
              {[
                ['From Date', formatReadableDate(leaveForm.dateFrom)],
                ['To Date', formatReadableDate(leaveForm.dateTo)],
                [
                  'Duration',
                  `${leaveDays} ${leaveDays === 1 ? 'day' : 'days'}`,
                ],
                ['Reason', leaveForm.reason.trim() || 'No reason provided.'],
              ].map(([label, value]) => (
                <div key={label} style={styles.leaveConfirmRow}>
                  <span style={styles.leaveConfirmLabel}>{label}</span>
                  <strong style={styles.leaveConfirmValue}>{value}</strong>
                </div>
              ))}
            </div>

            {submitError ? (
              <p style={{ ...styles.modalText, color: '#dc2626' }}>
                {submitError}
              </p>
            ) : null}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={requestCancelLeaveConfirmModal}
                disabled={submitLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.confirmGoldBtn }}
                onClick={submitLeaveRequest}
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div style={styles.modal} onClick={handleDetailsOverlayClick}>
          <div style={{ ...styles.modalContent, ...styles.detailsModalContent }}>
            <div style={styles.detailsModalHeader}>
              <h2 style={{ ...styles.modalTitle, margin: 0 }}>
                Submitted Request Details
              </h2>

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
                  {selectedRequest.request_type === 'leave'
                    ? 'Leave Request'
                    : 'Branch Transfer Request'}
                </div>
              </div>

              <div style={styles.detailsField}>
                <div style={styles.detailsLabel}>Status</div>
                <div style={styles.detailsValue}>
                  {String(selectedRequest.status || '').charAt(0).toUpperCase() +
                    String(selectedRequest.status || '').slice(1)}
                </div>
              </div>

              <div style={styles.detailsField}>
                <div style={styles.detailsLabel}>Submitted On</div>
                <div style={styles.detailsValue}>
                  {formatSubmittedDate(selectedRequest.submitted_at)}
                </div>
              </div>

              {selectedRequest.request_type === 'leave' ? (
                <>
                  <div style={styles.detailsField}>
                    <div style={styles.detailsLabel}>Date Range</div>
                    <div style={styles.detailsValue}>
                      {formatDateRange(
                        selectedRequest.date_from,
                        selectedRequest.date_to
                      )}
                    </div>
                  </div>

                  <div style={styles.detailsField}>
                    <div style={styles.detailsLabel}>Leave Days</div>
                    <div style={styles.detailsValue}>
                      {getLeaveDays(
                        selectedRequest.date_from,
                        selectedRequest.date_to
                      )}{' '}
                      {getLeaveDays(
                        selectedRequest.date_from,
                        selectedRequest.date_to
                      ) === 1
                        ? 'day'
                        : 'days'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.detailsField}>
                    <div style={styles.detailsLabel}>Requested Branch</div>
                    <div style={styles.detailsValue}>
                      {selectedRequest.requested_branch_name || '-'}
                    </div>
                  </div>

                  <div style={styles.detailsField}>
                    <div style={styles.detailsLabel}>Transfer Type</div>
                    <div style={styles.detailsValue}>
                      {selectedRequest.transfer_type || '-'}
                    </div>
                  </div>
                </>
              )}

              {selectedRequest.date_from && (
                <div style={styles.detailsField}>
                  <div style={styles.detailsLabel}>From Date</div>
                  <div style={styles.detailsValue}>
                    {formatReadableDate(selectedRequest.date_from)}
                  </div>
                </div>
              )}

              {selectedRequest.date_to && (
                <div style={styles.detailsField}>
                  <div style={styles.detailsLabel}>To Date</div>
                  <div style={styles.detailsValue}>
                    {formatReadableDate(selectedRequest.date_to)}
                  </div>
                </div>
              )}

              <div style={{ ...styles.detailsField, ...styles.detailsFieldFull }}>
                <div style={styles.detailsLabel}>Reason</div>
                <div style={styles.detailsTextarea}>
                  {selectedRequest.reason?.trim() || 'No reason provided.'}
                </div>
              </div>

              {String(selectedRequest.status || '').toLowerCase() === 'rejected' &&
                selectedRequest.rejection_reason?.trim() && (
                  <div style={{ ...styles.detailsField, ...styles.detailsFieldFull }}>
                    <div style={styles.detailsLabel}>Rejection Reason</div>
                    <div style={styles.detailsTextarea}>
                      {selectedRequest.rejection_reason.trim()}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {showLeaveCancelConfirmModal && (
        <div
          style={styles.validationModalOverlay}
          onClick={handleLeaveCancelConfirmOverlayClick}
        >
          <div style={styles.validationModalContent}>
            <h2 style={styles.validationModalTitle}>Cancel Leave Request Form</h2>

            <div style={styles.validationModalDivider}></div>

            <p style={styles.validationModalText}>
              You have entered leave request details. Are you sure you want to
              cancel this form?
            </p>

            <div style={styles.validationModalActions}>
              <button
                type="button"
                style={styles.validationModalCancelButton}
                onClick={closeLeaveCancelConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={styles.validationModalDangerButton}
                onClick={confirmCloseLeaveModal}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirmModal && (
        <div
          style={styles.validationModalOverlay}
          onClick={handleCancelConfirmOverlayClick}
        >
          <div style={styles.validationModalContent}>
            <h2 style={styles.validationModalTitle}>Cancel Leave Request</h2>

            <div style={styles.validationModalDivider}></div>

            <p style={styles.validationModalText}>
              Are you sure you want to cancel this leave request?
            </p>

            <div style={styles.validationModalActions}>
              <button
                type="button"
                style={styles.validationModalCancelButton}
                onClick={closeCancelConfirmModal}
                disabled={cancelLoading}
              >
                No
              </button>

              <button
                type="button"
                style={styles.validationModalDangerButton}
                onClick={handleCancelRequest}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showValidationModal && (
        <div
          style={styles.validationModalOverlay}
          onClick={handleValidationOverlayClick}
        >
          <div style={styles.validationModalContent}>
            <h2 style={styles.validationModalTitle}>{validationTitle}</h2>

            <div style={styles.validationModalDivider}></div>

            <p style={styles.validationModalText}>{validationMessage}</p>

            <button
              type="button"
              style={styles.validationModalButton}
              onClick={closeValidationModal}
            >
              Okay
            </button>
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

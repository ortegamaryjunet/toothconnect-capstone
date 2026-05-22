import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import {
  cancelAppointment as cancelAppointmentRequest,
  getAppointmentMeta,
  listAppointments,
  setAppointmentStatus,
} from '../api/appointments';
import { createStaffPayment } from '../api/payments';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepAppointmentsStyles from '../styles/RecepAppointments';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

const pendingPerPage = 4;
const queuePerPage = 3;

export default function RecepAppointments() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeView, setActiveView] = useState('queue');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchText, setSearchText] = useState('');
  const [dentistFilter, setDentistFilter] = useState('all');
  const [treatmentFilter, setTreatmentFilter] = useState('');

  const [pendingPage, setPendingPage] = useState(1);
  const [queuePage, setQueuePage] = useState(1);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(new Date()));

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [queueAppointments, setQueueAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [dentistOptions, setDentistOptions] = useState([]);
  const [treatmentOptions, setTreatmentOptions] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [paymentModal, setPaymentModal] = useState({
    show: false,
    appointment: null,
    method: 'cash',
    amount: '',
    saving: false,
  });
  const [cancelReasonModal, setCancelReasonModal] = useState({ show: false, appointmentId: null });
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1200;
  const isCalendarCompact = screenWidth <= 650;

  const styles = createRecepAppointmentsStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
    isCalendarCompact,
  });

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
        setOpenDropdownId(null);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setPendingPage(1);
    setQueuePage(1);
  }, [searchText, dentistFilter, treatmentFilter]);

  useEffect(() => {
    fetchUpcomingAppointments();
    fetchAppointmentMeta();
  }, []);

  useEffect(() => {
    fetchCalendarAppointments(currentDate);
  }, [currentDate]);

  const filteredPending = useMemo(() => {
    return filterAppointments(
      pendingAppointments,
      searchText,
      dentistFilter,
      treatmentFilter
    );
  }, [pendingAppointments, searchText, dentistFilter, treatmentFilter]);

  const filteredQueue = useMemo(() => {
    return filterAppointments(
      queueAppointments,
      searchText,
      dentistFilter,
      treatmentFilter
    );
  }, [queueAppointments, searchText, dentistFilter, treatmentFilter]);

  const pendingTotalPages =
    filteredPending.length === 0
      ? 0
      : Math.ceil(filteredPending.length / pendingPerPage);

  const queueTotalPages =
    filteredQueue.length === 0
      ? 0
      : Math.ceil(filteredQueue.length / queuePerPage);

  const receptionistName = user?.name || user?.email || 'Receptionist';

  useEffect(() => {
    setPendingPage((page) => fixPage(page, pendingTotalPages));
  }, [pendingTotalPages]);

  useEffect(() => {
    setQueuePage((page) => fixPage(page, queueTotalPages));
  }, [queueTotalPages]);

  const pagedPending = useMemo(() => {
    const start = pendingPage > 0 ? (pendingPage - 1) * pendingPerPage : 0;

    return filteredPending.slice(start, start + pendingPerPage);
  }, [filteredPending, pendingPage]);

  const pagedQueue = useMemo(() => {
    const start = queuePage > 0 ? (queuePage - 1) * queuePerPage : 0;

    return filteredQueue.slice(start, start + queuePerPage);
  }, [filteredQueue, queuePage]);

  const calendarDays = useMemo(() => {
    return buildCalendarDays(currentDate, calendarAppointments);
  }, [currentDate, calendarAppointments]);

  const selectedDateText = useMemo(() => {
    if (!selectedDateKey) {
      return 'Select a date to view appointments.';
    }

    const date = new Date(`${selectedDateKey}T00:00:00`);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDateKey]);

  const selectedDateSchedules = useMemo(() => {
    return calendarAppointments
      .filter((item) => item.fullDate === selectedDateKey)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  }, [calendarAppointments, selectedDateKey]);

  const calendarMonthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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

  function handleViewChange(view) {
    setActiveView(view);
    setOpenDropdownId(null);
  }

  function handlePrevMonth() {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }

  async function fetchUpcomingAppointments() {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const data = await listAppointments();
      const normalized = normalizeAppointments(data);

      setAllAppointments(normalized);
      setPendingAppointments(
        normalized.filter((appointment) => appointment.status === 'scheduled')
      );
      setQueueAppointments(
        normalized.filter((appointment) =>
          appointment.status === 'arrived' ||
          (appointment.status === 'completed' && !appointment.paymentId)
        )
      );
    } catch (err) {
      setAppointmentsError(
        err.response?.data?.message || 'Failed to load upcoming appointments.'
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }

  async function fetchCalendarAppointments(monthDate) {
    try {
      const bounds = monthBoundsUTC(monthDate);
      const data = await listAppointments({
        from: bounds.fromUTC,
        to: bounds.toUTC,
      });

      setCalendarAppointments(normalizeAppointments(data));
    } catch (err) {
      setCalendarAppointments([]);
    }
  }

  async function fetchAppointmentMeta() {
    try {
      const meta = await getAppointmentMeta();
      setDentistOptions(Array.isArray(meta.dentists) ? meta.dentists : []);
      setTreatmentOptions(Array.isArray(meta.services) ? meta.services : []);
    } catch (err) {
      setDentistOptions([]);
      setTreatmentOptions([]);
    }
  }

  async function handlePendingAction(action, id) {
    setOpenDropdownId(null);

    if (action === 'reschedule' || action === 'edit') {
      return;
    }

    if (action === 'cancel') {
      setCancelReasonModal({ show: true, appointmentId: id });
      setCancelReasonText('');
      return;
    }

    setUpdatingId(id);
    setAppointmentsError('');

    try {
      if (action === 'arrived') {
        await setAppointmentStatus(id, 'arrived');
        await fetchUpcomingAppointments();
        await fetchCalendarAppointments(currentDate);
      } else if (action === 'no_show') {
        await setAppointmentStatus(id, 'no_show');
        await fetchUpcomingAppointments();
        await fetchCalendarAppointments(currentDate);
      }
    } catch (err) {
      setAppointmentsError(
        err.response?.data?.message || 'Failed to update appointment.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleConfirmCancelWithReason() {
    const { appointmentId } = cancelReasonModal;
    if (!appointmentId) return;

    setCancelReasonModal({ show: false, appointmentId: null });
    setUpdatingId(appointmentId);
    setAppointmentsError('');

    try {
      await cancelAppointmentRequest(
        appointmentId,
        cancelReasonText.trim() ? { reason: cancelReasonText.trim() } : {}
      );
      await fetchUpcomingAppointments();
      await fetchCalendarAppointments(currentDate);
    } catch (err) {
      setAppointmentsError(
        err.response?.data?.message || 'Failed to cancel appointment.'
      );
    } finally {
      setUpdatingId(null);
      setCancelReasonText('');
    }
  }

  async function completeQueuedAppointment(id) {
    setUpdatingId(id);
    setAppointmentsError('');

    try {
      await setAppointmentStatus(id, 'completed');
      setQueueAppointments((currentQueue) =>
        currentQueue.map((appointment) =>
          String(appointment.id) === String(id)
            ? { ...appointment, status: 'completed', type: 'Completed' }
            : appointment
        )
      );
      setAllAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          String(appointment.id) === String(id)
            ? { ...appointment, status: 'completed', type: 'Completed' }
            : appointment
        )
      );
      setCalendarAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          String(appointment.id) === String(id)
            ? { ...appointment, status: 'completed', type: 'Completed' }
            : appointment
        )
      );
    } catch (err) {
      setAppointmentsError(
        err.response?.data?.message || 'Failed to complete appointment.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function openPaymentModal(appointment) {
    setPaymentModal({
      show: true,
      appointment,
      method: 'cash',
      amount: String(Number(appointment.servicePrice || 0).toFixed(0)),
      saving: false,
    });
  }

  function closePaymentModal() {
    setPaymentModal({
      show: false,
      appointment: null,
      method: 'cash',
      amount: '',
      saving: false,
    });
  }

  async function savePaymentMode() {
    if (!paymentModal.appointment) return;

    const amount = Number(paymentModal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setAppointmentsError('Please enter a valid payment amount.');
      return;
    }

    setPaymentModal((current) => ({ ...current, saving: true }));
    setAppointmentsError('');

    try {
      await createStaffPayment({
        appointment_id: paymentModal.appointment.id,
        amount,
        payment_method: paymentModal.method,
      });

      setQueueAppointments((currentQueue) =>
        currentQueue.filter(
          (appointment) => String(appointment.id) !== String(paymentModal.appointment.id)
        )
      );
      fetchUpcomingAppointments();
      fetchCalendarAppointments(currentDate);
      closePaymentModal();
    } catch (err) {
      setAppointmentsError(
        err.response?.data?.message || 'Failed to save payment.'
      );
      setPaymentModal((current) => ({ ...current, saving: false }));
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

          <Link
            to="/receptionistAppointments"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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

          <Link to="/receptionistNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notification</span>
            <NotificationUnreadBadge />
          </Link>
        </nav>

        <div style={styles.logoutSection}>
          <button
            type="button"
            style={{
              ...styles.menuItem,
              ...styles.logoutItem,
              width: '100%',
              border: 'none',
            }}
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
          <section style={styles.pageHero}>
            <div>
              <span style={styles.heroTag}>Appointment</span>

              <h2 style={styles.heroTitle}>
                Manage patient appointments and monitor daily clinic schedules
              </h2>

              <p style={styles.heroText}>
                Organize bookings, track patient arrivals, and coordinate
                appointment schedules with dentists.
              </p>
            </div>

            {!isMobile && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-calendar-clock"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.viewTabs}>
            <button
              type="button"
              style={{
                ...styles.viewTabButton,
                border: 'none',
                ...(activeView === 'calendar' ? styles.viewTabButtonActive : {}),
              }}
              onClick={() => handleViewChange('calendar')}
            >
              <i className="fi fi-rr-calendar"></i>
              Calendar View
            </button>

            <button
              type="button"
              style={{
                ...styles.viewTabButton,
                border: 'none',
                ...(activeView === 'queue' ? styles.viewTabButtonActive : {}),
              }}
              onClick={() => handleViewChange('queue')}
            >
              <i className="fi fi-rr-list-check"></i>
              Queue View
            </button>
          </section>

          {activeView === 'calendar' && (
            <section style={styles.calendarView}>
              <div style={styles.dashboardCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Calendar View</h3>
                    <p style={styles.cardSubtitle}>
                      View appointment dates, dentist availability, and selected
                      day schedules.
                    </p>
                  </div>

                  <div style={styles.calendarActions}>
                    <button
                      type="button"
                      style={{
                        ...styles.calendarNavBtn,
                        border: 'none',
                      }}
                      onClick={handlePrevMonth}
                    >
                      <i className="fi fi-rr-angle-left"></i>
                    </button>

                    <h3 style={styles.calendarMonthTitle}>
                      {calendarMonthLabel}
                    </h3>

                    <button
                      type="button"
                      style={{
                        ...styles.calendarNavBtn,
                        border: 'none',
                      }}
                      onClick={handleNextMonth}
                    >
                      <i className="fi fi-rr-angle-right"></i>
                    </button>
                  </div>
                </div>

                <div style={styles.calendarLayout}>
                  <div style={styles.calendarPanel}>
                    <div style={styles.calendarWeekdays}>
                      <span>Sun</span>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                    </div>

                    <div style={styles.calendarGrid}>
                      {calendarDays.map((dayItem) => {
                        if (dayItem.type === 'empty') {
                          return (
                            <button
                              key={dayItem.key}
                              type="button"
                              disabled
                              style={{
                                ...styles.calendarDay,
                                ...styles.calendarDayMuted,
                                border: 'none',
                              }}
                            />
                          );
                        }

                        const isSelected =
                          selectedDateKey === dayItem.dateKey;

                        return (
                          <button
                            key={dayItem.key}
                            type="button"
                            style={{
                              ...styles.calendarDay,
                              border: 'none',
                              ...(isSelected
                                ? styles.calendarDayActive
                                : {}),
                            }}
                            onClick={() => {
                              setSelectedDateKey(dayItem.dateKey);
                            }}
                          >
                            {dayItem.day}

                            {dayItem.hasEvent && (
                              <span
                                style={{
                                  ...styles.calendarEventDot,
                                  ...(isSelected
                                    ? styles.calendarEventDotActive
                                    : {}),
                                }}
                              ></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={styles.schedulePanel}>
                    <div style={styles.schedulePanelHeader}>
                      <div>
                        <h3 style={styles.schedulePanelTitle}>
                          Appointments
                        </h3>

                        <p style={styles.schedulePanelText}>
                          {selectedDateText}
                        </p>
                      </div>
                    </div>

                    <div style={styles.dentistScheduleList}>
                      {selectedDateSchedules.length === 0 ? (
                        <div style={styles.calendarEmptyState}>
                          <i
                            className="fi fi-rr-calendar-clock"
                            style={styles.calendarEmptyIcon}
                          ></i>

                          <h4 style={styles.calendarEmptyTitle}>
                            No Appointments
                          </h4>

                          <p style={styles.calendarEmptyText}>
                            No appointment schedules to view on this date.
                          </p>
                        </div>
                      ) : (
                        selectedDateSchedules.map((appointment) => (
                          <div
                            key={appointment.id}
                            style={styles.scheduleItem}
                          >
                            <div style={styles.scheduleItemTop}>
                              <div style={styles.scheduleTime}>
                                {appointment.time}
                              </div>

                              <span
                                style={{
                                  ...styles.scheduleStatusBadge,
                                  ...getAppointmentStatusStyle(styles, appointment),
                                }}
                              >
                                {getAppointmentCalendarStatus(appointment)}
                              </span>
                            </div>

                            <div style={styles.scheduleName}>
                              {appointment.name}
                            </div>

                            <div style={styles.scheduleDetail}>
                              {appointment.doctor}
                            </div>

                            <div style={styles.scheduleDetail}>
                              {appointment.treatment}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeView === 'queue' && (
            <section style={styles.queueWrapper}>
              <div style={styles.dashboardCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Appointment Queue</h3>
                    <p style={styles.cardSubtitle}>
                      Search and filter pending appointments and arrived
                      patients.
                    </p>
                  </div>
                </div>

                <div style={styles.filters}>
                  <div style={styles.leftActions}>
                    <div style={styles.searchBox}>
                      <i
                        className="fi fi-rr-search"
                        style={styles.searchIcon}
                      ></i>

                      <input
                        type="text"
                        placeholder="Search patient or dentist"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        style={styles.searchInput}
                      />
                    </div>
                  </div>

                  <div style={styles.rightActions}>
                    <select
                      value={dentistFilter}
                      onChange={(event) => setDentistFilter(event.target.value)}
                      style={styles.select}
                    >
                      <option value="all">All Dentist</option>
                      {dentistOptions.map((dentist) => (
                        <option key={dentist.id} value={dentist.id}>
                          {dentist.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={treatmentFilter}
                      onChange={(event) =>
                        setTreatmentFilter(event.target.value)
                      }
                      style={styles.select}
                    >
                      <option value="">All Treatment</option>
                      {treatmentOptions.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>

                    <Link to="/receptionistAppointmentForm" style={styles.addAppt}>
                      <i className="fi fi-rr-plus"></i>
                      Add Appointment
                    </Link>
                  </div>
                </div>

                {appointmentsError && (
                  <div
                    style={{
                      marginTop: 14,
                      color: '#b91c1c',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontSize: 13,
                    }}
                  >
                    {appointmentsError}
                  </div>
                )}
              </div>

              <div style={styles.appointmentsRow}>
                <div style={styles.appointmentCard}>
                  <div style={styles.listHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>Pending Appointment</h3>
                      <p style={styles.cardSubtitle}>
                        Patients waiting for arrival confirmation.
                      </p>
                    </div>

                    <span style={styles.listCount}>
                      {filteredPending.length}
                    </span>
                  </div>

                  <div style={styles.appointmentList}>
                    {appointmentsLoading ? (
                      <EmptyState
                        styles={styles}
                        message="Loading upcoming appointments..."
                      />
                    ) : pagedPending.length === 0 ? (
                      <EmptyState
                        styles={styles}
                        message="No pending appointments found."
                      />
                    ) : (
                      pagedPending.map((appointment) => (
                        <PendingAppointmentCard
                          key={appointment.id}
                          styles={styles}
                          appointment={appointment}
                          openDropdownId={openDropdownId}
                          setOpenDropdownId={setOpenDropdownId}
                          handlePendingAction={handlePendingAction}
                          isUpdating={
                            String(updatingId) === String(appointment.id)
                          }
                        />
                      ))
                    )}
                  </div>

                  <Pagination
                    styles={styles}
                    page={pendingPage}
                    totalPages={pendingTotalPages}
                    onPrev={() => setPendingPage((page) => Math.max(page - 1, 1))}
                    onNext={() =>
                      setPendingPage((page) =>
                        Math.min(page + 1, pendingTotalPages)
                      )
                    }
                  />
                </div>

                <div style={styles.appointmentCard}>
                  <div style={styles.listHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>Appointment Queue</h3>
                      <p style={styles.cardSubtitle}>
                        Arrived patients ready for service.
                      </p>
                    </div>

                    <span style={styles.listCount}>{filteredQueue.length}</span>
                  </div>

                  <div style={styles.appointmentList}>
                    {appointmentsLoading ? (
                      <EmptyState
                        styles={styles}
                        message="Loading completed visits..."
                      />
                    ) : pagedQueue.length === 0 ? (
                      <EmptyState styles={styles} message="No patients in queue." />
                    ) : (
                      pagedQueue.map((appointment) => (
                        <QueueAppointmentCard
                          key={appointment.id}
                          styles={styles}
                          appointment={appointment}
                          isUpdating={
                            String(updatingId) === String(appointment.id)
                          }
                          onComplete={() => completeQueuedAppointment(appointment.id)}
                          onPayment={() => openPaymentModal(appointment)}
                        />
                      ))
                    )}
                  </div>

                  <Pagination
                    styles={styles}
                    page={queuePage}
                    totalPages={queueTotalPages}
                    onPrev={() => setQueuePage((page) => Math.max(page - 1, 1))}
                    onNext={() =>
                      setQueuePage((page) =>
                        Math.min(page + 1, queueTotalPages)
                      )
                    }
                  />
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {paymentModal.show && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closePaymentModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-credit-card" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Mode of Payment</h2>
            <p style={styles.modalText}>
              Choose how the patient will pay for this completed appointment.
            </p>

            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              <select
                value={paymentModal.method}
                onChange={(event) =>
                  setPaymentModal((current) => ({
                    ...current,
                    method: event.target.value,
                  }))
                }
                style={styles.select}
              >
                <option value="cash">Cash</option>
                <option value="ewallet">E-wallet</option>
                <option value="bank_transfer">Bank</option>
              </select>

              <input
                type="number"
                min="1"
                value={paymentModal.amount}
                onChange={(event) =>
                  setPaymentModal((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="Amount"
                style={{
                  ...styles.searchInput,
                  width: '100%',
                  height: 43,
                  border: '1px solid #dbe3ef',
                  borderRadius: 14,
                  padding: '0 13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={savePaymentMode}
                disabled={paymentModal.saving}
              >
                {paymentModal.saving ? 'Saving...' : 'Save'}
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closePaymentModal}
                disabled={paymentModal.saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelReasonModal.show && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setCancelReasonModal({ show: false, appointmentId: null });
              setCancelReasonText('');
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-cross-circle" style={{ ...styles.modalIconText, color: '#e53e3e' }}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Appointment</h2>
            <p style={styles.modalText}>
              Provide a reason for cancellation (optional). This will be sent to the patient.
            </p>

            <textarea
              value={cancelReasonText}
              onChange={(e) => setCancelReasonText(e.target.value)}
              placeholder="e.g. Dentist unavailable, clinic emergency..."
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #dbe3ef',
                borderRadius: 10,
                padding: '10px 13px',
                fontSize: 14,
                resize: 'vertical',
                marginBottom: 16,
                fontFamily: 'inherit',
                color: '#1a202c',
                outline: 'none',
              }}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn, backgroundColor: '#e53e3e' }}
                onClick={handleConfirmCancelWithReason}
              >
                Confirm Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => {
                  setCancelReasonModal({ show: false, appointmentId: null });
                  setCancelReasonText('');
                }}
              >
                Keep Appointment
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

function PendingAppointmentCard({
  styles,
  appointment,
  openDropdownId,
  setOpenDropdownId,
  handlePendingAction,
  isUpdating,
}) {
  const isOpen = String(openDropdownId) === String(appointment.id);

  return (
    <div style={{ ...styles.appointment, ...styles.pendingStyle }}>
      <div style={styles.appointmentInfo}>
        <div style={styles.dateBox}>
          <div style={styles.week}>{appointment.date}</div>
          <div style={styles.day}>{appointment.day}</div>
        </div>

        <div style={styles.infoContent}>
          <span style={styles.appointmentType}>{appointment.type}</span>

          <strong style={styles.patientName}>{appointment.name}</strong>

          <div style={styles.gridInfo}>
            <InfoRow
              styles={styles}
              icon="fi fi-rr-clock-three"
              text={appointment.time}
            />

            <InfoRow
              styles={styles}
              icon="fi fi-rr-stethoscope"
              text={appointment.doctor}
            />

            <InfoRow
              styles={styles}
              icon="fi fi-rr-tooth"
              text={appointment.treatment}
            />
          </div>
        </div>
      </div>

      <div style={styles.editActions}>
        <div style={styles.editDropdown}>
          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.editBtn,
              ...(isUpdating ? styles.pageBtnDisabled : {}),
            }}
            onClick={() =>
              setOpenDropdownId(isOpen ? null : appointment.id)
            }
          >
            {isUpdating ? 'Saving...' : 'Edit'}
          </button>

          {isOpen && (
            <div style={styles.editDropdownMenu}>
              <button
                type="button"
                style={styles.editDropdownItem}
                onClick={() => handlePendingAction('arrived', appointment.id)}
              >
                <i className="fi fi-rr-check"></i>
                Mark Arrived
              </button>

              <button
                type="button"
                style={{ ...styles.editDropdownItem, color: '#d97706' }}
                onClick={() => handlePendingAction('no_show', appointment.id)}
              >
                <i className="fi fi-rr-user-slash"></i>
                Mark No-Show
              </button>

              <button
                type="button"
                style={{
                  ...styles.editDropdownItem,
                  ...styles.editDropdownDanger,
                }}
                onClick={() => handlePendingAction('cancel', appointment.id)}
              >
                <i className="fi fi-rr-cross-circle"></i>
                Cancel Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QueueAppointmentCard({
  styles,
  appointment,
  isUpdating,
  onComplete,
  onPayment,
}) {
  const isCompleted = appointment.status === 'completed';

  return (
    <div style={{ ...styles.appointment, ...styles.queueAppointment }}>
      <div style={styles.queueContent}>
        <strong style={styles.patientName}>{appointment.name}</strong>

        <div style={styles.queueSub}>
          {appointment.date} {appointment.day} | {appointment.time}
        </div>

        <div style={styles.queueSub}>{appointment.doctor}</div>
        <div style={styles.queueSub}>{appointment.treatment}</div>
        <div style={styles.queueSub}>
          Status: {isCompleted ? 'Completed' : 'Arrived'}
        </div>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={{
            ...styles.btn,
            ...styles.btnProceed,
            ...(isCompleted ? styles.btnProceedCompleted : {}),
            ...(isUpdating ? styles.pageBtnDisabled : {}),
          }}
          disabled={isCompleted || isUpdating}
          onClick={onComplete}
        >
          {isUpdating ? 'Saving...' : isCompleted ? 'Completed' : 'Completed'}
        </button>

        <button
          type="button"
          style={{
            ...styles.btn,
            ...styles.btnPay,
            ...(isCompleted ? styles.btnPayEnabled : styles.pageBtnDisabled),
          }}
          disabled={!isCompleted}
          onClick={onPayment}
        >
          Mode of Payment
        </button>
      </div>
    </div>
  );
}

function InfoRow({ styles, icon, text }) {
  return (
    <div style={styles.infoRow}>
      <i className={icon} style={styles.infoRowIcon}></i>
      <span>{text}</span>
    </div>
  );
}

function Pagination({ styles, page, totalPages, onPrev, onNext }) {
  return (
    <div style={styles.pagination}>
      <button
        type="button"
        style={{
          ...styles.pageBtn,
          ...(page <= 1 ? styles.pageBtnDisabled : {}),
        }}
        disabled={page <= 1}
        onClick={onPrev}
      >
        <i className="fi fi-rr-angle-left"></i>
      </button>

      <span style={styles.pageInfo}>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        style={{
          ...styles.pageBtn,
          ...(page >= totalPages || totalPages === 0
            ? styles.pageBtnDisabled
            : {}),
        }}
        disabled={page >= totalPages || totalPages === 0}
        onClick={onNext}
      >
        <i className="fi fi-rr-angle-right"></i>
      </button>
    </div>
  );
}

function EmptyState({ styles, message }) {
  return <div style={styles.emptyState}>{message}</div>;
}

function normalizeAppointments(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const rawDateTime =
      item.start_time ||
      item.startTime ||
      item.datetime ||
      item.dateTime ||
      item.appointmentDateTime ||
      item.schedule ||
      '';

    const displayDate = buildDateParts(
      rawDateTime,
      item.date,
      item.day,
      item.time
    );

    return {
      id: item.id || item.appointmentId || index + 1,
      name:
        item.name ||
        item.patient_name ||
        item.patientName ||
        item.patient ||
        item.fullName ||
        'Unnamed Patient',
      dentistId: String(item.dentist_id || item.dentistId || item.doctorId || ''),
      serviceId: String(item.service_id || item.serviceId || item.treatmentId || ''),
      doctor:
        item.dentist_name ||
        item.doctorName ||
        item.dentistName ||
        item.doctor ||
        item.dentist ||
        'Dentist not set',
      treatment:
        item.service_name ||
        item.treatmentName ||
        item.serviceName ||
        item.treatment ||
        item.service ||
        'Treatment not set',
      servicePrice: Number(item.service_price || item.price || 0),
      paymentId: item.payment_id || null,
      paymentStatus: item.payment_status || '',
      paymentMethod: item.payment_method || '',
      date: displayDate.week,
      day: displayDate.day,
      time: displayDate.time,
      fullDate: displayDate.fullDate,
      status: item.status || 'scheduled',
      type: item.type || item.bookingType || formatStatus(item.status || 'scheduled'),
      notes: item.notes || '',
    };
  });
}

function formatStatus(status) {
  return String(status || 'scheduled')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAppointmentCalendarStatus(appointment) {
  const status = String(appointment?.status || '').toLowerCase();

  if (status === 'completed') {
    return 'Done';
  }

  if (status === 'no_show') {
    return 'No Show';
  }

  if (status === 'cancelled') {
    return 'Cancelled';
  }

  return 'Upcoming';
}

function getAppointmentStatusStyle(styles, appointment) {
  const label = getAppointmentCalendarStatus(appointment);

  if (label === 'Done') {
    return styles.scheduleStatusDone;
  }

  if (label === 'No Show') {
    return styles.scheduleStatusNoShow;
  }

  if (label === 'Upcoming') {
    return styles.scheduleStatusUpcoming;
  }

  return styles.scheduleStatusNeutral;
}

function monthBoundsUTC(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);

  return {
    fromUTC: monthStart.toISOString(),
    toUTC: monthEnd.toISOString(),
  };
}

function buildDateParts(rawDateTime, fallbackWeek, fallbackDay, fallbackTime) {
  if (rawDateTime) {
    const date = new Date(rawDateTime);

    if (!Number.isNaN(date.getTime())) {
      return {
        week: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: String(date.getDate()).padStart(2, '0'),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullDate: toDateKey(date),
      };
    }
  }

  return {
    week: fallbackWeek || 'Today',
    day: fallbackDay || '--',
    time: fallbackTime || '--',
    fullDate: '',
  };
}

function filterAppointments(data, searchText, dentistFilter, treatmentFilter) {
  const search = searchText.toLowerCase().trim();

  return data.filter((appointment) => {
    const searchData = `${appointment.name} ${appointment.doctor} ${appointment.treatment}`.toLowerCase();
    const matchSearch = searchData.includes(search);
    const matchDentist =
      dentistFilter === 'all' ||
      String(appointment.dentistId) === String(dentistFilter);
    const matchTreatment =
      !treatmentFilter ||
      String(appointment.serviceId) === String(treatmentFilter);

    return matchSearch && matchDentist && matchTreatment;
  });
}

function parseTime(timeStr) {
  const value = String(timeStr || '').trim();
  const parts = value.split(' ');

  if (parts.length < 2) {
    return 0;
  }

  const time = parts[0];
  const modifier = parts[1];
  const hm = time.split(':');

  let hours = Number(hm[0]);
  let minutes = Number(hm[1]);

  if (Number.isNaN(hours)) {
    hours = 0;
  }

  if (Number.isNaN(minutes)) {
    minutes = 0;
  }

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function fixPage(page, totalPages) {
  if (totalPages === 0) {
    return 0;
  }

  if (page < 1) {
    return 1;
  }

  if (page > totalPages) {
    return totalPages;
  }

  return page;
}

function buildCalendarDays(currentDate, appointments) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 0; i < startDay; i += 1) {
    days.push({
      type: 'empty',
      key: `empty-${i}`,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const dateKey = toDateKey(date);

    days.push({
      type: 'day',
      key: dateKey,
      day,
      dateKey,
      isPast: date < today,
      hasEvent: appointments.some((item) => item.fullDate === dateKey),
    });
  }

  return days;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { listAppointments, saveAppointmentNote } from '../api/appointments';
import { getServiceKit, getConsumption, submitConsumption } from '../api/inventory';
import createDentistAppointmentStyles from '../styles/DentistAppointment';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';

const rowsPerPage = 5;

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function DentistAppointment() {
  const { user } = useAuth();
  const [serviceNames, setServiceNames] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNoteAppointment, setSelectedNoteAppointment] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const [showKitModal, setShowKitModal] = useState(false);
  const [selectedKitAppointment, setSelectedKitAppointment] = useState(null);
  const [kitItems, setKitItems] = useState([]);
  const [kitNotes, setKitNotes] = useState('');
  const [kitLoading, setKitLoading] = useState(false);
  const [kitError, setKitError] = useState('');
  const [kitSubmitting, setKitSubmitting] = useState(false);
  const [kitAlreadySubmitted, setKitAlreadySubmitted] = useState(false);

  const [manualKitOpen, setManualKitOpen] = useState(false);
  const [manualKitCategory, setManualKitCategory] = useState('');
  const [manualKitInventoryId, setManualKitInventoryId] = useState('');
  const [manualKitQty, setManualKitQty] = useState(1);
  const [manualKitError, setManualKitError] = useState('');
  const [manualInventoryItems, setManualInventoryItems] = useState([]);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistAppointmentStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  useEffect(() => {
    api.get('/auth/staff-profile/me')
      .then(res => setServiceNames(res.data.profile?.serviceNames || ''))
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
    fetchAppointments();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (showLogoutModal || showNoteModal || showKitModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showNoteModal, showKitModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeNoteModal();
        closeKitModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const calendarDays = useMemo(() => {
    return generateCalendarDays(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate = selectedDate
        ? appointment.date === selectedDate
        : appointment.month === selectedMonth &&
          appointment.year === selectedYear;

      const matchesStatus =
        statusFilter === 'All' ||
        appointment.rawStatus.toLowerCase().replace(/[\s_]+/g, '') ===
          statusFilter.toLowerCase().replace(/[\s_]+/g, '');

      return matchesDate && matchesStatus;
    });
  }, [appointments, selectedDate, statusFilter]);

  const confirmedCount = filteredAppointments.filter(
    (appointment) =>
      appointment.rawStatus === 'scheduled' || appointment.rawStatus === 'rescheduled'
  ).length;

  const waitingCount = filteredAppointments.filter(
    (appointment) => appointment.rawStatus === 'completed'
  ).length;

  const noShowCount = filteredAppointments.filter(
    (appointment) => appointment.rawStatus === 'no_show'
  ).length;

  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredAppointments.slice(start, end);
  }, [filteredAppointments, currentPage]);

  const manualKitCategories = useMemo(() => {
    const sourceItems = manualInventoryItems.length > 0 ? manualInventoryItems : kitItems;

    const categories = sourceItems
      .map((item) => item.category)
      .filter(Boolean)
      .map((category) => String(category));

    return [...new Set(categories)];
  }, [manualInventoryItems, kitItems]);

  const manualKitCategoryItems = useMemo(() => {
    const sourceItems = manualInventoryItems.length > 0 ? manualInventoryItems : kitItems;

    return sourceItems.filter(
      (item) => String(item.category) === String(manualKitCategory)
    );
  }, [manualInventoryItems, kitItems, manualKitCategory]);

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

  function openNoteModal(appointment) {
    if (appointment.rawStatus !== 'completed') {
      return;
    }

    setSelectedNoteAppointment(appointment);
    setNoteText(appointment.note || '');
    setShowNoteModal(true);
  }

  function closeNoteModal() {
    setShowNoteModal(false);
    setSelectedNoteAppointment(null);
    setNoteText('');
    setNoteSaving(false);
  }

  function handleNoteModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeNoteModal();
    }
  }

  async function handleSaveNote() {
    if (!selectedNoteAppointment || noteSaving) {
      return;
    }

    setNoteSaving(true);

    try {
      await saveAppointmentNote(selectedNoteAppointment.id, noteText.trim());
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedNoteAppointment.id
            ? { ...a, note: noteText.trim() }
            : a
        )
      );
      closeNoteModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setNoteSaving(false);
    }
  }

  async function openKitModal(appointment) {
    const cleanStatus = String(appointment?.rawStatus || '')
      .toLowerCase()
      .replace(/[\s_]+/g, '');
    const isConsultation = /consultation/i.test(String(appointment?.reason || ''));

    if (cleanStatus !== 'completed') return;

    setSelectedKitAppointment(appointment);
    setKitItems([]);
    setKitNotes('');
    setKitError('');
    setKitAlreadySubmitted(false);
    setManualKitOpen(false);
    setManualKitCategory('');
    setManualKitInventoryId('');
    setManualKitQty(1);
    setManualKitError('');
    setManualInventoryItems([]);
    setShowKitModal(true);
    setKitLoading(true);

    try {
      const [consumptionData, kitData] = await Promise.all([
        getConsumption(appointment.id).catch(() => ({ submitted: false, items: [] })),
        appointment.serviceId && appointment.branchId
          ? getServiceKit(appointment.serviceId, appointment.branchId).catch(() => ({
              kit_exists: false,
              items: [],
            }))
          : Promise.resolve({ kit_exists: false, items: [] }),
      ]);

      if (isConsultation) {
        setKitAlreadySubmitted(Boolean(consumptionData?.submitted));
        setKitNotes('No inventory items was used for consultation service.');
        setKitItems([]);
        setManualInventoryItems([]);
        return;
      }

      if (consumptionData.submitted) {
        setKitAlreadySubmitted(true);

        const submittedItems = consumptionData.items.map((item) => ({
          category: item.category,
          item_name: item.item_name,
          inventory_id: item.item_id,
          quantity_used: item.quantity_used,
          current_stock: null,
          available: true,
          sufficient: true,
          submitted: true,
        }));

        setKitItems(submittedItems);
        setManualInventoryItems(submittedItems);
      } else {
        const normalizedKitItems = (kitData.items || []).map((item) => ({
          category: item.category,
          item_name: item.item_name,
          inventory_id: item.inventory_id,
          quantity_used: item.default_quantity,
          current_stock: item.current_stock,
          unit: item.unit,
          available: item.available,
          sufficient: item.sufficient,
        }));

        const inventorySource =
          kitData.inventory_items ||
          kitData.inventoryItems ||
          kitData.all_items ||
          kitData.allItems ||
          kitData.branch_items ||
          kitData.branchItems ||
          kitData.items ||
          [];

        const normalizedInventoryItems = inventorySource.map((item) => ({
          category: item.category,
          item_name: item.item_name || item.name,
          inventory_id: item.inventory_id || item.item_id || item.id,
          quantity_used: item.default_quantity || 1,
          current_stock: item.current_stock ?? item.quantity ?? item.stock ?? null,
          unit: item.unit,
          available: item.available ?? true,
          sufficient: item.sufficient ?? true,
        }));

        setKitNotes(kitData.notes || '');
        setKitItems(normalizedKitItems);
        setManualInventoryItems(normalizedInventoryItems);
      }
    } catch (err) {
      setKitError(err.response?.data?.message || 'Failed to load service kit.');
    } finally {
      setKitLoading(false);
    }
  }

  function closeKitModal() {
    setShowKitModal(false);
    setSelectedKitAppointment(null);
    setKitItems([]);
    setKitError('');
    setKitSubmitting(false);
    setKitAlreadySubmitted(false);
    setManualKitOpen(false);
    setManualKitCategory('');
    setManualKitInventoryId('');
    setManualKitQty(1);
    setManualKitError('');
    setManualInventoryItems([]);
  }

  function handleKitModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeKitModal();
    }
  }

  function handleKitQtyChange(index, value) {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setKitItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity_used: qty } : item))
    );
  }

  function handleManualKitCategoryChange(value) {
    setManualKitCategory(value);
    setManualKitInventoryId('');
    setManualKitError('');
  }

  function handleManualKitAddItem() {
    if (!manualKitCategory) {
      setManualKitError('Please choose a category.');
      return;
    }

    if (!manualKitInventoryId) {
      setManualKitError('Please choose an item.');
      return;
    }

    const qty = Math.max(1, parseInt(manualKitQty, 10) || 1);

    const selectedItem = manualKitCategoryItems.find(
      (item) => String(item.inventory_id) === String(manualKitInventoryId)
    );

    if (!selectedItem) {
      setManualKitError('Selected item was not found.');
      return;
    }

    setKitItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.inventory_id) === String(selectedItem.inventory_id)
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity_used: Number(item.quantity_used || 0) + qty,
                manual: item.manual || selectedItem.manual || false,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          category: selectedItem.category,
          item_name: selectedItem.item_name,
          inventory_id: selectedItem.inventory_id,
          quantity_used: qty,
          current_stock: selectedItem.current_stock,
          unit: selectedItem.unit,
          available: selectedItem.available ?? true,
          sufficient: selectedItem.sufficient ?? true,
          manual: true,
        },
      ];
    });

    setManualKitInventoryId('');
    setManualKitQty(1);
    setManualKitError('');
  }

  async function handleKitConfirm() {
    if (!selectedKitAppointment || kitSubmitting) return;

    const itemsToSubmit = kitItems
      .filter((item) => item.quantity_used > 0 && item.inventory_id)
      .map((item) => ({
        category: item.category,
        inventory_id: item.inventory_id,
        quantity_used: item.quantity_used,
      }));

    if (itemsToSubmit.length === 0) {
      closeKitModal();
      return;
    }

    setKitSubmitting(true);
    setKitError('');

    try {
      await submitConsumption(selectedKitAppointment.id, itemsToSubmit);
      closeKitModal();
    } catch (err) {
      setKitError(err.response?.data?.message || 'Failed to submit consumption.');
    } finally {
      setKitSubmitting(false);
    }
  }

  function goToPreviousMonth() {
    setSelectedDate('');

    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  }

  function goToNextMonth() {
    setSelectedDate('');

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  }

  function handleMonthChange(value) {
    setSelectedMonth(Number(value));
    setSelectedDate('');
  }

  function handleYearChange(value) {
    setSelectedYear(Number(value));
    setSelectedDate('');
  }

  async function fetchAppointments() {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const from = new Date(selectedYear, selectedMonth, 1);
      const to = new Date(selectedYear, selectedMonth + 1, 1);
      const data = await listAppointments({
        from: from.toISOString(),
        to: to.toISOString(),
      });

      setAppointments(normalizeAppointments(data));
    } catch (err) {
      setAppointmentsError(
        err.response?.data?.message || 'Failed to load appointments.'
      );
    } finally {
      setAppointmentsLoading(false);
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

  function getStatusPillStyle(status) {
    const cleanStatus = String(status).toLowerCase().replace(/[\s_]+/g, '');

    if (cleanStatus === 'scheduled' || cleanStatus === 'rescheduled') {
      return { ...styles.statusPill, ...styles.statusPillConfirmed };
    }

    if (cleanStatus === 'completed') {
      return { ...styles.statusPill, ...styles.statusPillWaiting };
    }

    if (cleanStatus === 'noshow') {
      return { ...styles.statusPill, ...styles.statusPillNoShow };
    }

    return styles.statusPill;
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

          <Link
            to="/dentistAppointment"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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
              <span style={styles.heroBadge}>Appointment Schedule</span>

              <h2 style={styles.heroTitle}>
                Review your appointments and manage patient visits
              </h2>

              <p style={styles.heroText}>
                Track confirmed, waiting, and missed appointments assigned to
                your schedule.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i
                className="fi fi-rr-calendar-clock"
                style={styles.heroIconText}
              ></i>
            </div>
          </section>

          <section style={styles.appointmentLayout}>
            <div style={styles.calendarCard}>
              <div style={styles.calendarHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Calendar</h3>
                  <p style={styles.cardSubtitle}>Select month and year</p>
                </div>
              </div>

              <div style={styles.controls}>
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  style={styles.calendarNav}
                >
                  <i className="fi fi-rr-angle-left"></i>
                </button>

                <div style={styles.calendarSelects}>
                  <select
                    value={selectedMonth}
                    onChange={(event) =>
                      handleMonthChange(event.target.value)
                    }
                    style={styles.calendarSelect}
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(event) => handleYearChange(event.target.value)}
                    style={styles.calendarSelect}
                  >
                    {generateYears(today.getFullYear() - 2, 8).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  style={styles.calendarNav}
                >
                  <i className="fi fi-rr-angle-right"></i>
                </button>
              </div>

              <div style={styles.currentMonthLabel}>
                {monthNames[selectedMonth]} {selectedYear}
              </div>

              <table style={styles.calendarTable}>
                <thead>
                  <tr>
                    <th style={styles.calendarTh}>Su</th>
                    <th style={styles.calendarTh}>Mo</th>
                    <th style={styles.calendarTh}>Tu</th>
                    <th style={styles.calendarTh}>We</th>
                    <th style={styles.calendarTh}>Th</th>
                    <th style={styles.calendarTh}>Fr</th>
                    <th style={styles.calendarTh}>Sa</th>
                  </tr>
                </thead>

                <tbody>
                  {calendarDays.map((week, weekIndex) => (
                    <tr key={`week-${weekIndex}`}>
                      {week.map((day, dayIndex) => {
                        const isSelected =
                          day.dateString && day.dateString === selectedDate;

                        return (
                          <td
                            key={`${weekIndex}-${dayIndex}`}
                            onClick={() => {
                              if (!day.disabled) {
                                setSelectedDate(day.dateString);
                                setCurrentPage(1);
                              }
                            }}
                            style={{
                              ...styles.calendarTd,
                              ...(day.disabled ? styles.calendarDisabled : {}),
                              ...(day.isToday ? styles.calendarToday : {}),
                              ...(isSelected ? styles.calendarSelected : {}),
                            }}
                          >
                            {day.dayNumber || ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.appointmentContent}>
              <section style={styles.statusGrid}>
                <div style={{ ...styles.statusCard, ...styles.confirmedCard }}>
                  <span style={styles.statusCardLabel}>Scheduled</span>
                  <h2 style={styles.statusCardValue}>{confirmedCount}</h2>
                </div>

                <div style={{ ...styles.statusCard, ...styles.waitingCard }}>
                  <span style={styles.statusCardLabel}>Completed</span>
                  <h2 style={styles.statusCardValue}>{waitingCount}</h2>
                </div>

                <div style={{ ...styles.statusCard, ...styles.noShowCard }}>
                  <span style={styles.statusCardLabel}>No Show</span>
                  <h2 style={styles.statusCardValue}>{noShowCount}</h2>
                </div>
              </section>

              <section style={styles.tableCard}>
                <div style={styles.tableHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Appointment List</h3>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.dropdownStatus}
                  >
                    <option value="All">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.doctorTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableHead}>Patient Name</th>
                        <th style={styles.tableHead}>Reason</th>
                        <th style={styles.tableHead}>Time</th>
                        <th style={styles.tableHead}>Status</th>
                        <th style={styles.tableHead}>Action</th>
                        <th style={styles.tableHead}>Note</th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointmentsLoading ? (
                        <tr>
                          <td colSpan="6" style={styles.emptyRow}>
                            Loading appointments...
                          </td>
                        </tr>
                      ) : appointmentsError ? (
                        <tr>
                          <td colSpan="6" style={styles.emptyRow}>
                            {appointmentsError}
                          </td>
                        </tr>
                      ) : paginatedAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={styles.emptyRow}>
                            No appointment found.
                          </td>
                        </tr>
                      ) : (
                        paginatedAppointments.map((appointment) => {
                          const isCompleted =
                            String(appointment?.rawStatus || '')
                              .toLowerCase()
                              .replace(/[\s_]+/g, '') === 'completed';
                          const hasNote = Boolean(appointment.note);

                          return (
                            <tr key={appointment.id} style={styles.tableRow}>
                              <td style={styles.tableCell}>
                                {appointment.patientName}
                              </td>

                              <td style={styles.tableCell}>
                                {appointment.reason}
                              </td>

                              <td style={styles.tableCell}>
                                {appointment.originalSchedule && appointment.rescheduledSchedule ? (
                                  <div style={{ display: 'grid', gap: 6, whiteSpace: 'normal' }}>
                                    <div>
                                      <strong>Original Schedule:</strong> {appointment.originalSchedule}
                                    </div>
                                    <div>
                                      <strong>Rescheduled:</strong> {appointment.rescheduledSchedule}
                                    </div>
                                  </div>
                                ) : (
                                  appointment.time
                                )}
                              </td>

                              <td style={styles.tableCell}>
                                <span
                                  style={getStatusPillStyle(
                                    appointment.status
                                  )}
                                >
                                  {appointment.status}
                                </span>
                              </td>

                              <td style={styles.tableCell}>
                                {isCompleted ? (
                                  <button
                                    type="button"
                                    style={styles.reviewKitButton}
                                    onClick={() => openKitModal(appointment)}
                                  >
                                    Service Kit
                                  </button>
                                ) : (
                                  <span style={styles.noActionText}>
                                    No Action
                                  </span>
                                )}
                              </td>

                              <td style={styles.tableCell}>
                                <button
                                  type="button"
                                  disabled={!isCompleted}
                                  onClick={() => openNoteModal(appointment)}
                                  style={{
                                    ...styles.noteButton,
                                    ...(!isCompleted
                                      ? styles.noteButtonDisabled
                                      : {}),
                                  }}
                                >
                                  {hasNote ? 'Edit Note' : 'Add Note'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
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
                    {filteredAppointments.length === 0
                      ? 'Page 0 of 0'
                      : `Page ${currentPage} of ${totalPages}`}
                  </span>

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage >= totalPages
                        ? styles.pageBtnDisabled
                        : {}),
                    }}
                  >
                    <i className="fi fi-rr-angle-right"></i>
                  </button>
                </div>
              </section>
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

      {showKitModal && selectedKitAppointment && (
        <div style={styles.modal} onClick={handleKitModalOverlayClick}>
          <div
            style={{
              ...styles.noteModalContent,
              maxWidth: '680px',
              width: '92vw',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.noteModalHeader}>
              <div>
                <h2 style={styles.noteModalTitle}>Service Kit</h2>
                <p style={styles.noteModalSubtitle}>
                  {kitAlreadySubmitted
                    ? 'Items used for this appointment already submitted.'
                    : 'Review, adjust, and confirm items used for this appointment.'}
                </p>
              </div>
            </div>

            <div style={styles.noteDetailsBox}>
              <div style={styles.noteDetailItem}>
                <span style={styles.noteDetailLabel}>Patient</span>
                <strong style={styles.noteDetailValue}>
                  {selectedKitAppointment.patientName}
                </strong>
              </div>

              <div style={styles.noteDetailItem}>
                <span style={styles.noteDetailLabel}>Service</span>
                <strong style={styles.noteDetailValue}>
                  {selectedKitAppointment.reason}
                </strong>
              </div>
            </div>

            {!kitAlreadySubmitted && !kitLoading && (
              <div style={styles.serviceKitToolbar}>
                <p style={styles.kitNoteText}>
                  {kitNotes ? `Kit note: ${kitNotes}` : 'Kit note: No kit note added.'}
                </p>

                <button
                  type="button"
                  style={styles.kitAddButton}
                  onClick={() => {
                    setManualKitOpen((prev) => !prev);
                    setManualKitError('');
                  }}
                >
                  {manualKitOpen ? 'Hide Add Item' : 'Add Other Item'}
                </button>
              </div>
            )}

            {!kitAlreadySubmitted && manualKitOpen && !kitLoading && (
              <div style={styles.kitManualPanel}>
                <div style={styles.kitManualGrid}>
                  <div style={styles.kitManualField}>
                    <label style={styles.kitManualLabel}>Category</label>
                    <select
                      value={manualKitCategory}
                      onChange={(event) =>
                        handleManualKitCategoryChange(event.target.value)
                      }
                      style={styles.kitManualSelect}
                    >
                      <option value="">Choose category</option>
                      {manualKitCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.kitManualField}>
                    <label style={styles.kitManualLabel}>Item</label>
                    <select
                      value={manualKitInventoryId}
                      onChange={(event) => {
                        setManualKitInventoryId(event.target.value);
                        setManualKitError('');
                      }}
                      style={styles.kitManualSelect}
                      disabled={!manualKitCategory}
                    >
                      <option value="">Choose item</option>
                      {manualKitCategoryItems.map((item) => (
                        <option
                          key={item.inventory_id}
                          value={item.inventory_id}
                        >
                          {item.item_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.kitManualField}>
                    <label style={styles.kitManualLabel}>Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={manualKitQty}
                      onChange={(event) => setManualKitQty(event.target.value)}
                      style={styles.kitQtyInput}
                    />
                  </div>

                  <button
                    type="button"
                    style={styles.kitAddButton}
                    onClick={handleManualKitAddItem}
                  >
                    Add
                  </button>
                </div>

                {manualKitError && (
                  <p style={styles.kitInlineError}>{manualKitError}</p>
                )}
              </div>
            )}

            {kitLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
                Loading kit…
              </p>
            ) : kitError ? (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px' }}>
                {kitError}
              </p>
            ) : kitItems.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                {/consultation/i.test(String(selectedKitAppointment?.reason || ''))
                  ? 'No inventory items was used for consultation service.'
                  : 'No items defined for this service kit.'}
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.tableHead, textAlign: 'left', padding: '10px 12px' }}>Item</th>
                      <th style={{ ...styles.tableHead, textAlign: 'left', padding: '10px 12px' }}>Category</th>
                      <th style={{ ...styles.tableHead, textAlign: 'left', padding: '10px 12px' }}>
                        {kitAlreadySubmitted ? 'Used' : 'Qty'}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {kitItems.map((item, index) => (
                      <tr key={`${item.inventory_id}-${index}`} style={styles.tableRow}>
                        <td style={{ ...styles.tableCell, padding: '10px 12px' }}>
                          {item.item_name}

                          {item.manual && (
                            <span style={styles.kitManualBadge}>Manual</span>
                          )}

                          {!kitAlreadySubmitted && !item.available && (
                            <span style={{ color: '#ef4444', fontSize: '11px', display: 'block' }}>
                              Not in branch inventory
                            </span>
                          )}
                        </td>

                        <td style={{ ...styles.tableCell, padding: '10px 12px', textTransform: 'capitalize' }}>
                          {item.category}
                        </td>

                        <td style={{ ...styles.tableCell, padding: '10px 12px' }}>
                          {kitAlreadySubmitted ? (
                            item.quantity_used
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={item.quantity_used}
                              onChange={(e) => handleKitQtyChange(index, e.target.value)}
                              style={{
                                width: '60px',
                                padding: '4px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '13px',
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!kitAlreadySubmitted && !kitLoading && (
              <div style={styles.noteModalActions}>
                <button
                  type="button"
                  style={{ ...styles.noteActionButton, ...styles.noteCancelBtn }}
                  onClick={closeKitModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  style={{ ...styles.noteActionButton, ...styles.noteSaveBtn }}
                  onClick={handleKitConfirm}
                  disabled={kitSubmitting}
                >
                  {kitSubmitting ? 'Submitting…' : 'Confirm & Deduct'}
                </button>
              </div>
            )}

            {kitAlreadySubmitted && (
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <button
                  type="button"
                  style={{ ...styles.noteActionButton, ...styles.noteCancelBtn }}
                  onClick={closeKitModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showNoteModal && selectedNoteAppointment && (
        <div style={styles.modal} onClick={handleNoteModalOverlayClick}>
          <div style={styles.noteModalContent}>
            <div style={styles.noteModalHeader}>
              <div>
                <h2 style={styles.noteModalTitle}>Appointment Note</h2>
                <p style={styles.noteModalSubtitle}>
                  Add treatment notes for the completed appointment.
                </p>
              </div>

              <button
                type="button"
                style={styles.noteModalClose}
                onClick={closeNoteModal}
              >
                ×
              </button>
            </div>

            <div style={styles.noteDetailsBox}>
              <div style={styles.noteDetailItem}>
                <span style={styles.noteDetailLabel}>Patient</span>
                <strong style={styles.noteDetailValue}>
                  {selectedNoteAppointment.patientName}
                </strong>
              </div>

              <div style={styles.noteDetailItem}>
                <span style={styles.noteDetailLabel}>Reason</span>
                <strong style={styles.noteDetailValue}>
                  {selectedNoteAppointment.reason}
                </strong>
              </div>

              <div style={styles.noteDetailItem}>
                <span style={styles.noteDetailLabel}>Time</span>
                <strong style={styles.noteDetailValue}>
                  {selectedNoteAppointment.time}
                </strong>
              </div>
            </div>

            <label style={styles.noteLabel}>Dentist Note</label>

            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Enter the note after this appointment..."
              style={styles.noteTextarea}
            />

            <div style={styles.noteModalActions}>
              <button
                type="button"
                style={{ ...styles.noteActionButton, ...styles.noteCancelBtn }}
                onClick={closeNoteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.noteActionButton, ...styles.noteSaveBtn }}
                onClick={handleSaveNote}
                disabled={noteSaving}
              >
                {noteSaving ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateYears(startYear, count) {
  return Array.from({ length: count }, (_, index) => startYear + index);
}

function normalizeAppointments(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const date = new Date(item.start_time);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const note = item.dentist_note || item.note || '';
    const scheduleMeta = extractRescheduleInfo(note);
    const isRescheduled = Boolean(scheduleMeta.rescheduledSchedule);

    return {
      id: item.id || index + 1,
      branchId: item.branch_id || null,
      serviceId: item.service_id || null,
      patientName: item.patient_name || item.patientName || 'Unnamed Patient',
      reason: item.service_name || item.serviceName || 'Treatment not set',
      note: note,
      time: safeDate.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      originalSchedule: scheduleMeta.originalSchedule,
      rescheduledSchedule: scheduleMeta.rescheduledSchedule,
      status: isRescheduled ? 'Rescheduled' : formatAppointmentStatus(item.status),
      rawStatus: isRescheduled ? 'rescheduled' : (item.status || 'scheduled'),
      date: formatDateString(
        safeDate.getFullYear(),
        safeDate.getMonth(),
        safeDate.getDate()
      ),
      month: safeDate.getMonth(),
      year: safeDate.getFullYear(),
    };
  });
}

function formatAppointmentStatus(status) {
  const statusMap = {
    scheduled: 'Scheduled',
    rescheduled: 'Rescheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };

  return statusMap[status] || 'Scheduled';
}

function extractRescheduleInfo(noteText) {
  const note = String(noteText || '');
  if (!note.trim()) {
    return { originalSchedule: '', rescheduledSchedule: '' };
  }

  const originalMatch = note.match(/^Original Schedule:\s*(.+)$/im);
  const rescheduledMatch = note.match(/^Rescheduled:\s*(.+)$/im);
  const legacyMatch = note.match(/^Rescheduled to\s+(.+)$/im);

  return {
    originalSchedule: originalMatch?.[1]?.trim() || '',
    rescheduledSchedule:
      rescheduledMatch?.[1]?.trim() ||
      legacyMatch?.[1]?.trim() ||
      '',
  };
}

function formatDateString(year, month, day) {
  const monthText = String(month + 1).padStart(2, '0');
  const dayText = String(day).padStart(2, '0');

  return `${year}-${monthText}-${dayText}`;
}

function generateCalendarDays(month, year) {
  const today = new Date();
  const todayString = formatDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({
      dayNumber: '',
      dateString: '',
      disabled: true,
      isToday: false,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateString = formatDateString(year, month, day);

    cells.push({
      dayNumber: day,
      dateString,
      disabled: false,
      isToday: dateString === todayString,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      dayNumber: '',
      dateString: '',
      disabled: true,
      isToday: false,
    });
  }

  const weeks = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

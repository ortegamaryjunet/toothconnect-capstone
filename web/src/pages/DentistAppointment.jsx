import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { listAppointments, saveAppointmentNote } from '../api/appointments';
import { getServiceKit, getConsumption, submitConsumption, updateConsumption } from '../api/inventory';
import createDentistAppointmentStyles from '../styles/DentistAppointment';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import DentistProfileMenu from '../components/DentistProfileMenu';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/clinicLogo/clinic-logo-nav.png';

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
  const [showNoteCancelConfirmModal, setShowNoteCancelConfirmModal] = useState(false);
  const [showNoteSaveConfirmModal, setShowNoteSaveConfirmModal] = useState(false);
  const [noteSuccessModal, setNoteSuccessModal] = useState({ show: false, message: '' });

  const [showKitModal, setShowKitModal] = useState(false);
  const [showKitCancelConfirmModal, setShowKitCancelConfirmModal] = useState(false);
  const [showKitCloseConfirmModal, setShowKitCloseConfirmModal] = useState(false);
  const [showKitEditConfirmModal, setShowKitEditConfirmModal] = useState(false);
  const [showKitSubmitConfirmModal, setShowKitSubmitConfirmModal] = useState(false);
  const [showKitUpdateConfirmModal, setShowKitUpdateConfirmModal] = useState(false);
  const [kitSuccessModal, setKitSuccessModal] = useState({ show: false, message: '' });
  const [selectedKitAppointment, setSelectedKitAppointment] = useState(null);
  const [kitItems, setKitItems] = useState([]);
  const [originalKitItems, setOriginalKitItems] = useState([]);
  const [kitNotes, setKitNotes] = useState('');
  const [kitLoading, setKitLoading] = useState(false);
  const [kitError, setKitError] = useState('');
  const [kitSubmitting, setKitSubmitting] = useState(false);
  const [kitAlreadySubmitted, setKitAlreadySubmitted] = useState(false);
  const [kitSubmittedBy, setKitSubmittedBy] = useState(null);
  const [kitEditedBy, setKitEditedBy] = useState(null);
  const [kitEditedAt, setKitEditedAt] = useState('');
  const [kitEditMode, setKitEditMode] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [historyKitStatusById, setHistoryKitStatusById] = useState({});
  const [historyKitRefreshing, setHistoryKitRefreshing] = useState(false);

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
    if (
      showLogoutModal ||
      showNoteModal ||
      showNoteCancelConfirmModal ||
      showNoteSaveConfirmModal ||
      showKitModal ||
      showKitCancelConfirmModal ||
      showKitCloseConfirmModal ||
      showKitEditConfirmModal ||
      showKitSubmitConfirmModal ||
      showKitUpdateConfirmModal ||
      noteSuccessModal.show ||
      kitSuccessModal.show
    ) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    showLogoutModal,
    showNoteModal,
    showNoteCancelConfirmModal,
    showNoteSaveConfirmModal,
    showKitModal,
    showKitCancelConfirmModal,
    showKitCloseConfirmModal,
    showKitEditConfirmModal,
    showKitSubmitConfirmModal,
    showKitUpdateConfirmModal,
    noteSuccessModal.show,
    kitSuccessModal.show,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        if (showNoteSaveConfirmModal) {
          setShowNoteSaveConfirmModal(false);
        } else if (showNoteCancelConfirmModal) {
          setShowNoteCancelConfirmModal(false);
        } else if (showNoteModal && !noteSaving) {
          requestCloseNoteModal();
        } else if (showKitSubmitConfirmModal) {
          setShowKitSubmitConfirmModal(false);
        } else if (showKitUpdateConfirmModal) {
          setShowKitUpdateConfirmModal(false);
        } else if (showKitEditConfirmModal) {
          setShowKitEditConfirmModal(false);
        } else if (showKitCancelConfirmModal) {
          setShowKitCancelConfirmModal(false);
        } else if (showKitCloseConfirmModal) {
          setShowKitCloseConfirmModal(false);
        } else if (showKitModal && (!kitAlreadySubmitted || kitEditMode) && !kitSubmitting) {
          setShowKitCancelConfirmModal(true);
        } else if (showKitModal && kitAlreadySubmitted && !kitEditMode && !kitSubmitting) {
          setShowKitCloseConfirmModal(true);
        } else {
          closeLogoutModal();
          closeKitModal();
        }
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [
    showNoteSaveConfirmModal,
    showNoteCancelConfirmModal,
    showNoteModal,
    noteSaving,
    showKitSubmitConfirmModal,
    showKitUpdateConfirmModal,
    showKitEditConfirmModal,
    showKitCancelConfirmModal,
    showKitCloseConfirmModal,
    showKitModal,
    kitAlreadySubmitted,
    kitEditMode,
    kitSubmitting,
  ]);

  const calendarDays = useMemo(() => {
    return generateCalendarDays(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const dateFilteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate = selectedDate
        ? appointment.date === selectedDate
        : appointment.month === selectedMonth &&
          appointment.year === selectedYear;

      return matchesDate;
    });
  }, [appointments, selectedDate, selectedMonth, selectedYear]);

  const upcomingAppointments = useMemo(() => {
    return dateFilteredAppointments.filter((appointment) => {
      const cleanStatus = normalizeAppointmentStatus(appointment.rawStatus);
      return cleanStatus === 'scheduled' || cleanStatus === 'rescheduled' || cleanStatus === 'arrived';
    });
  }, [dateFilteredAppointments]);

  const historyAppointments = useMemo(() => {
    return dateFilteredAppointments
      .filter((appointment) => {
        const cleanStatus = normalizeAppointmentStatus(appointment.rawStatus);
        const isHistory =
          cleanStatus === 'completed' || cleanStatus === 'cancelled' || cleanStatus === 'noshow';
        const matchesStatus =
          statusFilter === 'All' ||
          cleanStatus === normalizeAppointmentStatus(statusFilter);

        return isHistory && matchesStatus;
      })
      .sort((a, b) => getAppointmentSortTime(b) - getAppointmentSortTime(a));
  }, [dateFilteredAppointments, statusFilter]);

  const confirmedCount = dateFilteredAppointments.filter(
    (appointment) => {
      const cleanStatus = normalizeAppointmentStatus(appointment.rawStatus);
      return cleanStatus === 'scheduled' || cleanStatus === 'rescheduled' || cleanStatus === 'arrived';
    }
  ).length;

  const waitingCount = dateFilteredAppointments.filter(
    (appointment) => normalizeAppointmentStatus(appointment.rawStatus) === 'completed'
  ).length;

  const noShowCount = dateFilteredAppointments.filter(
    (appointment) => normalizeAppointmentStatus(appointment.rawStatus) === 'noshow'
  ).length;

  const upcomingTotalPages = Math.ceil(upcomingAppointments.length / rowsPerPage);
  const historyTotalPages = Math.ceil(historyAppointments.length / rowsPerPage);

  const paginatedUpcomingAppointments = useMemo(() => {
    const start = (upcomingPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return upcomingAppointments.slice(start, end);
  }, [upcomingAppointments, upcomingPage]);

  const paginatedHistoryAppointments = useMemo(() => {
    const start = (historyPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return historyAppointments.slice(start, end);
  }, [historyAppointments, historyPage]);

  const visibleCompletedHistoryAppointments = useMemo(() => {
    return paginatedHistoryAppointments.filter(
      (appointment) => normalizeAppointmentStatus(appointment.rawStatus) === 'completed'
    );
  }, [paginatedHistoryAppointments]);

  const hasDeductibleKitItems = useMemo(
    () => kitItems.some((item) => Number(item.quantity_used) > 0 && item.inventory_id),
    [kitItems]
  );

  const kitHasStockError = useMemo(
    () => kitItems.some((item) =>
      item.inventory_id &&
      item.current_stock !== null &&
      item.current_stock !== undefined &&
      Number(item.quantity_used) > Number(item.current_stock)
    ),
    [kitItems]
  );

  useEffect(() => {
    setUpcomingPage((page) => Math.min(page, Math.max(upcomingTotalPages, 1)));
  }, [upcomingTotalPages]);

  useEffect(() => {
    setHistoryPage((page) => Math.min(page, Math.max(historyTotalPages, 1)));
  }, [historyTotalPages]);

  const loadVisibleHistoryKitStatuses = useCallback(async (options = {}) => {
    const completedRows = visibleCompletedHistoryAppointments;
    if (completedRows.length === 0) {
      return;
    }

    setHistoryKitRefreshing(true);

    try {
      const results = await Promise.all(
        completedRows.map(async (appointment) => {
          try {
            const consumptionData = await getConsumption(appointment.id);
            return {
              id: appointment.id,
              submitted: Boolean(consumptionData?.submitted),
              submittedByRole: consumptionData?.submitted_by?.role || '',
            };
          } catch {
            return {
              id: appointment.id,
              submitted: null,
              submittedByRole: '',
            };
          }
        })
      );

      if (options.cancelled?.()) return;

      setHistoryKitStatusById((current) => {
        const next = { ...current };
        results.forEach((item) => {
          next[item.id] = {
            submitted: item.submitted,
            submittedByRole: item.submittedByRole,
          };
        });
        return next;
      });
    } finally {
      if (!options.cancelled?.()) {
        setHistoryKitRefreshing(false);
      }
    }
  }, [visibleCompletedHistoryAppointments]);

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
    if (normalizeAppointmentStatus(appointment.rawStatus) !== 'completed') {
      return;
    }

    setSelectedNoteAppointment(appointment);
    setNoteText(appointment.note || '');
    setShowNoteModal(true);
  }

  function closeNoteModal() {
    setShowNoteModal(false);
    setShowNoteCancelConfirmModal(false);
    setShowNoteSaveConfirmModal(false);
    setSelectedNoteAppointment(null);
    setNoteText('');
    setNoteSaving(false);
  }

  function requestCloseNoteModal() {
    if (noteSaving) return;
    setShowNoteCancelConfirmModal(true);
  }

  function closeNoteCancelConfirmModal() {
    setShowNoteCancelConfirmModal(false);
  }

  function confirmCancelNoteModal() {
    closeNoteModal();
  }

  function requestSaveNoteModal() {
    if (!selectedNoteAppointment || noteSaving) {
      return;
    }

    setShowNoteSaveConfirmModal(true);
  }

  function closeNoteSaveConfirmModal() {
    setShowNoteSaveConfirmModal(false);
  }

  function confirmSaveNoteModal() {
    setShowNoteSaveConfirmModal(false);
    handleSaveNote();
  }

  function showNoteSuccessModal(message) {
    setNoteSuccessModal({ show: true, message });
    window.setTimeout(() => {
      setNoteSuccessModal({ show: false, message: '' });
    }, 3000);
  }

  function handleNoteModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      requestCloseNoteModal();
    }
  }

  async function handleSaveNote() {
    if (!selectedNoteAppointment || noteSaving) {
      return;
    }

    setNoteSaving(true);

    try {
      const savedNote = noteText.trim();
      const appointmentLabel = getServiceKitAppointmentLabel(selectedNoteAppointment);
      await saveAppointmentNote(selectedNoteAppointment.id, savedNote);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedNoteAppointment.id
            ? { ...a, note: savedNote }
            : a
        )
      );
      closeNoteModal();
      showNoteSuccessModal(
        `Note for this appointment (${appointmentLabel}) has been successfully saved.`
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setNoteSaving(false);
    }
  }

  async function openKitModal(appointment) {
    const cleanStatus = normalizeAppointmentStatus(appointment?.rawStatus);
    const isConsultation = /consultation/i.test(String(appointment?.reason || ''));

    if (cleanStatus !== 'completed') return;

    setSelectedKitAppointment(appointment);
    setKitItems([]);
    setOriginalKitItems([]);
    setKitNotes('');
    setKitError('');
    setKitAlreadySubmitted(false);
    setKitSubmittedBy(null);
    setKitEditedBy(null);
    setKitEditedAt('');
    setKitEditMode(false);
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
        setKitSubmittedBy(consumptionData?.submitted_by || null);
        setKitEditedBy(consumptionData?.edited_by || null);
        setKitEditedAt(consumptionData?.edited_at || '');
        setKitNotes('No inventory items was used for consultation service.');
        setKitItems([]);
        setOriginalKitItems([]);
        return;
      }

      if (consumptionData.submitted) {
        setKitAlreadySubmitted(true);
        setKitSubmittedBy(consumptionData?.submitted_by || null);
        setKitEditedBy(consumptionData?.edited_by || null);
        setKitEditedAt(consumptionData?.edited_at || '');

        const kitStockMap = {};
        (kitData?.items || []).forEach((ki) => {
          if (ki.inventory_id != null) kitStockMap[ki.inventory_id] = ki.current_stock;
        });
        const submittedItems = consumptionData.items.map((item) => ({
          category: item.category,
          item_name: item.item_name,
          inventory_id: item.item_id,
          quantity_used: item.quantity_used,
          current_stock: item.item_id != null ? (kitStockMap[item.item_id] ?? null) : null,
          available: true,
          sufficient: true,
          submitted: true,
        }));

        setKitItems(submittedItems);
        setOriginalKitItems(submittedItems);
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

        setKitNotes(kitData.notes || '');
        setKitItems(normalizedKitItems);
        setOriginalKitItems([]);
      }
    } catch (err) {
      setKitError(err.response?.data?.message || 'Failed to load service kit.');
    } finally {
      setKitLoading(false);
    }
  }

  function closeKitModal() {
    setShowKitCancelConfirmModal(false);
    setShowKitCloseConfirmModal(false);
    setShowKitEditConfirmModal(false);
    setShowKitSubmitConfirmModal(false);
    setShowKitUpdateConfirmModal(false);
    setShowKitModal(false);
    setSelectedKitAppointment(null);
    setKitItems([]);
    setOriginalKitItems([]);
    setKitError('');
    setKitSubmitting(false);
    setKitAlreadySubmitted(false);
    setKitSubmittedBy(null);
    setKitEditedBy(null);
    setKitEditedAt('');
    setKitEditMode(false);
  }

  function handleKitModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      if ((!kitAlreadySubmitted || kitEditMode) && !kitSubmitting) {
        setShowKitCancelConfirmModal(true);
        return;
      }
      if (kitAlreadySubmitted && !kitEditMode && !kitSubmitting) {
        setShowKitCloseConfirmModal(true);
        return;
      }
      closeKitModal();
    }
  }

  function requestCloseKitModal() {
    if (kitSubmitting) return;
    setShowKitCancelConfirmModal(true);
  }

  function closeKitCancelConfirmModal() {
    setShowKitCancelConfirmModal(false);
  }

  function confirmCancelKitModal() {
    closeKitModal();
  }

  function closeKitCloseConfirmModal() {
    setShowKitCloseConfirmModal(false);
  }

  function confirmCloseKitModal() {
    closeKitModal();
  }

  function closeKitSubmitConfirmModal() {
    setShowKitSubmitConfirmModal(false);
  }

  function confirmSubmitKitModal() {
    setShowKitSubmitConfirmModal(false);
    handleKitConfirm();
  }

  function closeKitUpdateConfirmModal() {
    setShowKitUpdateConfirmModal(false);
  }

  function confirmUpdateKitModal() {
    setShowKitUpdateConfirmModal(false);
    handleKitConfirm();
  }

  function showKitSuccessModal(message) {
    setKitSuccessModal({ show: true, message });
    window.setTimeout(() => {
      setKitSuccessModal({ show: false, message: '' });
    }, 3000);
  }

  function closeKitEditConfirmModal() {
    setShowKitEditConfirmModal(false);
  }

  function confirmEditKitModal() {
    setShowKitEditConfirmModal(false);
    setKitEditMode(true);
  }

  function handleKitQtyChange(index, value) {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setKitItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity_used: qty } : item))
    );
  }

  async function handleKitConfirm() {
    if (!selectedKitAppointment || kitSubmitting) return;
    const isEditingSubmitted = kitAlreadySubmitted && kitEditMode;

    const itemsToSubmit = kitItems
      .filter((item) => item.quantity_used > 0 && item.inventory_id)
      .map((item) => ({
        category: item.category,
        inventory_id: item.inventory_id,
        quantity_used: item.quantity_used,
      }));

    if (itemsToSubmit.length === 0) {
      setKitError('No valid inventory items to deduct.');
      return;
    }

    const hasOverStock = kitItems.some((item) =>
      item.inventory_id &&
      item.current_stock !== null &&
      item.current_stock !== undefined &&
      Number(item.quantity_used) > Number(item.current_stock)
    );
    if (hasOverStock) {
      setKitError('One or more quantities exceed current stock. Please correct before deducting.');
      return;
    }

    setKitSubmitting(true);
    setKitError('');

    try {
      if (isEditingSubmitted) {
        await updateConsumption(selectedKitAppointment.id, itemsToSubmit);
      } else {
        await submitConsumption(selectedKitAppointment.id, itemsToSubmit);
      }
      showKitSuccessModal(
        `Service kit for ${getServiceKitAppointmentLabel(selectedKitAppointment)} has been ${isEditingSubmitted ? 'updated' : 'successfully submitted'}${isEditingSubmitted ? ' successfully' : ''}.`
      );
      setKitAlreadySubmitted(true);
      setKitEditMode(false);
      setOriginalKitItems(kitItems);
      setHistoryKitStatusById((current) => ({
        ...current,
        [selectedKitAppointment.id]: {
          submitted: true,
          submittedByRole: user?.role || 'dentist',
        },
      }));
      setKitSubmittedBy({
        name: user?.name || 'Dentist',
        role: user?.role || 'dentist',
      });
      if (isEditingSubmitted) {
        setKitEditedBy({
          name: user?.name || 'Dentist',
          role: user?.role || 'dentist',
        });
        setKitEditedAt(new Date().toISOString());
      }
      loadVisibleHistoryKitStatuses();
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

  function nextUpcomingPage() {
    if (upcomingPage < upcomingTotalPages) {
      setUpcomingPage((prev) => prev + 1);
    }
  }

  function prevUpcomingPage() {
    if (upcomingPage > 1) {
      setUpcomingPage((prev) => prev - 1);
    }
  }

  function nextHistoryPage() {
    if (historyPage < historyTotalPages) {
      setHistoryPage((prev) => prev + 1);
    }
  }

  function prevHistoryPage() {
    if (historyPage > 1) {
      setHistoryPage((prev) => prev - 1);
    }
  }

  function getStatusPillStyle(status) {
    const cleanStatus = normalizeAppointmentStatus(status);

    if (cleanStatus === 'scheduled' || cleanStatus === 'rescheduled' || cleanStatus === 'arrived') {
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

  function getServiceKitStatusLabel(statusInfo) {
    if (!statusInfo) return historyKitRefreshing ? 'Checking...' : 'No Service Kit Added';
    if (statusInfo.submitted === null) return 'Unable to Check';
    if (!statusInfo.submitted) return 'No Service Kit Added';

    const role = String(statusInfo.submittedByRole || '').toLowerCase();
    if (role === 'receptionist') return 'Receptionist Submitted';
    if (role === 'dentist') return 'Dentist Submitted';
    return 'Service Kit Submitted';
  }

  function getServiceKitStatusStyle(statusInfo) {
    if (!statusInfo || statusInfo.submitted === false) {
      return { ...styles.serviceKitStatusBadge, ...styles.serviceKitStatusMissing };
    }

    if (statusInfo.submitted === null) {
      return { ...styles.serviceKitStatusBadge, ...styles.serviceKitStatusUnknown };
    }

    return { ...styles.serviceKitStatusBadge, ...styles.serviceKitStatusSubmitted };
  }

  function renderAppointmentRows(rows, emptyMessage, options = {}) {
    const showActions = options.showActions !== false;
    const colSpan = showActions ? 7 : 4;

    if (appointmentsLoading) {
      return (
        <tr>
          <td colSpan={colSpan} style={styles.emptyRow}>
            Loading appointments...
          </td>
        </tr>
      );
    }

    if (appointmentsError) {
      return (
        <tr>
          <td colSpan={colSpan} style={styles.emptyRow}>
            {appointmentsError}
          </td>
        </tr>
      );
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={colSpan} style={styles.emptyRow}>
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return rows.map((appointment) => {
      const isCompleted =
        normalizeAppointmentStatus(appointment?.rawStatus) === 'completed';
      const hasNote = Boolean(appointment.note);

      return (
        <tr key={appointment.id} style={styles.tableRow}>
          <td style={styles.tableCell}>{appointment.patientName}</td>

          <td style={styles.tableCell}>{appointment.reason}</td>

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
            <span style={getStatusPillStyle(appointment.status)}>
              {appointment.status}
            </span>
          </td>

          {showActions && (
            <>
              <td style={styles.tableCell}>
                {isCompleted ? (
                  <span style={getServiceKitStatusStyle(historyKitStatusById[appointment.id])}>
                    {getServiceKitStatusLabel(historyKitStatusById[appointment.id])}
                  </span>
                ) : (
                  <span style={styles.noActionText}>Not Required</span>
                )}
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
                  <span style={styles.noActionText}>No Action</span>
                )}
              </td>

              <td style={styles.tableCell}>
                <button
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => openNoteModal(appointment)}
                  style={{
                    ...styles.noteButton,
                    ...(!isCompleted ? styles.noteButtonDisabled : {}),
                  }}
                >
                  {hasNote ? 'Edit Note' : 'Add Note'}
                </button>
              </td>
            </>
          )}
        </tr>
      );
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
            <DentistProfileMenu
              styles={styles}
              dentistName={user?.name || 'Dentist'}
              specialization="Dentist"
            />
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
                  Prev
                </button>

                <div style={styles.calendarSelects}>
                  <select
                    value={selectedMonth}
                    onChange={(event) => handleMonthChange(event.target.value)}
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
                  Next
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
                        const showTodayHighlight = day.isToday && !selectedDate;

                        return (
                          <td
                            key={`${weekIndex}-${dayIndex}`}
                            onClick={() => {
                              if (!day.disabled) {
                                setSelectedDate(day.dateString);
                                setUpcomingPage(1);
                                setHistoryPage(1);
                              }
                            }}
                            style={{
                              ...styles.calendarTd,
                              ...(day.disabled ? styles.calendarDisabled : {}),
                              ...(showTodayHighlight ? styles.calendarToday : {}),
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
                    <h3 style={styles.cardTitle}>Upcoming Appointments</h3>
                  </div>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.doctorTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableHead}>Patient Name</th>
                        <th style={styles.tableHead}>Reason</th>
                        <th style={styles.tableHead}>Time</th>
                        <th style={styles.tableHead}>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {renderAppointmentRows(
                        paginatedUpcomingAppointments,
                        'No upcoming appointment found.',
                        { showActions: false }
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={styles.pagination}>
                  <button
                    type="button"
                    onClick={prevUpcomingPage}
                    disabled={upcomingPage === 1}
                    style={{ ...styles.pageBtn, ...styles.prevPageBtn,
                      ...(upcomingPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    Prev
                  </button>

                  <span style={styles.pageInfo}>
                    {upcomingAppointments.length === 0
                      ? 'Page 0 of 0'
                      : `Page ${upcomingPage} of ${upcomingTotalPages}`}
                  </span>

                  <button
                    type="button"
                    onClick={nextUpcomingPage}
                    disabled={upcomingPage >= upcomingTotalPages}
                    style={{ ...styles.pageBtn, ...styles.nextPageBtn,
                      ...(upcomingPage >= upcomingTotalPages
                        ? styles.pageBtnDisabled
                        : {}),
                    }}
                  >
                    Next
                  </button>
                </div>
              </section>

              <section style={styles.tableCard}>
                <div style={styles.tableHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Appointment List</h3>
                  </div>

                  <div style={styles.tableHeaderActions}>
                    <button
                      type="button"
                      style={{
                        ...styles.refreshButton,
                        ...(historyKitRefreshing ? styles.refreshButtonDisabled : {}),
                      }}
                      onClick={() => loadVisibleHistoryKitStatuses()}
                      disabled={historyKitRefreshing}
                    >
                      <i className="fi fi-rr-refresh" style={styles.refreshButtonIcon}></i>
                      {historyKitRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>

                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setHistoryPage(1);
                      }}
                      style={styles.dropdownStatus}
                    >
                      <option value="All">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.doctorTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableHead}>Patient Name</th>
                        <th style={styles.tableHead}>Reason</th>
                        <th style={styles.tableHead}>Time</th>
                        <th style={styles.tableHead}>Status</th>
                        <th style={styles.tableHead}>Service Kit Status</th>
                        <th style={styles.tableHead}>Action</th>
                        <th style={styles.tableHead}>Note</th>
                      </tr>
                    </thead>

                    <tbody>
                      {renderAppointmentRows(
                        paginatedHistoryAppointments,
                        'No completed, cancelled, or no show appointment found.'
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={styles.pagination}>
                  <button
                    type="button"
                    onClick={prevHistoryPage}
                    disabled={historyPage === 1}
                    style={{ ...styles.pageBtn, ...styles.prevPageBtn,
                      ...(historyPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    Prev
                  </button>

                  <span style={styles.pageInfo}>
                    {historyAppointments.length === 0
                      ? 'Page 0 of 0'
                      : `Page ${historyPage} of ${historyTotalPages}`}
                  </span>

                  <button
                    type="button"
                    onClick={nextHistoryPage}
                    disabled={historyPage >= historyTotalPages}
                    style={{ ...styles.pageBtn, ...styles.nextPageBtn,
                      ...(historyPage >= historyTotalPages
                        ? styles.pageBtnDisabled
                        : {}),
                    }}
                  >
                    Next
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
                    ? `Service kit already submitted by ${formatConsumptionSubmitter(kitSubmittedBy)}.`
                    : 'Service kit template for this appointment.'}
                </p>
              </div>
              {kitAlreadySubmitted && (
                <button
                  type="button"
                  style={styles.noteModalClose}
                  onClick={() => setShowKitCloseConfirmModal(true)}
                  disabled={kitSubmitting}
                >
                  Ã—
                </button>
              )}
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
              {kitAlreadySubmitted && (
                <div style={styles.noteDetailItem}>
                  <span style={styles.noteDetailLabel}>Submitted By</span>
                  <strong style={styles.noteDetailValue}>
                    {formatConsumptionSubmitter(kitSubmittedBy)}
                  </strong>
                </div>
              )}
              {kitEditedBy && (
                <div style={styles.noteDetailItem}>
                  <span style={styles.noteDetailLabel}>Edited By</span>
                  <strong style={styles.noteDetailValue}>
                    {formatConsumptionSubmitter(kitEditedBy)}
                  </strong>
                </div>
              )}
              {kitEditedAt && (
                <div style={styles.noteDetailItem}>
                  <span style={styles.noteDetailLabel}>Edited When</span>
                  <strong style={styles.noteDetailValue}>
                    {formatDateTime(kitEditedAt)}
                  </strong>
                </div>
              )}
            </div>

            {!kitAlreadySubmitted && !kitLoading && (
              <div style={styles.serviceKitToolbar}>
                <p style={styles.kitNoteText}>
                  {kitNotes ? `Kit note: ${kitNotes}` : 'Kit note: No kit note added.'}
                </p>
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
                      <th style={{ ...styles.tableHead, textAlign: 'left', padding: '10px 12px' }}>Current Stock</th>
                      <th style={{ ...styles.tableHead, textAlign: 'left', padding: '10px 12px' }}>
                        {kitAlreadySubmitted && !kitEditMode ? 'Used' : 'Qty'}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {kitItems.map((item, index) => (
                      <tr key={`${item.inventory_id}-${index}`} style={styles.tableRow}>
                        <td style={{ ...styles.tableCell, padding: '10px 12px' }}>
                          {item.item_name}

                          {!item.inventory_id && (!kitAlreadySubmitted || kitEditMode) && (
                            <span style={{ color: '#ef4444', fontSize: '11px', display: 'block' }}>
                              Not linked to branch inventory
                            </span>
                          )}
                        </td>

                        <td style={{ ...styles.tableCell, padding: '10px 12px', textTransform: 'capitalize' }}>
                          {item.category}
                        </td>

                        <td style={{ ...styles.tableCell, padding: '10px 12px', color: '#374151' }}>
                          {item.current_stock !== null && item.current_stock !== undefined
                            ? item.current_stock
                            : <span style={{ color: '#94a3b8' }}>—</span>}
                        </td>

                        <td style={{ ...styles.tableCell, padding: '10px 12px' }}>
                          {kitAlreadySubmitted && !kitEditMode ? (
                            item.quantity_used
                          ) : (() => {
                            const exceedsStock =
                              item.inventory_id &&
                              item.current_stock !== null &&
                              item.current_stock !== undefined &&
                              Number(item.quantity_used) > Number(item.current_stock);
                            return (
                              <>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.quantity_used}
                                  onChange={(e) => handleKitQtyChange(index, e.target.value)}
                                  disabled={!item.inventory_id}
                                  style={{
                                    width: '60px',
                                    padding: '4px 8px',
                                    border: `1px solid ${exceedsStock ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    background: !item.inventory_id ? '#f1f5f9' : '#ffffff',
                                    cursor: !item.inventory_id ? 'not-allowed' : 'text',
                                  }}
                                />
                                {exceedsStock && (
                                  <span style={{ display: 'block', color: '#b91c1c', fontSize: 11, marginTop: 2 }}>
                                    Exceeds stock
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!kitLoading && !kitError && kitItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, gap: 10 }}>
                {(!kitAlreadySubmitted || kitEditMode) && (
                  <button
                    type="button"
                    style={styles.modalSecondaryBtn}
                    onClick={requestCloseKitModal}
                    disabled={kitSubmitting}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  style={{
                    ...styles.modalPrimaryBtn,
                    ...((!kitAlreadySubmitted || kitEditMode) && (kitSubmitting || !hasDeductibleKitItems || kitHasStockError) ? styles.pageBtnDisabled : {}),
                  }}
                  onClick={() => {
                    if (kitAlreadySubmitted && !kitEditMode) {
                      setShowKitEditConfirmModal(true);
                      return;
                    }
                    if (!kitAlreadySubmitted) {
                      setShowKitSubmitConfirmModal(true);
                      return;
                    }
                    if (kitEditMode) {
                      setShowKitUpdateConfirmModal(true);
                      return;
                    }
                    handleKitConfirm();
                  }}
                  disabled={(!kitAlreadySubmitted || kitEditMode) && (kitSubmitting || !hasDeductibleKitItems || kitHasStockError)}
                >
                  {kitAlreadySubmitted && !kitEditMode
                    ? 'Edit'
                    : (kitAlreadySubmitted && kitEditMode
                      ? (kitSubmitting ? 'Saving...' : 'Save Changes')
                    : (!hasDeductibleKitItems
                      ? 'No Deductible Items'
                      : (kitSubmitting ? 'Submitting...' : 'Submit Service Kit')))}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showKitCancelConfirmModal && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeKitCancelConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Service Kit</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved service kit details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeKitCancelConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelKitModal}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showKitCloseConfirmModal && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeKitCloseConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Close Service Kit</h2>
            <p style={styles.modalText}>Do you want to close this service kit?</p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeKitCloseConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCloseKitModal}
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showKitEditConfirmModal && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeKitEditConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-edit" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Edit Service Kit</h2>
            <p style={styles.modalText}>
              Do you want to edit the service kit submitted by {formatConsumptionSubmitter(kitSubmittedBy)}?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeKitEditConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.modalPrimaryBtn }}
                onClick={confirmEditKitModal}
              >
                Yes, Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {showKitUpdateConfirmModal && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeKitUpdateConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-edit" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Service Kit Changes</h2>
            <p style={styles.modalText}>Please review the changes before saving this service kit.</p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {buildServiceKitChangeRows(originalKitItems, kitItems).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3d675', fontSize: 13, gap: 12 }}>
                  <span style={{ color: '#000000', fontWeight: 400 }}>{label}</span>
                  <span style={{ color: '#000000', fontWeight: 400, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeKitUpdateConfirmModal}
                disabled={kitSubmitting}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.modalPrimaryBtn }}
                onClick={confirmUpdateKitModal}
                disabled={kitSubmitting}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showKitSubmitConfirmModal && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeKitSubmitConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Submit Service Kit</h2>
            <p style={styles.modalText}>
              Do you want to submit the service kit for this appointment?
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 18 }}>
              {buildServiceKitSubmissionRows(kitItems).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3d675', fontSize: 13, gap: 12 }}>
                  <span style={{ color: '#000000', fontWeight: 400 }}>{label}</span>
                  <span style={{ color: '#000000', fontWeight: 400, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeKitSubmitConfirmModal}
                disabled={kitSubmitting}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.modalPrimaryBtn }}
                onClick={confirmSubmitKitModal}
                disabled={kitSubmitting}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {kitSuccessModal.show && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Service Kit Saved</h2>
            <p style={{ ...styles.modalText, marginBottom: 0 }}>{kitSuccessModal.message}</p>
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
                onClick={requestCloseNoteModal}
              >
                Ã—
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
                onClick={requestCloseNoteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.noteActionButton, ...styles.noteSaveBtn }}
                onClick={requestSaveNoteModal}
                disabled={noteSaving}
              >
                {noteSaving ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteCancelConfirmModal && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeNoteCancelConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Note</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved note details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeNoteCancelConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelNoteModal}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteSaveConfirmModal && selectedNoteAppointment && (
        <div style={styles.modal} onClick={(event) => {
          if (event.target === event.currentTarget) closeNoteSaveConfirmModal();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Save Note</h2>
            <p style={styles.modalText}>Please review the details before saving this note.</p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 18 }}>
              {buildNoteSaveRows(selectedNoteAppointment, noteText).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3d675', fontSize: 13, gap: 12 }}>
                  <span style={{ color: '#000000', fontWeight: 400 }}>{label}</span>
                  <span style={{ color: '#000000', fontWeight: 400, textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeNoteSaveConfirmModal}
                disabled={noteSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.modalPrimaryBtn }}
                onClick={confirmSaveNoteModal}
                disabled={noteSaving}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {noteSuccessModal.show && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Note Saved</h2>
            <p style={{ ...styles.modalText, marginBottom: 0 }}>{noteSuccessModal.message}</p>
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
      startTime: item.start_time || '',
      statusChangedAt: item.status_changed_at || item.statusChangedAt || '',
      createdAt: item.created_at || item.createdAt || '',
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
    arrived: 'Arrived',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    noshow: 'No Show',
  };

  return statusMap[status] || statusMap[normalizeAppointmentStatus(status)] || 'Scheduled';
}

function normalizeAppointmentStatus(status) {
  return String(status || '').toLowerCase().replace(/[\s_]+/g, '');
}

function formatConsumptionSubmitter(submitter) {
  if (!submitter) return 'Staff';
  const role = String(submitter.role || '').toLowerCase();
  const roleLabel =
    role === 'dentist' ? 'Dentist' : role === 'receptionist' ? 'Receptionist' : 'Staff';
  return submitter.name ? `${submitter.name} (${roleLabel})` : roleLabel;
}

function getServiceKitAppointmentLabel(appointment) {
  const service = appointment?.reason || appointment?.treatment || 'appointment';
  const patient = appointment?.patientName || appointment?.name || 'patient';
  return `${service} - ${patient}`;
}

function buildServiceKitChangeRows(originalItems, currentItems) {
  const originalByKey = new Map(
    (originalItems || []).map((item) => [
      getServiceKitItemKey(item),
      Number(item.quantity_used || 0),
    ])
  );

  const changes = (currentItems || [])
    .filter((item) => item.inventory_id)
    .map((item) => {
      const originalQty = originalByKey.get(getServiceKitItemKey(item)) ?? 0;
      const nextQty = Number(item.quantity_used || 0);
      return [item.item_name || 'Inventory Item', String(nextQty), originalQty];
    })
    .filter(([, value, originalQty]) => {
      const nextQty = Number(value);
      return originalQty !== nextQty;
    })
    .map(([label, value]) => [label, value]);

  return changes.length > 0 ? changes : [['Changes', 'No quantity changes detected']];
}

function buildServiceKitSubmissionRows(items) {
  const rows = (items || [])
    .filter((item) => item.inventory_id && Number(item.quantity_used || 0) > 0)
    .map((item) => [item.item_name || 'Inventory Item', String(Number(item.quantity_used || 0))]);

  return rows.length > 0 ? rows : [['Items', 'No deductible items']];
}

function buildNoteSaveRows(appointment, noteText) {
  return [
    ['Patient', appointment?.patientName || 'Patient'],
    ['Service', appointment?.reason || appointment?.treatment || 'Appointment'],
    ['Time', appointment?.time || '-'],
    ['Note', String(noteText || '').trim() || 'No note added'],
  ];
}

function getAppointmentSortTime(appointment) {
  const value =
    appointment?.statusChangedAt ||
    appointment?.updatedAt ||
    appointment?.createdAt ||
    appointment?.startTime;
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function getServiceKitItemKey(item) {
  return String(item?.inventory_id || item?.item_id || item?.item_name || '');
}

function formatDateTime(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
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

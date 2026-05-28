import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import {
  cancelAppointment as cancelAppointmentRequest,
  getAppointmentMeta,
  getDentistBusySlots,
  listAppointments,
  createAppointment,
  setAppointmentStatus,
} from '../api/appointments';
import { createStaffPayment } from '../api/payments';
import { getConsumption, getServiceKit, submitConsumption, updateConsumption } from '../api/inventory';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepAppointmentsStyles from '../styles/RecepAppointments';
import createRecepAppointmentFormStyles from '../styles/RecepAppointmentForm';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

const pendingPerPage = 4;
const queuePerPage = 3;

const scheduleMonths = [
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

const paymentMethodLabels = {
  cash: 'Cash',
  ewallet: 'E-Wallet',
  bank_transfer: 'Bank',
};

const ewalletProviders = ['GCash', 'Maya'];
const bankProviders = ['Metrobank', 'BDO', 'BPI', 'GoTyme', 'UnionBank', 'RCBC'];

export default function RecepAppointments() {
  const { user } = useAuth();
  const recepBranchId =
    Number(user?.home_branch_id || user?.branches?.[0] || 0) || undefined;
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
    provider: '',
    amount: '',
    saving: false,
  });
  const [cancelReasonModal, setCancelReasonModal] = useState({ show: false, appointmentId: null });
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState({
    show: false,
    appointment: null,
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
    selectedDate: '',
    selectedTime: '',
    availableSlots: [],
    loadingSlots: false,
    dentistOnLeave: false,
    dentistLeaveInfo: null,
    saving: false,
  });
  const [rescheduleReasonText, setRescheduleReasonText] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [showKitModal, setShowKitModal] = useState(false);
  const [selectedKitAppointment, setSelectedKitAppointment] = useState(null);
  const [kitItems, setKitItems] = useState([]);
  const [kitNotes, setKitNotes] = useState('');
  const [kitLoading, setKitLoading] = useState(false);
  const [kitError, setKitError] = useState('');
  const [kitAlreadySubmitted, setKitAlreadySubmitted] = useState(false);
  const [kitSubmittedBy, setKitSubmittedBy] = useState(null);
  const [kitEditedBy, setKitEditedBy] = useState(null);
  const [kitEditedAt, setKitEditedAt] = useState('');
  const [kitEditMode, setKitEditMode] = useState(false);
  const [kitSubmitting, setKitSubmitting] = useState(false);
  const [calendarDetailsOpenById, setCalendarDetailsOpenById] = useState({});
  const [kitSubmittedByAppointmentId, setKitSubmittedByAppointmentId] = useState({});
  const [kitTemplateHasItemsByAppointmentId, setKitTemplateHasItemsByAppointmentId] = useState({});

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

  const scheduleStyles = createRecepAppointmentFormStyles({
    isMobile: screenWidth <= 900,
    isVerySmall,
  });

  const scheduleYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear + index);
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
    if (showLogoutModal || showKitModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showKitModal]);

  useEffect(() => {
    if (rescheduleModal.show) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [rescheduleModal.show]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeRescheduleModal();
        closeKitModal();
        setOpenDropdownId(null);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    fetchUpcomingAppointments();
    fetchAppointmentMeta();
  }, []);

  useEffect(() => {
    fetchCalendarAppointments(currentDate);
  }, [currentDate, recepBranchId]);

  useEffect(() => {
    if (!rescheduleModal.show || !rescheduleModal.appointment || !rescheduleModal.selectedDate) {
      return undefined;
    }

    let cancelled = false;

    async function loadRescheduleSlots() {
      setRescheduleModal((current) => ({
        ...current,
        loadingSlots: true,
        availableSlots: [],
        dentistOnLeave: false,
        dentistLeaveInfo: null,
      }));

      try {
        const durationMinutes = getServiceDurationMinutes(
          treatmentOptions,
          rescheduleModal.appointment.serviceId
        );
        const bufferMinutes = getServiceBufferMinutes(
          treatmentOptions,
          rescheduleModal.appointment.serviceId
        );
        const bounds = dayBoundsUTC(rescheduleModal.selectedDate);

        const [dayAppointmentsRaw, dentistBusyMeta] = await Promise.all([
          listAppointments({
            from: bounds.fromUTC,
            to: bounds.toUTC,
            ...(rescheduleModal.appointment.branchId
              ? { branch_id: Number(rescheduleModal.appointment.branchId) }
              : {}),
          }),
          rescheduleModal.appointment.dentistId
            ? getDentistBusySlots(rescheduleModal.appointment.dentistId, rescheduleModal.selectedDate)
            : Promise.resolve({ appointments: [], on_leave: false, leave: null }),
        ]);

        if (cancelled) return;

        const combined = [
          ...(Array.isArray(dentistBusyMeta?.appointments) ? dentistBusyMeta.appointments : []),
          ...(Array.isArray(dayAppointmentsRaw) ? dayAppointmentsRaw : []),
        ].filter((a) => String(a?.id) !== String(rescheduleModal.appointment.id));

        const slots = computeAvailableSlotsForSchedule({
          appointments: combined,
          dateKey: rescheduleModal.selectedDate,
          durationMinutes,
          bufferMinutes,
        });

        setRescheduleModal((current) => ({
          ...current,
          availableSlots: slots,
          dentistOnLeave: !!dentistBusyMeta?.on_leave,
          dentistLeaveInfo: dentistBusyMeta?.leave || null,
          loadingSlots: false,
          selectedTime: slots.some((s) => s.value === current.selectedTime) ? current.selectedTime : '',
        }));
      } catch {
        if (cancelled) return;
        setRescheduleModal((current) => ({
          ...current,
          availableSlots: [],
          dentistOnLeave: false,
          dentistLeaveInfo: null,
          loadingSlots: false,
        }));
      }
    }

    loadRescheduleSlots();

    return () => {
      cancelled = true;
    };
  }, [rescheduleModal.show, rescheduleModal.appointment, rescheduleModal.selectedDate, treatmentOptions]);


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
  const safePendingPage = fixPage(pendingPage, pendingTotalPages);
  const safeQueuePage = fixPage(queuePage, queueTotalPages);

  const receptionistName = user?.name || user?.email || 'Receptionist';

  const pagedPending = useMemo(() => {
    const start = safePendingPage > 0 ? (safePendingPage - 1) * pendingPerPage : 0;

    return filteredPending.slice(start, start + pendingPerPage);
  }, [filteredPending, safePendingPage]);

  const pagedQueue = useMemo(() => {
    const start = safeQueuePage > 0 ? (safeQueuePage - 1) * queuePerPage : 0;

    return filteredQueue.slice(start, start + queuePerPage);
  }, [filteredQueue, safeQueuePage]);

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

  useEffect(() => {
    let cancelled = false;

    async function loadKitSubmissionStates() {
      const completed = selectedDateSchedules.filter(
        (appointment) => String(appointment.status).toLowerCase() === 'completed'
      );
      if (completed.length === 0) return;

      const results = await Promise.all(
        completed.map(async (appointment) => {
          const isConsultation = /consultation/i.test(String(appointment.treatment || ''));
          if (isConsultation) {
            return { id: appointment.id, submitted: false, hasTemplateItems: false };
          }

          try {
            const [consumptionData, kitData] = await Promise.all([
              getConsumption(appointment.id),
              appointment.serviceId && recepBranchId
                ? getServiceKit(appointment.serviceId, recepBranchId).catch(() => ({
                    kit_exists: false,
                    items: [],
                  }))
                : Promise.resolve({ kit_exists: false, items: [] }),
            ]);

            const hasTemplateItems =
              Boolean(kitData?.kit_exists) &&
              Array.isArray(kitData?.items) &&
              kitData.items.some((item) => Number(item?.default_quantity || 0) > 0 && item?.inventory_id);

            return {
              id: appointment.id,
              submitted: Boolean(consumptionData?.submitted),
              hasTemplateItems,
            };
          } catch {
            return { id: appointment.id, submitted: null, hasTemplateItems: false };
          }
        })
      );

      if (cancelled) return;

      setKitSubmittedByAppointmentId((current) => {
        const next = { ...current };
        results.forEach((item) => {
          next[item.id] = item.submitted;
        });
        return next;
      });
      setKitTemplateHasItemsByAppointmentId((current) => {
        const next = { ...current };
        results.forEach((item) => {
          next[item.id] = item.hasTemplateItems;
        });
        return next;
      });
    }

    loadKitSubmissionStates();

    return () => {
      cancelled = true;
    };
  }, [selectedDateSchedules]);
  const rescheduleEstimatedDuration = useMemo(() => {
    if (!rescheduleModal.appointment?.serviceId) {
      return 30;
    }

    return getServiceDurationMinutes(treatmentOptions, rescheduleModal.appointment.serviceId);
  }, [treatmentOptions, rescheduleModal.appointment?.serviceId]);
  const rescheduleEstimatedTimeRange = useMemo(() => {
    if (!rescheduleModal.selectedTime) {
      return '-';
    }

    return getEstimatedTimeRange(
      formatTimePickerValue(rescheduleModal.selectedTime),
      rescheduleEstimatedDuration
    );
  }, [rescheduleModal.selectedTime, rescheduleEstimatedDuration]);

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

  function openRescheduleModal(appointment) {
    if (!appointment) return;

    const appointmentDate = appointment.fullDate
      ? new Date(`${appointment.fullDate}T00:00:00`)
      : new Date();

    setRescheduleReasonText('');
    setOpenDropdownId(null);
    setRescheduleModal({
      show: true,
      appointment,
      calendarMonth: appointmentDate.getMonth(),
      calendarYear: appointmentDate.getFullYear(),
      selectedDate: appointment.fullDate || toDateKey(new Date()),
      selectedTime: '',
      availableSlots: [],
      loadingSlots: true,
      dentistOnLeave: false,
      dentistLeaveInfo: null,
      saving: false,
    });
  }

  function closeRescheduleModal() {
    setRescheduleModal({
      show: false,
      appointment: null,
      calendarMonth: new Date().getMonth(),
      calendarYear: new Date().getFullYear(),
      selectedDate: '',
      selectedTime: '',
      availableSlots: [],
      loadingSlots: false,
      dentistOnLeave: false,
      dentistLeaveInfo: null,
      saving: false,
    });
    setRescheduleReasonText('');
  }

  async function openCalendarServiceKitModal(appointment) {
    if (!appointment || String(appointment.status).toLowerCase() !== 'completed') return;
    const isConsultation = /consultation/i.test(String(appointment.treatment || ''));

    setSelectedKitAppointment(appointment);
    setKitItems([]);
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
        appointment.serviceId && recepBranchId
          ? getServiceKit(appointment.serviceId, recepBranchId).catch(() => ({
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
        setKitItems(
          (consumptionData.items || []).map((item) => {
            const invId = item.item_id || item.inventory_id || null;
            return {
              category: item.category,
              item_name: item.item_name,
              inventory_id: invId,
              quantity_used: item.quantity_used,
              current_stock: invId != null ? kitStockMap[invId] : undefined,
            };
          })
        );
      } else {
        setKitNotes(kitData.notes || '');
        setKitItems(
          (kitData.items || []).map((item) => ({
            category: item.category,
            item_name: item.item_name,
            inventory_id: item.inventory_id || null,
            quantity_used: item.default_quantity,
            current_stock: item.current_stock,
            unit: item.unit,
            available: item.available,
            sufficient: item.sufficient,
          }))
        );
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
    setKitNotes('');
    setKitError('');
    setKitAlreadySubmitted(false);
    setKitSubmittedBy(null);
    setKitEditedBy(null);
    setKitEditedAt('');
    setKitEditMode(false);
    setKitSubmitting(false);
  }

  function toggleCalendarDetails(appointmentId) {
    setCalendarDetailsOpenById((current) => ({
      ...current,
      [appointmentId]: !current[appointmentId],
    }));
  }

  async function handleConfirmKitDeduction() {
    if (!selectedKitAppointment || kitSubmitting) return;
    const isEditingSubmitted = kitAlreadySubmitted && kitEditMode;

    const itemsToSubmit = kitItems
      .filter((item) => Number(item.quantity_used) > 0 && item.inventory_id)
      .map((item) => ({
        category: item.category,
        inventory_id: item.inventory_id,
        quantity_used: Number(item.quantity_used),
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
      setKitAlreadySubmitted(true);
      setKitEditMode(false);
      setKitSubmittedBy({
        name: user?.name || 'Receptionist',
        role: user?.role || 'receptionist',
      });
      if (isEditingSubmitted) {
        setKitEditedBy({
          name: user?.name || 'Receptionist',
          role: user?.role || 'receptionist',
        });
        setKitEditedAt(new Date().toISOString());
      }
    } catch (err) {
      setKitError(err.response?.data?.message || 'Failed to deduct inventory.');
    } finally {
      setKitSubmitting(false);
    }
  }

  function handleKitQtyChange(index, value) {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setKitItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity_used: qty } : item))
    );
  }

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

  function handleReschedulePreviousMonth() {
    setRescheduleModal((current) => {
      const dateValue = new Date(current.calendarYear, current.calendarMonth, 1);
      const previous = new Date(dateValue.getFullYear(), dateValue.getMonth() - 1, 1);
      return { ...current, calendarMonth: previous.getMonth(), calendarYear: previous.getFullYear() };
    });
  }

  function handleRescheduleNextMonth() {
    setRescheduleModal((current) => {
      const dateValue = new Date(current.calendarYear, current.calendarMonth, 1);
      const next = new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 1);
      return { ...current, calendarMonth: next.getMonth(), calendarYear: next.getFullYear() };
    });
  }

  function handleSelectRescheduleSlot(slot) {
    setRescheduleModal((current) => ({ ...current, selectedTime: slot?.value || '' }));
  }

  async function handleConfirmReschedule() {
    if (!rescheduleModal.appointment) return;

    if (!rescheduleModal.selectedDate || !rescheduleModal.selectedTime) {
      setAppointmentsError('Please select a new date and time.');
      return;
    }

    if (!rescheduleModal.appointment.patientId || !rescheduleModal.appointment.branchId) {
      setAppointmentsError('Unable to reschedule: missing patient or branch details.');
      return;
    }

    setAppointmentsError('');
    setRescheduleModal((current) => ({ ...current, saving: true }));

    try {
      const durationMinutes = getServiceDurationMinutes(
        treatmentOptions,
        rescheduleModal.appointment.serviceId
      );

      const newNote = buildRescheduleNote({
        existing: rescheduleModal.appointment.note || rescheduleModal.appointment.notes || '',
        reason: rescheduleReasonText,
        originalDate: rescheduleModal.appointment.fullDate,
        originalTime: rescheduleModal.appointment.time,
        newDate: rescheduleModal.selectedDate,
        newTime: formatTimePickerValue(rescheduleModal.selectedTime),
        durationMinutes,
      });

      await createAppointment({
        branch_id: Number(rescheduleModal.appointment.branchId),
        patient_id: Number(rescheduleModal.appointment.patientId),
        dentist_id: Number(rescheduleModal.appointment.dentistId),
        service_id: Number(rescheduleModal.appointment.serviceId),
        reschedule_appointment_id: Number(rescheduleModal.appointment.id),
        start_time: buildAppointmentStartISO(
          rescheduleModal.selectedDate,
          formatTimePickerValue(rescheduleModal.selectedTime)
        ),
        note: newNote,
      });

      closeRescheduleModal();
      await fetchUpcomingAppointments();
      await fetchCalendarAppointments(currentDate);
    } catch (err) {
      if (err.response?.status === 409) {
        setAppointmentsError(
          'This time slot conflicts with an existing appointment. Please choose another time.'
        );
      } else {
        setAppointmentsError(
          err.response?.data?.message || 'Failed to reschedule appointment.'
        );
      }
      setRescheduleModal((current) => ({ ...current, saving: false }));
    }
  }

  async function fetchUpcomingAppointments() {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const data = await listAppointments(
        recepBranchId ? { branch_id: recepBranchId } : {}
      );
      const normalized = normalizeAppointments(data);

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
        ...(recepBranchId ? { branch_id: recepBranchId } : {}),
      });

      setCalendarAppointments(normalizeAppointments(data));
    } catch {
      setCalendarAppointments([]);
    }
  }

  async function fetchAppointmentMeta() {
    try {
      const meta = await getAppointmentMeta();
      setDentistOptions(Array.isArray(meta.dentists) ? meta.dentists : []);
      setTreatmentOptions(Array.isArray(meta.services) ? meta.services : []);
    } catch {
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
      provider: '',
      amount: String(Number(appointment.servicePrice || 0).toFixed(0)),
      saving: false,
    });
  }

  function closePaymentModal() {
    setPaymentModal({
      show: false,
      appointment: null,
      method: 'cash',
      provider: '',
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
        ewallet_provider: paymentModal.provider?.trim() || null,
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

          <Link to="/receptionistInquiries" style={styles.menuItem}>
            <i className="fi fi-rr-inbox-in" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Online Inquiries</span>
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
                        selectedDateSchedules.map((appointment) => {
                          const calendarStatus = getAppointmentCalendarStatus(appointment);
                          const showDetails = Boolean(calendarDetailsOpenById[appointment.id]);
                          const isServiceKitSubmitted =
                            calendarStatus === 'Done' &&
                            kitSubmittedByAppointmentId[appointment.id] === true;
                          const isServiceKitPending =
                            calendarStatus === 'Done' &&
                            kitTemplateHasItemsByAppointmentId[appointment.id] === true &&
                            kitSubmittedByAppointmentId[appointment.id] === false;

                          return (
                          <div
                            key={appointment.id}
                            style={{ ...styles.scheduleItem, position: 'relative', paddingBottom: 56 }}
                          >
                            <div style={styles.scheduleItemTop}>
                              <div style={styles.scheduleTime}>
                                {appointment.fullDate} | {appointment.time}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  style={{
                                    ...styles.scheduleStatusBadge,
                                    ...getAppointmentStatusStyle(styles, appointment),
                                  }}
                                >
                                  {calendarStatus}
                                </span>
                                {isServiceKitPending && (
                                  <span
                                    style={{
                                      ...styles.scheduleStatusBadge,
                                      background: '#fff7ed',
                                      color: '#c2410c',
                                      border: '1px solid #fdba74',
                                    }}
                                  >
                                    Pending service_kit
                                  </span>
                                )}
                                {isServiceKitSubmitted && (
                                  <span
                                    style={{
                                      ...styles.scheduleStatusBadge,
                                      background: '#dcfce7',
                                      color: '#166534',
                                      border: '1px solid #86efac',
                                    }}
                                  >
                                    Service_kit submitted
                                  </span>
                                )}
                              </div>
                            </div>

                            {calendarStatus === 'Done' && (
                              <button
                                type="button"
                                style={styles.serviceKitCalendarButton}
                                onClick={() =>
                                  openCalendarServiceKitModal(appointment)
                                }
                              >
                                service_kit
                              </button>
                            )}

                            <div style={styles.scheduleName}>
                              {appointment.name}
                            </div>

                            <div style={styles.scheduleDetail}>
                              {appointment.doctor}
                            </div>

                            <div style={styles.scheduleDetail}>
                              {appointment.treatment}
                            </div>

                            <div style={styles.scheduleDetail}>
                              Estimated Duration: {getEstimatedTimeRange(appointment.time, appointment.durationMinutes)}
                            </div>

                            {showDetails && (
                              <div
                                style={{
                                  ...styles.scheduleDetail,
                                  marginTop: 8,
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                }}
                              >
                                <strong>Original Schedule:</strong> {appointment.originalSchedule || 'Not recorded'}
                                <br />
                                <strong>Rescheduled:</strong> {appointment.rescheduledSchedule || 'Not recorded'}
                                <br />
                                <strong>Payment Type:</strong> {appointment.paymentMethodLabel || 'Not recorded'}
                                <br />
                                <strong>Provider:</strong> {appointment.paymentProvider || 'Not recorded'}
                                <br />
                                <strong>Payment Amount:</strong> {formatPaymentAmount(appointment.paymentAmount)}
                              </div>
                            )}

                            <button
                              type="button"
                              style={{
                                ...styles.serviceKitCalendarButton,
                                position: 'absolute',
                                right: 14,
                                bottom: 14,
                                margin: 0,
                                borderColor: '#cbd5e1',
                                background: '#ffffff',
                                color: '#334155',
                              }}
                              onClick={() => toggleCalendarDetails(appointment.id)}
                            >
                              {showDetails ? 'Hide Details' : 'Details'}
                            </button>
                          </div>
                        );
                        })
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
                        onChange={(event) => {
                          setSearchText(event.target.value);
                          setPendingPage(1);
                          setQueuePage(1);
                        }}
                        style={styles.searchInput}
                      />
                    </div>
                  </div>

                  <div style={styles.rightActions}>
                    <select
                      value={dentistFilter}
                      onChange={(event) => {
                        setDentistFilter(event.target.value);
                        setPendingPage(1);
                        setQueuePage(1);
                      }}
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
                      onChange={(event) => {
                        setTreatmentFilter(event.target.value);
                        setPendingPage(1);
                        setQueuePage(1);
                      }}
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
                          onReschedule={openRescheduleModal}
                          isUpdating={
                            String(updatingId) === String(appointment.id)
                          }
                        />
                      ))
                    )}
                  </div>

                  <Pagination
                    styles={styles}
                    page={safePendingPage}
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
                    page={safeQueuePage}
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
                onChange={(event) => {
                  const method = event.target.value;

                  setPaymentModal((current) => ({
                    ...current,
                    method,
                    provider: method === 'cash' ? '' : current.provider,
                  }));
                }}
                style={styles.select}
              >
                <option value="cash">{paymentMethodLabels.cash}</option>
                <option value="ewallet">{paymentMethodLabels.ewallet}</option>
                <option value="bank_transfer">{paymentMethodLabels.bank_transfer}</option>
              </select>

              {paymentModal.method === 'ewallet' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <input
                    list="payment-provider-ewallet"
                    value={paymentModal.provider}
                    onChange={(event) =>
                      setPaymentModal((current) => ({
                        ...current,
                        provider: event.target.value,
                      }))
                    }
                    placeholder="E-Wallet provider (e.g. GCash)"
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
                  <datalist id="payment-provider-ewallet">
                    {ewalletProviders.map((provider) => (
                      <option key={provider} value={provider} />
                    ))}
                  </datalist>
                </div>
              )}

              {paymentModal.method === 'bank_transfer' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <input
                    list="payment-provider-bank"
                    value={paymentModal.provider}
                    onChange={(event) =>
                      setPaymentModal((current) => ({
                        ...current,
                        provider: event.target.value,
                      }))
                    }
                    placeholder="Bank (e.g. BDO)"
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
                  <datalist id="payment-provider-bank">
                    {bankProviders.map((provider) => (
                      <option key={provider} value={provider} />
                    ))}
                  </datalist>
                </div>
              )}

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

      {rescheduleModal.show && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeRescheduleModal();
          }}
        >
          <div style={styles.modalContentReschedule}>
            <div style={styles.modalHeaderRow}>
              <div>
                <h2 style={styles.modalHeaderTitle}>Reschedule Appointment</h2>
                <p style={styles.modalHeaderSub}>
                  Pick a new date and time for {rescheduleModal.appointment?.name || 'this patient'}.
                </p>
              </div>

              <button type="button" style={styles.modalCloseBtn} onClick={closeRescheduleModal}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>

            {appointmentsError && (
              <div style={styles.alertErrorInline}>
                <i className="fi fi-rr-triangle-warning" style={{ marginRight: 8 }}></i>
                <span>{appointmentsError}</span>
              </div>
            )}

            <div style={{ ...scheduleStyles.formPanel, marginTop: 0 }}>
              <h3 style={scheduleStyles.panelTitle}>Appointment Schedule</h3>

              <div style={scheduleStyles.calendarContainer}>
                <div style={scheduleStyles.calendar}>
                  <div style={scheduleStyles.controls}>
                    <button
                      type="button"
                      style={scheduleStyles.calendarNav}
                      onClick={handleReschedulePreviousMonth}
                    >
                      <i className="fi fi-rr-angle-left"></i>
                    </button>

                    <div style={scheduleStyles.calendarDropdowns}>
                      <select
                        value={rescheduleModal.calendarMonth}
                        onChange={(event) =>
                          setRescheduleModal((current) => ({
                            ...current,
                            calendarMonth: Number(event.target.value),
                          }))
                        }
                        style={scheduleStyles.calendarSelect}
                      >
                        {scheduleMonths.map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rescheduleModal.calendarYear}
                        onChange={(event) =>
                          setRescheduleModal((current) => ({
                            ...current,
                            calendarYear: Number(event.target.value),
                          }))
                        }
                        style={scheduleStyles.calendarSelect}
                      >
                        {scheduleYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      style={scheduleStyles.calendarNav}
                      onClick={handleRescheduleNextMonth}
                    >
                      <i className="fi fi-rr-angle-right"></i>
                    </button>
                  </div>

                  <div style={scheduleStyles.currentMonthLabel}>
                    {`${scheduleMonths[rescheduleModal.calendarMonth]} ${rescheduleModal.calendarYear}`}
                  </div>

                  <table style={scheduleStyles.calendarTable}>
                    <thead>
                      <tr>
                        <th style={scheduleStyles.calendarTh}>Su</th>
                        <th style={scheduleStyles.calendarTh}>Mo</th>
                        <th style={scheduleStyles.calendarTh}>Tu</th>
                        <th style={scheduleStyles.calendarTh}>We</th>
                        <th style={scheduleStyles.calendarTh}>Th</th>
                        <th style={scheduleStyles.calendarTh}>Fr</th>
                        <th style={scheduleStyles.calendarTh}>Sa</th>
                      </tr>
                    </thead>

                    <tbody>
                      {buildScheduleCalendarWeeks(
                        rescheduleModal.calendarYear,
                        rescheduleModal.calendarMonth,
                        new Date()
                      ).map((week, weekIndex) => (
                        <tr key={`week-${weekIndex}`}>
                          {week.map((dayItem, dayIndex) => {
                            const isEmptyCell = !dayItem.dateKey;
                            const isSelected = dayItem.dateKey === rescheduleModal.selectedDate;
                            const isDisabled = dayItem.disabled;

                            return (
                              <td
                                key={`day-${weekIndex}-${dayIndex}`}
                                style={{
                                  ...scheduleStyles.calendarTd,
                                  ...(isEmptyCell ? scheduleStyles.calendarTdEmpty : {}),
                                  ...(isDisabled && !isEmptyCell
                                    ? scheduleStyles.calendarTdDisabled
                                    : {}),
                                  ...(isSelected ? scheduleStyles.calendarTdSelected : {}),
                                }}
                                onClick={() =>
                                  !isEmptyCell &&
                                  !isDisabled &&
                                  setRescheduleModal((current) => ({
                                    ...current,
                                    selectedDate: dayItem.dateKey,
                                    selectedTime: '',
                                  }))
                                }
                              >
                                {dayItem.day || ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={scheduleStyles.calendarDivider}></div>

                <div style={scheduleStyles.timeSection}>
                  <label style={scheduleStyles.label}>
                    Available Time Slots <span style={scheduleStyles.required}>*</span>
                  </label>

                  {rescheduleModal.appointment?.dentistId && rescheduleModal.dentistOnLeave && (
                    <p style={scheduleStyles.slotEmptyText}>
                      This dentist is on approved leave
                      {rescheduleModal.dentistLeaveInfo?.date_from && rescheduleModal.dentistLeaveInfo?.date_to
                        ? ` (${rescheduleModal.dentistLeaveInfo.date_from} to ${rescheduleModal.dentistLeaveInfo.date_to})`
                        : ''}
                      . Please choose another date.
                    </p>
                  )}

                  {rescheduleModal.loadingSlots ? (
                    <p style={scheduleStyles.slotLoadingText}>Loading available slots...</p>
                  ) : rescheduleModal.availableSlots.filter((s) => s.available).length === 0 ? (
                    <p style={scheduleStyles.slotEmptyText}>No available slots on this date.</p>
                  ) : (
                    <div style={scheduleStyles.slotGrid}>
                      {rescheduleModal.availableSlots.map((slot) => {
                        const isSelected = slot.value === rescheduleModal.selectedTime;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            disabled={!slot.available}
                            style={{
                              ...scheduleStyles.slotChip,
                              ...(!slot.available ? scheduleStyles.slotChipBlocked : {}),
                              ...(isSelected && slot.available ? scheduleStyles.slotChipSelected : {}),
                            }}
                            onClick={() => slot.available && handleSelectRescheduleSlot(slot)}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div style={scheduleStyles.infoRows}>
                    <div style={scheduleStyles.infoRow}>
                      <i className="fi fi-rr-clock" style={scheduleStyles.infoIconBlue}></i>
                      <div>
                        <p style={scheduleStyles.infoText}>
                          Estimated Duration: {rescheduleEstimatedTimeRange}
                        </p>
                        <p style={scheduleStyles.infoSubText}>
                          Estimated duration is based on the selected purpose of visit. A
                          30-minute cleaning/preparation buffer is blocked after each
                          appointment.
                        </p>
                      </div>
                    </div>

                    <div style={scheduleStyles.infoRow}>
                      <i className="fi fi-rr-info" style={scheduleStyles.infoIconGray}></i>
                      <div>
                        <p style={scheduleStyles.infoText}>Clinic Hours: 10:00 AM - 7:00 PM</p>
                        <p style={scheduleStyles.infoSubText}>
                          Time slots are limited to clinic operating hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...scheduleStyles.field, marginTop: 18 }}>
                <div style={styles.reasonHeaderRow}>
                  <label style={scheduleStyles.label}>Reschedule Reason</label>
                  <button
                    type="button"
                    style={styles.reasonTemplateBtn}
                    onClick={() => {
                      if (rescheduleReasonText.trim()) return;
                      setRescheduleReasonText('Patient requested to reschedule.');
                    }}
                  >
                    Use template
                  </button>
                </div>

                <textarea
                  value={rescheduleReasonText}
                  onChange={(event) => setRescheduleReasonText(event.target.value)}
                  placeholder="Add a reason for rescheduling (optional)"
                  style={{ ...scheduleStyles.input, ...scheduleStyles.textarea }}
                />
              </div>

              <div style={styles.rescheduleActions}>
                <button
                  type="button"
                  style={styles.modalSecondaryBtn}
                  onClick={closeRescheduleModal}
                  disabled={rescheduleModal.saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.modalPrimaryBtn,
                    ...(rescheduleModal.saving ? styles.pageBtnDisabled : {}),
                  }}
                  onClick={handleConfirmReschedule}
                  disabled={rescheduleModal.saving}
                >
                  {rescheduleModal.saving ? 'Rescheduling...' : 'Reschedule'}
                </button>
              </div>
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

      {showKitModal && selectedKitAppointment && (
        <div style={styles.modal} onClick={closeKitModal}>
          <div
            style={{
              ...styles.modalContentReschedule,
              maxWidth: '680px',
              width: '92vw',
              maxHeight: '80vh',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeaderRow}>
              <div>
                <h2 style={styles.modalHeaderTitle}>Service Kit</h2>
                <p style={styles.modalHeaderSub}>
                  {kitAlreadySubmitted
                    ? `Service kit already submitted by ${formatConsumptionSubmitter(kitSubmittedBy)}.`
                    : 'Service kit template for this appointment.'}
                </p>
              </div>
              <button type="button" style={styles.modalCloseBtn} onClick={closeKitModal}>
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <div style={{ ...styles.scheduleItem, marginBottom: 12 }}>
              <div style={styles.scheduleDetail}><strong>Patient:</strong> {selectedKitAppointment.name}</div>
              <div style={styles.scheduleDetail}><strong>Service:</strong> {selectedKitAppointment.treatment}</div>
              <div style={styles.scheduleDetail}>
                <strong>Schedule:</strong> {selectedKitAppointment.fullDate} | {selectedKitAppointment.time}
              </div>
              {!kitAlreadySubmitted && (
                <div style={styles.scheduleDetail}>
                  <strong>Kit Note:</strong> {kitNotes || 'No kit note added.'}
                </div>
              )}
              {kitAlreadySubmitted && (
                <div style={styles.scheduleDetail}>
                  <strong>Submitted By:</strong> {formatConsumptionSubmitter(kitSubmittedBy)}
                </div>
              )}
              {kitEditedBy && (
                <div style={styles.scheduleDetail}>
                  <strong>Edited By:</strong> {formatConsumptionSubmitter(kitEditedBy)}
                </div>
              )}
              {kitEditedAt && (
                <div style={styles.scheduleDetail}>
                  <strong>Edited When:</strong> {formatDateTime(kitEditedAt)}
                </div>
              )}
            </div>

            {kitLoading ? (
              <p style={styles.scheduleDetail}>Loading kit...</p>
            ) : kitError ? (
              <p style={{ ...styles.scheduleDetail, color: '#b91c1c' }}>{kitError}</p>
            ) : kitItems.length === 0 ? (
              <p style={styles.scheduleDetail}>
                {/consultation/i.test(String(selectedKitAppointment?.treatment || ''))
                  ? 'No inventory items was used for consultation service.'
                  : 'No items defined for this service kit.'}
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Item</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Current Stock</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
                        {kitAlreadySubmitted && !kitEditMode ? 'Used' : 'Qty'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kitItems.map((item, index) => (
                      <tr key={`${item.item_name}-${index}`}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                          {item.item_name}
                          {!item.inventory_id && (!kitAlreadySubmitted || kitEditMode) && (
                            <span style={{ color: '#b91c1c', fontSize: 11, display: 'block' }}>
                              Not linked to branch inventory
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>{item.category || '-'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#374151' }}>
                          {item.current_stock !== null && item.current_stock !== undefined
                            ? item.current_stock
                            : <span style={{ color: '#94a3b8' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                          {kitAlreadySubmitted && !kitEditMode ? (
                            item.quantity_used || 0
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
                                  value={item.quantity_used || 0}
                                  onChange={(event) => handleKitQtyChange(index, event.target.value)}
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
                <button
                  type="button"
                  style={styles.modalSecondaryBtn}
                  onClick={closeKitModal}
                  disabled={kitSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.modalPrimaryBtn,
                    ...((kitSubmitting || !hasDeductibleKitItems || kitHasStockError) ? styles.pageBtnDisabled : {}),
                  }}
                  onClick={() => {
                    if (kitAlreadySubmitted && !kitEditMode) {
                      setKitEditMode(true);
                      return;
                    }
                    handleConfirmKitDeduction();
                  }}
                  disabled={kitSubmitting || !hasDeductibleKitItems || kitHasStockError}
                >
                  {kitAlreadySubmitted && !kitEditMode
                    ? 'Edit'
                    : (kitAlreadySubmitted && kitEditMode
                      ? (kitSubmitting ? 'Saving...' : 'Save Changes')
                    : (!hasDeductibleKitItems
                      ? 'No Deductible Items'
                      : (kitSubmitting ? 'Deducting...' : 'Confirm & Deduct')))}
                </button>
              </div>
            )}
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
  onReschedule,
  isUpdating,
}) {
  const isOpen = String(openDropdownId) === String(appointment.id);
  const todayDateKey = toDateKey(new Date());
  const scheduleDateKey = appointment.sourceDateKey || appointment.fullDate;
  const canMarkArrivedToday = scheduleDateKey === todayDateKey;

  return (
    <div style={{
      ...styles.appointment,
      ...styles.pendingStyle,
    }}>
      <div style={styles.appointmentInfo}>
        <div style={styles.dateBox}>
          <div style={styles.week}>{appointment.date}</div>
          <div style={styles.day}>{appointment.day}</div>
        </div>

        <div style={styles.infoContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={styles.appointmentType}>{appointment.type}</span>
          </div>

          <strong style={styles.patientName}>{appointment.name}</strong>

          {(appointment.originalSchedule || appointment.rescheduledSchedule) && (
            <div style={{ marginBottom: 10, fontSize: 12, color: '#475569', lineHeight: 1.35 }}>
              <div>
                <strong>Original Schedule:</strong> {appointment.originalSchedule || 'Not recorded'}
              </div>
              <div>
                <strong>Rescheduled:</strong> {appointment.rescheduledSchedule}
              </div>
            </div>
          )}

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
                disabled={!canMarkArrivedToday}
                style={{
                  ...styles.editDropdownItem,
                  ...(!canMarkArrivedToday ? styles.pageBtnDisabled : {}),
                }}
                onClick={() => handlePendingAction('arrived', appointment.id)}
              >
                <i className="fi fi-rr-check"></i>
                Mark Arrived
              </button>

              <button
                type="button"
                style={styles.editDropdownItem}
                onClick={() => onReschedule && onReschedule(appointment)}
              >
                <i className="fi fi-rr-calendar-pen"></i>
                Reschedule
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

    const unifiedNote =
      item.dentist_note ||
      item.dentistNote ||
      item.note ||
      item.notes ||
      '';
    const scheduleMeta = extractRescheduleScheduleMeta(unifiedNote);
    const hasRescheduleText = /reschedul/i.test(unifiedNote);
    const isRescheduledPending =
      String(item.status || '').toLowerCase() === 'scheduled' &&
      (Boolean(scheduleMeta.rescheduledSchedule) || hasRescheduleText);

    const normalizedBranchId =
      Number(
        item.branch_id ||
        item.branchId ||
        item.branch?.id ||
        item.branch?.branch_id ||
        0
      ) || null;

    return {
      id: item.id || item.appointmentId || index + 1,
      patientId: item.patient_id || item.patientId || item.patient?.id || '',
      branchId: normalizedBranchId,
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
      paymentMethodLabel: paymentMethodLabels[item.payment_method] || 'Not recorded',
      paymentProvider: item.ewallet_provider || item.bank_provider || item.provider || '',
      paymentAmount: Number(item.payment_amount || 0),
      durationMinutes: Number(item.duration_min || 30),
      date: displayDate.week,
      day: displayDate.day,
      time: displayDate.time,
      fullDate: displayDate.fullDate,
      sourceDateKey: extractDateKey(rawDateTime),
      status: item.status || 'scheduled',
      type: isRescheduledPending
        ? 'Rescheduled'
        : (item.type || item.bookingType || formatStatus(item.status || 'scheduled')),
      originalSchedule:
        scheduleMeta.originalSchedule ||
        `${displayDate.fullDate || '-'} ${displayDate.time || '-'}`,
      rescheduledSchedule: scheduleMeta.rescheduledSchedule || '',
      notes: unifiedNote,
      note: unifiedNote,
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

function getServiceDurationMinutes(services, serviceId) {
  const service = (Array.isArray(services) ? services : []).find(
    (s) => String(s.id) === String(serviceId)
  );
  const duration = Number(service?.duration_min || service?.duration || 30);
  return Number.isFinite(duration) && duration > 0 ? duration : 30;
}

function getServiceBufferMinutes(services, serviceId) {
  const service = (Array.isArray(services) ? services : []).find(
    (s) => String(s.id) === String(serviceId)
  );
  const buffer = Number(service?.time_buffer_min ?? appointmentBufferMinutes);
  return Number.isFinite(buffer) && buffer >= 0 ? buffer : appointmentBufferMinutes;
}

function buildScheduleCalendarWeeks(year, month, todayInput) {
  const today = new Date(todayInput || new Date());
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weeks = [];
  let currentWeek = [];

  for (let index = 0; index < startDay; index += 1) {
    currentWeek.push({ day: '', dateKey: '', disabled: true });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    currentWeek.push({
      day,
      dateKey: toDateKey(date),
      disabled: date < today,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push({ day: '', dateKey: '', disabled: true });
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

function dayBoundsUTC(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  const start = new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
  const end = new Date(year, (month || 1) - 1, (day || 1) + 1, 0, 0, 0, 0);

  return { fromUTC: start.toISOString(), toUTC: end.toISOString() };
}

const clinicStartMinutes = 10 * 60;
const clinicEndMinutes = 19 * 60;
const lunchStartMinutes = 12 * 60;
const lunchEndMinutes = 13 * 60 + 30;
const appointmentBufferMinutes = 30;

function computeAvailableSlotsForSchedule({ appointments, dateKey, durationMinutes, bufferMinutes = appointmentBufferMinutes }) {
  const now = Date.now();
  const [year, month, day] = String(dateKey || '').split('-').map(Number);

  const busyIntervals = (Array.isArray(appointments) ? appointments : [])
    .filter((a) => ['scheduled', 'arrived'].includes(String(a?.status || '').toLowerCase()))
    .map((a) => {
      const start = new Date(a.start_time).getTime();
      const end = start + (Number(a.duration_min || 30) + Number(a.service_buffer_min ?? appointmentBufferMinutes)) * 60 * 1000;
      return { start, end };
    })
    .filter((interval) => Number.isFinite(interval.start) && Number.isFinite(interval.end));

  const slots = [];

  for (let minutes = clinicStartMinutes; minutes < clinicEndMinutes; minutes += 30) {
    if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) continue;

    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const slotDate = new Date(year, (month || 1) - 1, day || 1, hour24, minute, 0, 0);
    const slotStart = slotDate.getTime();
    const slotEnd = slotStart + (durationMinutes + bufferMinutes) * 60 * 1000;

    const isPast = slotStart <= now;
    const isBlocked = !isPast && busyIntervals.some((b) => slotStart < b.end && slotEnd > b.start);

    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';

    slots.push({
      label: `${hour12}:${String(minute).padStart(2, '0')} ${period}`,
      value: `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      hour: String(hour24 > 12 ? hour24 - 12 : hour24),
      minute: String(minute).padStart(2, '0'),
      available: !isPast && !isBlocked,
    });
  }

  return slots;
}

function formatTimePickerValue(value) {
  const [hourPart = '10', minutePart = '00'] = String(value || '10:00').split(':');
  const hour24 = Number(hourPart);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 >= 12 ? 'PM' : 'AM';

  return `${hour12}:${minutePart} ${period}`;
}

function parseTimeToMinutes(timeString) {
  const [time, period] = String(timeString || '').split(' ');
  const [hourValue, minuteValue] = String(time || '10:00').split(':').map(Number);

  let hour = hourValue;

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + (Number(minuteValue) || 0);
}

function formatConsumptionSubmitter(submitter) {
  if (!submitter) return 'Staff';
  const role = String(submitter.role || '').toLowerCase();
  const roleLabel =
    role === 'dentist' ? 'Dentist' : role === 'receptionist' ? 'Receptionist' : 'Staff';
  return submitter.name ? `${submitter.name} (${roleLabel})` : roleLabel;
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

function formatPaymentAmount(amount) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return 'Not recorded';
  return `PHP ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function extractDateKey(rawDateTime) {
  const value = String(rawDateTime || '').trim();
  const matched = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return matched ? matched[1] : '';
}

function extractRescheduleScheduleMeta(noteText) {
  const note = String(noteText || '');
  if (!note.trim()) {
    return { originalSchedule: '', rescheduledSchedule: '' };
  }

  const originalMatch = note.match(/^\s*Original\s*Schedule\s*:\s*(.+)$/im);
  const rescheduledMatch = note.match(/^\s*Rescheduled\s*:\s*(.+)$/im);
  const legacyMatch = note.match(/^\s*Rescheduled\s+to\s+(.+)$/im);

  return {
    originalSchedule: originalMatch?.[1]?.trim() || '',
    rescheduledSchedule: rescheduledMatch?.[1]?.trim() || legacyMatch?.[1]?.trim() || '',
  };
}

function getEstimatedTimeRange(startTime, durationMinutes) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = startMinutes + Number(durationMinutes || 30);

  return `${formatMinutesToTime(startMinutes)} - ${formatMinutesToTime(endMinutes)}`;
}

function formatMinutesToTime(totalMinutes) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function buildAppointmentStartISO(dateKey, displayTime) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  const minutes = parseTimeToMinutes(displayTime);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const date = new Date(year, (month || 1) - 1, day || 1, hour, minute, 0, 0);

  return date.toISOString();
}

function buildRescheduleNote({
  existing,
  reason,
  originalDate,
  originalTime,
  newDate,
  newTime,
}) {
  const prefix = String(existing || '').trim();
  const cleanReason = String(reason || '').trim();
  const originalLine = `Original Schedule: ${formatScheduleStamp(originalDate, originalTime)}`;
  const rescheduledLine = `Rescheduled: ${formatScheduleStamp(newDate, newTime)}`;
  const reasonLine = cleanReason ? `Reschedule reason: ${cleanReason}` : 'Reschedule reason: (none)';

  if (!prefix) {
    return `${originalLine}\n${rescheduledLine}\n${reasonLine}`;
  }

  return `${prefix}\n\n${originalLine}\n${rescheduledLine}\n${reasonLine}`;
}

function formatScheduleStamp(dateKey, timeValue) {
  const normalizedDate = String(dateKey || '').trim() || '-';
  const normalizedTime = String(timeValue || '').trim() || '-';

  return `${normalizedDate} ${normalizedTime}`;
}

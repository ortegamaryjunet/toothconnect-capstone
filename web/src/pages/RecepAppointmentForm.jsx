import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createAppointment,
  getAppointmentMeta,
  listAppointments,
} from '../api/appointments';
import {
  createStaffPatient,
  searchPatients,
  updatePatientContact,
} from '../api/patients';
import createRecepAppointmentFormStyles from '../styles/RecepAppointmentForm';

const months = [
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

const clinicStartMinutes = 10 * 60;
const clinicEndMinutes = 19 * 60;
const appointmentBufferMinutes = 10;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear + index);

export default function RecepAppointmentForm() {
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientOptions, setShowPatientOptions] = useState(false);
  const [branches, setBranches] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [dayAppointments, setDayAppointments] = useState([]);

  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  const [formData, setFormData] = useState({
    branchId: '',
    patientName: '',
    contactNumber: '',
    email: '',
    dentistId: '',
    serviceId: '',
    note: '',
    hour: '10',
    minute: '00',
  });

  const isMobile = screenWidth <= 900;
  const isVerySmall = screenWidth <= 560;

  const styles = createRecepAppointmentFormStyles({
    isMobile,
    isVerySmall,
  });

  const timePickerValue = toTimePickerValue(formData.hour, formData.minute);
  const selectedTime = formatTimePickerValue(timePickerValue);

  const selectedService = useMemo(() => {
    return services.find((service) => String(service.id) === String(formData.serviceId));
  }, [services, formData.serviceId]);

  const estimatedDuration = Number(selectedService?.duration_min || 30);

  const estimatedTimeRange = useMemo(() => {
    return getEstimatedTimeRange(selectedTime, estimatedDuration);
  }, [selectedTime, estimatedDuration]);

  const isTimeWithinClinicHours = useMemo(() => {
    const selectedMinutes = getSelectedMinutes(formData.hour, formData.minute);
    return (
      selectedMinutes >= clinicStartMinutes &&
      selectedMinutes + estimatedDuration <= clinicEndMinutes
    );
  }, [formData.hour, formData.minute, estimatedDuration]);

  const timeConflict = useMemo(() => {
    if (!formData.serviceId) {
      return null;
    }

    return findTimeConflict({
      appointments: dayAppointments,
      dateKey: selectedDate,
      time: selectedTime,
      durationMinutes: estimatedDuration,
    });
  }, [dayAppointments, selectedDate, selectedTime, estimatedDuration, formData.serviceId]);

  const calendarDays = useMemo(() => {
    return buildCalendarDays(calendarYear, calendarMonth, today);
  }, [calendarYear, calendarMonth]);

  const currentMonthLabel = `${months[calendarMonth]} ${calendarYear}`;

  useEffect(() => {
    fetchAppointmentMeta();
  }, []);

  useEffect(() => {
    fetchDayAppointments(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const query = formData.patientName.trim();

    if (query.length < 2) {
      setPatientOptions([]);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const patients = await searchPatients(query);
        setPatientOptions(Array.isArray(patients) ? patients : []);
      } catch (err) {
        setPatientOptions([]);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [formData.patientName]);

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
    const originalBodyOverflowY = document.documentElement.style.overflowY;

    document.body.style.margin = '0';
    document.documentElement.style.overflowY = 'scroll';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.documentElement.style.overflowY = originalBodyOverflowY;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showConfirmModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showConfirmModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeConfirmModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const selectedMinutes = getSelectedMinutes(formData.hour, formData.minute);

    if (selectedMinutes < clinicStartMinutes) {
      setFormData((current) => ({
        ...current,
        hour: '10',
        minute: '00',
      }));
    }

    if (selectedMinutes > clinicEndMinutes) {
      setFormData((current) => ({
        ...current,
        hour: '7',
        minute: '00',
      }));
    }
  }, [formData.hour, formData.minute]);

  async function fetchAppointmentMeta() {
    setMetaLoading(true);
    setFormError('');

    try {
      const meta = await getAppointmentMeta();
      const branchOptions = Array.isArray(meta.branches) ? meta.branches : [];
      const dentistOptions = Array.isArray(meta.dentists) ? meta.dentists : [];
      const serviceOptions = Array.isArray(meta.services) ? meta.services : [];

      setBranches(branchOptions);
      setDentists(dentistOptions);
      setServices(serviceOptions);
      setFormData((current) => ({
        ...current,
        branchId: current.branchId || String(branchOptions[0]?.id || ''),
      }));
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to load appointment options.'
      );
    } finally {
      setMetaLoading(false);
    }
  }

  async function fetchDayAppointments(dateKey) {
    try {
      const bounds = dayBoundsUTC(dateKey);
      const appointments = await listAppointments({
        from: bounds.fromUTC,
        to: bounds.toUTC,
      });

      setDayAppointments(Array.isArray(appointments) ? appointments : []);
    } catch (err) {
      setDayAppointments([]);
    }
  }

  function handleInputChange(field, value) {
    if (field === 'patientName') {
      setSelectedPatient(null);
      setShowPatientOptions(true);
    }

    if (field !== 'patientName') {
      setFormError('');
    }

    if (fieldErrors[field]) {
      setFieldErrors((current) => ({
        ...current,
        [field]: '',
      }));
    }

    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTimePickerChange(value) {
    const parsed = parseTimePickerValue(value);

    setFormData((current) => ({
      ...current,
      hour: parsed.hour,
      minute: parsed.minute,
    }));
    setFormError('');
  }

  function handlePreviousMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((year) => year - 1);
      return;
    }

    setCalendarMonth((month) => month - 1);
  }

  function handleNextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((year) => year + 1);
      return;
    }

    setCalendarMonth((month) => month + 1);
  }

  function handleSelectDate(dayItem) {
    if (!dayItem || dayItem.disabled || !dayItem.dateKey) {
      return;
    }

    setSelectedDate(dayItem.dateKey);
  }

  function handleSuggestedSlotClick(slot) {
    const parsedTime = parseDisplayTime(slot);

    setFormData((current) => ({
      ...current,
      hour: parsedTime.hour,
      minute: parsedTime.minute,
    }));
  }

  function handleSelectPatient(patient) {
    setSelectedPatient(patient);
    setShowPatientOptions(false);
    setPatientOptions([]);
    setFormData((current) => ({
      ...current,
      patientName: patient.name || '',
      contactNumber: patient.contact_number || '',
      email: patient.email || '',
    }));
  }

  function openConfirmModal() {
    setShowConfirmModal(true);
  }

  function closeConfirmModal() {
    setShowConfirmModal(false);
  }

  function handleBackConfirm() {
    navigate('/receptionistAppointments');
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeConfirmModal();
    }
  }

  function handleClearForm() {
    setFormData({
      branchId: branches[0]?.id ? String(branches[0].id) : '',
      patientName: '',
      contactNumber: '',
      email: '',
      dentistId: '',
      serviceId: '',
      note: '',
      hour: '10',
      minute: '00',
    });

    setSelectedPatient(null);
    setPatientOptions([]);
    setShowPatientOptions(false);
    setFormError('');
    setFieldErrors({});
    setSelectedDate(toDateKey(today));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!isTimeWithinClinicHours) {
      setFormError('Selected time is outside clinic hours.');
      return;
    }

    if (!formData.dentistId || !formData.serviceId) {
      setFormError('Please complete the dentist and service fields.');
      return;
    }

    if (!formData.branchId) {
      setFormError('Your receptionist account is not assigned to a branch.');
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setFieldErrors({ email: emailError });
      setFormError(emailError);
      return;
    }

    if (timeConflict) {
      setFormError(
        `This time overlaps with an existing branch appointment for ${timeConflict.patientName}.`
      );
      return;
    }

    setSubmitting(true);

    try {
      let patient = selectedPatient;

      if (!patient) {
        patient = await createStaffPatient({
          full_name: formData.patientName,
          contact_number: formData.contactNumber,
          email: formData.email,
        });
      } else if (
        String(patient.contact_number || '').trim() !==
          String(formData.contactNumber || '').trim() ||
        String(patient.email || '').trim().toLowerCase() !==
          String(formData.email || '').trim().toLowerCase()
      ) {
        patient = await updatePatientContact(patient.id, {
          full_name: formData.patientName,
          contact_number: formData.contactNumber,
          email: formData.email,
        });
      }

      await createAppointment({
        patient_id: Number(patient.id),
        dentist_id: Number(formData.dentistId),
        service_id: Number(formData.serviceId),
        start_time: buildAppointmentStartISO(selectedDate, selectedTime),
        note: formData.note,
      });

      navigate('/receptionistAppointments');
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError(
          'This time slot conflicts with an existing appointment. Please choose another time.'
        );
      } else {
        setFormError(
          err.response?.data?.message || 'Failed to submit appointment.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button type="button" style={styles.backBtn} onClick={openConfirmModal}>
            <i className="fi fi-rr-angle-left" style={styles.backIcon}></i>
          </button>

          <div>
            <h2 style={styles.headerTitle}>Patient Appointment Form</h2>
            <p style={styles.headerText}>
              Schedule a dental appointment with complete patient details.
            </p>
          </div>
        </div>

        {formError && (
          <div style={styles.alertBox}>
            <i className="fi fi-rr-triangle-warning" style={styles.warningIcon}></i>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formSection}>
            <div style={styles.formPanel}>
              <h3 style={styles.panelTitle}>Patient Information</h3>

              <div style={styles.field}>
                <label style={styles.label}>
                  Patient Name <span style={styles.required}>*</span>
                </label>

                <input
                  type="text"
                  name="patientName"
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={(event) =>
                    handleInputChange('patientName', event.target.value)
                  }
                  required
                  style={styles.input}
                  autoComplete="off"
                  onFocus={() => setShowPatientOptions(true)}
                />

                {showPatientOptions && patientOptions.length > 0 && (
                  <div style={styles.patientResults}>
                    {patientOptions.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        style={styles.patientResultItem}
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <strong style={styles.patientResultName}>
                          {patient.name}
                        </strong>
                        <span style={styles.patientResultContact}>
                          {patient.contact_number || 'No contact number'}
                        </span>
                        <span style={styles.patientResultContact}>
                          {patient.email || 'No email address'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <p style={styles.helperText}>
                  Recommendations only show patients from your assigned branch.
                </p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Contact Number <span style={styles.required}>*</span>
                </label>

                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={(event) =>
                    handleInputChange('contactNumber', event.target.value)
                  }
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Email <span style={styles.required}>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(event) =>
                    handleInputChange('email', event.target.value)
                  }
                  required
                  style={{
                    ...styles.input,
                    ...(fieldErrors.email ? styles.inputError : {}),
                  }}
                />

                {fieldErrors.email && (
                  <p style={styles.fieldError}>{fieldErrors.email}</p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Doctor Name <span style={styles.required}>*</span>
                </label>
                <select
                  name="dentistId"
                  value={formData.dentistId}
                  onChange={(event) =>
                    handleInputChange('dentistId', event.target.value)
                  }
                  required
                  style={styles.input}
                  disabled={metaLoading}
                >
                  <option value="" disabled>
                    Select doctor
                  </option>

                  {dentists.map((dentist) => (
                    <option key={dentist.id} value={dentist.id}>
                      {dentist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Purpose of Visit <span style={styles.required}>*</span>
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={(event) =>
                    handleInputChange('serviceId', event.target.value)
                  }
                  required
                  style={styles.input}
                  disabled={metaLoading}
                >
                  <option value="" disabled>
                    Select purpose
                  </option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Note</label>
                <textarea
                  name="note"
                  placeholder="Add appointment note (optional)"
                  value={formData.note}
                  onChange={(event) =>
                    handleInputChange('note', event.target.value)
                  }
                  style={{ ...styles.input, ...styles.textarea }}
                />
              </div>
            </div>

            <div style={styles.formPanel}>
              <h3 style={styles.panelTitle}>Appointment Schedule</h3>

              <div style={styles.calendarContainer}>
                <div style={styles.calendar}>
                  <div style={styles.controls}>
                    <button
                      type="button"
                      style={styles.calendarNav}
                      onClick={handlePreviousMonth}
                    >
                      <i className="fi fi-rr-angle-left"></i>
                    </button>

                    <div style={styles.calendarDropdowns}>
                      <select
                        value={calendarMonth}
                        onChange={(event) =>
                          setCalendarMonth(Number(event.target.value))
                        }
                        style={styles.calendarSelect}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <select
                        value={calendarYear}
                        onChange={(event) =>
                          setCalendarYear(Number(event.target.value))
                        }
                        style={styles.calendarSelect}
                      >
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      style={styles.calendarNav}
                      onClick={handleNextMonth}
                    >
                      <i className="fi fi-rr-angle-right"></i>
                    </button>
                  </div>

                  <div style={styles.currentMonthLabel}>{currentMonthLabel}</div>

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
                          {week.map((dayItem, dayIndex) => {
                            const isEmptyCell = !dayItem.day;
                            const isSelected =
                              Boolean(dayItem.dateKey) &&
                              dayItem.dateKey === selectedDate;

                            return (
                              <td
                                key={`${weekIndex}-${dayIndex}`}
                                style={{
                                  ...styles.calendarTd,
                                  ...(isEmptyCell ? styles.calendarTdEmpty : {}),
                                  ...(dayItem.disabled && !isEmptyCell
                                    ? styles.calendarTdDisabled
                                    : {}),
                                  ...(isSelected ? styles.calendarTdSelected : {}),
                                }}
                                onClick={() => handleSelectDate(dayItem)}
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

                <div style={styles.calendarDivider}></div>

                <div style={styles.timeSection}>
                  <label style={styles.label}>
                    Time <span style={styles.required}>*</span>
                  </label>

                  <div style={styles.timePickerRow}>
                    <input
                      type="time"
                      value={timePickerValue}
                      min="10:00"
                      max="19:00"
                      step="1800"
                      onChange={(event) =>
                        handleTimePickerChange(event.target.value)
                      }
                      required
                      style={styles.timeInput}
                    />
                  </div>

                  {!isTimeWithinClinicHours && (
                    <div style={styles.warningBox}>
                      <i className="fi fi-rr-triangle-warning" style={styles.warningIcon}></i>
                      <div>
                        <strong style={styles.warningTitle}>
                          Selected time is outside clinic hours.
                        </strong>
                        <p style={styles.warningText}>
                          Please choose a time between 10:00 AM and 7:00 PM.
                        </p>
                      </div>
                    </div>
                  )}

                  {timeConflict && (
                    <div style={styles.warningBox}>
                      <i className="fi fi-rr-triangle-warning" style={styles.warningIcon}></i>
                      <div>
                        <strong style={styles.warningTitle}>
                          {selectedTime} overlaps with an existing branch appointment.
                        </strong>
                        <p style={styles.warningText}>
                          {timeConflict.patientName} with {timeConflict.dentistName} at {timeConflict.time}.
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={styles.infoRows}>
                    <div style={styles.infoRow}>
                      <i className="fi fi-rr-clock" style={styles.infoIconBlue}></i>
                      <div>
                        <p style={styles.infoText}>
                          Estimated Duration: {estimatedTimeRange}
                        </p>
                        <p style={styles.infoSubText}>
                          Estimated duration is based on the selected purpose of visit. A 10-minute cleaning/preparation buffer is blocked after each appointment.
                        </p>
                      </div>
                    </div>

                    <div style={styles.infoRow}>
                      <i className="fi fi-rr-info" style={styles.infoIconGray}></i>
                      <div>
                        <p style={styles.infoText}>
                          Clinic Hours: 10:00 AM - 7:00 PM
                        </p>
                        <p style={styles.infoSubText}>
                          Time slots are limited to clinic operating hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <input type="hidden" name="appointmentDate" value={selectedDate} />
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" style={styles.clearBtn} onClick={handleClearForm}>
              Clear
            </button>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(submitting || metaLoading ? styles.buttonDisabled : {}),
              }}
              disabled={submitting || metaLoading}
            >
              {submitting ? 'Submitting...' : 'Submit Appointment'}
            </button>
          </div>
        </form>
      </div>

      {showConfirmModal && (
        <div style={styles.modal} onClick={handleModalOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Leave Appointment Form?</h2>
            <p style={styles.modalText}>
              Are you sure you want to go back? Any unsaved changes will be lost.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.confirmYes}
                onClick={handleBackConfirm}
              >
                Yes
              </button>

              <button
                type="button"
                style={styles.confirmNo}
                onClick={closeConfirmModal}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildCalendarDays(year, month, today) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];
  let currentWeek = [];

  for (let index = 0; index < startDay; index += 1) {
    currentWeek.push({
      day: '',
      dateKey: '',
      disabled: true,
      isToday: false,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const dateKey = toDateKey(date);

    currentWeek.push({
      day,
      dateKey,
      disabled: date < today,
      isToday: false,
    });

    if (currentWeek.length === 7) {
      days.push(currentWeek);
      currentWeek = [];
    }
  }

  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push({
      day: '',
      dateKey: '',
      disabled: true,
      isToday: false,
    });
  }

  if (currentWeek.length > 0) {
    days.push(currentWeek);
  }

  return days;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getPeriodFromHour(hourValue) {
  const hourNumber = Number(hourValue);

  if (hourNumber === 10 || hourNumber === 11) {
    return 'AM';
  }

  return 'PM';
}

function getSelectedMinutes(hourValue, minuteValue) {
  const period = getPeriodFromHour(hourValue);
  const timeString = `${hourValue}:${minuteValue} ${period}`;

  return parseTimeToMinutes(timeString);
}

function getEstimatedTimeRange(startTime, durationMinutes) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;

  return `${formatMinutesToTime(startMinutes)} - ${formatMinutesToTime(endMinutes)}`;
}

function parseTimeToMinutes(timeString) {
  const [time, period] = timeString.split(' ');
  const [hourValue, minuteValue] = time.split(':').map(Number);

  let hour = hourValue;

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minuteValue;
}

function toTimePickerValue(hourValue, minuteValue) {
  const totalMinutes = getSelectedMinutes(hourValue, minuteValue);
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseTimePickerValue(value) {
  const [hourPart = '10', minutePart = '00'] = String(value || '10:00').split(':');
  const hour24 = Number(hourPart);
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24;

  return {
    hour: String(hour12 || 12),
    minute: String(Number(minutePart) || 0).padStart(2, '0'),
  };
}

function formatTimePickerValue(value) {
  const [hourPart = '10', minutePart = '00'] = String(value || '10:00').split(':');
  const hour24 = Number(hourPart);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 >= 12 ? 'PM' : 'AM';

  return `${hour12}:${minutePart} ${period}`;
}

function formatMinutesToTime(totalMinutes) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function dayBoundsUTC(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

  return {
    fromUTC: start.toISOString(),
    toUTC: end.toISOString(),
  };
}

function findTimeConflict({ appointments, dateKey, time, durationMinutes }) {
  const selectedStart = buildAppointmentStartISO(dateKey, time);
  const startMs = new Date(selectedStart).getTime();
  const endMs =
    startMs + (durationMinutes + appointmentBufferMinutes) * 60 * 1000;

  return appointments.find((appointment) => {
    const status = String(appointment.status || '').toLowerCase();

    if (!['scheduled', 'arrived', 'completed'].includes(status)) {
      return false;
    }

    const appointmentStart = new Date(appointment.start_time).getTime();
    const appointmentEnd =
      appointmentStart +
      (Number(appointment.duration_min || 30) + appointmentBufferMinutes) *
        60 *
        1000;

    return startMs < appointmentEnd && endMs > appointmentStart;
  })
    ? mapConflictAppointment(
        appointments.find((appointment) => {
          const status = String(appointment.status || '').toLowerCase();

          if (!['scheduled', 'arrived', 'completed'].includes(status)) {
            return false;
          }

          const appointmentStart = new Date(appointment.start_time).getTime();
          const appointmentEnd =
            appointmentStart +
            (Number(appointment.duration_min || 30) + appointmentBufferMinutes) *
              60 *
              1000;

          return startMs < appointmentEnd && endMs > appointmentStart;
        })
      )
    : null;
}

function mapConflictAppointment(appointment) {
  const start = new Date(appointment.start_time);

  return {
    patientName: appointment.patient_name || 'another patient',
    dentistName: appointment.dentist_name || 'their dentist',
    time: Number.isNaN(start.getTime())
      ? 'that time'
      : start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
  };
}

function buildAppointmentStartISO(dateKey, displayTime) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const minutes = parseTimeToMinutes(displayTime);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);

  return date.toISOString();
}

function parseDisplayTime(timeString) {
  const [time] = timeString.split(' ');
  const [hour, minute] = time.split(':');

  return {
    hour,
    minute,
  };
}

function validateEmail(value) {
  const email = String(value || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return 'Email address is required.';
  }

  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

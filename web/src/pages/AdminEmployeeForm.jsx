import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

import api from '../api/axios';
import createAdminEmployeeFormStyles from '../styles/AdminEmployeeForm';

// ─── Static constants ────────────────────────────────────────────────────────

const timeSlots = (() => {
  const slots = [];
  for (let h = 10; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) continue;
      const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      slots.push({
        value: `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`,
        label: `${h12}:${m === 0 ? '00' : '30'} ${ampm}`,
      });
    }
  }
  return slots;
})();

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const NATIONALITY_OPTIONS = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan',
  'Argentine', 'Armenian', 'Australian', 'Austrian', 'Bangladeshi',
  'Belgian', 'Brazilian', 'British', 'Bulgarian', 'Cambodian', 'Canadian',
  'Chilean', 'Chinese', 'Colombian', 'Croatian', 'Czech', 'Danish', 'Dutch',
  'Egyptian', 'Emirati', 'Filipino', 'Finnish', 'French', 'German', 'Greek',
  'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Irish', 'Israeli',
  'Italian', 'Japanese', 'Jordanian', 'Kenyan', 'Korean', 'Kuwaiti',
  'Malaysian', 'Mexican', 'Moroccan', 'Nepalese', 'New Zealander',
  'Nigerian', 'Norwegian', 'Pakistani', 'Peruvian', 'Polish', 'Portuguese',
  'Qatari', 'Romanian', 'Russian', 'Saudi', 'Singaporean', 'South African',
  'Spanish', 'Swedish', 'Swiss', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese',
];

const RELIGION_OPTIONS = [
  'Catholic', 'Christian', 'Islam', 'Iglesia ni Cristo', 'Buddhism', 'Hinduism',
];

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'];

const SUFFIX_OPTIONS = ['Jr', 'Sr', 'II', 'III', 'IV'];

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];
const STAFF_SHIFT_TYPES = ['Full Day', 'Custom Hours'];
const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const SUPPORTING_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_EMPLOYEE_FILE_SIZE = 5 * 1024 * 1024;
const REQUIRED_FIELD_MESSAGE = 'This field is required';

const DENTIST_SPECIALIZATIONS = [
  'General Dentistry', 'Orthodontics', 'Endodontics', 'Periodontics',
  'Prosthodontics', 'Pediatric Dentistry', 'Oral Surgery', 'Cosmetic Dentistry',
  'Implant Dentistry', 'Radiology',
];

function timeLabelToValue(hourText, minuteText, periodText) {
  let hour = Number(hourText);
  const minute = Number(minuteText);
  const period = String(periodText || '').toUpperCase();

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '';
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseBranchOperatingHours(value) {
  const text = String(value || '').trim();
  const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  const start = timeLabelToValue(match[1], match[2], match[3]);
  const end = timeLabelToValue(match[4], match[5], match[6]);
  return start && end ? { start, end } : null;
}

function formatTimeSlotLabel(value) {
  return timeSlots.find((slot) => slot.value === value)?.label || value;
}

const phoneCountryOptions = getCountries().map((country) => ({
  country,
  callingCode: getCountryCallingCode(country),
}));

// ─── Input filter helpers ────────────────────────────────────────────────────


function makeInputFilter(disallowedRegex) {
  return function (event) {
    const el = event.target;
    const filtered = el.value.replace(disallowedRegex, '');
    if (filtered !== el.value) {
      const pos = Math.max(0, el.selectionStart - (el.value.length - filtered.length));
      el.value = filtered;
      try { el.setSelectionRange(pos, pos); } catch (_) {}
    }
  };
}

// Letters, spaces, hyphens, apostrophes only (name fields)
const filterNameInput = makeInputFilter(/[^a-zA-ZÀ-ÿ\s'\-]/g);

// Standard email characters only
const filterEmailInput = makeInputFilter(/[^a-zA-Z0-9._%+\-@]/g);

// Letters and numbers only (password fields)
const filterPasswordInput = makeInputFilter(/[^a-zA-Z0-9]/g);

// Letters and common punctuation — no digits (professional text fields)
const filterProfessionalTextInput = makeInputFilter(/[^a-zA-ZÀ-ÿ\s'\-.,()&/:]/g);

// ─── Primitive field components (stable module-level references) ──────────────

function FieldRaw({ label, name, type = 'text', readOnly = false, value, onChange, placeholder, required = false, min, onInput, maxLength, hasError = false, errorMessage, styles }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        onInput={onInput}
        maxLength={maxLength}
        style={{ ...styles.input, ...(readOnly ? styles.readOnlyInput : {}), ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}) }}
      />
      {errorMessage && <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{errorMessage}</span>}
    </div>
  );
}

function PhoneFieldRaw({
  label,
  name,
  country = 'PH',
  onCountryChange,
  value,
  onChange,
  onBlur,
  hasError = false,
  errorMessage,
  styles,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <div style={styles.phoneInputContainer}>
        <select
          value={country}
          onChange={(event) => onCountryChange?.(event.target.value)}
          style={{
            ...styles.phoneCountrySelect,
            ...(hasError ? styles.phoneInputError : {}),
          }}
          aria-label="Country code"
        >
          {phoneCountryOptions.map((option) => (
            <option key={option.country} value={option.country}>
              {option.country} +{option.callingCode}
            </option>
          ))}
        </select>
        <input
          type="tel"
          name={name}
          value={value}
          onChange={(event) => onChange?.(event.target.value, { countryCode: country.toLowerCase() })}
          onBlur={onBlur}
          placeholder="9123456789"
          required
          autoComplete="tel"
          inputMode="tel"
          maxLength={15}
          style={{
            ...styles.phoneInput,
            ...(hasError ? styles.phoneInputError : {}),
          }}
        />
      </div>
      <input type="hidden" name={`${name}Country`} value={country} readOnly />
      {errorMessage && (
        <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

function SelectFieldRaw({ label, name, options, placeholder, disabled = false, required = false, value, onChange, hasError = false, errorMessage, styles }) {
  const controlled = value !== undefined && onChange !== undefined;
  const selectProps = controlled
    ? { value, onChange }
    : { defaultValue: '', ...(onChange ? { onChange } : {}) };
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <select
        name={name}
        disabled={disabled}
        required={required}
        {...selectProps}
        style={{ ...styles.input, ...(disabled ? styles.readOnlyInput : {}), ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}) }}
      >
        <option value="" disabled={controlled}>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
      {errorMessage && (
        <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

function GenderFieldRaw({ name, hasError = false, errorMessage, onChange, styles }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        Gender:{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ ...styles.radioInlineGroup, ...(hasError ? { border: '2px solid #dc2626', borderRadius: 12, padding: '6px 10px' } : {}) }}>
        <label style={styles.radioLabel}>
          <input type="radio" name={name} value="Female" onChange={onChange} style={styles.radioInput} />
          Female
        </label>
        <label style={styles.radioLabel}>
          <input type="radio" name={name} value="Male" onChange={onChange} style={styles.radioInput} />
          Male
        </label>
      </div>
      {errorMessage && (
        <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

function ScheduleFieldRaw({ name, dayOptions, styles, checkedValues = null, onToggle = null }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>Work Schedule Days</label>
      <div style={styles.scheduleGrid}>
        {dayOptions.map((day) => (
          <label key={day} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name={name}
              value={day}
              style={styles.checkboxInput}
              checked={Array.isArray(checkedValues) ? checkedValues.includes(day) : undefined}
              onChange={onToggle ? (e) => onToggle(day, e.target.checked) : undefined}
            />
            {day}
          </label>
        ))}
      </div>
    </div>
  );
}

function TimeRangeFieldRaw({
  startName,
  endName,
  styles,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled = false,
  hasError = false,
  errorMessage,
}) {
  const controlled = startValue !== undefined && endValue !== undefined;
  const selectStyle = {
    ...styles.input,
    ...(disabled ? styles.readOnlyInput : {}),
    ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}),
  };

  return (
    <div style={styles.field}>
      <label style={styles.label}>
        Working Hours{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <div style={styles.timeGroup}>
        {disabled && controlled && <input type="hidden" name={startName} value={startValue} readOnly />}
        <select
          name={startName}
          disabled={disabled}
          {...(controlled ? { value: startValue, onChange: (e) => onStartChange?.(e.target.value) } : { defaultValue: '' })}
          style={selectStyle}
        >
          <option value="" disabled>Start time</option>
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>{slot.label}</option>
          ))}
        </select>
        <span style={styles.separator}>to</span>
        {disabled && controlled && <input type="hidden" name={endName} value={endValue} readOnly />}
        <select
          name={endName}
          disabled={disabled}
          {...(controlled ? { value: endValue, onChange: (e) => onEndChange?.(e.target.value) } : { defaultValue: '' })}
          style={selectStyle}
        >
          <option value="" disabled>End time</option>
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>{slot.label}</option>
          ))}
        </select>
      </div>
      {errorMessage && (
        <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

function DurationFieldRaw({ startName, endName, styles }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>Duration</label>
      <div style={styles.timeGroup}>
        <input type="month" name={startName} style={styles.input} />
        <span style={styles.separator}>to</span>
        <input type="month" name={endName} style={styles.input} />
      </div>
    </div>
  );
}

function normalizePhoneNumber(value, country = 'PH') {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits || isDialCodeOnly(digits, country)) {
    return '';
  }

  const phoneNumber = parseContactNumber(value, country);
  return phoneNumber?.number || `+${digits}`;
}

function getPhoneFormValue(value, fallbackCountry = 'PH') {
  const phoneNumber = parseContactNumber(value, fallbackCountry);

  if (!phoneNumber) {
    return {
      country: fallbackCountry,
      number: String(value || '').replace(/\D/g, ''),
    };
  }

  return {
    country: phoneNumber.country || fallbackCountry,
    number: phoneNumber.nationalNumber || String(value || '').replace(/\D/g, ''),
  };
}

function validatePhoneNumber(value, country = 'PH') {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits || isDialCodeOnly(digits, country)) {
    return 'This field is required';
  }

  const phoneNumber = parseContactNumber(value, country);

  if (!phoneNumber?.isValid()) {
    return 'Contact number does not match the selected country code.';
  }

  return null;
}

function parseContactNumber(value, country = 'PH') {
  const rawValue = String(value || '').trim();
  const digits = rawValue.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  if (rawValue.startsWith('+')) {
    return parsePhoneNumberFromString(rawValue);
  }

  if (digits.startsWith('00')) {
    return parsePhoneNumberFromString(`+${digits.slice(2)}`);
  }

  if (digits.startsWith('0')) {
    return parsePhoneNumberFromString(digits, country);
  }

  return parsePhoneNumberFromString(digits, country);
}

function isDialCodeOnly(digits, country = 'PH') {
  try {
    return digits === getCountryCallingCode(country);
  } catch {
    return false;
  }
}

function BirthdayFieldRaw({ type, prefix, birthdayParts, onPartChange, hasError = false, errorMessage, styles }) {
  const { month, day, year } = birthdayParts[type];
  const birthdayValue = month && day && year ? `${year}-${month}-${day}` : '';
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div style={styles.field}>
      <label style={styles.label}>
        Birthday:{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <input type="hidden" name={`${prefix}Birthday`} value={birthdayValue} onChange={() => {}} />
      <div style={{ ...styles.timeGroup, ...(hasError ? { border: '2px solid #dc2626', borderRadius: 12, padding: '6px 8px' } : {}) }}>
        <select value={month} onChange={(e) => onPartChange(type, 'month', e.target.value)} style={styles.input}>
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={day} onChange={(e) => onPartChange(type, 'day', e.target.value)} style={styles.input}>
          <option value="">Day</option>
          {days.map((d) => <option key={d} value={d}>{parseInt(d, 10)}</option>)}
        </select>
        <select value={year} onChange={(e) => onPartChange(type, 'year', e.target.value)} style={styles.input}>
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
      </div>
      {errorMessage && (
        <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminEmployeeForm() {
  const navigate = useNavigate();

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [employeeType, setEmployeeType] = useState('');
  const [openSections, setOpenSections] = useState({});
  const [showBackModal, setShowBackModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [dentists, setDentists] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [branchSpecializationOptions, setBranchSpecializationOptions] = useState([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDentistSpecializations, setSelectedDentistSpecializations] = useState([]);
  const [additionalDentistBranchIds, setAdditionalDentistBranchIds] = useState([]);
  const [formErrors, setFormErrors] = useState(new Set());
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enablePerDayBranch, setEnablePerDayBranch] = useState(false);
  const [docWorkStart, setDocWorkStart] = useState('');
  const [docWorkEnd, setDocWorkEnd] = useState('');
  const [dentistWorkDays, setDentistWorkDays] = useState([]);
  const [dentistScheduleBlocks, setDentistScheduleBlocks] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [phoneValues, setPhoneValues] = useState({});
  const [phoneCountries, setPhoneCountries] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [supportingDocuments, setSupportingDocuments] = useState([]);

  const accessPasswordRef = useRef('');
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [ageValues, setAgeValues] = useState({
    dentist: '',
    dentalAssistant: '',
    receptionist: '',
  });

  const [birthdayParts, setBirthdayParts] = useState({
    dentist: { month: '', day: '', year: '' },
    dentalAssistant: { month: '', day: '', year: '' },
    receptionist: { month: '', day: '', year: '' },
  });

  const [noSuffix, setNoSuffix] = useState({
    dentist: false,
    dentalAssistant: false,
    receptionist: false,
  });

  const workIdRef = useRef(10);
  const [doctorWorkItems, setDoctorWorkItems] = useState([{ id: 1 }]);
  const [assistantWorkItems, setAssistantWorkItems] = useState([{ id: 2 }]);
  const [receptionistWorkItems, setReceptionistWorkItems] = useState([{ id: 3 }]);
  const [daShiftType, setDaShiftType] = useState('');
  const [daWorkStart, setDaWorkStart] = useState('');
  const [daWorkEnd, setDaWorkEnd] = useState('');
  const [recepShiftType, setRecepShiftType] = useState('');
  const [recepUseStandardHours, setRecepUseStandardHours] = useState(true);
  const [recepWorkStart, setRecepWorkStart] = useState('');
  const [recepWorkEnd, setRecepWorkEnd] = useState('');

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1100;
  const isSmallScreen = screenWidth <= 1100;

  const styles = createAdminEmployeeFormStyles({ isMobile, isTablet, isSmallScreen });

  const branchOptions = branches.map((branch) => ({
    value: String(branch.id),
    label: branch.address ? `${branch.name} - ${branch.address}` : branch.name,
  }));
  const selectedBranch = branches.find((branch) => String(branch.id) === String(selectedBranchId));
  const selectedBranchHours = parseBranchOperatingHours(selectedBranch?.operating_hours);
  const standardReceptionistHours = selectedBranchHours || { start: '10:00', end: '19:00' };
  const standardReceptionistHoursLabel = `${formatTimeSlotLabel(standardReceptionistHours.start)} - ${formatTimeSlotLabel(standardReceptionistHours.end)}`;

  const dentistOptions = dentists.length > 0 ? dentists : [];
  const specializationOptions =
    serviceCategories.length > 0 ? serviceCategories : DENTIST_SPECIALIZATIONS;
  const additionalBranchOptions = branchOptions.filter(
    (option) => String(option.value) !== String(selectedBranchId)
  );
  const canUsePerDayBranchSchedule = additionalDentistBranchIds.length > 0;
  const allowedScheduleBranchOptions = branchOptions.filter((option) =>
    String(option.value) === String(selectedBranchId) ||
    additionalDentistBranchIds.map(String).includes(String(option.value))
  );

  function createDentistScheduleBlock(day, overrides = {}) {
    return {
      id: `${day}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      branch_id: overrides.branch_id ?? selectedBranchId ?? '',
      start_time: overrides.start_time ?? docWorkStart ?? '',
      end_time: overrides.end_time ?? docWorkEnd ?? '',
    };
  }

  function updateDentistScheduleBlockTime(field, value) {
    setDentistScheduleBlocks((prev) => {
      const next = {};

      for (const [day, blocks] of Object.entries(prev || {})) {
        next[day] = (Array.isArray(blocks) ? blocks : []).map((block) => ({
          ...block,
          [field]: value,
        }));
      }

      return next;
    });
  }

  function ensureDentistScheduleBlock(day) {
    setDentistScheduleBlocks((prev) => {
      if (Array.isArray(prev?.[day]) && prev[day].length > 0) {
        return prev;
      }

      return {
        ...prev,
        [day]: [createDentistScheduleBlock(day)],
      };
    });
  }

  function removeDentistScheduleDay(day) {
    setDentistScheduleBlocks((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }

  function addDentistScheduleBlock(day) {
    setDentistScheduleBlocks((prev) => ({
      ...prev,
      [day]: [
        ...(Array.isArray(prev?.[day]) ? prev[day] : []),
        createDentistScheduleBlock(day),
      ],
    }));
  }

  function updateDentistScheduleBlock(day, blockId, field, value) {
    setDentistScheduleBlocks((prev) => ({
      ...prev,
      [day]: (Array.isArray(prev?.[day]) ? prev[day] : []).map((block) =>
        block.id === blockId ? { ...block, [field]: value } : block
      ),
    }));
  }

  function removeDentistScheduleBlock(day, blockId) {
    setDentistScheduleBlocks((prev) => {
      const current = Array.isArray(prev?.[day]) ? prev[day] : [];
      const nextBlocks = current.filter((block) => block.id !== blockId);

      return {
        ...prev,
        [day]: nextBlocks.length > 0 ? nextBlocks : [createDentistScheduleBlock(day)],
      };
    });
  }

  function scheduleTimeToMinutes(value) {
    const [hour, minute] = String(value || '').split(':').map((part) => Number(part));
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
    return hour * 60 + minute;
  }

  function findScheduleBlockError(entries) {
    for (const entry of entries) {
      if (!entry.branch_id || !entry.start_time || !entry.end_time) {
        return 'Please complete every branch schedule block.';
      }

      const start = scheduleTimeToMinutes(entry.start_time);
      const end = scheduleTimeToMinutes(entry.end_time);
      if (start === null || end === null || start >= end) {
        return 'Schedule start time must be before end time.';
      }
    }

    const byDay = new Map();
    for (const entry of entries) {
      if (!byDay.has(entry.day)) byDay.set(entry.day, []);
      byDay.get(entry.day).push({
        start: scheduleTimeToMinutes(entry.start_time),
        end: scheduleTimeToMinutes(entry.end_time),
      });
    }

    for (const [day, rows] of byDay.entries()) {
      rows.sort((a, b) => a.start - b.start);
      for (let index = 1; index < rows.length; index += 1) {
        if (rows[index].start < rows[index - 1].end) {
          return `${day} has overlapping branch schedule times.`;
        }
      }
    }

    return '';
  }

  useEffect(() => {
    function handleResize() { setScreenWidth(window.innerWidth); }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await api.get('/auth/branches');
        setBranches(res.data.branches || []);
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setBranchesLoading(false);
      }
    }

    async function loadDentists() {
      try {
        const res = await api.get('/auth/staff-profiles');
        const employees = res.data.employees || [];
        setDentists(
          employees
            .filter((e) => e.role === 'Dentist')
            .map((e) => ({
              value: String(e.userId || e.id),
              label: `Dr. ${e.firstName || ''} ${e.lastName || ''}`.trim(),
            }))
        );
      } catch (err) {
        console.error('Failed to load dentists', err);
      }
    }

    async function loadServices() {
      try {
        const res = await api.get('/auth/services');
        const all = res.data.services || [];
        const cats = [...new Set(all.map((s) => s.category).filter(Boolean))].sort();
        setServiceCategories(cats);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    }

    loadBranches();
    loadDentists();
    loadServices();
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
    document.body.style.overflow = (showBackModal || showSuccessModal || showErrorModal) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showBackModal, showSuccessModal, showErrorModal]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  useEffect(() => {
    if (employeeType === 'dentalAssistant') return;

    const err = accessEmail ? validateEmailValue(accessEmail) : null;
    setFieldError('accessEmail', err);
    if (!err && accessEmail) clearSubmitError('accessEmail');
  }, [accessEmail, employeeType]);

  useEffect(() => {
    if (employeeType === 'dentalAssistant') return;

    accessPasswordRef.current = accessPassword;

    if (accessPassword) {
      setFieldError('accessPassword', null);
      clearSubmitError('accessPassword');
    }

    if (confirmPassword) {
      const err = confirmPassword === accessPassword ? null : 'Passwords do not match';
      setFieldError('confirmPassword', err);
      if (!err) clearSubmitError('confirmPassword');
    }
  }, [accessPassword, confirmPassword, employeeType]);

  useEffect(() => {
    setSelectedBranchId('');
    setSelectedSpecialization('');
    setSelectedDentistSpecializations([]);
    setAdditionalDentistBranchIds([]);
    setEnablePerDayBranch(false);
    setDocWorkStart('');
    setDocWorkEnd('');
    setDentistWorkDays([]);
    setDentistScheduleBlocks({});
    setDaShiftType('');
    setDaWorkStart('');
    setDaWorkEnd('');
    setRecepShiftType('');
    setRecepUseStandardHours(true);
    setRecepWorkStart('');
    setRecepWorkEnd('');
    setProfilePhoto(null);
    setProfilePhotoPreview('');
    setSupportingDocuments([]);
  }, [employeeType]);

  useEffect(() => {
    setBranchSpecializationOptions([]);
    setSpecializationsLoading(false);
  }, [selectedBranchId]);

  useEffect(() => {
    if (employeeType === 'dentalAssistant' && daShiftType === 'Full Day' && selectedBranchHours) {
      setDaWorkStart(selectedBranchHours.start);
      setDaWorkEnd(selectedBranchHours.end);
    }

    if (employeeType === 'receptionist' && recepUseStandardHours) {
      setRecepShiftType('Full Day');
      setRecepWorkStart(standardReceptionistHours.start);
      setRecepWorkEnd(standardReceptionistHours.end);
    }
  }, [
    employeeType,
    daShiftType,
    recepUseStandardHours,
    selectedBranchHours?.start,
    selectedBranchHours?.end,
    standardReceptionistHours.start,
    standardReceptionistHours.end,
  ]);

  useEffect(() => {
    if (!enablePerDayBranch) return;

    setDentistScheduleBlocks((prev) => {
      const next = {};
      for (const day of dentistWorkDays) {
        next[day] = Array.isArray(prev?.[day]) && prev[day].length > 0
          ? prev[day]
          : [createDentistScheduleBlock(day)];
      }
      return next;
    });
  }, [enablePerDayBranch, dentistWorkDays, selectedBranchId]);

  useEffect(() => {
    if (canUsePerDayBranchSchedule) return;

    setEnablePerDayBranch(false);
    setDentistScheduleBlocks({});
  }, [canUsePerDayBranchSchedule]);

  function calculateAge(birthdayStr) {
    if (!birthdayStr) return '';
    const birthDate = new Date(birthdayStr);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
    return age >= 0 ? String(age) : '';
  }

  function handleBirthdayPartChange(type, part, value) {
    const newParts = { ...birthdayParts[type], [part]: value };
    setBirthdayParts((prev) => ({ ...prev, [type]: newParts }));
    if (newParts.month && newParts.day && newParts.year) {
      const birthdayStr = `${newParts.year}-${newParts.month}-${newParts.day}`;
      setAgeValues((prev) => ({ ...prev, [type]: calculateAge(birthdayStr) }));
      const prefix = type === 'dentist' ? 'doctor' : type === 'dentalAssistant' ? 'da' : 'recep';
      clearSubmitError(`${prefix}Birthday`);
    }
  }

  function handleEmployeeTypeChange(event) {
    setEmployeeType(event.target.value);
    setOpenSections({});
    setFormErrors(new Set());
    setFieldErrors({});
    setAccessEmail('');
    setAccessPassword('');
    setConfirmPassword('');
    accessPasswordRef.current = '';
  }

  function toggleSection(sectionName) {
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  }

  function isSectionOpen(sectionName) {
    return Boolean(openSections[sectionName]);
  }

  function handleBackClick() { setShowBackModal(true); }
  function closeBackModal() { setShowBackModal(false); }
  function confirmBack() { navigate('/adminEmployees'); }

  function handleProfilePhotoSelect(file) {
    if (!file) return;

    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setErrorModalMessage('Profile photo must be a JPG or PNG file.');
      setShowErrorModal(true);
      return;
    }

    if (file.size > MAX_EMPLOYEE_FILE_SIZE) {
      setErrorModalMessage('Profile photo must be 5MB or smaller.');
      setShowErrorModal(true);
      return;
    }

    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }

    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    clearSubmitError('profilePhoto');
  }

  function handleSupportingDocumentFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const invalidType = files.find((file) => !SUPPORTING_DOCUMENT_TYPES.includes(file.type));
    const oversized = files.find((file) => file.size > MAX_EMPLOYEE_FILE_SIZE);

    if (invalidType || oversized) {
      setErrorModalMessage(
        invalidType
          ? 'Unsupported file format. Please upload a PDF, JPG, JPEG, or PNG file only.'
          : 'Only up to 5MB per file is allowed.'
      );
      setShowErrorModal(true);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
      return;
    }

    setSupportingDocuments((prev) => [...prev, ...files]);
    clearSubmitError('supportingDocuments');
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  }

  function removeSupportingDocument(index) {
    setSupportingDocuments((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      if (next.length === 0 && (employeeType === 'dentist' || employeeType === 'dentalAssistant')) {
        setFormErrors((current) => new Set(current).add('supportingDocuments'));
      }
      return next;
    });
  }

  function buildStaffMultipartPayload(payload) {
    const requestData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'profilePhoto' || key === 'supportingDocuments') return;
      if (key === 'staffProfile' || key === 'branch_ids') {
        requestData.append(key, JSON.stringify(value || (key === 'branch_ids' ? [] : {})));
      } else if (value !== undefined && value !== null) {
        requestData.append(key, value);
      }
    });

    if (payload.profilePhoto) {
      requestData.append('profilePhoto', payload.profilePhoto);
    }

    (payload.supportingDocuments || []).forEach((file) => {
      requestData.append('supportingDocuments', file);
    });

    return requestData;
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) closeBackModal();
  }

  function addDoctorWorkExperience() {
    setDoctorWorkItems((prev) => [...prev, { id: workIdRef.current++ }]);
  }
  function addAssistantWorkExperience() {
    setAssistantWorkItems((prev) => [...prev, { id: workIdRef.current++ }]);
  }
  function addReceptionistWorkExperience() {
    setReceptionistWorkItems((prev) => [...prev, { id: workIdRef.current++ }]);
  }
  function removeDoctorWorkItem(id) {
    setDoctorWorkItems((prev) => prev.filter((item) => item.id !== id));
  }
  function removeAssistantWorkItem(id) {
    setAssistantWorkItems((prev) => prev.filter((item) => item.id !== id));
  }
  function removeReceptionistWorkItem(id) {
    setReceptionistWorkItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleNoSuffixChange(type, event) {
    setNoSuffix((prev) => ({ ...prev, [type]: event.target.checked }));
  }

  function setFieldError(name, message) {
    setFieldErrors((prev) => {
      if (!message) {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      if (prev[name] === message) return prev;
      return { ...prev, [name]: message };
    });
  }

  function clearSubmitError(name) {
    setFormErrors((prev) => {
      if (!prev.has(name)) return prev;
      const n = new Set(prev);
      n.delete(name);
      return n;
    });
  }

  function validateRequiredText(value) {
    return value && value.trim() ? null : REQUIRED_FIELD_MESSAGE;
  }

  function getRequiredFieldMessage(name) {
    return fieldErrors[name] || (formErrors.has(name) ? REQUIRED_FIELD_MESSAGE : '');
  }

  function clearRequiredFieldError(name, value) {
    if (String(value || '').trim()) clearSubmitError(name);
  }

  function validateContactValue(value, country = 'PH') {
    return validatePhoneNumber(value, country);
  }

  function validateEmailValue(value) {
    if (!value || !value.trim()) return REQUIRED_FIELD_MESSAGE;
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.trim())
      ? null : 'Email format is invalid';
  }

  function validatePositiveNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return isNaN(n) || n < 0 ? 'Must be 0 or greater' : null;
  }

  function formatFileSize(value) {
    const size = Number(value || 0);
    if (!size) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handlePhoneChange(name, phone, countryData) {
    const countryCode = String(countryData?.countryCode || 'ph').toUpperCase();
    const rawValue = String(phone || '').trim();
    const phoneFormValue = rawValue.startsWith('+')
      ? getPhoneFormValue(rawValue, countryCode)
      : {
          country: countryCode,
          number: rawValue.replace(/\D/g, '').slice(0, 15),
        };

    setPhoneValues((prev) => ({ ...prev, [name]: phoneFormValue.number }));
    setPhoneCountries((prev) => ({ ...prev, [name]: phoneFormValue.country }));

    const err = validatePhoneNumber(phoneFormValue.number, phoneFormValue.country);
    setFieldError(name, err);
    if (!err) clearSubmitError(name);
  }

  function handlePhoneCountryChange(name, countryCode) {
    setPhoneCountries((prev) => ({ ...prev, [name]: countryCode }));
    const err = validatePhoneNumber(phoneValues[name] || '', countryCode);
    setFieldError(name, err);
    if (!err) clearSubmitError(name);
  }

  function validateRequiredFields(formData) {
    const prefix = employeeType === 'dentist' ? 'doctor'
      : employeeType === 'dentalAssistant' ? 'da' : 'recep';
    const errors = new Set();
    if (!profilePhoto) errors.add('profilePhoto');
    [`${prefix}FirstName`, `${prefix}LastName`, `${prefix}Address`,
      `${prefix}Contact`, `${prefix}Email`, `${prefix}Birthday`, `${prefix}Gender`]
      .forEach((name) => { if (!formData.get(name)) errors.add(name); });
    if (!selectedBranchId) errors.add('branchId');
    if (employeeType === 'dentist') {
      ['medicalDegree', 'licenseNumber', 'experienceYears'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
      if (supportingDocuments.length === 0) errors.add('supportingDocuments');
      if (selectedDentistSpecializations.length === 0) errors.add('department');
      ['startDate', 'employmentType', 'shiftType'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
    } else if (employeeType === 'dentalAssistant') {
      if (!formData.get('daExperienceYears')) errors.add('daExperienceYears');
      if (supportingDocuments.length === 0) errors.add('supportingDocuments');
      if (!selectedSpecialization) errors.add('daDepartment');
      ['daStartDate', 'daEmploymentType', 'daShiftType'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
      if (!formData.get('daWorkStart')) errors.add('daWorkStart');
      if (!formData.get('daWorkEnd')) errors.add('daWorkEnd');
    } else {
      ['startDate', 'employmentType'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
      if (!formData.get('recepWorkStart')) errors.add('recepWorkStart');
      if (!formData.get('recepWorkEnd')) errors.add('recepWorkEnd');
    }
    if (employeeType !== 'dentalAssistant') {
      ['accessEmail', 'accessPassword', 'confirmPassword'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
    }
    return errors;
  }

  function getSectionsWithErrors(errors) {
    const prefix = employeeType === 'dentist' ? 'doctor'
      : employeeType === 'dentalAssistant' ? 'da' : 'recep';
    const sec1 = ['profilePhoto', `${prefix}FirstName`, `${prefix}LastName`, `${prefix}Address`,
      `${prefix}Contact`, `${prefix}Email`, `${prefix}Birthday`, `${prefix}Gender`];
    const sec2 = employeeType === 'dentist'
      ? ['medicalDegree', 'licenseNumber', 'experienceYears', 'supportingDocuments']
      : employeeType === 'dentalAssistant'
        ? ['daExperienceYears', 'supportingDocuments']
        : [];
    const sec3 = employeeType === 'dentist'
      ? ['branchId', 'department', 'startDate', 'employmentType', 'shiftType']
      : employeeType === 'dentalAssistant'
        ? ['branchId', 'daDepartment', 'daStartDate', 'daEmploymentType', 'daShiftType', 'daWorkStart', 'daWorkEnd']
        : ['branchId', 'startDate', 'employmentType', 'recepWorkStart', 'recepWorkEnd'];
    const sec4 = ['accessEmail', 'accessPassword', 'confirmPassword'];
    const maps = {
      dentist: { docPersonal: sec1, docProfessional: sec2, docWork: sec3, docAccess: sec4 },
      dentalAssistant: { daPersonal: sec1, daProfessional: sec2, daWork: sec3 },
      receptionist: { recPersonal: sec1, recWork: sec3, recAccess: sec4 },
    };
    const toOpen = {};
    for (const [key, fields] of Object.entries(maps[employeeType] || {})) {
      if (fields.some((f) => errors.has(f))) toOpen[key] = true;
    }
    return toOpen;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.employeeType = employeeType;
    const activePrefix = employeeType === 'dentist' ? 'doctor'
      : employeeType === 'dentalAssistant' ? 'da' : 'recep';
    const activeContactName = `${activePrefix}Contact`;
    const normalizedActiveContact = normalizePhoneNumber(
      phoneValues[activeContactName] || payload[activeContactName] || '',
      phoneCountries[activeContactName] || 'PH'
    );
    payload[activeContactName] = normalizedActiveContact;

    const contactError = validateContactValue(
      normalizedActiveContact,
      phoneCountries[activeContactName] || 'PH'
    );
    setFieldError(activeContactName, contactError);

    const errors = validateRequiredFields(formData);
    const hasFormatErrors =
      Object.keys(fieldErrors).some((name) => name !== activeContactName) ||
      Boolean(contactError);
    if (errors.size > 0 || hasFormatErrors) {
      const onlyProfilePhotoMissing = errors.size === 1 && errors.has('profilePhoto') && !hasFormatErrors;
      const onlySupportingDocumentsMissing =
        errors.size === 1 && errors.has('supportingDocuments') && !hasFormatErrors;
      setFormErrors(errors);
      setOpenSections((prev) => ({ ...prev, ...getSectionsWithErrors(errors) }));
      setErrorModalMessage(
        onlyProfilePhotoMissing
          ? 'Please upload an employee photo.'
          : onlySupportingDocumentsMissing
          ? 'Please upload supporting documents.'
          : errors.size > 0
          ? 'Please fill in all required fields before submitting.'
          : 'Please fix the highlighted errors before submitting.'
      );
      setShowErrorModal(true);
      return;
    }
    setFormErrors(new Set());

    if (employeeType !== 'dentalAssistant' && payload.accessPassword !== payload.confirmPassword) {
      setErrorModalMessage('Password and confirm password do not match.');
      setShowErrorModal(true);
      return;
    }

    try {
      const isDentist = employeeType === 'dentist';
      const isDentalAssistant = employeeType === 'dentalAssistant';
      const prefix = isDentist ? 'doctor' : isDentalAssistant ? 'da' : 'recep';
      const role = isDentist ? 'dentist' : 'receptionist';
      const firstName = payload[`${prefix}FirstName`] || '';
      const middleName = payload[`${prefix}MiddleName`] || '';
      const lastName = payload[`${prefix}LastName`] || '';
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      const branchId = Number(selectedBranchId);
      const workDays = isDentist ? dentistWorkDays : formData.getAll('schedule[]');
      const scheduleEntries = [];
      const dentistSpecializations = isDentist ? selectedDentistSpecializations : [];
      const dentistSpecializationText = dentistSpecializations.join(', ');

      if (isDentist && enablePerDayBranch) {
        for (const day of workDays) {
          const blocks = Array.isArray(dentistScheduleBlocks?.[day])
            ? dentistScheduleBlocks[day]
            : [];

          for (const block of blocks) {
            scheduleEntries.push({
              day,
              branch_id: Number(block.branch_id || branchId),
              start_time: block.start_time,
              end_time: block.end_time,
            });
          }
        }

        const scheduleError = findScheduleBlockError(scheduleEntries);
        if (scheduleEntries.length === 0 || scheduleError) {
          setErrorModalMessage(scheduleError || 'Please add at least one branch schedule block.');
          setShowErrorModal(true);
          return;
        }
      }

      const commonStaffProfile = {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        nickname: payload[`${prefix}Nickname`],
        suffix: payload[`${prefix}Suffix`],
        birthday: payload[`${prefix}Birthday`],
        age: payload[`${prefix}Age`],
        gender: payload[isDentist ? 'doctorGender' : isDentalAssistant ? 'daGender' : 'recepGender'],
        civil_status: payload[`${prefix}CivilStatus`],
        religion: payload[`${prefix}Religion`],
        nationality: payload[`${prefix}Nationality`],
        home_address: payload[`${prefix}Address`],
        contact_number: payload[`${prefix}Contact`],
        email: payload[`${prefix}Email`],
        position: isDentist ? 'Dentist' : isDentalAssistant ? 'Dental Assistant' : 'Receptionist',
        specialization: isDentist ? dentistSpecializationText || payload.specialization || null : null,
        work_department: isDentist
          ? dentistSpecializationText || null
          : isDentalAssistant
            ? payload.daDepartment || null
            : null,
        specializations: isDentist ? dentistSpecializations : [],
        medical_degree: isDentist ? payload.medicalDegree : null,
        license_number: isDentist ? payload.licenseNumber : null,
        years_experience: isDentist
          ? payload.experienceYears
          : isDentalAssistant
            ? payload.daExperienceYears
            : payload.recepExperienceYears,
        skills: isDentalAssistant ? payload.daSkills : isDentist ? null : payload.recepSkills,
        start_date: isDentalAssistant ? payload.daStartDate : payload.startDate,
        employment_type: isDentalAssistant ? payload.daEmploymentType : payload.employmentType || null,
        shift_type: isDentalAssistant
          ? payload.daShiftType
          : isDentist
            ? payload.shiftType || null
            : recepUseStandardHours ? 'Full Day' : 'Custom Hours',
        work_days: workDays,
        work_start_time: isDentist ? payload.docWorkStart : isDentalAssistant ? payload.daWorkStart : payload.recepWorkStart,
        work_end_time: isDentist ? payload.docWorkEnd : isDentalAssistant ? payload.daWorkEnd : payload.recepWorkEnd,
        ...(isDentist && enablePerDayBranch && scheduleEntries.length > 0
          ? { schedule_entries: scheduleEntries }
          : {}),
      };

      if (isDentalAssistant) {
        const requestData = buildStaffMultipartPayload({
          branch_id: branchId,
          staffProfile: { ...commonStaffProfile, staff_type: 'Dental Assistant' },
          profilePhoto,
          supportingDocuments,
        });

        await api.post('/auth/staff-profiles', requestData);
        setShowSuccessModal(true);
        return;
      }

      const staffRequestData = buildStaffMultipartPayload({
        email: payload.accessEmail || payload[`${prefix}Email`],
        name: fullName,
        role,
        home_branch_id: branchId,
        branch_ids: [
          branchId,
          ...additionalDentistBranchIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0),
        ],
        phone: payload[`${prefix}Contact`],
        password: payload.accessPassword,
        department: isDentist ? (dentistSpecializationText || null) : null,
        staffProfile: commonStaffProfile,
        profilePhoto,
        supportingDocuments,
      });

      await api.post('/auth/staff', staffRequestData);

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to create employee', err);
      setErrorModalMessage(err.response?.data?.message || 'Failed to create employee.');
      setShowErrorModal(true);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  // ─── Render helpers (plain functions, not React components) ──────────────────
  // Calling these as {renderXxx()} instead of <Xxx /> means React reconciles
  // the returned JSX as part of the parent's own tree — no component boundary,
  // no new-reference unmount/remount, so uncontrolled inputs keep their values.

  function renderSection(sectionKey, title, children) {
    const open = isSectionOpen(sectionKey);
    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <button type="button" style={styles.circleBtn} onClick={() => toggleSection(sectionKey)}>
            {open ? '−' : '+'}
          </button>
          <h2 style={styles.sectionTitle}>{title}</h2>
        </div>
        <div style={{ ...styles.content, display: open ? undefined : 'none' }}>
          {children}
        </div>
      </div>
    );
  }

  function renderProfilePhotoUpload() {
    const hasError = formErrors.has('profilePhoto');

    return (
      <div
        style={{
          ...styles.photoUploadWrap,
          ...(hasError ? { borderColor: '#dc2626', borderWidth: 2 } : {}),
        }}
      >
        <button
          type="button"
          style={{
            ...styles.photoUploadBtn,
            ...(hasError ? { borderColor: '#dc2626' } : {}),
          }}
          onClick={() => photoInputRef.current?.click()}
          title="Upload profile photo"
        >
          {profilePhotoPreview ? (
            <img src={profilePhotoPreview} alt="" style={styles.photoPreview} />
          ) : (
            <i className="fi fi-rr-user" style={styles.photoPlaceholderIcon}></i>
          )}
          <span style={styles.cameraBadge}>
            <i className="fi fi-rr-camera"></i>
          </span>
        </button>
        <div>
          <strong style={styles.photoUploadTitle}>
            Profile Photo{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
          </strong>
          <p style={styles.photoUploadHint}>JPG or PNG, max 5MB</p>
          {hasError && (
            <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
              {REQUIRED_FIELD_MESSAGE}
            </span>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png"
          style={styles.hiddenInput}
          onChange={(event) => handleProfilePhotoSelect(event.target.files?.[0])}
        />
      </div>
    );
  }

  function renderSupportingDocumentsUpload() {
    const hasError = formErrors.has('supportingDocuments');
    const errorMessage = hasError ? REQUIRED_FIELD_MESSAGE : '';

    return (
      <div style={styles.documentsWrap}>
        <label style={styles.label}>
          Supporting Documents{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
        </label>
        <div
          style={{
            ...styles.documentDropzone,
            ...(hasError ? { borderColor: '#dc2626', borderWidth: 2 } : {}),
          }}
          onClick={() => documentInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleSupportingDocumentFiles(event.dataTransfer.files);
          }}
        >
          <i className="fi fi-rr-upload" style={styles.documentUploadIcon}></i>
          <strong>Drop files here or click to upload</strong>
          <span>License, resume, or ID - PDF, JPG, PNG up to 5MB each</span>
          <input
            ref={documentInputRef}
            type="file"
            multiple
            accept="application/pdf,image/jpeg,image/png"
            style={styles.hiddenInput}
            onChange={(event) => handleSupportingDocumentFiles(event.target.files)}
          />
        </div>
        {errorMessage && (
          <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
            {errorMessage}
          </span>
        )}

        {supportingDocuments.length > 0 && (
          <div style={styles.documentList}>
            {supportingDocuments.map((file, index) => (
              <div key={`${file.name}-${file.size}-${index}`} style={styles.documentItem}>
                <i className="fi fi-rr-document" style={styles.documentIcon}></i>
                <div style={styles.documentInfo}>
                  <strong style={styles.documentName}>{file.name}</strong>
                  <span style={styles.documentMeta}>{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  style={styles.documentDeleteBtn}
                  onClick={() => removeSupportingDocument(index)}
                  title="Remove document"
                >
                  <i className="fi fi-rr-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderPersonalInfo(type, prefix) {
    const roleLabel = type === 'dentist' ? 'doctor' : type === 'dentalAssistant' ? 'da' : 'recep';

    return (
      <>
        {renderProfilePhotoUpload()}

        <div style={styles.rowThree}>
          <FieldRaw
            label="First Name:"
            name={`${prefix}FirstName`}
            onInput={(e) => {
              filterNameInput(e);
              const err = validateRequiredText(e.target.value);
              setFieldError(`${prefix}FirstName`, err);
              if (!err) clearSubmitError(`${prefix}FirstName`);
            }}
            hasError={formErrors.has(`${prefix}FirstName`) || !!fieldErrors[`${prefix}FirstName`]}
            errorMessage={getRequiredFieldMessage(`${prefix}FirstName`)}
            styles={styles}
          />
          <FieldRaw label="Middle Name:" name={`${prefix}MiddleName`} onInput={filterNameInput} styles={styles} />
          <FieldRaw
            label="Last Name:"
            name={`${prefix}LastName`}
            onInput={(e) => {
              filterNameInput(e);
              const err = validateRequiredText(e.target.value);
              setFieldError(`${prefix}LastName`, err);
              if (!err) clearSubmitError(`${prefix}LastName`);
            }}
            hasError={formErrors.has(`${prefix}LastName`) || !!fieldErrors[`${prefix}LastName`]}
            errorMessage={getRequiredFieldMessage(`${prefix}LastName`)}
            styles={styles}
          />
        </div>

        <div style={styles.rowTwo}>
          <FieldRaw label="Preferred Nickname:" name={`${prefix}Nickname`} onInput={filterNameInput} styles={styles} />

          <div style={styles.field}>
            <label style={styles.label}>Suffix:</label>
            <select
              name={`${prefix}Suffix`}
              disabled={noSuffix[type]}
              defaultValue=""
              style={{ ...styles.input, ...(noSuffix[type] ? styles.readOnlyInput : {}) }}
            >
              <option value="" disabled>Suffix</option>
              {SUFFIX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={noSuffix[type]}
                  onChange={(e) => handleNoSuffixChange(type, e)}
                  style={styles.checkboxInput}
                />
                None
              </label>
            </div>
          </div>
        </div>

        <div style={styles.rowTwo}>
          <BirthdayFieldRaw
            type={type}
            prefix={prefix}
            birthdayParts={birthdayParts}
            onPartChange={handleBirthdayPartChange}
            hasError={formErrors.has(`${prefix}Birthday`)}
            errorMessage={getRequiredFieldMessage(`${prefix}Birthday`)}
            styles={styles}
          />
          <FieldRaw label="Age:" name={`${prefix}Age`} value={ageValues[type]} onChange={() => {}} readOnly styles={styles} />
        </div>

        <div style={styles.rowTwo}>
          <GenderFieldRaw
            name={`${roleLabel}Gender`}
            hasError={formErrors.has(`${roleLabel}Gender`)}
            errorMessage={getRequiredFieldMessage(`${roleLabel}Gender`)}
            onChange={() => clearSubmitError(`${roleLabel}Gender`)}
            styles={styles}
          />
          <SelectFieldRaw
            label="Civil Status:"
            name={`${prefix}CivilStatus`}
            placeholder="Select Civil Status"
            options={CIVIL_STATUS_OPTIONS}
            styles={styles}
          />
        </div>

        <div style={styles.rowTwo}>
          <SelectFieldRaw
            label="Religion:"
            name={`${prefix}Religion`}
            placeholder="Select Religion"
            options={RELIGION_OPTIONS}
            styles={styles}
          />
          <SelectFieldRaw
            label="Nationality:"
            name={`${prefix}Nationality`}
            placeholder="Select Nationality"
            options={NATIONALITY_OPTIONS}
            styles={styles}
          />
        </div>

        <div style={styles.rowThree}>
          <FieldRaw
            label="Home Address:"
            name={`${prefix}Address`}
            onInput={(event) => clearRequiredFieldError(`${prefix}Address`, event.target.value)}
            hasError={formErrors.has(`${prefix}Address`)}
            errorMessage={getRequiredFieldMessage(`${prefix}Address`)}
            styles={styles}
          />
          <PhoneFieldRaw
            label="Contact Number:"
            name={`${prefix}Contact`}
            country={phoneCountries[`${prefix}Contact`] || 'PH'}
            onCountryChange={(countryCode) =>
              handlePhoneCountryChange(`${prefix}Contact`, countryCode)
            }
            value={phoneValues[`${prefix}Contact`] || ''}
            onChange={(phone, countryData) =>
              handlePhoneChange(`${prefix}Contact`, phone, countryData)
            }
            onBlur={() =>
              setFieldError(
                `${prefix}Contact`,
                validateContactValue(
                  phoneValues[`${prefix}Contact`] || '',
                  phoneCountries[`${prefix}Contact`] || 'PH'
                )
              )
            }
            hasError={formErrors.has(`${prefix}Contact`) || !!fieldErrors[`${prefix}Contact`]}
            errorMessage={getRequiredFieldMessage(`${prefix}Contact`)}
            styles={styles}
          />
          <FieldRaw
            label="Email Address:"
            name={`${prefix}Email`}
            type="email"
            onInput={(e) => {
              filterEmailInput(e);
              const err = validateEmailValue(e.target.value);
              setFieldError(`${prefix}Email`, err);
              if (!err) clearSubmitError(`${prefix}Email`);
              if (type !== 'dentalAssistant') setAccessEmail(e.target.value);
            }}
            hasError={formErrors.has(`${prefix}Email`) || !!fieldErrors[`${prefix}Email`]}
            errorMessage={getRequiredFieldMessage(`${prefix}Email`)}
            styles={styles}
          />
        </div>
      </>
    );
  }

  function renderAccessSection(roleValue, sectionKey) {
    return renderSection(sectionKey, 'Section 4 - Web Access',
      <>
        <div style={styles.rowTwo}>
          <FieldRaw
            label="Email Address"
            name="accessEmail"
            type="text"
            value={accessEmail}
            onChange={(e) => {
              setAccessEmail(e.target.value);
              const err = validateEmailValue(e.target.value);
              setFieldError('accessEmail', err);
              if (!err) clearSubmitError('accessEmail');
            }}
            onInput={filterEmailInput}
            hasError={formErrors.has('accessEmail') || !!fieldErrors.accessEmail}
            errorMessage={getRequiredFieldMessage('accessEmail')}
            styles={styles}
          />
          <FieldRaw
            label="Password"
            name="accessPassword"
            type="password"
            value={accessPassword}
            onChange={(e) => {
              const value = e.target.value;
              setAccessPassword(value);
              accessPasswordRef.current = value;
              const err = value ? null : REQUIRED_FIELD_MESSAGE;
              setFieldError('accessPassword', err);
              if (!err) clearSubmitError('accessPassword');
            }}
            onInput={(e) => {
              filterPasswordInput(e);
              const value = e.target.value;
              setAccessPassword(value);
              accessPasswordRef.current = value;
              const err = value ? null : REQUIRED_FIELD_MESSAGE;
              setFieldError('accessPassword', err);
              if (!err) clearSubmitError('accessPassword');
            }}
            hasError={formErrors.has('accessPassword') || !!fieldErrors.accessPassword}
            errorMessage={getRequiredFieldMessage('accessPassword')}
            styles={styles}
          />
        </div>
        <div style={styles.rowTwo}>
          <FieldRaw label="Access Role" name="accessRole" value={roleValue} onChange={() => {}} readOnly styles={styles} />
          <FieldRaw
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              const val = e.target.value;
              setConfirmPassword(val);
              let err = null;
              if (!val) err = REQUIRED_FIELD_MESSAGE;
              else if (val !== accessPassword) err = 'Passwords do not match';
              setFieldError('confirmPassword', err);
              if (!err) clearSubmitError('confirmPassword');
            }}
            onInput={(e) => {
              filterPasswordInput(e);
              const val = e.target.value;
              setConfirmPassword(val);
              let err = null;
              if (!val) err = REQUIRED_FIELD_MESSAGE;
              else if (val !== accessPassword) err = 'Passwords do not match';
              setFieldError('confirmPassword', err);
              if (!err) clearSubmitError('confirmPassword');
            }}
            hasError={formErrors.has('confirmPassword') || !!fieldErrors.confirmPassword}
            errorMessage={getRequiredFieldMessage('confirmPassword')}
            styles={styles}
          />
        </div>
      </>
    );
  }

  function renderDoctorWorkExp(item, isFirst, onRemove) {
    return (
      <div style={styles.workItem}>
        {!isFirst && (
          <div style={styles.workItemHeader}>
            <h3 style={{ ...styles.subTitle, margin: 0 }}>Another Previous Work</h3>
            <button type="button" style={styles.removeWorkBtn} onClick={onRemove} aria-label="Remove">×</button>
          </div>
        )}
        <div style={styles.rowTwo}>
          <FieldRaw label="Clinic / Hospital Name:" name="prevName[]" onInput={filterProfessionalTextInput} styles={styles} />
          <FieldRaw label="Clinic / Hospital Address:" name="prevAddress[]" styles={styles} />
        </div>
        <div style={styles.rowTwo}>
          <FieldRaw label="Specialization:" name="prevClinicSpecialization[]" onInput={filterProfessionalTextInput} styles={styles} />
          <DurationFieldRaw startName="docPrevClinicStart[]" endName="docPClinicEnd[]" styles={styles} />
        </div>
        <div style={styles.rowTwo}>
          <FieldRaw label="Reason for Leaving:" name="prevClinicReason[]" onInput={filterProfessionalTextInput} styles={styles} />
        </div>
      </div>
    );
  }

  function renderAssistantWorkExp(item, isFirst, onRemove) {
    return (
      <div style={styles.workItem}>
        {!isFirst && (
          <div style={styles.workItemHeader}>
            <h3 style={{ ...styles.subTitle, margin: 0 }}>Another Previous Work</h3>
            <button type="button" style={styles.removeWorkBtn} onClick={onRemove} aria-label="Remove">×</button>
          </div>
        )}
        <div style={styles.rowTwo}>
          <FieldRaw label="Clinic Name" name="daPrevName[]" styles={styles} />
          <FieldRaw label="Clinic Address" name="daPrevAddress[]" styles={styles} />
        </div>
        <div style={styles.rowTwo}>
          <FieldRaw label="Position" name="daPrevPosition[]" styles={styles} />
          <DurationFieldRaw startName="daPrevStart[]" endName="daPrevEnd[]" styles={styles} />
        </div>
      </div>
    );
  }

  function renderReceptionistWorkExp(item, isFirst, onRemove) {
    return (
      <div style={styles.workItem}>
        {!isFirst && (
          <div style={styles.workItemHeader}>
            <h3 style={{ ...styles.subTitle, margin: 0 }}>Another Previous Work</h3>
            <button type="button" style={styles.removeWorkBtn} onClick={onRemove} aria-label="Remove">×</button>
          </div>
        )}
        <div style={styles.rowTwo}>
          <FieldRaw label="Company / Clinic Name" name="prevName[]" styles={styles} />
          <FieldRaw label="Company / Clinic Address" name="prevAddress[]" styles={styles} />
        </div>
        <div style={styles.rowTwo}>
          <FieldRaw label="Position" name="prevPosition[]" styles={styles} />
          <DurationFieldRaw startName="recepPrevClinicStart[]" endName="recepPClinicEnd[]" styles={styles} />
        </div>
        <div style={styles.rowTwo}>
          <FieldRaw label="Job Responsibilities" name="prevResponsibilities[]" styles={styles} />
          <FieldRaw label="Reason for Leaving" name="prevReason[]" styles={styles} />
        </div>
      </div>
    );
  }

  function renderBranchSelect() {
    const hasError = formErrors.has('branchId');
    return (
      <div style={styles.field}>
        <label style={styles.label}>
          Assigned Branch{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
        </label>
        <select
          name="branchId"
          required
          value={selectedBranchId}
          onChange={(e) => {
            setSelectedBranchId(e.target.value);
            setAdditionalDentistBranchIds((prev) =>
              (Array.isArray(prev) ? prev : []).filter((branchId) => String(branchId) !== String(e.target.value))
            );
            if (e.target.value) setFormErrors((prev) => { const n = new Set(prev); n.delete('branchId'); return n; });
          }}
          style={{ ...styles.input, ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}) }}
        >
          <option value="">
            {branchesLoading ? 'Loading branches…' : branchOptions.length === 0 ? 'No branches found' : 'Select branch'}
          </option>
          {branchOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasError && (
          <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
            {REQUIRED_FIELD_MESSAGE}
          </span>
        )}
      </div>
    );
  }

  function toggleAdditionalDentistBranch(value, checked) {
    setAdditionalDentistBranchIds((prev) => {
      const next = new Set(Array.isArray(prev) ? prev : []);
      if (checked) next.add(String(value));
      else next.delete(String(value));
      return Array.from(next);
    });
  }

  function renderAdditionalDentistBranches() {
    if (employeeType !== 'dentist') return null;

    return (
      <div style={styles.field}>
        <label style={styles.label}>Also Dentist In Branches (Optional)</label>
        <div style={styles.scheduleGrid}>
          {!selectedBranchId ? (
            <span style={{ color: '#64748b', fontSize: 14 }}>Select assigned branch first</span>
          ) : additionalBranchOptions.length === 0 ? (
            <span style={{ color: '#64748b', fontSize: 14 }}>No other branches available</span>
          ) : (
            additionalBranchOptions.map((option) => (
              <label key={option.value} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={additionalDentistBranchIds.includes(String(option.value))}
                  onChange={(event) =>
                    toggleAdditionalDentistBranch(option.value, event.target.checked)
                  }
                  style={styles.checkboxInput}
                />
                {option.label}
              </label>
            ))
          )}
        </div>
        <p style={{ margin: '6px 0 0', color: '#6f675b', fontSize: 12 }}>
          These branches show the dentist as part of the branch, but does not create appointment availability.
        </p>
      </div>
    );
  }

  function toggleDentistSpecialization(value, checked) {
    setSelectedDentistSpecializations((prev) => {
      const next = new Set(Array.isArray(prev) ? prev : []);
      if (checked) next.add(value);
      else next.delete(value);
      return Array.from(next);
    });

    if (checked) {
      setFormErrors((prev) => {
        const next = new Set(prev);
        next.delete('department');
        return next;
      });
    }
  }

  function renderDentistSpecializationSelect() {
    const hasError = formErrors.has('department');
    const disabled = !selectedBranchId || specializationsLoading || specializationOptions.length === 0;

    return (
      <div style={styles.field}>
        <label style={styles.label}>
          Specialization / Department
          {hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
        </label>
        <div
          style={{
            ...styles.scheduleGrid,
            borderColor: hasError ? '#dc2626' : '#d9e2ef',
            borderWidth: hasError ? 2 : 1,
            opacity: disabled ? 0.65 : 1,
          }}
        >
          {disabled ? (
            <span style={{ color: '#64748b', fontSize: 14 }}>
              {!selectedBranchId
                ? 'Select a branch first'
                : specializationsLoading
                  ? 'Loading...'
                  : 'No categories found'}
            </span>
          ) : (
            specializationOptions.map((option) => {
              const value = option.value ?? option;
              const label = option.label ?? option;
              return (
                <label key={value} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedDentistSpecializations.includes(value)}
                    onChange={(event) =>
                      toggleDentistSpecialization(value, event.target.checked)
                    }
                    style={styles.checkboxInput}
                  />
                  {label}
                </label>
              );
            })
          )}
        </div>
        {hasError && (
          <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
            {REQUIRED_FIELD_MESSAGE}
          </span>
        )}
        {selectedDentistSpecializations.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {selectedDentistSpecializations.map((specialization) => (
              <span
                key={specialization}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: '#fff8e1',
                  border: '1px solid #d4af37',
                  color: '#7a5700',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {specialization}
                <button
                  type="button"
                  onClick={() => toggleDentistSpecialization(specialization, false)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: '#7a5700',
                    cursor: 'pointer',
                    fontWeight: 800,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  aria-label={`Remove ${specialization}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderDentistForm() {
    return (
      <div style={styles.formSection}>
        {renderSection('docPersonal', 'Section 1 - Personal Information',
          renderPersonalInfo('dentist', 'doctor')
        )}

        {renderSection('docProfessional', 'Section 2 - Professional Information',
          <>
            <div style={styles.rowTwo}>
              <FieldRaw
                label="Medical Degree"
                name="medicalDegree"
                onInput={(event) => {
                  filterProfessionalTextInput(event);
                  clearRequiredFieldError('medicalDegree', event.target.value);
                }}
                hasError={formErrors.has('medicalDegree')}
                errorMessage={getRequiredFieldMessage('medicalDegree')}
                styles={styles}
              />
              <FieldRaw
                label="Medical License Number"
                name="licenseNumber"
                onInput={(event) => clearRequiredFieldError('licenseNumber', event.target.value)}
                hasError={formErrors.has('licenseNumber')}
                errorMessage={getRequiredFieldMessage('licenseNumber')}
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw
                label="Years of Experience"
                name="experienceYears"
                type="number"
                min="0"
                onChange={(e) => {
                  const err = validateRequiredText(e.target.value) || validatePositiveNumber(e.target.value);
                  setFieldError('experienceYears', err);
                  if (!err) clearSubmitError('experienceYears');
                }}
                hasError={formErrors.has('experienceYears') || !!fieldErrors.experienceYears}
                errorMessage={getRequiredFieldMessage('experienceYears')}
                styles={styles}
              />
              <div />
            </div>

            {renderSupportingDocumentsUpload()}

            <h3 style={styles.subTitle}>Previous Work</h3>
            {doctorWorkItems.map((item, index) => (
              <Fragment key={item.id}>
                {renderDoctorWorkExp(item, index === 0, () => removeDoctorWorkItem(item.id))}
              </Fragment>
            ))}
            <div style={styles.addWork}>
              <button type="button" style={styles.addWorkBtn} onClick={addDoctorWorkExperience}>
                Add Work Experience
              </button>
            </div>
          </>
        )}

        {renderSection('docWork', 'Section 3 - Work Details',
          <>
            <div style={styles.rowTwo}>
              {renderBranchSelect()}
              {renderAdditionalDentistBranches()}
            </div>
            <div style={styles.rowTwo}>
              {renderDentistSpecializationSelect()}
              <FieldRaw
                label="Start Date"
                name="startDate"
                type="date"
                min={today}
                onChange={(event) => clearRequiredFieldError('startDate', event.target.value)}
                hasError={formErrors.has('startDate')}
                errorMessage={getRequiredFieldMessage('startDate')}
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <SelectFieldRaw
                label="Employment Type"
                name="employmentType"
                placeholder="Select Type"
                options={EMPLOYMENT_TYPES}
                onChange={(event) => clearRequiredFieldError('employmentType', event.target.value)}
                hasError={formErrors.has('employmentType')}
                errorMessage={getRequiredFieldMessage('employmentType')}
                styles={styles}
              />
              <SelectFieldRaw
                label="Shift Type"
                name="shiftType"
                placeholder="Select Type"
                options={['By Appointment']}
                onChange={(event) => clearRequiredFieldError('shiftType', event.target.value)}
                hasError={formErrors.has('shiftType')}
                errorMessage={getRequiredFieldMessage('shiftType')}
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <ScheduleFieldRaw
                name="schedule[]"
                dayOptions={DAY_OPTIONS}
                styles={styles}
                checkedValues={dentistWorkDays}
                onToggle={(day, checked) => {
                  setDentistWorkDays((prev) => {
                    const next = new Set(Array.isArray(prev) ? prev : []);
                    if (checked) next.add(day);
                    else next.delete(day);
                    return Array.from(next);
                  });
                  if (checked && enablePerDayBranch) {
                    ensureDentistScheduleBlock(day);
                  } else if (!checked) {
                    removeDentistScheduleDay(day);
                  }
                }}
              />
              <TimeRangeFieldRaw
                startName="docWorkStart"
                endName="docWorkEnd"
                startValue={docWorkStart}
                endValue={docWorkEnd}
                onStartChange={(value) => {
                  setDocWorkStart(value);
                  updateDentistScheduleBlockTime('start_time', value);
                  if (value) {
                    setFormErrors((prev) => {
                      const next = new Set(prev);
                      next.delete('docWorkStart');
                      return next;
                    });
                  }
                }}
                onEndChange={(value) => {
                  setDocWorkEnd(value);
                  updateDentistScheduleBlockTime('end_time', value);
                  if (value) {
                    setFormErrors((prev) => {
                      const next = new Set(prev);
                      next.delete('docWorkEnd');
                      return next;
                    });
                  }
                }}
                hasError={formErrors.has('docWorkStart') || formErrors.has('docWorkEnd')}
                errorMessage={
                  formErrors.has('docWorkStart') || formErrors.has('docWorkEnd')
                    ? REQUIRED_FIELD_MESSAGE
                    : ''
                }
                styles={styles}
              />
            </div>

            <div style={styles.rowTwo}>
              <div style={styles.field}>
                <label style={styles.label}>Multiple Branch Schedule (Optional)</label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={enablePerDayBranch}
                    disabled={!canUsePerDayBranchSchedule}
                    onChange={(e) => {
                      if (!canUsePerDayBranchSchedule) return;
                      setEnablePerDayBranch(e.target.checked);
                      if (e.target.checked) {
                        dentistWorkDays.forEach((day) => ensureDentistScheduleBlock(day));
                      }
                    }}
                    style={styles.checkboxInput}
                  />
                  Allow branch time blocks per selected day
                </label>
                {!canUsePerDayBranchSchedule && (
                  <p style={{ margin: '6px 0 0', color: '#8b6508', fontSize: 12, fontWeight: 700 }}>
                    Select another branch in "Also Dentist In Branches" to enable this.
                  </p>
                )}
              </div>
              <div />
            </div>

            {enablePerDayBranch && (
              <div style={styles.field}>
                <label style={styles.label}>Branch Schedule Blocks</label>
                <p style={{ margin: '6px 0 12px', color: '#6f675b', fontSize: 12 }}>
                  A dentist can be assigned to more than one branch on the same day, as long as the times do not overlap.
                </p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {dentistWorkDays.length === 0 && (
                    <p style={{ margin: 0, color: '#8b6508', fontSize: 13, fontWeight: 700 }}>
                      Select work schedule days first.
                    </p>
                  )}

                  {dentistWorkDays.map((day) => {
                    const blocks = Array.isArray(dentistScheduleBlocks?.[day])
                      ? dentistScheduleBlocks[day]
                      : [];
                    const visibleBlocks = blocks.length > 0
                      ? blocks
                      : [createDentistScheduleBlock(day)];

                    return (
                      <div key={day} style={{ display: 'grid', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontWeight: 700, color: '#8b6508' }}>{day}</span>
                          <button
                            type="button"
                            style={{
                              ...styles.addWorkBtn,
                              width: 86,
                              height: 42,
                              padding: '10px 12px',
                            }}
                            onClick={() => addDentistScheduleBlock(day)}
                          >
                            Add Branch
                          </button>
                        </div>

                        {visibleBlocks.map((block) => (
                          <div
                            key={block.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isSmallScreen ? '1fr' : '1.5fr 1fr 1fr auto',
                              gap: 10,
                              alignItems: 'center',
                            }}
                          >
                            <select
                              value={block.branch_id || ''}
                              onChange={(event) =>
                                updateDentistScheduleBlock(day, block.id, 'branch_id', event.target.value)
                              }
                              style={styles.input}
                            >
                              <option value="" disabled>
                                Select branch
                              </option>
                              {allowedScheduleBranchOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>

                            <select
                              value={block.start_time || ''}
                              onChange={(event) =>
                                updateDentistScheduleBlock(day, block.id, 'start_time', event.target.value)
                              }
                              style={styles.input}
                            >
                              <option value="" disabled>Start time</option>
                              {timeSlots.map((slot) => (
                                <option key={slot.value} value={slot.value}>{slot.label}</option>
                              ))}
                            </select>

                            <select
                              value={block.end_time || ''}
                              onChange={(event) =>
                                updateDentistScheduleBlock(day, block.id, 'end_time', event.target.value)
                              }
                              style={styles.input}
                            >
                              <option value="" disabled>End time</option>
                              {timeSlots.map((slot) => (
                                <option key={slot.value} value={slot.value}>{slot.label}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              style={styles.removeWorkBtn}
                              onClick={() => removeDentistScheduleBlock(day, block.id)}
                              disabled={visibleBlocks.length === 1}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {renderAccessSection('Dentist', 'docAccess')}
      </div>
    );
  }

  function renderDentalAssistantForm() {
    return (
      <div style={styles.formSection}>
        {renderSection('daPersonal', 'Section 1 - Personal Information',
          renderPersonalInfo('dentalAssistant', 'da')
        )}

        {renderSection('daProfessional', 'Section 2 - Professional Information',
          <>
            <div style={styles.rowTwo}>
              <FieldRaw label="Position" name="daPosition" value="Dental Assistant" onChange={() => {}} readOnly styles={styles} />
              <FieldRaw
                label="Years of Experience"
                name="daExperienceYears"
                type="number"
                min="0"
                onChange={(e) => {
                  const err = validateRequiredText(e.target.value) || validatePositiveNumber(e.target.value);
                  setFieldError('daExperienceYears', err);
                  if (!err) clearSubmitError('daExperienceYears');
                }}
                hasError={formErrors.has('daExperienceYears') || !!fieldErrors.daExperienceYears}
                errorMessage={getRequiredFieldMessage('daExperienceYears')}
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Skills" name="daSkills" styles={styles} />
            </div>

            {renderSupportingDocumentsUpload()}

            <h3 style={styles.subTitle}>Previous Work</h3>
            {assistantWorkItems.map((item, index) => (
              <Fragment key={item.id}>
                {renderAssistantWorkExp(item, index === 0, () => removeAssistantWorkItem(item.id))}
              </Fragment>
            ))}
            <div style={styles.addWork}>
              <button type="button" style={styles.addWorkBtn} onClick={addAssistantWorkExperience}>
                Add Work Experience
              </button>
            </div>
          </>
        )}

        {renderSection('daWork', 'Section 3 - Work Details',
          <>
            <div style={styles.rowTwo}>
              {renderBranchSelect()}
            </div>
            <div style={styles.rowTwo}>
              <ScheduleFieldRaw name="schedule[]" dayOptions={DAY_OPTIONS} styles={styles} />
              <TimeRangeFieldRaw
                startName="daWorkStart"
                endName="daWorkEnd"
                startValue={daWorkStart}
                endValue={daWorkEnd}
                onStartChange={(value) => {
                  setDaWorkStart(value);
                  if (value) clearSubmitError('daWorkStart');
                }}
                onEndChange={(value) => {
                  setDaWorkEnd(value);
                  if (value) clearSubmitError('daWorkEnd');
                }}
                disabled={daShiftType === 'Full Day'}
                hasError={formErrors.has('daWorkStart') || formErrors.has('daWorkEnd')}
                errorMessage={
                  formErrors.has('daWorkStart') || formErrors.has('daWorkEnd')
                    ? REQUIRED_FIELD_MESSAGE
                    : ''
                }
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <SelectFieldRaw
                label="Department"
                name="daDepartment"
                placeholder={
                  !selectedBranchId
                    ? 'Select a branch first'
                    : specializationsLoading
                      ? 'Loading…'
                      : 'Select department'
                }
                options={specializationOptions}
                disabled={!selectedBranchId || specializationsLoading}
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  if (e.target.value) setFormErrors((prev) => { const n = new Set(prev); n.delete('daDepartment'); return n; });
                }}
                hasError={formErrors.has('daDepartment')}
                errorMessage={getRequiredFieldMessage('daDepartment')}
                styles={styles}
              />
              <SelectFieldRaw label="Assigned Dentist" name="daAssignedDentist" placeholder="Select Dentist" options={dentistOptions} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw
                label="Start Date"
                name="daStartDate"
                type="date"
                min={today}
                onChange={(event) => clearRequiredFieldError('daStartDate', event.target.value)}
                hasError={formErrors.has('daStartDate')}
                errorMessage={getRequiredFieldMessage('daStartDate')}
                styles={styles}
              />
              <SelectFieldRaw
                label="Employment Type"
                name="daEmploymentType"
                placeholder="Select Type"
                options={EMPLOYMENT_TYPES}
                onChange={(event) => clearRequiredFieldError('daEmploymentType', event.target.value)}
                hasError={formErrors.has('daEmploymentType')}
                errorMessage={getRequiredFieldMessage('daEmploymentType')}
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <SelectFieldRaw
                label="Shift Type"
                name="daShiftType"
                placeholder="Select Type"
                options={STAFF_SHIFT_TYPES}
                value={daShiftType}
                onChange={(event) => {
                  const value = event.target.value;
                  setDaShiftType(value);
                  if (value) {
                    setFormErrors((prev) => {
                      const next = new Set(prev);
                      next.delete('daShiftType');
                      return next;
                    });
                  }
                  if (value === 'Full Day' && selectedBranchHours) {
                    setDaWorkStart(selectedBranchHours.start);
                    setDaWorkEnd(selectedBranchHours.end);
                  }
                }}
                hasError={formErrors.has('daShiftType')}
                errorMessage={getRequiredFieldMessage('daShiftType')}
                styles={styles}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  function renderReceptionistForm() {
    return (
      <div style={styles.formSection}>
        {renderSection('recPersonal', 'Section 1 - Personal Information',
          renderPersonalInfo('receptionist', 'recep')
        )}

        {renderSection('recPosition', 'Section 2 - Professional Information',
          <>
            <div style={styles.rowTwo}>
              <FieldRaw label="Position" name="recepPosition" value="Receptionist" onChange={() => {}} readOnly styles={styles} />
              <FieldRaw
                label="Years of Experience"
                name="recepExperienceYears"
                type="number"
                min="0"
                onChange={(e) => {
                  const err = validatePositiveNumber(e.target.value);
                  setFieldError('recepExperienceYears', err);
                }}
                hasError={!!fieldErrors.recepExperienceYears}
                errorMessage={fieldErrors.recepExperienceYears}
                styles={styles}
              />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Skills" name="recepSkills" styles={styles} />
            </div>

            {renderSupportingDocumentsUpload()}

            <h3 style={styles.subTitle}>Previous Work</h3>
            {receptionistWorkItems.map((item, index) => (
              <Fragment key={item.id}>
                {renderReceptionistWorkExp(item, index === 0, () => removeReceptionistWorkItem(item.id))}
              </Fragment>
            ))}
            <div style={styles.addWork}>
              <button type="button" style={styles.addWorkBtn} onClick={addReceptionistWorkExperience}>
                Add Work Experience
              </button>
            </div>
          </>
        )}

        {renderSection('recWork', 'Section 3 - Work Details',
          <>
            <div style={styles.rowTwo}>
              {renderBranchSelect()}
            </div>
            <div style={styles.rowTwo}>
              <ScheduleFieldRaw name="schedule[]" dayOptions={DAY_OPTIONS} styles={styles} />
              <div style={styles.field}>
                <label style={styles.label}>Working Hours</label>
                <label
                  style={{
                    ...styles.checkboxLabel,
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '11px 13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 12,
                    background: '#f8fafc',
                    minHeight: 43,
                    boxSizing: 'border-box',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={recepUseStandardHours}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setRecepUseStandardHours(checked);
                      setRecepShiftType(checked ? 'Full Day' : 'Custom Hours');
                      if (checked) {
                        setRecepWorkStart(standardReceptionistHours.start);
                        setRecepWorkEnd(standardReceptionistHours.end);
                        setFormErrors((prev) => {
                          const next = new Set(prev);
                          next.delete('recepWorkStart');
                          next.delete('recepWorkEnd');
                          return next;
                        });
                      } else {
                        setRecepWorkStart('');
                        setRecepWorkEnd('');
                      }
                    }}
                    style={{ ...styles.checkboxInput, marginTop: 2 }}
                  />
                  <span style={{ lineHeight: 1.35 }}>
                    Use Standard Working Hours ({standardReceptionistHoursLabel})
                  </span>
                </label>
                {recepUseStandardHours && (
                  <>
                    <input type="hidden" name="recepShiftType" value="Full Day" readOnly />
                    <input type="hidden" name="recepWorkStart" value={standardReceptionistHours.start} readOnly />
                    <input type="hidden" name="recepWorkEnd" value={standardReceptionistHours.end} readOnly />
                  </>
                )}
                {!recepUseStandardHours && (
                  <>
                    <input type="hidden" name="recepShiftType" value="Custom Hours" readOnly />
                    <div style={styles.timeGroup}>
                      <select
                        name="recepWorkStart"
                        value={recepWorkStart}
                        onChange={(event) => {
                          setRecepWorkStart(event.target.value);
                          if (event.target.value) {
                            setFormErrors((prev) => {
                              const next = new Set(prev);
                              next.delete('recepWorkStart');
                              return next;
                            });
                          }
                        }}
                        style={{
                          ...styles.input,
                          ...(formErrors.has('recepWorkStart') ? { borderColor: '#dc2626', borderWidth: '2px' } : {}),
                        }}
                      >
                        <option value="" disabled>Start time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                      <span style={styles.separator}>to</span>
                      <select
                        name="recepWorkEnd"
                        value={recepWorkEnd}
                        onChange={(event) => {
                          setRecepWorkEnd(event.target.value);
                          if (event.target.value) {
                            setFormErrors((prev) => {
                              const next = new Set(prev);
                              next.delete('recepWorkEnd');
                              return next;
                            });
                          }
                        }}
                        style={{
                          ...styles.input,
                          ...(formErrors.has('recepWorkEnd') ? { borderColor: '#dc2626', borderWidth: '2px' } : {}),
                        }}
                      >
                        <option value="" disabled>End time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                    </div>
                    {(formErrors.has('recepWorkStart') || formErrors.has('recepWorkEnd')) && (
                      <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                        {REQUIRED_FIELD_MESSAGE}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw
                label="Start Date"
                name="startDate"
                type="date"
                min={today}
                onChange={(event) => clearRequiredFieldError('startDate', event.target.value)}
                hasError={formErrors.has('startDate')}
                errorMessage={getRequiredFieldMessage('startDate')}
                styles={styles}
              />
              <SelectFieldRaw
                label="Employment Type"
                name="employmentType"
                placeholder="Select Type"
                options={EMPLOYMENT_TYPES}
                onChange={(event) => clearRequiredFieldError('employmentType', event.target.value)}
                hasError={formErrors.has('employmentType')}
                errorMessage={getRequiredFieldMessage('employmentType')}
                styles={styles}
              />
            </div>
          </>
        )}

        {renderAccessSection('Receptionist', 'recAccess')}
      </div>
    );
  }

  function getErrorModalTitle() {
    if (errorModalMessage === 'Email already in use') {
      return 'Email Address Already In Use';
    }

    if (errorModalMessage === 'Please upload an employee photo.') {
      return 'Employee Photo Required';
    }

    if (errorModalMessage === 'Please upload supporting documents.') {
      return 'Supporting Documents Required';
    }

    if (errorModalMessage === 'Only up to 5MB per file is allowed.') {
      return 'File Too Large';
    }

    if (errorModalMessage === 'Unsupported file format. Please upload a PDF, JPG, JPEG, or PNG file only.') {
      return 'Upload Failed';
    }

    return 'Incomplete Form';
  }

  function shouldShowErrorModalMessage() {
    return errorModalMessage !== 'Email already in use';
  }

  function shouldShowErrorModalTitle() {
    return errorModalMessage !== 'Please fix the highlighted errors before submitting.';
  }

  // ─── Page render ──────────────────────────────────────────────────────────

  return (
    <main style={styles.pageWrapper}>
      <form style={styles.employeeForm} onSubmit={handleSubmit}>
        <div style={styles.container}>
          <div style={styles.header}>
            <button type="button" style={styles.backBtn} onClick={handleBackClick} aria-label="Go back">Back</button>
            <h2 style={styles.headerTitle}>Clinic Employee Form</h2>
            <p style={styles.headerText}>Complete the required details for the employee records.</p>
          </div>

          <div style={styles.radioGroup}>
            {['dentist', 'dentalAssistant', 'receptionist'].map((type) => (
              <label key={type} style={styles.employeeTypeLabel}>
                <input
                  type="radio"
                  name="employeeType"
                  value={type}
                  checked={employeeType === type}
                  onChange={handleEmployeeTypeChange}
                  style={styles.radioInput}
                />
                {type === 'dentist' ? 'Dentist' : type === 'dentalAssistant' ? 'Dental Assistant' : 'Receptionist'}
              </label>
            ))}
          </div>

          {!employeeType && (
            <div style={styles.emptyState}>Select an employee type to show the form.</div>
          )}

          {employeeType === 'dentist' && renderDentistForm()}
          {employeeType === 'dentalAssistant' && renderDentalAssistantForm()}
          {employeeType === 'receptionist' && renderReceptionistForm()}

          {employeeType && (
            <div style={styles.formSubmit}>
              <button type="submit" style={styles.submitBtn}>Submit</button>
            </div>
          )}
        </div>
      </form>

      {showBackModal && (
        <div style={styles.modal} onClick={handleModalOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-users-alt" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Leave Employee Form</h2>
            <p style={styles.modalText}>
              Are you sure you want to go back? Any unsaved changes to this employee form will be lost.
            </p>
            <div style={styles.modalActions}>
              <button type="button" style={{ ...styles.modalButton, ...styles.cancelBtn }} onClick={closeBackModal}>No</button>
              <button type="button" style={{ ...styles.modalButton, ...styles.confirmBtn }} onClick={confirmBack}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, background: '#dcfce7', color: '#16a34a' }}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Employee Created!</h2>
            <p style={styles.modalText}>
              The employee record has been successfully saved.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, background: '#16a34a', color: '#ffffff' }}
                onClick={() => navigate('/adminEmployees')}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, background: '#fee2e2', color: '#dc2626' }}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>
            {shouldShowErrorModalTitle() && <h2 style={styles.modalTitle}>{getErrorModalTitle()}</h2>}
            {shouldShowErrorModalMessage() && <p style={styles.modalText}>{errorModalMessage}</p>}
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, background: '#dc2626', color: '#ffffff' }}
                onClick={() => setShowErrorModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

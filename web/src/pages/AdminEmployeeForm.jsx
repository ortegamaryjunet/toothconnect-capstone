import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const DENTIST_SPECIALIZATIONS = [
  'General Dentistry', 'Orthodontics', 'Endodontics', 'Periodontics',
  'Prosthodontics', 'Pediatric Dentistry', 'Oral Surgery', 'Cosmetic Dentistry',
  'Implant Dentistry', 'Radiology',
];

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

// Digits and a leading + only; max 13 chars for PH phone (+639XXXXXXXXX / 09XXXXXXXXX)
function filterContactInput(event) {
  const el = event.target;
  let val = el.value.replace(/[^0-9+]/g, '');
  // Keep + only at position 0
  val = val.replace(/(.)\+/g, '$1');
  if (val.length > 13) val = val.slice(0, 13);
  if (val !== el.value) el.value = val;
}

// Standard email characters only
const filterEmailInput = makeInputFilter(/[^a-zA-Z0-9._%+\-@]/g);

// Letters and numbers only (password fields)
const filterPasswordInput = makeInputFilter(/[^a-zA-Z0-9]/g);

// Letters and common punctuation — no digits (professional text fields)
const filterProfessionalTextInput = makeInputFilter(/[^a-zA-ZÀ-ÿ\s'\-.,()&/:]/g);

// ─── Primitive field components (stable module-level references) ──────────────

function FieldRaw({ label, name, type = 'text', readOnly = false, value, onChange, placeholder, required = false, min, onInput, maxLength, hasError = false, styles }) {
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
    </div>
  );
}

function SelectFieldRaw({ label, name, options, placeholder, disabled = false, required = false, value, onChange, hasError = false, styles }) {
  const controlled = value !== undefined && onChange !== undefined;
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <select
        name={name}
        disabled={disabled}
        required={required}
        {...(controlled ? { value, onChange } : { defaultValue: '' })}
        style={{ ...styles.input, ...(disabled ? styles.readOnlyInput : {}), ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}) }}
      >
        <option value="" disabled={controlled}>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}

function GenderFieldRaw({ name, hasError = false, styles }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        Gender:{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ ...styles.radioInlineGroup, ...(hasError ? { border: '2px solid #dc2626', borderRadius: 12, padding: '6px 10px' } : {}) }}>
        <label style={styles.radioLabel}>
          <input type="radio" name={name} value="Female" style={styles.radioInput} />
          Female
        </label>
        <label style={styles.radioLabel}>
          <input type="radio" name={name} value="Male" style={styles.radioInput} />
          Male
        </label>
      </div>
    </div>
  );
}

function ScheduleFieldRaw({ name, dayOptions, styles }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>Work Schedule Days</label>
      <div style={styles.scheduleGrid}>
        {dayOptions.map((day) => (
          <label key={day} style={styles.checkboxLabel}>
            <input type="checkbox" name={name} value={day} style={styles.checkboxInput} />
            {day}
          </label>
        ))}
      </div>
    </div>
  );
}

function TimeRangeFieldRaw({ startName, endName, styles }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>Working Hours</label>
      <div style={styles.timeGroup}>
        <select name={startName} defaultValue="" style={styles.input}>
          <option value="" disabled>Start time</option>
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>{slot.label}</option>
          ))}
        </select>
        <span style={styles.separator}>to</span>
        <select name={endName} defaultValue="" style={styles.input}>
          <option value="" disabled>End time</option>
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>{slot.label}</option>
          ))}
        </select>
      </div>
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

function BirthdayFieldRaw({ type, prefix, birthdayParts, onPartChange, hasError = false, styles }) {
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
  const [formErrors, setFormErrors] = useState(new Set());
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

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

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1100;
  const isSmallScreen = screenWidth <= 1100;

  const styles = createAdminEmployeeFormStyles({ isMobile, isTablet, isSmallScreen });

  const branchOptions = branches.map((branch) => ({
    value: String(branch.id),
    label: branch.address ? `${branch.name} - ${branch.address}` : branch.name,
  }));

  const dentistOptions = dentists.length > 0 ? dentists : [];
  const specializationOptions =
    selectedBranchId && branchSpecializationOptions.length > 0
      ? branchSpecializationOptions
      : serviceCategories.length > 0
        ? serviceCategories
        : DENTIST_SPECIALIZATIONS;

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
    setSelectedBranchId('');
    setSelectedSpecialization('');
  }, [employeeType]);

  useEffect(() => {
    setSelectedSpecialization('');
    if (!selectedBranchId) {
      setBranchSpecializationOptions([]);
      return;
    }
    let cancelled = false;
    setSpecializationsLoading(true);
    api.get(`/auth/branch-services/${selectedBranchId}`)
      .then((res) => {
        if (!cancelled) setBranchSpecializationOptions(res.data.categories || []);
      })
      .catch(() => {
        if (!cancelled) setBranchSpecializationOptions([]);
      })
      .finally(() => {
        if (!cancelled) setSpecializationsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedBranchId]);

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
    }
  }

  function handleEmployeeTypeChange(event) {
    setEmployeeType(event.target.value);
    setOpenSections({});
    setFormErrors(new Set());
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

  function validateRequiredFields(formData) {
    const prefix = employeeType === 'dentist' ? 'doctor'
      : employeeType === 'dentalAssistant' ? 'da' : 'recep';
    const errors = new Set();
    [`${prefix}FirstName`, `${prefix}LastName`, `${prefix}Address`,
      `${prefix}Contact`, `${prefix}Email`, `${prefix}Birthday`, `${prefix}Gender`]
      .forEach((name) => { if (!formData.get(name)) errors.add(name); });
    if (!selectedBranchId) errors.add('branchId');
    if (employeeType === 'dentist') {
      if (!selectedSpecialization) errors.add('department');
      ['startDate', 'employmentType', 'shiftType'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
    } else if (employeeType === 'dentalAssistant') {
      if (!selectedSpecialization) errors.add('daDepartment');
      ['daStartDate', 'daEmploymentType', 'daShiftType'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
    } else {
      ['startDate', 'employmentType', 'recepShiftType'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
    }
    if (employeeType !== 'dentalAssistant') {
      ['accessEmail', 'accessPassword', 'confirmPassword'].forEach((n) => { if (!formData.get(n)) errors.add(n); });
    }
    return errors;
  }

  function getSectionsWithErrors(errors) {
    const prefix = employeeType === 'dentist' ? 'doctor'
      : employeeType === 'dentalAssistant' ? 'da' : 'recep';
    const sec1 = [`${prefix}FirstName`, `${prefix}LastName`, `${prefix}Address`,
      `${prefix}Contact`, `${prefix}Email`, `${prefix}Birthday`, `${prefix}Gender`];
    const sec3 = employeeType === 'dentist'
      ? ['branchId', 'department', 'startDate', 'employmentType', 'shiftType']
      : employeeType === 'dentalAssistant'
        ? ['branchId', 'daDepartment', 'daStartDate', 'daEmploymentType', 'daShiftType']
        : ['branchId', 'startDate', 'employmentType', 'recepShiftType'];
    const sec4 = ['accessEmail', 'accessPassword', 'confirmPassword'];
    const maps = {
      dentist: { docPersonal: sec1, docWork: sec3, docAccess: sec4 },
      dentalAssistant: { daPersonal: sec1, daWork: sec3 },
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

    const errors = validateRequiredFields(formData);
    if (errors.size > 0) {
      setFormErrors(errors);
      setOpenSections((prev) => ({ ...prev, ...getSectionsWithErrors(errors) }));
      setErrorModalMessage('Please fill in all required fields before submitting.');
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
      const workDays = formData.getAll('schedule[]');

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
        specialization: isDentist
          ? payload.specialization || payload.department || null
          : isDentalAssistant
            ? payload.daDepartment || null
            : null,
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
            : payload.recepShiftType || null,
        work_days: workDays,
        work_start_time: isDentist ? payload.docWorkStart : isDentalAssistant ? payload.daWorkStart : payload.recepWorkStart,
        work_end_time: isDentist ? payload.docWorkEnd : isDentalAssistant ? payload.daWorkEnd : payload.recepWorkEnd,
      };

      if (isDentalAssistant) {
        await api.post('/auth/staff-profiles', {
          branch_id: branchId,
          staffProfile: { ...commonStaffProfile, staff_type: 'Dental Assistant' },
        });
        setShowSuccessModal(true);
        return;
      }

      await api.post('/auth/staff', {
        email: payload.accessEmail || payload[`${prefix}Email`],
        name: fullName,
        role,
        home_branch_id: branchId,
        branch_ids: [branchId],
        phone: payload[`${prefix}Contact`],
        password: payload.accessPassword,
        staffProfile: commonStaffProfile,
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to create employee', err);
      setErrorModalMessage(err.response?.data?.message || 'Failed to create employee.');
      setShowErrorModal(true);
    }
  }

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
        {open && <div style={styles.content}>{children}</div>}
      </div>
    );
  }

  function renderPersonalInfo(type, prefix) {
    const roleLabel = type === 'dentist' ? 'doctor' : type === 'dentalAssistant' ? 'da' : 'recep';

    return (
      <>
        <div style={styles.rowThree}>
          <FieldRaw label="First Name:" name={`${prefix}FirstName`} onInput={filterNameInput} hasError={formErrors.has(`${prefix}FirstName`)} styles={styles} />
          <FieldRaw label="Middle Name:" name={`${prefix}MiddleName`} onInput={filterNameInput} styles={styles} />
          <FieldRaw label="Last Name:" name={`${prefix}LastName`} onInput={filterNameInput} hasError={formErrors.has(`${prefix}LastName`)} styles={styles} />
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
            styles={styles}
          />
          <FieldRaw label="Age:" name={`${prefix}Age`} value={ageValues[type]} onChange={() => {}} readOnly styles={styles} />
        </div>

        <div style={styles.rowTwo}>
          <GenderFieldRaw name={`${roleLabel}Gender`} hasError={formErrors.has(`${roleLabel}Gender`)} styles={styles} />
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
          <FieldRaw label="Home Address:" name={`${prefix}Address`} hasError={formErrors.has(`${prefix}Address`)} styles={styles} />
          <FieldRaw label="Contact Number:" name={`${prefix}Contact`} type="tel" onInput={filterContactInput} maxLength={13} hasError={formErrors.has(`${prefix}Contact`)} styles={styles} />
          <FieldRaw label="Email Address:" name={`${prefix}Email`} type="email" onInput={filterEmailInput} hasError={formErrors.has(`${prefix}Email`)} styles={styles} />
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
              <FieldRaw label="Medical Degree" name="medicalDegree" onInput={filterProfessionalTextInput} styles={styles} />
              <FieldRaw label="Medical License Number" name="licenseNumber" styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Specialization" name="specialization" onInput={filterProfessionalTextInput} styles={styles} />
              <FieldRaw label="Years of Experience" name="experienceYears" type="number" min="0" styles={styles} />
            </div>

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
              <SelectFieldRaw
                label="Specialization / Department"
                name="department"
                placeholder={
                  !selectedBranchId
                    ? 'Select a branch first'
                    : specializationsLoading
                      ? 'Loading…'
                      : 'Select specialization'
                }
                options={specializationOptions}
                disabled={!selectedBranchId || specializationsLoading}
                required
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  if (e.target.value) setFormErrors((prev) => { const n = new Set(prev); n.delete('department'); return n; });
                }}
                hasError={formErrors.has('department')}
                styles={styles}
              />
              <FieldRaw label="Start Date" name="startDate" type="date" hasError={formErrors.has('startDate')} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <SelectFieldRaw label="Employment Type" name="employmentType" placeholder="Select Type" options={EMPLOYMENT_TYPES} hasError={formErrors.has('employmentType')} styles={styles} />
              <SelectFieldRaw label="Shift Type" name="shiftType" placeholder="Select Type" options={['By Appointment']} hasError={formErrors.has('shiftType')} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <ScheduleFieldRaw name="schedule[]" dayOptions={DAY_OPTIONS} styles={styles} />
              <TimeRangeFieldRaw startName="docWorkStart" endName="docWorkEnd" styles={styles} />
            </div>
          </>
        )}

        {renderSection('docAccess', 'Section 4 - Web Access',
          <>
            <div style={styles.rowTwo}>
              <FieldRaw label="Email Address" name="accessEmail" type="text" onInput={filterEmailInput} hasError={formErrors.has('accessEmail')} styles={styles} />
              <FieldRaw label="Password" name="accessPassword" type="password" onInput={filterPasswordInput} hasError={formErrors.has('accessPassword')} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Access Role" name="accessRole" value="Dentist" onChange={() => {}} readOnly styles={styles} />
              <FieldRaw label="Confirm Password" name="confirmPassword" type="password" onInput={filterPasswordInput} hasError={formErrors.has('confirmPassword')} styles={styles} />
            </div>
          </>
        )}
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
              <FieldRaw label="Years of Experience" name="daExperienceYears" type="number" min="0" styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Skills" name="daSkills" styles={styles} />
            </div>

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
              <TimeRangeFieldRaw startName="daWorkStart" endName="daWorkEnd" styles={styles} />
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
                styles={styles}
              />
              <SelectFieldRaw label="Assigned Dentist" name="daAssignedDentist" placeholder="Select Dentist" options={dentistOptions} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Start Date" name="daStartDate" type="date" hasError={formErrors.has('daStartDate')} styles={styles} />
              <SelectFieldRaw label="Employment Type" name="daEmploymentType" placeholder="Select Type" options={EMPLOYMENT_TYPES} hasError={formErrors.has('daEmploymentType')} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <SelectFieldRaw label="Shift Type" name="daShiftType" placeholder="Select Type" options={['Day', 'Afternoon', 'Night']} hasError={formErrors.has('daShiftType')} styles={styles} />
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

        {renderSection('recPosition', 'Section 2 - Position Information',
          <>
            <div style={styles.rowTwo}>
              <FieldRaw label="Position" name="recepPosition" value="Receptionist" onChange={() => {}} readOnly styles={styles} />
              <FieldRaw label="Years of Experience" name="recepExperienceYears" type="number" min="0" styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Skills" name="recepSkills" styles={styles} />
            </div>

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
              <TimeRangeFieldRaw startName="recepWorkStart" endName="recepWorkEnd" styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Start Date" name="startDate" type="date" hasError={formErrors.has('startDate')} styles={styles} />
              <SelectFieldRaw label="Employment Type" name="employmentType" placeholder="Select Type" options={EMPLOYMENT_TYPES} hasError={formErrors.has('employmentType')} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <SelectFieldRaw label="Shift Type" name="recepShiftType" placeholder="Select Type" options={['Day', 'Afternoon', 'Night']} hasError={formErrors.has('recepShiftType')} styles={styles} />
            </div>
          </>
        )}

        {renderSection('recAccess', 'Section 4 - Web Access',
          <>
            <div style={styles.rowTwo}>
              <FieldRaw label="Email Address" name="accessEmail" type="text" onInput={filterEmailInput} hasError={formErrors.has('accessEmail')} styles={styles} />
              <FieldRaw label="Password" name="accessPassword" type="password" onInput={filterPasswordInput} hasError={formErrors.has('accessPassword')} styles={styles} />
            </div>
            <div style={styles.rowTwo}>
              <FieldRaw label="Access Role" name="accessRole" value="Receptionist" onChange={() => {}} readOnly styles={styles} />
              <FieldRaw label="Confirm Password" name="confirmPassword" type="password" onInput={filterPasswordInput} hasError={formErrors.has('confirmPassword')} styles={styles} />
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Page render ──────────────────────────────────────────────────────────

  return (
    <div style={styles.pageWrapper}>
      <form style={styles.employeeForm} onSubmit={handleSubmit}>
        <div style={styles.container}>
          <div style={styles.header}>
            <button type="button" style={styles.backBtn} onClick={handleBackClick} aria-label="Go back">←</button>
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
            <h2 style={styles.modalTitle}>Leave Employee Form?</h2>
            <p style={styles.modalText}>
              Are you sure you want to go back? Any unsaved changes to this employee form will be lost.
            </p>
            <div style={styles.modalActions}>
              <button type="button" style={{ ...styles.modalButton, ...styles.confirmBtn }} onClick={confirmBack}>Yes</button>
              <button type="button" style={{ ...styles.modalButton, ...styles.cancelBtn }} onClick={closeBackModal}>No</button>
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
            <h2 style={styles.modalTitle}>Incomplete Form</h2>
            <p style={styles.modalText}>{errorModalMessage}</p>
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
    </div>
  );
}
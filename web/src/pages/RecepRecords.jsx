import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

import { useAuth } from '../auth/AuthContext';
import {
  getPatientProfile,
  listPatients,
  updateStaffPatientProfile,
} from '../api/patients';
import { getTreatmentPlansByPatient } from '../api/treatmentPlans';
import api from '../api/axios';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import StaffHeaderAvatar from '../components/StaffHeaderAvatar';
import createRecepRecordsStyles from '../styles/RecepRecords';

import clinicLogo from '../assets/clinicLogo/clinic-logo-nav.png';

async function loadPdfTools() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return { jsPDF, autoTable };
}

const rowsPerPage = 10;

const CIVIL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
  'Divorced',
];

const NATIONALITY_OPTIONS = [
  'Afghan',
  'Albanian',
  'Algerian',
  'American',
  'Andorran',
  'Angolan',
  'Argentine',
  'Armenian',
  'Australian',
  'Austrian',
  'Bangladeshi',
  'Belgian',
  'Brazilian',
  'British',
  'Bulgarian',
  'Cambodian',
  'Canadian',
  'Chilean',
  'Chinese',
  'Colombian',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'Egyptian',
  'Emirati',
  'Filipino',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Hungarian',
  'Icelandic',
  'Indian',
  'Indonesian',
  'Irish',
  'Israeli',
  'Italian',
  'Japanese',
  'Jordanian',
  'Kenyan',
  'Korean',
  'Kuwaiti',
  'Malaysian',
  'Mexican',
  'Moroccan',
  'Nepalese',
  'New Zealander',
  'Nigerian',
  'Norwegian',
  'Pakistani',
  'Peruvian',
  'Polish',
  'Portuguese',
  'Qatari',
  'Romanian',
  'Russian',
  'Saudi',
  'Singaporean',
  'South African',
  'Spanish',
  'Swedish',
  'Swiss',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Vietnamese',
];

const phoneCountryOptions = getCountries().map((country) => ({
  country,
  callingCode: getCountryCallingCode(country),
}));

export default function RecepRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditCloseModal, setShowEditCloseModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const profileMenuRef = useRef(null);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [editModalReadOnly, setEditModalReadOnly] = useState(true);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [searchText, setSearchText] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [patients, setPatients] = useState([]);

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1000;

  const styles = createRecepRecordsStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
  });

  const filteredPatients = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();
    const genderValue = genderFilter.toLowerCase();

    return patients.filter((patient) => {
      const searchData =
        `${patient.id} ${patient.lastName} ${patient.firstName} ${patient.middleName} ${patient.email} ${patient.contactNumber}`.toLowerCase();

      const matchesSearch = searchData.includes(searchValue);

      const matchesGender =
        genderValue === 'all' ||
        String(patient.gender).toLowerCase() === genderValue;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchText, genderFilter]);

  const totalPages =
    filteredPatients.length === 0
      ? 0
      : Math.ceil(filteredPatients.length / rowsPerPage);

  const pagedPatients = useMemo(() => {
    const start = currentPage > 0 ? (currentPage - 1) * rowsPerPage : 0;

    return filteredPatients.slice(start, start + rowsPerPage);
  }, [filteredPatients, currentPage]);

  const receptionistName = user?.name || user?.email || 'Receptionist';

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
    fetchPatients();
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
    const modalOpen =
      showLogoutModal ||
      showDetailsModal ||
      showEditModal ||
      showEditCloseModal ||
      showEditConfirmModal ||
      showExportModal;

    document.body.style.overflow = modalOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    showLogoutModal,
    showDetailsModal,
    showEditModal,
    showEditCloseModal,
    showEditConfirmModal,
    showExportModal,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
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
    setCurrentPage(1);
  }, [searchText, genderFilter]);

  useEffect(() => {
    setCurrentPage((page) => fixPage(page, totalPages));
  }, [totalPages]);

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function closeAllModals() {
    setShowLogoutModal(false);
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowEditCloseModal(false);
    setShowEditConfirmModal(false);
    setShowExportModal(false);
  }

  async function fetchPatients() {
    try {
      const data = await listPatients();
      setPatients(normalizePatients(data));
    } catch (err) {
      setPatients([]);
    }
  }

  function handleModalOverlayClick(event, closeHandler) {
    if (event.target === event.currentTarget) {
      closeHandler();
    }
  }

  function openPatientDetails(patient) {
    navigate(`/receptionistPatientProfile?patientId=${patient.infoId}`);
  }

  function openEditPatient(patient, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const sourcePatient = patient || {};
    const contactFormValue = getContactFormValue(sourcePatient.contactNumber);
    const emergencyContactFormValue = getContactFormValue(
      sourcePatient.emergencyContactNumber
    );
    const infoId =
      sourcePatient.infoId ||
      sourcePatient.userInfoId ||
      sourcePatient.user_id ||
      sourcePatient.id ||
      '';

    setEditPatient({
      ...sourcePatient,
      infoId,
      firstName: sourcePatient.firstName || '',
      middleName: sourcePatient.middleName || '',
      lastName: sourcePatient.lastName || '',
      email: sourcePatient.email || '',
      dateOfBirth: toDateInputValue(sourcePatient.dateOfBirth),
      age:
        calculateAge(toDateInputValue(sourcePatient.dateOfBirth)) ||
        sourcePatient.age ||
        '',
      gender: sourcePatient.gender || '',
      contactCountry: contactFormValue.country,
      emergencyContactCountry: emergencyContactFormValue.country,
      contactNumber: contactFormValue.number,
      fullName: [
        sourcePatient.firstName,
        sourcePatient.middleName,
        sourcePatient.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim(),
      address: sourcePatient.address || '',
      nationality: sourcePatient.nationality || '',
      occupation: sourcePatient.occupation || '',
      civilStatus: sourcePatient.civilStatus || '',
      emergencyContactName: sourcePatient.emergencyContactName || '',
      emergencyContactNumber: emergencyContactFormValue.number,
      medicalConditions: sourcePatient.medicalConditions || '',
      allergies: sourcePatient.allergies || '',
      medications: sourcePatient.medications || '',
      dentalHistory: sourcePatient.dentalHistory || '',
    });

    setEditModalReadOnly(false);
    setEditErrors({});
    setShowEditModal(true);

    if (infoId) {
      hydrateEditPatientProfile(infoId);
    } else {
      setEditProfileLoading(false);
    }
  }

  function closePatientDetails() {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  }

  function closeEditPatient() {
    setShowEditModal(false);
    setShowEditCloseModal(false);
    setShowEditConfirmModal(false);
    setEditPatient(null);
    setEditModalReadOnly(true);
    setEditProfileLoading(false);
    setEditErrors({});
  }

  function openEditCloseModal() {
    setShowEditCloseModal(true);
  }

  function closeEditCloseModal() {
    setShowEditCloseModal(false);
  }

  function openEditConfirmModal() {
    setShowEditConfirmModal(true);
  }

  function closeEditConfirmModal() {
    setShowEditConfirmModal(false);
  }

  function confirmEnableEditMode() {
    setShowEditConfirmModal(false);
    setEditModalReadOnly(false);
  }

  async function hydrateEditPatientProfile(patientId) {
    setEditProfileLoading(true);

    try {
      const profile = await getPatientProfile(patientId);

      if (!profile) {
        return;
      }

      const nameParts = splitFullName(profile.full_name || '');
      const profileContactValue = getContactFormValue(
        profile.contact_number || ''
      );
      const profileEmergencyContactValue = getContactFormValue(
        profile.emergency_contact_number || ''
      );

      setEditPatient((current) => ({
        ...(current || {}),
        infoId: patientId,
        fullName: profile.full_name || current?.fullName || '',
        email: profile.email || current?.email || '',
        contactNumber: profile.contact_number
          ? profileContactValue.number
          : current?.contactNumber || '',
        contactCountry: profile.contact_number
          ? profileContactValue.country
          : current?.contactCountry || 'PH',
        address: profile.address || current?.address || '',
        dateOfBirth: toDateInputValue(profile.birthday || current?.dateOfBirth),
        age: profile.age || calculateAge(profile.birthday || current?.dateOfBirth) || current?.age || '',
        gender: profile.sex || current?.gender || '',
        lastName: nameParts.lastName || current?.lastName || '',
        firstName: nameParts.firstName || current?.firstName || '',
        middleName: nameParts.middleName || current?.middleName || '',
        nationality: profile.nationality || current?.nationality || '',
        occupation: profile.occupation || current?.occupation || '',
        civilStatus: profile.civil_status || current?.civilStatus || '',
        emergencyContactName:
          profile.emergency_contact_name || current?.emergencyContactName || '',
        emergencyContactNumber: profile.emergency_contact_number
          ? profileEmergencyContactValue.number
          : current?.emergencyContactNumber || '',
        emergencyContactCountry: profile.emergency_contact_number
          ? profileEmergencyContactValue.country
          : current?.emergencyContactCountry || 'PH',
        medicalConditions:
          profile.medical_conditions || current?.medicalConditions || '',
        allergies: profile.allergies || current?.allergies || '',
        medications: profile.medications || current?.medications || '',
        dentalHistory: profile.dental_history || current?.dentalHistory || '',
      }));
    } catch {
    } finally {
      setEditProfileLoading(false);
    }
  }

  function getEditFieldError(field, value) {
    const stringValue = String(value ?? '').trim();

    if (!stringValue) {
      return '';
    }

    const nameFields = [
      'firstName',
      'middleName',
      'lastName',
      'occupation',
      'emergencyContactName',
    ];

    if (nameFields.includes(field) && !/^[A-Za-zÀ-ÿ\s'\-]+$/.test(stringValue)) {
      return 'This field must contain letters, spaces, apostrophes, and hyphens only.';
    }

    if (field === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(stringValue)) {
        return 'Please enter a valid email address.';
      }
    }

    if (field === 'dateOfBirth') {
      const dobDate = new Date(`${stringValue}T00:00:00`);
      const todayDate = new Date();

      todayDate.setHours(0, 0, 0, 0);

      if (Number.isNaN(dobDate.getTime()) || dobDate > todayDate) {
        return 'Date of birth cannot be in the future.';
      }
    }

    return '';
  }

  function handleEditChange(field, value) {
    const nextValue = String(value ?? '');
    const error = getEditFieldError(field, nextValue);

    setEditPatient((current) => {
      const nextPatient = {
        ...current,
        [field]: nextValue,
      };

      if (field === 'dateOfBirth') {
        nextPatient.age = calculateAge(nextValue);
      }

      return nextPatient;
    });

    setEditErrors((current) => ({
      ...current,
      [field]: error,
    }));
  }

  function handleEditPhoneChange(field, phone, countryData) {
    const rawValue = String(phone || '').trim();
    const countryField =
      field === 'emergencyContactNumber'
        ? 'emergencyContactCountry'
        : 'contactCountry';
    const currentCountry =
      field === 'emergencyContactNumber'
        ? editPatient?.emergencyContactCountry
        : editPatient?.contactCountry;
    const countryCode = String(
      countryData?.countryCode || currentCountry || 'PH'
    ).toUpperCase();
    const nextValue = rawValue.replace(/\D/g, '');

    setEditPatient((current) => ({
      ...current,
      [field]: nextValue,
      [countryField]: countryCode,
    }));

    const error =
      field === 'emergencyContactNumber' && !nextValue
        ? ''
        : validatePhoneNumber(nextValue, countryCode);

    setEditErrors((current) => ({
      ...current,
      [field]: error,
    }));
  }

  function validateEditPatient() {
    if (!editPatient || editModalReadOnly) {
      return false;
    }

    const requiredFieldChecks = [
      ['firstName', editPatient.firstName],
      ['lastName', editPatient.lastName],
      ['dateOfBirth', editPatient.dateOfBirth],
      ['gender', editPatient.gender],
      ['address', editPatient.address],
      ['nationality', editPatient.nationality],
      ['occupation', editPatient.occupation],
      ['civilStatus', editPatient.civilStatus],
      ['contactNumber', editPatient.contactNumber],
      ['email', editPatient.email],
    ];

    const nextErrors = {};

    requiredFieldChecks.forEach(([key, value]) => {
      if (!String(value || '').trim()) {
        nextErrors[key] = 'This field is required.';
      }
    });

    const fieldsToValidate = [
      'firstName',
      'middleName',
      'lastName',
      'occupation',
      'emergencyContactName',
      'email',
      'dateOfBirth',
    ];

    fieldsToValidate.forEach((field) => {
      const error = getEditFieldError(field, editPatient[field]);

      if (error) {
        nextErrors[field] = error;
      }
    });

    const contactError = validatePhoneNumber(
      editPatient.contactNumber,
      editPatient.contactCountry || 'PH'
    );

    if (contactError) {
      nextErrors.contactNumber = contactError;
    }

    if (editPatient.emergencyContactNumber) {
      const emergencyError = validatePhoneNumber(
        editPatient.emergencyContactNumber,
        editPatient.emergencyContactCountry || 'PH'
      );

      if (emergencyError) {
        nextErrors.emergencyContactNumber = emergencyError;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
      return false;
    }

    return true;
  }

  function formatPatientSaveValue(value) {
    return String(value ?? '').trim() || 'Not entered';
  }

  function getPatientSaveDetails() {
    if (!editPatient) {
      return [];
    }

    const fullName = [
      editPatient.firstName,
      editPatient.middleName,
      editPatient.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return [
      ['Full Name', fullName],
      ['First Name', editPatient.firstName],
      ['Middle Name', editPatient.middleName],
      ['Last Name', editPatient.lastName],
      ['Date of Birth', editPatient.dateOfBirth],
      ['Age', calculateAge(editPatient.dateOfBirth) || editPatient.age],
      ['Gender', editPatient.gender],
      ['Email', editPatient.email],
      [
        'Contact Number',
        normalizePhoneNumber(editPatient.contactNumber, editPatient.contactCountry || 'PH'),
      ],
      ['Address', editPatient.address],
      ['Nationality', editPatient.nationality],
      ['Occupation', editPatient.occupation],
      ['Civil Status', editPatient.civilStatus],
      ['Emergency Contact Name', editPatient.emergencyContactName],
      [
        'Emergency Contact Number',
        editPatient.emergencyContactNumber
          ? normalizePhoneNumber(
              editPatient.emergencyContactNumber,
              editPatient.emergencyContactCountry || 'PH'
            )
          : '',
      ],
      ['Dental History', editPatient.dentalHistory],
      ['Medical Conditions', editPatient.medicalConditions],
      ['Allergies', editPatient.allergies],
      ['Medications', editPatient.medications],
    ].map(([label, value]) => ({
      key: label,
      label,
      value: formatPatientSaveValue(value),
    }));
  }

  function handleEditSubmit(event) {
    event.preventDefault();

    if (validateEditPatient()) {
      openEditConfirmModal();
    }
  }

  async function savePatientChanges() {
    if (!editPatient || editModalReadOnly) {
      return;
    }

    try {
      const fullName = [
        editPatient.firstName,
        editPatient.middleName,
        editPatient.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      const saved = await updateStaffPatientProfile(editPatient.infoId, {
        full_name: fullName,
        email: editPatient.email,
        contact_number: normalizePhoneNumber(
          editPatient.contactNumber,
          editPatient.contactCountry || 'PH'
        ),
        birthday: editPatient.dateOfBirth,
        age: calculateAge(editPatient.dateOfBirth) || editPatient.age,
        sex: editPatient.gender,
        address: editPatient.address || 'Not provided',
        nationality: editPatient.nationality || '',
        occupation: editPatient.occupation || '',
        civil_status: editPatient.civilStatus || '',
        emergency_contact_name: editPatient.emergencyContactName || '',
        emergency_contact_number: editPatient.emergencyContactNumber
          ? normalizePhoneNumber(
              editPatient.emergencyContactNumber,
              editPatient.emergencyContactCountry || 'PH'
            )
          : '',
        medical_conditions: editPatient.medicalConditions || '',
        allergies: editPatient.allergies || '',
        medications: editPatient.medications || '',
        dental_history: editPatient.dentalHistory || '',
      });

      const [normalized] = normalizePatients([saved]);

      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          String(patient.infoId) === String(editPatient.infoId)
            ? normalized
            : patient
        )
      );

      if (
        selectedPatient &&
        String(selectedPatient.infoId) === String(editPatient.infoId)
      ) {
        setSelectedPatient(normalized);
      }

      closeEditPatient();
    } catch (err) {
      closeEditConfirmModal();
      window.alert(
        err.response?.data?.message || 'Failed to save patient record.'
      );
    }
  }

  function handleAddPatient() {
    navigate('/receptionistPatientForm');
  }

  function exportPatientsToCSV() {
    if (filteredPatients.length === 0) {
      setShowExportModal(true);
      return;
    }

    const headers = [
      'Patient ID',
      'Last Name',
      'First Name',
      'Middle Name',
      'Age',
      'Gender',
      'Email',
      'Contact Number',
    ];

    const rows = filteredPatients.map((patient) => [
      patient.id,
      patient.lastName || 'N/A',
      patient.firstName || 'N/A',
      patient.middleName || 'N/A',
      patient.age || 'N/A',
      patient.gender || 'N/A',
      patient.email || 'N/A',
      patient.contactNumber || 'N/A',
    ]);

    const csv = [];

    csv.push(['Smile Empress Dental Hub']);
    csv.push(['Receptionist Patient Records']);
    csv.push(['Generated Date', new Date().toLocaleString('en-PH')]);
    csv.push(['Generated By', receptionistName]);
    csv.push([
      'Gender Filter',
      genderFilter === 'all' ? 'All Patients' : genderFilter,
    ]);
    csv.push([]);
    csv.push(headers);
    rows.forEach((row) => csv.push(row));

    const csvContent =
      '\uFEFF' +
      csv.map((row) => row.map(formatCSVValue).join(',')).join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'receptionist_patient_records.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function exportPatientToPDF(patient) {
    const { jsPDF, autoTable } = await loadPdfTools();
    let fullPatient = patient;
    let attachmentItems = [];

    try {
      const [profile, plans] = await Promise.all([
        getPatientProfile(patient.infoId),
        getTreatmentPlansByPatient(patient.infoId).catch(() => []),
      ]);
      attachmentItems = await loadPdfAttachmentItems(plans);

      if (profile) {
        const nameParts = splitFullName(profile.full_name || '');

        fullPatient = {
          ...patient,
          fullName: profile.full_name || patient.fullName,
          email: profile.email || patient.email,
          contactNumber: profile.contact_number || patient.contactNumber,
          address: profile.address || patient.address,
          dateOfBirth: profile.birthday || patient.dateOfBirth,
          age: profile.age || calculateAge(profile.birthday) || patient.age,
          gender: profile.sex || patient.gender,
          firstName: patient.firstName || nameParts.firstName,
          middleName: patient.middleName || nameParts.middleName,
          lastName: patient.lastName || nameParts.lastName,
          nationality: profile.nationality || patient.nationality,
          occupation: profile.occupation || patient.occupation,
          civilStatus: profile.civil_status || patient.civilStatus,
          emergencyContactName:
            profile.emergency_contact_name || patient.emergencyContactName,
          emergencyContactNumber:
            profile.emergency_contact_number ||
            patient.emergencyContactNumber,
          medicalConditions:
            profile.medical_conditions || patient.medicalConditions,
          allergies: profile.allergies || patient.allergies,
          medications: profile.medications || patient.medications,
          dentalHistory: profile.dental_history || patient.dentalHistory,
        };
      }
    } catch {
      fullPatient = patient;
      attachmentItems = [{ label: 'Unable to load attachments', isTextOnly: true }];
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const generatedDate = new Date().toLocaleString('en-PH');

    function safeValue(value) {
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }

      return String(value);
    }

    function drawHeader() {
      doc.setFillColor(255, 248, 220);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setFillColor(139, 101, 8);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFillColor(212, 175, 55);
      doc.rect(0, 28, pageWidth, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Smile Empress Dental Hub', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Patient Record Report', 14, 20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ToothConnect', pageWidth - 14, 12, {
        align: 'right',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Generated: ${generatedDate}`, pageWidth - 14, 20, {
        align: 'right',
      });
    }

    function drawFooter() {
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('Generated by ToothConnect', 14, pageHeight - 9);
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
        pageWidth - 14,
        pageHeight - 9,
        { align: 'right' }
      );
    }

    function drawSectionTitle(title, yPosition) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(14, yPosition, pageWidth - 28, 9, 2, 2, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(title, 18, yPosition + 6);

      return yPosition + 13;
    }

    function addSection(title, rows, startY) {
      let yPosition = startY;

      if (yPosition > pageHeight - 45) {
        doc.addPage();
        drawHeader();
        yPosition = 40;
      }

      yPosition = drawSectionTitle(title, yPosition);

      autoTable(doc, {
        startY: yPosition,
        theme: 'grid',
        head: [['Field', 'Details']],
        body: rows,
        margin: {
          left: 14,
          right: 14,
        },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          textColor: [15, 23, 42],
          lineColor: [229, 231, 235],
          lineWidth: 0.25,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [255, 253, 242],
        },
        columnStyles: {
          0: {
            cellWidth: 58,
            fontStyle: 'bold',
            textColor: [51, 65, 85],
          },
          1: {
            cellWidth: 'auto',
          },
        },
        didDrawPage() {
          drawFooter();
        },
      });

      return doc.lastAutoTable.finalY + 8;
    }

    function addAttachmentSection(startY) {
      let yPosition = startY;
      const left = 14;
      const right = pageWidth - 14;
      const fieldWidth = 58;
      const detailsX = left + fieldWidth;
      const tableWidth = right - left;
      const detailsWidth = tableWidth - fieldWidth;
      const rowHeight = 57;
      const imageWidth = 54;
      const imageHeight = 40;
      const bottomLimit = pageHeight - 22;

      if (yPosition > pageHeight - 70) {
        doc.addPage();
        drawHeader();
        yPosition = 40;
      }

      yPosition = drawSectionTitle('Attachments', yPosition);

      const imageItems = attachmentItems.filter((item) => item.dataUrl);
      const textItems = attachmentItems.filter((item) => item.isTextOnly);
      const rows = imageItems.length
        ? imageItems
        : [{ label: textItems.map((item) => item.label).join('\n') || 'No attachments uploaded', isTextOnly: true }];

      function drawAttachmentTableHeader() {
        doc.setFillColor(212, 175, 55);
        doc.rect(left, yPosition, tableWidth, 10, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.25);
        doc.rect(left, yPosition, fieldWidth, 10);
        doc.rect(detailsX, yPosition, detailsWidth, 10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Field', left + 4, yPosition + 6.5);
        doc.text('Details', detailsX + 4, yPosition + 6.5);
        yPosition += 10;
      }

      drawAttachmentTableHeader();

      rows.forEach((item, index) => {
        const currentRowHeight = item.dataUrl ? rowHeight : 18;

        if (yPosition + currentRowHeight > bottomLimit) {
          doc.addPage();
          drawHeader();
          yPosition = 40;
          drawAttachmentTableHeader();
        }

        doc.setFillColor(255, 255, 255);
        doc.rect(left, yPosition, fieldWidth, currentRowHeight, 'F');
        doc.rect(detailsX, yPosition, detailsWidth, currentRowHeight, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.rect(left, yPosition, fieldWidth, currentRowHeight);
        doc.rect(detailsX, yPosition, detailsWidth, currentRowHeight);

        if (index === 0) {
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text('Attachments', left + 4, yPosition + 9);
        }

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        if (item.dataUrl) {
          const imageX = detailsX + 4;
          const imageY = yPosition + 5;
          doc.addImage(item.dataUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(7);
          doc.text(item.label, imageX, imageY + imageHeight + 5, {
            maxWidth: detailsWidth - 8,
          });
        } else {
          doc.text(item.label, detailsX + 4, yPosition + 9, {
            maxWidth: detailsWidth - 8,
          });
        }

        yPosition += currentRowHeight;
      });

      return yPosition + 8;
    }

    drawHeader();

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 39, pageWidth - 28, 29, 3, 3, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(safeValue(fullPatient.fullName), 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Patient ID: ${safeValue(fullPatient.id)}`, 20, 58);
    doc.text(`Generated By: ${safeValue(receptionistName)}`, 20, 64);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(139, 101, 8);
    doc.text(`Gender: ${safeValue(fullPatient.gender)}`, pageWidth - 20, 58, {
      align: 'right',
    });
    doc.text(`Age: ${safeValue(fullPatient.age)}`, pageWidth - 20, 64, {
      align: 'right',
    });

    let nextY = 76;

    nextY = addSection(
      'Table Record Summary',
      [
        ['Patient ID', safeValue(fullPatient.id)],
        ['Last Name', safeValue(fullPatient.lastName)],
        ['First Name', safeValue(fullPatient.firstName)],
        ['Middle Name', safeValue(fullPatient.middleName)],
        ['Age', safeValue(fullPatient.age)],
        ['Gender', safeValue(fullPatient.gender)],
      ],
      nextY
    );

    nextY = addSection(
      'Patient Profile Details',
      [
        ['Full Name', safeValue(fullPatient.fullName)],
        ['Email', safeValue(fullPatient.email)],
        ['Contact Number', safeValue(fullPatient.contactNumber)],
        ['Date of Birth', safeValue(fullPatient.dateOfBirth)],
        ['Address', safeValue(fullPatient.address)],
        ['Nationality', safeValue(fullPatient.nationality)],
        ['Occupation', safeValue(fullPatient.occupation)],
        ['Civil Status', safeValue(fullPatient.civilStatus)],
      ],
      nextY
    );

    nextY = addSection(
      'Emergency Contact',
      [
        ['Emergency Contact Name', safeValue(fullPatient.emergencyContactName)],
        [
          'Emergency Contact Number',
          safeValue(fullPatient.emergencyContactNumber),
        ],
      ],
      nextY
    );

    nextY = addSection(
      'Medical Assessment',
      [['Dental History', safeValue(fullPatient.dentalHistory)]],
      nextY
    );

    nextY = addSection(
      'Health Condition',
      [
        ['Medical Conditions', safeValue(fullPatient.medicalConditions)],
        ['Allergies', safeValue(fullPatient.allergies)],
        ['Medications', safeValue(fullPatient.medications)],
      ],
      nextY
    );

    nextY = addAttachmentSection(nextY);

    const totalPdfPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPdfPages; page += 1) {
      doc.setPage(page);
      drawFooter();
    }

    doc.save(`${safeValue(fullPatient.id)}_patient_record.pdf`);
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/receptionist" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/receptionistAppointments" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link
            to="/receptionistRecords"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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
            <div style={styles.profileDropdownWrapper} ref={profileMenuRef}>
              <button
                type="button"
                style={styles.receptProfile}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <StaffHeaderAvatar styles={styles} />

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
          <section style={styles.patientHero}>
            <div>
              <span style={styles.heroBadge}>Patient Records</span>

              <h2 style={styles.heroTitle}>
                View and update patient information records.
              </h2>

              <p style={styles.heroText}>
                Search patient profiles, review personal details, and update
                patient contact information.
              </p>
            </div>

            {!isVerySmall && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-clipboard-user"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search patient name or ID"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
              style={styles.genderFilter}
            >
              <option value="all">All Patients</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </section>

          <section style={styles.dashboardCard}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Patient List</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  style={styles.addPatientBtn}
                  onClick={handleAddPatient}
                >
                  <i className="fi fi-rr-user-add"></i>
                  Add Patient
                </button>

                <button
                  type="button"
                  style={styles.exportCsvBtn}
                  onClick={exportPatientsToCSV}
                >
                  <i className="fi fi-rr-file-csv"></i>
                  Export CSV
                </button>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.patientTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Patient ID</th>
                    <th style={styles.th}>Last Name</th>
                    <th style={styles.th}>First Name</th>
                    <th style={styles.th}>Middle Name</th>
                    <th style={styles.th}>Age</th>
                    <th style={styles.th}>Gender</th>
                    <th style={{ ...styles.th, ...styles.actionTh }}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyCell}>
                        No matching patients found.
                      </td>
                    </tr>
                  ) : (
                    pagedPatients.map((patient) => (
                      <tr key={patient.id} style={styles.tr}>
                        <td style={styles.td}>{patient.id}</td>
                        <td style={styles.td}>{patient.lastName || '-'}</td>
                        <td style={styles.td}>{patient.firstName || '-'}</td>
                        <td style={styles.td}>{patient.middleName || '-'}</td>
                        <td style={styles.td}>{patient.age || '-'}</td>
                        <td style={styles.td}>{patient.gender || '-'}</td>
                        <td style={{ ...styles.td, ...styles.actionTd }}>
                          <div style={styles.btnGroup}>
                            <button
                              type="button"
                              style={{
                                ...styles.actionBtn,
                                ...styles.viewBtn,
                              }}
                              onClick={() => openPatientDetails(patient)}
                              title="View Patient"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              style={{
                                ...styles.actionBtn,
                                ...styles.editBtn,
                              }}
                              onClick={(event) =>
                                openEditPatient(patient, event)
                              }
                              title="Edit Patient"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              style={{
                                ...styles.actionBtn,
                                ...styles.pdfBtn,
                              }}
                              onClick={() => exportPatientToPDF(patient)}
                              title="Export PDF"
                            >
                              <i
                                className="fi fi-rr-file-pdf"
                                style={styles.pdfBtnIcon}
                              ></i>
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              styles={styles}
              page={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              onNext={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            />
          </section>
        </main>
      </div>

      {showEditModal && editPatient && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, openEditCloseModal)}
        >
          <form
            style={{ ...styles.modalContent, ...styles.largeModal }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleEditSubmit}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalHeaderTitle}>Edit Patient</h2>
                <p style={styles.modalHeaderText}>
                  Add or update the patient profile details, then save the
                  changes.
                </p>
              </div>
            </div>

            <div style={styles.editModalBody}>
              {editProfileLoading && (
                <p
                  style={{
                    ...styles.modalHeaderText,
                    marginTop: 0,
                    marginBottom: 16,
                  }}
                >
                  Loading patient profile...
                </p>
              )}

              <div style={styles.formGrid}>
                <div style={styles.formSectionTitle}>Personal Information</div>

              <FieldInput
                styles={styles}
                label="First Name"
                value={editPatient.firstName}
                readOnly={editModalReadOnly}
                error={editErrors.firstName}
                onChange={(value) => handleEditChange('firstName', value)}
              />

              <FieldInput
                styles={styles}
                label="Middle Name"
                value={editPatient.middleName}
                readOnly={editModalReadOnly}
                error={editErrors.middleName}
                onChange={(value) => handleEditChange('middleName', value)}
              />

              <FieldInput
                styles={styles}
                label="Last Name"
                value={editPatient.lastName}
                readOnly={editModalReadOnly}
                error={editErrors.lastName}
                onChange={(value) => handleEditChange('lastName', value)}
              />

              <FieldInput
                styles={styles}
                label="Date of Birth"
                type="date"
                value={editPatient.dateOfBirth}
                disabled={editModalReadOnly}
                error={editErrors.dateOfBirth}
                onChange={(value) => handleEditChange('dateOfBirth', value)}
              />

              <FieldInput
                styles={styles}
                label="Email"
                type="email"
                value={editPatient.email}
                readOnly={editModalReadOnly}
                error={editErrors.email}
                onChange={(value) => handleEditChange('email', value)}
              />

              <PhoneField
                styles={styles}
                label="Contact Number"
                value={editPatient.contactNumber}
                country={editPatient.contactCountry || 'PH'}
                onCountryChange={(country) =>
                  handleEditPhoneChange('contactNumber', editPatient.contactNumber, {
                    countryCode: country.toLowerCase(),
                  })
                }
                disabled={editModalReadOnly}
                error={editErrors.contactNumber}
                onChange={(phone, countryData) =>
                  handleEditPhoneChange('contactNumber', phone, countryData)
                }
              />

              <FieldInput
                styles={styles}
                label="Age"
                value={editPatient.age}
                readOnly
              />

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Gender</label>
                <select
                  value={editPatient.gender}
                  onChange={(event) =>
                    handleEditChange('gender', event.target.value)
                  }
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.gender ? { borderColor: '#dc2626' } : {}),
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                {editErrors.gender && (
                  <p style={styles.fieldErrorText}>{editErrors.gender}</p>
                )}
              </div>

              <FieldInput
                styles={styles}
                label="Address"
                value={editPatient.address || ''}
                readOnly={editModalReadOnly}
                error={editErrors.address}
                onChange={(value) => handleEditChange('address', value)}
              />

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Nationality</label>
                <select
                  value={editPatient.nationality || ''}
                  onChange={(event) =>
                    handleEditChange('nationality', event.target.value)
                  }
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.nationality
                      ? { borderColor: '#dc2626' }
                      : {}),
                  }}
                >
                  <option value="">Select Nationality</option>

                  {NATIONALITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {editErrors.nationality && (
                  <p style={styles.fieldErrorText}>
                    {editErrors.nationality}
                  </p>
                )}
              </div>

              <FieldInput
                styles={styles}
                label="Occupation"
                value={editPatient.occupation || ''}
                readOnly={editModalReadOnly}
                error={editErrors.occupation}
                onChange={(value) => handleEditChange('occupation', value)}
              />

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Civil Status</label>
                <select
                  value={editPatient.civilStatus || ''}
                  onChange={(event) =>
                    handleEditChange('civilStatus', event.target.value)
                  }
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.civilStatus
                      ? { borderColor: '#dc2626' }
                      : {}),
                  }}
                >
                  <option value="">Select Civil Status</option>

                  {CIVIL_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {editErrors.civilStatus && (
                  <p style={styles.fieldErrorText}>
                    {editErrors.civilStatus}
                  </p>
                )}
              </div>

              <FieldInput
                styles={styles}
                label="Emergency Contact Name"
                value={editPatient.emergencyContactName || ''}
                readOnly={editModalReadOnly}
                error={editErrors.emergencyContactName}
                onChange={(value) =>
                  handleEditChange('emergencyContactName', value)
                }
              />

              <PhoneField
                styles={styles}
                label="Emergency Contact Number"
                value={editPatient.emergencyContactNumber || ''}
                country={editPatient.emergencyContactCountry || 'PH'}
                onCountryChange={(country) =>
                  handleEditPhoneChange(
                    'emergencyContactNumber',
                    editPatient.emergencyContactNumber,
                    { countryCode: country.toLowerCase() }
                  )
                }
                disabled={editModalReadOnly}
                error={editErrors.emergencyContactNumber}
                onChange={(phone, countryData) =>
                  handleEditPhoneChange(
                    'emergencyContactNumber',
                    phone,
                    countryData
                  )
                }
              />

              <div style={styles.formSectionTitle}>Medical Assessment</div>

              <TextAreaField
                styles={styles}
                label="Dental History"
                value={editPatient.dentalHistory || ''}
                readOnly={editModalReadOnly}
                onChange={(value) => handleEditChange('dentalHistory', value)}
              />

              <div style={styles.formSectionTitle}>Health Condition</div>

              <TextAreaField
                styles={styles}
                label="Medical Conditions"
                value={editPatient.medicalConditions || ''}
                readOnly={editModalReadOnly}
                onChange={(value) =>
                  handleEditChange('medicalConditions', value)
                }
              />

              <TextAreaField
                styles={styles}
                label="Allergies"
                value={editPatient.allergies || ''}
                readOnly={editModalReadOnly}
                onChange={(value) => handleEditChange('allergies', value)}
              />

                <TextAreaField
                  styles={styles}
                  label="Medications"
                  value={editPatient.medications || ''}
                  readOnly={editModalReadOnly}
                  onChange={(value) => handleEditChange('medications', value)}
                />
              </div>
            </div>

            <div style={styles.editModalActions}>
              <button
                type="button"
                style={styles.cancelModalBtn}
                onClick={openEditCloseModal}
              >
                Close
              </button>

              <button type="submit" style={styles.saveBtn}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditCloseModal && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeEditCloseModal)}
        >
          <div style={{ ...styles.modalContent, ...styles.smallModal }}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Close Patient Details</h2>
            <p style={styles.modalText}>
              Are you sure you want to close the details for this patient?
            </p>

            <div style={{ ...styles.modalActions, ...styles.centerActions }}>
              <button
                type="button"
                style={styles.cancelModalBtn}
                onClick={closeEditCloseModal}
              >
                No
              </button>

              <button
                type="button"
                style={styles.logoutBtn}
                onClick={closeEditPatient}
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeEditConfirmModal)}
        >
          <div
            style={
              editModalReadOnly
                ? { ...styles.modalContent, ...styles.smallModal }
                : { ...styles.modalContent, ...styles.saveConfirmModal }
            }
          >
            <div style={{ ...styles.modalIcon, ...styles.editConfirmIcon }}>
              <i
                className={editModalReadOnly ? 'fi fi-rr-edit' : 'fi fi-rr-disk'}
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>
              {editModalReadOnly ? 'Edit Patient Details' : 'Update Patient Details'}
            </h2>
            <p style={styles.modalText}>
              {editModalReadOnly
                ? 'Are you sure you want to edit the details for this patient?'
                : 'Please review the patient information before saving.'}
            </p>

            {!editModalReadOnly && (
              <div style={styles.saveDetailsList}>
                {getPatientSaveDetails().map((detail) => (
                  <div key={detail.key} style={styles.saveDetailRow}>
                    <span style={styles.saveDetailLabel}>{detail.label}</span>
                    <strong style={styles.saveDetailValue}>
                      {detail.value}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ ...styles.modalActions, ...styles.centerActions }}>
              <button
                type="button"
                style={styles.cancelModalBtn}
                onClick={closeEditConfirmModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.saveBtn}
                onClick={editModalReadOnly ? confirmEnableEditMode : savePatientChanges}
              >
                {editModalReadOnly ? 'Edit' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div
          style={styles.exportModalOverlay}
          onClick={(event) =>
            handleModalOverlayClick(event, () => setShowExportModal(false))
          }
        >
          <div style={styles.exportModalContent}>
            <h2 style={styles.exportModalTitle}>No Patient Records</h2>

            <div style={styles.exportModalDivider}></div>

            <p style={styles.exportModalText}>
              No patient records available to export.
            </p>

            <button
              type="button"
              style={styles.exportModalButton}
              onClick={() => setShowExportModal(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeLogoutModal)}
        >
          <div style={{ ...styles.modalContent, ...styles.smallModal }}>
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Logout</h2>
            <p style={styles.modalText}>Are you sure you want to log out?</p>

            <div style={{ ...styles.modalActions, ...styles.centerActions }}>
              <button
                type="button"
                style={styles.cancelModalBtn}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.logoutBtn}
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

function Pagination({ styles, page, totalPages, onPrev, onNext }) {
  return (
    <div style={styles.pagination}>
      <button
        type="button"
        style={{ ...styles.pageBtn, ...styles.prevPageBtn,
          ...(page <= 1 ? styles.pageBtnDisabled : {}),
        }}
        disabled={page <= 1}
        onClick={onPrev}
      >
        Previous
      </button>

      <span style={styles.pageInfo}>Page {page} of {totalPages}</span>

      <button
        type="button"
        style={{ ...styles.pageBtn, ...styles.nextPageBtn,
          ...(page >= totalPages || totalPages === 0
            ? styles.pageBtnDisabled
            : {}),
        }}
        disabled={page >= totalPages || totalPages === 0}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}

function FieldInput({
  styles,
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  disabled = false,
  error = '',
}) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>

      <input
        type={type}
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        style={{
          ...styles.fieldInput,
          ...(error ? { borderColor: '#dc2626' } : {}),
        }}
      />

      {error && (
        <p
          style={{
            ...styles.fieldErrorText,
            color: '#dc2626',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PhoneField({
  styles,
  label,
  value,
  country = 'PH',
  onCountryChange,
  onChange,
  disabled = false,
  error = '',
}) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>
        {label}
        {error && <span style={styles.fieldErrorAsterisk}>*</span>}
      </label>

      <div style={styles.phoneInputContainer}>
        <select
          value={country}
          onChange={(event) => onCountryChange?.(event.target.value)}
          disabled={disabled}
          style={{
            ...styles.phoneCountrySelect,
            ...(disabled ? styles.phoneButtonDisabled : {}),
            ...(error ? styles.fieldInputError : {}),
          }}
          aria-label={`${label} country code`}
        >
          {phoneCountryOptions.map((option) => (
            <option key={option.country} value={option.country}>
              {option.country} +{option.callingCode}
            </option>
          ))}
        </select>

        <input
          type="tel"
          value={value || ''}
          onChange={(event) =>
            onChange?.(event.target.value, { countryCode: country.toLowerCase() })
          }
          disabled={disabled}
          placeholder="9123456789"
          autoComplete="tel"
          inputMode="tel"
          maxLength={15}
          style={{
            ...styles.phoneInput,
            ...(disabled ? styles.phoneButtonDisabled : {}),
            ...(error ? styles.fieldInputError : {}),
          }}
        />
      </div>

      {error && (
        <p
          style={{
            ...styles.fieldErrorText,
            color: '#dc2626',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaField({
  styles,
  label,
  value,
  onChange,
  readOnly = false,
  error = '',
}) {
  return (
    <div style={styles.textAreaField}>
      <label style={styles.fieldLabel}>
        {label}
        {error && <span style={styles.fieldErrorAsterisk}>*</span>}
      </label>

      <textarea
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        style={{
          ...styles.textAreaInput,
          ...(readOnly ? styles.readOnlyInput : {}),
          ...(error ? styles.fieldInputError : {}),
        }}
      />

      {error && (
        <p
          style={{
            ...styles.fieldErrorText,
            color: '#dc2626',
          }}
        >
          {error}
        </p>
      )}
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

function validatePhoneNumber(value, country = 'PH') {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits || isDialCodeOnly(digits, country)) {
    return 'This field is required';
  }

  const phoneNumber = parseContactNumber(value, country);

  if (!phoneNumber?.isValid()) {
    return 'Contact number is invalid.';
  }

  return '';
}

function getContactFormValue(value) {
  const phoneNumber = parseContactNumber(value);

  if (!phoneNumber) {
    return {
      country: 'PH',
      number: String(value || '').replace(/\D/g, ''),
    };
  }

  return {
    country: phoneNumber.country || 'PH',
    number: phoneNumber.nationalNumber || String(value || '').replace(/\D/g, ''),
  };
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

function normalizePatients(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const dateOfBirth = toDateInputValue(
      item.dateOfBirth || item.dob || item.birthDate || item.birthday || ''
    );

    const age = item.age || calculateAge(dateOfBirth) || '';
    const fullName = item.full_name || item.name || '';
    const nameParts = splitFullName(fullName);

    return {
      id:
        item.id || item.user_id
          ? `P${item.id || item.user_id}`
          : item.patientId || item.userId || index + 1,
      infoId:
        item.infoId || item.userInfoId || item.id || item.user_id || index + 1,
      fullName: item.full_name || item.name || '',
      email: item.email || '',
      contactNumber: item.contact_number || item.contactNumber || '',
      address: item.address || '',
      lastName: item.lastName || item.last_name || nameParts.lastName,
      firstName: item.firstName || item.first_name || nameParts.firstName,
      middleName: item.middleName || item.middle_name || nameParts.middleName,
      dateOfBirth,
      age,
      gender: item.gender || item.sex || '',
      nationality: item.nationality || '',
      occupation: item.occupation || '',
      civilStatus: item.civil_status || item.civilStatus || '',
      emergencyContactName:
        item.emergency_contact_name || item.emergencyContactName || '',
      emergencyContactNumber:
        item.emergency_contact_number || item.emergencyContactNumber || '',
      medicalConditions: item.medical_conditions || item.medicalConditions || '',
      allergies: item.allergies || '',
      medications: item.medications || '',
      dentalHistory: item.dental_history || item.dentalHistory || '',
    };
  });
}

function toDateInputValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const dateOnlyMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) {
    return dateOnlyMatch[1];
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function calculateAge(dateValue) {
  const value = String(dateValue || '').trim();

  if (!value) {
    return '';
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return '';
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const birthDate = new Date(year, month - 1, day);

  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return '';
  }

  const today = new Date();

  let age = today.getFullYear() - year;

  if (
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age -= 1;
  }

  return age >= 0 ? age : '';
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

async function loadPdfAttachmentItems(plans) {
  const rows = uniquePdfAttachmentRows((Array.isArray(plans) ? plans : [])
    .flatMap((plan) => (plan.attachments || []).map((attachment) => ({
      id: attachment.id,
      tooth: plan.tooth_number,
      procedure: plan.planned_treatment,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      mimeType: attachment.mime_type,
      fileSize: attachment.file_size,
    }))));

  if (rows.length === 0) {
    return [{ label: 'No attachments uploaded', isTextOnly: true }];
  }

  const items = await Promise.all(rows.map(async (item) => {
    const label = `Tooth #${item.tooth} - ${item.procedure}`;

    if (!String(item.mimeType || '').startsWith('image/')) {
      return { label: `${label}: ${item.fileName}`, isTextOnly: true };
    }

    try {
      const dataUrl = await imageUrlToPngDataUrl(attachmentUrl(item.fileUrl));
      return { label, dataUrl };
    } catch (_err) {
      return { label: `${label}: image unavailable`, isTextOnly: true };
    }
  }));

  return items;
}

function uniquePdfAttachmentRows(rows) {
  const seen = new Set();

  return rows.filter((item) => {
    const key =
      item.id ||
      item.fileUrl ||
      `${item.fileName || ''}-${item.fileSize || ''}`;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function attachmentUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

async function imageUrlToPngDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load attachment image');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function formatCSVValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}
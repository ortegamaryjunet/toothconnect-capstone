import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import {
  getPatientProfile,
  listPatients,
  updateStaffPatientProfile,
} from '../api/patients';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepRecordsStyles from '../styles/RecepRecords';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

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

const PH_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

export default function RecepRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
      showExportModal;

    document.body.style.overflow = modalOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showDetailsModal, showEditModal, showExportModal]);

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

    setEditPatient({
      ...patient,
      fullName: [patient.firstName, patient.middleName, patient.lastName]
        .filter(Boolean)
        .join(' ')
        .trim(),
      address: patient.address || '',
      nationality: '',
      occupation: '',
      civilStatus: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      medicalConditions: '',
      allergies: '',
      medications: '',
      dentalHistory: '',
    });

    setEditModalReadOnly(true);
    setEditErrors({});
    setShowEditModal(true);
    hydrateEditPatientProfile(patient.infoId);
  }

  function closePatientDetails() {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  }

  function closeEditPatient() {
    setShowEditModal(false);
    setEditPatient(null);
    setEditModalReadOnly(true);
    setEditProfileLoading(false);
    setEditErrors({});
  }

  async function hydrateEditPatientProfile(patientId) {
    setEditProfileLoading(true);

    try {
      const profile = await getPatientProfile(patientId);

      if (!profile) {
        return;
      }

      const nameParts = splitFullName(profile.full_name || '');

      setEditPatient((current) => ({
        ...(current || {}),
        infoId: patientId,
        fullName: profile.full_name || current?.fullName || '',
        email: profile.email || current?.email || '',
        contactNumber: profile.contact_number || current?.contactNumber || '',
        address: profile.address || current?.address || '',
        dateOfBirth: profile.birthday || current?.dateOfBirth || '',
        age: profile.age || calculateAge(profile.birthday) || current?.age || '',
        gender: profile.sex || current?.gender || '',
        lastName: current?.lastName || nameParts.lastName || '',
        firstName: current?.firstName || nameParts.firstName || '',
        middleName: current?.middleName || nameParts.middleName || '',
        nationality: profile.nationality || '',
        occupation: profile.occupation || '',
        civilStatus: profile.civil_status || '',
        emergencyContactName: profile.emergency_contact_name || '',
        emergencyContactNumber: profile.emergency_contact_number || '',
        medicalConditions: profile.medical_conditions || '',
        allergies: profile.allergies || '',
        medications: profile.medications || '',
        dentalHistory: profile.dental_history || '',
      }));
    } catch {
    } finally {
      setEditProfileLoading(false);
    }
  }

  function handleEditChange(field, value) {
    let sanitized = value;

    if (['firstName', 'middleName', 'lastName'].includes(field)) {
      sanitized = String(value || '').replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '');
    }

    if (['occupation', 'emergencyContactName'].includes(field)) {
      sanitized = String(value || '').replace(/[0-9]/g, '');
    }

    if (field === 'contactNumber' || field === 'emergencyContactNumber') {
      const digitsOnly = String(value || '').replace(/[^0-9]/g, '');
      sanitized = String(value || '').startsWith('+')
        ? `+${digitsOnly}`
        : digitsOnly;

      const maxLen = sanitized.startsWith('+') ? 13 : 11;
      sanitized = sanitized.slice(0, maxLen);
    }

    setEditPatient((current) => ({
      ...current,
      [field]: sanitized,
      age: field === 'dateOfBirth' ? calculateAge(sanitized) : current.age,
    }));

    setEditErrors((current) => ({
      ...current,
      [field]: '',
    }));
  }

  async function savePatientChanges(event) {
    event.preventDefault();

    if (!editPatient || editModalReadOnly) {
      return;
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

    if (editPatient.dateOfBirth) {
      const dobDate = new Date(editPatient.dateOfBirth);
      const todayDate = new Date();

      todayDate.setHours(0, 0, 0, 0);

      if (Number.isNaN(dobDate.getTime()) || dobDate > todayDate) {
        nextErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    if (
      editPatient.contactNumber &&
      !PH_PHONE_REGEX.test(String(editPatient.contactNumber).trim())
    ) {
      nextErrors.contactNumber = 'Use 09XXXXXXXXX or +639XXXXXXXXX format.';
    }

    if (editPatient.emergencyContactNumber) {
      const emergencyNumber = String(
        editPatient.emergencyContactNumber
      ).trim();

      if (!PH_PHONE_REGEX.test(emergencyNumber)) {
        nextErrors.emergencyContactNumber =
          'Use 09XXXXXXXXX or +639XXXXXXXXX format.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
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
        contact_number: editPatient.contactNumber,
        birthday: editPatient.dateOfBirth,
        age: calculateAge(editPatient.dateOfBirth) || editPatient.age,
        sex: editPatient.gender,
        address: editPatient.address || 'Not provided',
        nationality: editPatient.nationality || '',
        occupation: editPatient.occupation || '',
        civil_status: editPatient.civilStatus || '',
        emergency_contact_name: editPatient.emergencyContactName || '',
        emergency_contact_number: editPatient.emergencyContactNumber || '',
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
      window.alert(
        err.response?.data?.message || 'Failed to save patient record.'
      );
    }
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

    try {
      const profile = await getPatientProfile(patient.infoId);

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

              <button
                type="button"
                style={styles.exportCsvBtn}
                onClick={exportPatientsToCSV}
              >
                <i className="fi fi-rr-file-csv"></i>
                Export CSV
              </button>
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
                        <td style={styles.td}>
                          <span style={styles.genderBadge}>
                            {patient.gender || '-'}
                          </span>
                        </td>
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
                              <i className="fi fi-rr-eye"></i>
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
                              <i className="fi fi-rr-edit"></i>
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
                              <i className="fi fi-rr-file-pdf"></i>
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
          onClick={(event) => handleModalOverlayClick(event, closeEditPatient)}
        >
          <form
            style={{ ...styles.modalContent, ...styles.largeModal }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={savePatientChanges}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalHeaderTitle}>Edit Patient</h2>
                <p style={styles.modalHeaderText}>
                  Review patient profile details, then click Edit to enable
                  fields.
                </p>
              </div>

              <button
                type="button"
                style={styles.modalX}
                onClick={closeEditPatient}
              >
                ×
              </button>
            </div>

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

              <FieldInput
                styles={styles}
                label="Contact Number"
                type="tel"
                value={editPatient.contactNumber}
                readOnly={editModalReadOnly}
                error={editErrors.contactNumber}
                onChange={(value) => handleEditChange('contactNumber', value)}
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
                onChange={(value) =>
                  handleEditChange('emergencyContactName', value)
                }
              />

              <FieldInput
                styles={styles}
                label="Emergency Contact Number"
                value={editPatient.emergencyContactNumber || ''}
                readOnly={editModalReadOnly}
                error={editErrors.emergencyContactNumber}
                onChange={(value) =>
                  handleEditChange('emergencyContactNumber', value)
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

            <div style={styles.modalActions}>
              {editModalReadOnly ? (
                <>
                  <button
                    type="button"
                    style={styles.cancelModalBtn}
                    onClick={closeEditPatient}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    style={styles.saveBtn}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setEditModalReadOnly(false);
                    }}
                    disabled={editProfileLoading}
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    style={styles.cancelModalBtn}
                    onClick={() => setEditModalReadOnly(true)}
                  >
                    Cancel
                  </button>

                  <button type="submit" style={styles.saveBtn}>
                    Save
                  </button>
                </>
              )}
            </div>
          </form>
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
                style={styles.logoutBtn}
                onClick={handleLogout}
              >
                Logout
              </button>

              <button
                type="button"
                style={styles.cancelModalBtn}
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

      <span style={styles.pageInfo}>Page {page} of {totalPages}</span>

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

      {error && <p style={styles.fieldErrorText}>{error}</p>}
    </div>
  );
}

function TextAreaField({ styles, label, value, onChange, readOnly = false }) {
  return (
    <div style={styles.textAreaField}>
      <label style={styles.fieldLabel}>{label}</label>

      <textarea
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        style={styles.textAreaInput}
      />
    </div>
  );
}

function normalizePatients(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const dateOfBirth =
      item.dateOfBirth || item.dob || item.birthDate || item.birthday || '';

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

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function calculateAge(dateValue) {
  if (!dateValue) {
    return '';
  }

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
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

function formatCSVValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

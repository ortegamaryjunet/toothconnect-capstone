import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import AdminProfileMenu from '../components/AdminProfileMenu';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createAdminEmployeesStyles from '../styles/AdminEmployees';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

import doctorIcon from '../assets/adminImages/doctor.png';
import dentalAssistantIcon from '../assets/adminImages/dental-assistant.png';
import receptionistIcon from '../assets/adminImages/receptionist.png';

async function loadPdfTools() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return { jsPDF, autoTable };
}

const EDIT_DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DAY_TO_WEEKDAY = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const DENTIST_SPECIALIZATIONS = [
  'General Dentistry',
  'Orthodontics',
  'Endodontics',
  'Periodontics',
  'Prosthodontics',
  'Pediatric Dentistry',
  'Oral Surgery',
  'Cosmetic Dentistry',
  'Implant Dentistry',
  'Radiology',
];

const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const SUPPORTING_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_EMPLOYEE_FILE_SIZE = 5 * 1024 * 1024;

function filterNameVal(val) {
  return val.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '');
}

function filterContactVal(val) {
  let v = val.replace(/[^0-9+]/g, '');
  v = v.replace(/(.)\+/g, '$1');

  const maxLen = v.startsWith('+') ? 13 : 11;

  return v.slice(0, maxLen);
}

function filterEmailVal(val) {
  return val.replace(/\s/g, '');
}

function filterProfTextVal(val) {
  return val.replace(/[^a-zA-ZÀ-ÿ\s'\-.,()&/:]/g, '');
}

function isValidContactNumber(value) {
  const contact = String(value || '').trim();

  if (contact.startsWith('+')) {
    return /^\+639\d{9}$/.test(contact);
  }

  return /^09\d{9}$/.test(contact);
}

function isValidEmailAddress(value) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(
    String(value || '').trim()
  );
}

function getLiveEmployeeFieldError(name, value) {
  const fieldValue = String(value || '').trim();

  if (!fieldValue) {
    return '';
  }

  if (name === 'contactNumber') {
    return isValidContactNumber(fieldValue)
      ? ''
      : 'Use 09XXXXXXXXX or +639XXXXXXXXX.';
  }

  if (name === 'email') {
    return isValidEmailAddress(fieldValue)
      ? ''
      : 'Enter a valid email address.';
  }

  return '';
}

function isValidDateValue(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function isValidNonNegativeNumber(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return true;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0;
}

function isValidTimeValue(value) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(String(value || '').trim());
}

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

function normalizeStaffShiftType(role, value) {
  const shift = String(value || '').trim();
  if (role === 'Dentist') return shift;
  if (['Day', 'Afternoon', 'Night'].includes(shift)) return 'Full Day';
  return shift;
}

function getShiftTypeOptions(role) {
  if (role === 'Dentist') {
    return ['By Appointment'];
  }

  return ['Full Day', 'Custom Hours'];
}

function parseWorkDays(val) {
  const sortDays = (days) => days
    .map((day) => String(day || '').trim())
    .filter(Boolean)
    .sort((a, b) => {
      const indexA = EDIT_DAY_OPTIONS.indexOf(a);
      const indexB = EDIT_DAY_OPTIONS.indexOf(b);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });

  if (!val) {
    return [];
  }

  if (Array.isArray(val)) {
    return sortDays(val);
  }

  try {
    const parsed = JSON.parse(val);

    if (Array.isArray(parsed)) {
      return sortDays(parsed);
    }
  } catch (_) {}

  return sortDays(String(val).split(','));
}

function parseSpecializations(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBranchIdArray(value) {
  return [...new Set(
    (Array.isArray(value) ? value : String(value || '').split(','))
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  )];
}

function formatScheduleEntries(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  return entries.map((e) => {
    const day = WEEKDAY_LABELS[Number(e.weekday)] || `Day ${String(e.weekday)}`;
    const branch = e.branch_address || e.branch_name || `Branch #${e.branch_id}`;
    const start = e.start_time ? String(e.start_time).slice(0, 5) : '';
    const end = e.end_time ? String(e.end_time).slice(0, 5) : '';
    const hours = start && end ? `${start} - ${end}` : '';

    return `${day}: ${branch}${hours ? ` (${hours})` : ''}`;
  });
}

function makeScheduleDraftBlock(entry = {}) {
  return {
    id: entry.id || `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    branch_id: entry.branch_id ? String(entry.branch_id) : '',
    start_time: entry.start_time ? String(entry.start_time).slice(0, 5) : '',
    end_time: entry.end_time ? String(entry.end_time).slice(0, 5) : '',
  };
}

function buildScheduleDraft(employee) {
  const draft = {};

  for (const entry of employee?.scheduleEntries || []) {
    const weekday = Number(entry.weekday);

    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      continue;
    }

    if (!Array.isArray(draft[weekday])) {
      draft[weekday] = [];
    }

    draft[weekday].push(makeScheduleDraftBlock(entry));
  }

  return draft;
}

export default function AdminEmployees() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeCloseConfirmModal, setShowEmployeeCloseConfirmModal] =
    useState(false);
  const [showEmployeeEditConfirmModal, setShowEmployeeEditConfirmModal] =
    useState(false);
  const [showEmployeeEditCancelConfirmModal, setShowEmployeeEditCancelConfirmModal] =
    useState(false);
  const [employeeSaveConfirmModal, setEmployeeSaveConfirmModal] =
    useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editErrors, setEditErrors] = useState(new Set());
  const [liveEditErrors, setLiveEditErrors] = useState({});
  const [showEditErrorModal, setShowEditErrorModal] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [editProfilePhotoFile, setEditProfilePhotoFile] = useState(null);
  const [editProfilePhotoPreview, setEditProfilePhotoPreview] = useState('');
  const [editRemoveProfilePhoto, setEditRemoveProfilePhoto] = useState(false);
  const [editNewDocuments, setEditNewDocuments] = useState([]);
  const [editRemovedDocumentIds, setEditRemovedDocumentIds] = useState([]);
  const [documentDeleteConfirm, setDocumentDeleteConfirm] = useState(null);
  const [photoRemoveConfirm, setPhotoRemoveConfirm] = useState(false);
  const [scheduleTouched, setScheduleTouched] = useState(false);
  const [usePerDayBranchSchedule, setUsePerDayBranchSchedule] =
    useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({});
  const [scheduleLocks, setScheduleLocks] = useState({
    hasLocks: false,
    branchLocked: false,
    lockedWeekdays: [],
    locks: [],
  });
  const [scheduleLocksLoading, setScheduleLocksLoading] = useState(false);
  const [showScheduleLockWarningModal, setShowScheduleLockWarningModal] =
    useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const editPhotoInputRef = useRef(null);
  const editDocumentInputRef = useRef(null);

  const isMobile = screenWidth <= 850;
  const isTablet = screenWidth > 850 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminEmployeesStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const totalDentists = employees.filter(
    (employee) => employee.role === 'Dentist'
  ).length;

  const totalDentalAssistants = employees.filter(
    (employee) => employee.role === 'Dental Assistant'
  ).length;

  const totalReceptionists = employees.filter(
    (employee) => employee.role === 'Receptionist'
  ).length;

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
    if (editedEmployee?.role !== 'Dentist') return;
    if (normalizeBranchIdArray(editedEmployee?.additionalBranchIds).length > 0) return;

    setUsePerDayBranchSchedule(false);
    setScheduleDraft({});
  }, [editedEmployee?.role, editedEmployee?.additionalBranchIds]);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await api.get('/auth/staff-profiles');
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    }

    async function loadBranches() {
      try {
        const res = await api.get('/auth/branches');
        setBranches(res.data.branches || []);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    }

    async function loadServices() {
      try {
        const res = await api.get('/auth/services');
        const all = res.data.services || [];
        const categories = [...new Set(all.map((service) => service.category).filter(Boolean))].sort();
        setServiceCategories(categories);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    }

    loadEmployees();
    loadBranches();
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
    if (
      showLogoutModal ||
      showEmployeeModal ||
      showEmployeeCloseConfirmModal ||
      showEmployeeEditConfirmModal ||
      showEmployeeEditCancelConfirmModal ||
      employeeSaveConfirmModal ||
      documentDeleteConfirm ||
      photoRemoveConfirm ||
      showEditErrorModal ||
      showExportModal
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
    showEmployeeModal,
    showEmployeeCloseConfirmModal,
    showEmployeeEditConfirmModal,
    showEmployeeEditCancelConfirmModal,
    employeeSaveConfirmModal,
    documentDeleteConfirm,
    photoRemoveConfirm,
    showEditErrorModal,
    showExportModal,
  ]);

  useEffect(() => {
    return () => {
      if (editProfilePhotoPreview) {
        URL.revokeObjectURL(editProfilePhotoPreview);
      }
    };
  }, [editProfilePhotoPreview]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        if (documentDeleteConfirm) {
          setDocumentDeleteConfirm(null);
          return;
        }
        if (photoRemoveConfirm) {
          setPhotoRemoveConfirm(false);
          return;
        }

        closeLogoutModal();
        setShowEmployeeCloseConfirmModal(false);
        setShowEmployeeEditConfirmModal(false);
        setShowEmployeeEditCancelConfirmModal(false);
        setEmployeeSaveConfirmModal(null);
        setDocumentDeleteConfirm(null);
        if (showEmployeeModal) {
          if (isEditingEmployee) {
            setShowEmployeeEditCancelConfirmModal(true);
          } else {
            setShowEmployeeCloseConfirmModal(true);
          }
        }
        setShowExportModal(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmployeeModal, isEditingEmployee, documentDeleteConfirm, photoRemoveConfirm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const search = searchValue.toLowerCase().trim();

      const employeeId = String(employee.id).toLowerCase();
      const role = String(employee.role).toLowerCase();
      const lastName = String(employee.lastName).toLowerCase();
      const firstName = String(employee.firstName).toLowerCase();
      const middleName = String(employee.middleName).toLowerCase();
      const branch = String(
        employee.branchAddress || employee.branchName || ''
      ).toLowerCase();

      const fullName = `${firstName} ${middleName} ${lastName}`;

      const matchesSearch =
        employeeId.includes(search) ||
        fullName.includes(search) ||
        firstName.includes(search) ||
        middleName.includes(search) ||
        lastName.includes(search) ||
        branch.includes(search);

      const matchesRole =
        roleFilter === 'all' || role === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [employees, searchValue, roleFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredEmployees.slice(start, end);
  }, [filteredEmployees, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, roleFilter]);

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

  function handleExportModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setShowExportModal(false);
    }
  }

  function exportEmployeesToCSV() {
    if (filteredEmployees.length === 0) {
      setShowExportModal(true);
      return;
    }

    const headers = [
      'Employee ID',
      'Clinic Position',
      'Last Name',
      'First Name',
      'Middle Name',
      'Branch',
      'Age',
      'Gender',
    ];

    const rows = filteredEmployees.map((employee) => [
      employee.id,
      employee.role,
      employee.lastName,
      employee.firstName,
      employee.middleName,
      employee.branchAddress || employee.branchName || '-',
      employee.age,
      employee.gender,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(formatCSVValue).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'employee_records.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function exportEmployeeToPDF(employee) {
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const fullName = [
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ]
      .filter(Boolean)
      .join(' ');

    const branch = employee.branchAddress || employee.branchName || 'N/A';
    const generatedDate = new Date().toLocaleString('en-PH');

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

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Employee Record Report', 14, 20);

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
      const pageNumber = doc.internal.getNumberOfPages();

      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('Generated by ToothConnect', 14, pageHeight - 9);
      doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 9, {
        align: 'right',
      });
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

    function safeValue(value) {
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }

      return String(value);
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
            cellWidth: 55,
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

    async function addAttachmentsSection(startY) {
      const documents = Array.isArray(employee.supportingDocuments)
        ? employee.supportingDocuments
        : [];
      if (documents.length === 0) {
        return addSection('Attachments', [['Attachments', 'No attachments uploaded.']], startY);
      }

      let yPosition = startY;
      if (yPosition > pageHeight - 55) {
        doc.addPage();
        drawHeader();
        yPosition = 40;
      }
      yPosition = drawSectionTitle('Attachments', yPosition);

      for (const document of documents) {
        if (yPosition > pageHeight - 45) {
          doc.addPage();
          drawHeader();
          yPosition = 40;
        }

        const label = document.file_name || 'Attachment';
        const fileUrl = employeeFileUrl(document.file_url);
        const isImage = String(document.mime_type || '').startsWith('image/');

        if (isImage) {
          try {
            const dataUrl = await fileUrlToDataUrl(fileUrl);
            const format = String(document.mime_type || '').includes('png') ? 'PNG' : 'JPEG';
            doc.addImage(dataUrl, format, 20, yPosition, 44, 34, undefined, 'FAST');
            doc.setTextColor(51, 65, 85);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(label, 68, yPosition + 8, { maxWidth: pageWidth - 88 });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(formatEmployeeFileSize(document.file_size), 68, yPosition + 14);
            yPosition += 40;
            continue;
          } catch (_) {}
        }

        autoTable(doc, {
          startY: yPosition,
          theme: 'grid',
          body: [['Attachment', `${label}\n${formatEmployeeFileSize(document.file_size)}`]],
          margin: { left: 14, right: 14 },
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.25,
          },
          columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } },
          didDrawPage() {
            drawFooter();
          },
        });
        yPosition = doc.lastAutoTable.finalY + 5;
      }

      return yPosition + 4;
    }

    drawHeader();

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 39, pageWidth - 28, 29, 3, 3, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(fullName || 'Employee Name', 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Employee ID: ${safeValue(employee.id)}`, 20, 58);
    doc.text(`Clinic Position: ${safeValue(employee.role)}`, 20, 64);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(139, 101, 8);
    doc.text(`Status: ${safeValue(employee.status)}`, pageWidth - 20, 58, {
      align: 'right',
    });
    doc.text(`Branch: ${branch}`, pageWidth - 20, 64, {
      align: 'right',
    });

    let nextY = 76;

    nextY = addSection(
      'Table Record Summary',
      [
        ['Employee ID', safeValue(employee.id)],
        ['Clinic Position', safeValue(employee.role)],
        ['Last Name', safeValue(employee.lastName)],
        ['First Name', safeValue(employee.firstName)],
        ['Middle Name', safeValue(employee.middleName)],
        ['Branch', branch],
        ['Age', safeValue(employee.age)],
        ['Gender', safeValue(employee.gender)],
      ],
      nextY
    );

    nextY = addSection(
      'Section 1 - Personal Information',
      [
        ['First Name', safeValue(employee.firstName)],
        ['Middle Name', safeValue(employee.middleName)],
        ['Last Name', safeValue(employee.lastName)],
        ['Preferred Nickname', safeValue(employee.nickname)],
        ['Suffix', safeValue(employee.suffix)],
        ['Birthday', safeValue(employee.birthday)],
        ['Age', safeValue(employee.age)],
        ['Gender', safeValue(employee.gender)],
        ['Civil Status', safeValue(employee.civilStatus)],
        ['Religion', safeValue(employee.religion)],
        ['Nationality', safeValue(employee.nationality)],
        ['Home Address', safeValue(employee.homeAddress)],
        ['Contact Number', safeValue(employee.contactNumber)],
        ['Email Address', safeValue(employee.email)],
      ],
      nextY
    );

    const professionalRows = [
      ['Position', safeValue(employee.position)],
      ['Years of Experience', safeValue(employee.yearsExperience)],
      ['Skills', safeValue(employee.skills)],
    ];

    if (employee.role === 'Dentist') {
      professionalRows.push(
        ['Medical Degree', safeValue(employee.medicalDegree)],
        ['Medical License Number', safeValue(employee.licenseNumber)],
        ['Specialization', safeValue(employee.specialization)]
      );
    } else {
      professionalRows.push(
        ['Assigned Dentist', safeValue(employee.assignedDentist)],
        ['Access Role', safeValue(employee.accessRole)]
      );
    }

    nextY = addSection(
      'Section 2 - Professional Information',
      professionalRows,
      nextY
    );

    const scheduleEntries = formatScheduleEntries(employee.scheduleEntries);

    nextY = addSection(
      'Section 3 - Work Details',
      [
        ['Start Date', safeValue(employee.startDate)],
        ['Assigned Branch', branch],
        ['Department', safeValue(employee.workDepartment)],
        ['Employment Type', safeValue(employee.employmentType)],
        ['Shift Type', safeValue(employee.shiftType)],
        ['Work Schedule Days', parseWorkDays(employee.workDays).join(', ') || 'N/A'],
        ['Work Start Time', safeValue(employee.workStartTime)],
        ['Work End Time', safeValue(employee.workEndTime)],
        ['Status', safeValue(employee.status)],
        ['Access Role', safeValue(employee.accessRole)],
        [
          'Branch Schedule',
          scheduleEntries.length > 0 ? scheduleEntries.join('\n') : 'N/A',
        ],
      ],
      nextY
    );

    nextY = await addAttachmentsSection(nextY);

    const totalPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      drawFooter();
    }

    doc.save(`${safeValue(employee.id)}_employee_record.pdf`);
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

  function resetEmployeeEditFiles() {
    if (editProfilePhotoPreview) {
      URL.revokeObjectURL(editProfilePhotoPreview);
    }
    setEditProfilePhotoFile(null);
    setEditProfilePhotoPreview('');
    setEditRemoveProfilePhoto(false);
    setEditNewDocuments([]);
    setEditRemovedDocumentIds([]);
    setDocumentDeleteConfirm(null);
    setScheduleTouched(false);
    if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
    if (editDocumentInputRef.current) editDocumentInputRef.current.value = '';
  }

  function handleEditPhotoSelect(file) {
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setEditErrorMessage('Profile photo must be a JPG or PNG file.');
      setShowEditErrorModal(true);
      return;
    }
    if (file.size > MAX_EMPLOYEE_FILE_SIZE) {
      setEditErrorMessage('Profile photo must be 5MB or smaller.');
      setShowEditErrorModal(true);
      return;
    }
    if (editProfilePhotoPreview) {
      URL.revokeObjectURL(editProfilePhotoPreview);
    }
    setEditProfilePhotoFile(file);
    setEditProfilePhotoPreview(URL.createObjectURL(file));
    setEditRemoveProfilePhoto(false);
  }

  function confirmRemoveEmployeePhoto() {
    if (editProfilePhotoPreview) {
      URL.revokeObjectURL(editProfilePhotoPreview);
    }
    setEditProfilePhotoFile(null);
    setEditProfilePhotoPreview('');
    setEditRemoveProfilePhoto(true);
    setPhotoRemoveConfirm(false);
    if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
  }

  function handleEditDocumentFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const invalid = files.find((file) =>
      !SUPPORTING_DOCUMENT_TYPES.includes(file.type) ||
      file.size > MAX_EMPLOYEE_FILE_SIZE
    );

    if (invalid) {
      setEditErrorMessage('Supporting documents must be PDF, JPG, or PNG files up to 5MB each.');
      setShowEditErrorModal(true);
      return;
    }

    setEditNewDocuments((prev) => [...prev, ...files]);
    if (editDocumentInputRef.current) editDocumentInputRef.current.value = '';
  }

  function removeExistingEmployeeDocument(documentId) {
    setEditRemovedDocumentIds((prev) => [...new Set([...prev, documentId])]);
  }

  function removeNewEmployeeDocument(index) {
    setEditNewDocuments((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  function markScheduleTouched() {
    setScheduleTouched(true);
  }

  function requestRemoveExistingEmployeeDocument(document) {
    setDocumentDeleteConfirm({
      type: 'existing',
      documentId: document?.id,
      fileName: document?.file_name || 'Document',
    });
  }

  function requestRemoveNewEmployeeDocument(file, index) {
    setDocumentDeleteConfirm({
      type: 'new',
      index,
      fileName: file?.name || 'Document',
    });
  }

  function confirmRemoveEmployeeDocument() {
    if (!documentDeleteConfirm) return;

    if (documentDeleteConfirm.type === 'existing') {
      removeExistingEmployeeDocument(documentDeleteConfirm.documentId);
    }

    if (documentDeleteConfirm.type === 'new') {
      removeNewEmployeeDocument(documentDeleteConfirm.index);
    }

    setDocumentDeleteConfirm(null);
  }

  function openEmployeeModal(employee) {
    resetEmployeeEditFiles();
    const normalizedEmployee =
      employee?.role === 'Dentist'
        ? {
            ...employee,
            specializations: parseSpecializations(employee.specializations || employee.workDepartment || employee.specialization),
          }
        : {
            ...employee,
            shiftType: normalizeStaffShiftType(employee?.role, employee?.shiftType),
          };

    if (
      normalizedEmployee?.role !== 'Dentist' &&
      normalizedEmployee?.shiftType === 'Full Day'
    ) {
      const branch = branches.find((item) => String(item.id) === String(normalizedEmployee.branchId));
      const hours = parseBranchOperatingHours(branch?.operating_hours);
      if (hours) {
        normalizedEmployee.workStartTime = hours.start;
        normalizedEmployee.workEndTime = hours.end;
      }
    }

    setSelectedEmployee(normalizedEmployee);
    setEditedEmployee({ ...normalizedEmployee });
    setIsEditingEmployee(false);

    const hasSchedule =
      Array.isArray(employee?.scheduleEntries) &&
      employee.scheduleEntries.length > 0;

    setUsePerDayBranchSchedule(hasSchedule);

    setScheduleDraft(buildScheduleDraft(employee));

    setShowEmployeeModal(true);
  }

  function closeEmployeeModal() {
    setShowEmployeeModal(false);
    setShowEmployeeCloseConfirmModal(false);
    setShowEmployeeEditConfirmModal(false);
    setShowEmployeeEditCancelConfirmModal(false);
    setEmployeeSaveConfirmModal(null);
    setShowScheduleLockWarningModal(false);
    setSelectedEmployee(null);
    setEditedEmployee(null);
    setIsEditingEmployee(false);
    setEditErrors(new Set());
    setLiveEditErrors({});
    setUsePerDayBranchSchedule(false);
    resetEmployeeEditFiles();
    setScheduleDraft({});
    setScheduleLocks({
      hasLocks: false,
      branchLocked: false,
      lockedWeekdays: [],
      locks: [],
    });
  }

  function handleEmployeeModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      if (isEditingEmployee) {
        handleCancelEmployeeEditModal();
      } else {
        setShowEmployeeCloseConfirmModal(true);
      }
    }
  }

  function hasLockedScheduleDays() {
    return Array.isArray(scheduleLocks.lockedWeekdays) &&
      scheduleLocks.lockedWeekdays.length > 0;
  }

  function isScheduleDayLocked(day) {
    const weekday = DAY_TO_WEEKDAY[day];

    return Array.isArray(scheduleLocks.lockedWeekdays) &&
      scheduleLocks.lockedWeekdays.includes(weekday);
  }

  function getScheduleLockForDay(day) {
    const weekday = DAY_TO_WEEKDAY[day];

    return (scheduleLocks.locks || []).find(
      (lock) => Number(lock.weekday) === Number(weekday)
    );
  }

  function formatScheduleLockSummary() {
    const locks = scheduleLocks.locks || [];

    if (locks.length === 0) {
      return 'No active appointment locks found.';
    }

    return locks
      .map((lock) => {
        const branch = lock.branch_address || lock.branch_name || 'assigned branch';
        const count = Number(lock.appointment_count || 0);
        const countText = `${count} active ${count === 1 ? 'appointment' : 'appointments'}`;

        return `${lock.day_name}: ${branch} (${countText})`;
      })
      .join('\n');
  }

  async function handleEditEmployee() {
    if (selectedEmployee?.role !== 'Dentist') {
      setShowEmployeeEditConfirmModal(false);
      setIsEditingEmployee(true);
      return;
    }

    setScheduleLocksLoading(true);
    setEditErrorMessage('');

    try {
      const res = await api.get(
        `/auth/staff-profiles/${selectedEmployee.profileId}/schedule-locks`
      );
      const locks = {
        hasLocks: Boolean(res.data.hasLocks),
        branchLocked: Boolean(res.data.branchLocked),
        lockedWeekdays: Array.isArray(res.data.lockedWeekdays)
          ? res.data.lockedWeekdays
          : [],
        locks: Array.isArray(res.data.locks) ? res.data.locks : [],
      };

      setScheduleLocks(locks);
      setShowEmployeeEditConfirmModal(false);
      setIsEditingEmployee(true);

      if (locks.hasLocks) {
        setShowScheduleLockWarningModal(true);
      }
    } catch (err) {
      console.error('Failed to check dentist schedule locks', err);
      setEditErrorMessage(
        err.response?.data?.message ||
          'Failed to check this dentist appointment locks.'
      );
      setShowEmployeeEditConfirmModal(false);
      setShowEditErrorModal(true);
    } finally {
      setScheduleLocksLoading(false);
    }
  }

  function handleCancelEmployeeEditModal() {
    setShowEmployeeEditCancelConfirmModal(true);
  }

  function closeEmployeeEditCancelConfirmModal() {
    setShowEmployeeEditCancelConfirmModal(false);
  }

  function confirmCancelEmployeeEditModal() {
    setShowEmployeeEditCancelConfirmModal(false);
    setEmployeeSaveConfirmModal(null);
    setShowScheduleLockWarningModal(false);
    setEditedEmployee({ ...selectedEmployee });
    setScheduleDraft(buildScheduleDraft(selectedEmployee));
    setScheduleTouched(false);
    setIsEditingEmployee(false);
    setEditErrors(new Set());
    setLiveEditErrors({});
    resetEmployeeEditFiles();
  }

  function handleEmployeeInputChange(event) {
    const { name, value } = event.target;

    setEditedEmployee((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === 'shiftType' && prev?.role !== 'Dentist' && value === 'Full Day') {
        const branch = branches.find((item) => String(item.id) === String(prev?.branchId));
        const hours = parseBranchOperatingHours(branch?.operating_hours);
        if (hours) {
          next.workStartTime = hours.start;
          next.workEndTime = hours.end;
        }
      }

      return next;
    });
  }

  function createModalScheduleBlock(overrides = {}) {
    return makeScheduleDraftBlock({
      branch_id: overrides.branch_id ?? editedEmployee?.branchId ?? '',
      start_time: overrides.start_time ?? editedEmployee?.workStartTime ?? '',
      end_time: overrides.end_time ?? editedEmployee?.workEndTime ?? '',
    });
  }

  function ensureModalScheduleDay(weekday) {
    markScheduleTouched();
    setScheduleDraft((prev) => {
      if (Array.isArray(prev?.[weekday]) && prev[weekday].length > 0) {
        return prev;
      }

      return {
        ...prev,
        [weekday]: [createModalScheduleBlock()],
      };
    });
  }

  function removeModalScheduleDay(weekday) {
    markScheduleTouched();
    setScheduleDraft((prev) => {
      const next = { ...prev };
      delete next[weekday];
      return next;
    });
  }

  function addModalScheduleBlock(weekday) {
    markScheduleTouched();
    setScheduleDraft((prev) => ({
      ...prev,
      [weekday]: [
        ...(Array.isArray(prev?.[weekday]) ? prev[weekday] : []),
        createModalScheduleBlock(),
      ],
    }));
  }

  function updateModalScheduleBlock(weekday, blockId, field, value) {
    markScheduleTouched();
    setScheduleDraft((prev) => ({
      ...prev,
      [weekday]: (Array.isArray(prev?.[weekday]) ? prev[weekday] : []).map((block) =>
        block.id === blockId ? { ...block, [field]: value } : block
      ),
    }));
  }

  function updateModalScheduleBlockTime(field, value) {
    markScheduleTouched();
    setScheduleDraft((prev) => {
      const next = {};

      for (const [weekday, blocks] of Object.entries(prev || {})) {
        next[weekday] = (Array.isArray(blocks) ? blocks : []).map((block) => ({
          ...block,
          [field]: value,
        }));
      }

      return next;
    });
  }

  function removeModalScheduleBlock(weekday, blockId) {
    markScheduleTouched();
    setScheduleDraft((prev) => {
      const current = Array.isArray(prev?.[weekday]) ? prev[weekday] : [];
      const nextBlocks = current.filter((block) => block.id !== blockId);

      return {
        ...prev,
        [weekday]: nextBlocks.length > 0 ? nextBlocks : [createModalScheduleBlock()],
      };
    });
  }

  function validateLiveEmployeeField(name, value) {
    if (!['contactNumber', 'email'].includes(name)) {
      return;
    }

    const message = getLiveEmployeeFieldError(name, value);

    setLiveEditErrors((prev) => {
      const next = { ...prev };

      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }

      return next;
    });

    setEditErrors((prev) => {
      const next = new Set(prev);

      if (message) {
        next.add(name);
      } else {
        next.delete(name);
      }

      return next;
    });
  }

  function validateEditFields() {
    const required = [
      'firstName',
      'lastName',
      'homeAddress',
      'contactNumber',
      'email',
      'birthday',
      'gender',
      'startDate',
      'employmentType',
    ];

    const errors = new Set();

    required.forEach((name) => {
      if (!editedEmployee?.[name]) {
        errors.add(name);
      }
    });

    if (!editedEmployee?.branchId) {
      errors.add('branchId');
    }

    if (editedEmployee?.role === 'Dentist' && scheduleTouched) {
      const skipLockedScheduleValidation = hasLockedScheduleDays() && !scheduleTouched;

      if (!skipLockedScheduleValidation && !editedEmployee?.workStartTime) {
        errors.add('workStartTime');
      }

      if (!skipLockedScheduleValidation && !editedEmployee?.workEndTime) {
        errors.add('workEndTime');
      }

      const days = parseWorkDays(editedEmployee?.workDays);

      if (!skipLockedScheduleValidation && days.length === 0) {
        errors.add('workDays');
      }
    } else if (editedEmployee?.role === 'Receptionist' || editedEmployee?.role === 'Dental Assistant') {
      if (!editedEmployee?.shiftType) {
        errors.add('shiftType');
      }
      if (!editedEmployee?.workStartTime) {
        errors.add('workStartTime');
      }
      if (!editedEmployee?.workEndTime) {
        errors.add('workEndTime');
      }
    }

    return errors;
  }

  function validateEditFormatFields() {
    const errors = new Set();

    if (!isValidContactNumber(editedEmployee?.contactNumber)) {
      errors.add('contactNumber');
    }

    if (!isValidEmailAddress(editedEmployee?.email)) {
      errors.add('email');
    }

    if (!isValidDateValue(editedEmployee?.birthday)) {
      errors.add('birthday');
    }

    if (!isValidDateValue(editedEmployee?.startDate)) {
      errors.add('startDate');
    }

    if (!isValidNonNegativeNumber(editedEmployee?.age)) {
      errors.add('age');
    }

    if (!isValidNonNegativeNumber(editedEmployee?.yearsExperience)) {
      errors.add('yearsExperience');
    }

    if (
      editedEmployee?.role === 'Dentist' ||
      editedEmployee?.role === 'Receptionist' ||
      editedEmployee?.role === 'Dental Assistant'
    ) {
      const skipLockedDentistTimeValidation =
        editedEmployee?.role === 'Dentist' &&
        hasLockedScheduleDays() &&
        !scheduleTouched;

      if (!isValidTimeValue(editedEmployee?.workStartTime)) {
        if (!skipLockedDentistTimeValidation) {
          errors.add('workStartTime');
        }
      }

      if (!isValidTimeValue(editedEmployee?.workEndTime)) {
        if (!skipLockedDentistTimeValidation) {
          errors.add('workEndTime');
        }
      }
    }

    return errors;
  }

  function getPreparedEmployeeForSave() {
    let nextEmployee = editedEmployee;

    if (editedEmployee?.role === 'Dentist' && scheduleTouched) {
      const checkedDays = parseWorkDays(editedEmployee?.workDays);
      const assignedBranchId = Number(editedEmployee?.branchId);

      const scheduleEntries = checkedDays
        .flatMap((day) => {
          const weekday = DAY_TO_WEEKDAY[day];

          if (!Number.isInteger(weekday)) {
            return [];
          }

          const blocks = usePerDayBranchSchedule
            ? (Array.isArray(scheduleDraft?.[weekday]) && scheduleDraft[weekday].length > 0
                ? scheduleDraft[weekday]
                : [createModalScheduleBlock()])
            : [{
                branch_id: assignedBranchId,
                start_time: editedEmployee?.workStartTime || '',
                end_time: editedEmployee?.workEndTime || '',
              }];

          return blocks.map((draft) => {
            const branchId = Number(draft.branch_id || assignedBranchId);
            const startTime = draft.start_time || editedEmployee?.workStartTime || '';
            const endTime = draft.end_time || editedEmployee?.workEndTime || '';

            if (!Number.isInteger(branchId) || branchId <= 0) {
              return null;
            }

            if (!startTime || !endTime) {
              return null;
            }

            return {
              weekday,
              branch_id: branchId,
              start_time: startTime,
              end_time: endTime,
            };
          });
        })
        .filter(Boolean);

      nextEmployee = {
        ...editedEmployee,
        scheduleEntries,
      };
    }

    return nextEmployee;
  }

  function formatEmployeeChangeValue(name, value, employee = editedEmployee) {
    if (name === 'branchId') {
      const branch = branches.find((item) => String(item.id) === String(value));
      return branch?.address ? `${branch.name} - ${branch.address}` : branch?.name || employee?.branchAddress || value || 'Not selected';
    }

    if (name === 'additionalBranchIds' || name === 'branchIds') {
      return formatBranchList(value) || 'None';
    }

    if (name === 'workDays') {
      const days = parseWorkDays(value);
      return days.length ? days.join(', ') : 'Not selected';
    }

    if (name === 'scheduleEntries') {
      const formatted = formatScheduleEntries(value);
      return formatted.length ? formatted.join('; ') : 'Not set';
    }

    return String(value ?? '').trim() || 'Not entered';
  }

  function getEmployeeSaveDetails(nextEmployee) {
    const fields = [
      ['firstName', 'First Name'],
      ['middleName', 'Middle Name'],
      ['lastName', 'Last Name'],
      ['nickname', 'Preferred Nickname'],
      ['suffix', 'Suffix'],
      ['birthday', 'Birthday'],
      ['age', 'Age'],
      ['gender', 'Gender'],
      ['civilStatus', 'Civil Status'],
      ['religion', 'Religion'],
      ['nationality', 'Nationality'],
      ['homeAddress', 'Home Address'],
      ['contactNumber', 'Contact Number'],
      ['email', 'Email Address'],
      ['position', 'Position'],
      ['medicalDegree', 'Medical Degree'],
      ['licenseNumber', 'Medical License Number'],
      ['specialization', 'Specialization'],
      ['workDepartment', 'Specialization / Department'],
      ['yearsExperience', 'Years of Experience'],
      ['skills', 'Skills'],
      ['assignedDentist', 'Assigned Dentist'],
      ['startDate', 'Start Date'],
      ['branchId', 'Assigned Branch'],
      ['additionalBranchIds', 'Also Dentist In Branches'],
      ['employmentType', 'Employment Type'],
      ['shiftType', 'Shift Type'],
      ...(scheduleTouched
        ? [
            ['workDays', 'Work Days'],
            ['workStartTime', 'Work Start Time'],
            ['workEndTime', 'Work End Time'],
            ['scheduleEntries', 'Branch Schedule'],
          ]
        : []),
      ['status', 'Status'],
      ['accessRole', 'Access Role'],
    ];

    const fieldDetails = fields
      .map(([key, label]) => {
        const nextValue = key === 'scheduleEntries' ? nextEmployee?.scheduleEntries : nextEmployee?.[key];
        const previousValue = key === 'scheduleEntries' ? selectedEmployee?.scheduleEntries : selectedEmployee?.[key];
        const formattedNext = formatEmployeeChangeValue(key, nextValue, nextEmployee);
        const formattedPrevious = formatEmployeeChangeValue(key, previousValue, selectedEmployee);

        return {
          key,
          label,
          value: formattedNext,
          previousValue: formattedPrevious,
          changed: formattedNext !== formattedPrevious,
        };
      })
      .filter((detail) => detail.changed);

    const fileDetails = [];
    if (editProfilePhotoFile) {
      fileDetails.push({
        key: 'profilePhoto',
        label: 'Profile Photo',
        value: editProfilePhotoFile.name,
        previousValue: selectedEmployee?.profilePhotoUrl ? 'Existing photo' : 'Not entered',
        changed: true,
      });
    }
    if (editRemoveProfilePhoto) {
      fileDetails.push({
        key: 'profilePhotoRemoved',
        label: 'Profile Photo',
        value: 'Removed',
        previousValue: selectedEmployee?.profilePhotoUrl ? 'Existing photo' : 'Not entered',
        changed: true,
      });
    }
    if (editNewDocuments.length > 0) {
      fileDetails.push({
        key: 'supportingDocumentsAdded',
        label: 'Documents Added',
        value: editNewDocuments.map((file) => file.name).join(', '),
        previousValue: 'Not entered',
        changed: true,
      });
    }
    if (editRemovedDocumentIds.length > 0) {
      fileDetails.push({
        key: 'supportingDocumentsRemoved',
        label: 'Documents Removed',
        value: `${editRemovedDocumentIds.length} document(s)`,
        previousValue: 'Existing documents',
        changed: true,
      });
    }

    return [...fieldDetails, ...fileDetails];
  }

  function handleSaveEmployeeChangesRequest() {
    const errors = validateEditFields();

    if (errors.size > 0) {
      setEditErrors(errors);
      setEditErrorMessage('Please fill in all required fields before saving.');
      setShowEditErrorModal(true);
      return;
    }

    const formatErrors = validateEditFormatFields();

    if (formatErrors.size > 0) {
      setEditErrors(formatErrors);
      setLiveEditErrors((prev) => ({
        ...prev,
        ...(formatErrors.has('contactNumber')
          ? {
              contactNumber:
                'Use 09XXXXXXXXX or +639XXXXXXXXX.',
            }
          : {}),
        ...(formatErrors.has('email')
          ? { email: 'Enter a valid email address.' }
          : {}),
      }));
      setEditErrorMessage('Please fix the highlighted fields before saving.');
      setShowEditErrorModal(true);
      return;
    }

    setEditErrors(new Set());
    const nextEmployee = getPreparedEmployeeForSave();
    setEmployeeSaveConfirmModal({
      nextEmployee,
      details: getEmployeeSaveDetails(nextEmployee),
    });
  }

  async function handleSaveEmployeeChanges() {
    try {
      const nextEmployee = employeeSaveConfirmModal?.nextEmployee || getPreparedEmployeeForSave();
      const updatePayload = employeeToStaffPayload(nextEmployee, {
        includeScheduleEntries: scheduleTouched,
      });
      const requestData = buildEmployeeUpdateFormData(updatePayload);

      const res = await api.patch(
        `/auth/staff-profiles/${editedEmployee.profileId}`,
        requestData
      );

      const savedEmployee = res.data.profile;

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.profileId === savedEmployee.profileId
            ? savedEmployee
            : employee
        )
      );

      setSelectedEmployee(savedEmployee);
      setEditedEmployee(savedEmployee);
      setIsEditingEmployee(false);
      setLiveEditErrors({});
      resetEmployeeEditFiles();
      setEmployeeSaveConfirmModal(null);
      setUsePerDayBranchSchedule(
        Array.isArray(savedEmployee?.scheduleEntries) &&
          savedEmployee.scheduleEntries.length > 0
      );
    } catch (err) {
      console.error('Failed to update employee', err);
      setEditErrorMessage(
        err.response?.data?.message || 'Failed to update employee.'
      );
      setShowEditErrorModal(true);
    }
  }

  function modalField(label, name, type = 'text', filterFn = null) {
    const liveErrorMessage = isEditingEmployee
      ? getLiveEmployeeFieldError(name, editedEmployee?.[name])
      : '';
    const fieldErrorMessage = liveEditErrors[name] || liveErrorMessage;
    const hasError = editErrors.has(name) || Boolean(fieldErrorMessage);
    const isLockedTimeField =
      ['workStartTime', 'workEndTime'].includes(name) &&
      (
        (editedEmployee?.role === 'Dentist' && hasLockedScheduleDays()) ||
        (
          (editedEmployee?.role === 'Receptionist' || editedEmployee?.role === 'Dental Assistant') &&
          editedEmployee?.shiftType === 'Full Day'
        )
      );
    const isFieldDisabled = !isEditingEmployee || isLockedTimeField;

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>
          {label}
          {hasError && (
            <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>
          )}
        </label>

        <input
          type={type}
          name={name}
          value={editedEmployee?.[name] ?? ''}
          onChange={(event) => {
            const val =
              isEditingEmployee && filterFn
                ? filterFn(event.target.value)
                : event.target.value;

            setEditedEmployee((prev) => ({
              ...prev,
              [name]: val,
            }));

          if (
            editedEmployee?.role === 'Dentist' &&
            name === 'workStartTime' &&
            !hasLockedScheduleDays()
          ) {
            updateModalScheduleBlockTime('start_time', val);
          }

          if (
            editedEmployee?.role === 'Dentist' &&
            name === 'workEndTime' &&
            !hasLockedScheduleDays()
          ) {
            updateModalScheduleBlockTime('end_time', val);
          }

          if (
            editedEmployee?.role === 'Dentist' &&
            ['workStartTime', 'workEndTime'].includes(name) &&
            !hasLockedScheduleDays()
          ) {
            markScheduleTouched();
          }

            validateLiveEmployeeField(name, val);
          }}
          readOnly={isFieldDisabled}
          style={{
            ...styles.employeeModalInput,
            ...(isFieldDisabled ? styles.employeeModalInputReadOnly : {}),
            ...(hasError
              ? {
                  borderColor: '#dc2626',
                  borderWidth: '2px',
                }
              : {}),
          }}
        />

        {fieldErrorMessage && (
          <span
            style={{
              color: '#dc2626',
              fontSize: 12,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {fieldErrorMessage}
          </span>
        )}

        {isLockedTimeField && (
          <span style={{ color: '#8b6508', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
            {editedEmployee?.role === 'Dentist'
              ? 'Work hours are locked while this dentist has active appointments on scheduled days.'
              : 'Full Day uses the selected branch operating hours.'}
          </span>
        )}
      </div>
    );
  }

  function modalSelect(label, name, options) {
    const hasError = editErrors.has(name);

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>
          {label}
          {hasError && (
            <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>
          )}
        </label>

        <select
          name={name}
          value={editedEmployee?.[name] ?? ''}
          onChange={handleEmployeeInputChange}
          disabled={!isEditingEmployee}
          style={{
            ...styles.employeeModalInput,
            ...(!isEditingEmployee ? styles.employeeModalInputReadOnly : {}),
            ...(hasError
              ? {
                  borderColor: '#dc2626',
                  borderWidth: '2px',
                }
              : {}),
          }}
        >
          <option value="">Select</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function buildEmployeeUpdateFormData(payload) {
    const data = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) || typeof value === 'object') {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value);
      }
    });

    if (editProfilePhotoFile) {
      data.append('profilePhoto', editProfilePhotoFile);
    }
    if (editRemoveProfilePhoto) {
      data.append('removeProfilePhoto', JSON.stringify(true));
    }

    editNewDocuments.forEach((file) => {
      data.append('supportingDocuments', file);
    });

    if (editRemovedDocumentIds.length > 0) {
      data.append('removeDocumentIds', JSON.stringify(editRemovedDocumentIds));
    }

    return data;
  }

  function toggleEditedDentistSpecialization(value, checked) {
    setEditedEmployee((prev) => {
      const current = parseSpecializations(prev?.specializations || prev?.workDepartment || prev?.specialization);
      const next = new Set(current);

      if (checked) next.add(value);
      else next.delete(value);

      const specializations = Array.from(next);
      const text = specializations.join(', ');

      return {
        ...prev,
        specializations,
        specialization: text,
        workDepartment: text,
      };
    });
  }

  function modalDentistSpecializations() {
    const options = serviceCategories.length > 0 ? serviceCategories : DENTIST_SPECIALIZATIONS;
    const selected = parseSpecializations(
      editedEmployee?.specializations || editedEmployee?.workDepartment || editedEmployee?.specialization
    );
    const hasError = editErrors.has('workDepartment');

    if (!isEditingEmployee) {
      return (
        <div style={styles.employeeModalField}>
          <label style={styles.employeeModalLabel}>Specialization / Department</label>
          <input
            type="text"
            value={selected.join(', ')}
            readOnly
            style={{
              ...styles.employeeModalInput,
              ...styles.employeeModalInputReadOnly,
            }}
          />
        </div>
      );
    }

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>
          Specialization / Department
          {hasError && (
            <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>
          )}
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: screenWidth <= 640 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 8,
            padding: 12,
            border: `1px solid ${hasError ? '#dc2626' : '#d9e2ef'}`,
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          {options.map((option) => (
            <label
              key={option}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#172554',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(event) =>
                  toggleEditedDentistSpecialization(option, event.target.checked)
                }
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  function modalBranchSelect() {
    const hasError = editErrors.has('branchId');
    const isBranchLocked =
      editedEmployee?.role === 'Dentist' &&
      isEditingEmployee &&
      scheduleLocks.branchLocked;

    if (!isEditingEmployee) {
      return (
        <div style={styles.employeeModalField}>
          <label style={styles.employeeModalLabel}>Assigned Branch</label>

          <input
            type="text"
            value={
              editedEmployee?.branchAddress || editedEmployee?.branchName || ''
            }
            readOnly
            style={{
              ...styles.employeeModalInput,
              ...styles.employeeModalInputReadOnly,
            }}
          />
        </div>
      );
    }

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>
          Assigned Branch
          {hasError && (
            <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>
          )}
        </label>

        <select
          name="branchId"
          value={
            editedEmployee?.branchId != null
              ? String(editedEmployee.branchId)
              : ''
          }
          onChange={(event) => {
            const selected = branches.find(
              (branch) => String(branch.id) === event.target.value
            );

            if (editedEmployee?.role === 'Dentist') {
              markScheduleTouched();
            }

            setEditedEmployee((prev) => {
              const nextAdditionalBranchIds = (Array.isArray(prev?.additionalBranchIds) ? prev.additionalBranchIds : [])
                .filter((branchId) => String(branchId) !== String(event.target.value));
              const next = {
                ...prev,
                branchId: event.target.value,
                branchName: selected?.name || '',
                branchAddress: selected?.address
                  ? `${selected.name} - ${selected.address}`
                  : selected?.name || '',
                additionalBranchIds: nextAdditionalBranchIds,
                branchIds: [
                  event.target.value,
                  ...nextAdditionalBranchIds,
                ].filter(Boolean),
              };

              if (prev?.role !== 'Dentist' && prev?.shiftType === 'Full Day') {
                const hours = parseBranchOperatingHours(selected?.operating_hours);
                if (hours) {
                  next.workStartTime = hours.start;
                  next.workEndTime = hours.end;
                }
              }

              return next;
            });

            if (event.target.value) {
              setEditErrors((prev) => {
                const next = new Set(prev);
                next.delete('branchId');
                return next;
              });
            }
          }}
          disabled={isBranchLocked}
          style={{
            ...styles.employeeModalInput,
            ...(isBranchLocked ? styles.employeeModalInputReadOnly : {}),
            ...(hasError
              ? {
                  borderColor: '#dc2626',
                  borderWidth: '2px',
                }
              : {}),
          }}
        >
          <option value="">Select branch</option>

          {branches.map((branch) => (
            <option key={branch.id} value={String(branch.id)}>
              {branch.address
                ? `${branch.name} - ${branch.address}`
                : branch.name}
            </option>
          ))}
        </select>

        {isBranchLocked && (
          <span style={{ color: '#8b6508', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
            Assigned Branch is locked until active appointments in this branch are completed.
          </span>
        )}
      </div>
    );
  }

  function toggleEditedAdditionalBranch(value, checked) {
    setEditedEmployee((prev) => {
      const homeBranchId = String(prev?.branchId || '');
      const next = new Set((Array.isArray(prev?.additionalBranchIds) ? prev.additionalBranchIds : []).map(String));

      if (checked && String(value) !== homeBranchId) next.add(String(value));
      else next.delete(String(value));

      const additionalBranchIds = Array.from(next);
      return {
        ...prev,
        additionalBranchIds,
        branchIds: Array.from(new Set([homeBranchId, ...additionalBranchIds].filter(Boolean))),
      };
    });
  }

  function formatBranchList(branchIds = []) {
    const labels = normalizeBranchIdArray(branchIds)
      .map((branchId) => {
        const branch = branches.find((item) => String(item.id) === String(branchId));
        return branch?.address ? `${branch.name} - ${branch.address}` : branch?.name || '';
      })
      .filter(Boolean);
    return labels.join(', ');
  }

  function modalAdditionalBranches() {
    if (editedEmployee?.role !== 'Dentist') return null;

    const selected = normalizeBranchIdArray(editedEmployee?.additionalBranchIds);
    const options = branches.filter((branch) => String(branch.id) !== String(editedEmployee?.branchId || ''));

    if (!isEditingEmployee) {
      return (
        <div style={styles.employeeModalField}>
          <label style={styles.employeeModalLabel}>Also Dentist In Branches</label>
          <input
            type="text"
            value={formatBranchList(selected) || 'None'}
            readOnly
            style={{
              ...styles.employeeModalInput,
              ...styles.employeeModalInputReadOnly,
            }}
          />
        </div>
      );
    }

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>Also Dentist In Branches (Optional)</label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 20px',
            padding: 12,
            border: '1px solid #d9e2ef',
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          {options.length === 0 ? (
            <span style={{ color: '#64748b', fontSize: 13 }}>No other branches available</span>
          ) : (
            options.map((branch) => {
              const value = String(branch.id);
              return (
                <label
                  key={branch.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#172554',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.map(String).includes(value)}
                    onChange={(event) =>
                      toggleEditedAdditionalBranch(value, event.target.checked)
                    }
                  />
                  {branch.address ? `${branch.name} - ${branch.address}` : branch.name}
                </label>
              );
            })
          )}
        </div>
        <span style={{ color: '#6f675b', fontSize: 12, marginTop: 4 }}>
          These branches show the dentist as part of the branch, but do not create appointment availability.
        </span>
      </div>
    );
  }

  function modalWorkDays() {
    const checkedDays = parseWorkDays(editedEmployee?.workDays);

    return (
      <div style={{ ...styles.employeeModalField, marginTop: editedEmployee?.role === 'Dentist' && isEditingEmployee ? 8 : 0 }}>
        <label style={styles.employeeModalLabel}>Work Schedule Days</label>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 24px',
            marginTop: 8,
          }}
        >
          {EDIT_DAY_OPTIONS.map((day) => {
            const isLocked = isScheduleDayLocked(day);
            const lock = getScheduleLockForDay(day);

            return (
              <label
                key={day}
                title={
                  isLocked
                    ? `${day} is locked because this dentist has active appointments in ${lock?.branch_address || lock?.branch_name || 'this branch'}.`
                    : ''
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  color: isLocked ? '#8b6508' : '#334155',
                  cursor: isEditingEmployee && !isLocked ? 'pointer' : 'default',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: isLocked ? 700 : 400,
                }}
              >
                <input
                  type="checkbox"
                  value={day}
                  checked={checkedDays.includes(day)}
                  disabled={!isEditingEmployee || isLocked}
                  onChange={(event) => {
                    if (isLocked) return;

                    markScheduleTouched();

                    const newDays = event.target.checked
                      ? [...checkedDays, day]
                      : checkedDays.filter((d) => d !== day);
                    const weekday = DAY_TO_WEEKDAY[day];

                    setEditedEmployee((prev) => ({
                      ...prev,
                      workDays: newDays,
                    }));

                    if (event.target.checked && usePerDayBranchSchedule) {
                      ensureModalScheduleDay(weekday);
                    } else if (!event.target.checked) {
                      removeModalScheduleDay(weekday);
                    }
                  }}
                  style={{
                    accentColor: isLocked ? '#d4af37' : '#2563eb',
                    cursor: isEditingEmployee && !isLocked ? 'pointer' : 'default',
                  }}
                />

                {day}
              </label>
            );
          })}
        </div>

        {hasLockedScheduleDays() && (
          <span style={{ color: '#8b6508', fontSize: 12, fontWeight: 700, marginTop: 8 }}>
            Gold days are locked until their active appointments are completed.
          </span>
        )}
      </div>
    );
  }

  function modalScheduleEntries() {
    const formatted = formatScheduleEntries(editedEmployee?.scheduleEntries);

    if (editedEmployee?.role !== 'Dentist' || formatted.length === 0) {
      return null;
    }

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>Branch Schedule</label>

        <div
          style={{
            ...styles.employeeModalInput,
            ...styles.employeeModalInputReadOnly,
            whiteSpace: 'pre-line',
            lineHeight: 1.7,
            padding: '12px 14px',
          }}
        >
          {formatted.join('\n')}
        </div>
      </div>
    );
  }

  function modalScheduleEditor() {
    if (editedEmployee?.role !== 'Dentist') {
      return null;
    }

    if (!isEditingEmployee) {
      return null;
    }

    const checkedDays = parseWorkDays(editedEmployee?.workDays);
    const assignedBranchId = Number(editedEmployee?.branchId);
    const selectedAdditionalBranchIds = normalizeBranchIdArray(editedEmployee?.additionalBranchIds);
    const canUsePerDayBranchSchedule = selectedAdditionalBranchIds.length > 0;
    const allowedScheduleBranchIds = new Set([
      String(assignedBranchId || ''),
      ...selectedAdditionalBranchIds.map(String),
    ].filter(Boolean));

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>
          Per-day Branch Schedule (Optional)
        </label>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
          }}
        >
          <input
            type="checkbox"
            checked={usePerDayBranchSchedule}
            disabled={!canUsePerDayBranchSchedule}
            onChange={(event) => {
              if (!canUsePerDayBranchSchedule) return;
              markScheduleTouched();
              setUsePerDayBranchSchedule(event.target.checked);
              if (event.target.checked) {
                checkedDays.forEach((day) => ensureModalScheduleDay(DAY_TO_WEEKDAY[day]));
              }
            }}
            style={{
              accentColor: '#2563eb',
              cursor: canUsePerDayBranchSchedule ? 'pointer' : 'not-allowed',
            }}
          />

          <span style={{ fontSize: 13, color: '#334155' }}>
            Enable branch time blocks per selected day
          </span>
        </div>

        {!canUsePerDayBranchSchedule && (
          <p style={{ margin: '6px 0 0', color: '#8b6508', fontSize: 12, fontWeight: 700 }}>
            Select another branch in "Also Dentist In Branches" to enable this.
          </p>
        )}

        {usePerDayBranchSchedule && (
          <div style={{ marginTop: 16, display: 'grid', gap: 18 }}>
            {checkedDays.length === 0 && (
              <span style={{ color: '#8b6508', fontSize: 12, fontWeight: 700 }}>
                Select work schedule days first.
              </span>
            )}

            {checkedDays.map((day) => {
              const weekday = DAY_TO_WEEKDAY[day];
              const isLocked = isScheduleDayLocked(day);
              const lock = getScheduleLockForDay(day);
              const blocks = Array.isArray(scheduleDraft?.[weekday]) && scheduleDraft[weekday].length > 0
                ? scheduleDraft[weekday]
                : [createModalScheduleBlock()];

              return (
                <div
                  key={day}
                  style={{
                    display: 'grid',
                    gap: 10,
                    borderLeft: isLocked ? '3px solid #d4af37' : '3px solid transparent',
                    paddingLeft: isLocked ? 8 : 0,
                    paddingBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div
                      title={
                        isLocked
                          ? `${day} has active appointments in ${lock?.branch_address || lock?.branch_name || 'this branch'}.`
                          : ''
                      }
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isLocked ? '#8b6508' : '#0f172a',
                      }}
                    >
                      {day}
                    </div>

                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => addModalScheduleBlock(weekday)}
                      style={{
                        ...styles.modalButton,
                        padding: '10px 12px',
                        minWidth: 86,
                        height: 42,
                        background: isLocked ? '#eef2f7' : '#d4af37',
                        color: isLocked ? '#0f172a' : '#ffffff',
                        opacity: isLocked ? 0.55 : 1,
                        boxShadow: isLocked ? 'none' : '0 8px 18px rgba(139, 101, 8, 0.18)',
                      }}
                    >
                      Add Branch
                    </button>
                  </div>

                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr 1fr auto',
                        gap: 10,
                        alignItems: 'center',
                      }}
                    >
                      <select
                        value={block.branch_id || assignedBranchId || ''}
                        disabled={isLocked}
                        onChange={(event) =>
                          updateModalScheduleBlock(weekday, block.id, 'branch_id', event.target.value)
                        }
                        style={{
                          ...styles.employeeModalInput,
                          ...(isLocked ? styles.employeeModalInputReadOnly : {}),
                        }}
                      >
                        <option value="">Select branch</option>

                        {branches
                          .filter((branch) =>
                            allowedScheduleBranchIds.has(String(branch.id)) ||
                            String(branch.id) === String(block.branch_id || '')
                          )
                          .map((branch) => (
                          <option key={branch.id} value={String(branch.id)}>
                            {branch.address
                              ? `${branch.name} - ${branch.address}`
                              : branch.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={block.start_time || editedEmployee?.workStartTime || ''}
                        disabled={isLocked}
                        onChange={(event) =>
                          updateModalScheduleBlock(weekday, block.id, 'start_time', event.target.value)
                        }
                        style={{
                          ...styles.employeeModalInput,
                          ...(isLocked ? styles.employeeModalInputReadOnly : {}),
                        }}
                      />

                      <input
                        type="time"
                        value={block.end_time || editedEmployee?.workEndTime || ''}
                        disabled={isLocked}
                        onChange={(event) =>
                          updateModalScheduleBlock(weekday, block.id, 'end_time', event.target.value)
                        }
                        style={{
                          ...styles.employeeModalInput,
                          ...(isLocked ? styles.employeeModalInputReadOnly : {}),
                        }}
                      />

                      <button
                        type="button"
                        disabled={isLocked || blocks.length === 1}
                        onClick={() => removeModalScheduleBlock(weekday, block.id)}
                        style={{
                          ...styles.modalButton,
                          padding: '10px 12px',
                          minWidth: 86,
                          height: 42,
                          background: '#eef2f7',
                          color: '#0f172a',
                          opacity: isLocked || blocks.length === 1 ? 0.55 : 1,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}

            <div style={{ fontSize: 12, color: '#6f675b', marginTop: 10, marginBottom: 8 }}>
              Only checked days in "Work Schedule Days" will be saved.
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/adminPatients" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link
            to="/adminEmployees"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i
              className="fi fi-rr-stethoscope"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Clinic Employee</span>
          </Link>

          <Link to="/adminInventory" style={styles.menuItem}>
            <i className="fi fi-rr-boxes" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Inventory</span>
          </Link>

          <Link to="/adminTransactions" style={styles.menuItem}>
            <i className="fi fi-rr-file-invoice-dollar" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Transactions</span>
          </Link>

          <Link to="/adminLogs" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-list"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Audit Logs</span>
          </Link>

          <Link to="/adminNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
            <NotificationUnreadBadge />
          </Link>

          <Link to="/adminReports" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-line-up"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Reports</span>
          </Link>

          <Link to="/adminSettings" style={styles.menuItem}>
            <i className="fi fi-rr-settings" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Settings</span>
          </Link>
        </nav>

        <div style={styles.logoutSection}>
          <div style={styles.dropdownDivider}></div>

          <button
            type="button"
            style={{
              ...styles.menuItem,
              ...styles.logoutItem,
              width: '100%',
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
            <AdminProfileMenu styles={styles} adminName={adminName} />
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Employee Records</span>

              <h2 style={styles.heroTitle}>
                Monitor employee performance and clinic staff records.
              </h2>

              <p style={styles.heroText}>
                Track dentists, assistants, and receptionists while managing
                employee details, roles, and daily clinic operations.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i className="fi fi-rr-stethoscope" style={styles.heroIcon}></i>
            </div>
          </section>

          <section style={styles.employeeSummary}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryCardIcon}>
                <img
                  src={doctorIcon}
                  alt="Dentists"
                  style={styles.summaryCardImg}
                />
              </div>

              <div style={styles.summaryCardText}>
                <h3 style={styles.summaryCardTitle}>Dentists</h3>
                <p style={styles.summaryCardNumber}>{totalDentists}</p>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryCardIcon}>
                <img
                  src={dentalAssistantIcon}
                  alt="Dental Assistants"
                  style={styles.summaryCardImg}
                />
              </div>

              <div style={styles.summaryCardText}>
                <h3 style={styles.summaryCardTitle}>Dental Assistant</h3>
                <p style={styles.summaryCardNumber}>
                  {totalDentalAssistants}
                </p>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryCardIcon}>
                <img
                  src={receptionistIcon}
                  alt="Receptionists"
                  style={styles.summaryCardImg}
                />
              </div>

              <div style={styles.summaryCardText}>
                <h3 style={styles.summaryCardTitle}>Receptionists</h3>
                <p style={styles.summaryCardNumber}>{totalReceptionists}</p>
              </div>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search employee name or ID"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.rightActions}>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                style={styles.roleFilter}
              >
                <option value="all">All Roles</option>
                <option value="Dentist">Dentist</option>
                <option value="Dental Assistant">Dental Assistant</option>
                <option value="Receptionist">Receptionist</option>
              </select>

              <Link to="/adminEmployeeForm" style={styles.addEmployeeBtn}>
                <i className="fi fi-rr-plus" style={styles.addEmployeeIcon}></i>
                <span>Add Employee</span>
              </Link>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Employee List</h3>

              <button
                type="button"
                style={styles.exportBtn}
                onClick={exportEmployeesToCSV}
              >
                <i className="fi fi-rr-file-csv" style={styles.exportIcon}></i>
                CSV
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.employeeTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Photo</th>
                    <th style={styles.tableHead}>Employee ID</th>
                    <th style={styles.tableHead}>Clinic Position</th>
                    <th style={styles.tableHead}>Last Name</th>
                    <th style={styles.tableHead}>First Name</th>
                    <th style={styles.tableHead}>Middle Name</th>
                    <th style={styles.tableHead}>Branch</th>
                    <th style={styles.tableHead}>Age</th>
                    <th style={styles.tableHead}>Gender</th>
                    <th style={styles.tableHead}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={styles.emptyRow}>
                        No employee records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((employee) => (
                      <tr key={employee.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <EmployeeAvatar employee={employee} styles={styles} size="small" />
                        </td>
                        <td style={styles.tableCell}>{employee.id}</td>
                        <td style={styles.tableCell}>{employee.role}</td>
                        <td style={styles.tableCell}>{employee.lastName}</td>
                        <td style={styles.tableCell}>{employee.firstName}</td>
                        <td style={styles.tableCell}>{employee.middleName}</td>
                        <td style={styles.tableCell}>
                          {employee.branchAddress || employee.branchName || '-'}
                        </td>
                        <td style={styles.tableCell}>{employee.age}</td>
                        <td style={styles.tableCell}>{employee.gender}</td>
                        <td style={styles.tableCell}>
                          <div style={styles.actionGroup}>
                            <button
                              type="button"
                              style={styles.viewBtn}
                              onClick={() => openEmployeeModal(employee)}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              style={styles.pdfBtn}
                              title="PDF"
                              onClick={() => exportEmployeeToPDF(employee)}
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
                Prev
              </button>

              <span style={styles.pageInfo}>
                {filteredEmployees.length === 0
                  ? 'Page 0 of 0'
                  : `Page ${currentPage} of ${totalPages}`}
              </span>

              <button
                type="button"
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
                }}
              >
                Next
              </button>
            </div>
          </section>
        </main>
      </div>

      {showEmployeeModal && editedEmployee && (
        <div
          style={styles.employeeModal}
          onClick={handleEmployeeModalOverlayClick}
        >
          <div style={styles.employeeModalContent}>
            <div style={styles.employeeModalHeader}>
              <div style={styles.employeeModalHeaderProfile}>
                <EmployeeAvatar
                  employee={{
                    ...editedEmployee,
                    profilePhotoUrl: editRemoveProfilePhoto
                      ? ''
                      : editProfilePhotoPreview || editedEmployee.profilePhotoUrl,
                  }}
                  styles={styles}
                  size="large"
                />
                <div>
                <h2 style={styles.employeeModalTitle}>
                  Clinic Employee Form
                </h2>
                <p style={styles.employeeModalSubtitle}>
                  {editedEmployee.id} • {editedEmployee.role}
                </p>
                </div>
              </div>

              <button
                type="button"
                style={{
                  ...styles.employeeModalCloseBtn,
                  display: isEditingEmployee ? 'none' : 'flex',
                }}
                onClick={() => setShowEmployeeCloseConfirmModal(true)}
              >
                ×
              </button>
            </div>

            <div style={styles.employeeModalBody}>
              <div style={styles.employeeModalSection}>
                <h3 style={styles.employeeModalSectionTitle}>
                  Section 1 - Personal Information
                </h3>

                {isEditingEmployee && (
                  <div style={styles.employeePhotoEditRow}>
                    <button
                      type="button"
                      style={styles.employeePhotoReplaceBtn}
                      onClick={() => editPhotoInputRef.current?.click()}
                    >
                      <i className="fi fi-rr-camera"></i>
                      Replace Photo
                    </button>
                    {(editProfilePhotoPreview || editedEmployee.profilePhotoUrl) && !editRemoveProfilePhoto && (
                      <button
                        type="button"
                        style={{
                          ...styles.employeePhotoReplaceBtn,
                          background: '#fee2e2',
                          color: '#dc2626',
                          boxShadow: 'none',
                        }}
                        onClick={() => setPhotoRemoveConfirm(true)}
                      >
                        <i className="fi fi-rr-trash"></i>
                        Remove Photo
                      </button>
                    )}
                    <span style={styles.employeePhotoHint}>JPG or PNG, max 5MB</span>
                    <input
                      ref={editPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      style={{ display: 'none' }}
                      onChange={(event) => handleEditPhotoSelect(event.target.files?.[0])}
                    />
                  </div>
                )}

                <div style={styles.employeeModalGridThree}>
                  {modalField('First Name', 'firstName', 'text', filterNameVal)}
                  {modalField(
                    'Middle Name',
                    'middleName',
                    'text',
                    filterNameVal
                  )}
                  {modalField('Last Name', 'lastName', 'text', filterNameVal)}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalField(
                    'Preferred Nickname',
                    'nickname',
                    'text',
                    filterNameVal
                  )}
                  {modalField('Suffix', 'suffix')}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalField('Birthday', 'birthday', 'date')}
                  {modalField('Age', 'age', 'number')}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalSelect('Gender', 'gender', ['Female', 'Male'])}
                  {modalSelect('Civil Status', 'civilStatus', [
                    'Single',
                    'Married',
                    'Widowed',
                    'Separated',
                    'Divorced',
                  ])}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalSelect('Religion', 'religion', [
                    'Catholic',
                    'Christian',
                    'Islam',
                    'Iglesia ni Cristo',
                    'Buddhism',
                    'Hinduism',
                  ])}

                  {modalField('Nationality', 'nationality')}
                </div>

                <div style={styles.employeeModalGridThree}>
                  {modalField('Home Address', 'homeAddress')}
                  {modalField(
                    'Contact Number',
                    'contactNumber',
                    'text',
                    filterContactVal
                  )}
                  {modalField(
                    'Email Address',
                    'email',
                    'text',
                    filterEmailVal
                  )}
                </div>
              </div>

              <div style={styles.employeeModalSection}>
                <h3 style={styles.employeeModalSectionTitle}>
                  Section 2 - Professional Information
                </h3>

                <div style={styles.employeeModalGridTwo}>
                  {modalField(
                    'Position',
                    'position',
                    'text',
                    filterProfTextVal
                  )}
                  {modalField(
                    'Years of Experience',
                    'yearsExperience',
                    'number'
                  )}
                </div>

                {editedEmployee.role === 'Dentist' && (
                  <>
                    <div style={styles.employeeModalGridTwo}>
                      {modalField(
                        'Medical Degree',
                        'medicalDegree',
                        'text',
                        filterProfTextVal
                      )}
                      {modalField('Medical License Number', 'licenseNumber')}
                    </div>

                    <div style={styles.employeeModalGridTwo}>
                      {modalField(
                        'Specialization',
                        'specialization',
                        'text',
                        filterProfTextVal
                      )}
                      {modalField('Skills', 'skills', 'text', filterProfTextVal)}
                    </div>
                  </>
                )}

                {editedEmployee.role !== 'Dentist' && (
                  <div style={styles.employeeModalGridTwo}>
                    {modalField('Skills', 'skills', 'text', filterProfTextVal)}
                    {editedEmployee.role === 'Dental Assistant'
                      ? modalField('Assigned Dentist', 'assignedDentist')
                      : modalField('Access Role', 'accessRole')}
                  </div>
                )}

                <EmployeeDocumentsList
                  employee={editedEmployee}
                  styles={styles}
                  isEditing={isEditingEmployee}
                  newDocuments={editNewDocuments}
                  removedDocumentIds={editRemovedDocumentIds}
                  inputRef={editDocumentInputRef}
                  onAddFiles={handleEditDocumentFiles}
                  onRemoveExisting={requestRemoveExistingEmployeeDocument}
                  onRemoveNew={requestRemoveNewEmployeeDocument}
                />
              </div>

              <div style={styles.employeeModalSection}>
                <h3 style={styles.employeeModalSectionTitle}>
                  Section 3 - Work Details
                </h3>

                <div style={styles.employeeModalGridTwo}>
                  {modalField('Start Date', 'startDate', 'date')}
                  {modalBranchSelect()}
                </div>

                {(editedEmployee?.role === 'Dentist' ||
                  editedEmployee?.role === 'Dental Assistant') && (
                  <div style={styles.employeeModalGridTwo}>
                    {editedEmployee?.role === 'Dentist'
                      ? modalDentistSpecializations()
                      : modalField(
                          'Department',
                          'workDepartment',
                          'text',
                          filterProfTextVal
                        )}
                    {editedEmployee?.role === 'Dentist'
                      ? modalAdditionalBranches()
                      : editedEmployee?.role === 'Dental Assistant' &&
                        modalField('Assigned Dentist', 'assignedDentist')}
                  </div>
                )}

                <div style={styles.employeeModalGridTwo}>
                  {modalSelect('Employment Type', 'employmentType', [
                    'Full-Time',
                    'Part-Time',
                    'Contract',
                    'Intern',
                  ])}
                  {modalSelect(
                    'Shift Type',
                    'shiftType',
                    getShiftTypeOptions(editedEmployee?.role)
                  )}
                </div>

                {modalScheduleEntries()}
                {modalScheduleEditor()}
                {modalWorkDays()}

                <div style={styles.employeeModalGridTwo}>
                  {modalField('Work Start Time', 'workStartTime', 'time')}
                  {modalField('Work End Time', 'workEndTime', 'time')}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalSelect('Status', 'status', [
                    'Active',
                    'Inactive',
                    'Archived',
                  ])}
                  {modalField('Access Role', 'accessRole')}
                </div>
              </div>
            </div>

            <div style={styles.employeeModalActions}>
              {!isEditingEmployee ? (
                <>
                  <button
                    type="button"
                    style={styles.employeeEditBtn}
                    onClick={() => setShowEmployeeEditConfirmModal(true)}
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    style={styles.employeeCloseBtn}
                    onClick={handleCancelEmployeeEditModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.employeeEditBtn,
                      minWidth: isMobile ? '100%' : 150,
                    }}
                    onClick={handleSaveEmployeeChangesRequest}
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showEmployeeCloseConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowEmployeeCloseConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Close Employee Details</h2>
            <p style={styles.modalText}>
              Do you want to close this employee information window?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowEmployeeCloseConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={closeEmployeeModal}
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmployeeEditConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowEmployeeEditConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-edit" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Edit Employee Information</h2>
            <p style={styles.modalText}>
              Do you want to edit this employee information?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowEmployeeEditConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.confirmBtn }}
                onClick={handleEditEmployee}
                disabled={scheduleLocksLoading}
              >
                {scheduleLocksLoading ? 'Checking...' : 'Yes, Edit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleLockWarningModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowScheduleLockWarningModal(false);
            }
          }}
        >
          <div style={{ ...styles.modalContent, width: isMobile ? '100%' : 520, maxWidth: 520 }}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#fff7db',
                color: '#8b6508',
              }}
            >
              <i className="fi fi-rr-calendar-clock" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Schedule Days Locked</h2>
            <p style={styles.modalText}>
              This dentist has active appointments. Assigned Branch and affected schedule days cannot be changed until those appointments are completed or marked no-show.
            </p>

            <div
              style={{
                width: '100%',
                background: '#fffaf0',
                border: '1px solid #f1d47b',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 18,
                color: '#475569',
                fontSize: 13,
                lineHeight: 1.6,
                textAlign: 'left',
                whiteSpace: 'pre-line',
                boxSizing: 'border-box',
              }}
            >
              {formatScheduleLockSummary()}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  background: '#d4af37',
                  color: '#ffffff',
                  fontWeight: 800,
                  boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
                }}
                onClick={() => setShowScheduleLockWarningModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmployeeEditCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeEmployeeEditCancelConfirmModal();
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Employee Editing</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved employee changes will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeEmployeeEditCancelConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelEmployeeEditModal}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {employeeSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEmployeeSaveConfirmModal(null);
            }
          }}
        >
          <div style={{ ...styles.modalContent, width: isMobile ? '100%' : 560, maxWidth: 560 }}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Employee Changes</h2>
            <p style={styles.modalText}>
              Please review the employee information changes before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {employeeSaveConfirmModal.details.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 13, padding: '8px 0' }}>
                  No employee changes detected.
                </div>
              ) : (
                employeeSaveConfirmModal.details.map((detail) => (
                  <div
                    key={detail.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '7px 0',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 13,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>
                      {detail.label}
                      <small style={{ display: 'block', color: '#94a3b8', marginTop: 2 }}>
                        {detail.previousValue === 'Not entered' || detail.previousValue === 'Not selected' || detail.previousValue === 'Not set'
                          ? 'Added'
                          : 'Changed'}
                      </small>
                    </span>
                    <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: 300, overflowWrap: 'anywhere' }}>
                      {detail.value}
                    </strong>
                  </div>
                ))
              )}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setEmployeeSaveConfirmModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  background: '#d4af37',
                  color: '#ffffff',
                  boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
                }}
                onClick={handleSaveEmployeeChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {documentDeleteConfirm && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDocumentDeleteConfirm(null);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#fee2e2',
                color: '#dc2626',
              }}
            >
              <i className="fi fi-rr-trash" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Delete Document</h2>
            <p style={styles.modalText}>
              {documentDeleteConfirm.type === 'new'
                ? `Are you sure you want to remove ${documentDeleteConfirm.fileName} from the upload list?`
                : `Are you sure you want to remove ${documentDeleteConfirm.fileName}? This will be applied when you save changes.`}
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setDocumentDeleteConfirm(null)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmRemoveEmployeeDocument}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {photoRemoveConfirm && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPhotoRemoveConfirm(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#fee2e2',
                color: '#dc2626',
              }}
            >
              <i className="fi fi-rr-trash" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Remove Photo</h2>
            <p style={styles.modalText}>
              Are you sure you want to remove this employee profile photo?
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setPhotoRemoveConfirm(false)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmRemoveEmployeePhoto}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditErrorModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#fee2e2',
                color: '#dc2626',
              }}
            >
              <i
                className="fi fi-rr-exclamation"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Incomplete Form</h2>
            <p style={styles.modalText}>{editErrorMessage}</p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  background: '#dc2626',
                  color: '#ffffff',
                }}
                onClick={() => setShowEditErrorModal(false)}
              >
                OK
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

      {showExportModal && (
        <div
          style={styles.exportModalOverlay}
          onClick={handleExportModalOverlayClick}
        >
          <div style={styles.exportModalContent}>
            <h2 style={styles.exportModalTitle}>No Employee Records</h2>

            <div style={styles.exportModalDivider}></div>

            <p style={styles.exportModalText}>
              No employee records available to export.
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
    </div>
  );
}

function EmployeeAvatar({ employee, styles, size = 'small' }) {
  const photoUrl = employeeFileUrl(employee?.profilePhotoUrl);
  const isLarge = size === 'large';

  return (
    <div style={isLarge ? styles.employeePhotoLarge : styles.employeePhotoSmall}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          style={isLarge ? styles.employeePhotoLargeImg : styles.employeePhotoSmallImg}
        />
      ) : (
        <i className="fi fi-rr-user" style={isLarge ? styles.employeePhotoLargeIcon : styles.employeePhotoSmallIcon}></i>
      )}
    </div>
  );
}

function EmployeeDocumentsList({
  employee,
  styles,
  isEditing = false,
  newDocuments = [],
  removedDocumentIds = [],
  inputRef,
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
}) {
  const removedIds = new Set(removedDocumentIds);
  const documents = (employee?.supportingDocuments || []).filter((document) =>
    !removedIds.has(document.id)
  );

  return (
    <div style={styles.employeeDocumentsBlock}>
      <h4 style={styles.employeeDocumentsTitle}>Supporting Documents</h4>

      {isEditing && (
        <div
          style={styles.employeeDocumentDropzone}
          onClick={() => inputRef?.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            onAddFiles(event.dataTransfer.files);
          }}
        >
          <i className="fi fi-rr-upload" style={styles.employeeDocumentUploadIcon}></i>
          <strong>Drop files here or click to upload</strong>
          <span>PDF, JPG, PNG up to 5MB each</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="application/pdf,image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={(event) => onAddFiles(event.target.files)}
          />
        </div>
      )}

      {documents.length === 0 && newDocuments.length === 0 ? (
        <div style={styles.employeeDocumentsEmpty}>No supporting documents uploaded.</div>
      ) : (
        <div style={styles.employeeDocumentsList}>
          {documents.map((document) => (
            <div
              key={document.id || document.file_url}
              style={styles.employeeDocumentItem}
            >
              <a
                href={employeeFileUrl(document.file_url)}
                target="_blank"
                rel="noreferrer"
                style={styles.employeeDocumentLink}
              >
                <i className="fi fi-rr-document" style={styles.employeeDocumentIcon}></i>
              </a>
              <span style={styles.employeeDocumentInfo}>
                <strong style={styles.employeeDocumentName}>
                  {document.file_name || 'Document'}
                </strong>
                <span style={styles.employeeDocumentMeta}>
                  {formatEmployeeFileSize(document.file_size)}
                </span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  style={styles.employeeDocumentDeleteBtn}
                  onClick={() => onRemoveExisting(document)}
                  title="Remove document"
                >
                  <i className="fi fi-rr-trash"></i>
                </button>
              )}
            </div>
          ))}

          {newDocuments.map((file, index) => (
            <div key={`${file.name}-${file.size}-${index}`} style={styles.employeeDocumentItem}>
              <i className="fi fi-rr-document" style={styles.employeeDocumentIcon}></i>
              <span style={styles.employeeDocumentInfo}>
                <strong style={styles.employeeDocumentName}>{file.name}</strong>
                <span style={styles.employeeDocumentMeta}>
                  New upload - {formatEmployeeFileSize(file.size)}
                </span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  style={styles.employeeDocumentDeleteBtn}
                  onClick={() => onRemoveNew(file, index)}
                  title="Remove document"
                >
                  <i className="fi fi-rr-trash"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function employeeFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^(https?:|blob:|data:)/i.test(fileUrl)) return fileUrl;
  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

function formatEmployeeFileSize(value) {
  const size = Number(value || 0);
  if (!size) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function fileUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load file');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatCSVValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function employeeToStaffPayload(employee, options = {}) {
  const includeScheduleEntries = Boolean(options.includeScheduleEntries);
  const payload = {
    branchId: employee.branchId,
    branchIds: employee.role === 'Dentist'
      ? [
          employee.branchId,
          ...normalizeBranchIdArray(employee.additionalBranchIds),
          ...normalizeBranchIdArray(employee.branchIds),
        ]
      : [employee.branchId].filter(Boolean),
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
    nickname: employee.nickname,
    suffix: employee.suffix,
    birthday: employee.birthday,
    age: employee.age,
    gender: employee.gender,
    civilStatus: employee.civilStatus,
    religion: employee.religion,
    nationality: employee.nationality,
    homeAddress: employee.homeAddress,
    contactNumber: employee.contactNumber,
    email: employee.email,
    position: employee.position,
    specialization: employee.specialization,
    specializations: employee.role === 'Dentist'
      ? parseSpecializations(employee.specializations || employee.workDepartment || employee.specialization)
      : [],
    workDepartment: employee.workDepartment,
    medicalDegree: employee.medicalDegree,
    licenseNumber: employee.licenseNumber,
    yearsExperience: employee.yearsExperience,
    skills: employee.skills,
    startDate: employee.startDate,
    employmentType: employee.employmentType,
    shiftType: employee.shiftType,
    workDays: employee.workDays,
    workStartTime: employee.workStartTime,
    workEndTime: employee.workEndTime,
    status: employee.status,
  };

  if (
    includeScheduleEntries &&
    employee?.role === 'Dentist' &&
    Array.isArray(employee?.scheduleEntries) &&
    employee.scheduleEntries.length > 0
  ) {
    payload.schedule_entries = employee.scheduleEntries;
  }

  return payload;
}

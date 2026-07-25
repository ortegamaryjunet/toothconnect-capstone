import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
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

function getShiftTypeOptions(role) {
  if (role === 'Dentist') {
    return ['By Appointment'];
  }

  return ['Day', 'Afternoon', 'Night'];
}

function parseWorkDays(val) {
  if (!val) {
    return [];
  }

  if (Array.isArray(val)) {
    return val;
  }

  try {
    const parsed = JSON.parse(val);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_) {}

  return String(val)
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
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

export default function AdminEmployees() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeCloseConfirmModal, setShowEmployeeCloseConfirmModal] =
    useState(false);
  const [showEmployeeEditConfirmModal, setShowEmployeeEditConfirmModal] =
    useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editErrors, setEditErrors] = useState(new Set());
  const [showEditErrorModal, setShowEditErrorModal] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [usePerDayBranchSchedule, setUsePerDayBranchSchedule] =
    useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({});

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);

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

    loadEmployees();
    loadBranches();
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
    showEditErrorModal,
    showExportModal,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        setShowEmployeeCloseConfirmModal(false);
        setShowEmployeeEditConfirmModal(false);
        if (showEmployeeModal) {
          setShowEmployeeCloseConfirmModal(true);
        }
        setShowExportModal(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmployeeModal]);

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
        ['Department', safeValue(employee.specialization)],
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

  function openEmployeeModal(employee) {
    setSelectedEmployee(employee);
    setEditedEmployee({ ...employee });
    setIsEditingEmployee(false);

    const hasSchedule =
      Array.isArray(employee?.scheduleEntries) &&
      employee.scheduleEntries.length > 0;

    setUsePerDayBranchSchedule(hasSchedule);

    const draft = {};

    for (const entry of employee?.scheduleEntries || []) {
      const weekday = Number(entry.weekday);

      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        continue;
      }

      draft[weekday] = {
        branch_id: entry.branch_id,
        start_time: entry.start_time || '',
        end_time: entry.end_time || '',
      };
    }

    setScheduleDraft(draft);

    setShowEmployeeModal(true);
  }

  function closeEmployeeModal() {
    setShowEmployeeModal(false);
    setShowEmployeeCloseConfirmModal(false);
    setShowEmployeeEditConfirmModal(false);
    setSelectedEmployee(null);
    setEditedEmployee(null);
    setIsEditingEmployee(false);
    setEditErrors(new Set());
    setUsePerDayBranchSchedule(false);
    setScheduleDraft({});
  }

  function handleEmployeeModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setShowEmployeeCloseConfirmModal(true);
    }
  }

  function handleEditEmployee() {
    setShowEmployeeEditConfirmModal(false);
    setIsEditingEmployee(true);
  }

  function handleCancelEditEmployee() {
    setEditedEmployee({ ...selectedEmployee });
    setIsEditingEmployee(false);
    setEditErrors(new Set());
  }

  function handleEmployeeInputChange(event) {
    const { name, value } = event.target;

    setEditedEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (editedEmployee?.role === 'Dentist') {
      if (!editedEmployee?.branchId) {
        errors.add('branchId');
      }

      if (!editedEmployee?.workStartTime) {
        errors.add('workStartTime');
      }

      if (!editedEmployee?.workEndTime) {
        errors.add('workEndTime');
      }

      const days = parseWorkDays(editedEmployee?.workDays);

      if (days.length === 0) {
        errors.add('workDays');
      }
    }

    return errors;
  }

  async function handleSaveEmployeeChanges() {
    const errors = validateEditFields();

    if (errors.size > 0) {
      setEditErrors(errors);
      setEditErrorMessage('Please fill in all required fields before saving.');
      setShowEditErrorModal(true);
      return;
    }

    setEditErrors(new Set());

    try {
      let nextEmployee = editedEmployee;

      if (editedEmployee?.role === 'Dentist') {
        const checkedDays = parseWorkDays(editedEmployee?.workDays);
        const assignedBranchId = Number(editedEmployee?.branchId);

        const scheduleEntries = checkedDays
          .map((day) => {
            const weekday = DAY_TO_WEEKDAY[day];
            const draft = scheduleDraft?.[weekday] || {};

            const branchId = usePerDayBranchSchedule
              ? Number(draft.branch_id || assignedBranchId)
              : assignedBranchId;

            const startTime =
              (usePerDayBranchSchedule ? draft.start_time : '') ||
              editedEmployee?.workStartTime ||
              '';

            const endTime =
              (usePerDayBranchSchedule ? draft.end_time : '') ||
              editedEmployee?.workEndTime ||
              '';

            if (!Number.isInteger(weekday)) {
              return null;
            }

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
          })
          .filter(Boolean);

        nextEmployee = {
          ...editedEmployee,
          scheduleEntries,
        };
      }

      const res = await api.patch(
        `/auth/staff-profiles/${editedEmployee.profileId}`,
        employeeToStaffPayload(nextEmployee)
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
    const hasError = editErrors.has(name);

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
          }}
          readOnly={!isEditingEmployee}
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
        />
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

  function modalBranchSelect() {
    const hasError = editErrors.has('branchId');

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

            setEditedEmployee((prev) => ({
              ...prev,
              branchId: event.target.value,
              branchName: selected?.name || '',
              branchAddress: selected?.address
                ? `${selected.name} - ${selected.address}`
                : selected?.name || '',
            }));

            if (event.target.value) {
              setEditErrors((prev) => {
                const next = new Set(prev);
                next.delete('branchId');
                return next;
              });
            }
          }}
          style={{
            ...styles.employeeModalInput,
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
      </div>
    );
  }

  function modalWorkDays() {
    const checkedDays = parseWorkDays(editedEmployee?.workDays);

    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>Work Schedule Days</label>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 16px',
            marginTop: 4,
          }}
        >
          {EDIT_DAY_OPTIONS.map((day) => (
            <label
              key={day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                color: '#334155',
                cursor: isEditingEmployee ? 'pointer' : 'default',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              <input
                type="checkbox"
                value={day}
                checked={checkedDays.includes(day)}
                disabled={!isEditingEmployee}
                onChange={(event) => {
                  const newDays = event.target.checked
                    ? [...checkedDays, day]
                    : checkedDays.filter((d) => d !== day);

                  setEditedEmployee((prev) => ({
                    ...prev,
                    workDays: newDays,
                  }));
                }}
                style={{
                  accentColor: '#2563eb',
                  cursor: isEditingEmployee ? 'pointer' : 'default',
                }}
              />

              {day}
            </label>
          ))}
        </div>
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
            onChange={(event) =>
              setUsePerDayBranchSchedule(event.target.checked)
            }
            style={{ accentColor: '#2563eb' }}
          />

          <span style={{ fontSize: 13, color: '#334155' }}>
            Enable different branch per day
          </span>
        </div>

        {usePerDayBranchSchedule && (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {EDIT_DAY_OPTIONS.map((day) => {
              const weekday = DAY_TO_WEEKDAY[day];
              const isChecked = checkedDays.includes(day);
              const draft = scheduleDraft?.[weekday] || {};
              const branchValue = draft.branch_id ?? assignedBranchId ?? '';
              const startValue =
                draft.start_time ?? editedEmployee?.workStartTime ?? '';
              const endValue =
                draft.end_time ?? editedEmployee?.workEndTime ?? '';

              return (
                <div
                  key={day}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 1fr 1fr',
                    gap: 10,
                    alignItems: 'center',
                    opacity: isChecked ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {day}
                  </div>

                  <select
                    value={branchValue}
                    disabled={!isChecked}
                    onChange={(event) => {
                      const value = event.target.value;

                      setScheduleDraft((prev) => ({
                        ...prev,
                        [weekday]: {
                          ...(prev?.[weekday] || {}),
                          branch_id: value,
                        },
                      }));
                    }}
                    style={styles.employeeModalInput}
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

                  <input
                    type="time"
                    value={startValue}
                    disabled={!isChecked}
                    onChange={(event) => {
                      setScheduleDraft((prev) => ({
                        ...prev,
                        [weekday]: {
                          ...(prev?.[weekday] || {}),
                          start_time: event.target.value,
                        },
                      }));
                    }}
                    style={styles.employeeModalInput}
                  />

                  <input
                    type="time"
                    value={endValue}
                    disabled={!isChecked}
                    onChange={(event) => {
                      setScheduleDraft((prev) => ({
                        ...prev,
                        [weekday]: {
                          ...(prev?.[weekday] || {}),
                          end_time: event.target.value,
                        },
                      }));
                    }}
                    style={styles.employeeModalInput}
                  />
                </div>
              );
            })}

            <div style={{ fontSize: 12, color: '#6f675b', marginTop: 4 }}>
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
            <div style={styles.adminProfile}>
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.adminInfo}>
                <div style={styles.adminName}>{adminName}</div>
                <div style={styles.adminPosition}>Admin</div>
              </div>
            </div>
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
                      <td colSpan="9" style={styles.emptyRow}>
                        No employee records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((employee) => (
                      <tr key={employee.id} style={styles.tableRow}>
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
              <div>
                <h2 style={styles.employeeModalTitle}>
                  Clinic Employee Form
                </h2>
                <p style={styles.employeeModalSubtitle}>
                  {editedEmployee.id} • {editedEmployee.role}
                </p>
              </div>

              <button
                type="button"
                style={styles.employeeModalCloseBtn}
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
                    {modalField(
                      editedEmployee?.role === 'Dentist'
                        ? 'Specialization / Department'
                        : 'Department',
                      'specialization',
                      'text',
                      filterProfTextVal
                    )}
                    {editedEmployee?.role === 'Dental Assistant' &&
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
                    style={styles.employeeSaveBtn}
                    onClick={handleSaveEmployeeChanges}
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    style={styles.employeeCloseBtn}
                    onClick={handleCancelEditEmployee}
                  >
                    Cancel
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

            <h2 style={styles.modalTitle}>Close Employee Details?</h2>
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

            <h2 style={styles.modalTitle}>Edit Employee Information?</h2>
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
              >
                Yes, Edit
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

function formatCSVValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function employeeToStaffPayload(employee) {
  const payload = {
    branchId: employee.branchId,
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
    employee?.role === 'Dentist' &&
    Array.isArray(employee?.scheduleEntries) &&
    employee.scheduleEntries.length > 0
  ) {
    payload.schedule_entries = employee.scheduleEntries;
  }

  return payload;
}

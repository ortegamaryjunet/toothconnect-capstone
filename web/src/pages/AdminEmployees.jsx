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

export default function AdminEmployees() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editErrors, setEditErrors] = useState(new Set());
  const [showEditErrorModal, setShowEditErrorModal] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const [employees, setEmployees] = useState([]);

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

    loadEmployees();
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
    if (showLogoutModal || showEmployeeModal || showEditErrorModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showEmployeeModal, showEditErrorModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeEmployeeModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const search = searchValue.toLowerCase().trim();

      const employeeId = String(employee.id).toLowerCase();
      const role = String(employee.role).toLowerCase();
      const lastName = String(employee.lastName).toLowerCase();
      const firstName = String(employee.firstName).toLowerCase();
      const middleName = String(employee.middleName).toLowerCase();
      const branch = String(employee.branchAddress || employee.branchName || '').toLowerCase();

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
    setShowEmployeeModal(true);
  }

  function closeEmployeeModal() {
    setShowEmployeeModal(false);
    setSelectedEmployee(null);
    setEditedEmployee(null);
    setIsEditingEmployee(false);
    setEditErrors(new Set());
  }

  function handleEmployeeModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeEmployeeModal();
    }
  }

  function handleEditEmployee() {
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
      'firstName', 'lastName', 'homeAddress', 'contactNumber', 'email',
      'birthday', 'gender', 'startDate', 'employmentType',
    ];
    const errors = new Set();
    required.forEach((name) => {
      if (!editedEmployee?.[name]) errors.add(name);
    });
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
      const res = await api.patch(
        `/auth/staff-profiles/${editedEmployee.profileId}`,
        employeeToStaffPayload(editedEmployee)
      );
      const savedEmployee = res.data.profile;

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.profileId === savedEmployee.profileId ? savedEmployee : employee
        )
      );

      setSelectedEmployee(savedEmployee);
      setEditedEmployee(savedEmployee);
      setIsEditingEmployee(false);
    } catch (err) {
      console.error('Failed to update employee', err);
      setEditErrorMessage(err.response?.data?.message || 'Failed to update employee.');
      setShowEditErrorModal(true);
    }
  }

  function modalField(label, name, type = 'text') {
    const hasError = editErrors.has(name);
    return (
      <div style={styles.employeeModalField}>
        <label style={styles.employeeModalLabel}>
          {label}{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
        </label>

        <input
          type={type}
          name={name}
          value={editedEmployee?.[name] ?? ''}
          onChange={handleEmployeeInputChange}
          readOnly={!isEditingEmployee}
          style={{
            ...styles.employeeModalInput,
            ...(!isEditingEmployee ? styles.employeeModalInputReadOnly : {}),
            ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}),
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
          {label}{hasError && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
        </label>

        <select
          name={name}
          value={editedEmployee?.[name] ?? ''}
          onChange={handleEmployeeInputChange}
          disabled={!isEditingEmployee}
          style={{
            ...styles.employeeModalInput,
            ...(!isEditingEmployee ? styles.employeeModalInputReadOnly : {}),
            ...(hasError ? { borderColor: '#dc2626', borderWidth: '2px' } : {}),
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

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
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

          <Link to="/adminAudit" style={styles.menuItem}>
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
            style={{ ...styles.menuItem, ...styles.logoutItem, width: '100%' }}
            onClick={openLogoutModal}
          >
            <i className="fi fi-rr-sign-out-alt" style={styles.menuItemIcon}></i>
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
                        <td style={styles.tableCell}>{employee.branchAddress || employee.branchName || '-'}</td>
                        <td style={styles.tableCell}>{employee.age}</td>
                        <td style={styles.tableCell}>{employee.gender}</td>
                        <td style={styles.tableCell}>
                          <button
                            type="button"
                            style={styles.viewBtn}
                            onClick={() => openEmployeeModal(employee)}
                          >
                            View
                          </button>
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
                <i className="fi fi-rr-angle-left"></i>
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
                <i className="fi fi-rr-angle-right"></i>
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
                onClick={closeEmployeeModal}
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
                  {modalField('First Name', 'firstName')}
                  {modalField('Middle Name', 'middleName')}
                  {modalField('Last Name', 'lastName')}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalField('Preferred Nickname', 'nickname')}
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
                  {modalField('Contact Number', 'contactNumber')}
                  {modalField('Email Address', 'email', 'email')}
                </div>
              </div>

              <div style={styles.employeeModalSection}>
                <h3 style={styles.employeeModalSectionTitle}>
                  Section 2 - Professional Information
                </h3>

                <div style={styles.employeeModalGridTwo}>
                  {modalField('Position', 'position')}
                  {modalField('Years of Experience', 'yearsExperience', 'number')}
                </div>

                {editedEmployee.role === 'Dentist' && (
                  <>
                    <div style={styles.employeeModalGridTwo}>
                      {modalField('Medical Degree', 'medicalDegree')}
                      {modalField('Medical License Number', 'licenseNumber')}
                    </div>

                    <div style={styles.employeeModalGridTwo}>
                      {modalField('Specialization', 'specialization')}
                      {modalField('Skills', 'skills')}
                    </div>
                  </>
                )}

                {editedEmployee.role !== 'Dentist' && (
                  <div style={styles.employeeModalGridTwo}>
                    {modalField('Skills', 'skills')}
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
                  {modalField('Assigned Branch', 'branchAddress')}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalSelect('Employment Type', 'employmentType', [
                    'Full-Time',
                    'Part-Time',
                    'Contract',
                    'Intern',
                  ])}
                </div>

                <div style={styles.employeeModalGridTwo}>
                  {modalField('Shift Type', 'shiftType')}
                  {modalField('Work Schedule Days', 'workDays')}
                </div>

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
                    onClick={handleEditEmployee}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={styles.employeeCloseBtn}
                    onClick={closeEmployeeModal}
                  >
                    Close
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

      {showEditErrorModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, background: '#fee2e2', color: '#dc2626' }}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Incomplete Form</h2>
            <p style={styles.modalText}>{editErrorMessage}</p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, background: '#dc2626', color: '#ffffff' }}
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
    </div>
  );
}

function employeeToStaffPayload(employee) {
  return {
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
}

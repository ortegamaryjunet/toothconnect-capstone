import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { useAuth } from '../auth/AuthContext';
import {
  createStaffPatient,
  listPatients,
  updatePatientAccount,
} from '../api/patients';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepPatientAccStyles from '../styles/RecepPatientAcc';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

const rowsPerPage = 8;

const emptyCreateForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  password: '',
};

export default function RecepPatientAcc() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUpdateOverlay, setShowUpdateOverlay] = useState(false);
  const [showCreateOverlay, setShowCreateOverlay] = useState(false);
  const [showCreateCancelModal, setShowCreateCancelModal] = useState(false);
  const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const profileMenuRef = useRef(null);

  const [patientAccounts, setPatientAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState({});
  const [createTouched, setCreateTouched] = useState({});
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [updateErrors, setUpdateErrors] = useState({});

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1200;
  const isStacked = screenWidth <= 1000;
  const isSingleColumn = screenWidth <= 700;

  const styles = createRecepPatientAccStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
    isStacked,
    isSingleColumn,
  });

  const summary = useMemo(() => {
    const active = patientAccounts.filter(
      (account) => account.status === 'ACTIVE'
    ).length;

    const inactive = patientAccounts.filter(
      (account) => account.status === 'INACTIVE'
    ).length;

    return {
      total: patientAccounts.length,
      active,
      inactive,
    };
  }, [patientAccounts]);

  const filteredAccounts = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return patientAccounts.filter((account) => {
      const searchData =
        `${account.infoId} ${account.id} ${account.name} ${account.contactNumber}`.toLowerCase();

      const rowStatus = account.status.toLowerCase();

      const matchesSearch = searchData.includes(searchValue);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && rowStatus === 'active') ||
        (statusFilter === 'inactive' && rowStatus === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [patientAccounts, searchText, statusFilter]);

  const totalPages =
    filteredAccounts.length === 0
      ? 0
      : Math.ceil(filteredAccounts.length / rowsPerPage);

  const pagedAccounts = useMemo(() => {
    const start = currentPage > 0 ? (currentPage - 1) * rowsPerPage : 0;

    return filteredAccounts.slice(start, start + rowsPerPage);
  }, [filteredAccounts, currentPage]);

  const receptionistName = user?.name || user?.email || 'Receptionist';

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
    fetchPatientAccounts();
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
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => fixPage(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const hasOpenModal =
      showLogoutModal ||
      showUpdateOverlay ||
      showCreateOverlay ||
      showCreateCancelModal ||
      showCreateConfirmModal ||
      showExportModal;

    document.body.style.overflow = hasOpenModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    showLogoutModal,
    showUpdateOverlay,
    showCreateOverlay,
    showCreateCancelModal,
    showCreateConfirmModal,
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

  function closeAllModals() {
    setShowLogoutModal(false);
    setShowUpdateOverlay(false);
    setShowCreateOverlay(false);
    setShowCreateCancelModal(false);
    setShowCreateConfirmModal(false);
    setShowExportModal(false);
  }

  function handleOverlayClick(event, closeHandler) {
    if (event.target === event.currentTarget) {
      closeHandler();
    }
  }

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function openUpdateOverlay(account) {
    setSelectedAccount({ ...account });
    setUpdateErrors({});
    setShowUpdateOverlay(true);
  }

  function closeUpdateOverlay() {
    setSelectedAccount(null);
    setShowUpdateOverlay(false);
  }

  function openCreateOverlay() {
    setCreateForm(emptyCreateForm);
    setCreateErrors({});
    setCreateTouched({});
    setShowCreatePassword(false);
    setShowCreateOverlay(true);
  }

  function closeCreateOverlay() {
    setCreateForm(emptyCreateForm);
    setCreateErrors({});
    setCreateTouched({});
    setShowCreatePassword(false);
    setShowCreateCancelModal(false);
    setShowCreateConfirmModal(false);
    setCreateSaving(false);
    setShowCreateOverlay(false);
  }

  function openCreateCancelModal() {
    setShowCreateCancelModal(true);
  }

  function closeCreateCancelModal() {
    setShowCreateCancelModal(false);
  }

  function confirmCreateCancel() {
    closeCreateOverlay();
  }

  function closeCreateConfirmModal() {
    if (!createSaving) {
      setShowCreateConfirmModal(false);
    }
  }

  function handleUpdateChange(field, value) {
    if (['contactNumber', 'email', 'password'].includes(field)) {
      setUpdateErrors((current) => ({ ...current, [field]: '' }));
    }

    setSelectedAccount((current) => ({
      ...current,
      [field]: value,
      name:
        field === 'firstName' ||
        field === 'middleName' ||
        field === 'lastName'
          ? buildFullName({
              ...current,
              [field]: value,
            })
          : current.name,
      deactivated:
        field === 'status' && value === 'INACTIVE'
          ? current.deactivated || getTodayDate()
          : field === 'status' && value === 'ACTIVE'
            ? ''
            : current.deactivated,
    }));
  }

  function handleCreateChange(field, value) {
    const nextValue =
      field === 'contactNumber' ? value.replace(/\D/g, '').slice(0, 15) : value;

    setCreateTouched((current) => ({ ...current, [field]: true }));

    setCreateForm((current) => {
      const nextForm = {
        ...current,
        [field]: nextValue,
      };

      setCreateErrors((currentErrors) => ({
        ...currentErrors,
        form: '',
        [field]: validateCreateAccountField(field, nextValue, nextForm),
      }));

      return nextForm;
    });
  }

  function handleCreateBlur(field) {
    setCreateTouched((current) => ({ ...current, [field]: true }));
    setCreateErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validateCreateAccountField(field, createForm[field], createForm),
    }));
  }

  async function fetchPatientAccounts() {
    try {
      const patients = await listPatients();
      setPatientAccounts((patients || []).map(mapPatientAccount));
    } catch (err) {
      setPatientAccounts([]);
    }
  }

  function exportAccountsToCSV() {
    if (filteredAccounts.length === 0) {
      setShowExportModal(true);
      return;
    }

    const headers = [
      'Patient ID',
      'Patient Name',
      'Contact Number',
      'Email',
      'Date Registered',
      'Date Deactivated',
      'Status',
    ];

    const rows = filteredAccounts.map((account) => [
      account.id,
      account.name,
      account.contactNumber || 'N/A',
      account.email || 'N/A',
      account.registered || 'N/A',
      account.deactivated || 'N/A',
      account.status === 'ACTIVE' ? 'Active' : 'Inactive',
    ]);

    const csv = [];
    csv.push(['Smile Empress Dental Hub']);
    csv.push(['Patient Account Records']);
    csv.push(['Generated Date', new Date().toLocaleString('en-PH')]);
    csv.push(['Generated By', receptionistName]);
    csv.push([
      'Filter',
      statusFilter === 'all'
        ? 'All Patients'
        : statusFilter === 'active'
          ? 'Active Patients'
          : 'Inactive Patients',
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
    link.download = 'patient_account_records.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function handleUpdateSubmit(event) {
    event.preventDefault();

    if (!selectedAccount) {
      return;
    }

    const errors = validateAccountForm(selectedAccount, false);

    if (Object.keys(errors).length > 0) {
      setUpdateErrors(errors);
      return;
    }

    try {
      const saved = await updatePatientAccount(selectedAccount.userId, {
        full_name: buildFullName(selectedAccount),
        email: selectedAccount.email,
        contact_number: normalizeContactNumber(selectedAccount.contactNumber),
        status: selectedAccount.status === 'INACTIVE' ? 'Inactive' : 'Active',
        temporary_password: selectedAccount.password || undefined,
      });

      setPatientAccounts((currentAccounts) =>
        currentAccounts.map((account) =>
          account.userId === selectedAccount.userId
            ? mapPatientAccount(saved)
            : account
        )
      );

      closeUpdateOverlay();
    } catch (err) {
      setUpdateErrors({
        form:
          err.response?.data?.message || 'Failed to update patient account.',
      });
    }
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    setCreateErrors((current) => ({ ...current, form: '' }));

    const errors = validateAccountForm(createForm, true);

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      setCreateTouched({
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        password: true,
      });
      return;
    }

    setShowCreateConfirmModal(true);
  }

  async function handleConfirmCreateAccount() {
    setCreateSaving(true);
    setCreateErrors((current) => ({ ...current, form: '' }));

    try {
      await createStaffPatient({
        full_name: buildFullName(createForm),
        email: createForm.email,
        contact_number: normalizeContactNumber(createForm.contactNumber),
        temporary_password: createForm.password,
      });

      await fetchPatientAccounts();
      closeCreateOverlay();
    } catch (err) {
      setShowCreateConfirmModal(false);
      setCreateErrors({
        form: err.response?.data?.message || 'Failed to create patient account.',
      });
    } finally {
      setCreateSaving(false);
    }
  }

  function handleCreateOverlayClick(event) {
    if (event.target === event.currentTarget) {
      openCreateCancelModal();
    }
  }

  function handleCreateCancelOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeCreateCancelModal();
    }
  }

  function handleCreateConfirmOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeCreateConfirmModal();
    }
  }

  const createAccountSummaryRows = [
    ['First Name', createForm.firstName || 'N/A'],
    ['Middle Name', createForm.middleName || 'N/A'],
    ['Last Name', createForm.lastName || 'N/A'],
    ['Email', createForm.email || 'N/A'],
    ['Contact Number', normalizeContactNumber(createForm.contactNumber) || 'N/A'],
    ['Temporary Password', createForm.password ? 'Provided' : 'N/A'],
  ];

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

          <Link
            to="/receptionistPatientAcc"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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
          <section style={styles.accountHero}>
            <div>
              <span style={styles.heroBadge}>Patient Account</span>

              <h2 style={styles.heroTitle}>
                Manage patient login accounts and account status.
              </h2>

              <p style={styles.heroText}>
                View patient access records, update account details, and monitor
                active or inactive patient accounts.
              </p>
            </div>

            {!isMobile && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-id-badge"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.summaryGrid}>
            <SummaryCard
              styles={styles}
              icon="fi fi-rr-users"
              colorStyle={styles.summaryIconBlue}
              label="Total Patient Accounts"
              value={summary.total}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-user-check"
              colorStyle={styles.summaryIconGreen}
              label="Active Patients"
              value={summary.active}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-user-xmark"
              colorStyle={styles.summaryIconOrange}
              label="Inactive Patients"
              value={summary.inactive}
            />
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

            <div style={styles.filterRight}>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={styles.patientFilter}
              >
                <option value="all">All Patients</option>
                <option value="active">Active Patients</option>
                <option value="inactive">Inactive Patients</option>
              </select>

              <button
                type="button"
                style={styles.addAccountBtn}
                onClick={openCreateOverlay}
              >
                <i className="fi fi-rr-plus"></i>
                <span>Add Account</span>
              </button>
            </div>
          </section>

          <section style={styles.dashboardCard}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Patient Account List</h3>
                <p style={styles.cardSubtitle}>
                  View, search, filter, and update patient account information.
                </p>
              </div>

              <button
                type="button"
                style={styles.exportCsvBtn}
                onClick={exportAccountsToCSV}
              >
                <i className="fi fi-rr-file-csv"></i>
                Export CSV
              </button>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.accountTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Patient ID</th>
                    <th style={styles.th}>Patient Name</th>
                    <th style={styles.th}>Contact Number</th>
                    <th style={styles.th}>Date Registered</th>
                    <th style={styles.th}>Date Deactivate</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, ...styles.actionTh }}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyCell}>
                        No matching patient account found.
                      </td>
                    </tr>
                  ) : (
                    pagedAccounts.map((account) => (
                      <tr key={account.infoId}>
                        <td style={styles.td}>{account.id}</td>
                        <td style={styles.td}>{account.name}</td>
                        <td style={styles.td}>{account.contactNumber}</td>
                        <td style={styles.td}>{account.registered}</td>
                        <td style={styles.td}>
                          {account.deactivated || '-'}
                        </td>
                        <td style={styles.td}>
                          <StatusBadge
                            styles={styles}
                            status={account.status}
                          />
                        </td>
                        <td style={{ ...styles.td, ...styles.actionTd }}>
                          <button
                            type="button"
                            style={styles.editBtn}
                            onClick={() => openUpdateOverlay(account)}
                          >
                            <i className="fi fi-rr-user-pen"></i>
                          </button>
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

      {showUpdateOverlay && selectedAccount && (
        <div
          style={styles.overlay}
          onClick={(event) => handleOverlayClick(event, closeUpdateOverlay)}
        >
          <div style={styles.overlayContent}>
            <div style={styles.overlayHeader}>
              <div>
                <h3 style={styles.overlayTitle}>Update Patient Account</h3>
                <p style={styles.overlaySubtitle}>
                  Edit patient account details and status.
                </p>
              </div>

              <button
                type="button"
                style={styles.closeBtn}
                onClick={closeUpdateOverlay}
              >
                ×
              </button>
            </div>

            <form style={styles.overlayBody} onSubmit={handleUpdateSubmit}>
              {updateErrors.form && (
                <div style={styles.formError}>{updateErrors.form}</div>
              )}

              <div style={styles.formGrid}>
                <InputField
                  styles={styles}
                  label="First Name"
                  value={selectedAccount.firstName}
                  onChange={(value) => handleUpdateChange('firstName', value)}
                  required
                />

                <InputField
                  styles={styles}
                  label="Middle Name"
                  value={selectedAccount.middleName}
                  onChange={(value) => handleUpdateChange('middleName', value)}
                />

                <InputField
                  styles={styles}
                  label="Last Name"
                  value={selectedAccount.lastName}
                  onChange={(value) => handleUpdateChange('lastName', value)}
                  required
                />

                <InputField
                  styles={styles}
                  label="Contact Number"
                  type="tel"
                  value={selectedAccount.contactNumber}
                  onChange={(value) =>
                    handleUpdateChange('contactNumber', value)
                  }
                  error={updateErrors.contactNumber}
                  placeholder="09XXXXXXXXX"
                  inputMode="tel"
                  required
                />

                <InputField
                  styles={styles}
                  label="Email"
                  type="email"
                  value={selectedAccount.email}
                  onChange={(value) => handleUpdateChange('email', value)}
                  error={updateErrors.email}
                  required
                />

                <InputField
                  styles={styles}
                  label="Date Registered"
                  value={selectedAccount.registered}
                  readOnly
                />

                <InputField
                  styles={styles}
                  label="Temporary Password"
                  type="password"
                  value={selectedAccount.password || ''}
                  onChange={(value) => handleUpdateChange('password', value)}
                  error={updateErrors.password}
                  placeholder="Leave blank to keep current password"
                />

                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Status</label>
                  <select
                    value={selectedAccount.status}
                    onChange={(event) =>
                      handleUpdateChange('status', event.target.value)
                    }
                    style={styles.fieldInput}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.overlayActions}>
                <button
                  type="button"
                  style={styles.cancelOverlayBtn}
                  onClick={closeUpdateOverlay}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.submitBtn}>
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateOverlay && (
        <div
          style={styles.overlay}
          onClick={handleCreateOverlayClick}
        >
          <div style={styles.overlayContent}>
            <div style={styles.overlayHeader}>
              <div>
                <h3 style={styles.overlayTitle}>Create Patient Account</h3>
                <p style={styles.overlaySubtitle}>
                  Add a new login account for a patient.
                </p>
              </div>

            </div>

            <form style={styles.overlayBody} onSubmit={handleCreateSubmit} noValidate>
              {createErrors.form && (
                <div style={styles.formError}>{createErrors.form}</div>
              )}

              <div style={styles.formGrid}>
                <InputField
                  styles={styles}
                  label="First Name"
                  value={createForm.firstName}
                  onChange={(value) => handleCreateChange('firstName', value)}
                  onBlur={() => handleCreateBlur('firstName')}
                  error={createTouched.firstName ? createErrors.firstName : ''}
                  required
                />

                <InputField
                  styles={styles}
                  label="Middle Name"
                  value={createForm.middleName}
                  onChange={(value) => handleCreateChange('middleName', value)}
                  onBlur={() => handleCreateBlur('middleName')}
                  error={createTouched.middleName ? createErrors.middleName : ''}
                />

                <InputField
                  styles={styles}
                  label="Last Name"
                  value={createForm.lastName}
                  onChange={(value) => handleCreateChange('lastName', value)}
                  onBlur={() => handleCreateBlur('lastName')}
                  error={createTouched.lastName ? createErrors.lastName : ''}
                  required
                />

                <InputField
                  styles={styles}
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={(value) => handleCreateChange('email', value)}
                  onBlur={() => handleCreateBlur('email')}
                  error={createTouched.email ? createErrors.email : ''}
                  required
                />

                <PhoneField
                  styles={styles}
                  label="Contact Number"
                  value={createForm.contactNumber}
                  onChange={(value) =>
                    handleCreateChange('contactNumber', value)
                  }
                  onBlur={() => handleCreateBlur('contactNumber')}
                  error={
                    createTouched.contactNumber
                      ? createErrors.contactNumber
                      : ''
                  }
                  required
                />

                <InputField
                  styles={styles}
                  label="Temporary Password"
                  type={showCreatePassword ? 'text' : 'password'}
                  value={createForm.password}
                  onChange={(value) => handleCreateChange('password', value)}
                  onBlur={() => handleCreateBlur('password')}
                  error={createTouched.password ? createErrors.password : ''}
                  rightElement={
                    <button
                      type="button"
                      style={styles.passwordToggle}
                      onClick={() => setShowCreatePassword((current) => !current)}
                      aria-label={
                        showCreatePassword
                          ? 'Hide temporary password'
                          : 'Show temporary password'
                      }
                    >
                      {showCreatePassword ? 'Hide' : 'Show'}
                    </button>
                  }
                  required
                />
              </div>

              <div style={styles.overlayActions}>
                <button
                  type="button"
                  style={styles.cancelOverlayBtn}
                  onClick={openCreateCancelModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...styles.submitBtn,
                    ...(createSaving ? styles.buttonDisabled : {}),
                  }}
                  disabled={createSaving}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateCancelModal && (
        <div style={styles.modal} onClick={handleCreateCancelOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Create Account</h2>
            <p style={styles.modalText}>
              Review the current details. Are you sure you want to cancel? These details will not be saved.
            </p>

            <AccountSummaryRows rows={createAccountSummaryRows} styles={styles} />

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeCreateCancelModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCreateCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateConfirmModal && (
        <div style={styles.modal} onClick={handleCreateConfirmOverlayClick}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, ...styles.submitModalIcon }}>
              <i className="fi fi-rr-user-add" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Patient Account</h2>
            <p style={styles.modalText}>
              Please review the details below. Is the information correct and do you want to create this account?
            </p>

            <AccountSummaryRows rows={createAccountSummaryRows} styles={styles} />

            {createErrors.form && (
              <p style={{ ...styles.modalText, color: '#dc2626' }}>
                {createErrors.form}
              </p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                disabled={createSaving}
                onClick={closeCreateConfirmModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  ...styles.confirmSubmitBtn,
                  ...(createSaving ? styles.buttonDisabled : {}),
                }}
                disabled={createSaving}
                onClick={handleConfirmCreateAccount}
              >
                {createSaving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div
          style={styles.exportModalOverlay}
          onClick={(event) => handleOverlayClick(event, () => setShowExportModal(false))}
        >
          <div style={styles.exportModalContent}>
            <h2 style={styles.exportModalTitle}>No Patient Account Records</h2>

            <div style={styles.exportModalDivider}></div>

            <p style={styles.exportModalText}>
              No patient account records available to export.
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
          onClick={(event) => handleOverlayClick(event, closeLogoutModal)}
        >
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
    </div>
  );
}

function SummaryCard({ styles, icon, colorStyle, label, value }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, ...colorStyle }}>
        <i className={icon} style={styles.summaryIconText}></i>
      </div>

      <div>
        <p style={styles.summaryLabel}>{label}</p>
        <h2 style={styles.summaryValue}>{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ styles, status }) {
  const isActive = status === 'ACTIVE';

  return (
    <span
      style={{
        ...styles.status,
        ...(isActive ? styles.statusActive : styles.statusInactive),
      }}
    >
      <i
        className={
          isActive ? 'fi fi-rr-check-circle' : 'fi fi-rr-cross-circle'
        }
      ></i>
      {isActive ? 'Active' : 'Inactive'}
    </span>
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
        Prev
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
        Next
      </button>
    </div>
  );
}

function AccountSummaryRows({ rows, styles }) {
  return (
    <div style={styles.modalDetailList}>
      {rows.map(([label, value]) => (
        <div key={label} style={styles.modalDetailRow}>
          <span style={styles.modalDetailLabel}>{label}</span>
          <strong style={styles.modalDetailValue}>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function InputField({
  styles,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  required = false,
  readOnly = false,
  error = '',
  placeholder = '',
  inputMode,
  maxLength,
  rightElement,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={rightElement ? styles.inputWithAction : undefined}>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={onBlur}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          style={{
            ...styles.fieldInput,
            ...(rightElement ? styles.fieldInputWithAction : {}),
            ...(readOnly ? styles.fieldInputReadonly : {}),
            ...(error ? styles.fieldInputError : {}),
          }}
        />
        {rightElement}
      </div>
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

function PhoneField({
  styles,
  label,
  value,
  onChange,
  onBlur,
  error = '',
  required = false,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <PhoneInput
        country="ph"
        value={value}
        onChange={(phone) => onChange?.(phone)}
        onBlur={onBlur}
        inputProps={{
          required,
          name: 'contactNumber',
        }}
        enableSearch
        containerStyle={styles.phoneInputContainer}
        inputStyle={{
          ...styles.phoneInput,
          ...(error ? styles.fieldInputError : {}),
        }}
        buttonStyle={{
          ...styles.phoneButton,
          ...(error ? styles.phoneButtonError : {}),
        }}
        dropdownStyle={styles.phoneDropdown}
        searchStyle={styles.phoneSearch}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

function buildFullName(account) {
  return [account.firstName, account.middleName, account.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function mapPatientAccount(patient = {}) {
  const fullName = patient.full_name || patient.name || '';
  const nameParts = splitFullName(fullName);
  const status = String(patient.status || 'Active').toUpperCase();

  return {
    id: `P${patient.patient_id || patient.id}`,
    infoId: String(patient.info_id || patient.id || patient.patient_id || ''),
    userId: patient.user_id || patient.patient_id || patient.id,
    firstName: patient.first_name || nameParts.firstName,
    middleName: patient.middle_name || nameParts.middleName,
    lastName: patient.last_name || nameParts.lastName,
    name:
      fullName ||
      buildFullName({
        firstName: patient.first_name,
        middleName: patient.middle_name,
        lastName: patient.last_name,
      }),
    contactNumber: patient.contact_number || '',
    email: patient.email || '',
    password: '',
    registered: formatDate(patient.registered_at || patient.created_at),
    deactivated: patient.deactivated_at
      ? formatDate(patient.deactivated_at)
      : '',
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  };
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function normalizeContactNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (String(value || '').trim().startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('63')) {
    return `+${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('09')) {
    return digits;
  }

  return `+${digits}`;
}

function validateContactNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    return 'This field is required';
  }

  if (digits.length < 8 || digits.length > 15) {
    return 'Contact number is invalid.';
  }

  return '';
}

function validateEmail(value) {
  const email = String(value || '').trim();

  if (!email) {
    return 'This field is required.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Email format is invalid.';
  }

  return '';
}

function validateRequiredField(value) {
  if (!String(value || '').trim()) {
    return 'This field is required.';
  }

  return '';
}

function validateNameField(value, required = false) {
  const name = String(value || '').trim();

  if (!name) {
    return required ? 'This field is required.' : '';
  }

  if (!/^[A-Za-z\s]+$/.test(name)) {
    return 'Numbers are not allowed. Only letters.';
  }

  return '';
}

function validateTemporaryPassword(value) {
  const password = String(value || '');

  if (!password.trim()) {
    return 'This field is required.';
  }

  if (password.length < 8) {
    return 'Temporary password must be at least 8 characters.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Temporary password must contain a letter and a number.';
  }

  return '';
}

function validateCreateAccountField(field, value) {
  if (field === 'firstName' || field === 'lastName') {
    return validateNameField(value, true);
  }

  if (field === 'middleName') {
    return validateNameField(value);
  }

  if (field === 'email') {
    return validateEmail(value);
  }

  if (field === 'contactNumber') {
    return validateContactNumber(value);
  }

  if (field === 'password') {
    return validateTemporaryPassword(value);
  }

  return '';
}

function validateAccountForm(account, requirePassword) {
  const errors = {};
  const contactError = validateContactNumber(account.contactNumber);
  const emailError = validateEmail(account.email);
  const firstNameError = validateNameField(account.firstName, requirePassword);
  const middleNameError = validateNameField(account.middleName);
  const lastNameError = validateNameField(account.lastName, requirePassword);

  if (requirePassword && firstNameError) {
    errors.firstName = firstNameError;
  }

  if (middleNameError) {
    errors.middleName = middleNameError;
  }

  if (requirePassword && lastNameError) {
    errors.lastName = lastNameError;
  }

  if (!buildFullName(account)) {
    errors.form = 'Patient name is required.';
  }

  if (contactError) {
    errors.contactNumber = contactError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (requirePassword) {
    const passwordError = validateTemporaryPassword(account.password);

    if (passwordError) {
      errors.password = passwordError;
    }
  } else if (account.password && account.password.length < 8) {
    errors.password = 'Temporary password must be at least 8 characters.';
  }

  return errors;
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

import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import api from '../api/axios';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createAdminSettingsStyles from '../styles/AdminSettings';

import clinicLogo from '../assets/adminImages/clinic-logo.png';
import AdminScheduleRequests from './AdminScheduleRequests';

const rowsPerPage = 10;

const sectionConfig = {
  leaveRequests: {
    label: 'Leave Request',
    icon: 'fi fi-rr-calendar-clock',
  },
  branch: {
    label: 'Manage Branch',
    icon: 'fi fi-rr-building',
    searchPlaceholder: 'Search branch or location',
    addLabel: 'Add Branch',
    addIcon: 'fi fi-rr-building',
    emptyText: 'No branch records found.',
    columns: [
      'Branch Name',
      'Date Opened',
      'Clinic Location',
      'Contact Number',
      'Contact Person',
      'Operating Hours',
      'Years Active',
      'Status',
      'Action',
    ],
  },
  services: {
    label: 'Manage Services and Pricing',
    icon: 'fi fi-rr-badge-percent',
    searchPlaceholder: 'Search service name',
    addLabel: 'Add Service',
    addIcon: 'fi fi-rr-plus',
    emptyText: 'No service records found.',
    columns: [
      'Service Name',
      'Category',
      'Price',
      'Duration',
      'Status',
      'Action',
    ],
  },
  website: {
    label: 'Manage Website',
    icon: 'fi fi-rr-globe',
    searchPlaceholder: 'Search website section',
    addLabel: 'Update Website',
    addIcon: 'fi fi-rr-edit',
    emptyText: 'No website records found.',
    columns: ['Section', 'Title', 'Content Type', 'Last Updated', 'Status', 'Action'],
  },
  users: {
    label: 'Manage User Account',
    icon: 'fi fi-rr-users-alt',
    searchPlaceholder: 'Search name',
    addLabel: 'Add User Account',
    addIcon: 'fi fi-rr-user-add',
    emptyText: 'No user records found.',
    columns: ['Full Name', 'Email Address', 'Access Role', 'Branch', 'Date Created', 'Status', 'Action'],
  },
  adminAccount: {
    label: 'Manage Admin Account',
    icon: 'fi fi-rr-user-gear',
  },
};

const initialBranchForm = {
  id: '',
  name: '',
  date_opened: '',
  address: '',
  phone: '',
  contact_person: '',
  operating_hours: '',
  years_active: '',
  status: '',
};

const initialServiceForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  duration: '',
  status: '',
};

const initialUserForm = {
  id: '',
  fullName: '',
  email: '',
  role: '',
  branch_id: '',
  password: '',
  status: 'Active',
  created: '',
};

const initialAdminAccountForm = {
  id: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'admin',
  status: 'Active',
  created_at: '',
};

export default function AdminSettings() {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeSection, setActiveSection] = useState('leaveRequests');
  const [activeOverlay, setActiveOverlay] = useState(null);

  const highlightRequestId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('highlightRequestId') || null;
  }, [location.search]);

  useEffect(() => {
    if (highlightRequestId) {
      setActiveSection('leaveRequests');
    }
  }, [highlightRequestId]);

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [onlineInquiries, setOnlineInquiries] = useState([]);
  const [websiteTab, setWebsiteTab] = useState('appointments');
  const [users, setUsers] = useState([]);
  const [adminAccountForm, setAdminAccountForm] = useState(initialAdminAccountForm);
  const [isEditingAdminAccount, setIsEditingAdminAccount] = useState(false);
  const [adminAccountMessage, setAdminAccountMessage] = useState('');
  const [adminAccountError, setAdminAccountError] = useState('');

  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [userForm, setUserForm] = useState(initialUserForm);

  const [filters, setFilters] = useState({
    branchSearch: '',
    branchStatus: 'All',

    serviceSearch: '',
    serviceCategory: 'All',
    serviceStatus: 'All',

    websiteSearch: '',
    websiteSection: 'All',
    websiteStatus: 'All',

    userSearch: '',
    userRole: 'All',
    userStatus: 'All',
  });

  const [pages, setPages] = useState({
    leaveRequests: 1,
    branch: 1,
    services: 1,
    website: 1,
    users: 1,
  });

  const isMobile = screenWidth <= 850;
  const isTablet = screenWidth > 850 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminSettingsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

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
    if (showLogoutModal || activeOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, activeOverlay]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeOverlay();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    loadBranches();
    loadServices();
    loadUsers();
    loadAdminAccount();
    loadOnlineAppointments();
    loadOnlineInquiries();
  }, []);


  async function loadBranches() {
    try {
      const res = await api.get('/auth/branches');
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error('Failed to load branches', err);
      setBranches([]);
    }
  }

  async function loadUsers() {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
      setUsers([]);
    }
  }

  async function loadServices() {
    try {
      const res = await api.get('/auth/services');
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Failed to load services', err);
      setServices([]);
    }
  }

  async function loadOnlineAppointments() {
    try {
      const res = await api.get('/website/appointments');
      setOnlineAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to load online appointments', err);
      setOnlineAppointments([]);
    }
  }

  async function loadOnlineInquiries() {
    try {
      const res = await api.get('/website/inquiries');
      setOnlineInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error('Failed to load online inquiries', err);
      setOnlineInquiries([]);
    }
  }

  async function updateOnlineAppointmentStatus(id, status) {
    try {
      await api.patch(`/website/appointments/${id}/status`, { status });
      await loadOnlineAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status.');
    }
  }

  async function loadAdminAccount() {
    try {
      const res = await api.get('/auth/me');
      setAdminAccountForm({
        id: res.data.id || '',
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        password: '',
        confirmPassword: '',
        role: res.data.role || 'admin',
        status: res.data.status || 'Active',
        created_at: res.data.created_at || '',
      });
    } catch (err) {
      console.error('Failed to load admin account', err);
      setAdminAccountError('Failed to load admin account.');
    }
  }

  const filteredBranches = useMemo(() => {
    const search = filters.branchSearch.toLowerCase().trim();

    return branches.filter((branch) => {
      const branchName = String(branch.name || '').toLowerCase();
      const branchAddress = String(branch.address || '').toLowerCase();
      const branchPhone = String(branch.phone || '').toLowerCase();
      const branchContactPerson = String(branch.contact_person || '').toLowerCase();
      const branchHours = String(branch.operating_hours || '').toLowerCase();

      const matchesSearch =
        branchName.includes(search) ||
        branchAddress.includes(search) ||
        branchPhone.includes(search) ||
        branchContactPerson.includes(search) ||
        branchHours.includes(search);

      const matchesStatus =
        filters.branchStatus === 'All' || branch.status === filters.branchStatus;

      return matchesSearch && matchesStatus;
    });
  }, [branches, filters.branchSearch, filters.branchStatus]);

  const filteredServices = useMemo(() => {
    const search = filters.serviceSearch.toLowerCase().trim();

    return services.filter((service) => {
      const matchesSearch =
        String(service.name || '').toLowerCase().includes(search) ||
        String(service.category || '').toLowerCase().includes(search);

      const matchesCategory =
        filters.serviceCategory === 'All' ||
        service.category === filters.serviceCategory;

      const matchesStatus =
        filters.serviceStatus === 'All' ||
        service.status === filters.serviceStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [
    services,
    filters.serviceSearch,
    filters.serviceCategory,
    filters.serviceStatus,
  ]);

  const filteredUsers = useMemo(() => {
    const search = filters.userSearch.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        String(user.fullName || '').toLowerCase().includes(search) ||
        String(user.email || '').toLowerCase().includes(search) ||
        String(user.role || '').toLowerCase().includes(search) ||
        String(user.branch_name || user.branch_address || '').toLowerCase().includes(search);

      const matchesRole =
        filters.userRole === 'All' || user.role === filters.userRole;

      const matchesStatus =
        filters.userStatus === 'All' || user.status === filters.userStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters.userSearch, filters.userRole, filters.userStatus]);

  const sectionData = {
    leaveRequests: [],
    branch: filteredBranches,
    services: filteredServices,
    website: [],
    users: filteredUsers,
    adminAccount: [],
  };

  const activeRows = sectionData[activeSection] || [];
  const currentPage = pages[activeSection];
  const totalPages = Math.ceil(activeRows.length / rowsPerPage);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return activeRows.slice(start, end);
  }, [activeRows, currentPage]);

  function allowLettersOnly(value) {
    return value.replace(/[^a-zA-Z\s]/g, '');
  }

  function allowTextContent(value) {
    return value.replace(/[^a-zA-Z0-9\s.,]/g, '');
  }

  function allowNumbersOnly(value) {
    return value.replace(/[^0-9+]/g, '');
  }

  function allowPriceOnly(value) {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  }

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPages((prev) => ({
      ...prev,
      [activeSection]: 1,
    }));
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

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function closeOverlay() {
    setActiveOverlay(null);
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeOverlay();
    }
  }

  function openBranchForm(branch = null) {
    if (branch) {
      setBranchForm(branch);
    } else {
      setBranchForm(initialBranchForm);
    }

    setActiveOverlay('branch');
  }

  function openServiceForm(service = null) {
    if (service) {
      setServiceForm(service);
    } else {
      setServiceForm(initialServiceForm);
    }

    setActiveOverlay('services');
  }

  function openUserForm(user = null) {
    if (user) {
      setUserForm({
        id: user.id || '',
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        branch_id: user.branch_id || '',
        password: '',
        status: user.status || 'Active',
        created: user.created || '',
      });
    } else {
      setUserForm(initialUserForm);
    }

    setActiveOverlay('users');
  }

  function handleBranchChange(name, value) {
    let newValue = value;

    if (name === 'name') {
      newValue = allowLettersOnly(value);
    }

    if (name === 'contact_person') {
      newValue = allowLettersOnly(value);
    }

    setBranchForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function handleServiceChange(name, value) {
    let newValue = value;

    if (name === 'name') {
      newValue = allowLettersOnly(value);
    }

    if (['price', 'duration'].includes(name)) {
      newValue = allowPriceOnly(value);
    }

    setServiceForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function handleUserChange(name, value) {
    let newValue = value;

    if (name === 'fullName') {
      newValue = allowLettersOnly(value);
    }

    setUserForm((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === 'role' && newValue === 'Admin' ? { branch_id: '' } : {}),
    }));
  }

  function handleAdminAccountChange(name, value) {
    let newValue = value;

    if (name === 'name') {
      newValue = allowLettersOnly(value);
    }

    if (name === 'phone') {
      newValue = allowNumbersOnly(value);
    }

    if (['password', 'confirmPassword'].includes(name)) {
      newValue = value.replace(/[^a-zA-Z0-9]/g, '');
    }

    setAdminAccountForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function validateAdminPassword() {
    const password = adminAccountForm.password;
    const confirmPassword = adminAccountForm.confirmPassword;

    if (!password && !confirmPassword) {
      return '';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Password must contain at least one letter and one number.';
    }

    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return 'Password must not contain special characters.';
    }

    if (password !== confirmPassword) {
      return 'Password and confirm password must match.';
    }

    return '';
  }

  async function saveBranch(event) {
    event.preventDefault();

    try {
      const payload = {
        name: branchForm.name,
        address: branchForm.address,
        phone: branchForm.phone,
        contact_person: branchForm.contact_person,
        date_opened: branchForm.date_opened,
        operating_hours: branchForm.operating_hours,
        years_active: branchForm.years_active,
        status: branchForm.status,
      };

      const res = branchForm.id
        ? await api.patch(`/auth/branches/${branchForm.id}`, payload)
        : await api.post('/auth/branches', payload);

      setBranches(res.data.branches || []);
      closeOverlay();
    } catch (err) {
      console.error('Failed to save branch', err);
      alert(err.response?.data?.message || 'Failed to save branch');
    }
  }

  async function saveService(event) {
    event.preventDefault();

    const payload = {
      name: serviceForm.name,
      category: serviceForm.category,
      price: serviceForm.price,
      duration_min: serviceForm.duration,
      status: serviceForm.status,
    };

    try {
      const res = serviceForm.id
        ? await api.patch(`/auth/services/${serviceForm.id}`, payload)
        : await api.post('/auth/services', payload);

      setServices(res.data.services || []);
      closeOverlay();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service');
    }
  }

  async function saveUser(event) {
    event.preventDefault();

    try {
      if (userForm.id) {
        await api.patch(`/auth/users/${userForm.id}`, {
          fullName: userForm.fullName,
          email: userForm.email,
          role: userForm.role,
          branch_id: userForm.branch_id || null,
          status: userForm.status,
        });
      } else {
        await api.post('/auth/users', {
          fullName: userForm.fullName,
          email: userForm.email,
          role: userForm.role,
          branch_id: userForm.branch_id || null,
          password: userForm.password || null,
          status: userForm.status || 'Active',
        });
      }

      await loadUsers();
      closeOverlay();
    } catch (err) {
      console.error('Failed to save user account', err);
      alert(err.response?.data?.message || 'Failed to save user account');
    }
  }

  async function saveAdminAccount(event) {
    event.preventDefault();

    try {
      setAdminAccountMessage('');
      setAdminAccountError('');

      const passwordError = validateAdminPassword();

      if (passwordError) {
        setAdminAccountError(passwordError);
        return;
      }

      const res = await api.patch('/auth/me', {
        name: adminAccountForm.name,
        email: adminAccountForm.email,
        phone: adminAccountForm.phone,
        status: adminAccountForm.status,
        password: adminAccountForm.password || '',
      });

      const updated = res.data.user || {};
      setAdminAccountForm({
        id: updated.id || adminAccountForm.id,
        name: updated.name || adminAccountForm.name,
        email: updated.email || adminAccountForm.email,
        phone: updated.phone || '',
        password: '',
        confirmPassword: '',
        role: updated.role || 'admin',
        status: updated.status || adminAccountForm.status,
        created_at: updated.created_at || adminAccountForm.created_at,
      });
      setAdminAccountMessage(res.data.message || 'Admin account updated.');
      setIsEditingAdminAccount(false);
      await loadUsers();
    } catch (err) {
      console.error('Failed to update admin account', err);
      setAdminAccountError(err.response?.data?.message || 'Failed to update admin account.');
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setPages((prev) => ({
        ...prev,
        [activeSection]: prev[activeSection] + 1,
      }));
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setPages((prev) => ({
        ...prev,
        [activeSection]: prev[activeSection] - 1,
      }));
    }
  }

  function getStatusStyle(status) {
    const statusKey = String(status).toLowerCase();

    if (['active', 'published'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusActive };
    }

    if (['inactive', 'hidden'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusInactive };
    }

    if (statusKey === 'opening') {
      return { ...styles.statusBadge, ...styles.statusOpening };
    }

    if (['closed', 'discontinued'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusClosed };
    }

    if (['renovation', 'draft'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusRenovation };
    }

    return styles.statusBadge;
  }

  function renderWebsitePanel() {
    const apptStatusOptions = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    const filteredAppts = onlineAppointments.filter((a) => {
      const s = filters.websiteSearch.toLowerCase();
      return !s || a.full_name?.toLowerCase().includes(s) || a.phone_number?.toLowerCase().includes(s) || a.location?.toLowerCase().includes(s);
    });
    const filteredInqs = onlineInquiries.filter((a) => {
      const s = filters.websiteSearch.toLowerCase();
      return !s || a.full_name?.toLowerCase().includes(s) || a.phone_number?.toLowerCase().includes(s) || a.concern?.toLowerCase().includes(s);
    });

    return (
      <section style={styles.tableCard}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search name, phone, location…"
            value={filters.websiteSearch}
            onChange={(e) => updateFilter('websiteSearch', e.target.value)}
            style={{ ...styles.formInput, maxWidth: 280, margin: 0 }}
          />
          <button
            type="button"
            onClick={() => setWebsiteTab('appointments')}
            style={{
              ...styles.pageBtn,
              ...(websiteTab === 'appointments' ? styles.pageBtnActive || { fontWeight: 700, borderBottom: '2px solid #2563eb' } : {}),
            }}
          >
            Online Appointments ({filteredAppts.length})
          </button>
          <button
            type="button"
            onClick={() => setWebsiteTab('inquiries')}
            style={{
              ...styles.pageBtn,
              ...(websiteTab === 'inquiries' ? styles.pageBtnActive || { fontWeight: 700, borderBottom: '2px solid #2563eb' } : {}),
            }}
          >
            Online Inquiries ({filteredInqs.length})
          </button>
        </div>

        {websiteTab === 'appointments' && (
          <div style={styles.tableWrapper}>
            <table style={styles.branchTable}>
              <thead>
                <tr>
                  {['Full Name', 'Phone', 'Date', 'Time', 'Location', 'Reason', 'Status', 'Action'].map((col) => (
                    <th key={col} style={styles.tableHead}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAppts.length === 0 ? (
                  <tr><td colSpan={8} style={styles.emptyRow}>No online appointment submissions found.</td></tr>
                ) : filteredAppts.map((appt) => (
                  <tr key={appt.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{appt.full_name}</td>
                    <td style={styles.tableCell}>{appt.phone_number}</td>
                    <td style={styles.tableCell}>{String(appt.appointment_date || '').slice(0, 10)}</td>
                    <td style={styles.tableCell}>{String(appt.appointment_time || '').slice(0, 5)}</td>
                    <td style={styles.tableCell}>{appt.location}</td>
                    <td style={styles.tableCell}>{appt.reason_for_booking || '—'}</td>
                    <td style={styles.tableCell}>
                      <span style={getStatusStyle(appt.status)}>{appt.status}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        value={appt.status}
                        onChange={(e) => updateOnlineAppointmentStatus(appt.id, e.target.value)}
                        style={{ ...styles.formInput, margin: 0, padding: '4px 8px', fontSize: 13 }}
                      >
                        {apptStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {websiteTab === 'inquiries' && (
          <div style={styles.tableWrapper}>
            <table style={styles.branchTable}>
              <thead>
                <tr>
                  {['Full Name', 'Phone', 'Concern', 'Message', 'Submitted'].map((col) => (
                    <th key={col} style={styles.tableHead}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInqs.length === 0 ? (
                  <tr><td colSpan={5} style={styles.emptyRow}>No online inquiry submissions found.</td></tr>
                ) : filteredInqs.map((inq) => (
                  <tr key={inq.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{inq.full_name}</td>
                    <td style={styles.tableCell}>{inq.phone_number}</td>
                    <td style={styles.tableCell}>{inq.concern}</td>
                    <td style={styles.tableCell} title={inq.message}>
                      {inq.message?.length > 80 ? inq.message.slice(0, 80) + '…' : inq.message}
                    </td>
                    <td style={styles.tableCell}>{String(inq.created_at || '').slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  function renderAdminAccountPanel() {
    const displayDate = String(adminAccountForm.created_at || '').slice(0, 10) || 'N/A';

    return (
      <section style={styles.accountCard}>
        <div style={styles.accountHeader}>
          <div>
            <h3 style={styles.accountTitle}>Admin Account Information</h3>
            <p style={styles.accountSubtitle}>
              Update the logged-in admin account saved in the users table.
            </p>
          </div>
          <span style={getStatusStyle(adminAccountForm.status)}>
            {adminAccountForm.status}
          </span>
        </div>

        {adminAccountMessage && (
          <p style={styles.successText}>{adminAccountMessage}</p>
        )}

        {adminAccountError && (
          <p style={styles.errorText}>{adminAccountError}</p>
        )}

        {!isEditingAdminAccount ? (
          <>
            <div style={styles.accountDetailsGrid}>
              <InfoItem styles={styles} label="Full Name" value={adminAccountForm.name || 'N/A'} />
              <InfoItem styles={styles} label="Email Address" value={adminAccountForm.email || 'N/A'} />
              <InfoItem styles={styles} label="Contact Number" value={adminAccountForm.phone || 'N/A'} />
              <InfoItem styles={styles} label="Access Role" value="Admin" />
              <InfoItem styles={styles} label="Date Created" value={displayDate} />
              <InfoItem styles={styles} label="Status" value={adminAccountForm.status || 'N/A'} />
            </div>

            <div style={styles.overlayActions}>
              <button
                type="button"
                style={styles.saveBtn}
                onClick={() => {
                  setAdminAccountMessage('');
                  setAdminAccountError('');
                  setIsEditingAdminAccount(true);
                }}
              >
                Edit Admin Account
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={saveAdminAccount}>
            <div style={styles.formGrid}>
              <Field label="Full Name" styles={styles}>
                <input
                  type="text"
                  value={adminAccountForm.name}
                  onChange={(event) =>
                    handleAdminAccountChange('name', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Email Address" styles={styles}>
                <input
                  type="email"
                  value={adminAccountForm.email}
                  onChange={(event) =>
                    handleAdminAccountChange('email', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Contact Number" styles={styles}>
                <input
                  type="text"
                  value={adminAccountForm.phone}
                  onChange={(event) =>
                    handleAdminAccountChange('phone', event.target.value)
                  }
                  style={styles.formInput}
                  placeholder="Enter contact number"
                />
              </Field>

              <Field label="Status" styles={styles}>
                <select
                  value={adminAccountForm.status}
                  onChange={(event) =>
                    handleAdminAccountChange('status', event.target.value)
                  }
                  style={styles.formInput}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>

              <Field label="Password" styles={styles}>
                <input
                  type="password"
                  value={adminAccountForm.password}
                  onChange={(event) =>
                    handleAdminAccountChange('password', event.target.value)
                  }
                  style={styles.formInput}
                  placeholder="Optional new password"
                  minLength={8}
                />
              </Field>

              <Field label="Confirm Password" styles={styles}>
                <input
                  type="password"
                  value={adminAccountForm.confirmPassword}
                  onChange={(event) =>
                    handleAdminAccountChange('confirmPassword', event.target.value)
                  }
                  style={styles.formInput}
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </Field>

              <Field label="Access Role" styles={styles}>
                <input
                  type="text"
                  value="Admin"
                  style={{ ...styles.formInput, ...styles.readOnlyInput }}
                  readOnly
                />
              </Field>

              <Field label="Date Created" styles={styles}>
                <input
                  type="text"
                  value={displayDate}
                  style={{ ...styles.formInput, ...styles.readOnlyInput }}
                  readOnly
                />
              </Field>
            </div>

            <p style={styles.passwordHint}>
              Password is optional. Use at least 8 letters/numbers, with one letter and one number. Special characters are not allowed.
            </p>

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => {
                  setAdminAccountMessage('');
                  setAdminAccountError('');
                  setIsEditingAdminAccount(false);
                  loadAdminAccount();
                }}
              >
                Cancel
              </button>

              <button type="submit" style={styles.saveBtn}>
                Update Admin Account
              </button>
            </div>
          </form>
        )}
      </section>
    );
  }

  function renderToolbar() {
    if (activeSection === 'adminAccount' || activeSection === 'leaveRequests') {
    return null;
    } 

    if (activeSection === 'branch') {
      return (
        <SectionToolbar
          styles={styles}
          searchValue={filters.branchSearch}
          searchPlaceholder={sectionConfig.branch.searchPlaceholder}
          onSearchChange={(value) => updateFilter('branchSearch', value)}
          addLabel={sectionConfig.branch.addLabel}
          addIcon={sectionConfig.branch.addIcon}
          onAdd={() => openBranchForm()}
        >
          <select
            value={filters.branchStatus}
            onChange={(event) => updateFilter('branchStatus', event.target.value)}
            style={styles.selectInput}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Opening">Opening</option>
            <option value="Closed">Closed</option>
            <option value="Renovation">Renovation</option>
          </select>
        </SectionToolbar>
      );
    }

    if (activeSection === 'services') {
      return (
        <SectionToolbar
          styles={styles}
          searchValue={filters.serviceSearch}
          searchPlaceholder={sectionConfig.services.searchPlaceholder}
          onSearchChange={(value) => updateFilter('serviceSearch', value)}
          addLabel={sectionConfig.services.addLabel}
          addIcon={sectionConfig.services.addIcon}
          onAdd={() => openServiceForm()}
        >
          <select
            value={filters.serviceCategory}
            onChange={(event) => updateFilter('serviceCategory', event.target.value)}
            style={styles.selectInput}
          >
            <option value="All">All Categories</option>
            <option value="General Dentistry">General Dentistry</option>
            <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
            <option value="Orthodontics">Orthodontics</option>
            <option value="Surgery">Surgery</option>
          </select>

          <select
            value={filters.serviceStatus}
            onChange={(event) => updateFilter('serviceStatus', event.target.value)}
            style={styles.selectInput}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </SectionToolbar>
      );
    }

    if (activeSection === 'website') {
      return null;
    }

    return (
      <SectionToolbar
        styles={styles}
        searchValue={filters.userSearch}
        searchPlaceholder={sectionConfig.users.searchPlaceholder}
        onSearchChange={(value) => updateFilter('userSearch', value)}
        addLabel={sectionConfig.users.addLabel}
        addIcon={sectionConfig.users.addIcon}
        onAdd={() => openUserForm()}
      >
        <select
          value={filters.userRole}
          onChange={(event) => updateFilter('userRole', event.target.value)}
          style={styles.selectInput}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Dentist">Dentist</option>
          <option value="Patient">Patient</option>
          <option value="Receptionist">Receptionist</option>
        </select>

        <select
          value={filters.userStatus}
          onChange={(event) => updateFilter('userStatus', event.target.value)}
          style={styles.selectInput}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </SectionToolbar>
    );
  }

  function renderRows() {
    if (paginatedRows.length === 0) {
      return (
        <tr>
          <td
            colSpan={sectionConfig[activeSection].columns.length}
            style={styles.emptyRow}
          >
            {sectionConfig[activeSection].emptyText}
          </td>
        </tr>
      );
    }

    if (activeSection === 'branch') {
      return paginatedRows.map((branch) => (
        <tr key={branch.id} style={styles.tableRow}>
          <td style={styles.tableCell}>{branch.name}</td>
          <td style={styles.tableCell}>{branch.date_opened}</td>
          <td style={styles.tableCell}>{branch.address}</td>
          <td style={styles.tableCell}>{branch.phone}</td>
          <td style={styles.tableCell}>{branch.contact_person}</td>
          <td style={styles.tableCell}>{branch.operating_hours}</td>
          <td style={styles.tableCell}>{branch.years_active}</td>
          <td style={styles.tableCell}>
            <span style={getStatusStyle(branch.status)}>{branch.status}</span>
          </td>
          <td style={styles.tableCell}>
            <button
              type="button"
              style={styles.editBtn}
              onClick={() => openBranchForm(branch)}
            >
              <i className="fi fi-rr-file-edit"></i>
            </button>
          </td>
        </tr>
      ));
    }

    if (activeSection === 'services') {
      return paginatedRows.map((service) => (
        <tr key={service.id} style={styles.tableRow}>
          <td style={styles.tableCell}>{service.name}</td>
          <td style={styles.tableCell}>{service.category}</td>
          <td style={styles.tableCell}>₱{service.price}</td>
          <td style={styles.tableCell}>{service.duration}</td>
          <td style={styles.tableCell}>
            <span style={getStatusStyle(service.status)}>{service.status}</span>
          </td>
          <td style={styles.tableCell}>
            <button
              type="button"
              style={styles.editBtn}
              onClick={() => openServiceForm(service)}
            >
              <i className="fi fi-rr-file-edit"></i>
            </button>
          </td>
        </tr>
      ));
    }

    return paginatedRows.map((user) => (
      <tr key={user.id} style={styles.tableRow}>
        <td style={styles.tableCell}>{user.fullName}</td>
        <td style={styles.tableCell}>{user.email}</td>
        <td style={styles.tableCell}>{user.role}</td>
        <td style={styles.tableCell}>{user.branch_address || user.branch_name || '-'}</td>
        <td style={styles.tableCell}>{user.created}</td>
        <td style={styles.tableCell}>
          <span style={getStatusStyle(user.status)}>{user.status}</span>
        </td>
        <td style={styles.tableCell}>
          <button
            type="button"
            style={styles.editBtn}
            onClick={() => openUserForm(user)}
          >
            <i className="fi fi-rr-file-edit"></i>
          </button>
        </td>
      </tr>
    ));
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

          <Link to="/adminEmployees" style={styles.menuItem}>
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

          <Link
            to="/adminSettings"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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
                <div style={styles.adminName}>
                  {adminAccountForm.name || adminAccountForm.email || 'Admin'}
                </div>
                <div style={styles.adminPosition}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Admin Settings</span>

              <h2 style={styles.heroTitle}>
                Control clinic branches, services, pricing, and website
                management.
              </h2>

              <p style={styles.heroText}>
                Organize branch information, update service details, manage
                pricing, and customize website content.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i className="fi fi-rr-settings" style={styles.heroIcon}></i>
            </div>
          </section>

          <section style={styles.settingsTabs}>
            {Object.entries(sectionConfig).map(([key, section]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                style={{
                  ...styles.settingsTab,
                  ...(activeSection === key ? styles.settingsTabActive : {}),
                }}
              >
                <i className={section.icon} style={styles.settingsTabIcon}></i>
                <span>{section.label}</span>
              </button>
            ))}
          </section>

          {activeSection === 'adminAccount' ? (
            renderAdminAccountPanel()
          ) : activeSection === 'leaveRequests' ? (
            <AdminScheduleRequests
              adminSettingsStyles={styles}
              getStatusStyle={getStatusStyle}
              isMobile={isMobile}
              isSmallScreen={isSmallScreen}
              highlightRequestId={highlightRequestId}
            />
          ) : activeSection === 'website' ? (
            renderWebsitePanel()
          ) : (
            <>
              {renderToolbar()}

              <section style={styles.tableCard}>
                <div style={styles.tableWrapper}>
                  <table style={styles.branchTable}>
                    <thead>
                      <tr>
                        {sectionConfig[activeSection].columns.map((column) => (
                          <th key={column} style={styles.tableHead}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>{renderRows()}</tbody>
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
                    {activeRows.length === 0
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
            </>
          )}
        </main>
      </div>

      {activeOverlay === 'branch' && (
        <FormOverlay
          styles={styles}
          title={branchForm.id ? 'Update Branch' : 'New Branch'}
          onClose={closeOverlay}
          onOverlayClick={handleOverlayClick}
        >
          <form onSubmit={saveBranch}>
            <div style={styles.formGrid}>
              <Field label="Branch Name" styles={styles}>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(event) =>
                    handleBranchChange('name', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Clinic Location" styles={styles}>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(event) =>
                    handleBranchChange('address', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Date Opened" styles={styles}>
                <input
                  type="date"
                  value={branchForm.date_opened}
                  onChange={(event) =>
                    handleBranchChange('date_opened', event.target.value)
                  }
                  style={styles.formInput}
                />
              </Field>

              <Field label="Contact Number" styles={styles}>
                <input
                  type="tel"
                  value={branchForm.phone}
                  onChange={(event) =>
                    handleBranchChange('phone', event.target.value)
                  }
                  style={styles.formInput}
                />
              </Field>

              <Field label="Contact Person" styles={styles}>
                <input
                  type="text"
                  value={branchForm.contact_person}
                  onChange={(event) =>
                    handleBranchChange('contact_person', event.target.value)
                  }
                  style={styles.formInput}
                />
              </Field>

              <Field label="Operating Hours" styles={styles}>
                <input
                  type="text"
                  value={branchForm.operating_hours}
                  onChange={(event) =>
                    handleBranchChange('operating_hours', event.target.value)
                  }
                  style={styles.formInput}
                  placeholder="Mon - Sat, 9:00 AM - 5:00 PM"
                />
              </Field>

              <Field label="Years Active" styles={styles}>
                <input
                  type="text"
                  value={branchForm.years_active}
                  onChange={(event) =>
                    handleBranchChange('years_active', event.target.value)
                  }
                  style={styles.formInput}
                />
              </Field>

              <Field label="Status" styles={styles}>
                <select
                  value={branchForm.status}
                  onChange={(event) =>
                    handleBranchChange('status', event.target.value)
                  }
                  style={styles.formInput}
                  required
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Opening">Opening Soon</option>
                  <option value="Closed">Closed</option>
                </select>
              </Field>
            </div>

            <FormActions styles={styles} label="Save Branch" />
          </form>
        </FormOverlay>
      )}

      {activeOverlay === 'services' && (
        <FormOverlay
          styles={styles}
          title={serviceForm.id ? 'Update Service' : 'New Service'}
          onClose={closeOverlay}
          onOverlayClick={handleOverlayClick}
        >
          <form onSubmit={saveService}>
            <div style={styles.formGrid}>
              <Field label="Service Name" styles={styles}>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(event) =>
                    handleServiceChange('name', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Category" styles={styles}>
                <select
                  value={serviceForm.category}
                  onChange={(event) =>
                    handleServiceChange('category', event.target.value)
                  }
                  style={styles.formInput}
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="General Dentistry">General Dentistry</option>
                  <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
                  <option value="Orthodontics">Orthodontics</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </Field>

              <Field label="Price" styles={styles}>
                <input
                  type="text"
                  value={serviceForm.price}
                  onChange={(event) =>
                    handleServiceChange('price', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Duration" styles={styles}>
                <input
                  type="text"
                  value={serviceForm.duration}
                  onChange={(event) =>
                    handleServiceChange('duration', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Status" styles={styles}>
                <select
                  value={serviceForm.status}
                  onChange={(event) =>
                    handleServiceChange('status', event.target.value)
                  }
                  style={styles.formInput}
                  required
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </Field>

            </div>

            <FormActions styles={styles} label="Save Service" />
          </form>
        </FormOverlay>
      )}

      {activeOverlay === 'users' && (
        <FormOverlay
          styles={styles}
          title={userForm.id ? 'Update User Account' : 'New User Account'}
          onClose={closeOverlay}
          onOverlayClick={handleOverlayClick}
        >
          <form onSubmit={saveUser}>
            <div style={styles.formGrid}>
              <Field label="Full Name" styles={styles}>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(event) =>
                    handleUserChange('fullName', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Email Address" styles={styles}>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(event) =>
                    handleUserChange('email', event.target.value)
                  }
                  style={styles.formInput}
                  required
                />
              </Field>

              <Field label="Access Role" styles={styles}>
                <select
                  value={userForm.role}
                  onChange={(event) =>
                    handleUserChange('role', event.target.value)
                  }
                  style={styles.formInput}
                  required
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Patient">Patient</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </Field>

              <Field label="Assigned Branch" styles={styles}>
                <select
                  value={userForm.branch_id}
                  onChange={(event) =>
                    handleUserChange('branch_id', event.target.value)
                  }
                  style={styles.formInput}
                  disabled={userForm.role === 'Admin'}
                  required={userForm.role !== 'Admin'}
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.address ? `${branch.name} - ${branch.address}` : branch.name}
                    </option>
                  ))}
                </select>
              </Field>

              {!userForm.id && (
                <Field label="Password" styles={styles}>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(event) =>
                      handleUserChange('password', event.target.value)
                    }
                    style={styles.formInput}
                    placeholder="Leave blank to generate"
                  />
                </Field>
              )}

              <Field label="Status" styles={styles}>
                <select
                  value={userForm.status}
                  onChange={(event) =>
                    handleUserChange('status', event.target.value)
                  }
                  style={styles.formInput}
                  required
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>

            <FormActions styles={styles} label="Save User Account" />
          </form>
        </FormOverlay>
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

function SectionToolbar({
  styles,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  addLabel,
  addIcon,
  onAdd,
  children,
}) {
  return (
    <section style={styles.toolbar}>
      <div style={styles.searchBox}>
        <i className="fi fi-rr-search" style={styles.searchIcon}></i>

        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.rightActions}>
        {children}

        <button type="button" onClick={onAdd} style={styles.primaryBtn}>
          <i className={addIcon}></i>
          <span>{addLabel}</span>
        </button>
      </div>
    </section>
  );
}

function FormOverlay({ styles, title, onClose, onOverlayClick, children }) {
  return (
    <div style={styles.overlay} onClick={onOverlayClick}>
      <div style={styles.overlayContent}>
        <div style={styles.overlayHeader}>
          <h3 style={styles.overlayTitle}>{title}</h3>

          <button type="button" onClick={onClose} style={styles.overlayClose}>
            &times;
          </button>
        </div>

        <div style={styles.overlayBody}>{children}</div>
      </div>
    </div>
  );
}

function Field({ styles, label, children, wide = false }) {
  return (
    <div style={{ ...styles.field, ...(wide ? styles.fieldWide : {}) }}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function InfoItem({ styles, label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  );
}

function FormActions({ styles, label }) {
  return (
    <div style={styles.overlayActions}>
      <button type="submit" style={styles.saveBtn}>
        {label}
      </button>
    </div>
  );
}

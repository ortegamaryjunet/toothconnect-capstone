import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import api from '../api/axios';
import {
  getManageServiceKit,
  saveManageServiceKit,
  listSupplies,
  listMedicines,
  listEquipment,
  listServiceKitHistory,
} from '../api/inventory';
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
      'Time Buffer',
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
  time_buffer_min: 30,
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

const WEBSITE_FONT_OPTIONS = [
  'Arial, sans-serif',
  'Inter, sans-serif',
  'Poppins, sans-serif',
  'Roboto, sans-serif',
  'Montserrat, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
];

const WEBSITE_FONT_SIZE_OPTIONS = ['12px', '13px', '14px', '15px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '42px', '48px'];

const WEBSITE_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' },
];

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
  const [onlineInquiries, setOnlineInquiries] = useState([]);
  const [websiteTab, setWebsiteTab] = useState('content');

  const [websiteContent, setWebsiteContent] = useState({});
  const [websiteFaqs, setWebsiteFaqs] = useState([]);
  const [websiteServices, setWebsiteServices] = useState([]);
  const [websiteAnnouncements, setWebsiteAnnouncements] = useState([]);
  const [websiteContentSection, setWebsiteContentSection] = useState('hero');
  const [websiteContentForm, setWebsiteContentForm] = useState({});
  const [websiteContentSaving, setWebsiteContentSaving] = useState(false);
  const [websiteContentEditing, setWebsiteContentEditing] = useState(false);
  const [websiteContentMsg, setWebsiteContentMsg] = useState({ text: '', type: '' });
  const [websiteValidationModal, setWebsiteValidationModal] = useState(null);
  const [websiteFaqOverlay, setWebsiteFaqOverlay] = useState(null);
  const [websiteServiceOverlay, setWebsiteServiceOverlay] = useState(null);
  const [websiteAnnouncementOverlay, setWebsiteAnnouncementOverlay] = useState(null);
  const [users, setUsers] = useState([]);
  const [adminAccountForm, setAdminAccountForm] = useState(initialAdminAccountForm);
  const [isEditingAdminAccount, setIsEditingAdminAccount] = useState(false);
  const [adminAccountMessage, setAdminAccountMessage] = useState('');
  const [adminAccountError, setAdminAccountError] = useState('');

  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [serviceKitOverlay, setServiceKitOverlay] = useState(false);
  const [serviceKitServiceId, setServiceKitServiceId] = useState('');
  const [serviceKitBranchId, setServiceKitBranchId] = useState('');
  const [serviceKitItems, setServiceKitItems] = useState([]);
  const [serviceKitItemErrors, setServiceKitItemErrors] = useState([]);
  const [serviceKitServicesForBranch, setServiceKitServicesForBranch] = useState([]);
  const [serviceKitInventory, setServiceKitInventory] = useState({
    supplies: [],
    medicines: [],
    equipment: [],
  });
  const [removeKitItemIndex, setRemoveKitItemIndex] = useState(null);
  const [showServiceKitHistory, setShowServiceKitHistory] = useState(false);
  const [serviceKitHistoryRows, setServiceKitHistoryRows] = useState([]);
  const [serviceKitHistoryLoading, setServiceKitHistoryLoading] = useState(false);
  const [serviceKitHistoryError, setServiceKitHistoryError] = useState('');
  const [serviceKitHistoryFilters, setServiceKitHistoryFilters] = useState({ startDate: '', endDate: '', branchId: '' });

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
    if (showLogoutModal || activeOverlay || websiteFaqOverlay || websiteServiceOverlay || websiteAnnouncementOverlay || websiteValidationModal || serviceKitOverlay || showServiceKitHistory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, activeOverlay, websiteFaqOverlay, websiteServiceOverlay, websiteAnnouncementOverlay, websiteValidationModal, serviceKitOverlay, showServiceKitHistory]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeOverlay();
        setWebsiteFaqOverlay(null);
        setWebsiteServiceOverlay(null);
        setWebsiteAnnouncementOverlay(null);
        setWebsiteValidationModal(null);
        setServiceKitOverlay(false);
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
    loadWebsiteContent();
    loadWebsiteFaqs();
    loadWebsiteServices();
    loadWebsiteAnnouncements();
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

  async function loadOnlineInquiries() {
    try {
      const res = await api.get('/website/inquiries');
      setOnlineInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error('Failed to load online inquiries', err);
      setOnlineInquiries([]);
    }
  }

  async function loadWebsiteContent() {
    try {
      const res = await api.get('/website/content');
      const content = res.data.content || {};
      setWebsiteContent(content);
      setWebsiteContentForm(content);
    } catch (err) {
      console.error('Failed to load website content', err);
    }
  }

  async function loadWebsiteFaqs() {
    try {
      const res = await api.get('/website/faqs/all');
      setWebsiteFaqs(res.data.faqs || []);
    } catch (err) {
      console.error('Failed to load website FAQs', err);
    }
  }

  async function loadWebsiteServices() {
    try {
      const res = await api.get('/website/website-services/all');
      setWebsiteServices(res.data.services || []);
    } catch (err) {
      console.error('Failed to load website services', err);
    }
  }

  async function loadWebsiteAnnouncements() {
    try {
      const res = await api.get('/website/announcements/all');
      setWebsiteAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error('Failed to load website announcements', err);
    }
  }

  function showWebsiteValidationModal(title, message, type = 'error') {
    setWebsiteValidationModal({
      title,
      message,
      type,
    });
  }

  function validateWebsiteFields(fields, requiredKeys = []) {
    const missing = requiredKeys.filter((key) => !String(fields[key] || '').trim());

    if (missing.length > 0) {
      showWebsiteValidationModal(
        'Required Fields Missing',
        'Please complete all required website content fields before saving.'
      );
      return false;
    }

    return true;
  }

  async function saveWebsiteContent(sectionFields, requiredKeys = []) {
    if (!validateWebsiteFields(sectionFields, requiredKeys)) {
      return;
    }

    setWebsiteContentSaving(true);
    setWebsiteContentMsg({ text: '', type: '' });

    try {
      const res = await api.put('/website/content', { fields: sectionFields });
      const updated = res.data.content || {};

      setWebsiteContent(updated);
      setWebsiteContentForm(updated);
      setWebsiteContentEditing(false);
      showWebsiteValidationModal(
        'Content Saved',
        'Website content has been updated successfully.',
        'success'
      );
    } catch (err) {
      showWebsiteValidationModal(
        'Save Failed',
        err.response?.data?.message || 'Failed to save website content.'
      );
    } finally {
      setWebsiteContentSaving(false);
    }
  }

  async function saveFaq(data) {
    try {
      if (data.id) {
        const res = await api.put(`/website/faqs/${data.id}`, data);
        setWebsiteFaqs(res.data.faqs || []);
      } else {
        const res = await api.post('/website/faqs', data);
        setWebsiteFaqs(res.data.faqs || []);
      }
      setWebsiteFaqOverlay(null);
    } catch (err) {
      showWebsiteValidationModal('Save Failed', err.response?.data?.message || 'Failed to save FAQ.');
    }
  }

  async function deleteFaq(id) {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      const res = await api.delete(`/website/faqs/${id}`);
      setWebsiteFaqs(res.data.faqs || []);
    } catch (err) {
      showWebsiteValidationModal('Delete Failed', err.response?.data?.message || 'Failed to delete FAQ.');
    }
  }

  async function saveWebsiteService(data) {
    try {
      if (data.id) {
        const res = await api.put(`/website/website-services/${data.id}`, data);
        setWebsiteServices(res.data.services || []);
      } else {
        const res = await api.post('/website/website-services', data);
        setWebsiteServices(res.data.services || []);
      }
      setWebsiteServiceOverlay(null);
    } catch (err) {
      showWebsiteValidationModal('Save Failed', err.response?.data?.message || 'Failed to save service.');
    }
  }

  async function deleteWebsiteService(id) {
    if (!window.confirm('Delete this service card?')) return;
    try {
      const res = await api.delete(`/website/website-services/${id}`);
      setWebsiteServices(res.data.services || []);
    } catch (err) {
      showWebsiteValidationModal('Delete Failed', err.response?.data?.message || 'Failed to delete service.');
    }
  }

  async function saveAnnouncement(data) {
    try {
      if (data.id) {
        const res = await api.put(`/website/announcements/${data.id}`, data);
        setWebsiteAnnouncements(res.data.announcements || []);
      } else {
        const res = await api.post('/website/announcements', data);
        setWebsiteAnnouncements(res.data.announcements || []);
      }
      setWebsiteAnnouncementOverlay(null);
    } catch (err) {
      showWebsiteValidationModal('Save Failed', err.response?.data?.message || 'Failed to save announcement.');
    }
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.delete(`/website/announcements/${id}`);
      setWebsiteAnnouncements(res.data.announcements || []);
    } catch (err) {
      showWebsiteValidationModal('Delete Failed', err.response?.data?.message || 'Failed to delete announcement.');
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

    if (name === 'price') {
      newValue = allowPriceOnly(value);
    }
    if (['duration', 'time_buffer_min'].includes(name)) {
      newValue = value.replace(/[^0-9]/g, '');
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
      time_buffer_min: Number(serviceForm.time_buffer_min || 30),
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

  async function openServiceKitManager(service = null) {
    const resolvedServiceId = service?.id ? String(service.id) : String(services?.[0]?.id || '');
    if (!resolvedServiceId) return alert('No service available.');

    const branchId = Number(branches?.[0]?.id || 0);
    if (!branchId) return alert('No branch available.');

    setServiceKitOverlay(true);
    setServiceKitBranchId(String(branchId));
    setServiceKitServiceId(resolvedServiceId);
    setServiceKitItemErrors([]);
    setServiceKitServicesForBranch([]);

    try {
      const [supplies, medicines, equipment, data] = await Promise.all([
        listSupplies(branchId),
        listMedicines(branchId),
        listEquipment(branchId),
        getManageServiceKit(Number(resolvedServiceId), branchId),
      ]);

      setServiceKitInventory({
        supplies: Array.isArray(supplies) ? supplies : [],
        medicines: Array.isArray(medicines) ? medicines : [],
        equipment: Array.isArray(equipment) ? equipment : [],
      });

      // Load services for this branch (best-effort); fallback to all services.
      try {
        const meta = await api.get('/appointments/_meta/services-and-branches');
        const metaServices = Array.isArray(meta.data?.services) ? meta.data.services : [];
        const filtered = metaServices.filter((s) =>
          Array.isArray(s.available_branch_ids)
            ? s.available_branch_ids.includes(Number(branchId))
            : true
        );
        const serviceOptions = filtered.length ? filtered : services;
        setServiceKitServicesForBranch(serviceOptions);
        if (!serviceOptions.some((s) => String(s.id) === String(resolvedServiceId))) {
          const nextId = String(serviceOptions[0]?.id || '');
          if (nextId) setServiceKitServiceId(nextId);
        }
      } catch {
        setServiceKitServicesForBranch(services);
      }

      setServiceKitItems((data.items || []).map((item) => ({
        category: item.category,
        item_name: item.item_name,
        default_quantity: String(item.default_quantity || ''),
        current_stock: item.current_stock,
      })));
      setServiceKitItemErrors(
        (data.items || []).map(() => ({ category: '', item_name: '', default_quantity: '' }))
      );
    } catch (err) {
      setServiceKitItems([]);
      alert(err.response?.data?.message || 'Failed to load service kit.');
    }
  }

  async function reloadServiceKitBranch(branchId) {
    if (!serviceKitOverlay || !branchId) return;
    setServiceKitBranchId(String(branchId));
    try {
      const [supplies, medicines, equipment] = await Promise.all([
        listSupplies(branchId),
        listMedicines(branchId),
        listEquipment(branchId),
      ]);
      setServiceKitInventory({
        supplies: Array.isArray(supplies) ? supplies : [],
        medicines: Array.isArray(medicines) ? medicines : [],
        equipment: Array.isArray(equipment) ? equipment : [],
      });

      // Load services "available" for this branch (based on appointment meta).
      // Fallback: if meta fails or yields empty, show all services.
      let serviceOptions = services;
      try {
        const meta = await api.get('/appointments/_meta/services-and-branches');
        const metaServices = Array.isArray(meta.data?.services) ? meta.data.services : [];
        const filtered = metaServices.filter((s) =>
          Array.isArray(s.available_branch_ids)
            ? s.available_branch_ids.includes(Number(branchId))
            : true
        );
        serviceOptions = filtered.length ? filtered : services;
      } catch {
        serviceOptions = services;
      }
      setServiceKitServicesForBranch(serviceOptions);

      // If the currently selected service is not in this branch's list, reset to first.
      const branchServiceIds = new Set(serviceOptions.map((s) => String(s.id)));
      const nextServiceId = branchServiceIds.has(String(serviceKitServiceId))
        ? String(serviceKitServiceId)
        : String(serviceOptions[0]?.id || '');
      if (nextServiceId && nextServiceId !== String(serviceKitServiceId)) {
        setServiceKitServiceId(nextServiceId);
      }

      const data = nextServiceId
        ? await getManageServiceKit(Number(nextServiceId), branchId)
        : { items: [] };
      setServiceKitItems((data.items || []).map((item) => ({
        category: item.category,
        item_name: item.item_name,
        default_quantity: String(item.default_quantity || ''),
        current_stock: item.current_stock,
      })));
      setServiceKitItemErrors((data.items || []).map(() => ({ category: '', item_name: '', default_quantity: '' })));
    } catch {
      setServiceKitItems([]);
    }
  }

  async function reloadServiceKitService(nextServiceId) {
    const sid = String(nextServiceId || '');
    if (!sid) return;
    if (!serviceKitOverlay) return;

    setServiceKitServiceId(sid);

    const branchId = Number(serviceKitBranchId || 0);
    if (!branchId) return;

    try {
      const data = await getManageServiceKit(Number(sid), branchId);
      setServiceKitItems((data.items || []).map((item) => ({
        category: item.category,
        item_name: item.item_name,
        default_quantity: String(item.default_quantity || ''),
        current_stock: item.current_stock,
      })));
      setServiceKitItemErrors((data.items || []).map(() => ({ category: '', item_name: '', default_quantity: '' })));
    } catch {
      setServiceKitItems([]);
    }
  }

  function updateServiceKitItem(index, field, value) {
    setServiceKitItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
    setServiceKitItemErrors((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      while (next.length < serviceKitItems.length) {
        next.push({ category: '', item_name: '', default_quantity: '' });
      }
      const row = next[index] || { category: '', item_name: '', default_quantity: '' };
      const updated = { ...row };
      if (field === 'category') updated.category = value ? '' : 'Category is required';
      if (field === 'item_name') updated.item_name = value ? '' : 'Item is required';
      if (field === 'default_quantity') {
        const n = Number(value || 0);
        const stock = serviceKitItems[index]?.current_stock;
        if (n < 1) {
          updated.default_quantity = 'Default quantity must be at least 1';
        } else if (stock !== null && stock !== undefined && n > Number(stock)) {
          updated.default_quantity = 'Exceeds current stock';
        } else {
          updated.default_quantity = '';
        }
      }
      next[index] = updated;
      return next;
    });
  }

  function addServiceKitItem() {
    setServiceKitItems((prev) => [...prev, { category: 'supply', item_name: '', default_quantity: '1', current_stock: null }]);
    setServiceKitItemErrors((prev) => [...(Array.isArray(prev) ? prev : []), { category: '', item_name: 'Item is required', default_quantity: '' }]);
  }

  function removeServiceKitItem(index) {
    setServiceKitItems((prev) => prev.filter((_, idx) => idx !== index));
    setServiceKitItemErrors((prev) => (Array.isArray(prev) ? prev.filter((_, idx) => idx !== index) : []));
  }

  async function saveServiceKit() {
    if (!serviceKitOverlay || !serviceKitServiceId) return;

    const branchId = Number(serviceKitBranchId || 0);
    if (!branchId) return;

    const newErrors = serviceKitItems.map((row) => {
      const qty = Number(row.default_quantity || 0);
      const stock = row.current_stock;
      let qtyErr = '';
      if (qty < 1) qtyErr = 'Default quantity must be at least 1';
      else if (stock !== null && stock !== undefined && qty > Number(stock)) qtyErr = 'Exceeds current stock';
      return {
        category: row.category ? '' : 'Category is required',
        item_name: row.item_name ? '' : 'Item is required',
        default_quantity: qtyErr,
      };
    });
    setServiceKitItemErrors(newErrors);
    if (newErrors.some((e) => e.category || e.item_name || e.default_quantity)) return;

    const payload = {
      notes: null,
      branch_id: branchId,
      items: serviceKitItems.map((item) => ({
        category: item.category,
        item_name: item.item_name,
        default_quantity: Number(item.default_quantity || 0),
      })),
    };
    try {
      await saveManageServiceKit(Number(serviceKitServiceId), payload);
      setServiceKitOverlay(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service kit.');
    }
  }

  async function openServiceKitHistory() {
    setShowServiceKitHistory(true);
    setServiceKitHistoryError('');
    setServiceKitHistoryRows([]);
    setServiceKitHistoryFilters({ startDate: '', endDate: '', branchId: '' });
    await loadServiceKitHistory({ startDate: '', endDate: '', branchId: '' });
  }

  function closeServiceKitHistory() {
    setShowServiceKitHistory(false);
  }

  async function loadServiceKitHistory(overrideFilters) {
    const f = overrideFilters || serviceKitHistoryFilters;
    setServiceKitHistoryLoading(true);
    setServiceKitHistoryError('');
    try {
      const params = {};
      if (f.startDate) params.start_date = f.startDate;
      if (f.endDate) params.end_date = f.endDate;
      if (f.branchId) params.branch_id = f.branchId;
      const records = await listServiceKitHistory(params);
      setServiceKitHistoryRows(records);
    } catch (err) {
      setServiceKitHistoryError(err.response?.data?.message || 'Failed to load service kit history.');
    } finally {
      setServiceKitHistoryLoading(false);
    }
  }

  function getInventoryOptionsForCategory(category) {
    if (category === 'medicine') {
      return serviceKitInventory.medicines.map((m) => ({
        name: m.medicine_name,
        stock: Number(m.quantity || 0),
      }));
    }
    if (category === 'equipment') {
      return serviceKitInventory.equipment.map((e) => ({
        name: e.equipment_name,
        stock: Number(e.quantity || 0),
      }));
    }
    return serviceKitInventory.supplies.map((s) => ({
      name: s.supply_name,
      stock: Number(s.quantity || 0),
    }));
  }

  const serviceKitBranchSelected = !!Number(serviceKitBranchId || 0);
  const serviceKitServiceSelected = !!Number(serviceKitServiceId || 0);
  const serviceKitRowInputsDisabled = !(serviceKitBranchSelected && serviceKitServiceSelected);
  const kitSaveDisabled = serviceKitRowInputsDisabled || (Array.isArray(serviceKitItemErrors) && serviceKitItemErrors.some((e) => e?.default_quantity || e?.item_name || e?.category));
  const serviceKitGridStyles = {
    display: 'grid',
    gridTemplateColumns: '140px minmax(0, 1fr) 90px 100px 100px',
    gap: 10,
    alignItems: 'center',
  };

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

    if (['active', 'published', 'approved', 'completed'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusActive };
    }

    if (['pending', 'draft'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusPending };
    }

    if (['inactive', 'hidden'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusInactive };
    }

    if (statusKey === 'opening') {
      return { ...styles.statusBadge, ...styles.statusOpening };
    }

    if (['closed', 'discontinued', 'rejected'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusClosed };
    }

    if (['cancelled', 'canceled'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusCancelled };
    }

    if (['renovation'].includes(statusKey)) {
      return { ...styles.statusBadge, ...styles.statusRenovation };
    }

    return styles.statusBadge;
  }

  function handleWebsiteLogoFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setWebsiteContentForm((prev) => ({
        ...prev,
        website_logo_path: reader.result,
        website_logo_file_name: file.name,
      }));
    };

    reader.readAsDataURL(file);
  }

  function renderWebsitePanel() {

    const contentSectionBtnStyle = (active) => ({
      padding: '6px 14px',
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: active ? '#2563eb' : '#e2e8f0',
      background: active ? '#2563eb' : '#fff',
      color: active ? '#fff' : '#475569',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      fontFamily: 'Arial, sans-serif',
    });

    const fieldRow = (label, key, type = 'text', options = []) => {
      const value = websiteContentForm[key] || '';

      return (
        <div key={key} style={styles.websiteFieldRow}>
          <label style={styles.websiteFieldLabel}>{label}</label>

          {websiteContentEditing ? (
            type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(event) =>
                  setWebsiteContentForm((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                rows={3}
                style={{ ...styles.formInput, ...styles.websiteTextarea }}
              />
            ) : type === 'select' ? (
              <select
                value={value}
                onChange={(event) =>
                  setWebsiteContentForm((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                style={{ ...styles.formInput, width: '100%' }}
              >
                <option value="">Select {label}</option>

                {options.map((option) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;

                  return (
                    <option key={optionValue} value={optionValue}>
                      {optionLabel}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type={type}
                value={value}
                onChange={(event) =>
                  setWebsiteContentForm((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                style={{ ...styles.formInput, width: '100%' }}
              />
            )
          ) : (
            <div
              style={{
                ...styles.formInput,
                ...styles.readOnlyInput,
                minHeight: type === 'textarea' ? 72 : undefined,
                whiteSpace: type === 'textarea' ? 'pre-wrap' : 'normal',
                lineHeight: 1.5,
              }}
            >
              {value || <span style={{ color: '#94a3b8' }}>—</span>}
            </div>
          )}
        </div>
      );
    };

    const collectFieldsByPrefixes = (prefixes) => {
      return Object.fromEntries(
        Object.entries(websiteContentForm).filter(([key]) =>
          prefixes.some((prefix) => key.startsWith(prefix))
        )
      );
    };

    const sectionDesignFields = (prefix, title) => (
      <div style={styles.websiteDesignBox}>
        <h4 style={styles.websiteDesignTitle}>{title} Text Design</h4>

        {fieldRow('Font Style', `${prefix}_font_family`, 'select', WEBSITE_FONT_OPTIONS)}
        {fieldRow('Title Font Size', `${prefix}_title_font_size`, 'select', WEBSITE_FONT_SIZE_OPTIONS)}
        {fieldRow('Description Font Size', `${prefix}_description_font_size`, 'select', WEBSITE_FONT_SIZE_OPTIONS)}
        {fieldRow('Text Alignment', `${prefix}_text_alignment`, 'select', WEBSITE_ALIGNMENT_OPTIONS)}
      </div>
    );

    function getContentSectionFields() {
      if (websiteContentSection === 'hero') {
        return (
          <div>
            {fieldRow('Eyebrow Text', 'hero_eyebrow')}
            {fieldRow('Heading', 'hero_heading')}
            {fieldRow('Description', 'hero_description', 'textarea')}
            {fieldRow('Stat 1 Value (e.g. 10+)', 'hero_stat1_value')}
            {fieldRow('Stat 1 Label', 'hero_stat1_label')}
            {fieldRow('Stat 2 Value (e.g. 98%)', 'hero_stat2_value')}
            {fieldRow('Stat 2 Label', 'hero_stat2_label')}
            {fieldRow('Stat 3 Value (e.g. 20+)', 'hero_stat3_value')}
            {fieldRow('Stat 3 Label', 'hero_stat3_label')}
            {fieldRow('Featured Dentist Name', 'hero_dentist_name')}
            {fieldRow('Featured Dentist Title', 'hero_dentist_title')}
            {sectionDesignFields('hero', 'Hero')}
            {websiteContentEditing && (
              <button
                type="button"
                style={styles.saveBtn}
                disabled={websiteContentSaving}
                onClick={() => saveWebsiteContent(collectFieldsByPrefixes(['hero_']), ['hero_heading', 'hero_description'])}
              >
                {websiteContentSaving ? 'Saving…' : 'Save Hero Content'}
              </button>
            )}
          </div>
        );
      }
      if (websiteContentSection === 'about') {
        return (
          <div>
            {fieldRow('Paragraph 1', 'about_paragraph1', 'textarea')}
            {fieldRow('Paragraph 2', 'about_paragraph2', 'textarea')}
            {fieldRow('Paragraph 3', 'about_paragraph3', 'textarea')}
            {sectionDesignFields('about', 'About')}
            {websiteContentEditing && (
              <button
                type="button"
                style={styles.saveBtn}
                disabled={websiteContentSaving}
                onClick={() => saveWebsiteContent(collectFieldsByPrefixes(['about_']), ['about_paragraph1'])}
              >
                {websiteContentSaving ? 'Saving…' : 'Save About Content'}
              </button>
            )}
          </div>
        );
      }
      if (websiteContentSection === 'contact') {
        return (
          <div>
            {fieldRow('Phone Number 1', 'contact_phone1')}
            {fieldRow('Phone Number 2', 'contact_phone2')}
            {fieldRow('Email Address', 'contact_email')}
            {fieldRow('Facebook Page URL', 'contact_facebook_url')}
            {fieldRow('Contact Section Tagline', 'contact_tagline')}
            {fieldRow('Weekdays Label (e.g. Monday to Saturday)', 'hours_weekdays')}
            {fieldRow('Weekday Hours (e.g. 10:00 AM - 7:00 PM)', 'hours_weekday_time')}
            {fieldRow('Sunday Label', 'hours_sunday')}
            {fieldRow('Sunday Note (e.g. By Appointment)', 'hours_sunday_note')}
            {sectionDesignFields('contact', 'Contact & Hours')}
            {websiteContentEditing && (
              <button
                type="button"
                style={styles.saveBtn}
                disabled={websiteContentSaving}
                onClick={() => saveWebsiteContent(collectFieldsByPrefixes(['contact_', 'hours_']), ['contact_phone1', 'contact_email'])}
              >
                {websiteContentSaving ? 'Saving…' : 'Save Contact & Hours'}
              </button>
            )}
          </div>
        );
      }
      if (websiteContentSection === 'footer') {
        return (
          <div>
            {fieldRow('Brand Name', 'footer_brand_name')}
            {fieldRow('Team / Subtitle', 'footer_team_name')}
            {sectionDesignFields('footer', 'Footer')}
            {websiteContentEditing && (
              <button
                type="button"
                style={styles.saveBtn}
                disabled={websiteContentSaving}
                onClick={() => saveWebsiteContent(collectFieldsByPrefixes(['footer_']), ['footer_brand_name'])}
              >
                {websiteContentSaving ? 'Saving…' : 'Save Footer Content'}
              </button>
            )}
          </div>
        );
      }
      if (websiteContentSection === 'appearance') {
        const logoValue = websiteContentForm.website_logo_path || '';

        return (
          <div style={styles.websiteAppearanceGrid}>
            <div style={styles.websiteLogoCard}>
              <div style={styles.websiteLogoPreviewBox}>
                {logoValue ? (
                  <img
                    src={logoValue}
                    alt="Website Logo Preview"
                    style={styles.websiteLogoPreview}
                  />
                ) : (
                  <div style={styles.websiteLogoPlaceholder}>
                    <i className="fi fi-rr-picture" style={styles.websiteLogoPlaceholderIcon}></i>
                    <span>No logo selected</span>
                  </div>
                )}
              </div>

              {websiteContentEditing && (
                <div style={styles.websiteUploadBox}>
                  <label style={styles.websiteFieldLabel}>Upload Logo</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWebsiteLogoFile}
                    style={styles.fileInput}
                  />

                  <p style={styles.websiteUploadHint}>
                    This stores a preview path in the website content fields. Use the logo path below if you already uploaded the file in your project folder.
                  </p>
                </div>
              )}
            </div>

            <div style={styles.websiteAppearanceFields}>
              {fieldRow('Logo Image Path or URL', 'website_logo_path')}
              {fieldRow('Logo Alt Text', 'website_logo_alt')}
              {fieldRow('Website Font Style', 'website_font_family', 'select', WEBSITE_FONT_OPTIONS)}
              {fieldRow('Base Font Size', 'website_base_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}
              {fieldRow('Heading Font Size', 'website_heading_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}
              {fieldRow('Paragraph Font Size', 'website_paragraph_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}
              {fieldRow('Text Alignment', 'website_text_alignment', 'select', WEBSITE_ALIGNMENT_OPTIONS)}
              {fieldRow('Hero Text Alignment', 'website_hero_alignment', 'select', WEBSITE_ALIGNMENT_OPTIONS)}
              {fieldRow('Button Alignment', 'website_button_alignment', 'select', WEBSITE_ALIGNMENT_OPTIONS)}
              {fieldRow('Hero Font Style', 'hero_font_family', 'select', WEBSITE_FONT_OPTIONS)}
              {fieldRow('Hero Title Size', 'hero_title_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}
              {fieldRow('About Font Style', 'about_font_family', 'select', WEBSITE_FONT_OPTIONS)}
              {fieldRow('About Title Size', 'about_title_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}
              {fieldRow('Contact Font Style', 'contact_font_family', 'select', WEBSITE_FONT_OPTIONS)}
              {fieldRow('Contact Title Size', 'contact_title_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}
              {fieldRow('Footer Font Style', 'footer_font_family', 'select', WEBSITE_FONT_OPTIONS)}
              {fieldRow('Footer Title Size', 'footer_title_font_size', 'select', WEBSITE_FONT_SIZE_OPTIONS)}

              {websiteContentEditing && (
                <button
                  type="button"
                  style={styles.saveBtn}
                  disabled={websiteContentSaving}
                  onClick={() =>
                    saveWebsiteContent(
                      Object.fromEntries(
                        Object.entries(websiteContentForm).filter(
                          ([key]) => key.startsWith('website_') || key.startsWith('hero_') || key.startsWith('about_') || key.startsWith('contact_') || key.startsWith('footer_')
                        )
                      )
                    )
                  }
                >
                  {websiteContentSaving ? 'Saving…' : 'Save Website Design'}
                </button>
              )}
            </div>
          </div>
        );
      }
      if (websiteContentSection === 'faqs') {
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={() => setWebsiteFaqOverlay({ question: '', answer: '', sort_order: websiteFaqs.length + 1, status: 'active' })}
              >
                <i className="fi fi-rr-plus"></i> <span>Add FAQ</span>
              </button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={{ ...styles.branchTable, minWidth: 660 }}>
                <thead>
                  <tr>
                    <th style={{ ...styles.tableHead, width: 44 }}>#</th>
                    <th style={styles.tableHead}>Question</th>
                    <th style={styles.tableHead}>Answer</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 90 }}>Status</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {websiteFaqs.length === 0 ? (
                    <tr><td colSpan={5} style={styles.emptyRow}>No FAQs found.</td></tr>
                  ) : websiteFaqs.map((faq) => (
                    <tr key={faq.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{faq.sort_order}</td>
                      <td style={{ ...styles.tableCell, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {faq.question?.length > 80 ? faq.question.slice(0, 80) + '…' : faq.question}
                      </td>
                      <td style={{ ...styles.tableCell, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {faq.answer?.length > 100 ? faq.answer.slice(0, 100) + '…' : faq.answer}
                      </td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>
                        <span style={getStatusStyle(faq.status === 'active' ? 'Active' : 'Inactive')}>
                          {faq.status === 'active' ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>
                        <button type="button" style={styles.editBtn} onClick={() => setWebsiteFaqOverlay({ ...faq })}>
                          <i className="fi fi-rr-file-edit"></i>
                        </button>
                        <button type="button" style={{ ...styles.editBtn, color: '#dc2626', marginLeft: 6 }} onClick={() => deleteFaq(faq.id)}>
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      if (websiteContentSection === 'services') {
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={() => setWebsiteServiceOverlay({ name: '', image_path: '', description: '', slug: '', sort_order: websiteServices.length + 1, status: 'active' })}
              >
                <i className="fi fi-rr-plus"></i> <span>Add Service</span>
              </button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={{ ...styles.branchTable, minWidth: 720 }}>
                <thead>
                  <tr>
                    <th style={{ ...styles.tableHead, width: 44 }}>#</th>
                    <th style={styles.tableHead}>Name</th>
                    <th style={styles.tableHead}>Image Path</th>
                    <th style={styles.tableHead}>Slug</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 90 }}>Status</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {websiteServices.length === 0 ? (
                    <tr><td colSpan={6} style={styles.emptyRow}>No service cards found.</td></tr>
                  ) : websiteServices.map((svc) => (
                    <tr key={svc.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{svc.sort_order}</td>
                      <td style={styles.tableCell}>{svc.name}</td>
                      <td style={{ ...styles.tableCell, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12, color: '#64748b' }}>
                        {svc.image_path || '—'}
                      </td>
                      <td style={styles.tableCell}>{svc.slug || '—'}</td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>
                        <span style={getStatusStyle(svc.status === 'active' ? 'Active' : 'Inactive')}>
                          {svc.status === 'active' ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>
                        <button type="button" style={styles.editBtn} onClick={() => setWebsiteServiceOverlay({ ...svc })}>
                          <i className="fi fi-rr-file-edit"></i>
                        </button>
                        <button type="button" style={{ ...styles.editBtn, color: '#dc2626', marginLeft: 6 }} onClick={() => deleteWebsiteService(svc.id)}>
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      if (websiteContentSection === 'announcements') {
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={() => setWebsiteAnnouncementOverlay({ title: '', message: '', start_date: '', end_date: '', status: 'active' })}
              >
                <i className="fi fi-rr-plus"></i> <span>Add Announcement</span>
              </button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={{ ...styles.branchTable, minWidth: 680 }}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Title</th>
                    <th style={styles.tableHead}>Message</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 100 }}>Start</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 100 }}>End</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 90 }}>Status</th>
                    <th style={{ ...styles.tableHead, whiteSpace: 'nowrap', width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {websiteAnnouncements.length === 0 ? (
                    <tr><td colSpan={6} style={styles.emptyRow}>No announcements found.</td></tr>
                  ) : websiteAnnouncements.map((ann) => (
                    <tr key={ann.id} style={styles.tableRow}>
                      <td style={{ ...styles.tableCell, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ann.title?.length > 50 ? ann.title.slice(0, 50) + '…' : ann.title}
                      </td>
                      <td style={{ ...styles.tableCell, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ann.message?.length > 80 ? ann.message.slice(0, 80) + '…' : ann.message}
                      </td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>{ann.start_date ? String(ann.start_date).slice(0, 10) : '—'}</td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>{ann.end_date ? String(ann.end_date).slice(0, 10) : '—'}</td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>
                        <span style={getStatusStyle(ann.status === 'active' ? 'Active' : 'Inactive')}>
                          {ann.status === 'active' ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}>
                        <button type="button" style={styles.editBtn} onClick={() => setWebsiteAnnouncementOverlay({ ...ann })}>
                          <i className="fi fi-rr-file-edit"></i>
                        </button>
                        <button type="button" style={{ ...styles.editBtn, color: '#dc2626', marginLeft: 6 }} onClick={() => deleteAnnouncement(ann.id)}>
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      return null;
    }

    const contentSections = [
      { key: 'hero', label: 'Hero' },
      { key: 'about', label: 'About' },
      { key: 'contact', label: 'Contact & Hours' },
      { key: 'footer', label: 'Footer' },
      { key: 'appearance', label: 'Logo, Fonts & Alignment' },
      { key: 'faqs', label: 'FAQs' },
      { key: 'services', label: 'Services' },
    ];

    return (
      <>
        <section style={styles.tableCard}>
          <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {contentSections.map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    style={contentSectionBtnStyle(websiteContentSection === sec.key)}
                    onClick={() => { setWebsiteContentSection(sec.key); setWebsiteContentEditing(false); setWebsiteContentMsg({ text: '', type: '' }); }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {websiteContentMsg.text && (
                <p style={{
                  marginBottom: 14,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  background: websiteContentMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: websiteContentMsg.type === 'success' ? '#15803d' : '#dc2626',
                }}>
                  {websiteContentMsg.text}
                </p>
              )}

              {['hero', 'about', 'contact', 'footer', 'appearance'].includes(websiteContentSection) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  {!websiteContentEditing ? (
                    <button
                      type="button"
                      style={styles.primaryBtn}
                      onClick={() => setWebsiteContentEditing(true)}
                    >
                      <i className="fi fi-rr-edit"></i> <span>Edit Content</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={() => { setWebsiteContentEditing(false); setWebsiteContentForm(websiteContent); setWebsiteContentMsg({ text: '', type: '' }); }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {getContentSectionFields()}
            </div>
        </section>

        {websiteFaqOverlay && (
          <WebsiteItemOverlay
            styles={styles}
            title={websiteFaqOverlay.id ? 'Edit FAQ' : 'New FAQ'}
            onClose={() => setWebsiteFaqOverlay(null)}
            onSave={(data) => saveFaq(data)}
            onValidationError={(message) => showWebsiteValidationModal('Required Fields Missing', message)}
            data={websiteFaqOverlay}
            fields={[
              { key: 'question', label: 'Question', type: 'textarea', required: true },
              { key: 'answer', label: 'Answer', type: 'textarea', required: true },
              { key: 'sort_order', label: 'Sort Order (number)', type: 'number' },
              { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'hidden', label: 'Hidden' }] },
            ]}
          />
        )}

        {websiteServiceOverlay && (
          <WebsiteItemOverlay
            styles={styles}
            title={websiteServiceOverlay.id ? 'Edit Service Card' : 'New Service Card'}
            onClose={() => setWebsiteServiceOverlay(null)}
            onSave={(data) => saveWebsiteService(data)}
            onValidationError={(message) => showWebsiteValidationModal('Required Fields Missing', message)}
            data={websiteServiceOverlay}
            fields={[
              { key: 'name', label: 'Service Name', required: true },
              { key: 'image_path', label: 'Image Path (e.g. ./images/crowns.jpeg)' },
              { key: 'description', label: 'Modal Description', type: 'textarea', required: true },
              { key: 'slug', label: 'Slug (for Services.html link, e.g. crowns)' },
              { key: 'sort_order', label: 'Sort Order (number)', type: 'number' },
              { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'hidden', label: 'Hidden' }] },
            ]}
          />
        )}
</>
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
          <button type="button" style={styles.secondaryBtn} onClick={() => openServiceKitManager(filteredServices[0])} disabled={!filteredServices.length}>
            Manage Service Kit
          </button>
          <button type="button" style={styles.secondaryBtn} onClick={openServiceKitHistory}>
            Service Kit History
          </button>
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
          <td style={styles.tableCell}>{service.time_buffer_min ?? 30} min</td>
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
            <button
              type="button"
              style={{ ...styles.editBtn, marginLeft: 6 }}
              onClick={() => openServiceKitManager(service)}
            >
              <i className="fi fi-rr-box"></i>
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

              <Field label="Time Buffer (minutes)" styles={styles}>
                <input
                  type="text"
                  value={serviceForm.time_buffer_min}
                  onChange={(event) =>
                    handleServiceChange('time_buffer_min', event.target.value)
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

      {serviceKitOverlay && (
        <FormOverlay
          styles={styles}
          title="Manage Service Kit"
          onClose={() => setServiceKitOverlay(false)}
          onOverlayClick={handleOverlayClick}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Branch</label>
              <select
                value={serviceKitBranchId}
                onChange={(e) => reloadServiceKitBranch(Number(e.target.value))}
                style={styles.formInput}
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.address || branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Service</label>
              <select
                value={serviceKitServiceId}
                onChange={(e) => reloadServiceKitService(e.target.value)}
                style={styles.formInput}
                disabled={!serviceKitBranchSelected}
              >
                {(serviceKitServicesForBranch.length ? serviceKitServicesForBranch : services).map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
                  </option>
                ))}
              </select>
              {!serviceKitBranchSelected && (
                <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>
                  Select a branch first to load services.
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ ...serviceKitGridStyles, marginBottom: 6 }}>
              <div style={styles.fieldLabel}>Category</div>
              <div style={styles.fieldLabel}>Item</div>
              <div style={styles.fieldLabel}>Default Quantity</div>
              <div style={styles.fieldLabel}>Current Stock</div>
              <div style={styles.fieldLabel}>Action</div>
            </div>
            {serviceKitItems.map((item, index) => (
              <div key={`${item.category}-${index}`} style={{ ...serviceKitGridStyles, marginBottom: 8 }}>
                <select
                  value={item.category}
                  onChange={(e) => {
                    const nextCategory = e.target.value;
                    updateServiceKitItem(index, 'category', nextCategory);
                    updateServiceKitItem(index, 'item_name', '');
                    updateServiceKitItem(index, 'current_stock', null);
                  }}
                  style={styles.formInput}
                  disabled={serviceKitRowInputsDisabled}
                >
                  <option value="supply">Supply</option>
                  <option value="medicine">Medicine</option>
                  <option value="equipment">Equipment</option>
                </select>
                <select
                  value={item.item_name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    const options = getInventoryOptionsForCategory(item.category);
                    const match = options.find((o) => o.name === nextName) || null;
                    updateServiceKitItem(index, 'item_name', nextName);
                    updateServiceKitItem(index, 'current_stock', match ? match.stock : null);
                  }}
                  style={styles.formInput}
                  disabled={serviceKitRowInputsDisabled}
                >
                  <option value="" disabled>
                    Select Item
                  </option>
                  {getInventoryOptionsForCategory(item.category).map((opt) => (
                    <option key={opt.name} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${
                    Number(item.default_quantity || 0) < 1 ||
                    (item.current_stock !== null && item.current_stock !== undefined && Number(item.default_quantity || 0) > Number(item.current_stock))
                      ? '#ef4444' : '#d1d5db'
                  }`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  height: 40,
                  background: serviceKitRowInputsDisabled ? '#f8fafc' : '#fff',
                }}>
                  <button
                    type="button"
                    onClick={() => updateServiceKitItem(index, 'default_quantity', String(Math.max(1, Number(item.default_quantity || 1) - 1)))}
                    disabled={serviceKitRowInputsDisabled}
                    style={{
                      width: 28, height: '100%', border: 'none', borderRight: '1px solid #e5e7eb',
                      background: 'transparent', cursor: serviceKitRowInputsDisabled ? 'not-allowed' : 'pointer',
                      fontSize: 16, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, padding: 0,
                    }}
                  >
                    −
                  </button>
                  <input
                    value={item.default_quantity}
                    onChange={(e) =>
                      updateServiceKitItem(index, 'default_quantity', e.target.value.replace(/[^0-9]/g, ''))
                    }
                    placeholder="Qty"
                    style={{
                      flex: 1, minWidth: 0, border: 'none', outline: 'none',
                      textAlign: 'center', fontSize: 13, fontFamily: 'Arial, sans-serif',
                      background: 'transparent', padding: '0 2px',
                    }}
                    disabled={serviceKitRowInputsDisabled}
                  />
                  <button
                    type="button"
                    onClick={() => updateServiceKitItem(index, 'default_quantity', String(Number(item.default_quantity || 0) + 1))}
                    disabled={serviceKitRowInputsDisabled}
                    style={{
                      width: 28, height: '100%', border: 'none', borderLeft: '1px solid #e5e7eb',
                      background: 'transparent', cursor: serviceKitRowInputsDisabled ? 'not-allowed' : 'pointer',
                      fontSize: 16, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, padding: 0,
                    }}
                  >
                    +
                  </button>
                </div>
                <input
                  value={item.current_stock ?? ''}
                  readOnly
                  placeholder="Current Stock"
                  style={{ ...styles.formInput, ...styles.readOnlyInput }}
                />
                <button type="button" style={styles.secondaryBtn} onClick={() => setRemoveKitItemIndex(index)}>Remove</button>
              </div>
            ))}
            {!serviceKitRowInputsDisabled && serviceKitItemErrors.some((row) => row?.default_quantity) && (
              <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {serviceKitItemErrors.some((row) => row?.default_quantity === 'Default quantity must be at least 1') && (
                  <span>Default quantity must be at least 1.</span>
                )}
                {serviceKitItemErrors.some((row) => row?.default_quantity === 'Exceeds current stock') && (
                  <span>Default quantity exceeds current stock for one or more items.</span>
                )}
              </div>
            )}
          </div>
          <div style={styles.formActions}>
            <button type="button" style={styles.secondaryBtn} onClick={addServiceKitItem} disabled={serviceKitRowInputsDisabled}>Add Item</button>
            <button type="button" style={styles.saveBtn} onClick={saveServiceKit} disabled={kitSaveDisabled}>Save Service Kit</button>
          </div>
        </FormOverlay>
      )}

      {removeKitItemIndex !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(15,23,42,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '32px 36px',
            maxWidth: 380, width: '92%', boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
              Remove Item
            </p>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
              Do you want to remove this item?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                style={{ ...styles.secondaryBtn, minWidth: 100 }}
                onClick={() => setRemoveKitItemIndex(null)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.saveBtn, minWidth: 120 }}
                onClick={() => { removeServiceKitItem(removeKitItemIndex); setRemoveKitItemIndex(null); }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceKitHistory && (
        <div
          style={styles.modal}
          onClick={(e) => { if (e.target === e.currentTarget) closeServiceKitHistory(); }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 22,
            width: '96%',
            maxWidth: 960,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 22px 50px rgba(15,23,42,0.2)',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}>
            {/* Sticky header — never scrolls away */}
            <div style={{
              padding: '22px 28px 16px',
              borderBottom: '1px solid #edf0f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexShrink: 0,
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a', fontFamily: 'Arial, sans-serif' }}>Service Kit History</h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b', fontFamily: 'Arial, sans-serif' }}>
                  Changes to service kit configurations across all branches.
                </p>
              </div>
              <button type="button" onClick={closeServiceKitHistory} style={{ ...styles.secondaryBtn, height: 36, padding: '0 16px', fontSize: 13, flexShrink: 0, marginLeft: 12 }}>
                X
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px 24px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Branch</span>
                  <select
                    value={serviceKitHistoryFilters.branchId}
                    onChange={(e) => setServiceKitHistoryFilters((prev) => ({ ...prev, branchId: e.target.value }))}
                    style={styles.formInput}
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.address || b.name}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>From</span>
                  <input
                    type="date"
                    value={serviceKitHistoryFilters.startDate}
                    max={serviceKitHistoryFilters.endDate || ''}
                    onChange={(e) => setServiceKitHistoryFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    style={styles.formInput}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>To</span>
                  <input
                    type="date"
                    value={serviceKitHistoryFilters.endDate}
                    min={serviceKitHistoryFilters.startDate || ''}
                    onChange={(e) => setServiceKitHistoryFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    style={styles.formInput}
                  />
                </label>

                <button
                  type="button"
                  style={{ ...styles.secondaryBtn, height: 48 }}
                  onClick={() => setServiceKitHistoryFilters({ startDate: '', endDate: '', branchId: '' })}
                >
                  Clear
                </button>

                <button
                  type="button"
                  style={{ ...styles.saveBtn, height: 48 }}
                  onClick={() => loadServiceKitHistory()}
                >
                  Apply
                </button>
              </div>

              {serviceKitHistoryError && (
                <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>{serviceKitHistoryError}</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {serviceKitHistoryLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, padding: '24px 0', fontFamily: 'Arial, sans-serif' }}>
                    Loading service kit history...
                  </p>
                ) : serviceKitHistoryRows.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '24px 0', fontFamily: 'Arial, sans-serif' }}>
                    No service kit history records found.
                  </p>
                ) : (
                  serviceKitHistoryRows.map((row) => (
                    <div key={row.id} style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 14,
                      padding: '18px 20px',
                      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                      fontFamily: 'Arial, sans-serif',
                    }}>
                      {/* Card header: service name + status badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{row.service_name}</span>
                        <span style={{
                          ...styles.statusBadge,
                          background: row.status === 'Added' ? '#dcfce7' : '#dbeafe',
                          color: row.status === 'Added' ? '#15803d' : '#1d4ed8',
                          flexShrink: 0,
                          marginLeft: 12,
                        }}>
                          {row.status}
                        </span>
                      </div>

                      {/* Metadata row */}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                        <span><span style={{ fontWeight: 600, color: '#475569' }}>Branch:</span> {row.branch_address || '—'}</span>
                        <span><span style={{ fontWeight: 600, color: '#475569' }}>Updated By:</span> {row.changed_by || '—'}</span>
                        <span><span style={{ fontWeight: 600, color: '#475569' }}>Date:</span> {row.changed_at
                          ? new Date(row.changed_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
                          : '—'}
                        </span>
                      </div>

                      {/* Divider */}
                      <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 12 }} />

                      {/* Kit items as pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {row.items.length === 0
                          ? <span style={{ color: '#94a3b8', fontSize: 13 }}>No items</span>
                          : row.items.map((item, i) => (
                              <span key={i} style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                padding: '4px 12px',
                                fontSize: 13,
                                color: '#1e293b',
                              }}>
                                <span style={{ fontWeight: 600 }}>{item.item_name}</span>
                                {' '}
                                <span style={{ color: '#94a3b8' }}>({item.category})</span>
                                <span style={{ color: '#475569' }}>{' ×'}{item.default_quantity}</span>
                              </span>
                            ))
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
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

      {websiteValidationModal && (
        <div
          style={styles.validationModalOverlay}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setWebsiteValidationModal(null);
            }
          }}
        >
          <div style={styles.validationModalContent}>
            <h2 style={styles.validationModalTitle}>
              {websiteValidationModal.title}
            </h2>

            <div style={styles.validationModalDivider}></div>

            <p style={styles.validationModalText}>
              {websiteValidationModal.message}
            </p>

            <button
              type="button"
              style={styles.validationModalButton}
              onClick={() => setWebsiteValidationModal(null)}
            >
              Okay
            </button>
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

function WebsiteItemOverlay({ styles, title, onClose, onSave, onValidationError, data, fields }) {
  const [form, setForm] = useState(() => {
    const initial = {};
    fields.forEach(f => { initial[f.key] = data[f.key] ?? ''; });
    return initial;
  });

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const missingFields = fields.filter((field) => {
      return field.required && !String(form[field.key] || '').trim();
    });

    if (missingFields.length > 0) {
      onValidationError?.('Please complete all required fields before saving.');
      return;
    }

    onSave({ ...data, ...form });
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.overlayContent}>
        <div style={styles.overlayHeader}>
          <h3 style={styles.overlayTitle}>{title}</h3>
          <button type="button" onClick={onClose} style={styles.overlayClose}>&times;</button>
        </div>
        <div style={styles.overlayBody}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {fields.map(f => (
                <div key={f.key} style={{ ...styles.field, ...styles.fieldWide }}>
                  <label style={styles.fieldLabel}>
                    {f.label}{f.required ? ' *' : ''}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      style={{ ...styles.formInput, minHeight: 80, resize: 'vertical' }}
                      value={form[f.key]}
                      onChange={e => handleChange(f.key, e.target.value)}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      style={styles.formInput}
                      value={form[f.key]}
                      onChange={e => handleChange(f.key, e.target.value)}
                    >
                      {(f.options || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      style={styles.formInput}
                      value={form[f.key]}
                      onChange={e => handleChange(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={styles.overlayActions}>
              <button type="button" onClick={onClose} style={styles.secondaryBtn}>Cancel</button>
              <button type="submit" style={styles.saveBtn}>Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
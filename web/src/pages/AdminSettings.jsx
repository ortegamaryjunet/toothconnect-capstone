import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

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
import AdminProfileMenu from '../components/AdminProfileMenu';
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
  cancellationPolicy: {
    label: 'Manage Cancellation Policy',
    icon: 'fi fi-rr-calendar-xmark',
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

const branchRequiredFields = [
  'name',
  'address',
  'date_opened',
  'phone',
  'contact_person',
  'operating_hours',
  'status',
];

const initialServiceForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  duration: '',
  time_buffer_min: 30,
  status: '',
};

const DEFAULT_SERVICE_CATEGORIES = [
  'General Dentistry',
  'Cosmetic Dentistry',
  'Orthodontics',
  'Surgery',
];

const serviceRequiredFields = [
  'name',
  'category',
  'price',
  'duration',
  'time_buffer_min',
  'status',
];

const SERVICE_FIELD_LABELS = {
  name: 'Service name',
  category: 'Category',
  price: 'Price',
  duration: 'Duration',
  time_buffer_min: 'Time buffer',
  status: 'Status',
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
const USER_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userRequiredFields = ['fullName', 'email', 'role', 'status'];
const ADMIN_NAME_REGEX = /^[a-zA-Z\s]+$/;
const adminAccountRequiredFields = ['name', 'email', 'phone', 'status'];
const phoneCountryOptions = getCountries().map((country) => ({
  country,
  callingCode: getCountryCallingCode(country),
}));

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
    return 'Contact number does not match the selected country code.';
  }

  return '';
}

function calculateYearsActive(dateOpened) {
  const openedYear = Number(String(dateOpened || '').slice(0, 4));

  if (!openedYear) {
    return '';
  }

  return String(Math.max(0, new Date().getFullYear() - openedYear));
}

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section === 'adminAccount') {
      setActiveSection('adminAccount');
    }
  }, [location.search]);

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [onlineInquiries, setOnlineInquiries] = useState([]);
  const [websiteTab, setWebsiteTab] = useState('content');

  const [websiteContent, setWebsiteContent] = useState({});
  const [websiteFaqs, setWebsiteFaqs] = useState([]);
  const [websiteServices, setWebsiteServices] = useState([]);
  const [websiteAnnouncements, setWebsiteAnnouncements] = useState([]);
  const [websiteContentSection, setWebsiteContentSection] = useState('logo');
  const [websiteContentForm, setWebsiteContentForm] = useState({});
  const [websiteContentSaving, setWebsiteContentSaving] = useState(false);
  const [websiteContentEditing, setWebsiteContentEditing] = useState(false);
  const [showWebsiteContentCancelConfirmModal, setShowWebsiteContentCancelConfirmModal] =
    useState(false);
  const [websiteContentSaveConfirmModal, setWebsiteContentSaveConfirmModal] =
    useState(null);
  const [websiteContentMsg, setWebsiteContentMsg] = useState({ text: '', type: '' });
  const [websiteValidationModal, setWebsiteValidationModal] = useState(null);
  const [websiteFaqOverlay, setWebsiteFaqOverlay] = useState(null);
  const [websiteServiceOverlay, setWebsiteServiceOverlay] = useState(null);
  const [websiteAnnouncementOverlay, setWebsiteAnnouncementOverlay] = useState(null);
  const [cancellationPolicyEditing, setCancellationPolicyEditing] =
    useState(false);
  const [cancellationPolicyMessage, setCancellationPolicyMessage] =
    useState('');
  const [cancellationPolicyDraft, setCancellationPolicyDraft] =
    useState('');
  const [cancellationPolicySaving, setCancellationPolicySaving] =
    useState(false);
  const [showCancellationPolicyCancelConfirmModal, setShowCancellationPolicyCancelConfirmModal] =
    useState(false);
  const [cancellationPolicySaveConfirmModal, setCancellationPolicySaveConfirmModal] =
    useState(null);
  const [deleteAnnouncementModal, setDeleteAnnouncementModal] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState(null);
  const [deleteWebsiteServiceModal, setDeleteWebsiteServiceModal] = useState(false);
  const [deleteWebsiteServiceId, setDeleteWebsiteServiceId] = useState(null);
  const [showBranchCancelConfirmModal, setShowBranchCancelConfirmModal] =
    useState(false);
  const [showBranchSaveConfirmModal, setShowBranchSaveConfirmModal] =
    useState(false);
  
  const [users, setUsers] = useState([]);
  const [adminAccountForm, setAdminAccountForm] = useState(initialAdminAccountForm);
  const [adminAccountOriginal, setAdminAccountOriginal] = useState(initialAdminAccountForm);
  const [isEditingAdminAccount, setIsEditingAdminAccount] = useState(false);
  const [adminAccountPhoneCountry, setAdminAccountPhoneCountry] = useState('PH');
  const [adminAccountOriginalPhoneCountry, setAdminAccountOriginalPhoneCountry] = useState('PH');
  const [adminAccountTouchedFields, setAdminAccountTouchedFields] = useState({});
  const [adminAccountMessage, setAdminAccountMessage] = useState('');
  const [adminAccountError, setAdminAccountError] = useState('');
  const [showAdminAccountCancelConfirmModal, setShowAdminAccountCancelConfirmModal] =
    useState(false);
  const [adminAccountSaveConfirmModal, setAdminAccountSaveConfirmModal] =
    useState(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] =
    useState(false);

  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [branchPhoneCountry, setBranchPhoneCountry] = useState('PH');
  const [branchTouchedFields, setBranchTouchedFields] = useState({});
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [serviceTouchedFields, setServiceTouchedFields] = useState({});
  const [serviceCategoryMode, setServiceCategoryMode] = useState('select');
  const [showServiceCancelConfirmModal, setShowServiceCancelConfirmModal] =
    useState(false);
  const [showServiceSaveConfirmModal, setShowServiceSaveConfirmModal] =
    useState(false);
  const [serviceKitOverlay, setServiceKitOverlay] = useState(false);
  const [serviceKitServiceId, setServiceKitServiceId] = useState('');
  const [serviceKitBranchId, setServiceKitBranchId] = useState('');
  const [serviceKitItems, setServiceKitItems] = useState([]);
  const [serviceKitItemErrors, setServiceKitItemErrors] = useState([]);
  const [showServiceKitCancelConfirmModal, setShowServiceKitCancelConfirmModal] =
    useState(false);
  const [showServiceKitSaveConfirmModal, setShowServiceKitSaveConfirmModal] =
    useState(false);
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
  const [userTouchedFields, setUserTouchedFields] = useState({});
  const [showUserCancelConfirmModal, setShowUserCancelConfirmModal] =
    useState(false);
  const [showUserSaveConfirmModal, setShowUserSaveConfirmModal] =
    useState(false);

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
    cancellationPolicy: 1,
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

  const branchYearsActive = calculateYearsActive(branchForm.date_opened);

  const isBranchFormComplete = branchRequiredFields.every(
    (field) => String(branchForm[field] ?? '').trim() !== ''
  ) && !validatePhoneNumber(branchForm.phone, branchPhoneCountry);

  const serviceCategoryOptions = useMemo(() => {
    return [
      ...new Set([
        ...DEFAULT_SERVICE_CATEGORIES,
        ...services.map((service) => service.category).filter(Boolean),
        serviceForm.category,
      ].filter(Boolean)),
    ].sort();
  }, [services, serviceForm.category]);

  const isUserFormComplete =
    userRequiredFields.every((field) => String(userForm[field] ?? '').trim() !== '') &&
    USER_EMAIL_REGEX.test(String(userForm.email || '').trim()) &&
    (userForm.role === 'Admin' || String(userForm.branch_id || '').trim() !== '');

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
    if (
      showLogoutModal ||
      activeOverlay ||
      websiteFaqOverlay ||
      websiteServiceOverlay ||
      websiteAnnouncementOverlay ||
      showCancellationPolicyCancelConfirmModal ||
      cancellationPolicySaveConfirmModal ||
      websiteValidationModal ||
      showWebsiteContentCancelConfirmModal ||
      websiteContentSaveConfirmModal ||
      showAdminAccountCancelConfirmModal ||
      adminAccountSaveConfirmModal ||
      showServiceCancelConfirmModal ||
      showServiceSaveConfirmModal ||
      showServiceKitCancelConfirmModal ||
      showServiceKitSaveConfirmModal ||
      showUserCancelConfirmModal ||
      showUserSaveConfirmModal ||
      serviceKitOverlay ||
      showServiceKitHistory
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
    activeOverlay,
    websiteFaqOverlay,
    websiteServiceOverlay,
    websiteAnnouncementOverlay,
    showCancellationPolicyCancelConfirmModal,
    cancellationPolicySaveConfirmModal,
    websiteValidationModal,
    showWebsiteContentCancelConfirmModal,
    websiteContentSaveConfirmModal,
    showAdminAccountCancelConfirmModal,
    adminAccountSaveConfirmModal,
    showServiceCancelConfirmModal,
    showServiceSaveConfirmModal,
    showServiceKitCancelConfirmModal,
    showServiceKitSaveConfirmModal,
    showUserCancelConfirmModal,
    showUserSaveConfirmModal,
    serviceKitOverlay,
    showServiceKitHistory,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeOverlay();
        setWebsiteFaqOverlay(null);
        setWebsiteServiceOverlay(null);
        setWebsiteAnnouncementOverlay(null);
        setCancellationPolicyDraft(cancellationPolicyMessage);
        setCancellationPolicyEditing(false);
        setWebsiteValidationModal(null);
        setShowWebsiteContentCancelConfirmModal(false);
        setShowAdminAccountCancelConfirmModal(false);
        setAdminAccountSaveConfirmModal(null);
        setShowServiceKitCancelConfirmModal(false);
        setShowServiceKitSaveConfirmModal(false);
        setShowUserCancelConfirmModal(false);
        setShowUserSaveConfirmModal(false);
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
    loadCancellationPolicy();
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
    console.log(sectionFields);
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

  async function loadCancellationPolicy() {
    try {
      const res = await api.get('/appointments/settings/cancellation-policy');
      const message = res.data.policy?.message || '';
      setCancellationPolicyMessage(message);
      setCancellationPolicyDraft(message);
    } catch (err) {
      console.error('Failed to load appointment cancellation policy', err);
      setCancellationPolicyMessage('');
      setCancellationPolicyDraft('');
    }
  }

  function formatWebsiteContentFieldLabel(key) {
    return String(key || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function handleWebsiteContentSaveRequest(sectionFields, requiredKeys = []) {
    if (!validateWebsiteFields(sectionFields, requiredKeys)) {
      return;
    }

    const details = Object.entries(sectionFields).map(([key, value]) => ({
      key,
      label: formatWebsiteContentFieldLabel(key),
      value: String(value || '').trim() || 'Not entered',
      previousValue: String(websiteContent[key] || '').trim() || 'Not set',
      changed:
        String(value || '').trim() !==
        String(websiteContent[key] || '').trim(),
    }));

setWebsiteContentSaveConfirmModal({
  sectionFields,
  requiredKeys,
  details,
});
  }

  async function confirmWebsiteContentSave() {
    if (!websiteContentSaveConfirmModal) {
      return;
    }

    const { sectionFields, requiredKeys } = websiteContentSaveConfirmModal;

    setWebsiteContentSaveConfirmModal(null);
    await saveWebsiteContent(sectionFields, requiredKeys);
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

  async function deleteWebsiteService() {
    try {
      const res = await api.delete(
        `/website/website-services/${deleteWebsiteServiceId}`
      );

      setWebsiteServices(res.data.services || []);
      setDeleteWebsiteServiceModal(false);
      setDeleteWebsiteServiceId(null);

      showWebsiteValidationModal(
        "Service Deleted",
        "The service card has been deleted successfully.",
        "success"
      );
    } catch (err) {
      showWebsiteValidationModal(
        "Delete Failed",
        err.response?.data?.message || "Failed to delete service."
      );
    }
  }

  async function saveAnnouncement(data) {
    const payload = {
      title: String(data.title || '').trim(),
      message: String(data.message || '').trim(),
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      status: data.status || 'active',
    };

    if (!payload.title || !payload.message || !payload.start_date || !payload.end_date) {
      showWebsiteValidationModal(
        'Required Fields Missing',
        'Please complete the announcement title, message, start date, and end date.'
      );
      return;
    }

    if (new Date(payload.end_date) < new Date(payload.start_date)) {
      showWebsiteValidationModal(
        'Invalid Date Range',
        'End date must be the same day or later than the start date.'
      );
      return;
    }

    try {
      if (data.id) {
        const res = await api.put(`/website/announcements/${data.id}`, payload);
        setWebsiteAnnouncements(res.data.announcements || []);
      } else {
        const res = await api.post('/website/announcements', payload);
        setWebsiteAnnouncements(res.data.announcements || []);
      }
      setWebsiteAnnouncementOverlay(null);
      showWebsiteValidationModal(
        'Announcement Saved',
        'Website announcement has been saved successfully.',
        'success'
      );
    } catch (err) {
      showWebsiteValidationModal('Save Failed', err.response?.data?.message || 'Failed to save announcement.');
    }
  }

  async function deleteAnnouncement(id) {
    try {
      const res = await api.delete(`/website/announcements/${id}`);
      setWebsiteAnnouncements(res.data.announcements || []);
    } catch (err) {
      showWebsiteValidationModal(
        'Delete Failed',
        err.response?.data?.message || 'Failed to delete announcement.'
      );
    }
  }

  async function loadAdminAccount() {
    try {
      const res = await api.get('/auth/me');
      const phoneFormValue = getPhoneFormValue(res.data.phone || '', 'PH');
      const loadedAdminAccount = {
        id: res.data.id || '',
        name: res.data.name || '',
        email: res.data.email || '',
        phone: phoneFormValue.number,
        password: '',
        confirmPassword: '',
        role: res.data.role || 'admin',
        status: res.data.status || 'Active',
        created_at: res.data.created_at || '',
      };
      setAdminAccountForm(loadedAdminAccount);
      setAdminAccountOriginal(loadedAdminAccount);
      setAdminAccountPhoneCountry(phoneFormValue.country);
      setAdminAccountOriginalPhoneCountry(phoneFormValue.country);
      setAdminAccountTouchedFields({});
    } catch (err) {
      console.error('Failed to load admin account', err);
      setAdminAccountError('Failed to load admin account.');
    }
  }

  const confirmDeleteAnnouncement = async () => {
    try {
      await deleteAnnouncement(deleteAnnouncementId);
    } finally {
      setDeleteAnnouncementModal(false);
      setDeleteAnnouncementId(null);
    }
  };

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
    cancellationPolicy: [],
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

  function allowServiceNameText(value) {
    return value.replace(/[^a-zA-Z\s()\-]/g, '');
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
    setShowBranchCancelConfirmModal(false);
    setShowBranchSaveConfirmModal(false);
    setBranchTouchedFields({});
    setBranchPhoneCountry('PH');
    setShowServiceCancelConfirmModal(false);
    setShowServiceSaveConfirmModal(false);
    setServiceTouchedFields({});
    setShowUserCancelConfirmModal(false);
    setShowUserSaveConfirmModal(false);
    setUserTouchedFields({});
  }

  function handleCancelWebsiteContentEdit() {
    setShowWebsiteContentCancelConfirmModal(true);
  }

  function confirmCancelWebsiteContentEdit() {
    setWebsiteContentForm(websiteContent);
    setWebsiteContentEditing(false);
    setShowWebsiteContentCancelConfirmModal(false);
  }

  function startCancellationPolicyEdit() {
    setCancellationPolicyDraft(cancellationPolicyMessage);
    setWebsiteContentEditing(false);
    setCancellationPolicyEditing(true);
    setShowCancellationPolicyCancelConfirmModal(false);
    setCancellationPolicySaveConfirmModal(null);
  }

  function handleCancellationPolicySaveRequest() {
    const value = String(cancellationPolicyDraft || '').trim();
    const previousValue = String(cancellationPolicyMessage || '').trim();

    if (!value) {
      showWebsiteValidationModal(
        'Required Fields Missing',
        'Please enter an appointment cancellation policy message.'
      );
      return;
    }

    setCancellationPolicySaveConfirmModal({
      details: [
        {
          key: 'appointment_cancellation_policy',
          label: 'Policy Message',
          value,
          previousValue: previousValue || 'Not set',
          changed: value !== previousValue,
        },
      ],
    });
  }

  async function confirmCancellationPolicySave() {
    if (!cancellationPolicySaveConfirmModal) {
      return;
    }

    setCancellationPolicySaving(true);
    setCancellationPolicySaveConfirmModal(null);

    try {
      const res = await api.put('/appointments/settings/cancellation-policy', {
        message: String(cancellationPolicyDraft || '').trim(),
      });
      const message = res.data.policy?.message || '';

      setCancellationPolicyMessage(message);
      setCancellationPolicyDraft(message);
      setCancellationPolicyEditing(false);
      showWebsiteValidationModal(
        'Policy Saved',
        'Appointment cancellation policy has been updated successfully.',
        'success'
      );
    } catch (err) {
      showWebsiteValidationModal(
        'Save Failed',
        err.response?.data?.message || 'Failed to save appointment cancellation policy.'
      );
    } finally {
      setCancellationPolicySaving(false);
    }
  }

  function confirmCancelCancellationPolicyEdit() {
    setCancellationPolicyDraft(cancellationPolicyMessage);
    setCancellationPolicyEditing(false);
    setShowCancellationPolicyCancelConfirmModal(false);
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeOverlay();
    }
  }

  function handleBranchOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setShowBranchCancelConfirmModal(true);
    }
  }

  function openBranchForm(branch = null) {
    setShowBranchCancelConfirmModal(false);
    setShowBranchSaveConfirmModal(false);
    setBranchTouchedFields({});

    if (branch) {
      const phoneFormValue = getPhoneFormValue(branch.phone || '', 'PH');
      setBranchForm({
        ...branch,
        phone: phoneFormValue.number,
      });
      setBranchPhoneCountry(phoneFormValue.country);
    } else {
      setBranchForm(initialBranchForm);
      setBranchPhoneCountry('PH');
    }

    setActiveOverlay('branch');
  }

  function openServiceForm(service = null) {
    setShowServiceCancelConfirmModal(false);
    setShowServiceSaveConfirmModal(false);
    setServiceTouchedFields({});
    setServiceCategoryMode('select');

    if (service) {
      setServiceForm(service);
    } else {
      setServiceForm(initialServiceForm);
    }

    setActiveOverlay('services');
  }

  function openUserForm(user = null) {
    setShowUserCancelConfirmModal(false);
    setShowUserSaveConfirmModal(false);
    setUserTouchedFields({});

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
    setBranchTouchedFields((prev) => ({ ...prev, [name]: true }));

    let newValue = value;

    if (name === 'name' || name === 'category') {
      newValue = allowServiceNameText(value);
    }

    if (name === 'contact_person') {
      newValue = allowLettersOnly(value);
    }

    if (name === 'phone') {
      newValue = String(value || '').replace(/\D/g, '').slice(0, 15);
    }

    setBranchForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function handleBranchFieldBlur(name) {
    setBranchTouchedFields((prev) => ({ ...prev, [name]: true }));
  }

  function handleBranchPhoneCountryChange(countryCode) {
    setBranchPhoneCountry(countryCode);
    setBranchTouchedFields((prev) => ({ ...prev, phone: true }));
  }

  function isBranchFieldInvalid(name) {
    if (name === 'phone') {
      return (
        branchTouchedFields[name] &&
        !!validatePhoneNumber(branchForm.phone, branchPhoneCountry)
      );
    }

    return (
      branchTouchedFields[name] &&
      String(branchForm[name] ?? '').trim() === ''
    );
  }

  function getBranchFieldStyle(name) {
    return {
      ...styles.formInput,
      ...(isBranchFieldInvalid(name)
        ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
        : {}),
    };
  }

  function renderBranchRequiredLabel(label) {
    return (
      <>
        {label} <span style={{ color: '#dc2626' }}>*</span>
      </>
    );
  }

  function getBranchPhoneError() {
    if (!branchTouchedFields.phone) {
      return '';
    }

    return validatePhoneNumber(branchForm.phone, branchPhoneCountry);
  }

  function handleServiceChange(name, value) {
    setServiceTouchedFields((prev) => ({ ...prev, [name]: true }));

    let newValue = value;

    if (name === 'name' || name === 'category') {
      newValue = allowServiceNameText(value);
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

  function handleServiceFieldBlur(name) {
    setServiceTouchedFields((prev) => ({ ...prev, [name]: true }));
  }

  function getServiceFieldError(name, { force = false } = {}) {
    if (!force && !serviceTouchedFields[name]) {
      return '';
    }

    const value = String(serviceForm[name] ?? '').trim();
    const label = SERVICE_FIELD_LABELS[name] || 'This field';

    if (!value) {
      return 'This field is required.';
    }

    if ((name === 'name' || name === 'category') && !/^[a-zA-Z\s()\-]+$/.test(value)) {
      return `${label} can only contain letters, spaces, parentheses, and hyphen.`;
    }

    if (name === 'price' && !/^\d+(\.\d+)?$/.test(value)) {
      return 'Price must contain numbers only.';
    }

    if ((name === 'duration' || name === 'time_buffer_min') && !/^\d+$/.test(value)) {
      return `${label} must be entered in minutes using numbers only.`;
    }

    return '';
  }

  function isServiceFieldInvalid(name) {
    return Boolean(getServiceFieldError(name));
  }

  function getServiceFieldStyle(name) {
    return {
      ...styles.formInput,
      ...(isServiceFieldInvalid(name)
        ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
        : {}),
    };
  }

  function renderServiceRequiredLabel(label) {
    return (
      <>
        {label} <span style={{ color: '#dc2626' }}>*</span>
      </>
    );
  }

  function renderServiceFieldError(name) {
    const message = getServiceFieldError(name);
    if (!message) return null;

    return (
      <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
        {message}
      </span>
    );
  }

  const isServiceFormComplete = serviceRequiredFields.every(
    (field) => !getServiceFieldError(field, { force: true })
  );

  function handleUserChange(name, value) {
    setUserTouchedFields((prev) => ({ ...prev, [name]: true }));

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

  function handleUserFieldBlur(name) {
    setUserTouchedFields((prev) => ({ ...prev, [name]: true }));
  }

  function isUserFieldRequired(name) {
    if (name === 'branch_id') {
      return userForm.role !== 'Admin';
    }

    return userRequiredFields.includes(name);
  }

  function isUserFieldInvalid(name) {
    if (!userTouchedFields[name] || !isUserFieldRequired(name)) {
      return false;
    }

    const value = String(userForm[name] ?? '').trim();

    if (!value) {
      return true;
    }

    if (name === 'email') {
      return !USER_EMAIL_REGEX.test(value);
    }

    return false;
  }

  function getUserFieldStyle(name) {
    return {
      ...styles.formInput,
      ...(isUserFieldInvalid(name)
        ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
        : {}),
    };
  }

  function renderUserRequiredLabel(label, name) {
    return (
      <>
        {label}
        {isUserFieldRequired(name) && <span style={{ color: '#dc2626' }}> *</span>}
      </>
    );
  }

  function getUserEmailError() {
    if (!userTouchedFields.email) {
      return '';
    }

    const email = String(userForm.email || '').trim();

    if (!email) {
      return 'Email address is required.';
    }

    if (!USER_EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address format.';
    }

    return '';
  }

  function handleAdminAccountChange(name, value) {
    setAdminAccountTouchedFields((prev) => ({ ...prev, [name]: true }));

    let newValue = value;

    if (name === 'phone') {
      newValue = allowNumbersOnly(value).slice(0, 11);
    }

    setAdminAccountForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function handleAdminAccountBlur(name) {
    setAdminAccountTouchedFields((prev) => ({ ...prev, [name]: true }));
  }

  function handleAdminAccountPhoneCountryChange(countryCode) {
    setAdminAccountPhoneCountry(countryCode);
    setAdminAccountTouchedFields((prev) => ({ ...prev, phone: true }));
  }

  function renderAdminRequiredLabel(label) {
    return (
      <>
        {label} <span style={{ color: '#dc2626' }}>*</span>
      </>
    );
  }

  function getAdminAccountNameError() {
    const name = String(adminAccountForm.name || '');
    const trimmedName = name.trim();

    if (!trimmedName) {
      return 'This field is required';
    }

    if (/[0-9]/.test(name)) {
      return 'Numbers are not allowed.';
    }

    if (!ADMIN_NAME_REGEX.test(name)) {
      return 'Special characters are not allowed.';
    }

    return '';
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

  function getAdminAccountEmailError() {
    const email = String(adminAccountForm.email || '').trim();

    if (!email) {
      return 'This field is required';
    }

    if (!USER_EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address format.';
    }

    return '';
  }

  function getAdminAccountPhoneError() {
    return validatePhoneNumber(adminAccountForm.phone, adminAccountPhoneCountry);
  }

  function getAdminAccountSaveDetails() {
    return [
      {
        key: 'name',
        label: 'Full Name',
        rawValue: String(adminAccountForm.name || '').trim(),
        rawPreviousValue: String(adminAccountOriginal.name || '').trim(),
        value: String(adminAccountForm.name || '').trim() || 'Not entered',
        previousValue: String(adminAccountOriginal.name || '').trim() || 'Not set',
      },
      {
        key: 'email',
        label: 'Email Address',
        rawValue: String(adminAccountForm.email || '').trim(),
        rawPreviousValue: String(adminAccountOriginal.email || '').trim(),
        value: String(adminAccountForm.email || '').trim() || 'Not entered',
        previousValue: String(adminAccountOriginal.email || '').trim() || 'Not set',
      },
      {
        key: 'phone',
        label: 'Contact Number',
        rawValue: normalizePhoneNumber(adminAccountForm.phone, adminAccountPhoneCountry),
        rawPreviousValue: normalizePhoneNumber(adminAccountOriginal.phone, adminAccountOriginalPhoneCountry),
        value: normalizePhoneNumber(adminAccountForm.phone, adminAccountPhoneCountry) || 'Not entered',
        previousValue: normalizePhoneNumber(adminAccountOriginal.phone, adminAccountOriginalPhoneCountry) || 'Not set',
      },
      {
        key: 'status',
        label: 'Status',
        rawValue: String(adminAccountForm.status || '').trim(),
        rawPreviousValue: String(adminAccountOriginal.status || '').trim(),
        value: String(adminAccountForm.status || '').trim() || 'Not selected',
        previousValue: String(adminAccountOriginal.status || '').trim() || 'Not set',
      },
      {
        key: 'password',
        label: 'Password',
        value: adminAccountForm.password ? 'Changed' : 'Unchanged',
        previousValue: 'Current password',
      },
    ].map((detail) => ({
      ...detail,
      changed:
        detail.key === 'password'
          ? !!adminAccountForm.password
          : detail.rawValue !== detail.rawPreviousValue,
    }));
  }

  function handleAdminAccountSubmit(event) {
    event.preventDefault();

    setAdminAccountMessage('');
    setAdminAccountError('');
    setAdminAccountTouchedFields(
      adminAccountRequiredFields.reduce((fields, field) => {
        fields[field] = true;
        return fields;
      }, {})
    );

    const nameError = getAdminAccountNameError();
    const passwordError = validateAdminPassword();
    const emailError = getAdminAccountEmailError();
    const phoneError = getAdminAccountPhoneError();

    if (nameError || emailError || phoneError) {
      return;
    }

    if (passwordError) {
      return;
    }

    setAdminAccountSaveConfirmModal({
      details: getAdminAccountSaveDetails(),
    });
  }

  function handleBranchSubmit(event) {
    event.preventDefault();

    if (!isBranchFormComplete) {
      setBranchTouchedFields(
        branchRequiredFields.reduce((fields, field) => {
          fields[field] = true;
          return fields;
        }, {})
      );
      return;
    }

    setShowBranchSaveConfirmModal(true);
  }

  async function saveBranch() {
    try {
      const payload = {
        name: branchForm.name,
        address: branchForm.address,
        phone: normalizePhoneNumber(branchForm.phone, branchPhoneCountry),
        contact_person: branchForm.contact_person,
        date_opened: branchForm.date_opened,
        operating_hours: branchForm.operating_hours,
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
    } finally {
      setShowBranchSaveConfirmModal(false);
    }
  }

  function handleServiceSubmit(event) {
    event.preventDefault();

    if (!isServiceFormComplete) {
      setServiceTouchedFields(
        serviceRequiredFields.reduce((fields, field) => {
          fields[field] = true;
          return fields;
        }, {})
      );
      return;
    }

    setShowServiceSaveConfirmModal(true);
  }

  async function saveService() {
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
    } finally {
      setShowServiceSaveConfirmModal(false);
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

  function getServiceKitValidationErrors(items = serviceKitItems) {
    return items.map((row) => {
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
  }

  function validateServiceKitItems() {
    if (serviceKitItems.length === 0) {
      setServiceKitItemErrors([]);
      return false;
    }

    const newErrors = getServiceKitValidationErrors();
    setServiceKitItemErrors(newErrors);
    return !newErrors.some((e) => e.category || e.item_name || e.default_quantity);
  }

  function handleServiceKitSaveRequest() {
    if (!serviceKitOverlay || !serviceKitServiceId) return;

    const branchId = Number(serviceKitBranchId || 0);
    if (!branchId) return;

    if (!validateServiceKitItems()) return;
    setShowServiceKitSaveConfirmModal(true);
  }

  async function saveServiceKit() {
    if (!serviceKitOverlay || !serviceKitServiceId) return;

    const branchId = Number(serviceKitBranchId || 0);
    if (!branchId) return;

    if (!validateServiceKitItems()) {
      setShowServiceKitSaveConfirmModal(false);
      return;
    }

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
      setShowServiceKitSaveConfirmModal(false);
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
  const serviceKitHasNoItems = serviceKitItems.length === 0;
  const serviceKitHasInvalidItems = getServiceKitValidationErrors().some(
    (e) => e.category || e.item_name || e.default_quantity
  );
  const kitSaveDisabled = serviceKitRowInputsDisabled || serviceKitHasNoItems || serviceKitHasInvalidItems;
  const serviceKitRequiredAsterisk = !serviceKitRowInputsDisabled && serviceKitHasNoItems ? (
    <span style={{ color: '#dc2626' }}> *</span>
  ) : null;
  const serviceKitGridStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '140px minmax(0, 1fr) 90px 100px 100px',
    gap: 10,
    alignItems: 'center',
  };

  function handleUserSubmit(event) {
    event.preventDefault();

    if (!isUserFormComplete) {
      setUserTouchedFields({
        fullName: true,
        email: true,
        role: true,
        branch_id: true,
        status: true,
      });
      return;
    }

    setShowUserSaveConfirmModal(true);
  }

  async function saveUser() {
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
      setShowUserSaveConfirmModal(false);
      closeOverlay();
    } catch (err) {
      console.error('Failed to save user account', err);
      alert(err.response?.data?.message || 'Failed to save user account');
    }
  }

  async function saveAdminAccount() {
    try {
      setAdminAccountMessage('');
      setAdminAccountError('');

      const nameError = getAdminAccountNameError();
      const emailError = getAdminAccountEmailError();
      const phoneError = getAdminAccountPhoneError();
      const passwordError = validateAdminPassword();

      if (nameError || emailError || phoneError) {
        setAdminAccountTouchedFields(
          adminAccountRequiredFields.reduce((fields, field) => {
            fields[field] = true;
            return fields;
          }, {})
        );
        setAdminAccountSaveConfirmModal(null);
        return;
      }

      if (passwordError) {
        setAdminAccountSaveConfirmModal(null);
        return;
      }

      const res = await api.patch('/auth/me', {
        name: adminAccountForm.name.trim(),
        email: adminAccountForm.email.trim(),
        phone: normalizePhoneNumber(adminAccountForm.phone, adminAccountPhoneCountry),
        status: adminAccountForm.status,
        password: adminAccountForm.password || '',
      });

      const updated = res.data.user || {};
      const updatedPhone = getPhoneFormValue(updated.phone || '', adminAccountPhoneCountry);
      setAdminAccountForm({
        id: updated.id || adminAccountForm.id,
        name: updated.name || adminAccountForm.name,
        email: updated.email || adminAccountForm.email,
        phone: updatedPhone.number,
        password: '',
        confirmPassword: '',
        role: updated.role || 'admin',
        status: updated.status || adminAccountForm.status,
        created_at: updated.created_at || adminAccountForm.created_at,
      });
      setAdminAccountOriginal({
        id: updated.id || adminAccountForm.id,
        name: updated.name || adminAccountForm.name,
        email: updated.email || adminAccountForm.email,
        phone: updatedPhone.number,
        password: '',
        confirmPassword: '',
        role: updated.role || 'admin',
        status: updated.status || adminAccountForm.status,
        created_at: updated.created_at || adminAccountForm.created_at,
      });
      setAdminAccountPhoneCountry(updatedPhone.country);
      setAdminAccountOriginalPhoneCountry(updatedPhone.country);
      setAdminAccountMessage(res.data.message || 'Admin account updated.');
      setAdminAccountTouchedFields({});
      setAdminAccountSaveConfirmModal(null);
      setIsEditingAdminAccount(false);
      setShowAdminPassword(false);
      setShowAdminConfirmPassword(false);
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

    if (['cancelled', 'cancelled'].includes(statusKey)) {
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
      borderColor: active ? '#d4af37' : '#e2e8f0',
      background: active ? '#d4af37' : '#fff',
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
                    <option key={optionValue} value={optionValue}>{optionLabel}</option>
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
        <h4 style={styles.websiteDesignTitle}>{title} Content Text Design</h4>

        {fieldRow('Font Style', `${prefix}_font_family`, 'select', WEBSITE_FONT_OPTIONS)}
        {fieldRow('Title Font Size', `${prefix}_title_font_size`, 'select', WEBSITE_FONT_SIZE_OPTIONS)}
        {fieldRow('Description Font Size', `${prefix}_description_font_size`, 'select', WEBSITE_FONT_SIZE_OPTIONS)}
        {fieldRow('Text Alignment', `${prefix}_text_alignment`, 'select', WEBSITE_ALIGNMENT_OPTIONS)}
      </div>
    );

    const contentEditActions = (sectionFields, requiredKeys = []) => (
      <div style={styles.overlayActions}>
        <button
          type="button"
          style={styles.secondaryBtn}
          disabled={websiteContentSaving}
          onClick={handleCancelWebsiteContentEdit}
        >
          Cancel
        </button>

        <button
          type="button"
          style={styles.saveBtn}
          disabled={websiteContentSaving}
          onClick={() => handleWebsiteContentSaveRequest(sectionFields, requiredKeys)}
        >
          {websiteContentSaving ? 'Saving...' : 'Save Content'}
        </button>
      </div>
    );

    function getContentSectionFields() {
      if (websiteContentSection === 'logo') {
        const logoPath = websiteContentEditing
          ? websiteContentForm.website_logo_path
          : websiteContent.website_logo_path;

        const logoSrc = logoPath
          ? logoPath.startsWith('http') || logoPath.startsWith('blob:')
            ? logoPath
            : `${api.defaults.baseURL.replace('/api', '')}${logoPath}`
          : '/images/clinic-logo.jpg';

        return (
          <div style={styles.logoCard}>
            <div style={styles.logoPreviewPanel}>
              <div style={styles.logoPreview}>
                <img
                  src={logoSrc}
                  alt="Website Logo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit:
                      (websiteContentEditing
                        ? websiteContentForm.website_logo_fit
                        : websiteContent.website_logo_fit) || 'contain',
                  }}
                />
              </div>

              <h3 style={styles.logoHeading}>
                Website Logo
              </h3>

              <p style={styles.logoText}>
                Upload a logo from your computer or mobile device. Changes will appear throughout the website after saving.
              </p>
            </div>

            <div style={styles.logoRight}>
                <label
                  style={{
                    ...styles.logoUploadBtn,
                    ...(websiteContentEditing
                      ? {}
                      : styles.logoUploadBtnDisabled),
                  }}
                >
                <i className="fi fi-rr-picture"></i>
                <span>Choose Logo</span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  hidden
                  disabled={!websiteContentEditing}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      const token = localStorage.getItem('token');

                      const formData = new FormData();
                      formData.append('logo', file);

                      const res = await api.post(
                        '/website/upload-logo',
                        formData,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                          },
                        }
                      );

                      console.log('Upload Response:', res.data);

                      const uploadedPath = res.data.path;

                      setWebsiteContent((prev) => ({
                        ...prev,
                        website_logo_path: uploadedPath,
                      }));

                      setWebsiteContentForm((prev) => ({
                        ...prev,
                        website_logo_path: uploadedPath,
                      }));
                    } catch (err) {
                      console.error(err);
                      alert('Failed to upload logo.');
                    }
                  }}
                />
              </label>

              <div style={styles.logoInfo}>
                Supported formats: PNG, JPG, WEBP and SVG
              </div>

              <div style={styles.logoOption}>
                <label style={styles.websiteFieldLabel}>
                  Logo Display
                </label>

                <div style={styles.logoSelectWrapper}>
                  <select
                    value={websiteContentForm.website_logo_fit || 'contain'}
                    disabled={!websiteContentEditing}
                    onChange={(e) =>
                      setWebsiteContentForm((prev) => ({
                        ...prev,
                        website_logo_fit: e.target.value,
                      }))
                    }
                    style={styles.logoSelect}
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="scale-down">Scale Down</option>
                    <option value="none">Original Size</option>
                  </select>

                  <i
                    className="fi fi-rr-angle-small-down"
                    style={styles.logoSelectIcon}
                  ></i>
                </div>
              </div>
            </div>

            {websiteContentEditing &&
              contentEditActions(
                {
                  website_logo_path: websiteContentForm.website_logo_path,
                  website_logo_fit: websiteContentForm.website_logo_fit,
                },
                ['website_logo_path']
              )}
          </div>
        );
      }
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

            {fieldRow('Booking Card Title', 'hero_booking_title')}
            {fieldRow('Booking Card Subtitle', 'hero_booking_subtitle')}
            
            {sectionDesignFields('hero', 'Hero')}
            {websiteContentEditing && (
              contentEditActions(
                collectFieldsByPrefixes(['hero_']),
                ['hero_heading', 'hero_description']
              )
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
              contentEditActions(
                collectFieldsByPrefixes(['about_']),
                ['about_paragraph1']
              )
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
              contentEditActions(
                collectFieldsByPrefixes(['contact_', 'hours_']),
                ['contact_phone1', 'contact_email']
              )
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
              contentEditActions(
                collectFieldsByPrefixes(['footer_']),
                ['footer_brand_name']
              )
            )}
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
                        <button type="button" style={{ ...styles.editBtn, color: '#dc2626', marginLeft: 6 }} 
                            onClick={() => {
                              setDeleteWebsiteServiceId(svc.id);
                              setDeleteWebsiteServiceModal(true);
                            }}>
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
            <div style={styles.websiteAnnouncementHeader}>
              <div>
                <h3 style={styles.websiteAnnouncementTitle}>Website Announcements</h3>
                <p style={styles.websiteAnnouncementSubtitle}>
                  Add announcements that will appear only within the selected date range.
                </p>
              </div>

              <button
                type="button"
                style={styles.primaryBtn}
                onClick={() =>
                  setWebsiteAnnouncementOverlay({
                    title: '',
                    message: '',
                    start_date: '',
                    end_date: '',
                    status: 'active',
                  })
                }
              >
                <i className="fi fi-rr-plus"></i> <span>Add Announcement</span>
              </button>
            </div>

            <div style={styles.websiteAnnouncementGrid}>
              {websiteAnnouncements.length === 0 ? (
                <div style={styles.websiteAnnouncementEmpty}>
                  <i className="fi fi-rr-megaphone" style={styles.websiteAnnouncementEmptyIcon}></i>
                  <span>No announcements found.</span>
                </div>
              ) : (
                websiteAnnouncements.map((ann) => (
                  <div key={ann.id} style={styles.websiteAnnouncementCard}>
                    <div style={styles.websiteAnnouncementCardHeader}>
                      <div style={styles.websiteAnnouncementIconBox}>
                        <i className="fi fi-rr-megaphone"></i>
                      </div>

                      <span style={getStatusStyle(ann.status === 'active' ? 'Active' : 'Inactive')}>
                        {ann.status === 'active' ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <h4 style={styles.websiteAnnouncementCardTitle}>
                      {ann.title || 'Untitled Announcement'}
                    </h4>

                    <p style={styles.websiteAnnouncementCardMessage}>
                      {ann.message || 'No announcement message provided.'}
                    </p>

                    <div style={styles.websiteAnnouncementDateRow}>
                      <div style={styles.websiteAnnouncementDateBox}>
                        <span style={styles.websiteAnnouncementDateLabel}>Start Date</span>
                        <strong style={styles.websiteAnnouncementDateValue}>
                          {ann.start_date ? String(ann.start_date).slice(0, 10) : '—'}
                        </strong>
                      </div>

                      <div style={styles.websiteAnnouncementDateBox}>
                        <span style={styles.websiteAnnouncementDateLabel}>End Date</span>
                        <strong style={styles.websiteAnnouncementDateValue}>
                          {ann.end_date ? String(ann.end_date).slice(0, 10) : '—'}
                        </strong>
                      </div>
                    </div>

                    <div style={styles.websiteAnnouncementActions}>
                      <button
                        type="button"
                        style={styles.websiteAnnouncementEditBtn}
                        onClick={() => setWebsiteAnnouncementOverlay({ ...ann })}
                      >
                        <i className="fi fi-rr-file-edit"></i> Edit
                      </button>

                      <button
                        type="button"
                        style={styles.websiteAnnouncementDeleteBtn}
                        onClick={() => {
                          setDeleteAnnouncementId(ann.id);
                          setDeleteAnnouncementModal(true);
                        }}
                      >
                        <i className="fi fi-rr-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      return null;
    }

    const contentSections = [
      { key: 'logo', label: 'Logo' },
      { key: 'hero', label: 'Hero' },
      { key: 'services', label: 'Services' },
      { key: 'about', label: 'About Us' },
      { key: 'faqs', label: 'FAQs' },
      { key: 'contact', label: 'Contact & Hours' },
      { key: 'footer', label: 'Footer' },
      { key: 'announcements', label: 'Announcements' },
    ];

    return (
      <>
        <section style={styles.tableCard}>
          <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "6px", background: "transparent", borderBottom: "1px solid #e2e8f0", borderRadius: 10, overflowX: "auto", scrollbarWidth: "none" }}>
                {contentSections.map((sec) => {
                  const active = websiteContentSection === sec.key;

                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => {
                        setWebsiteContentSection(sec.key);
                        setWebsiteContentEditing(false);
                        setWebsiteContentMsg({ text: "", type: "" });
                      }}
                      style={{
                        position: "relative",
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: 8,
                        background: active ? "#fef7e6" : "transparent",
                        color: active ? "#b88900" : "#64748b",
                        fontSize: 13,
                        fontWeight: active ? 700 : 600,
                        fontFamily: "Arial, sans-serif",
                        cursor: "pointer",
                        transition: "all .2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "#f8fafc";
                          e.currentTarget.style.color = "#334155";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#64748b";
                        }
                      }}
                    >
                      {sec.label}

                      {active && (
                        <span style={{ position: "absolute", left: "20%", right: "20%", bottom: -7, height: 2, borderRadius: 999, background: "#d4af37" }} />
                      )}
                    </button>
                  );
                })}
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

              {['logo', 'hero', 'about', 'contact', 'footer'].includes(websiteContentSection) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  {!websiteContentEditing && (
                    <button
                      type="button"
                      style={styles.primaryBtn}
                      onClick={() => setWebsiteContentEditing(true)}
                    >
                      <i className="fi fi-rr-edit"></i> <span>Edit Content</span>
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


        {websiteAnnouncementOverlay && (
          <WebsiteItemOverlay
            styles={styles}
            title={websiteAnnouncementOverlay.id ? 'Edit Announcement' : 'New Announcement'}
            onClose={() => setWebsiteAnnouncementOverlay(null)}
            onSave={(data) => saveAnnouncement(data)}
            onValidationError={(message) => showWebsiteValidationModal('Required Fields Missing', message)}
            data={websiteAnnouncementOverlay}
            fields={[
              { key: 'title', label: 'Announcement Title', required: true },
              { key: 'message', label: 'Announcement Message', type: 'textarea', required: true },
              { key: 'start_date', label: 'Start Date', type: 'date', required: true },
              { key: 'end_date', label: 'End Date', type: 'date', required: true },
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'hidden', label: 'Hidden' },
                ],
              },
            ]}
          />
        )}
      </>
    );
  }

  function renderAdminAccountPanel() {
    const displayDate = String(adminAccountForm.created_at || '').slice(0, 10) || 'N/A';
    const adminNameError = getAdminAccountNameError();
    const adminEmailError = getAdminAccountEmailError();
    const adminPhoneError = getAdminAccountPhoneError();
    const adminPasswordError = validateAdminPassword();
    const shouldShowAdminNameError =
      !!adminNameError && !!adminAccountTouchedFields.name;
    const shouldShowAdminEmailError =
      !!adminEmailError && !!adminAccountTouchedFields.email;
    const shouldShowAdminPhoneError =
      !!adminPhoneError && !!adminAccountTouchedFields.phone;
    const shouldShowAdminPasswordError =
      !!adminPasswordError &&
      (!!adminAccountForm.password || !!adminAccountForm.confirmPassword);

    return (
      <>
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
                  const cleanAdminAccountForm = {
                    ...adminAccountForm,
                    password: '',
                    confirmPassword: '',
                  };
                  setAdminAccountForm(cleanAdminAccountForm);
                  setAdminAccountOriginal(cleanAdminAccountForm);
                  setAdminAccountOriginalPhoneCountry(adminAccountPhoneCountry);
                  setAdminAccountTouchedFields({});
                  setShowAdminPassword(false);
                  setShowAdminConfirmPassword(false);
                  setIsEditingAdminAccount(true);
                }}
              >
                Edit Admin Account
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleAdminAccountSubmit} noValidate>
            <div style={styles.formGrid}>
              <Field label={renderAdminRequiredLabel('Full Name')} styles={styles}>
                <input
                  type="text"
                  value={adminAccountForm.name}
                  onChange={(event) =>
                    handleAdminAccountChange('name', event.target.value)
                  }
                  onBlur={() => handleAdminAccountBlur('name')}
                  style={{
                    ...styles.formInput,
                    ...(shouldShowAdminNameError
                      ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
                      : {}),
                  }}
                />
                {shouldShowAdminNameError && (
                  <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                    {adminNameError}
                  </span>
                )}
              </Field>

              <Field label={renderAdminRequiredLabel('Email Address')} styles={styles}>
                <input
                  type="email"
                  value={adminAccountForm.email}
                  onChange={(event) =>
                    handleAdminAccountChange('email', event.target.value)
                  }
                  onBlur={() => handleAdminAccountBlur('email')}
                  style={{
                    ...styles.formInput,
                    ...(shouldShowAdminEmailError
                      ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
                      : {}),
                  }}
                  required
                />
                {shouldShowAdminEmailError && (
                  <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                    {adminEmailError}
                  </span>
                )}
              </Field>

              <Field label={renderAdminRequiredLabel('Contact Number')} styles={styles}>
                <div style={styles.phoneInputContainer}>
                  <select
                    value={adminAccountPhoneCountry}
                    onChange={(event) =>
                      handleAdminAccountPhoneCountryChange(event.target.value)
                    }
                    onBlur={() => handleAdminAccountBlur('phone')}
                    style={{
                      ...styles.phoneCountrySelect,
                      ...(shouldShowAdminPhoneError ? styles.phoneInputError : {}),
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
                    value={adminAccountForm.phone}
                    onChange={(event) =>
                      handleAdminAccountChange('phone', event.target.value)
                    }
                    onBlur={() => handleAdminAccountBlur('phone')}
                    style={{
                      ...styles.phoneInput,
                      ...(shouldShowAdminPhoneError ? styles.phoneInputError : {}),
                    }}
                    placeholder="9123456789"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={15}
                    required
                  />
                </div>
                {shouldShowAdminPhoneError && (
                  <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                    {adminPhoneError}
                  </span>
                )}
              </Field>

              <Field label={renderAdminRequiredLabel('Status')} styles={styles}>
                <select
                  value={adminAccountForm.status}
                  onChange={(event) =>
                    handleAdminAccountChange('status', event.target.value)
                  }
                  onBlur={() => handleAdminAccountBlur('status')}
                  style={styles.formInput}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>

              <Field label="Password" styles={styles}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminAccountForm.password}
                    onChange={(event) =>
                      handleAdminAccountChange('password', event.target.value)
                    }
                    style={{ ...styles.formInput, paddingRight: 76 }}
                    placeholder="Optional new password"
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 6px',
                    }}
                  >
                    {showAdminPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" styles={styles}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminConfirmPassword ? 'text' : 'password'}
                    value={adminAccountForm.confirmPassword}
                    onChange={(event) =>
                      handleAdminAccountChange('confirmPassword', event.target.value)
                    }
                    style={{ ...styles.formInput, paddingRight: 76 }}
                    placeholder="Confirm new password"
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 6px',
                    }}
                  >
                    {showAdminConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
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
            {shouldShowAdminPasswordError && (
              <p style={{ ...styles.errorText, marginTop: 10 }}>
                {adminPasswordError}
              </p>
            )}

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setShowAdminAccountCancelConfirmModal(true)}
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

      {showAdminAccountCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowAdminAccountCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Admin Account Editing</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved admin account changes will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowAdminAccountCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={() => {
                  setAdminAccountMessage('');
                  setAdminAccountError('');
                  setShowAdminAccountCancelConfirmModal(false);
                  setAdminAccountSaveConfirmModal(null);
                  setIsEditingAdminAccount(false);
                  setShowAdminPassword(false);
                  setShowAdminConfirmPassword(false);
                  setAdminAccountTouchedFields({});
                  setAdminAccountPhoneCountry(adminAccountOriginalPhoneCountry);
                  setAdminAccountForm({
                    ...adminAccountOriginal,
                    password: '',
                    confirmPassword: '',
                  });
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {adminAccountSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setAdminAccountSaveConfirmModal(null);
            }
          }}
        >
          <div style={{ ...styles.modalContent, width: isMobile ? '100%' : 520, maxWidth: 520 }}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Admin Account Changes</h2>
            <p style={styles.modalText}>
              Please review the admin account details before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {adminAccountSaveConfirmModal.details.filter((detail) => detail.changed).length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 13, padding: '8px 0' }}>
                  No admin account changes detected.
                </div>
              ) : (
                adminAccountSaveConfirmModal.details
                  .filter((detail) => detail.changed)
                  .map((detail) => (
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
                          {detail.previousValue === 'Not set' ? 'Added' : 'Changed'}
                        </small>
                      </span>
                      <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: 260, overflowWrap: 'anywhere' }}>
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
                onClick={() => setAdminAccountSaveConfirmModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={saveAdminAccount}
              >
                Update Admin Account
              </button>
            </div>
          </div>
        </div>
      )}
      </>
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
            {serviceCategoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
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
            <AdminProfileMenu
              styles={styles}
              adminName={adminAccountForm.name || adminAccountForm.email || 'Admin'}
            />
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Settings</span>

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
          ) : activeSection === 'cancellationPolicy' ? (
            <section style={styles.tableCard}>
              <div style={styles.websiteAnnouncementHeader}>
                <div>
                  <h3 style={styles.websiteAnnouncementTitle}>
                    Cancellation Policy
                  </h3>
                  <p style={styles.websiteAnnouncementSubtitle}>
                    Edit the clinic cancellation-policy message shown to patients.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.primaryBtn}
                  disabled={cancellationPolicySaving}
                  onClick={startCancellationPolicyEdit}
                >
                  <i className="fi fi-rr-edit"></i>
                  <span>Edit Content</span>
                </button>
              </div>

              <div style={{ width: '100%', textAlign: 'left', marginTop: 22 }}>
                <label style={styles.websiteFieldLabel}>
                  Cancellation Policy Message
                </label>

                {cancellationPolicyEditing ? (
                  <textarea
                    value={cancellationPolicyDraft}
                    onChange={(event) => setCancellationPolicyDraft(event.target.value)}
                    rows={5}
                    style={{ ...styles.formInput, ...styles.websiteTextarea }}
                    placeholder="Enter cancellation policy message"
                  />
                ) : (
                  <div
                    style={{
                      ...styles.formInput,
                      ...styles.readOnlyInput,
                      minHeight: 110,
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                    }}
                  >
                    {cancellationPolicyMessage || (
                      <span style={{ color: '#94a3b8' }}>No cancellation policy message set.</span>
                    )}
                  </div>
                )}
              </div>

              {cancellationPolicyEditing && (
                <div style={{ ...styles.modalActions, justifyContent: 'flex-end', marginTop: 18 }}>
                  <button
                    type="button"
                    style={{ ...styles.modalButton, ...styles.cancelBtn }}
                    disabled={cancellationPolicySaving}
                    onClick={() => setShowCancellationPolicyCancelConfirmModal(true)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    style={{ ...styles.modalButton, ...styles.saveBtn }}
                    disabled={cancellationPolicySaving}
                    onClick={handleCancellationPolicySaveRequest}
                  >
                    {cancellationPolicySaving ? 'Saving...' : 'Save Content'}
                  </button>
                </div>
              )}
            </section>
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
                    Prev
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
                    Next
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
          onOverlayClick={handleBranchOverlayClick}
          showCloseButton={false}
        >
          <form onSubmit={handleBranchSubmit} noValidate>
            <div style={styles.formGrid}>
              <Field label={renderBranchRequiredLabel('Branch Name')} styles={styles}>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(event) =>
                    handleBranchChange('name', event.target.value)
                  }
                  onBlur={() => handleBranchFieldBlur('name')}
                  style={getBranchFieldStyle('name')}
                  required
                />
              </Field>

              <Field label={renderBranchRequiredLabel('Clinic Location')} styles={styles}>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(event) =>
                    handleBranchChange('address', event.target.value)
                  }
                  onBlur={() => handleBranchFieldBlur('address')}
                  style={getBranchFieldStyle('address')}
                  required
                />
              </Field>

              <Field label={renderBranchRequiredLabel('Date Opened')} styles={styles}>
                <input
                  type="date"
                  value={branchForm.date_opened}
                  onChange={(event) =>
                    handleBranchChange('date_opened', event.target.value)
                  }
                  onBlur={() => handleBranchFieldBlur('date_opened')}
                  style={getBranchFieldStyle('date_opened')}
                />
              </Field>

              <Field label={renderBranchRequiredLabel('Contact Number')} styles={styles}>
                <div style={styles.phoneInputContainer}>
                  <select
                    value={branchPhoneCountry}
                    onChange={(event) =>
                      handleBranchPhoneCountryChange(event.target.value)
                    }
                    onBlur={() => handleBranchFieldBlur('phone')}
                    style={{
                      ...styles.phoneCountrySelect,
                      ...(isBranchFieldInvalid('phone') ? styles.phoneInputError : {}),
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
                    inputMode="tel"
                    maxLength={15}
                    value={branchForm.phone}
                    onChange={(event) =>
                      handleBranchChange('phone', event.target.value)
                    }
                    onBlur={() => handleBranchFieldBlur('phone')}
                    style={{
                      ...styles.phoneInput,
                      ...(isBranchFieldInvalid('phone') ? styles.phoneInputError : {}),
                    }}
                    placeholder="9123456789"
                    autoComplete="tel"
                  />
                </div>
                {getBranchPhoneError() && (
                  <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>
                    {getBranchPhoneError()}
                  </span>
                )}
              </Field>

              <Field label={renderBranchRequiredLabel('Contact Person')} styles={styles}>
                <input
                  type="text"
                  value={branchForm.contact_person}
                  onChange={(event) =>
                    handleBranchChange('contact_person', event.target.value)
                  }
                  onBlur={() => handleBranchFieldBlur('contact_person')}
                  style={getBranchFieldStyle('contact_person')}
                />
              </Field>

              <Field label={renderBranchRequiredLabel('Operating Hours')} styles={styles}>
                <input
                  type="text"
                  value={branchForm.operating_hours}
                  onChange={(event) =>
                    handleBranchChange('operating_hours', event.target.value)
                  }
                  onBlur={() => handleBranchFieldBlur('operating_hours')}
                  style={getBranchFieldStyle('operating_hours')}
                  placeholder="Mon - Sat, 9:00 AM - 5:00 PM"
                />
              </Field>

              <Field label="Years Active" styles={styles}>
                <input
                  type="text"
                  value={branchYearsActive}
                  style={{ ...styles.formInput, ...styles.readOnlyInput }}
                  placeholder="Computed from date opened"
                  readOnly
                />
              </Field>

              <Field label={renderBranchRequiredLabel('Status')} styles={styles}>
                <select
                  value={branchForm.status}
                  onChange={(event) =>
                    handleBranchChange('status', event.target.value)
                  }
                  onBlur={() => handleBranchFieldBlur('status')}
                  style={getBranchFieldStyle('status')}
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

            <div style={styles.overlayActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setShowBranchCancelConfirmModal(true)}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.saveBtn,
                  opacity: isBranchFormComplete ? 1 : 0.55,
                  cursor: isBranchFormComplete ? 'pointer' : 'not-allowed',
                }}
                disabled={!isBranchFormComplete}
              >
                Save Branch
              </button>
            </div>
          </form>
        </FormOverlay>
      )}

      {showBranchCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowBranchCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Branch Form</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved branch details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowBranchCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={closeOverlay}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBranchSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowBranchSaveConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Branch Details</h2>
            <p style={styles.modalText}>
              Please confirm that the branch information is correct before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {[
                ['Branch Name', branchForm.name || 'Not entered'],
                ['Clinic Location', branchForm.address || 'Not entered'],
                ['Date Opened', branchForm.date_opened || 'Not selected'],
                ['Contact Number', normalizePhoneNumber(branchForm.phone, branchPhoneCountry) || 'Not entered'],
                ['Contact Person', branchForm.contact_person || 'Not entered'],
                ['Operating Hours', branchForm.operating_hours || 'Not entered'],
                ['Years Active', branchYearsActive || 'Not computed'],
                ['Status', branchForm.status || 'Not selected'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowBranchSaveConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={saveBranch}
              >
                Save Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {activeOverlay === 'services' && (
        <FormOverlay
          styles={styles}
          title={serviceForm.id ? 'Update Service' : 'New Service'}
          onClose={closeOverlay}
          onOverlayClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowServiceCancelConfirmModal(true);
            }
          }}
          showCloseButton={false}
        >
          <form onSubmit={handleServiceSubmit} noValidate>
            <div style={styles.formGrid}>
              <Field label={renderServiceRequiredLabel('Service Name')} styles={styles}>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(event) =>
                    handleServiceChange('name', event.target.value)
                  }
                  onBlur={() => handleServiceFieldBlur('name')}
                  style={getServiceFieldStyle('name')}
                />
                {renderServiceFieldError('name')}
              </Field>

              <Field label={renderServiceRequiredLabel('Category')} styles={styles}>
                <select
                  value={serviceCategoryMode === 'custom' ? '__custom__' : serviceForm.category}
                  onChange={(event) => {
                    if (event.target.value === '__custom__') {
                      setServiceCategoryMode('custom');
                      handleServiceChange('category', '');
                      return;
                    }
                    setServiceCategoryMode('select');
                    handleServiceChange('category', event.target.value);
                  }}
                  onBlur={() => handleServiceFieldBlur('category')}
                  style={getServiceFieldStyle('category')}
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {serviceCategoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="__custom__">Add new category...</option>
                </select>
                {serviceCategoryMode === 'custom' && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 0,
                      borderRadius: 0,
                      border: 'none',
                      background: 'transparent',
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      value={serviceForm.category}
                      onChange={(event) =>
                        handleServiceChange('category', event.target.value)
                      }
                      onBlur={() => handleServiceFieldBlur('category')}
                      placeholder="Enter new category"
                      style={getServiceFieldStyle('category')}
                  />
                    <button
                      type="button"
                      onClick={() => {
                        setServiceCategoryMode('select');
                        handleServiceChange('category', '');
                      }}
                      style={{
                        ...styles.saveBtn,
                        height: 44,
                        padding: '0 18px',
                      }}
                    >
                      Use Existing
                    </button>
                  </div>
                )}
                {renderServiceFieldError('category')}
              </Field>

              <Field label={renderServiceRequiredLabel('Price')} styles={styles}>
                <input
                  type="text"
                  value={serviceForm.price}
                  onChange={(event) =>
                    handleServiceChange('price', event.target.value)
                  }
                  onBlur={() => handleServiceFieldBlur('price')}
                  style={getServiceFieldStyle('price')}
                  required
                />
                {renderServiceFieldError('price')}
              </Field>

              <Field label={renderServiceRequiredLabel('Duration (minutes)')} styles={styles}>
                <input
                  type="text"
                  value={serviceForm.duration}
                  onChange={(event) =>
                    handleServiceChange('duration', event.target.value)
                  }
                  onBlur={() => handleServiceFieldBlur('duration')}
                  style={getServiceFieldStyle('duration')}
                  required
                />
                {renderServiceFieldError('duration')}
              </Field>

              <Field label={renderServiceRequiredLabel('Time Buffer (minutes)')} styles={styles}>
                <input
                  type="text"
                  value={serviceForm.time_buffer_min}
                  onChange={(event) =>
                    handleServiceChange('time_buffer_min', event.target.value)
                  }
                  onBlur={() => handleServiceFieldBlur('time_buffer_min')}
                  style={getServiceFieldStyle('time_buffer_min')}
                  required
                />
                {renderServiceFieldError('time_buffer_min')}
              </Field>

              <Field label={renderServiceRequiredLabel('Status')} styles={styles}>
                <select
                  value={serviceForm.status}
                  onChange={(event) =>
                    handleServiceChange('status', event.target.value)
                  }
                  onBlur={() => handleServiceFieldBlur('status')}
                  style={getServiceFieldStyle('status')}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
                {renderServiceFieldError('status')}
              </Field>

            </div>

            <div style={styles.overlayActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setShowServiceCancelConfirmModal(true)}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.saveBtn,
                  opacity: isServiceFormComplete ? 1 : 0.55,
                  cursor: 'pointer',
                }}
              >
                Save Service
              </button>
            </div>
          </form>
        </FormOverlay>
      )}

      {showServiceCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowServiceCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Service Form</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved service details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowServiceCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={closeOverlay}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowServiceSaveConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Service Details</h2>
            <p style={styles.modalText}>
              Please confirm that the service information is correct before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {[
                ['Service Name', serviceForm.name || 'Not entered'],
                ['Category', serviceForm.category || 'Not selected'],
                ['Price', serviceForm.price || 'Not entered'],
                ['Duration', serviceForm.duration || 'Not entered'],
                ['Time Buffer', serviceForm.time_buffer_min || 'Not entered'],
                ['Status', serviceForm.status || 'Not selected'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowServiceSaveConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={saveService}
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceKitOverlay && (
        <FormOverlay
          styles={styles}
          title="Manage Service Kit"
          onClose={() => setShowServiceKitCancelConfirmModal(true)}
          onOverlayClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowServiceKitCancelConfirmModal(true);
            }
          }}
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
              <div style={styles.fieldLabel}>Category{serviceKitRequiredAsterisk}</div>
              <div style={styles.fieldLabel}>Item{serviceKitRequiredAsterisk}</div>
              <div style={styles.fieldLabel}>Default Quantity{serviceKitRequiredAsterisk}</div>
              <div style={styles.fieldLabel}>Current Stock{serviceKitRequiredAsterisk}</div>
              <div style={styles.fieldLabel}>Action{serviceKitRequiredAsterisk}</div>
            </div>
            {!serviceKitRowInputsDisabled && serviceKitHasNoItems && (
              <div
                style={{
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '10px 12px',
                  marginBottom: 10,
                }}
              >
                At least one service kit item is required.
              </div>
            )}
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
            <button
              type="button"
              style={{
                ...styles.saveBtn,
                opacity: kitSaveDisabled ? 0.55 : 1,
                cursor: kitSaveDisabled ? 'not-allowed' : 'pointer',
              }}
              onClick={handleServiceKitSaveRequest}
              disabled={kitSaveDisabled}
            >
              Save Service Kit
            </button>
          </div>
        </FormOverlay>
      )}

      {showServiceKitSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowServiceKitSaveConfirmModal(false);
            }
          }}
        >
          <div style={{ ...styles.modalContent, width: isMobile ? '96%' : '92%', maxWidth: 980 }}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Service Kit Details</h2>
            <p style={styles.modalText}>
              Please confirm that the service kit information is correct before saving.
            </p>

            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontFamily: 'Arial, sans-serif',
                marginBottom: 8,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, border: '1px solid #f1f5f9', borderRadius: 8 }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: 12 }}>Branch</span>
                  <strong style={{ color: '#0f172a', fontSize: 13 }}>
                    {branches.find((branch) => String(branch.id) === String(serviceKitBranchId))?.address ||
                      branches.find((branch) => String(branch.id) === String(serviceKitBranchId))?.name ||
                      'Not selected'}
                  </strong>
                </div>
                <div style={{ padding: 10, border: '1px solid #f1f5f9', borderRadius: 8 }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: 12 }}>Service</span>
                  <strong style={{ color: '#0f172a', fontSize: 13 }}>
                    {services.find((service) => String(service.id) === String(serviceKitServiceId))?.name || 'Not selected'}
                  </strong>
                </div>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '140px minmax(220px, 1fr) 150px 130px 110px',
                    gap: 0,
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {['Category', 'Item', 'Default Quantity', 'Current Stock', 'Action'].map((label) => (
                    <div key={label} style={{ padding: '9px 10px', borderBottom: '1px solid #e5e7eb' }}>
                      {label}
                    </div>
                  ))}
                </div>
                {serviceKitItems.map((item, index) => (
                  <div
                    key={`${item.category}-${item.item_name}-${index}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '140px minmax(220px, 1fr) 150px 130px 110px',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ padding: '9px 10px', borderBottom: '1px solid #f1f5f9' }}>{item.category || 'Not selected'}</div>
                    <div style={{ padding: '9px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>{item.item_name || 'Not selected'}</div>
                    <div style={{ padding: '9px 10px', borderBottom: '1px solid #f1f5f9' }}>{item.default_quantity || 'Not entered'}</div>
                    <div style={{ padding: '9px 10px', borderBottom: '1px solid #f1f5f9' }}>{item.current_stock ?? 'Not available'}</div>
                    <div style={{ padding: '9px 10px', borderBottom: '1px solid #f1f5f9' }}>Save</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowServiceKitSaveConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={saveServiceKit}
              >
                Save Service Kit
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceKitCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowServiceKitCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Service Kit</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved service kit changes will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowServiceKitCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={() => {
                  setShowServiceKitCancelConfirmModal(false);
                  setShowServiceKitSaveConfirmModal(false);
                  setServiceKitOverlay(false);
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
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
                style={{
                  ...styles.saveBtn,
                  minWidth: 120,
                  backgroundColor: '#dc2626',
                  boxShadow: '0 10px 20px rgba(220, 38, 38, 0.22)',
                }}
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
          onClose={() => setShowUserCancelConfirmModal(true)}
          onOverlayClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUserCancelConfirmModal(true);
            }
          }}
          showCloseButton={false}
        >
          <form onSubmit={handleUserSubmit}>
            <div style={styles.formGrid}>
              <Field label={renderUserRequiredLabel('Full Name', 'fullName')} styles={styles}>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(event) =>
                    handleUserChange('fullName', event.target.value)
                  }
                  onBlur={() => handleUserFieldBlur('fullName')}
                  style={getUserFieldStyle('fullName')}
                  required
                />
              </Field>

              <Field label={renderUserRequiredLabel('Email Address', 'email')} styles={styles}>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(event) =>
                    handleUserChange('email', event.target.value)
                  }
                  onBlur={() => handleUserFieldBlur('email')}
                  style={getUserFieldStyle('email')}
                  required
                />
                {getUserEmailError() && (
                  <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                    {getUserEmailError()}
                  </span>
                )}
              </Field>

              <Field label={renderUserRequiredLabel('Access Role', 'role')} styles={styles}>
                <select
                  value={userForm.role}
                  onChange={(event) =>
                    handleUserChange('role', event.target.value)
                  }
                  onBlur={() => handleUserFieldBlur('role')}
                  style={getUserFieldStyle('role')}
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

              <Field label={renderUserRequiredLabel('Assigned Branch', 'branch_id')} styles={styles}>
                <select
                  value={userForm.branch_id}
                  onChange={(event) =>
                    handleUserChange('branch_id', event.target.value)
                  }
                  onBlur={() => handleUserFieldBlur('branch_id')}
                  style={getUserFieldStyle('branch_id')}
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
                    onBlur={() => handleUserFieldBlur('password')}
                    style={styles.formInput}
                    placeholder="Leave blank to generate"
                  />
                </Field>
              )}

              <Field label={renderUserRequiredLabel('Status', 'status')} styles={styles}>
                <select
                  value={userForm.status}
                  onChange={(event) =>
                    handleUserChange('status', event.target.value)
                  }
                  onBlur={() => handleUserFieldBlur('status')}
                  style={getUserFieldStyle('status')}
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

            <div style={styles.overlayActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setShowUserCancelConfirmModal(true)}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.saveBtn,
                  opacity: isUserFormComplete ? 1 : 0.55,
                  cursor: isUserFormComplete ? 'pointer' : 'not-allowed',
                }}
                disabled={!isUserFormComplete}
              >
                Save User Account
              </button>
            </div>
          </form>
        </FormOverlay>
      )}

      {showUserCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUserCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel User Account Form</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved user account details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowUserCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={closeOverlay}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUserSaveConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm User Account Details</h2>
            <p style={styles.modalText}>
              Please confirm that the user account information is correct before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {[
                ['Full Name', userForm.fullName || 'Not entered'],
                ['Email Address', userForm.email || 'Not entered'],
                ['Access Role', userForm.role || 'Not selected'],
                [
                  'Assigned Branch',
                  userForm.role === 'Admin'
                    ? 'Not required'
                    : branches.find((branch) => String(branch.id) === String(userForm.branch_id))?.name ||
                      branches.find((branch) => String(branch.id) === String(userForm.branch_id))?.address ||
                      'Not selected',
                ],
                ['Password', userForm.id ? 'Unchanged' : userForm.password ? 'Manually entered' : 'Auto-generated'],
                ['Status', userForm.status || 'Not selected'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowUserSaveConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={saveUser}
              >
                Save User Account
              </button>
            </div>
          </div>
        </div>
      )}

      {cancellationPolicySaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setCancellationPolicySaveConfirmModal(null);
            }
          }}
        >
          <div style={{ ...styles.modalContent, width: isMobile ? '100%' : 520, maxWidth: 520 }}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Policy Changes</h2>
            <p style={styles.modalText}>
              Please review the appointment cancellation policy before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {cancellationPolicySaveConfirmModal.details.filter((detail) => detail.changed).length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 13, padding: '8px 0' }}>
                  No policy changes detected.
                </div>
              ) : (
                cancellationPolicySaveConfirmModal.details
                  .filter((detail) => detail.changed)
                  .map((detail) => (
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
                          {detail.previousValue === 'Not set' ? 'Added' : 'Changed'}
                        </small>
                      </span>
                      <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: 260, overflowWrap: 'anywhere' }}>
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
                onClick={() => setCancellationPolicySaveConfirmModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={cancellationPolicySaving}
                onClick={confirmCancellationPolicySave}
              >
                {cancellationPolicySaving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancellationPolicyCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowCancellationPolicyCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Policy Editing</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved appointment cancellation policy changes will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowCancellationPolicyCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelCancellationPolicyEdit}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
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

      {websiteContentSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setWebsiteContentSaveConfirmModal(null);
            }
          }}
        >
          <div style={{ ...styles.modalContent, width: isMobile ? '100%' : 520, maxWidth: 520 }}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Content Changes</h2>
            <p style={styles.modalText}>
              Please review the website content details before saving.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {websiteContentSaveConfirmModal.details.filter((detail) => detail.changed).length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 13, padding: '8px 0' }}>
                  No content changes detected.
                </div>
              ) : (
                websiteContentSaveConfirmModal.details
                  .filter((detail) => detail.changed)
                  .map((detail) => (
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
                          {detail.previousValue === 'Not set' ? 'Added' : 'Changed'}
                        </small>
                      </span>
                      <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: 260, overflowWrap: 'anywhere' }}>
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
                onClick={() => setWebsiteContentSaveConfirmModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={websiteContentSaving}
                onClick={confirmWebsiteContentSave}
              >
                {websiteContentSaving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWebsiteContentCancelConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowWebsiteContentCancelConfirmModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Content Editing</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved website content changes will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setShowWebsiteContentCancelConfirmModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelWebsiteContentEdit}
              >
                Yes, Cancel
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

      {deleteAnnouncementModal && (
        <div style={styles.modal}
          onClick={() => {
            setDeleteAnnouncementModal(false);
            setDeleteAnnouncementId(null);
          }}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()} >
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-trash"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Delete Announcement</h2>

            <p style={styles.modalText}>Are you sure you want to permanently delete this announcement?</p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmDeleteAnnouncement}
              >
                Delete
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => {
                  setDeleteAnnouncementModal(false);
                  setDeleteAnnouncementId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteWebsiteServiceModal && (
        <div
          style={styles.modal}
          onClick={() => {
            setDeleteWebsiteServiceModal(false);
            setDeleteWebsiteServiceId(null);
          }}
        >
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-trash"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Delete Service</h2>

            <p style={styles.modalText}>
              Are you sure you want to permanently delete this service card?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={deleteWebsiteService}
              >
                Delete
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => {
                  setDeleteWebsiteServiceModal(false);
                  setDeleteWebsiteServiceId(null);
                }}
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

function FormOverlay({
  styles,
  title,
  onClose,
  onOverlayClick,
  children,
  showCloseButton = true,
}) {
  return (
    <div style={styles.overlay} onClick={onOverlayClick}>
      <div style={styles.overlayContent}>
        <div style={styles.overlayHeader}>
          <h3 style={styles.overlayTitle}>{title}</h3>

          {showCloseButton && (
            <button type="button" onClick={onClose} style={styles.overlayClose}>
              &times;
            </button>
          )}
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
              <button type="submit" style={styles.saveBtn}>Save</button>
              <button type="button" onClick={onClose} style={styles.secondaryBtn}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

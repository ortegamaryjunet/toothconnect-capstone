import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, } from 'libphonenumber-js';

import api from '../api/axios';
import { getManageServiceKit, saveManageServiceKit, listSupplies, listMedicines, listEquipment, listServiceKitHistory, } from '../api/inventory';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import AdminProfileMenu from '../components/AdminProfileMenu';
import createAdminSettingsStyles from '../styles/AdminSettings';
import WebsiteContentRenderer from "../components/WebsiteContentRenderer";

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

const BRANCH_OPERATING_HOURS_FORMAT = 'Mon - Sat, 10:00 AM - 7:00 PM';
const BRANCH_OPERATING_HOURS_REGEX =
  /^[A-Za-z]{3}(?:\s*-\s*[A-Za-z]{3})?,\s*(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)\s*-\s*(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)$/i;

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
  profilePhotoUrl: '',
};

const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;
const ADMIN_PROFILE_PHOTO_STORAGE_KEY = 'toothconnect_admin_profile_photo_url';
const ADMIN_PROFILE_PHOTO_EVENT = 'admin-profile-photo-updated';

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

export default function AdminSettings() {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const [activeSection, setActiveSection] = useState("leaveRequests");
  const [activeOverlay, setActiveOverlay] = useState(null);

  const highlightRequestId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("highlightRequestId") || null;
  }, [location.search]);

  useEffect(() => {
    if (highlightRequestId) {
      setActiveSection("leaveRequests");
    }
  }, [highlightRequestId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    if (section === "adminAccount") {
      setActiveSection("adminAccount");
    }
  }, [location.search]);

  const fontFamilyOptions = [
    "Arial",
    "Helvetica",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Times New Roman",
    "Georgia",
  ];

  const fontWeightOptions = [
    { value: "100", label: "100 Thin" },
    { value: "200", label: "200 Extra Light" },
    { value: "300", label: "300 Light" },
    { value: "400", label: "400 Normal" },
    { value: "500", label: "500 Medium" },
    { value: "600", label: "600 Semi Bold" },
    { value: "700", label: "700 Bold" },
    { value: "800", label: "800 Extra Bold" },
    { value: "900", label: "900 Black" },
  ];

  const textAlignOptions = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "justify", label: "Justify" },
  ];

  const fontSizeOptions = [
    { value: "8px", label: "8px" },
    { value: "9px", label: "9px" },
    { value: "10px", label: "10px" },
    { value: "11px", label: "11px" },
    { value: "12px", label: "12px" },
    { value: "13px", label: "13px" },
    { value: "14px", label: "14px" },
    { value: "15px", label: "15px" },
    { value: "16px", label: "16px" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "22px", label: "22px" },
    { value: "23px", label: "23px" },
    { value: "24px", label: "24px" },
    { value: "26px", label: "26px" },
    { value: "28px", label: "28px" },
    { value: "32px", label: "32px" },
    { value: "34px", label: "34px" },
    { value: "36px", label: "36px" },
    { value: "38px", label: "38px" },
    { value: "42px", label: "42px" },
    { value: "44px", label: "44px" },
    { value: "46px", label: "46px" },
    { value: "48px", label: "48px" },
    { value: "56px", label: "56px" },
    { value: "64px", label: "64px" },
    { value: "72px", label: "72px" },
  ];

  const fieldRow = (label, key, type = "text", options = []) => {
    const value = websiteContentForm[key] ?? "";

    const inputValue =
      type === "color"
        ? /^#[0-9A-Fa-f]{6}$/.test(value)
          ? value
          : "#000000"
        : value;

    const showError = websiteContentErrors[key];

    const handleChange = (newValue) => {
      let error = "";

      /* Brand Name */
      if (key === "footer_brand_name") {
        newValue = newValue.replace(/[^A-Za-z\s&.'-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z\s&.'-]+$/.test(newValue.trim())
        ) {
          error = "Brand name contains invalid characters.";
        }
      }

      /* Team Name */
      else if (key === "footer_team_name") {
        newValue = newValue.replace(/[^A-Za-z\s&:.,'()-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z\s&:.,'()-]+$/.test(newValue.trim())
        ) {
          error = "Team name contains invalid characters.";
        }
      }

      /* System Name */
      else if (key === "footer_system_name") {
        newValue = newValue.replace(/[^A-Za-z\s&:.,'()-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z\s&:.,'()-]+$/.test(newValue.trim())
        ) {
          error = "System name contains invalid characters.";
        }
      }

      /* Clinic Tagline */
      else if (key === "contact_tagline") {
        newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(newValue)
        ) {
          error = "Clinic tagline contains invalid characters.";
        }
      }

      /* Contact Badge */
      else if (key === "contact_badge") {
        newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(newValue)
        ) {
          error = "Contact badge contains invalid characters.";
        }
      }

      /* Contact Heading */
      else if (key === "contact_heading") {
        newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(newValue)
        ) {
          error = "Contact heading contains invalid characters.";
        }
      }

      /* Contact Button */
      else if (key === "contact_button") {
        newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(newValue)
        ) {
          error = "Button label contains invalid characters.";
        }
      }

      /* Facebook Page Name */
      else if (key === "contact_facebook_name") {
        newValue = newValue.replace(/[^A-Za-z\s&.'-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z\s&.'-]+$/.test(newValue.trim())
        ) {
          error = "Facebook page name contains invalid characters.";
        }
      }

      /* Facebook URL */
      else if (key === "contact_facebook_url") {
        const fbRegex =
          /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i;

        if (
          newValue &&
          !fbRegex.test(newValue.trim())
        ) {
          error = "Enter a valid Facebook URL.";
        }
      }

      /* Email */
      else if (key === "contact_email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
          newValue &&
          !emailRegex.test(newValue.trim())
        ) {
          error = "Enter a valid email address.";
        }
      }

      /* Phone Numbers */
      else if (
        key === "contact_phone1" ||
        key === "contact_phone2"
      ) {
        newValue = newValue.replace(/\D/g, "").slice(0, 10);

        if (
          newValue.length > 0 &&
          !newValue.startsWith("9")
        ) {
          error = "Phone number must start with 9.";
        } else if (
          newValue.length > 0 &&
          newValue.length < 10
        ) {
          error =
            "Phone number must contain exactly 10 digits.";
        } else if (
          newValue.length === 10 &&
          !/^9\d{9}$/.test(newValue)
        ) {
          error =
            "Phone number must start with 9 and contain exactly 10 digits.";
        }
      }

      /* Weekdays */
      else if (key === "hours_weekdays") {
        newValue = newValue.replace(/[^A-Za-z\s-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z\s-]+$/.test(newValue)
        ) {
          error = "Weekdays label contains invalid characters.";
        }
      }

      /* Weekday Time */
      else if (key === "hours_weekday_time") {
        newValue = newValue.replace(/[^A-Za-z0-9:\s-]/g, "");

        if (
          newValue &&
          !/^[A-Za-z0-9:\s-]+$/.test(newValue)
        ) {
          error = "Weekday hours contain invalid characters.";
        }
      }

      /* Sunday */
      else if (key === "hours_sunday") {
        newValue = newValue.replace(/[^A-Za-z\s]/g, "");

        if (
          newValue &&
          !/^[A-Za-z\s]+$/.test(newValue)
        ) {
          error = "Sunday label contains invalid characters.";
        }
      }

      /* Sunday Note */
      else if (key === "hours_sunday_note") {
        newValue = newValue.replace(/[^\p{L}0-9\s&:.,'()-]/gu, "");

        if (
          newValue &&
          !/^[\p{L}0-9\s&:.,'()-]+$/u.test(newValue)
        ) {
          error =
            "Only letters, numbers, spaces, and supported punctuation are allowed.";
        }
      }

      /* Hero Statistic Values */
      else if (
        key === "hero_stat1_value" ||
        key === "hero_stat2_value" ||
        key === "hero_stat3_value"
      ) {
        newValue = newValue.replace(/[^0-9%+]/g, "");

        if (newValue && !/^\d+[%+]?$/.test(newValue)) {
          error =
            "Only numbers with an optional % or + symbol are allowed.";
        }
      }

      /* Hero Labels */
      else if (
        key === "hero_eyebrow" ||
        key === "hero_heading" ||
        key === "hero_description" ||
        key === "hero_button_label" ||
        key === "hero_stat1_label" ||
        key === "hero_stat2_label" ||
        key === "hero_stat3_label" ||
        key === "hero_dentist_name" ||
        key === "hero_dentist_title" ||
        key === "hero_booking_title" ||
        key === "hero_booking_subtitle"
      ) {
        newValue = newValue.replace(/[^\p{L}\s&.,'()!?:-]/gu, "");

        if (newValue && !/^[\p{L}\s&.,'()!?:-]+$/u.test(newValue)) {
          error =
            "Only letters, spaces, and supported punctuation are allowed.";
        }
      }

      else if (
        key === "about_hero_tag" ||
        key === "about_hero_title" ||
        key === "about_hero_description" ||
        key === "hero_card_title" ||
        key === "hero_card_description" ||
        key === "who_we_are_tag" ||
        key === "who_we_are_title" ||
        key === "who_we_are_description" ||
        key === "mission_title" ||
        key === "vision_title" ||
        key === "care_title" ||
        key === "team_section_tag" ||
        key === "team_section_title" ||
        key === "team_section_description" ||
        key === "branch_section_tag" ||
        key === "branch_section_title" ||
        key === "map_section_tag" ||
        key === "map_section_title" ||
        key === "owner_label" ||
        key === "owner_name" ||
        key === "owner_position" ||
        key === "doctor1_name" ||
        key === "doctor1_position" ||
        key === "doctor2_name" ||
        key === "doctor2_position" ||
        key === "assistant1_name" ||
        key === "assistant1_position" ||
        key === "assistant2_name" ||
        key === "assistant2_position" ||
        key === "branch_count_label" ||
        key === "care_team_count_label"
      ) {
        if (
          newValue &&
          !/^[\p{L}0-9\s&.,'()!?:/%+\-]+$/u.test(newValue.trim())
        ) {
          error =
            "Only letters, numbers, spaces, and supported punctuation are allowed.";
        }
      }

      else if (
        key === "owner_message_1" ||
        key === "owner_message_2" ||
        key === "mission_content" ||
        key === "vision_content" ||
        key === "care_content" ||
        key === "map_section_description"
      ) {
        if (
          newValue &&
          !/^[\p{L}0-9\s&.,'"()!?:;%+\-\/\n\r]+$/u.test(newValue)
        ) {
          error =
            "Only letters, numbers, spaces, and supported punctuation are allowed.";
        }
      }

      else if (
        key === "makati_branch_name" ||
        key === "las_pinas_branch_name" ||
        key === "makati_branch_status" ||
        key === "las_pinas_branch_status" ||
        key === "makati_branch_address" ||
        key === "las_pinas_branch_address" ||
        key === "makati_branch_landmark" ||
        key === "makati_branch_hours" ||
        key === "las_pinas_branch_hours" ||
        key === "makati_branch_schedule" ||
        key === "makati_branch_map_button" ||
        key === "las_pinas_branch_map_button"
      ) {
        if (
          newValue &&
          !/^[\p{L}0-9\s&.,'"()!?:#/%+\-]+$/u.test(newValue)
        ) {
          error =
            "Only letters, numbers, spaces, and supported punctuation are allowed.";
        }
      }

      setWebsiteContentForm((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      setWebsiteContentErrors((prev) => ({
        ...prev,
        [key]: error,
      }));
    };

    return (
      <div
        key={key}
        style={{
          ...styles.websiteFieldRow,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginBottom: 14,
        }}
      >
        <label
          style={{
            ...styles.websiteFieldLabel,
            marginBottom: 6,
          }}
        >
          {label}
        </label>

        {websiteContentEditing ? (
          type === "textarea" ? (
            <textarea
              value={value}
              rows={3}
              onChange={(event) => handleChange(event.target.value)}
              style={{
                ...styles.formInput,
                ...styles.websiteTextarea,
                width: "100%",
                boxSizing: "border-box",
                borderColor: showError ? "#dc2626" : "#d1d5db",
              }}
            />
          ) : type === "select" ? (
            <select
              value={value}
              onChange={(event) => handleChange(event.target.value)}
              style={{
                ...styles.formInput,
                width: "100%",
                boxSizing: "border-box",
                borderColor: showError ? "#dc2626" : "#d1d5db",
              }}
            >
              <option value="">Select {label}</option>

              {options.map((option) => {
                const optionValue =
                  typeof option === "string"
                    ? option
                    : option.value;

                const optionLabel =
                  typeof option === "string"
                    ? option
                    : option.label;

                return (
                  <option
                    key={optionValue}
                    value={optionValue}
                  >
                    {optionLabel}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type={type}
              value={inputValue}
              onChange={(event) => {
                let newValue = event.target.value;

                if (
                  key === "contact_phone1" ||
                  key === "contact_phone2"
                ) {
                  newValue = newValue.replace(/\D/g, "");

                  if (
                    newValue.length > 0 &&
                    !newValue.startsWith("9")
                  ) {
                    return;
                  }

                  newValue = newValue.slice(0, 10);
                }

                handleChange(newValue);
              }}
              inputMode={
                key === "contact_phone1" ||
                key === "contact_phone2"
                  ? "numeric"
                  : undefined
              }
              maxLength={
                key === "contact_phone1" ||
                key === "contact_phone2"
                  ? 10
                  : undefined
              }
              style={{
                ...styles.formInput,
                width: "100%",
                boxSizing: "border-box",
                borderColor: showError ? "#dc2626" : "#d1d5db",
              }}
            />
          )
        ) : (
          <div
            style={{
              ...styles.formInput,
              ...styles.readOnlyInput,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {value || (
              <span style={{ color: "#94a3b8" }}>
                —
              </span>
            )}
          </div>
        )}

        {showError && (
          <div
            style={{
              color: "#dc2626",
              fontSize: 12,
              marginTop: 5,
              lineHeight: 1.3,
            }}
          >
            {showError}
          </div>
        )}
      </div>
    );
  };

  const textDesignFields = (prefix, label) => (
    <>
      {fieldRow(`${label} Font Family`, `${prefix}_font_family`, "select", fontFamilyOptions)}

      {fieldRow(`${label} Font Size`, `${prefix}_font_size`, "select", fontSizeOptions)}

      {fieldRow(`${label} Font Weight`, `${prefix}_font_weight`, "select", fontWeightOptions)}

      {fieldRow(`${label} Font Style`, `${prefix}_font_style`, "select",
        [
          { value: "normal", label: "Normal" },
          { value: "italic", label: "Italic" },
        ]
      )}

      {fieldRow(`${label} Text Color`, `${prefix}_text_color`, "color")}

      {fieldRow(`${label} Text Alignment`, `${prefix}_text_alignment`, "select", textAlignOptions)}
    </>
  );

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [onlineInquiries, setOnlineInquiries] = useState([]);
  const [websiteTab, setWebsiteTab] = useState('content');

  const [websiteHeroSaveConfirmModal, setWebsiteHeroSaveConfirmModal] = useState(null);
  const [websiteMessageModal, setWebsiteMessageModal] = useState(null);
  const [websiteContentClearConfirmModal, setWebsiteContentClearConfirmModal] = useState(null);
  const [websiteContentErrors, setWebsiteContentErrors] = useState({});
  const [websiteAboutOverlay, setWebsiteAboutOverlay] = useState(null);
  const [websiteAboutSaveConfirmModal, setWebsiteAboutSaveConfirmModal] = useState(null);
  const [websiteServiceSaveConfirmModal, setWebsiteServiceSaveConfirmModal] = useState(null);
  const [websiteContent, setWebsiteContent] = useState({});
  const [websiteFaqs, setWebsiteFaqs] = useState([]);
  const [websiteServices, setWebsiteServices] = useState([]);
  const [websiteAnnouncements, setWebsiteAnnouncements] = useState([]);
  const [websiteContentSection, setWebsiteContentSection] = useState('logo');
  const [websiteContentForm, setWebsiteContentForm] = useState({});
  const [websiteContentSaving, setWebsiteContentSaving] = useState(false);
  const [websiteContentEditing, setWebsiteContentEditing] = useState(false);
  const [showWebsiteContentCancelConfirmModal, setShowWebsiteContentCancelConfirmModal] = useState(false);
  const [websiteContentSaveConfirmModal, setWebsiteContentSaveConfirmModal] = useState(null);
  const [websiteServiceSaving, setWebsiteServiceSaving] = useState(false);
  const [websiteContentMsg, setWebsiteContentMsg] = useState({ text: '', type: '' });
  const [websiteValidationModal, setWebsiteValidationModal] = useState(null);
  const [websiteFaqOverlay, setWebsiteFaqOverlay] = useState(null);
  const [websiteServiceOverlay, setWebsiteServiceOverlay] = useState(null);
  const [websiteAnnouncementOverlay, setWebsiteAnnouncementOverlay] = useState(null);
  const [cancellationPolicyEditing, setCancellationPolicyEditing] = useState(false);
  const [cancellationPolicyMessage, setCancellationPolicyMessage] = useState('');
  const [cancellationPolicyDraft, setCancellationPolicyDraft] = useState('');
  const [cancellationPolicySaving, setCancellationPolicySaving] = useState(false);
  const [showCancellationPolicyCancelConfirmModal, setShowCancellationPolicyCancelConfirmModal] = useState(false);
  const [cancellationPolicySaveConfirmModal, setCancellationPolicySaveConfirmModal] = useState(null);
  const [deleteAnnouncementModal, setDeleteAnnouncementModal] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState(null);
  const [deleteWebsiteServiceModal, setDeleteWebsiteServiceModal] = useState(false);
  const [deleteWebsiteServiceId, setDeleteWebsiteServiceId] = useState(null);
  const [showBranchCancelConfirmModal, setShowBranchCancelConfirmModal] = useState(false);
  const [showBranchSaveConfirmModal, setShowBranchSaveConfirmModal] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [adminAccountForm, setAdminAccountForm] = useState(initialAdminAccountForm);
  const [adminAccountOriginal, setAdminAccountOriginal] = useState(initialAdminAccountForm);
  const [isEditingAdminAccount, setIsEditingAdminAccount] = useState(false);
  const [adminAccountPhoneCountry, setAdminAccountPhoneCountry] = useState('PH');
  const [adminAccountOriginalPhoneCountry, setAdminAccountOriginalPhoneCountry] = useState('PH');
  const [adminAccountTouchedFields, setAdminAccountTouchedFields] = useState({});
  const [adminAccountMessage, setAdminAccountMessage] = useState('');
  const [adminAccountError, setAdminAccountError] = useState('');
  const [showAdminAccountCancelConfirmModal, setShowAdminAccountCancelConfirmModal] = useState(false);
  const [adminAccountSaveConfirmModal, setAdminAccountSaveConfirmModal] = useState(null);
  const [adminProfilePhotoUploading, setAdminProfilePhotoUploading] = useState(false);
  const [adminPhotoRemoveConfirm, setAdminPhotoRemoveConfirm] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);

  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [branchPhoneCountry, setBranchPhoneCountry] = useState('PH');
  const [branchTouchedFields, setBranchTouchedFields] = useState({});
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [serviceTouchedFields, setServiceTouchedFields] = useState({});
  const [serviceCategoryMode, setServiceCategoryMode] = useState('select');
  const [showServiceCancelConfirmModal, setShowServiceCancelConfirmModal] = useState(false);
  const [showServiceSaveConfirmModal, setShowServiceSaveConfirmModal] = useState(false);
  const [serviceKitOverlay, setServiceKitOverlay] = useState(false);
  const [serviceKitServiceId, setServiceKitServiceId] = useState('');
  const [serviceKitBranchId, setServiceKitBranchId] = useState('');
  const [serviceKitItems, setServiceKitItems] = useState([]);
  const [serviceKitItemErrors, setServiceKitItemErrors] = useState([]);
  const [showServiceKitCancelConfirmModal, setShowServiceKitCancelConfirmModal] = useState(false);
  const [showServiceKitSaveConfirmModal, setShowServiceKitSaveConfirmModal] = useState(false);
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
  const adminProfilePhotoInputRef = useRef(null);

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
  ) &&
    !validatePhoneNumber(branchForm.phone, branchPhoneCountry) &&
    BRANCH_OPERATING_HOURS_REGEX.test(String(branchForm.operating_hours || '').trim());

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
      websiteServiceSaveConfirmModal ||
      websiteAboutSaveConfirmModal ||
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
        setWebsiteServiceSaveConfirmModal(null);
        setWebsiteAboutSaveConfirmModal(null);
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

  function validateWebsiteField(key, value) {
    value = String(value ?? "");

    switch (key) {
      case "footer_brand_name":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z\s&.'-]+$/.test(value.trim())) {
          return "Brand name contains invalid characters.";
        }
        break;

      case "footer_team_name":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z\s&:.,'()-]+$/.test(value.trim())) {
          return "Team name contains invalid characters.";
        }
        break;

      case "footer_system_name":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z\s&:.,'()-]+$/.test(value.trim())) {
          return "System name contains invalid characters.";
        }
        break;

      case "contact_tagline":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(value.trim())) {
          return "Clinic tagline contains invalid characters.";
        }
        break;

      case "contact_badge":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(value.trim())) {
          return "Contact badge contains invalid characters.";
        }
        break;

      case "contact_heading":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(value.trim())) {
          return "Contact heading contains invalid characters.";
        }
        break;

      case "contact_button":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(value.trim())) {
          return "Button label contains invalid characters.";
        }
        break;

      case "contact_email":
        if (!value.trim()) return "This field is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Enter a valid email address.";
        }
        break;

      case "contact_facebook_name":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z\s&.'-]+$/.test(value.trim())) {
          return "Facebook page name contains invalid characters.";
        }
        break;

      case "contact_facebook_url":
        if (!value.trim()) return "This field is required.";
        if (!/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i.test(value.trim())) {
          return "Enter a valid Facebook URL.";
        }
        break;

      case "contact_phone1":
      case "contact_phone2":
        if (!value) return "This field is required.";
        if (!/^9\d{9}$/.test(value)) {
          return "Phone number must start with 9 and contain exactly 10 digits.";
        }
        break;

      case "hours_weekdays":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z\s-]+$/.test(value.trim())) {
          return "Weekdays label contains invalid characters.";
        }
        break;

      case "hours_weekday_time":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z0-9:\s-]+$/.test(value.trim())) {
          return "Weekday hours contain invalid characters.";
        }
        break;

      case "hours_sunday":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z\s]+$/.test(value.trim())) {
          return "Sunday label contains invalid characters.";
        }
        break;

      case "hours_sunday_note":
        if (!value.trim()) return "This field is required.";
        if (!/^[A-Za-z0-9\s&:.,'()-]+$/.test(value.trim())) {
          return "Sunday note contains invalid characters.";
        }
        break;
    }

    return "";
  }

  function validateWebsiteFields(sectionFields, requiredKeys = []) {
    const errors = {};

    requiredKeys.forEach((key) => {
      const value = sectionFields[key];
      const error = validateWebsiteField(key, value);

      if (error) {
        errors[key] = error;
      }
    });

    Object.entries(sectionFields).forEach(([key, value]) => {
      if (errors[key]) return;

      const error = validateWebsiteField(key, value);

      if (error) {
        errors[key] = error;
      }
    });

    setWebsiteContentErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function saveWebsiteContent(sectionFields, requiredKeys = []) {
    if (!validateWebsiteFields(sectionFields, requiredKeys)) {
      return;
    }

    setWebsiteContentSaving(true);
    setWebsiteContentMsg({ text: "", type: "" });

    try {
      const res = await api.put("/website/content", { fields: sectionFields });
      const updated = res.data.content || {};

      setWebsiteContent(updated);
      setWebsiteContentForm(updated);
      setWebsiteContentEditing(false);

      showWebsiteValidationModal(
        "Content Saved",
        "Website content has been updated successfully.",
        "success"
      );
    } catch (err) {
      showWebsiteValidationModal(
        "Save Failed",
        err.response?.data?.message || "Failed to save website content."
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

  function confirmWebsiteContentClear() {
    if (!websiteContentClearConfirmModal) return;

    const clearedFields = {};

    Object.keys(
      websiteContentClearConfirmModal.sectionFields
    ).forEach((key) => {
      if (key === "website_logo_fit") {
        clearedFields[key] = "contain";
      } else {
        clearedFields[key] = "";
      }
    });

    setWebsiteContentForm((prev) => ({
      ...prev,
      ...clearedFields,
    }));

    setWebsiteContent((prev) => ({
      ...prev,
      ...clearedFields,
    }));

    setWebsiteContentClearConfirmModal(null);
  }

  function handleWebsiteContentClearRequest(sectionFields) {

    setWebsiteContentClearConfirmModal({
      sectionFields,
    });
  }

  function handleWebsiteHeroSaveRequest(sectionFields, requiredKeys = []) {
    const isValid = validateWebsiteFields(sectionFields, requiredKeys);

    if (!isValid) {
      setTimeout(() => {
        showWebsiteValidationModal(
          "Validation Error",
          "Please correct the highlighted fields before saving."
        );
      }, 0);

      return;
    }

    const details = Object.entries(sectionFields).map(([key, value]) => ({
      key,
      label: formatWebsiteContentFieldLabel(key),
      value: String(value ?? "").trim() || "Not entered",
      previousValue: String(websiteContent[key] ?? "").trim() || "Not set",
      changed:
        String(value ?? "").trim() !==
        String(websiteContent[key] ?? "").trim(),
    }));

    if (!details.some((detail) => detail.changed)) {
      showWebsiteValidationModal(
        "No Changes Detected",
        "There are no changes to save."
      );

      return;
    }

    setWebsiteHeroSaveConfirmModal({
      details: details.filter((detail) => detail.changed),
      sectionFields,
      requiredKeys,
    });
  }

  async function confirmWebsiteHeroSave() {
    if (!websiteHeroSaveConfirmModal) {
      return;
    }

    const { sectionFields, requiredKeys } =
      websiteHeroSaveConfirmModal;

    setWebsiteHeroSaveConfirmModal(null);

    await saveWebsiteContent(
      sectionFields,
      requiredKeys
    );
  }

  function handleWebsiteContentSaveRequest(sectionFields, requiredKeys = []) {
    const isValid = validateWebsiteFields(sectionFields, requiredKeys);

    if (!isValid) {
      setTimeout(() => {
        showWebsiteValidationModal(
          "Validation Error",
          "Please correct the highlighted fields before saving."
        );
      }, 0);

      return;
    }

    const details = Object.entries(sectionFields).map(([key, value]) => ({
      key,
      label: formatWebsiteContentFieldLabel(key),
      value: String(value ?? "").trim() || "Not entered",
      previousValue: String(websiteContent[key] ?? "").trim() || "Not set",
      changed:
        String(value ?? "").trim() !==
        String(websiteContent[key] ?? "").trim(),
    }));

    if (!details.some((detail) => detail.changed)) {
      showWebsiteValidationModal(
        "No Changes Detected",
        "There are no changes to save."
      );

      return;
    }

    setWebsiteContentSaveConfirmModal({
      details: details.filter((detail) => detail.changed),
      sectionFields,
      requiredKeys,
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

  async function confirmWebsiteAboutSave() {
    if (!websiteAboutSaveConfirmModal)
      return;

    await saveWebsiteContent(
      websiteAboutSaveConfirmModal.data,
      [
        "about_hero_tag",
        "about_hero_title",
        "about_hero_description",
        "hero_card_title",
        "hero_card_description",
        "who_we_are_tag",
        "who_we_are_title",
        "who_we_are_description",
        "mission_title",
        "mission_content",
        "vision_title",
        "vision_content",
        "care_title",
        "care_content",
        "team_section_tag",
        "team_section_title",
        "team_section_description",
        "owner_label",
        "owner_name",
        "owner_position",
        "owner_message_1",
        "owner_message_2",
        "branch_section_tag",
        "branch_section_title",
        "map_section_tag",
        "map_section_title",
        "map_section_description",
      ]
    );

    setWebsiteAboutSaveConfirmModal(null);
  }

  async function saveWebsiteService(data) {
    try {
      setWebsiteServiceSaving(true);

      const formData = new FormData();

      [
        "name",
        "intro",
        "heading",
        "overview",
        "benefits",
        "process",
        "care",
        "duration",
        "ideal_for",
        "reminder",
        "description",
        "slug",
        "sort_order",
        "status",
      ].forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Service Image
      if (data.image_path instanceof File) {
        formData.append("image_path", data.image_path);
      } else {
        formData.append("image_path", data.image_path || "");
      }

      // Before Image
      if (data.before_image instanceof File) {
        formData.append("before_image", data.before_image);
      } else {
        formData.append("before_image", data.before_image || "");
      }

      // After Image
      if (data.after_image instanceof File) {
        formData.append("after_image", data.after_image);
      } else {
        formData.append("after_image", data.after_image || "");
      }

      let res;

      if (data.id) {
        res = await api.put(
          `/website/website-services/${data.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await api.post(
          "/website/website-services",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setWebsiteServices(res.data.services || []);
      setWebsiteServiceOverlay(null);
      setWebsiteServiceSaveConfirmModal(null);
    } catch (err) {
      console.error("Update website service error:", err);

      showWebsiteValidationModal(
        "Save Failed",
        err.response?.data?.message || "Failed to update website service."
      );
    } finally {
      setWebsiteServiceSaving(false);
    }
  }

  async function confirmWebsiteServiceSave() {
    if (!websiteServiceSaveConfirmModal) 
      return;

    await saveWebsiteService(websiteServiceSaveConfirmModal.data);

    setWebsiteServiceSaveConfirmModal(null);
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
      title: String(data.title || "").trim(),
      message: String(data.message || "").trim(),

      title_font_family: data.title_font_family || "",
      title_font_size: data.title_font_size || "",
      title_font_weight: data.title_font_weight || "",
      title_color: data.title_color || "#000000",
      title_alignment: data.title_alignment || "left",

      message_font_family: data.message_font_family || "",
      message_font_size: data.message_font_size || "",
      message_font_weight: data.message_font_weight || "",
      message_color: data.message_color || "#000000",
      message_alignment: data.message_alignment || "left",

      start_date: data.start_date || "",
      start_time: data.start_time || "",
      end_date: data.end_date || "",
      end_time: data.end_time || "",
      status: data.status || "active",
    };

    if (
      !payload.title ||
      !payload.message ||
      !payload.start_date ||
      !payload.start_time ||
      !payload.end_date ||
      !payload.end_time
    ) {
      showWebsiteValidationModal(
        "Required Fields Missing",
        "Please complete the announcement title, message, start date, start time, end date, and end time."
      );

      return;
    }

    const startDateTime = new Date(`${payload.start_date}T${payload.start_time}`);

    const endDateTime = new Date(`${payload.end_date}T${payload.end_time}`);

    if (endDateTime < startDateTime) {
      showWebsiteValidationModal(
        "Invalid Date Range",
        "End date and time must be the same as or later than the start date and time."
      );

      return;
    }

    try {
      if (data.id) {
        const res = await api.put(`/website/announcements/${data.id}`, payload);

        setWebsiteAnnouncements(res.data.announcements || []);
      } else {
        const res = await api.post("/website/announcements", payload);

        setWebsiteAnnouncements(res.data.announcements || []);
      }

      setWebsiteAnnouncementOverlay(null);

      showWebsiteValidationModal(
        "Announcement Saved",
        "Website announcement has been saved successfully.",
        "success"
      );
    } catch (err) {
      showWebsiteValidationModal(
        "Save Failed",
        err.response?.data?.message || "Failed to save announcement."
      );
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
        profilePhotoUrl: res.data.profile_photo_url || '',
      };
      setAdminAccountForm(loadedAdminAccount);
      setAdminAccountOriginal(loadedAdminAccount);
      publishAdminProfilePhoto(profileFileUrl(loadedAdminAccount.profilePhotoUrl));
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

    if (name === 'operating_hours') {
      const value = String(branchForm.operating_hours || '').trim();
      return (
        branchTouchedFields[name] &&
        (!value || !BRANCH_OPERATING_HOURS_REGEX.test(value))
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

  function getBranchOperatingHoursError() {
    if (!branchTouchedFields.operating_hours) {
      return '';
    }

    const value = String(branchForm.operating_hours || '').trim();
    if (!value) {
      return 'This field is required.';
    }

    if (!BRANCH_OPERATING_HOURS_REGEX.test(value)) {
      return `Follow this format: ${BRANCH_OPERATING_HOURS_FORMAT}`;
    }

    return '';
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
    const resolvedServiceId = service?.id ? String(service.id) : '';
    if (!services.length) return alert('No service available.');

    const branchId = Number(branches?.[0]?.id || 0);
    if (!branchId) return alert('No branch available.');

    setServiceKitOverlay(true);
    setServiceKitBranchId(String(branchId));
    setServiceKitServiceId(resolvedServiceId);
    setServiceKitItems([]);
    setServiceKitItemErrors([]);
    setServiceKitServicesForBranch(services);

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

      setServiceKitServicesForBranch(services);

      if (resolvedServiceId) {
        const data = await getManageServiceKit(Number(resolvedServiceId), branchId);
        setServiceKitItems((data.items || []).map((item) => ({
          category: item.category,
          item_name: item.item_name,
          default_quantity: String(item.default_quantity || ''),
          current_stock: item.current_stock,
        })));
        setServiceKitItemErrors(
          (data.items || []).map(() => ({ category: '', item_name: '', default_quantity: '' }))
        );
      }
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

      setServiceKitServicesForBranch(services);
      setServiceKitServiceId('');
      setServiceKitItems([]);
      setServiceKitItemErrors([]);
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
      if (field === 'default_quantity' || field === 'current_stock') {
        const n = Number(
          field === 'default_quantity'
            ? value || 0
            : serviceKitItems[index]?.default_quantity || 0
        );
        const stock = field === 'current_stock' ? value : serviceKitItems[index]?.current_stock;
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
      setServiceKitServiceId('');
      setServiceKitItems([]);
      setServiceKitItemErrors([]);
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
        profilePhotoUrl: updated.profile_photo_url || adminAccountForm.profilePhotoUrl || '',
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
        profilePhotoUrl: updated.profile_photo_url || adminAccountForm.profilePhotoUrl || '',
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

  async function patchAdminProfilePhoto(data, fallbackMessage) {
    setAdminProfilePhotoUploading(true);
    setAdminAccountError('');
    setAdminAccountMessage('');

    try {
      const res = await api.patch('/auth/me', data);
      const updated = res.data.user || {};
      const nextPhotoUrl = profileFileUrl(updated.profile_photo_url || '');
      publishAdminProfilePhoto(nextPhotoUrl);
      setAdminAccountForm((prev) => ({
        ...prev,
        profilePhotoUrl: updated.profile_photo_url || '',
      }));
      setAdminAccountOriginal((prev) => ({
        ...prev,
        profilePhotoUrl: updated.profile_photo_url || '',
      }));
      setAdminAccountMessage(res.data.message || fallbackMessage);
      setAdminPhotoRemoveConfirm(false);
    } catch (err) {
      setAdminAccountError(err.response?.data?.message || fallbackMessage);
    } finally {
      setAdminProfilePhotoUploading(false);
      if (adminProfilePhotoInputRef.current) adminProfilePhotoInputRef.current.value = '';
    }
  }

  function handleAdminProfilePhotoFile(file) {
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setAdminAccountError('Profile photo must be a JPG or PNG file.');
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      setAdminAccountError('Profile photo must be 5MB or smaller.');
      return;
    }

    const data = new FormData();
    data.append('profilePhoto', file);
    patchAdminProfilePhoto(data, 'Admin profile photo updated.');
  }

  function confirmRemoveAdminPhoto() {
    const data = new FormData();
    data.append('removeProfilePhoto', JSON.stringify(true));
    patchAdminProfilePhoto(data, 'Admin profile photo removed.');
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

  function handleWebsiteAboutSaveRequest(data) {
    const details = [
      {
        key: "about_hero_tag",
        label: "Hero Tag",
        value: data.about_hero_tag || "Not entered",
        previousValue: websiteContent.about_hero_tag || "Not set",
        changed: data.about_hero_tag !== websiteContent.about_hero_tag,
      },
      {
        key: "about_hero_title",
        label: "Hero Title",
        value: data.about_hero_title || "Not entered",
        previousValue: websiteContent.about_hero_title || "Not set",
        changed: data.about_hero_title !== websiteContent.about_hero_title,
      },
      {
        key: "about_hero_description",
        label: "Hero Description",
        value: data.about_hero_description || "Not entered",
        previousValue: websiteContent.about_hero_description || "Not set",
        changed: data.about_hero_description !== websiteContent.about_hero_description,
      },
      {
        key: "hero_card_title",
        label: "Hero Card Title",
        value: data.hero_card_title || "Not entered",
        previousValue: websiteContent.hero_card_title || "Not set",
        changed: data.hero_card_title !== websiteContent.hero_card_title,
      },
      {
        key: "hero_card_description",
        label: "Hero Card Description",
        value: data.hero_card_description || "Not entered",
        previousValue: websiteContent.hero_card_description || "Not set",
        changed: data.hero_card_description !== websiteContent.hero_card_description,
      },
      {
        key: "who_we_are_tag",
        label: "Who We Are Tag",
        value: data.who_we_are_tag || "Not entered",
        previousValue: websiteContent.who_we_are_tag || "Not set",
        changed: data.who_we_are_tag !== websiteContent.who_we_are_tag,
      },
      {
        key: "who_we_are_title",
        label: "Who We Are Title",
        value: data.who_we_are_title || "Not entered",
        previousValue: websiteContent.who_we_are_title || "Not set",
        changed: data.who_we_are_title !== websiteContent.who_we_are_title,
      },
      {
        key: "who_we_are_description",
        label: "Who We Are Description",
        value: data.who_we_are_description || "Not entered",
        previousValue: websiteContent.who_we_are_description || "Not set",
        changed: data.who_we_are_description !== websiteContent.who_we_are_description,
      },
      {
        key: "mission_title",
        label: "Mission Title",
        value: data.mission_title || "Not entered",
        previousValue: websiteContent.mission_title || "Not set",
        changed: data.mission_title !== websiteContent.mission_title,
      },
      {
        key: "mission_content",
        label: "Mission Content",
        value: data.mission_content || "Not entered",
        previousValue: websiteContent.mission_content || "Not set",
        changed: data.mission_content !== websiteContent.mission_content,
      },
      {
        key: "vision_title",
        label: "Vision Title",
        value: data.vision_title || "Not entered",
        previousValue: websiteContent.vision_title || "Not set",
        changed: data.vision_title !== websiteContent.vision_title,
      },
      {
        key: "vision_content",
        label: "Vision Content",
        value: data.vision_content || "Not entered",
        previousValue: websiteContent.vision_content || "Not set",
        changed: data.vision_content !== websiteContent.vision_content,
      },
      {
        key: "care_title",
        label: "Care Title",
        value: data.care_title || "Not entered",
        previousValue: websiteContent.care_title || "Not set",
        changed: data.care_title !== websiteContent.care_title,
      },
      {
        key: "care_content",
        label: "Care Content",
        value: data.care_content || "Not entered",
        previousValue: websiteContent.care_content || "Not set",
        changed: data.care_content !== websiteContent.care_content,
      },
      {
        key: "team_section_tag",
        label: "Team Section Tag",
        value: data.team_section_tag || "Not entered",
        previousValue: websiteContent.team_section_tag || "Not set",
        changed: data.team_section_tag !== websiteContent.team_section_tag,
      },
      {
        key: "team_section_title",
        label: "Team Section Title",
        value: data.team_section_title || "Not entered",
        previousValue: websiteContent.team_section_title || "Not set",
        changed: data.team_section_title !== websiteContent.team_section_title,
      },
      {
        key: "team_section_description",
        label: "Team Section Description",
        value: data.team_section_description || "Not entered",
        previousValue: websiteContent.team_section_description || "Not set",
        changed: data.team_section_description !== websiteContent.team_section_description,
      },
      {
        key: "owner_label",
        label: "Owner Label",
        value: data.owner_label || "Not entered",
        previousValue: websiteContent.owner_label || "Not set",
        changed: data.owner_label !== websiteContent.owner_label,
      },
      {
        key: "owner_name",
        label: "Owner Name",
        value: data.owner_name || "Not entered",
        previousValue: websiteContent.owner_name || "Not set",
        changed: data.owner_name !== websiteContent.owner_name,
      },
      {
        key: "owner_position",
        label: "Owner Position",
        value: data.owner_position || "Not entered",
        previousValue: websiteContent.owner_position || "Not set",
        changed: data.owner_position !== websiteContent.owner_position,
      },
      {
        key: "owner_message_1",
        label: "Owner Message 1",
        value: data.owner_message_1 || "Not entered",
        previousValue: websiteContent.owner_message_1 || "Not set",
        changed: data.owner_message_1 !== websiteContent.owner_message_1,
      },
      {
        key: "owner_message_2",
        label: "Owner Message 2",
        value: data.owner_message_2 || "Not entered",
        previousValue: websiteContent.owner_message_2 || "Not set",
        changed: data.owner_message_2 !== websiteContent.owner_message_2,
      },
      {
        key: "branch_section_tag",
        label: "Branch Section Tag",
        value: data.branch_section_tag || "Not entered",
        previousValue: websiteContent.branch_section_tag || "Not set",
        changed: data.branch_section_tag !== websiteContent.branch_section_tag,
      },
      {
        key: "branch_section_title",
        label: "Branch Section Title",
        value: data.branch_section_title || "Not entered",
        previousValue: websiteContent.branch_section_title || "Not set",
        changed: data.branch_section_title !== websiteContent.branch_section_title,
      },
      {
        key: "map_section_tag",
        label: "Map Section Tag",
        value: data.map_section_tag || "Not entered",
        previousValue: websiteContent.map_section_tag || "Not set",
        changed: data.map_section_tag !== websiteContent.map_section_tag,
      },
      {
        key: "map_section_title",
        label: "Map Section Title",
        value: data.map_section_title || "Not entered",
        previousValue: websiteContent.map_section_title || "Not set",
        changed: data.map_section_title !== websiteContent.map_section_title,
      },
      {
        key: "map_section_description",
        label: "Map Section Description",
        value: data.map_section_description || "Not entered",
        previousValue: websiteContent.map_section_description || "Not set",
        changed: data.map_section_description !== websiteContent.map_section_description,
      },
    ];

    setWebsiteAboutSaveConfirmModal({
      data,
      details,
      changedFields: details.filter((item) => item.changed),
    });
  }

  function handleWebsiteServiceSaveRequest(data) {
    const duplicateService = websiteServices.find(
      (service) =>
        Number(service.sort_order) === Number(data.sort_order) &&
        Number(service.id) !== Number(websiteServiceOverlay?.id)
    );

    if (duplicateService) {
      showWebsiteValidationModal(
        "Sort Order Already Exists",
        `Sort order ${data.sort_order} is already assigned to "${duplicateService.name}". Please choose a different sort order.`
      );
      return;
    }

    const details = [
      {
        key: "name",
        label: "Service Name",
        value: data.name || "Not entered",
        previousValue: websiteServiceOverlay?.name || "Not set",
        changed: data.name !== websiteServiceOverlay?.name,
      },
      {
        key: "image_path",
        label: "Service Image",
        value: data.image_path instanceof File ? data.image_path.name : "No change",
        previousValue: websiteServiceOverlay?.image_path || "Not set",
        changed: data.image_path instanceof File,
      },
      {
        key: "before_image",
        label: "Before Image",
        value: data.before_image instanceof File ? data.before_image.name : "No change",
        previousValue: websiteServiceOverlay?.before_image || "Not set",
        changed: data.before_image instanceof File,
      },
      {
        key: "after_image",
        label: "After Image",
        value: data.after_image instanceof File ? data.after_image.name : "No change",
        previousValue: websiteServiceOverlay?.after_image || "Not set",
        changed: data.after_image instanceof File,
      },
      {
        key: "intro",
        label: "Hero Introduction",
        value: data.intro || "Not entered",
        previousValue: websiteServiceOverlay?.intro || "Not set",
        changed: data.intro !== websiteServiceOverlay?.intro,
      },
      {
        key: "heading",
        label: "Main Heading",
        value: data.heading || "Not entered",
        previousValue: websiteServiceOverlay?.heading || "Not set",
        changed: data.heading !== websiteServiceOverlay?.heading,
      },
      {
        key: "overview",
        label: "Overview",
        value: data.overview || "Not entered",
        previousValue: websiteServiceOverlay?.overview || "Not set",
        changed: String(data.overview ?? "").trim() !== String(websiteServiceOverlay?.overview ?? "").trim(),
      },
      {
        key: "benefits",
        label: "Benefits",
        value: data.benefits || "Not entered",
        previousValue: websiteServiceOverlay?.benefits || "Not set",
        changed: data.benefits !== websiteServiceOverlay?.benefits,
      },
      {
        key: "process",
        label: "Treatment Process",
        value: data.process || "Not entered",
        previousValue: websiteServiceOverlay?.process || "Not set",
        changed: data.process !== websiteServiceOverlay?.process,
      },
      {
        key: "care",
        label: "Aftercare Tips",
        value: data.care || "Not entered",
        previousValue: websiteServiceOverlay?.care || "Not set",
        changed: data.care !== websiteServiceOverlay?.care,
      },
      {
        key: "duration",
        label: "Estimated Duration",
        value: data.duration || "Not entered",
        previousValue: websiteServiceOverlay?.duration || "Not set",
        changed: data.duration !== websiteServiceOverlay?.duration,
      },
      {
        key: "ideal_for",
        label: "Best For",
        value: data.ideal_for || "Not entered",
        previousValue: websiteServiceOverlay?.ideal_for || "Not set",
        changed: data.ideal_for !== websiteServiceOverlay?.ideal_for,
      },
      {
        key: "reminder",
        label: "Important Reminder",
        value: data.reminder || "Not entered",
        previousValue: websiteServiceOverlay?.reminder || "Not set",
        changed: data.reminder !== websiteServiceOverlay?.reminder,
      },
      {
        key: "description",
        label: "Card Description",
        value: data.description || "Not entered",
        previousValue: websiteServiceOverlay?.description || "Not set",
        changed: data.description !== websiteServiceOverlay?.description,
      },
      {
        key: "slug",
        label: "Slug",
        value: data.slug || "Not entered",
        previousValue: websiteServiceOverlay?.slug || "Not set",
        changed: data.slug !== websiteServiceOverlay?.slug,
      },
      {
        key: "sort_order",
        label: "Sort Order",
        value: String(data.sort_order ?? ""),
        previousValue: String(websiteServiceOverlay?.sort_order ?? ""),
        changed:
          String(data.sort_order ?? "") !==
          String(websiteServiceOverlay?.sort_order ?? ""),
      },
      {
        key: "status",
        label: "Status",
        value: data.status || "Not selected",
        previousValue: websiteServiceOverlay?.status || "Not set",
        changed: data.status !== websiteServiceOverlay?.status,
      },
    ];

    setWebsiteServiceSaveConfirmModal({
      data,
      details,
      changedFields: details.filter((item) => item.changed),
    });
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

  const collectFieldsByPrefixes = (prefixes) => {
      return Object.fromEntries(
          Object.entries(websiteContentForm).filter(([key]) =>
              prefixes.some((prefix) => key.startsWith(prefix))
          )
      );
  };

const contentEditActions = (
  sectionFields,
  requiredKeys = []
) => (
  <div style={styles.overlayActions}>
    <button
      type="button"
      style={styles.saveBtn}
      disabled={websiteContentSaving}
      onClick={() => {
        if (websiteContentSection === "hero") {
          handleWebsiteHeroSaveRequest(
            sectionFields,
            requiredKeys
          );
        } else {
          handleWebsiteContentSaveRequest(
            sectionFields,
            requiredKeys
          );
        }
      }}
    >
      {websiteContentSaving ? "Saving..." : "Save Content"}
    </button>

    <button
      type="button"
      style={styles.clearBtn}
      disabled={websiteContentSaving}
      onClick={() => handleWebsiteContentClearRequest(sectionFields)}
    >
      Clear
    </button>

    <button
      type="button"
      style={styles.secondaryBtn}
      disabled={websiteContentSaving}
      onClick={handleCancelWebsiteContentEdit}
    >
      Cancel
    </button>
  </div>
);

  function getContentSectionFields() {
    return (
      <WebsiteContentRenderer
        api={api}
        websiteContentSection={websiteContentSection}
        websiteContent={websiteContent}
        websiteContentForm={websiteContentForm}
        websiteContentErrors={websiteContentErrors}
        websiteContentEditing={websiteContentEditing}
        websiteContentSaving={websiteContentSaving}
        websiteFaqs={websiteFaqs}
        websiteServices={websiteServices}
        websiteAnnouncements={websiteAnnouncements}
        fieldRow={fieldRow}
        textDesignFields={textDesignFields}
        contentEditActions={contentEditActions}
        collectFieldsByPrefixes={collectFieldsByPrefixes}
        handleWebsiteContentSaveRequest={handleWebsiteContentSaveRequest}
        setWebsiteContent={setWebsiteContent}
        setWebsiteContentForm={setWebsiteContentForm}
        showWebsiteValidationModal={showWebsiteValidationModal}
        setWebsiteContentEditing={setWebsiteContentEditing}
        setWebsiteFaqOverlay={setWebsiteFaqOverlay}
        setWebsiteServiceOverlay={setWebsiteServiceOverlay}
        setWebsiteAnnouncementOverlay={setWebsiteAnnouncementOverlay}
        deleteFaq={deleteFaq}
        deleteAnnouncement={deleteAnnouncement}
        getStatusStyle={getStatusStyle}
        setDeleteAnnouncementId={setDeleteAnnouncementId}
        setDeleteAnnouncementModal={setDeleteAnnouncementModal}
        setDeleteWebsiteServiceId={setDeleteWebsiteServiceId}
        setDeleteWebsiteServiceModal={setDeleteWebsiteServiceModal}
        styles={styles}
      />
    );
  }


    const contentSections = [
      { key: 'logo', label: 'Logo' },
      { key: 'hero', label: 'Hero' },
      { key: 'faqs', label: 'FAQs' },
      { key: 'announcements', label: 'Announcements' },
      { key: 'clinicContact', label: 'Clinic Contact & Details' },
      { key: 'about', label: 'About Us Page' },
      { key: 'services', label: 'Services Page' },
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
                    style={{ position: "relative", padding: "8px 14px", border: "none", borderRadius: 8, background: active ? "#fef7e6" : "transparent", color: active ? "#b88900" : "#64748b", fontSize: 13, fontWeight: active ? 700 : 600, fontFamily: "Arial, sans-serif", cursor: "pointer", transition: "all .2s ease" }}
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
              <p style={{ marginBottom: 14, padding: "8px 14px", borderRadius: 8, fontSize: 13, background: websiteContentMsg.type === "success" ? "#dcfce7" : "#fee2e2", color: websiteContentMsg.type === "success" ? "#15803d" : "#dc2626" }}>
                {websiteContentMsg.text}
              </p>
            )}

            {["logo", "hero", "about", "clinicContact"].includes(websiteContentSection) && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                {!websiteContentEditing && (
                  <button
                    type="button"
                    style={styles.primaryBtn}
                    onClick={() => {
                      setWebsiteValidationModal(null);
                      setWebsiteContentErrors({});
                      setWebsiteContentMsg({ text: "", type: "" });
                      setWebsiteContentForm({ ...websiteContent });
                      setWebsiteContentEditing(true);
                    }}
                  >
                    <i className="fi fi-rr-edit"></i>
                    <span>Edit Content</span>
                  </button>
                )}
              </div>
            )}

            <WebsiteContentRenderer
              api={api}
              websiteContentSection={websiteContentSection}
              websiteContent={websiteContent}
              websiteContentForm={websiteContentForm}
              websiteContentErrors={websiteContentErrors}
              websiteContentEditing={websiteContentEditing}
              websiteContentSaving={websiteContentSaving}
              websiteFaqs={websiteFaqs}
              websiteServices={websiteServices}
              websiteAnnouncements={websiteAnnouncements}
              fieldRow={fieldRow}
              textDesignFields={textDesignFields}
              contentEditActions={contentEditActions}
              collectFieldsByPrefixes={collectFieldsByPrefixes}
              handleWebsiteContentSaveRequest={handleWebsiteContentSaveRequest}

              setWebsiteContent={setWebsiteContent}
              setWebsiteContentForm={setWebsiteContentForm}
              showWebsiteValidationModal={showWebsiteValidationModal}

              setWebsiteContentEditing={setWebsiteContentEditing}
              setWebsiteFaqOverlay={setWebsiteFaqOverlay}
              setWebsiteServiceOverlay={setWebsiteServiceOverlay}
              setWebsiteAnnouncementOverlay={setWebsiteAnnouncementOverlay}
              deleteFaq={deleteFaq}
              deleteAnnouncement={deleteAnnouncement}
              getStatusStyle={getStatusStyle}
              setDeleteAnnouncementId={setDeleteAnnouncementId}
              setDeleteAnnouncementModal={setDeleteAnnouncementModal}
              setDeleteWebsiteServiceId={setDeleteWebsiteServiceId}
              setDeleteWebsiteServiceModal={setDeleteWebsiteServiceModal}
              styles={styles}
            />
          </div>
        </section>

        {websiteFaqOverlay && (
              <WebsiteItemOverlay
                styles={styles}
                title={websiteFaqOverlay.id ? "Edit FAQ" : "New FAQ"}
                onClose={() => setWebsiteFaqOverlay(null)}
                onSave={(data) => saveFaq(data)}
                onValidationError={(message) => showWebsiteValidationModal("Required Fields Missing", message)}
                data={websiteFaqOverlay}
                fields={[
                  { key: "question", label: "Question", type: "textarea", required: true },
                  { key: "answer", label: "Answer", type: "textarea", required: true },
                  { key: "sort_order", label: "Sort Order", type: "number" },
                  { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "hidden", label: "Hidden" }] },
                ]}
              />
            )}

        {websiteAboutOverlay && (
          <WebsiteItemOverlay
            styles={styles}
            title="Edit About Us Content"
            onClose={() => setWebsiteAboutOverlay(null)}
            onSave={(data) => handleWebsiteContentSaveRequest(data, [
              "about_hero_tag",
              "about_hero_title",
              "about_hero_description",
              "hero_card_title",
              "hero_card_description",
              "who_we_are_tag",
              "who_we_are_title",
              "who_we_are_description",
              "mission_title",
              "mission_content",
              "vision_title",
              "vision_content",
              "care_title",
              "care_content",
              "team_section_tag",
              "team_section_title",
              "team_section_description",
              "owner_label",
              "owner_name",
              "owner_position",
              "owner_message_1",
              "owner_message_2",
              "branch_section_tag",
              "branch_section_title",
              "map_section_tag",
              "map_section_title",
              "map_section_description"
            ])}
            onValidationError={(message) =>
              showWebsiteValidationModal("Required Fields Missing", message)
            }
            data={websiteContentForm}
            fields={[
              { key: "about_hero_tag", label: "Hero Tag", required: true },
              { key: "about_hero_title", label: "Hero Title", required: true },
              { key: "about_hero_description", label: "Hero Description", type: "textarea", required: true },

              { key: "hero_card_title", label: "Hero Card Title", required: true },
              { key: "hero_card_description", label: "Hero Card Description", type: "textarea", required: true },

              { key: "who_we_are_tag", label: "Who We Are Tag", required: true },
              { key: "who_we_are_title", label: "Who We Are Title", required: true },
              { key: "who_we_are_description", label: "Who We Are Description", type: "textarea", required: true },

              { key: "mission_title", label: "Mission Title", required: true },
              { key: "mission_content", label: "Mission Content", type: "textarea", required: true },

              { key: "vision_title", label: "Vision Title", required: true },
              { key: "vision_content", label: "Vision Content", type: "textarea", required: true },

              { key: "care_title", label: "Care Title", required: true },
              { key: "care_content", label: "Care Content", type: "textarea", required: true },

              { key: "team_section_tag", label: "Team Section Tag", required: true },
              { key: "team_section_title", label: "Team Section Title", required: true },
              { key: "team_section_description", label: "Team Section Description", type: "textarea", required: true },

              { key: "owner_label", label: "Owner Label", required: true },
              { key: "owner_name", label: "Owner Name", required: true },
              { key: "owner_position", label: "Owner Position", required: true },
              { key: "owner_message_1", label: "Owner Message 1", type: "textarea", required: true },
              { key: "owner_message_2", label: "Owner Message 2", type: "textarea", required: true },

              { key: "branch_section_tag", label: "Branch Section Tag", required: true },
              { key: "branch_section_title", label: "Branch Section Title", required: true },

              { key: "map_section_tag", label: "Map Section Tag", required: true },
              { key: "map_section_title", label: "Map Section Title", required: true },
              { key: "map_section_description", label: "Map Section Description", type: "textarea", required: true }
            ]}
          />
        )}

        {websiteHeroSaveConfirmModal && (
          <div
            style={styles.modal}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setWebsiteHeroSaveConfirmModal(null);
              }
            }}
          >
            <div
              style={{
                ...styles.modalContent,
                width: isMobile ? "95%" : 700,
                maxWidth: 700,
                padding: "34px 38px",
                maxHeight: "88vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  margin: "0 auto 18px",
                  borderRadius: "50%",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fi fi-rr-check"
                  style={{
                    fontSize: 34,
                    color: "#d97706",
                    lineHeight: 1,
                  }}
                ></i>
              </div>

              <h2
                style={{
                  ...styles.modalTitle,
                  marginBottom: 10,
                }}
              >
                Confirm Content Changes
              </h2>

              <p
                style={{
                  ...styles.modalText,
                  marginBottom: 22,
                }}
              >
                Please review the changes below before saving.
              </p>

              <div
                style={{
                  width: "100%",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#ffffff",
                  flex: 1,
                  overflowY: "auto",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "210px 1fr",
                    background: "#f8fafc",
                    padding: "14px 20px",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 700,
                    color: "#334155",
                    fontSize: 14,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <div>Field</div>
                  <div>New Value</div>
                </div>

                {websiteHeroSaveConfirmModal.details.map((detail, index, array) => (
                  <div
                    key={detail.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "210px 1fr",
                      gap: 20,
                      padding: "15px 20px",
                      alignItems: "center",
                      borderBottom:
                        index === array.length - 1
                          ? "none"
                          : "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {detail.label}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color:
                            detail.previousValue === "Not set"
                              ? "#2563eb"
                              : "#d97706",
                        }}
                      >
                        {detail.previousValue === "Not set"
                          ? "Added"
                          : "Changed"}
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#0f172a",
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        whiteSpace: "pre-wrap",
                        textAlign: "right",
                      }}
                    >
                      {detail.value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 18px",
                  marginBottom: 22,
                  borderRadius: 12,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <i
                  className="fi fi-rr-info"
                  style={{
                    marginTop: 2,
                    fontSize: 16,
                  }}
                ></i>

                <span>
                  Please verify all Hero section changes before saving. Once saved,
                  these updates will immediately appear on your website.
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: "auto",
                }}
              >
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 52,
                    border: "1px solid #d1d5db",
                    borderRadius: 14,
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                    transition: "all .2s ease",
                  }}
                  onClick={() =>
                    setWebsiteHeroSaveConfirmModal(null)
                  }
                >
                  Review Changes
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 52,
                    border: "1px solid #eab308",
                    borderRadius: 14,
                    background: "#d4af37",
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                    transition: "all .2s ease",
                  }}
                  onClick={confirmWebsiteHeroSave}
                >
                  Save Hero Content
                </button>
              </div>
            </div>
          </div>
        )}

        {websiteContentClearConfirmModal && (
          <div
            style={styles.modal}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setWebsiteContentClearConfirmModal(null);
              }
            }}
          >
            <div
              style={{
                ...styles.modalContent,
                width: isMobile ? "95%" : 620,
                maxWidth: 620,
                padding: "34px 38px",
                maxHeight: "88vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    margin: "0 auto 18px",
                    borderRadius: "50%",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                <i
                  className="fi fi-rr-trash"
                  style={{
                    fontSize: 34,
                    color: "#dc2626",
                    lineHeight: 1,
                  }}
                ></i>
              </div>

              <h2
                style={{
                  ...styles.modalTitle,
                  marginBottom: 10,
                }}
              >
                Clear Website Content
              </h2>

              <p
                style={{
                  ...styles.modalText,
                  marginBottom: 22,
                }}
              >
                You are about to clear all fields in this section. Review the
                current values before continuing.
              </p>

              <div
                style={{
                  width: "100%",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#ffffff",
                  flex: 1,
                  overflowY: "auto",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "210px 1fr",
                    background: "#f8fafc",
                    padding: "14px 20px",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 700,
                    color: "#334155",
                    fontSize: 14,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <div>Field</div>
                  <div>Current Value</div>
                </div>

                {Object.entries(
                  websiteContentClearConfirmModal.sectionFields
                ).map(([key, value], index, array) => {
                  const displayValue =
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ""
                      ? null
                      : String(value);

                  return (
                    <div
                      key={key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "210px 1fr",
                        gap: 20,
                        padding: "15px 20px",
                        alignItems: "center",
                        borderBottom:
                          index === array.length - 1
                            ? "none"
                            : "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {formatWebsiteContentFieldLabel(key)}
                      </div>

                      <div
                        style={{
                          color: displayValue ? "#0f172a" : "#94a3b8",
                          fontWeight: 500,
                          fontSize: 13,
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {displayValue || "Not set"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 18px",
                  marginBottom: 22,
                  borderRadius: 12,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <i
                  className="fi fi-rr-triangle-warning"
                  style={{
                    marginTop: 2,
                    fontSize: 16,
                  }}
                ></i>

                <span>
                  Clearing these fields only removes the current input in this section. Your website content will not be updated until you click <strong>Save Content</strong>.
                </span>
              </div>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginTop: "auto",
                  }}
                >
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 52,
                    border: "1px solid #86efac",
                    borderRadius: 14,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all .2s ease",
                  }}
                  onClick={() =>
                    setWebsiteContentClearConfirmModal(null)
                  }
                >
                  Keep Content
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 52,
                    border: "1px solid #fca5a5",
                    borderRadius: 14,
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all .2s ease",
                  }}
                  onClick={confirmWebsiteContentClear}
                >
                  Clear Content
                </button>
              </div>
            </div>
          </div>
        )}

        {websiteAboutSaveConfirmModal && (
          <div
            style={styles.modal}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setWebsiteAboutSaveConfirmModal(null);
              }
            }}
          >
            <div
              style={{
                ...styles.modalContent,
                width: isMobile ? "100%" : 520,
                maxWidth: 520,
              }}
            >
              <div style={styles.modalIcon}>
                <i
                  className="fi fi-rr-check-circle"
                  style={styles.modalIconText}
                ></i>
              </div>

              <h2 style={styles.modalTitle}>
                Confirm About Us Changes
              </h2>

              <p style={styles.modalText}>
                Please review the About Us content before saving.
              </p>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "Arial, sans-serif",
                  marginBottom: 8,
                }}
              >
                {websiteAboutSaveConfirmModal.details.filter((detail) => detail.changed).length === 0 ? (
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                      padding: "8px 0",
                    }}
                  >
                    No content changes detected.
                  </div>
                ) : (
                  websiteAboutSaveConfirmModal.details
                    .filter((detail) => detail.changed)
                    .map((detail) => (
                      <div
                        key={detail.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "7px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: 13,
                          textAlign: "left",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>
                          {detail.label}
                          <small
                            style={{
                              display: "block",
                              color: "#94a3b8",
                              marginTop: 2,
                            }}
                          >
                            {detail.previousValue === "Not set"
                              ? "Added"
                              : "Changed"}
                          </small>
                        </span>

                        <strong
                          style={{
                            color: "#0f172a",
                            textAlign: "right",
                            maxWidth: 260,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {detail.value}
                        </strong>
                      </div>
                    ))
                )}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={{
                    ...styles.modalButton,
                    ...styles.cancelBtn,
                  }}
                  onClick={() => setWebsiteAboutSaveConfirmModal(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.modalButton,
                    ...styles.saveBtn,
                  }}
                  disabled={websiteContentSaving}
                  onClick={confirmWebsiteAboutSave}
                >
                  {websiteContentSaving ? "Saving..." : "Save Content"}
                </button>
              </div>
            </div>
          </div>
        )}

        {websiteServiceOverlay && (
          <WebsiteItemOverlay
            styles={styles}
            title={websiteServiceOverlay.id ? "Edit Service Card" : "New Service Card"}
            onClose={() => setWebsiteServiceOverlay(null)}
            onSave={handleWebsiteServiceSaveRequest}
            onValidationError={(message) =>
              showWebsiteValidationModal("Required Fields Missing", message)
            }
            data={websiteServiceOverlay}
            fields={[
              { key: "name", label: "Service Name", required: true },
              { key: "image_path", label: "Service Image", type: "image", required: true },
              { key: "before_image", label: "Before Image", type: "image" },
              { key: "after_image", label: "After Image", type: "image" },
              { key: "intro", label: "Hero Introduction", type: "textarea", required: true },
              { key: "heading", label: "Main Heading", required: true },
              { key: "overview", label: "Overview", type: "textarea", required: true },
              { key: "benefits", label: "Benefits", type: "textarea", required: true },
              { key: "process", label: "Treatment Process", type: "textarea", required: true },
              { key: "care", label: "Aftercare Tips", type: "textarea", required: true },
              { key: "duration", label: "Estimated Duration", type: "textarea", required: true },
              { key: "ideal_for", label: "Best For", type: "textarea", required: true },
              { key: "reminder", label: "Important Reminder", type: "textarea", required: true },
              { key: "description", label: "Card Description", type: "textarea", required: true },
              { key: "slug", label: "Slug", required: true },
              { key: "sort_order", label: "Sort Order", type: "number", required: true },
              {
                key: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "active", label: "Active" },
                  { value: "hidden", label: "Hidden" },
                ],
              },
            ]}
          />
        )}

        {websiteServiceSaveConfirmModal && (
          <div
            style={styles.modal}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setWebsiteServiceSaveConfirmModal(null);
              }
            }}
          >
            <div
              style={{
                ...styles.modalContent,
                width: isMobile ? "100%" : 760,
                maxWidth: 760,
              }}
            >
              <div style={styles.modalIcon}>
                <i
                  className="fi fi-rr-check-circle"
                  style={styles.modalIconText}
                ></i>
              </div>

              <h2 style={styles.modalTitle}>Confirm Website Service Changes</h2>

              <p style={styles.modalText}>Please review the changes below before saving.</p>

              <div
                style={{
                  border: "1px solid #dbe3ef",
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 20,
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 600,
                    color: "#1e3a5f",
                    fontSize: 14,
                  }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      textAlign: "center",
                    }}
                  >
                    Field
                  </div>

                  <div
                    style={{
                      padding: "14px 18px",
                      textAlign: "center",
                    }}
                  >
                    New Value
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: 380,
                    overflowY: "auto",
                  }}
                >
                  {websiteServiceSaveConfirmModal.details.filter(
                    (detail) => detail.changed
                  ).length === 0 ? (
                    <div
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: 14,
                      }}
                    >
                      No content changes detected.
                    </div>
                  ) : (
                    websiteServiceSaveConfirmModal.details
                      .filter((detail) => detail.changed)
                      .map((detail) => (
                        <div
                          key={detail.key}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "220px 1fr",
                            borderBottom: "1px solid #eef2f7",
                          }}
                        >
                          <div
                            style={{
                              padding: "16px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                color: "#64748b",
                                fontWeight: 600,
                                fontSize: 14,
                                marginBottom: 4,
                              }}
                            >
                              {detail.label}
                            </div>

                            <div
                              style={{
                                color:
                                  detail.previousValue === "Not set"
                                    ? "#16a34a"
                                    : "#d97706",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {detail.previousValue === "Not set"
                                ? "Added"
                                : "Changed"}
                            </div>
                          </div>

                          <div
                            style={{
                              padding: "16px 18px",
                              color: "#0f172a",
                              fontSize: 13,
                              fontWeight: 500,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                              lineHeight: 1.6,
                              textAlign: "left",
                            }}
                          >
                            {detail.value}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  marginBottom: 20,
                  border: "1px solid #fde68a",
                  borderRadius: 12,
                  background: "#fffbeb",
                  color: "#b45309",
                  fontSize: 14,
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fi fi-rr-info"
                  style={{
                    fontSize: 18,
                  }}
                ></i>

                <span>
                  Please verify all changes before saving. Once saved, these updates
                  will immediately appear on your website.
                </span>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={{
                    ...styles.modalButton,
                    ...styles.cancelBtn,
                  }}
                  onClick={() => setWebsiteServiceSaveConfirmModal(null)}
                >
                  Review Changes
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.modalButton,
                    ...styles.saveBtn,
                  }}
                  disabled={websiteServiceSaving}
                  onClick={confirmWebsiteServiceSave}
                >
                  {websiteServiceSaving ? "Saving..." : "Save Content"}
                </button>
              </div>
            </div>
          </div>
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
              { key: "title", label: "Announcement Title", required: true, column: "left" },

              { key: "title_font_family", label: "Font Family", type: "font-family", column: "right" },
              { key: "title_font_size", label: "Font Size", type: "font-size", column: "right" },
              { key: "title_font_weight", label: "Font Weight", type: "font-weight", column: "right" },
              { key: "title_color", label: "Text Color", type: "color", column: "right" },
              { key: "title_alignment", label: "Text Alignment", type: "select", column: "right", options: textAlignOptions },

              { key: "message", label: "Announcement Message", type: "textarea", required: true, column: "left" },

              { key: "message_font_family", label: "Font Family", type: "font-family", column: "right" },
              { key: "message_font_size", label: "Font Size", type: "font-size", column: "right" },
              { key: "message_font_weight", label: "Font Weight", type: "font-weight", column: "right" },
              { key: "message_color", label: "Text Color", type: "color", column: "right" },
              { key: "message_alignment", label: "Text Alignment", type: "select", column: "right", options: textAlignOptions },

              { key: "start_date", label: "From Date", type: "date" },
              { key: "start_time", label: "From Time", type: "time-select" },
              { key: "end_date", label: "To Date", type: "date" },
              { key: "end_time", label: "To Time", type: "time-select" },

              { key: "status", label: "Status", type: "select", options: [
                { value: "active", label: "Active" },
                { value: "hidden", label: "Hidden" },
              ]}
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
          <div style={styles.accountHeaderProfile}>
            <button
              type="button"
              style={styles.profileAvatarButton}
              onClick={() => adminProfilePhotoInputRef.current?.click()}
              disabled={adminProfilePhotoUploading}
              title="Change profile photo"
            >
              {adminAccountForm.profilePhotoUrl ? (
                <img
                  src={profileFileUrl(adminAccountForm.profilePhotoUrl)}
                  alt=""
                  style={styles.profileAvatarImg}
                />
              ) : (
                <i className="fi fi-rr-user" style={styles.profileAvatarIcon}></i>
              )}
              <span style={styles.profileAvatarCamera}>
                <i className={adminProfilePhotoUploading ? 'fi fi-rr-spinner' : 'fi fi-rr-camera'}></i>
              </span>
            </button>
            <input
              ref={adminProfilePhotoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={(event) => handleAdminProfilePhotoFile(event.target.files?.[0])}
            />
            <div>
              <h3 style={styles.accountTitle}>Admin Account Information</h3>
              {adminAccountForm.profilePhotoUrl && (
                <button
                  type="button"
                  style={styles.removePhotoBtn}
                  onClick={() => setAdminPhotoRemoveConfirm(true)}
                  disabled={adminProfilePhotoUploading}
                >
                  <i className="fi fi-rr-trash"></i>
                  Remove Photo
                </button>
              )}
            </div>
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

      {adminPhotoRemoveConfirm && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setAdminPhotoRemoveConfirm(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-trash" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Remove Photo</h2>
            <p style={styles.modalText}>
              Are you sure you want to remove your admin profile photo?
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setAdminPhotoRemoveConfirm(false)}
                disabled={adminProfilePhotoUploading}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmRemoveAdminPhoto}
                disabled={adminProfilePhotoUploading}
              >
                {adminProfilePhotoUploading ? 'Removing...' : 'Yes'}
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
          <button type="button" style={styles.secondaryBtn} onClick={() => openServiceKitManager()} disabled={!filteredServices.length}>
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
              profilePhotoUrl={profileFileUrl(adminAccountForm.profilePhotoUrl)}
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
                    style={{ ...styles.pageBtn, ...styles.prevPageBtn,
                      ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    Previous
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
                    style={{ ...styles.pageBtn, ...styles.nextPageBtn,
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
                  placeholder={BRANCH_OPERATING_HOURS_FORMAT}
                />
                {getBranchOperatingHoursError() && (
                  <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>
                    {getBranchOperatingHoursError()}
                  </span>
                )}
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
                <option value="" disabled>
                  Choose a Service
                </option>
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
                    -
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
                  onClick={() => {
                    const emptyFilters = { startDate: '', endDate: '', branchId: '' };
                    setServiceKitHistoryFilters(emptyFilters);
                    loadServiceKitHistory(emptyFilters);
                  }}
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
          <div
            style={{
              ...styles.modalContent,
              width: isMobile ? "95%" : 700,
              maxWidth: 700,
              padding: "34px 38px",
              maxHeight: "88vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fi fi-rr-check"
                style={{
                  fontSize: 34,
                  color: "#d97706",
                  lineHeight: 1,
                }}
              ></i>
            </div>

            <h2
              style={{
                ...styles.modalTitle,
                marginBottom: 10,
              }}
            >
              Confirm Content Changes
            </h2>

            <p
              style={{
                ...styles.modalText,
                marginBottom: 22,
              }}
            >
              Please review the changes below before saving.
            </p>

            <div
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
                background: "#ffffff",
                flex: 1,
                overflowY: "auto",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "210px 1fr",
                  background: "#f8fafc",
                  padding: "14px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  fontWeight: 700,
                  color: "#334155",
                  fontSize: 14,
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                }}
              >
                <div>Field</div>
                <div>New Value</div>
              </div>

              {websiteContentSaveConfirmModal.details
                .filter((detail) => detail.changed)
                .map((detail, index, array) => (
                  <div
                    key={detail.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "210px 1fr",
                      gap: 20,
                      padding: "15px 20px",
                      alignItems: "center",
                      borderBottom:
                        index === array.length - 1
                          ? "none"
                          : "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {detail.label}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color:
                            detail.previousValue === "Not set"
                              ? "#2563eb"
                              : "#d97706",
                        }}
                      >
                        {detail.previousValue === "Not set"
                          ? "Added"
                          : "Changed"}
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#0f172a",
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        whiteSpace: "pre-wrap",
                        textAlign: "right",
                      }}
                    >
                      {detail.value || "Not entered"}
                    </div>
                  </div>
                ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px 18px",
                marginBottom: 22,
                borderRadius: 12,
                background: "#fffbeb",
                border: "1px solid #fde68a",
                color: "#92400e",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <i
                className="fi fi-rr-info"
                style={{
                  marginTop: 2,
                  fontSize: 16,
                }}
              ></i>

              <span>
                Please verify all changes before saving. Once saved, these updates will immediately appear on your website
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: "auto",
              }}
            >
              <button
                type="button"
                style={{
                  flex: 1,
                  height: 52,
                  border: "1px solid #d1d5db",
                  borderRadius: 14,
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setWebsiteContentSaveConfirmModal(null)
                }
              >
                Review Changes
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  height: 52,
                  border: "1px solid #eab308",
                  borderRadius: 14,
                  background: "#d4af37",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  cursor: "pointer",
                }}
                disabled={websiteContentSaving}
                onClick={confirmWebsiteContentSave}
              >
                {websiteContentSaving ? "Saving..." : "Save Content"}
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

function profileFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^(https?:|blob:|data:)/i.test(fileUrl)) return fileUrl;
  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

function publishAdminProfilePhoto(profilePhotoUrl) {
  if (profilePhotoUrl) {
    localStorage.setItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY, profilePhotoUrl);
  } else {
    localStorage.removeItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY);
  }
  window.dispatchEvent(
    new CustomEvent(ADMIN_PROFILE_PHOTO_EVENT, {
      detail: { profilePhotoUrl },
    })
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

const API_URL = "http://localhost:4000";

function getImagePreview(path) {

  if (!path) return "";

  if (path instanceof File) {
    return URL.createObjectURL(path);
  }

  if (typeof path === "string") {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  return "";
}

function WebsiteItemOverlay({ styles, title, onClose, onSave, onValidationError, data, fields }) {
  const [form, setForm] = useState(() => {
    const initial = {};

    fields.forEach((f) => {
      initial[f.key] = data?.[f.key] ?? "";
    });

    return initial;
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const [imagePreview, setImagePreview] = useState({
    image_path: getImagePreview(data?.image_path),
    before_image: getImagePreview(data?.before_image),
    after_image: getImagePreview(data?.after_image),
  });

  useEffect(() => {
    const updated = {};

    fields.forEach((f) => {
      updated[f.key] = data?.[f.key] ?? "";
    });

    setForm(updated);
    setErrors({});

    setImagePreview({
      image_path: getImagePreview(data?.image_path),
      before_image: getImagePreview(data?.before_image),
      after_image: getImagePreview(data?.after_image),
    });
  }, [data, fields]);

  useEffect(() => {
    return () => {
      Object.values(imagePreview).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreview]);

  function validateField(field, value) {
    const inputValue = String(value || "").trim();

    if (field.type === "image") {
      return value ? "" : `${field.label} is required.`;
    }

    if (field.required && !inputValue) {
      return `${field.label} is required.`;
    }

    if (!inputValue) {
      return "";
    }

    switch (field.key) {
      case "footer_brand_name":
        if (!/^[A-Za-z\s&.'-]+$/.test(inputValue)) {
          return "Brand name must contain letters only.";
        }
        break;

      case "footer_team_name":
        if (!/^[A-Za-z\s&:.,'()-]+$/.test(inputValue)) {
          return "Team name contains invalid characters.";
        }
        break;

      case "footer_system_name":
        if (!/^[A-Za-z\s&:.,'()-]+$/.test(inputValue)) {
          return "System name contains invalid characters.";
        }
        break;

      case "contact_phone1":
      case "contact_phone2":
        if (!/^9\d{9}$/.test(inputValue)) {
          return "Phone number must start with 9 and contain exactly 10 digits.";
        }
        break;

      case "contact_email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
          return "Enter a valid email address.";
        }
        break;

      case "contact_facebook_name":
        if (!/^[A-Za-z\s&.'-]+$/.test(inputValue)) {
          return "Facebook page name contains invalid characters.";
        }
        break;

      case "contact_facebook_url":
        if (
          !/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i.test(inputValue)
        ) {
          return "Enter a valid Facebook URL.";
        }
        break;

      case "contact_tagline":
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(inputValue)) {
          return "Clinic tagline contains invalid characters.";
        }
        break;

      case "contact_badge":
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(inputValue)) {
          return "Contact badge contains invalid characters.";
        }
        break;

      case "contact_heading":
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(inputValue)) {
          return "Contact heading contains invalid characters.";
        }
        break;

      case "contact_button":
        if (!/^[A-Za-z0-9\s&:.,'()!?-]+$/.test(inputValue)) {
          return "Contact button contains invalid characters.";
        }
        break;

      case "hours_weekdays":
        if (!/^[A-Za-z\s-]+$/.test(inputValue)) {
          return "Weekdays label contains invalid characters.";
        }
        break;

      case "hours_weekday_time":
        if (!/^[A-Za-z0-9:\s-]+$/.test(inputValue)) {
          return "Weekday hours contain invalid characters.";
        }
        break;

      case "hours_sunday":
        if (!/^[A-Za-z\s]+$/.test(inputValue)) {
          return "Sunday label contains invalid characters.";
        }
        break;

      case "hours_sunday_note":
        if (!/^[A-Za-z0-9\s&:.,'()-]+$/.test(inputValue)) {
          return "Sunday note contains invalid characters.";
        }
        break;
    }

    if (field.validation?.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(inputValue)) {
        return `${field.label} must be a valid email address.`;
      }
    }

    if (field.validation?.type === "url") {
      try {
        new URL(inputValue);
      } catch {
        return `${field.label} must be a valid link.`;
      }
    }

    if (field.validation?.type === "phone") {
      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;

      if (!phoneRegex.test(inputValue)) {
        return `${field.label} must be a valid phone number.`;
      }
    }

    if (field.validation?.type === "number") {
      if (isNaN(Number(inputValue))) {
        return `${field.label} must be a number.`;
      }

      if (
        field.validation.min &&
        Number(inputValue) < field.validation.min
      ) {
        return `${field.label} must be at least ${field.validation.min}.`;
      }

      if (
        field.validation.max &&
        Number(inputValue) > field.validation.max
      ) {
        return `${field.label} must not exceed ${field.validation.max}.`;
      }
    }

    return "";
  }

  function handleChange(field, value) {
    setHasChanges(true);

    let newValue = value;

    if (
      field.key === "contact_phone1" ||
      field.key === "contact_phone2"
    ) {
      newValue = newValue.replace(/\D/g, "");

      if (newValue.length > 0 && !newValue.startsWith("9")) {
        return;
      }

      newValue = newValue.slice(0, 10);
    }

    if (field.key === "footer_brand_name") {
      newValue = newValue.replace(/[^A-Za-z\s&.'-]/g, "");
    }

    if (field.key === "footer_team_name") {
      newValue = newValue.replace(/[^A-Za-z\s&:.,'()-]/g, "");
    }

    if (field.key === "footer_system_name") {
      newValue = newValue.replace(/[^A-Za-z\s&:.,'()-]/g, "");
    }

    if (field.key === "contact_tagline") {
      newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");
    }

    if (field.key === "contact_badge") {
      newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");
    }

    if (field.key === "contact_heading") {
      newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");
    }

    if (field.key === "contact_button") {
      newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()!?-]/g, "");
    }

    if (field.key === "contact_facebook_name") {
      newValue = newValue.replace(/[^A-Za-z\s&.'-]/g, "");
    }

    if (field.key === "hours_weekdays") {
      newValue = newValue.replace(/[^A-Za-z\s-]/g, "");
    }

    if (field.key === "hours_weekday_time") {
      newValue = newValue.replace(/[^A-Za-z0-9:\s-]/g, "");
    }

    if (field.key === "hours_sunday") {
      newValue = newValue.replace(/[^A-Za-z\s]/g, "");
    }

    if (field.key === "hours_sunday_note") {
      newValue = newValue.replace(/[^A-Za-z0-9\s&:.,'()-]/g, "");
    }

    let error = validateField(field, newValue);

    if (
      field.key === "contact_email" &&
      newValue &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue.trim())
    ) {
      error = "Enter a valid email address.";
    }

    if (
      (field.key === "contact_phone1" ||
        field.key === "contact_phone2") &&
      newValue &&
      !/^9\d{9}$/.test(newValue)
    ) {
      error =
        "Phone number must start with 9 and contain exactly 10 digits.";
    }

    if (
      field.key === "footer_brand_name" &&
      newValue &&
      !/^[A-Za-z\s&.'-]+$/.test(newValue.trim())
    ) {
      error = "Brand name must contain letters only.";
    }

    if (
      field.key === "footer_team_name" &&
      newValue &&
      !/^[A-Za-z\s&:.,'()-]+$/.test(newValue.trim())
    ) {
      error = "Team name contains invalid characters.";
    }

    if (
      field.key === "footer_system_name" &&
      newValue &&
      !/^[A-Za-z\s&:.,'()-]+$/.test(newValue.trim())
    ) {
      error = "System name contains invalid characters.";
    }

    if (
      field.key === "contact_facebook_name" &&
      newValue &&
      !/^[A-Za-z\s&.'-]+$/.test(newValue.trim())
    ) {
      error = "Facebook page name contains invalid characters.";
    }

    if (
      field.key === "contact_facebook_url" &&
      newValue &&
      !/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i.test(newValue.trim())
    ) {
      error = "Enter a valid Facebook URL.";
    }

    setForm((prev) => ({
      ...prev,
      [field.key]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [field.key]: error,
    }));
  }

  function handleImageUpload(e, key) {
    const file = e.target.files?.[0];

    if (!file) return;

    const field = fields.find((f) => f.key === key);

    setHasChanges(true);

    setImagePreview((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file),
    }));

    setForm((prev) => ({
      ...prev,
      [key]: file,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: validateField(field, file),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    let allEmpty = true;

    fields.forEach((field) => {
      if (!field.required) return;

      const value = form[field.key];

      if (field.type === "image") {
        if (value) allEmpty = false;
      } else if (String(value || "").trim()) {
        allEmpty = false;
      }

      newErrors[field.key] = validateField(field, value);
    });

    setErrors(newErrors);

    if (allEmpty) {
      onValidationError?.("Please complete all required fields before saving.");
      return;
    }

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    onSave({ ...data, ...form });
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const renderField = (f) => {
    return (
      <div
        key={f.key}
        style={{
          ...styles.field,
          width: "100%",
        }}
      >
        <label style={styles.fieldLabel}>
          {f.label}

          {f.required && (
            <span style={{ color: "#dc2626", marginLeft: 4 }}>
              *
            </span>
          )}
        </label>

        {f.type === "textarea" ? (
          <textarea
            style={{
              ...styles.formInput,
              minHeight: 80,
              resize: "vertical",
            }}
            value={form[f.key] || ""}
            onChange={(e) =>
              handleChange(f, e.target.value)
            }
          />

        ) : f.type === "select" ? (

          <select
            style={styles.formInput}
            value={form[f.key] || ""}
            onChange={(e) =>
              handleChange(f, e.target.value)
            }
          >
            {(f.options || []).map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </option>
            ))}
          </select>

        ) : f.type === "time-select" ? (

          <select
            style={styles.formInput}
            value={form[f.key] || ""}
            onChange={(e) =>
              handleChange(f, e.target.value)
            }
          >
            <option value="">
              Select Time
            </option>

            {Array.from({ length: 24 }).flatMap((_, hour) =>
              ["00","10","20","30","40","50"].map((minute)=>{

                const value =
                  `${String(hour).padStart(2,"0")}:${minute}`;

                const hour12 =
                  hour % 12 || 12;

                const period =
                  hour < 12 ? "AM" : "PM";

                return (
                  <option
                    key={value}
                    value={value}
                  >
                    {`${hour12}:${minute} ${period}`}
                  </option>
                );

              })
            )}

          </select>

        ) : (

          <input
            type={f.type || "text"}
            style={styles.formInput}
            value={form[f.key] || ""}
            onChange={(e) =>
              handleChange(f, e.target.value)
            }
          />

        )}

      </div>
    );
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.overlayContent}>
        <div style={styles.overlayHeader}>
          <h3 style={styles.overlayTitle}>{title}</h3>
          <button type="button" onClick={onClose} style={styles.overlayClose}>&times;</button>
        </div>
        <div style={styles.overlayBody}>
          <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                {fields.map((f) => {
                  const isFullWidth =
                    f.type === "textarea" ||
                    f.type === "image";

                  const fieldColumn =
                    f.column === "right"
                      ? "2"
                      : "1";

                  return (
                    <div
                      key={f.key}
                      style={{
                        ...styles.field,
                        width: "100%",
                        gridColumn: isFullWidth ? "1 / -1" : fieldColumn,
                      }}
                    >
                  <label style={styles.fieldLabel}>
                    {f.label}
                    {f.required && (
                      <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
                    )}
                  </label>

                  {f.type === "textarea" ? (
                    <>
                      <textarea
                        style={{
                          ...styles.formInput,
                          minHeight: 80,
                          resize: "vertical",
                          borderColor: errors[f.key] ? "#dc2626" : "#d1d5db",
                          boxShadow: errors[f.key] ? "0 0 0 1px #dc2626" : "none",
                        }}
                        value={form[f.key]}
                        onChange={(e) => handleChange(f, e.target.value)}
                        onBlur={() =>
                          setErrors((prev) => ({
                            ...prev,
                            [f.key]: validateField(f, form[f.key]),
                          }))
                        }
                      />

                      {errors[f.key] && (
                        <p
                          style={{
                            color: "#dc2626",
                            fontSize: 12,
                            marginTop: 6,
                            marginBottom: 0,
                            fontWeight: 500,
                          }}
                        >
                          {errors[f.key]}
                        </p>
                      )}
                    </>
                  ) : f.type === "select" ? (
                    <>
                      <select
                        style={{
                          ...styles.formInput,
                          borderColor: errors[f.key] ? "#dc2626" : "#d1d5db",
                          boxShadow: errors[f.key] ? "0 0 0 1px #dc2626" : "none",
                        }}
                        value={form[f.key]}
                        onChange={(e) => handleChange(f, e.target.value)}
                        onBlur={() =>
                          setErrors((prev) => ({
                            ...prev,
                            [f.key]: validateField(f, form[f.key]),
                          }))
                        }
                      >
                        {(f.options || []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {errors[f.key] && (
                        <p
                          style={{
                            color: "#dc2626",
                            fontSize: 12,
                            marginTop: 6,
                            marginBottom: 0,
                            fontWeight: 500,
                          }}
                        >
                          {errors[f.key]}
                        </p>
                      )}
                    </>
                  ) : f.type === "image" ? (
                    <>
                        <div
                          style={{
                            border: errors[f.key] ? "1px solid #dc2626" : "1px solid #d1d5db",
                            borderRadius: 14,
                            padding: "10px 14px",
                            background: "#fff",
                            marginBottom: 12,
                          }}
                        >
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleImageUpload(e, f.key)}
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            padding: 0,
                            fontSize: 14,
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        />

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            color: "#64748b",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {form[f.key] instanceof File ? (
                            <>
                              <strong>Selected file:</strong> {form[f.key].name}
                            </>
                          ) : form[f.key] ? (
                            <>
                              <strong>Current file:</strong>{" "}
                              {String(form[f.key]).split("/").pop()}
                            </>
                          ) : (
                            <>
                              <strong>No image uploaded yet.</strong>
                            </>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            border: errors[f.key]
                              ? "1px dashed #dc2626"
                              : "1px dashed #d1d5db",
                            borderRadius: 12,
                            background: "#fff",
                            width: 260,
                            height: 260,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                          }}
                        >
                          {imagePreview[f.key] ? (
                            <img
                              src={imagePreview[f.key]}
                              alt={f.label}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                borderRadius: 12,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                height: "100%",
                                color: "#94a3b8",
                                fontWeight: 600,
                              }}
                            >
                              <i
                                className="fi fi-rr-picture"
                                style={{
                                  fontSize: 50,
                                  marginBottom: 12,
                                  color: "#cbd5e1",
                                }}
                              />
                              <span>No uploaded image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {errors[f.key] && (
                        <p
                          style={{
                            color: "#dc2626",
                            fontSize: 12,
                            marginTop: -6,
                            marginBottom: 12,
                            textAlign: "center",
                            fontWeight: 500,
                          }}
                        >
                          {errors[f.key]}
                        </p>
                      )}
                    </>
                  ) : f.type === "time-select" ? (
                    <>
                      <select
                        style={{
                          ...styles.formInput,
                          borderColor: errors[f.key] ? "#dc2626" : "#d1d5db",
                          boxShadow: errors[f.key] ? "0 0 0 1px #dc2626" : "none",
                        }}
                        value={form[f.key] || ""}
                        onChange={(e) => handleChange(f, e.target.value)}
                        onBlur={() =>
                          setErrors((prev) => ({
                            ...prev,
                            [f.key]: validateField(f, form[f.key]),
                          }))
                        }
                      >
                        <option value="">Select Time</option>

                        {Array.from({ length: 24 }).flatMap((_, hour) =>
                          ["00", "10", "20", "30", "40", "50"].map((minute) => {
                            const value = `${String(hour).padStart(2, "0")}:${minute}`;

                            const hour12 = hour % 12 || 12;

                            const period = hour < 12 ? "AM" : "PM";

                            return (
                              <option
                                key={value}
                                value={value}
                              >
                                {`${hour12}:${minute} ${period}`}
                              </option>
                            );
                          })
                        )}
                      </select>

                      {errors[f.key] && (
                        <p
                          style={{
                            color: "#dc2626",
                            fontSize: 12,
                            marginTop: 6,
                            marginBottom: 0,
                            fontWeight: 500,
                          }}
                        >
                          {errors[f.key]}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type={f.type || "text"}
                        style={{
                          ...styles.formInput,
                          borderColor: errors[f.key] ? "#dc2626" : "#d1d5db",
                          boxShadow: errors[f.key] ? "0 0 0 1px #dc2626" : "none",
                        }}
                        value={form[f.key]}
                        onChange={(e) => handleChange(f, e.target.value)}
                        onBlur={() =>
                          setErrors((prev) => ({
                            ...prev,
                            [f.key]: validateField(f, form[f.key]),
                          }))
                        }
                      />

                      {errors[f.key] && (
                        <p
                          style={{
                            color: "#dc2626",
                            fontSize: 12,
                            marginTop: 6,
                            marginBottom: 0,
                            fontWeight: 500,
                          }}
                        >
                          {errors[f.key]}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
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

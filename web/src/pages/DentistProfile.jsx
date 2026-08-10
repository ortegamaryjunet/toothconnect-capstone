import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

import api from '../api/axios';
import DentistProfileMenu from '../components/DentistProfileMenu';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createDentistProfileStyles from '../styles/DentistProfile';

import clinicLogo from '../assets/clinicLogo/clinic-logo-nav.png';

async function loadPdfTools() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return { jsPDF, autoTable };
}

const initialProfile = {
  fullName: 'Dentist Name',
  preferredNickname: 'N/A',
  suffix: '',
  birthday: '',
  religion: 'N/A',
  nationality: 'N/A',
  homeAddress: 'N/A',
  contactNumber: 'N/A',
  emailAddress: 'N/A',
  role: 'Dentist',

  specialization: 'Specialization',
  startDate: 'N/A',
  employmentType: 'N/A',
  shiftType: 'N/A',
  workScheduleDays: 'N/A',
  workHours: 'N/A',

  medicalDegree: 'N/A',
  medicalLicenseNumber: 'N/A',
  yearsOfExperience: 'N/A',
};

const SUFFIX_OPTIONS = ['Jr', 'Sr', 'II', 'III', 'IV'];
const NATIONALITY_OPTIONS = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan',
  'Argentine', 'Armenian', 'Australian', 'Austrian', 'Bangladeshi',
  'Belgian', 'Brazilian', 'British', 'Bulgarian', 'Cambodian', 'Canadian',
  'Chilean', 'Chinese', 'Colombian', 'Croatian', 'Czech', 'Danish', 'Dutch',
  'Egyptian', 'Emirati', 'Filipino', 'Finnish', 'French', 'German', 'Greek',
  'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Irish', 'Israeli',
  'Italian', 'Japanese', 'Jordanian', 'Kenyan', 'Korean', 'Kuwaiti',
  'Malaysian', 'Mexican', 'Moroccan', 'Nepalese', 'New Zealander',
  'Nigerian', 'Norwegian', 'Pakistani', 'Peruvian', 'Polish', 'Portuguese',
  'Qatari', 'Romanian', 'Russian', 'Saudi', 'Singaporean', 'South African',
  'Spanish', 'Swedish', 'Swiss', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese',
];
const RELIGION_OPTIONS = [
  'Catholic', 'Christian', 'Islam', 'Iglesia ni Cristo', 'Buddhism', 'Hinduism',
];
const phoneCountryOptions = getCountries().map((country) => ({
  country,
  callingCode: getCountryCallingCode(country),
}));
const PROFILE_REQUIRED_FIELDS = [
  'fullName',
  'birthday',
  'religion',
  'nationality',
  'contactNumber',
  'emailAddress',
  'homeAddress',
];

const PROFILE_FIELD_LABELS = {
  fullName: 'Full Name',
  preferredNickname: 'Preferred Nickname',
  suffix: 'Suffix',
  birthday: 'Birthday',
  religion: 'Religion',
  nationality: 'Nationality',
  contactNumber: 'Contact Number',
  emailAddress: 'Email Address',
  homeAddress: 'Home Address',
};

function filterProfileFieldValue(name, value) {
  const rawValue = String(value || '');

  if (name === 'fullName') {
    return rawValue.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
  }

  if (name === 'contactNumber') {
    let nextValue = rawValue.replace(/[^0-9+]/g, '');
    nextValue = nextValue.replace(/(?!^)\+/g, '');
    return nextValue.slice(0, nextValue.startsWith('+') ? 13 : 11);
  }

  if (name === 'emailAddress') {
    return rawValue.replace(/\s/g, '');
  }

  return rawValue;
}

function isValidProfileContactNumber(value) {
  return !validateProfilePhoneNumber(value);
}

function isValidProfileEmail(value) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(
    String(value || '').trim()
  );
}

function isValidProfileDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function getProfileFieldError(field, value) {
  const fieldValue = String(value || '').trim();

  if (PROFILE_REQUIRED_FIELDS.includes(field) && (!fieldValue || fieldValue === 'N/A')) {
    return 'This field is required.';
  }

  if (!fieldValue) return '';

  if (field === 'contactNumber' && !isValidProfileContactNumber(fieldValue)) {
    return 'Contact number does not match the selected country code.';
  }

  if (field === 'emailAddress' && !isValidProfileEmail(fieldValue)) {
    return 'Email address format is invalid';
  }

  if (field === 'birthday' && !isValidProfileDate(fieldValue)) {
    return 'Enter a valid date.';
  }

  return '';
}

function getProfileFormErrors(form) {
  return PROFILE_REQUIRED_FIELDS.reduce((errors, field) => {
    const error = getProfileFieldError(field, form[field]);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

function parseProfileContactNumber(value, country = 'PH') {
  const rawValue = String(value || '').trim();
  const digits = rawValue.replace(/\D/g, '');

  if (!digits) return null;
  if (rawValue.startsWith('+')) return parsePhoneNumberFromString(rawValue);
  if (digits.startsWith('00')) return parsePhoneNumberFromString(`+${digits.slice(2)}`);
  return parsePhoneNumberFromString(digits, country);
}

function isProfileDialCodeOnly(digits, country = 'PH') {
  try {
    return digits === getCountryCallingCode(country);
  } catch {
    return false;
  }
}

function getProfilePhoneFormValue(value, fallbackCountry = 'PH') {
  const phoneNumber = parseProfileContactNumber(value, fallbackCountry);

  if (!phoneNumber) {
    return {
      country: fallbackCountry,
      number: String(value || '').replace(/\D/g, '').slice(0, 15),
    };
  }

  return {
    country: phoneNumber.country || fallbackCountry,
    number: phoneNumber.nationalNumber || String(value || '').replace(/\D/g, '').slice(0, 15),
  };
}

function normalizeProfilePhoneNumber(value, country = 'PH') {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits || isProfileDialCodeOnly(digits, country)) return '';

  const phoneNumber = parseProfileContactNumber(value, country);
  return phoneNumber?.number || `+${digits}`;
}

function validateProfilePhoneNumber(value, country = 'PH') {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits || isProfileDialCodeOnly(digits, country)) {
    return 'This field is required.';
  }

  const phoneNumber = parseProfileContactNumber(value, country);
  return phoneNumber?.isValid()
    ? ''
    : 'Contact number does not match the selected country code.';
}

function getProfileFieldErrorNext(field, value, phoneCountry = 'PH') {
  const fieldValue = String(value || '').trim();

  if (
    PROFILE_REQUIRED_FIELDS.includes(field) &&
    (!fieldValue || fieldValue === 'N/A')
  ) {
    return 'This field is required.';
  }

  if (!fieldValue) return '';

  if (field === 'fullName' && !/^[a-zA-ZÀ-ÿ\s]+$/.test(fieldValue)) {
    return 'Full name must contain letters and spaces only.';
  }

  if (
    field === 'preferredNickname' &&
    !/^[a-zA-ZÀ-ÿ\s/]+$/.test(fieldValue)
  ) {
    return 'Preferred nickname must contain letters, spaces, and / only.';
  }

  if (field === 'contactNumber') {
    return validateProfilePhoneNumber(fieldValue, phoneCountry);
  }

  if (field === 'emailAddress' && !isValidProfileEmail(fieldValue)) {
    return 'Email address format is invalid';
  }

  if (field === 'birthday' && !isValidProfileDate(fieldValue)) {
    return 'Enter a valid date.';
  }

  return '';
}

function getProfileFormErrorsNext(form, phoneCountry = 'PH') {
  return PROFILE_REQUIRED_FIELDS.reduce((errors, field) => {
    const error = getProfileFieldErrorNext(field, form[field], phoneCountry);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const SUPPORTING_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_PROFILE_FILE_SIZE = 5 * 1024 * 1024;

export default function DentistProfile() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileCloseConfirmModal, setShowProfileCloseConfirmModal] =
    useState(false);
  const [profileSaveConfirmModal, setProfileSaveConfirmModal] = useState(null);

  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState(initialProfile);
  const [profileId, setProfileId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileEditError, setProfileEditError] = useState('');
  const [profileTouchedFields, setProfileTouchedFields] = useState({});
  const [profileInputErrors, setProfileInputErrors] = useState({});
  const [editPhoneCountry, setEditPhoneCountry] = useState('PH');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [documentDeleteConfirm, setDocumentDeleteConfirm] = useState(null);
  const [photoRemoveConfirm, setPhotoRemoveConfirm] = useState(false);

  const [showProfileSuccessModal, setShowProfileSuccessModal] = useState(false);
  const [previousWork, setPreviousWork] = useState([]);
  const [showWorkConfirmModal, setShowWorkConfirmModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [workForm, setWorkForm] = useState({
    company_name: '',
    position: '',
    start_month: '',
    end_month: '',
    reason_for_leaving: '',
  });

  const [savingWork, setSavingWork] = useState(false);
  const [workErrors, setWorkErrors] = useState({});

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const profilePhotoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistProfileStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const age = useMemo(() => {
    return calculateAge(profile.birthday);
  }, [profile.birthday]);

  const editAge = useMemo(() => {
    return calculateAge(editForm.birthday);
  }, [editForm.birthday]);

  const displaySuffix = String(profile.suffix || '').trim() || 'N/A';

  const avatarLetter =
    String(profile.fullName || 'D').trim().charAt(0).toUpperCase() || 'D';
  const profilePhotoUrl = profileFileUrl(profile.profilePhotoUrl);

  const disabledInputStyle = useMemo(() => {
    return { ...styles.formInput, opacity: 0.65, cursor: 'not-allowed' };
  }, [styles.formInput]);

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);
      setProfileError('');

      try {
        const res = await api.get('/auth/staff-profile/me');
        const mappedProfile = staffProfileToDentistProfile(res.data.profile);

        setProfileId(res.data.profile.profileId);
        setProfile(mappedProfile);
        setEditForm(mappedProfile);
      } catch (err) {
        setProfileError(
          err.response?.data?.message || 'Failed to load dentist profile.'
        );
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    loadPreviousWork();
  }, []);

  async function loadPreviousWork() {
      try {
          const res = await api.get(
              '/auth/staff-profile/me/previous-work'
          );

          setPreviousWork(res.data.previousWork || []);
      } catch {
          setPreviousWork([]);
      }
  }

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
        showEditModal ||
        showWorkModal ||
        showWorkConfirmModal ||
        showProfileCloseConfirmModal ||
        profileSaveConfirmModal ||
        showProfileSuccessModal ||
        documentDeleteConfirm ||
        photoRemoveConfirm
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
      showEditModal,
      showWorkModal,
      showWorkConfirmModal,
      showProfileSuccessModal,
      showProfileCloseConfirmModal,
      profileSaveConfirmModal,
      documentDeleteConfirm,
      photoRemoveConfirm,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();

        if (showEditModal) {
          requestCloseEditModal();
        }

        closeWorkModal();
        setShowProfileCloseConfirmModal(false);
        setProfileSaveConfirmModal(null);
        setShowProfileSuccessModal(false);
        setDocumentDeleteConfirm(null);
        setPhotoRemoveConfirm(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEditModal, editForm, profile]);

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function openEditModal() {
    const phoneValue = getProfilePhoneFormValue(profile.contactNumber, 'PH');

    setEditForm(profile);
    setEditPhoneCountry(phoneValue.country);
    setEditPhoneNumber(phoneValue.number);
    setProfileEditError('');
    setProfileTouchedFields({});
    setProfileInputErrors({});
    setShowEditModal(true);
  }

  function closeEditModal() {
    const phoneValue = getProfilePhoneFormValue(profile.contactNumber, 'PH');

    setEditForm(profile);
    setEditPhoneCountry(phoneValue.country);
    setEditPhoneNumber(phoneValue.number);
    setProfileEditError('');
    setProfileTouchedFields({});
    setProfileInputErrors({});
    setShowProfileCloseConfirmModal(false);
    setProfileSaveConfirmModal(null);
    setShowEditModal(false);
  }

  function requestCloseEditModal() {
    setShowProfileCloseConfirmModal(true);
  }

  function closeProfileCloseConfirmModal() {
    setShowProfileCloseConfirmModal(false);
  }

  function confirmCloseProfileDetails() {
    closeEditModal();
  }

  function handleLogoutOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function handleEditOverlayClick(event) {
    if (event.target === event.currentTarget) {
      requestCloseEditModal();
    }
  }

  function openWorkModal() {
      setWorkForm({
          company_name: '',
          position: '',
          start_month: '',
          end_month: '',
          reason_for_leaving: '',
      });

      setWorkErrors({});
      setShowWorkModal(true);
  }

  function closeWorkModal() {
      if (savingWork) {
          return;
      }

      setWorkErrors({});
      setShowWorkConfirmModal(false);
      setShowWorkModal(false);
  }

  function handleWorkOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeWorkModal();
    }
  }

  function getWorkSaveDetails() {
      return [
          {
              label: 'Company Name',
              value: workForm.company_name.trim() || 'Not entered',
          },
          {
              label: 'Position',
              value: workForm.position.trim() || 'Not entered',
          },
          {
              label: 'Start Month',
              value: workForm.start_month
                  ? formatWorkMonth(workForm.start_month)
                  : 'Not entered',
          },
          {
              label: 'End Month',
              value: workForm.end_month
                  ? formatWorkMonth(workForm.end_month)
                  : 'Not entered',
          },
          {
              label: 'Reason for Leaving',
              value:
                  workForm.reason_for_leaving.trim() ||
                  'Not provided',
          },
      ];
  }

  function closeWorkConfirmModal() {
      if (savingWork) {
          return;
      }

      setShowWorkConfirmModal(false);
  }

  async function confirmSaveWork() {
      if (savingWork) {
          return;
      }

      const companyName = workForm.company_name.trim();
      const position = workForm.position.trim();
      const startMonth = workForm.start_month;
      const endMonth = workForm.end_month;
      const reasonForLeaving = workForm.reason_for_leaving.trim();

      setSavingWork(true);

      try {
          await api.post('/auth/staff-profile/me/previous-work', {
              company_name: companyName,
              position: position,
              start_month: startMonth,
              end_month: endMonth,
              reason_for_leaving: reasonForLeaving || null,
          });

          await loadPreviousWork();

          setShowWorkConfirmModal(false);
          closeWorkModal();
      } catch (err) {
          setWorkErrors({
              form:
                  err.response?.data?.message ||
                  'Failed to save work history.',
          });

          setShowWorkConfirmModal(false);
      } finally {
          setSavingWork(false);
      }
  }

  function handleAddWork(event) {
      event.preventDefault();

      const errors = {};

      const companyName = workForm.company_name.trim();
      const position = workForm.position.trim();
      const startMonth = workForm.start_month;
      const endMonth = workForm.end_month;
      const reasonForLeaving = workForm.reason_for_leaving.trim();

      // Validate Company Name
      if (!companyName) {
          errors.company_name = 'Company name is required.';
      } else if (companyName.length < 2) {
          errors.company_name =
              'Company name must be at least 2 characters.';
      } else if (!/^[A-Za-z\s.'&,()-]+$/.test(companyName)) {
          errors.company_name =
              'Company name must contain letters and spaces only.';
      }

      // Validate Position
      if (!position) {
          errors.position = 'Position is required.';
      } else if (position.length < 2) {
          errors.position =
              'Position must be at least 2 characters.';
      } else if (!/^[A-Za-z\s.'&,()-]+$/.test(position)) {
          errors.position =
              'Position must contain letters and spaces only.';
      }

      // Validate Start Month
      if (!startMonth) {
          errors.start_month = 'Start month is required.';
      }

      // Validate End Month
      if (!endMonth) {
          errors.end_month = 'End month is required.';
      } else if (startMonth && endMonth < startMonth) {
          errors.end_month =
              'End month cannot be earlier than the start month.';
      }

      // Validate Reason for Leaving
      if (
          reasonForLeaving &&
          !/^[A-Za-z\s.'&,()-]+$/.test(reasonForLeaving)
      ) {
          errors.reason_for_leaving =
              'Reason for leaving must contain letters and spaces only.';
      }

      setWorkErrors(errors);

      if (Object.keys(errors).length > 0) {
          return;
      }

      setShowWorkConfirmModal(true);
  }

  async function handleDeleteWork(id) {
    if (!window.confirm('Remove this work history entry?')) {
      return;
    }

    try {
      await api.delete(`/auth/staff-profile/me/previous-work/${id}`);
      setPreviousWork((prev) => prev.filter((work) => work.id !== id));
    } catch {
      loadPreviousWork();
    }
  }

  function formatWorkMonth(dateStr) {
    if (!dateStr) {
      return '';
    }

    const date = new Date(dateStr);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  function handleEditChange(name, value) {
    const rawValue = String(value || '');
    let nextValue = rawValue;
    let inputError = '';

    if (name === 'fullName') {
      if (/[^a-zA-ZÀ-ÿ\s]/.test(rawValue)) {
        inputError = 'Full name must contain letters and spaces only.';
      }

      nextValue = rawValue;
    } else if (name === 'preferredNickname') {
      if (/[^a-zA-ZÀ-ÿ\s/]/.test(rawValue)) {
        inputError =
          'Preferred nickname must contain letters, spaces, and / only.';
      }

      nextValue = rawValue;
    } else {
      nextValue = filterProfileFieldValue(name, value);
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setProfileTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    setProfileInputErrors((prev) => ({
      ...prev,
      [name]: inputError,
    }));

    const nextError = getProfileFieldErrorNext(
      name,
      nextValue,
      editPhoneCountry
    );

    if (!nextError && !inputError) {
      setProfileEditError('');
    }
  }

  function handleProfilePhoneChange(value) {
    const nextNumber = String(value || '').replace(/\D/g, '').slice(0, 15);
    const normalizedContact = normalizeProfilePhoneNumber(nextNumber, editPhoneCountry);

    setEditPhoneNumber(nextNumber);
    setEditForm((prev) => ({
      ...prev,
      contactNumber: normalizedContact,
    }));
    setProfileTouchedFields((prev) => ({
      ...prev,
      contactNumber: true,
    }));

    if (!validateProfilePhoneNumber(nextNumber, editPhoneCountry)) {
      setProfileEditError('');
    }
  }

  function handleProfilePhoneCountryChange(country) {
    const normalizedContact = normalizeProfilePhoneNumber(editPhoneNumber, country);

    setEditPhoneCountry(country);
    setEditForm((prev) => ({
      ...prev,
      contactNumber: normalizedContact,
    }));
    setProfileTouchedFields((prev) => ({
      ...prev,
      contactNumber: true,
    }));

    if (!validateProfilePhoneNumber(editPhoneNumber, country)) {
      setProfileEditError('');
    }
  }

  function isProfileFormComplete(form = editForm) {
    return Object.keys(getProfileFormErrorsNext(form, editPhoneCountry)).length === 0;
  }

  function getVisibleProfileFieldError(field) {
    if (!profileTouchedFields[field]) return '';

    if (profileInputErrors[field]) {
      return profileInputErrors[field];
    }

    if (field === 'contactNumber') {
      return validateProfilePhoneNumber(editPhoneNumber, editPhoneCountry);
    }

    return getProfileFieldErrorNext(
      field,
      editForm[field],
      editPhoneCountry
    );
  }

  function getProfileInputStyle(field, extraStyle = {}) {
    const error = getVisibleProfileFieldError(field);

    return {
      ...styles.formInput,
      ...extraStyle,
      ...(error ? styles.formInputInvalid : {}),
    };
  }

  function getProfileSaveDetails(nextProfile) {
    return [
      'fullName',
      'preferredNickname',
      'suffix',
      'birthday',
      'religion',
      'nationality',
      'contactNumber',
      'emailAddress',
      'homeAddress',
    ].map((field) => ({
      label: PROFILE_FIELD_LABELS[field],
      value: String(nextProfile[field] || '').trim() || 'Not entered',
    }));
  }

  function handleSaveProfileRequest(event) {
    event.preventDefault();

    const nextProfile = {
      ...editForm,
      contactNumber: normalizeProfilePhoneNumber(editPhoneNumber, editPhoneCountry),
      suffix: String(editForm.suffix || '').trim(),
    };

    const formErrors = getProfileFormErrorsNext(nextProfile, editPhoneCountry);
    if (Object.keys(formErrors).length > 0) {
      setProfileTouchedFields((prev) => ({
        ...prev,
        ...Object.keys(formErrors).reduce((fields, field) => {
          fields[field] = true;
          return fields;
        }, {}),
      }));
      setProfileEditError(
        Object.values(formErrors)[0] || 'Please complete all required profile details before saving.'
      );
      return;
    }

    setProfileSaveConfirmModal({
      nextProfile,
      details: getProfileSaveDetails(nextProfile),
    });
  }

  function closeProfileSaveConfirmModal() {
    setProfileSaveConfirmModal(null);
  }

  async function confirmSaveProfile() {
    if (!profileSaveConfirmModal?.nextProfile) {
      return;
    }

    const nextProfile = profileSaveConfirmModal.nextProfile;

    setSavingProfile(true);
    setProfileError('');
    setProfileEditError('');
    setProfileSaveConfirmModal(null);

    try {
      const res = await api.patch('/auth/staff-profile/me', dentistProfileToStaffPayload(nextProfile));

      const mappedProfile = staffProfileToDentistProfile(res.data.profile);
      const phoneValue = getProfilePhoneFormValue(
        mappedProfile.contactNumber,
        editPhoneCountry
      );

      setProfileId(res.data.profile.profileId || profileId);
      setProfile(mappedProfile);
      setEditForm(mappedProfile);
      setEditPhoneCountry(phoneValue.country);
      setEditPhoneNumber(phoneValue.number);
      setProfileTouchedFields({});
      setProfileInputErrors({});
      setShowEditModal(false);
      setShowProfileSuccessModal(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save dentist profile.';

      setProfileError(message);
      setProfileEditError(message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function patchSelfProfile(data) {
    const res = await api.patch('/auth/staff-profile/me', data);
    const mappedProfile = staffProfileToDentistProfile(res.data.profile);
    setProfileId(res.data.profile.profileId || profileId);
    setProfile(mappedProfile);
    setEditForm(mappedProfile);
    publishDentistProfilePhoto(profileFileUrl(mappedProfile.profilePhotoUrl));
    return mappedProfile;
  }

  async function handleProfilePhotoFile(file) {
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setProfileError('Profile photo must be a JPG or PNG file.');
      return;
    }
    if (file.size > MAX_PROFILE_FILE_SIZE) {
      setProfileError('Profile photo must be 5MB or smaller.');
      return;
    }

    const data = new FormData();
    data.append('profilePhoto', file);
    setUploadingProfilePhoto(true);
    setProfileError('');

    try {
      await patchSelfProfile(data);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingProfilePhoto(false);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
    }
  }

  async function confirmRemoveProfilePhoto() {
    const data = new FormData();
    data.append('removeProfilePhoto', JSON.stringify(true));
    setUploadingProfilePhoto(true);
    setProfileError('');

    try {
      await patchSelfProfile(data);
      setPhotoRemoveConfirm(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingProfilePhoto(false);
    }
  }

  async function handleDocumentFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const invalid = files.find((file) =>
      !SUPPORTING_DOCUMENT_TYPES.includes(file.type) ||
      file.size > MAX_PROFILE_FILE_SIZE
    );

    if (invalid) {
      setProfileError('Attachments must be PDF, JPG, or PNG files up to 5MB each.');
      return;
    }

    const data = new FormData();
    files.forEach((file) => data.append('supportingDocuments', file));
    setUploadingDocuments(true);
    setProfileError('');

    try {
      await patchSelfProfile(data);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to upload attachments.');
    } finally {
      setUploadingDocuments(false);
      if (documentInputRef.current) documentInputRef.current.value = '';
    }
  }

  async function confirmDeleteDocument() {
    if (!documentDeleteConfirm?.id) return;

    const data = new FormData();
    data.append('removeDocumentIds', JSON.stringify([documentDeleteConfirm.id]));
    setUploadingDocuments(true);
    setProfileError('');

    try {
      await patchSelfProfile(data);
      setDocumentDeleteConfirm(null);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to delete attachment.');
    } finally {
      setUploadingDocuments(false);
    }
  }

  async function exportProfileToPDF() {
    const { jsPDF, autoTable } = await loadPdfTools();
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
      doc.text('Dentist Profile Report', 14, 20);

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
            cellWidth: 60,
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
      const documents = Array.isArray(profile.supportingDocuments)
        ? profile.supportingDocuments
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
        const fileUrl = profileFileUrl(document.file_url);
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
            doc.text(formatProfileFileSize(document.file_size), 68, yPosition + 14);
            yPosition += 40;
            continue;
          } catch (_) {}
        }

        autoTable(doc, {
          startY: yPosition,
          theme: 'grid',
          body: [['Attachment', `${label}\n${formatProfileFileSize(document.file_size)}`]],
          margin: { left: 14, right: 14 },
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.25,
          },
          columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
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

    doc.setFillColor(212, 175, 55);
    doc.circle(26, 53.5, 9, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(avatarLetter, 26, 57, {
      align: 'center',
    });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(safeValue(profile.fullName), 40, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Dentist Profile', 40, 58);
    doc.text(`Profile ID: ${safeValue(profileId)}`, 40, 64);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(139, 101, 8);
    doc.text(`Specialization: ${safeValue(profile.specialization)}`, pageWidth - 20, 58, {
      align: 'right',
    });
    doc.text(`Experience: ${safeValue(profile.yearsOfExperience)}`, pageWidth - 20, 64, {
      align: 'right',
    });

    let nextY = 76;

    nextY = addSection(
      'Profile Summary',
      [
        ['Full Name', safeValue(profile.fullName)],
        ['Specialization', safeValue(profile.specialization)],
        ['Medical Degree', safeValue(profile.medicalDegree)],
        ['Medical License Number', safeValue(profile.medicalLicenseNumber)],
        ['Years of Experience', safeValue(profile.yearsOfExperience)],
        ['Employment Type', safeValue(profile.employmentType)],
      ],
      nextY
    );

    nextY = addSection(
      'Personal Information',
      [
        ['Full Name', safeValue(profile.fullName)],
        ['Preferred Nickname', safeValue(profile.preferredNickname)],
        ['Suffix', safeValue(displaySuffix)],
        ['Birthday', safeValue(profile.birthday)],
        ['Age', safeValue(age)],
        ['Religion', safeValue(profile.religion)],
        ['Nationality', safeValue(profile.nationality)],
        ['Home Address', safeValue(profile.homeAddress)],
        ['Contact Number', safeValue(profile.contactNumber)],
        ['Email Address', safeValue(profile.emailAddress)],
      ],
      nextY
    );

    nextY = addSection(
      'Work Details',
      [
        ['Specialization', safeValue(profile.specialization)],
        ['Start Date', safeValue(profile.startDate)],
        ['Employment Type', safeValue(profile.employmentType)],
        ['Shift Type', safeValue(profile.shiftType)],
        ['Work Schedule Days', safeValue(profile.workScheduleDays)],
        ['Work Hours', safeValue(profile.workHours)],
      ],
      nextY
    );

    nextY = addSection(
      'Professional Information',
      [
        ['Medical Degree', safeValue(profile.medicalDegree)],
        ['Medical License Number', safeValue(profile.medicalLicenseNumber)],
        ['Specialization', safeValue(profile.specialization)],
        ['Years of Experience', safeValue(profile.yearsOfExperience)],
      ],
      nextY
    );

    const previousWorkRows = previousWork.length === 0
        ? [['Previous Work', 'No previous work found.']]
        : previousWork.map((entry, index) => [
            `Work ${index + 1}`,
            [
              `Company: ${safeValue(entry.company_name)}`,
              `Position: ${safeValue(entry.position)}`,
              `Period: ${entry.start_month ? formatWorkMonth(entry.start_month) : 'N/A'}${
                entry.end_month
                  ? ` - ${formatWorkMonth(entry.end_month)}`
                  : ' - Present'
              }`,
              `Reason for Leaving: ${safeValue(entry.reason_for_leaving)}`,
            ].join('\n'),
          ]);

    nextY = addSection('Previous Work History', previousWorkRows, nextY);

    nextY = await addAttachmentsSection(nextY);

    const totalPdfPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPdfPages; page += 1) {
      doc.setPage(page);
      drawFooter();
    }

    doc.save('dentist_profile_report.pdf');
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/dentist" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/dentistAppointment" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link to="/dentistRecords" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link
            to="/dentistProfile"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>View Profile</span>
          </Link>

          <Link to="/dentistSchedule" style={styles.menuItem}>
            <i className="fi fi-rr-calendar" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>My Schedule</span>
          </Link>

          <Link to="/dentistNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
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
            <DentistProfileMenu
              styles={styles}
              dentistName={loadingProfile ? '...' : profile.fullName}
              specialization={loadingProfile ? '...' : profile.role}
              profilePhotoUrl={profilePhotoUrl}
            />
          </div>
        </header>

        <main style={styles.mainContent}>
          {profileError && <div style={styles.errorBanner}>{profileError}</div>}

          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Dentist Profile</span>

              <h2 style={styles.heroTitle}>
                View and update your professional profile
              </h2>

              <p style={styles.heroText}>
                Manage your personal details, professional records, work
                schedule, and clinic information.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i className="fi fi-rr-id-badge" style={styles.heroIconText}></i>
            </div>
          </section>

      {loadingProfile ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: '#64748b',
            fontSize: '15px',
          }}
        >
          <i
            className="fi fi-rr-spinner"
            style={{ marginRight: 8 }}
          ></i>
          Loading profile...
        </div>
      ) : (
        <>
          <section style={styles.profileHeader}>
            <div style={styles.profileLeft}>
              <button
                type="button"
                style={styles.profileAvatarButton}
                onClick={() => profilePhotoInputRef.current?.click()}
                title="Change profile photo"
                disabled={uploadingProfilePhoto}
              >
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt=""
                    style={styles.profileAvatarImg}
                  />
                ) : (
                  <span>{avatarLetter}</span>
                )}

                <span style={styles.profileAvatarCamera}>
                  <i
                    className={
                      uploadingProfilePhoto
                        ? 'fi fi-rr-spinner'
                        : 'fi fi-rr-camera'
                    }
                  ></i>
                </span>
              </button>

              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(event) =>
                  handleProfilePhotoFile(event.target.files?.[0])
                }
              />

              <div>
                <h1 style={styles.profileName}>
                  {profile.fullName}
                </h1>

                <p style={styles.profileSubtext}>
                  {profile.role}
                </p>

                {profilePhotoUrl && (
                  <button
                    type="button"
                    style={styles.removePhotoBtn}
                    onClick={() => setPhotoRemoveConfirm(true)}
                    disabled={uploadingProfilePhoto}
                  >
                    <i className="fi fi-rr-trash"></i>
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            <div style={styles.profileActions}>
              <button
                type="button"
                style={styles.editBtn}
                onClick={openEditModal}
              >
                <i className="fi fi-rr-edit"></i>
                Edit Profile
              </button>

              <button
                type="button"
                style={styles.pdfBtn}
                onClick={exportProfileToPDF}
              >
                <i
                  className="fi fi-rr-file-pdf"
                  style={styles.pdfBtnIcon}
                ></i>
                PDF
              </button>
            </div>
          </section>

          <section style={styles.profileGrid}>
            <div style={styles.card}>
              <CardTitle
                styles={styles}
                icon="fi fi-rr-user"
                title="Personal Information"
              />

              <div style={styles.infoGrid}>
                <InfoItem
                  styles={styles}
                  label="Full Name"
                  value={profile.fullName}
                />

                <InfoItem
                  styles={styles}
                  label="Preferred Nickname"
                  value={profile.preferredNickname}
                />

                <InfoItem
                  styles={styles}
                  label="Suffix"
                  value={displaySuffix}
                />

                <InfoItem
                  styles={styles}
                  label="Birthday"
                  value={profile.birthday || 'N/A'}
                />

                <InfoItem
                  styles={styles}
                  label="Age"
                  value={age}
                />

                <InfoItem
                  styles={styles}
                  label="Religion"
                  value={profile.religion}
                />

                <InfoItem
                  styles={styles}
                  label="Nationality"
                  value={profile.nationality}
                />

                <InfoItem
                  styles={styles}
                  label="Home Address"
                  value={profile.homeAddress}
                  full
                />

                <InfoItem
                  styles={styles}
                  label="Contact Number"
                  value={profile.contactNumber}
                />

                <InfoItem
                  styles={styles}
                  label="Email Address"
                  value={profile.emailAddress}
                />
              </div>
            </div>

            <div style={styles.card}>
              <CardTitle
                styles={styles}
                icon="fi fi-rr-calendar-clock"
                title="Work Details"
              />

              <div style={styles.infoGrid}>
                <InfoItem
                  styles={styles}
                  label="Specialization"
                  value={profile.specialization}
                />

                <InfoItem
                  styles={styles}
                  label="Start Date"
                  value={profile.startDate}
                />

                <InfoItem
                  styles={styles}
                  label="Employment Type"
                  value={profile.employmentType}
                />

                <InfoItem
                  styles={styles}
                  label="Shift Type"
                  value={profile.shiftType}
                />

                <InfoItem
                  styles={styles}
                  label="Work Schedule Days"
                  value={profile.workScheduleDays}
                  full
                />

                <InfoItem
                  styles={styles}
                  label="Work Hours"
                  value={profile.workHours}
                />
              </div>
            </div>

            <div
              style={{
                ...styles.card,
                ...styles.fullCard,
              }}
            >
              <CardTitle
                styles={styles}
                icon="fi fi-rr-briefcase"
                title="Professional Information"
              />

              <div style={styles.infoGridFour}>
                <InfoItem
                  styles={styles}
                  label="Medical Degree"
                  value={profile.medicalDegree}
                />

                <InfoItem
                  styles={styles}
                  label="Medical License Number"
                  value={profile.medicalLicenseNumber}
                />

                <InfoItem
                  styles={styles}
                  label="Specialization"
                  value={profile.specialization}
                />

                <InfoItem
                  styles={styles}
                  label="Years of Experience"
                  value={profile.yearsOfExperience}
                />
              </div>

              <DentistAttachments
                styles={styles}
                documents={profile.supportingDocuments}
                inputRef={documentInputRef}
                uploading={uploadingDocuments}
                onAddFiles={handleDocumentFiles}
                onDelete={setDocumentDeleteConfirm}
              />

              <div style={styles.previousWorkSection}>
                <div style={styles.previousWorkHeader}>
                  <div style={styles.previousWorkTitleGroup}>
                    <div style={styles.previousWorkTitleIcon}>
                      <i className="fi fi-rr-briefcase"></i>
                    </div>

                    <div style={styles.previousWorkTitleContent}>
                      <div style={styles.previousWorkTitleRow}>
                        <h3 style={styles.previousWorkTitle}>
                          Previous Work
                        </h3>

                        <span style={styles.previousWorkCount}>
                          {previousWork.length}
                        </span>
                      </div>

                      <p style={styles.previousWorkSubtitle}>
                        Your previous employment history.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openWorkModal}
                    style={styles.addWorkBtn}
                  >
                    <i className="fi fi-rr-plus"></i>
                    <span>Add Work</span>
                  </button>
                </div>

                {previousWork.length === 0 ? (
                  <div style={styles.previousWorkEmpty}>
                    <div style={styles.previousWorkEmptyIcon}>
                      <i className="fi fi-rr-briefcase"></i>
                    </div>

                    <h4 style={styles.previousWorkEmptyTitle}>
                      No previous work found
                    </h4>

                    <p style={styles.previousWorkEmptyText}>
                      Add your previous employment details to your profile.
                    </p>

                    <button
                      type="button"
                      onClick={openWorkModal}
                      style={styles.previousWorkEmptyBtn}
                    >
                      <i className="fi fi-rr-plus"></i>
                      Add Your First Work
                    </button>
                  </div>
                ) : (
                  <div style={styles.previousWorkList}>
                    {previousWork.map((entry, index) => (
                      <div
                        key={entry.id}
                        style={styles.previousWorkCard}
                      >
                        <div style={styles.previousWorkCardIcon}>
                          <i className="fi fi-rr-briefcase"></i>
                        </div>

                        <div style={styles.previousWorkCompanyBlock}>
                          <span style={styles.previousWorkNumber}>
                            Work {index + 1}
                          </span>

                          <h4 style={styles.previousWorkCompany}>
                            {entry.company_name || 'N/A'}
                          </h4>

                          <p style={styles.previousWorkPosition}>
                            {entry.position || 'N/A'}
                          </p>
                        </div>

                        <div style={styles.previousWorkPeriodBlock}>
                          <span style={styles.previousWorkSectionLabel}>
                            Employment Period
                          </span>

                          <div style={styles.previousWorkMeta}>
                            <span style={styles.previousWorkMetaItem}>
                              <i
                                className="fi fi-rr-calendar"
                                style={styles.previousWorkMetaIcon}
                              ></i>

                              <span>
                                {entry.start_month
                                  ? formatWorkMonth(entry.start_month)
                                  : 'N/A'}

                                {' - '}

                                {entry.end_month
                                  ? formatWorkMonth(entry.end_month)
                                  : 'Present'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div style={styles.previousWorkReasonBlock}>
                          <span style={styles.previousWorkSectionLabel}>
                            Reason for Leaving
                          </span>

                          <span style={styles.previousWorkReasonText}>
                            {entry.reason_for_leaving || 'N/A'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteWork(entry.id)
                          }
                          style={styles.previousWorkDeleteBtn}
                          title="Remove work history"
                          aria-label={`Remove ${entry.company_name} work history`}
                        >
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {showEditModal && (
        <div style={styles.editOverlay} onClick={handleEditOverlayClick}>
          <div style={styles.editModalBox}>
            <div style={styles.editModalHeader}>
              <h2 style={styles.editModalTitle}>Edit Dentist Profile</h2>

              <button
                type="button"
                style={styles.modalClose}
                onClick={requestCloseEditModal}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <form style={styles.editForm} onSubmit={handleSaveProfileRequest}>
              {profileEditError && (
                <p style={styles.editErrorText}>{profileEditError}</p>
              )}

              <div style={styles.formGrid}>
                <FormGroup
                  styles={styles}
                  label="Full Name"
                  required
                  error={getVisibleProfileFieldError('fullName')}
                >
                  <input
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={(event) =>
                      handleEditChange('fullName', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, fullName: true }))
                    }
                    style={getProfileInputStyle('fullName')}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Preferred Nickname" error={getVisibleProfileFieldError('preferredNickname')}>
                  <input
                    type="text"
                    name="preferredNickname"
                    value={editForm.preferredNickname}
                    onChange={(event) =>
                      handleEditChange('preferredNickname', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({
                        ...prev,
                        preferredNickname: true,
                      }))
                    }
                    style={getProfileInputStyle('preferredNickname')}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Suffix">
                  <select
                    name="suffix"
                    value={String(editForm.suffix || '')}
                    onChange={(event) =>
                      handleEditChange('suffix', event.target.value)
                    }
                    style={styles.formInput}
                  >
                    <option value="">None</option>

                    {SUFFIX_OPTIONS.map((suffix) => (
                      <option key={suffix} value={suffix}>
                        {suffix}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup
                  styles={styles}
                  label="Birthday"
                  required
                  error={getVisibleProfileFieldError('birthday')}
                >
                  <input
                    type="date"
                    name="birthday"
                    value={editForm.birthday}
                    onChange={(event) =>
                      handleEditChange('birthday', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, birthday: true }))
                    }
                    style={getProfileInputStyle('birthday')}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Age">
                  <input
                    type="text"
                    name="age"
                    value={editAge === 'N/A' ? '' : editAge}
                    readOnly
                    style={disabledInputStyle}
                  />
                </FormGroup>

                <FormGroup
                  styles={styles}
                  label="Religion"
                  required
                  error={getVisibleProfileFieldError('religion')}
                >
                  <select
                    name="religion"
                    value={
                      RELIGION_OPTIONS.includes(editForm.religion)
                        ? editForm.religion
                        : ''
                    }
                    onChange={(event) =>
                      handleEditChange('religion', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, religion: true }))
                    }
                    style={getProfileInputStyle('religion')}
                  >
                    <option value="">Select Religion</option>
                    {RELIGION_OPTIONS.map((religion) => (
                      <option key={religion} value={religion}>
                        {religion}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup
                  styles={styles}
                  label="Nationality"
                  required
                  error={getVisibleProfileFieldError('nationality')}
                >
                  <select
                    name="nationality"
                    value={
                      NATIONALITY_OPTIONS.includes(editForm.nationality)
                        ? editForm.nationality
                        : ''
                    }
                    onChange={(event) =>
                      handleEditChange('nationality', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, nationality: true }))
                    }
                    style={getProfileInputStyle('nationality')}
                  >
                    <option value="">Select Nationality</option>
                    {NATIONALITY_OPTIONS.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup
                  styles={styles}
                  label="Contact Number"
                  required
                  error={getVisibleProfileFieldError('contactNumber')}
                >
                  <div style={styles.phoneInputContainer}>
                    <select
                      value={editPhoneCountry}
                      onChange={(event) =>
                        handleProfilePhoneCountryChange(event.target.value)
                      }
                      style={{
                        ...styles.phoneCountrySelect,
                        ...(getVisibleProfileFieldError('contactNumber')
                          ? styles.phoneInputError
                          : {}),
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
                      name="contactNumber"
                      value={editPhoneNumber}
                      onChange={(event) => handleProfilePhoneChange(event.target.value)}
                      onBlur={() =>
                        setProfileTouchedFields((prev) => ({ ...prev, contactNumber: true }))
                      }
                      placeholder="9123456789"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={15}
                      style={{
                        ...styles.phoneInput,
                        ...(getVisibleProfileFieldError('contactNumber')
                          ? styles.phoneInputError
                          : {}),
                      }}
                    />
                  </div>
                </FormGroup>

                <FormGroup
                  styles={styles}
                  label="Email Address"
                  required
                  error={getVisibleProfileFieldError('emailAddress')}
                >
                  <input
                    type="email"
                    name="emailAddress"
                    value={editForm.emailAddress}
                    onChange={(event) =>
                      handleEditChange('emailAddress', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, emailAddress: true }))
                    }
                    style={getProfileInputStyle('emailAddress')}
                  />
                </FormGroup>

                <FormGroup
                  styles={styles}
                  label="Home Address"
                  full
                  required
                  error={getVisibleProfileFieldError('homeAddress')}
                >
                  <textarea
                    name="homeAddress"
                    value={editForm.homeAddress}
                    onChange={(event) =>
                      handleEditChange('homeAddress', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, homeAddress: true }))
                    }
                    style={getProfileInputStyle('homeAddress', styles.formTextarea)}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Medical Degree">
                  <input
                    type="text"
                    name="medicalDegree"
                    value={editForm.medicalDegree}
                    onChange={(event) =>
                      handleEditChange('medicalDegree', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Medical License Number">
                  <input
                    type="text"
                    name="medicalLicenseNumber"
                    value={editForm.medicalLicenseNumber}
                    onChange={(event) =>
                      handleEditChange(
                        'medicalLicenseNumber',
                        event.target.value
                      )
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Specialization">
                  <input
                    type="text"
                    name="specialization"
                    value={editForm.specialization}
                    onChange={(event) =>
                      handleEditChange('specialization', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Years of Experience">
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={editForm.yearsOfExperience}
                    onChange={(event) =>
                      handleEditChange('yearsOfExperience', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Start Date">
                  <input
                    type="date"
                    name="startDate"
                    value={editForm.startDate === 'N/A' ? '' : editForm.startDate}
                    onChange={(event) =>
                      handleEditChange('startDate', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Employment Type">
                  <input
                    type="text"
                    name="employmentType"
                    value={editForm.employmentType}
                    onChange={(event) =>
                      handleEditChange('employmentType', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Shift Type">
                  <input
                    type="text"
                    name="shiftType"
                    value={editForm.shiftType}
                    onChange={(event) =>
                      handleEditChange('shiftType', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Work Hours">
                  <input
                    type="text"
                    name="workHours"
                    value={editForm.workHours}
                    onChange={(event) =>
                      handleEditChange('workHours', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Work Schedule Days" full>
                  <input
                    type="text"
                    name="workScheduleDays"
                    value={editForm.workScheduleDays}
                    onChange={(event) =>
                      handleEditChange('workScheduleDays', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>
              </div>

              {workErrors.form && (
                  <div style={styles.workFormError}>
                      <i className="fi fi-rr-circle-exclamation"></i>
                      <span>{workErrors.form}</span>
                  </div>
              )}

              <div style={styles.editModalActions}>
                <button
                  type="submit"
                  style={{
                    ...styles.saveBtn,
                    ...(!isProfileFormComplete(editForm) || savingProfile
                      ? styles.disabledBtn
                      : {}),
                  }}
                  disabled={!isProfileFormComplete(editForm) || savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileSuccessModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowProfileSuccessModal(false);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#ecfdf3',
                color: '#16a34a',
              }}
            >
              <span style={styles.modalIconText}>✓</span>
            </div>

            <h2 style={styles.modalTitle}>Profile Updated Successfully</h2>

            <p style={styles.modalText}>
              Your dentist profile has been updated successfully.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  ...styles.saveBtn,
                }}
                onClick={() => setShowProfileSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {profileSaveConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeProfileSaveConfirmModal();
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, background: '#fff8df', color: '#d4af37' }}>
              <i className="fi fi-rr-user-pen" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Profile Changes</h2>
            <p style={styles.modalText}>Please review the details before saving this profile.</p>

            <div style={styles.confirmDetailsList}>
              {profileSaveConfirmModal.details.map((detail) => (
                <div key={detail.label} style={styles.confirmDetailRow}>
                  <span style={styles.confirmDetailLabel}>{detail.label}</span>
                  <strong style={styles.confirmDetailValue}>{detail.value}</strong>
                </div>
              ))}
            </div>

            {profileEditError && (
              <p style={{ ...styles.modalText, color: '#dc2626' }}>{profileEditError}</p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                disabled={savingProfile}
                onClick={closeProfileSaveConfirmModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={savingProfile}
                onClick={confirmSaveProfile}
              >
                {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileCloseConfirmModal && (
        <div
          style={styles.modal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeProfileCloseConfirmModal();
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Close Profile Details</h2>
            <p style={styles.modalText}>
              Are you sure you want to close? Any unsaved profile details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeProfileCloseConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCloseProfileDetails}
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showWorkModal && !showWorkConfirmModal && (
        <div style={styles.editOverlay} onClick={handleWorkOverlayClick}>
          <div style={{ ...styles.editModalBox, maxWidth: 560 }}>
            <div style={styles.editModalHeader}>
              <div style={styles.editModalHeading}>
                <div style={styles.editModalIcon}>
                  <i className="fi fi-rr-briefcase"></i>
                </div>

                <div>
                  <h2 style={styles.editModalTitle}>Add Work History</h2>
                  <p style={styles.editModalSubtitle}>
                    Add your previous employment details to your profile.
                  </p>
                </div>
              </div>

              <button
                type="button"
                style={styles.modalClose}
                onClick={closeWorkModal}
                disabled={savingWork}
                aria-label="Close"
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <form style={styles.editForm} onSubmit={handleAddWork}>
              <div style={styles.formSection}>
                <div style={styles.formSectionHeader}>
                  <span style={styles.formStep}>01</span>

                  <div>
                    <h3 style={styles.formSectionTitle}>Employment Details</h3>
                    <p style={styles.formSectionText}>
                      Enter the company and position you held.
                    </p>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <FormGroup
                      styles={styles}
                      label="Company Name"
                      required
                      error={workErrors.company_name}
                  >
                      <input
                          type="text"
                          value={workForm.company_name}
                          onChange={(event) => {
                              const value = event.target.value;

                              setWorkForm((form) => ({
                                  ...form,
                                  company_name: value,
                              }));

                              let error = '';

                              if (!value.trim()) {
                                  error = 'Company name is required.';
                              } else if (value.trim().length < 2) {
                                  error = 'Company name must be at least 2 characters.';
                              } else if (!/^[A-Za-z\s.'&,()-]+$/.test(value.trim())) {
                                  error =
                                      'Company name must contain letters and spaces only.';
                              }

                              setWorkErrors((errors) => ({
                                  ...errors,
                                  company_name: error,
                              }));
                          }}
                          style={{
                              ...styles.formInput,
                              ...(workErrors.company_name
                                  ? styles.formInputInvalid
                                  : {}),
                          }}
                          placeholder="Enter company name"
                      />
                  </FormGroup>

                  <FormGroup
                      styles={styles}
                      label="Position"
                      required
                      error={workErrors.position}
                  >
                      <input
                          type="text"
                          value={workForm.position}
                          onChange={(event) => {
                              const value = event.target.value;

                              setWorkForm((form) => ({
                                  ...form,
                                  position: value,
                              }));

                              let error = '';

                              if (!value.trim()) {
                                  error = 'Position is required.';
                              } else if (value.trim().length < 2) {
                                  error = 'Position must be at least 2 characters.';
                              } else if (!/^[A-Za-z\s.'&,()-]+$/.test(value.trim())) {
                                  error =
                                      'Position must contain letters and spaces only.';
                              }

                              setWorkErrors((errors) => ({
                                  ...errors,
                                  position: error,
                              }));
                          }}
                          style={{
                              ...styles.formInput,
                              ...(workErrors.position
                                  ? styles.formInputInvalid
                                  : {}),
                          }}
                          placeholder="e.g. Dental Assistant"
                      />
                  </FormGroup>

                  <FormGroup
                      styles={styles}
                      label="Reason for Leaving"
                      error={workErrors.reason_for_leaving}
                      full
                  >
                      <input
                          type="text"
                          value={workForm.reason_for_leaving}
                          onChange={(event) => {
                              const value = event.target.value;

                              setWorkForm((form) => ({
                                  ...form,
                                  reason_for_leaving: value,
                              }));

                              let error = '';

                              if (
                                  value.trim() &&
                                  !/^[A-Za-z\s.'&,()-]+$/.test(value.trim())
                              ) {
                                  error =
                                      'Reason for leaving must contain letters and spaces only.';
                              }

                              setWorkErrors((errors) => ({
                                  ...errors,
                                  reason_for_leaving: error,
                              }));
                          }}
                          style={{
                              ...styles.formInput,
                              ...(workErrors.reason_for_leaving
                                  ? styles.formInputInvalid
                                  : {}),
                          }}
                          placeholder="Optional"
                      />
                  </FormGroup>
                </div>
              </div>

              <div style={styles.formSection}>
                <div style={styles.formSectionHeader}>
                  <span style={styles.formStep}>02</span>

                  <div>
                    <h3 style={styles.formSectionTitle}>Employment Period</h3>
                    <p style={styles.formSectionText}>
                      Specify when you started and ended this position.
                    </p>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <FormGroup
                      styles={styles}
                      label="Start Month"
                      required
                      error={workErrors.start_month}
                  >
                      <input
                          type="month"
                          value={workForm.start_month}
                          onChange={(event) => {
                              const value = event.target.value;

                              setWorkForm((form) => ({
                                  ...form,
                                  start_month: value,
                              }));

                              if (workErrors.start_month) {
                                  setWorkErrors((errors) => ({
                                      ...errors,
                                      start_month: '',
                                  }));
                              }
                          }}
                          style={{
                              ...styles.formInput,
                              ...(workErrors.start_month
                                  ? styles.formInputInvalid
                                  : {}),
                          }}
                      />
                  </FormGroup>

                  <FormGroup
                      styles={styles}
                      label="End Month"
                      required
                      error={workErrors.end_month}
                  >
                      <input
                          type="month"
                          value={workForm.end_month}
                          min={workForm.start_month || undefined}
                          onChange={(event) => {
                              const value = event.target.value;

                              setWorkForm((form) => ({
                                  ...form,
                                  end_month: value,
                              }));

                              if (workErrors.end_month) {
                                  setWorkErrors((errors) => ({
                                      ...errors,
                                      end_month: '',
                                  }));
                              }
                          }}
                          style={{
                              ...styles.formInput,
                              ...(workErrors.end_month
                                  ? styles.formInputInvalid
                                  : {}),
                          }}
                      />
                  </FormGroup>
                </div>
              </div>

              {workErrors.form && (
                  <div style={styles.workFormError}>
                      <i className="fi fi-rr-circle-exclamation"></i>
                      <span>{workErrors.form}</span>
                  </div>
              )}

              <div style={styles.editModalActions}>
                <button
                  type="button"
                  style={styles.cancelEditBtn}
                  onClick={closeWorkModal}
                  disabled={savingWork}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...styles.saveBtn,
                    ...(savingWork ? styles.disabledBtn : {}),
                  }}
                  disabled={savingWork}
                >
                  {savingWork ? 'Saving...' : 'Save Work History'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWorkConfirmModal && (
          <div
              style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9999,
                  backgroundColor: 'rgba(15, 23, 42, 0.58)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                  boxSizing: 'border-box',
              }}
              onClick={(event) => {
                  if (event.target === event.currentTarget) {
                      closeWorkConfirmModal();
                  }
              }}
          >
              <div
                  style={{
                      width: '100%',
                      maxWidth: 500,
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      backgroundColor: '#ffffff',
                      borderRadius: 18,
                      padding: '28px 30px',
                      boxSizing: 'border-box',
                      boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)',
                      fontFamily: 'Arial, sans-serif',
                  }}
              >
                  <div
                      style={{
                          width: 52,
                          height: 52,
                          margin: '0 auto 14px',
                          borderRadius: 14,
                          backgroundColor: '#fff8df',
                          border: '1px solid #ead9a6',
                          color: '#b8860b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                      }}
                  >
                      <i className="fi fi-rr-briefcase"></i>
                  </div>

                  <h2
                      style={{
                          margin: '0 0 7px',
                          textAlign: 'center',
                          color: '#172033',
                          fontSize: 20,
                          fontWeight: 800,
                      }}
                  >
                      Confirm Work History
                  </h2>

                  <p
                      style={{
                          margin: '0 auto',
                          maxWidth: 380,
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: 12,
                          lineHeight: 1.5,
                      }}
                  >
                      Please review all work history details before saving.
                  </p>

                  <div
                      style={{
                          marginTop: 22,
                          marginBottom: 20,
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                      }}
                  >
                      {getWorkSaveDetails().map((detail, index) => (
                          <div
                              key={detail.label}
                              style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'space-between',
                                  gap: 16,
                                  padding: '12px 14px',
                                  backgroundColor:
                                      index % 2 === 0 ? '#f8fafc' : '#ffffff',
                                  borderBottom:
                                      index <
                                      getWorkSaveDetails().length - 1
                                          ? '1px solid #edf0f4'
                                          : 'none',
                                  boxSizing: 'border-box',
                              }}
                          >
                              <span
                                  style={{
                                      color: '#64748b',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      flexShrink: 0,
                                  }}
                              >
                                  {detail.label}
                              </span>

                              <strong
                                  style={{
                                      color: '#172033',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      textAlign: 'right',
                                      maxWidth: '60%',
                                      wordBreak: 'break-word',
                                      lineHeight: 1.4,
                                  }}
                              >
                                  {detail.value}
                              </strong>
                          </div>
                      ))}
                  </div>

                  {workErrors.form && (
                      <div
                          style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              marginBottom: 16,
                              padding: '10px 12px',
                              borderRadius: 10,
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontSize: 11,
                              fontWeight: 600,
                              lineHeight: 1.4,
                          }}
                      >
                          <i className="fi fi-rr-circle-exclamation"></i>
                          <span>{workErrors.form}</span>
                      </div>
                  )}

                  <div
                      style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: 10,
                          paddingTop: 4,
                      }}
                  >
                      <button
                          type="button"
                          onClick={closeWorkConfirmModal}
                          disabled={savingWork}
                          style={{
                              height: 42,
                              minWidth: 120,
                              padding: '0 16px',
                              border: '1px solid #dbe2ea',
                              borderRadius: 10,
                              backgroundColor: '#ffffff',
                              color: '#475569',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: savingWork
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity: savingWork ? 0.6 : 1,
                              fontFamily: 'Arial, sans-serif',
                              boxSizing: 'border-box',
                          }}
                      >
                          Review
                      </button>

                      <button
                          type="button"
                          onClick={confirmSaveWork}
                          disabled={savingWork}
                          style={{
                              height: 42,
                              minWidth: 145,
                              padding: '0 18px',
                              border: '1px solid #b8860b',
                              borderRadius: 10,
                              backgroundColor: '#b8860b',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: savingWork
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity: savingWork ? 0.7 : 1,
                              fontFamily: 'Arial, sans-serif',
                              boxSizing: 'border-box',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 7,
                          }}
                      >
                          {savingWork ? (
                              <>
                                  Saving...
                              </>
                          ) : (
                              <>
                                  Confirm
                              </>
                          )}
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
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-trash" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Delete Attachment</h2>
            <p style={styles.modalText}>
              Are you sure you want to delete {documentDeleteConfirm.file_name || 'this attachment'}?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setDocumentDeleteConfirm(null)}
                disabled={uploadingDocuments}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmDeleteDocument}
                disabled={uploadingDocuments}
              >
                {uploadingDocuments ? 'Deleting...' : 'Yes'}
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
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-trash" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Remove Photo</h2>
            <p style={styles.modalText}>
              Are you sure you want to remove your profile photo?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={() => setPhotoRemoveConfirm(false)}
                disabled={uploadingProfilePhoto}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmRemoveProfilePhoto}
                disabled={uploadingProfilePhoto}
              >
                {uploadingProfilePhoto ? 'Removing...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div style={styles.modal} onClick={handleLogoutOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Logout</h2>

            <p style={styles.modalText}>
              Are you sure you want to log out?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  ...styles.cancelBtn,
                }}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  ...styles.logoutBtn,
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  </div>
</div>
);
}

function DentistAttachments({
  styles,
  documents = [],
  inputRef,
  uploading = false,
  onAddFiles,
  onDelete,
}) {
  const files = Array.isArray(documents) ? documents : [];

  return (
    <div style={styles.attachmentsBlock}>
      <div style={styles.attachmentsHeader}>
        <div>
          <h3 style={styles.attachmentsTitle}>Attachments</h3>
          <p style={styles.attachmentsHint}>License, certifications, resume</p>
        </div>
      </div>

      <div
        style={styles.attachmentDropzone}
        onClick={() => inputRef?.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onAddFiles(event.dataTransfer.files);
        }}
      >
        <i className="fi fi-rr-upload" style={styles.attachmentUploadIcon}></i>
        <strong>{uploading ? 'Uploading...' : 'Drop files here or click to upload'}</strong>
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

      {files.length === 0 ? (
        <div style={styles.attachmentEmpty}>
          <div style={styles.attachmentEmptyIcon}>
            <i className="fi fi-rr-folder-open"></i>
          </div>
          <strong style={styles.attachmentEmptyTitle}>
            No attachments uploaded
          </strong>
          <span style={styles.attachmentEmptyText}>
            Upload your license, certifications, or resume.
          </span>
        </div>
      ) : (
        <div style={styles.attachmentList}>
          {files.map((document) => {
            const fileUrl = profileFileUrl(document.file_url);

            return (
              <div
                key={document.id || document.file_url}
                style={styles.attachmentItem}
              >
                <div style={styles.attachmentFileIcon}>
                  <i className="fi fi-rr-document"></i>
                </div>

                <div style={styles.attachmentInfo}>
                  <strong style={styles.attachmentName}>
                    {document.file_name || 'Attachment'}
                  </strong>

                  <div style={styles.attachmentMetaRow}>
                    <span style={styles.attachmentMeta}>
                      {formatProfileFileSize(document.file_size)}
                    </span>

                    <span style={styles.attachmentDot}>•</span>

                    <span style={styles.attachmentType}>
                      Document
                    </span>
                  </div>
                </div>

                <div style={styles.attachmentActions}>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.attachmentViewBtn}
                    title="View attachment"
                    aria-label={`View ${document.file_name || 'attachment'}`}
                  >
                    <i className="fi fi-rr-eye"></i>
                    <span>View</span>
                  </a>

                  <button
                    type="button"
                    style={styles.attachmentDeleteBtn}
                    onClick={() => onDelete(document)}
                    title="Delete attachment"
                    aria-label={`Delete ${document.file_name || 'attachment'}`}
                  >
                    <i className="fi fi-rr-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toDateInputValue(value) {
  if (!value || value === 'N/A') {
    return '';
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function staffProfileToDentistProfile(staffProfile = {}) {
  const workStart = staffProfile.workStartTime || '';
  const workEnd = staffProfile.workEndTime || '';

  return {
    fullName:
      [
        staffProfile.firstName,
        staffProfile.middleName,
        staffProfile.lastName,
      ]
        .filter(Boolean)
        .join(' ') || initialProfile.fullName,
    firstName: staffProfile.firstName || '',
    middleName: staffProfile.middleName || '',
    lastName: staffProfile.lastName || '',
    preferredNickname: staffProfile.nickname || 'N/A',
    suffix: staffProfile.suffix || '',
    birthday: toDateInputValue(staffProfile.birthday),
    religion: staffProfile.religion || 'N/A',
    nationality: staffProfile.nationality || 'N/A',
    homeAddress: staffProfile.homeAddress || 'N/A',
    contactNumber: staffProfile.contactNumber || 'N/A',
    emailAddress: staffProfile.email || 'N/A',
    role: 'Dentist',

    specialization:
      staffProfile.specialization ||
      staffProfile.workDepartment ||
      'Specialization',
    startDate: toDateInputValue(staffProfile.startDate) || 'N/A',
    employmentType: staffProfile.employmentType || 'N/A',
    shiftType: staffProfile.shiftType || 'N/A',
    workScheduleDays: staffProfile.workDays || 'N/A',
    workStartTime: workStart,
    workEndTime: workEnd,
    workHours: workStart && workEnd ? `${workStart} - ${workEnd}` : 'N/A',

    medicalDegree: staffProfile.medicalDegree || 'N/A',
    medicalLicenseNumber: staffProfile.licenseNumber || 'N/A',
    yearsOfExperience: staffProfile.yearsExperience ?? 'N/A',
    profilePhotoUrl: staffProfile.profilePhotoUrl || '',
    supportingDocuments: Array.isArray(staffProfile.supportingDocuments)
      ? staffProfile.supportingDocuments
      : [],
  };
}

function profileFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^(https?:|blob:|data:)/i.test(fileUrl)) return fileUrl;
  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

function publishDentistProfilePhoto(profilePhotoUrl) {
  if (profilePhotoUrl) {
    localStorage.setItem('toothconnect_dentist_profile_photo_url', profilePhotoUrl);
  } else {
    localStorage.removeItem('toothconnect_dentist_profile_photo_url');
  }

  window.dispatchEvent(new CustomEvent('dentist-profile-photo-updated', {
    detail: { profilePhotoUrl },
  }));
}

function formatProfileFileSize(value) {
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

function splitFullName(profile) {
  const parts = String(profile.fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] || '',
      middleName: '',
      lastName: parts[0] || '',
    };
  }

  return {
    firstName: parts[0],
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts[parts.length - 1],
  };
}

function emptyIfNa(value) {
  return value === 'N/A' ? '' : value;
}

function dentistProfileToStaffPayload(profile) {
  const nameParts = splitFullName(profile);

  const [workStartTime, workEndTime] = String(profile.workHours || '').includes(
    '-'
  )
    ? profile.workHours.split('-').map((part) => part.trim())
    : [profile.workStartTime || '', profile.workEndTime || ''];

  return {
    firstName: nameParts.firstName,
    middleName: nameParts.middleName,
    lastName: nameParts.lastName,
    nickname: emptyIfNa(profile.preferredNickname),
    suffix: profile.suffix || '',
    birthday: profile.birthday || null,
    age:
      calculateAge(profile.birthday) === 'N/A'
        ? null
        : calculateAge(profile.birthday),
    religion: emptyIfNa(profile.religion),
    nationality: emptyIfNa(profile.nationality),
    homeAddress: emptyIfNa(profile.homeAddress),
    contactNumber: emptyIfNa(profile.contactNumber),
    email: emptyIfNa(profile.emailAddress),
    position: 'Dentist',
    specialization: emptyIfNa(profile.specialization),
    medicalDegree: emptyIfNa(profile.medicalDegree),
    licenseNumber: emptyIfNa(profile.medicalLicenseNumber),
    yearsExperience: emptyIfNa(profile.yearsOfExperience) || 0,
    startDate: emptyIfNa(profile.startDate) || null,
    employmentType: emptyIfNa(profile.employmentType),
    shiftType: emptyIfNa(profile.shiftType),
    workDays: emptyIfNa(profile.workScheduleDays),
    workStartTime,
    workEndTime,
  };
}

function calculateAge(dateValue) {
  if (!dateValue || dateValue === 'N/A') {
    return 'N/A';
  }

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return 'N/A';
  }

  const today = new Date();

  let currentAge = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    currentAge -= 1;
  }

  return currentAge;
}

function CardTitle({ styles, icon, title }) {
  return (
    <div style={styles.cardTitle}>
      <i className={icon} style={styles.cardTitleIcon}></i>
      <h2 style={styles.cardTitleText}>{title}</h2>
    </div>
  );
}

function InfoItem({ styles, label, value, full = false }) {
  return (
    <div style={{ ...styles.infoItem, ...(full ? styles.infoItemFull : {}) }}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || 'N/A'}</strong>
    </div>
  );
}

function FormGroup({ styles, label, children, full = false, required = false, error = '' }) {
  return (
    <div style={{ ...styles.formGroup, ...(full ? styles.formGroupFull : {}) }}>
      <label style={styles.formLabel}>
        {label}
        {required && <span style={styles.requiredMark}>*</span>}
      </label>
      {children}
      {error && <span style={styles.fieldErrorText}>{error}</span>}
    </div>
  );
}

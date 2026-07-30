import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import api from '../api/axios';
import createRecepProfileStyles from '../styles/RecepProfile';

const initialProfile = {
  fullName: 'Receptionist Name',
  preferredNickname: 'N/A',
  suffix: '',
  birthday: '',
  religion: 'N/A',
  nationality: 'N/A',
  homeAddress: 'N/A',
  contactNumber: 'N/A',
  emailAddress: 'N/A',
  role: 'Receptionist',

  specialization: 'Receptionist',
  startDate: 'N/A',
  employmentType: 'N/A',
  shiftType: 'N/A',
  workScheduleDays: 'N/A',
  workHours: 'N/A',

  medicalDegree: 'N/A',
  medicalLicenseNumber: 'N/A',
  yearsOfExperience: 'N/A',
  skills: 'N/A',
  profilePhotoUrl: '',
  supportingDocuments: [],
};

const SUFFIX_OPTIONS = ['Jr', 'Sr', 'II', 'III', 'IV'];
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

const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const SUPPORTING_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_PROFILE_FILE_SIZE = 5 * 1024 * 1024;

export default function RecepProfile() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState(initialProfile);
  const [profileId, setProfileId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileEditError, setProfileEditError] = useState('');
  const [profileTouchedFields, setProfileTouchedFields] = useState({});
  const [showProfileCloseConfirmModal, setShowProfileCloseConfirmModal] = useState(false);
  const [profileSaveConfirmModal, setProfileSaveConfirmModal] = useState(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [documentDeleteConfirm, setDocumentDeleteConfirm] = useState(null);
  const [photoRemoveConfirm, setPhotoRemoveConfirm] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const profilePhotoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createRecepProfileStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const age = useMemo(() => {
    return calculateAge(profile.birthday);
  }, [profile.birthday]);

  const displaySuffix = String(profile.suffix || '').trim() || 'N/A';

  const avatarLetter =
    String(profile.fullName || 'R').trim().charAt(0).toUpperCase() || 'R';
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
        const mappedProfile = staffProfileToRecepProfile(res.data.profile);
        setProfileId(res.data.profile.profileId);
        setProfile(mappedProfile);
        setEditForm(mappedProfile);
      } catch (err) {
        setProfileError(
          err.response?.data?.message || 'Failed to load receptionist profile.'
        );
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
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
      showProfileCloseConfirmModal ||
      profileSaveConfirmModal ||
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
    showProfileCloseConfirmModal,
    profileSaveConfirmModal,
    documentDeleteConfirm,
    photoRemoveConfirm,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        setDocumentDeleteConfirm(null);
        setPhotoRemoveConfirm(false);
        setProfileSaveConfirmModal(null);
        setShowProfileCloseConfirmModal(false);
        if (showEditModal) {
          requestCloseEditModal();
        }
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

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/receptionist');
  }

  function openEditModal() {
    setEditForm(profile);
    setProfileEditError('');
    setProfileTouchedFields({});
    setShowEditModal(true);
  }

  function closeEditModal() {
    setEditForm(profile);
    setProfileEditError('');
    setProfileTouchedFields({});
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

  function handleEditChange(name, value) {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setProfileTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
    setProfileEditError('');
  }

  function isProfileFormComplete(form = editForm) {
    return PROFILE_REQUIRED_FIELDS.every(
      (field) => String(form[field] ?? '').trim() !== ''
    );
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
      suffix: String(editForm.suffix || '').trim(),
    };

    if (!isProfileFormComplete(nextProfile)) {
      setProfileTouchedFields(
        PROFILE_REQUIRED_FIELDS.reduce((fields, field) => {
          fields[field] = true;
          return fields;
        }, {})
      );
      setProfileEditError('Please complete all required profile details before saving.');
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
      const res = await api.patch(
        '/auth/staff-profile/me',
        recepProfileToStaffPayload(nextProfile)
      );

      const mappedProfile = staffProfileToRecepProfile(res.data.profile);
      setProfileId(res.data.profile.profileId || profileId);
      setProfile(mappedProfile);
      setEditForm(mappedProfile);
      setProfileTouchedFields({});
      setShowEditModal(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save receptionist profile.';
      setProfileError(message);
      setProfileEditError(message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function patchSelfProfile(data) {
    const res = await api.patch('/auth/staff-profile/me', data);
    const mappedProfile = staffProfileToRecepProfile(res.data.profile);
    setProfileId(res.data.profile.profileId || profileId);
    setProfile(mappedProfile);
    setEditForm(mappedProfile);
    publishReceptionistProfilePhoto(profileFileUrl(mappedProfile.profilePhotoUrl));
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

  return (
    <div style={styles.page}>
      <div style={styles.mainContainer}>
        <header style={styles.topHeader}>
          <button
            type="button"
            onClick={handleBack}
            style={styles.backButton}
          >
            <span style={styles.backButtonText}>Back</span>
          </button>
        </header>

        <main style={styles.mainContent}>
          {profileError && <div style={styles.errorBanner}>{profileError}</div>}

          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Receptionist Profile</span>

              <h2 style={styles.heroTitle}>View and update your profile</h2>

              <p style={styles.heroText}>
                Manage your personal details and clinic profile information in
                one place.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i className="fi fi-rr-id-badge" style={styles.heroIconText}></i>
            </div>
          </section>

          {loadingProfile ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b', fontSize: '15px' }}>
              <i className="fi fi-rr-spinner" style={{ marginRight: 8 }}></i>
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
                  <img src={profilePhotoUrl} alt="" style={styles.profileAvatarImg} />
                ) : (
                  <span>{avatarLetter}</span>
                )}
                <span style={styles.profileAvatarCamera}>
                  <i className={uploadingProfilePhoto ? 'fi fi-rr-spinner' : 'fi fi-rr-camera'}></i>
                </span>
              </button>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(event) => handleProfilePhotoFile(event.target.files?.[0])}
              />

              <div>
                <h1 style={styles.profileName}>{profile.fullName}</h1>
                <p style={styles.profileSubtext}>{profile.role}</p>
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

            <button
              type="button"
              style={styles.editBtn}
              onClick={openEditModal}
            >
              <i className="fi fi-rr-edit"></i>
              Edit Profile
            </button>
          </section>

          <section style={styles.profileGrid}>
            <div style={styles.card}>
              <CardTitle
                styles={styles}
                icon="fi fi-rr-user"
                title="Personal Information"
              />

              <div style={styles.personalInfoGrid}>
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

                <InfoItem styles={styles} label="Age" value={age} />

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
                  label="Role"
                  value={profile.role}
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

            <div style={{ ...styles.card, ...styles.fullCard }}>
              <CardTitle
                styles={styles}
                icon="fi fi-rr-briefcase"
                title="Professional Information"
              />

              <div style={styles.infoGridFour}>
                <InfoItem
                  styles={styles}
                  label="Position"
                  value={profile.role}
                />

                <InfoItem
                  styles={styles}
                  label="Access Role"
                  value={profile.role}
                />

                <InfoItem
                  styles={styles}
                  label="Skills"
                  value={profile.skills}
                />

                <InfoItem
                  styles={styles}
                  label="Years of Experience"
                  value={profile.yearsOfExperience}
                />
              </div>

              <RecepAttachments
                styles={styles}
                documents={profile.supportingDocuments}
                inputRef={documentInputRef}
                uploading={uploadingDocuments}
                onAddFiles={handleDocumentFiles}
                onDelete={setDocumentDeleteConfirm}
              />
            </div>
          </section>
            </>
          )}
        </main>
      </div>

      {showEditModal && (
        <div style={styles.editOverlay} onClick={handleEditOverlayClick}>
          <div style={styles.editModalBox}>
            <div style={styles.editModalHeader}>
              <h2 style={styles.editModalTitle}>Edit Receptionist Profile</h2>

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
                <FormGroup styles={styles} label="Full Name">
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
                    style={{
                      ...styles.formInput,
                      ...(profileTouchedFields.fullName && !String(editForm.fullName || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Preferred Nickname">
                  <input
                    type="text"
                    name="preferredNickname"
                    value={editForm.preferredNickname}
                    onChange={(event) =>
                      handleEditChange('preferredNickname', event.target.value)
                    }
                    style={styles.formInput}
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

                <FormGroup styles={styles} label="Birthday">
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
                    style={{
                      ...styles.formInput,
                      ...(profileTouchedFields.birthday && !String(editForm.birthday || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Religion">
                  <input
                    type="text"
                    name="religion"
                    value={editForm.religion}
                    onChange={(event) =>
                      handleEditChange('religion', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, religion: true }))
                    }
                    style={{
                      ...styles.formInput,
                      ...(profileTouchedFields.religion && !String(editForm.religion || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Nationality">
                  <input
                    type="text"
                    name="nationality"
                    value={editForm.nationality}
                    onChange={(event) =>
                      handleEditChange('nationality', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, nationality: true }))
                    }
                    style={{
                      ...styles.formInput,
                      ...(profileTouchedFields.nationality && !String(editForm.nationality || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Contact Number">
                  <input
                    type="text"
                    name="contactNumber"
                    value={editForm.contactNumber}
                    onChange={(event) =>
                      handleEditChange('contactNumber', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, contactNumber: true }))
                    }
                    style={{
                      ...styles.formInput,
                      ...(profileTouchedFields.contactNumber && !String(editForm.contactNumber || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Email Address">
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
                    style={{
                      ...styles.formInput,
                      ...(profileTouchedFields.emailAddress && !String(editForm.emailAddress || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Home Address" full>
                  <textarea
                    name="homeAddress"
                    value={editForm.homeAddress}
                    onChange={(event) =>
                      handleEditChange('homeAddress', event.target.value)
                    }
                    onBlur={() =>
                      setProfileTouchedFields((prev) => ({ ...prev, homeAddress: true }))
                    }
                    style={{
                      ...styles.formInput,
                      ...styles.formTextarea,
                      ...(profileTouchedFields.homeAddress && !String(editForm.homeAddress || '').trim()
                        ? styles.formInputInvalid
                        : {}),
                    }}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Position">
                  <input
                    type="text"
                    name="role"
                    value={editForm.role}
                    onChange={(event) =>
                      handleEditChange('role', event.target.value)
                    }
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Access Role">
                  <input
                    type="text"
                    name="accessRole"
                    value={editForm.role}
                    style={disabledInputStyle}
                    disabled
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Skills">
                  <input
                    type="text"
                    name="skills"
                    value={editForm.skills}
                    onChange={(event) =>
                      handleEditChange('skills', event.target.value)
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

              <div style={styles.editModalActions}>
                <button
                  type="button"
                  style={styles.cancelEditBtn}
                  onClick={closeEditModal}
                  disabled={savingProfile}
                >
                  Cancel
                </button>

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
                {savingProfile ? 'Saving...' : 'Save Changes'}
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
                Yes
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

function toDateInputValue(value) {
  if (!value || value === 'N/A') return '';

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

function staffProfileToRecepProfile(staffProfile = {}) {
  const workStart = staffProfile.workStartTime || '';
  const workEnd = staffProfile.workEndTime || '';

  return {
    fullName:
      [staffProfile.firstName, staffProfile.middleName, staffProfile.lastName]
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
    role: 'Receptionist',

    specialization: 'Receptionist',
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
    skills: staffProfile.skills || 'N/A',
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

function publishReceptionistProfilePhoto(profilePhotoUrl) {
  if (profilePhotoUrl) {
    localStorage.setItem('toothconnect_receptionist_profile_photo_url', profilePhotoUrl);
  } else {
    localStorage.removeItem('toothconnect_receptionist_profile_photo_url');
  }

  window.dispatchEvent(new CustomEvent('receptionist-profile-photo-updated', {
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

function splitFullName(profile) {
  const parts = String(profile.fullName || '').trim().split(/\s+/).filter(Boolean);

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

function recepProfileToStaffPayload(profile) {
  const nameParts = splitFullName(profile);

  const [workStartTime, workEndTime] = String(profile.workHours || '').includes('-')
    ? profile.workHours.split('-').map((part) => part.trim())
    : [profile.workStartTime || '', profile.workEndTime || ''];

  const calculatedAge = calculateAge(profile.birthday);

  return {
    firstName: nameParts.firstName,
    middleName: nameParts.middleName,
    lastName: nameParts.lastName,
    nickname: emptyIfNa(profile.preferredNickname),
    suffix: profile.suffix || '',
    birthday: profile.birthday || null,
    age: calculatedAge === 'N/A' ? null : calculatedAge,
    religion: emptyIfNa(profile.religion),
    nationality: emptyIfNa(profile.nationality),
    homeAddress: emptyIfNa(profile.homeAddress),
    contactNumber: emptyIfNa(profile.contactNumber),
    email: emptyIfNa(profile.emailAddress),

    position: 'Receptionist',
    specialization: 'Receptionist',
    skills: emptyIfNa(profile.skills),
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
  if (!dateValue || dateValue === 'N/A') return 'N/A';

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) return 'N/A';

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

function InfoItem({ styles, label, value, full = false, wide = false }) {
  return (
    <div
      style={{
        ...styles.infoItem,
        ...(full ? styles.infoItemFull : {}),
        ...(wide ? styles.infoItemWide : {}),
      }}
    >
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || 'N/A'}</strong>
    </div>
  );
}

function RecepAttachments({
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
        <div style={styles.attachmentEmpty}>No attachments uploaded.</div>
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
                  <span style={styles.attachmentMeta}>
                    {formatProfileFileSize(document.file_size)}
                  </span>
                </div>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.attachmentActionBtn}
                  title="View attachment"
                >
                  <i className="fi fi-rr-eye"></i>
                </a>

                <button
                  type="button"
                  style={{ ...styles.attachmentActionBtn, ...styles.attachmentDeleteBtn }}
                  onClick={() => onDelete(document)}
                  title="Delete attachment"
                >
                  <i className="fi fi-rr-trash"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormGroup({ styles, label, children, full = false }) {
  return (
    <div style={{ ...styles.formGroup, ...(full ? styles.formGroupFull : {}) }}>
      <label style={styles.formLabel}>{label}</label>
      {children}
    </div>
  );
}

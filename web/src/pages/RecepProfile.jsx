import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

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

  specialization: 'Receptionist',
  startDate: 'N/A',
  employmentType: 'N/A',
  shiftType: 'N/A',
  workScheduleDays: 'N/A',
  workHours: 'N/A',

  medicalDegree: 'N/A',
  medicalLicenseNumber: 'N/A',
  yearsOfExperience: 'N/A',
};

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

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

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
    if (showLogoutModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showEditModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeEditModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
    setShowEditModal(true);
  }

  function closeEditModal() {
    setEditForm(profile);
    setShowEditModal(false);
  }

  function handleLogoutOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function handleEditOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeEditModal();
    }
  }

  function handleEditChange(name, value) {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    const nextProfile = {
      ...profile,
      ...editForm,
      suffix: String(editForm.suffix || '').trim(),
    };

    setSavingProfile(true);
    setProfileError('');

    try {
      const res = await api.patch(
        '/auth/staff-profile/me',
        recepProfileToStaffPayload(nextProfile)
      );

      const mappedProfile = staffProfileToRecepProfile(res.data.profile);
      setProfileId(res.data.profile.profileId || profileId);
      setProfile(mappedProfile);
      setEditForm(mappedProfile);
      setShowEditModal(false);
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Failed to save receptionist profile.'
      );
      alert(err.response?.data?.message || 'Failed to save receptionist profile.');
    } finally {
      setSavingProfile(false);
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
            <i className="fi fi-rr-angle-left" style={styles.backButtonIcon}></i>
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
              <div style={styles.profileAvatar}>{avatarLetter}</div>

              <div>
                <h1 style={styles.profileName}>{profile.fullName}</h1>
                <p style={styles.profileSubtext}>Receptionist Profile</p>
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
            <div style={{ ...styles.card, ...styles.personalInfoCard }}>
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
                  wide
                />
              </div>
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
                onClick={closeEditModal}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <form style={styles.editForm} onSubmit={handleSaveProfile}>
              <div style={styles.formGrid}>
                <FormGroup styles={styles} label="Full Name">
                  <input
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={(event) =>
                      handleEditChange('fullName', event.target.value)
                    }
                    style={styles.formInput}
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
                  <input
                    type="text"
                    name="suffix"
                    placeholder="N/A"
                    value={editForm.suffix}
                    onChange={(event) =>
                      handleEditChange('suffix', event.target.value)
                    }
                    style={styles.formInput}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Birthday">
                  <input
                    type="date"
                    name="birthday"
                    value={editForm.birthday}
                    onChange={(event) =>
                      handleEditChange('birthday', event.target.value)
                    }
                    style={styles.formInput}
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
                    style={styles.formInput}
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
                    style={styles.formInput}
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
                    style={styles.formInput}
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
                    style={styles.formInput}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Home Address" full>
                  <textarea
                    name="homeAddress"
                    value={editForm.homeAddress}
                    onChange={(event) =>
                      handleEditChange('homeAddress', event.target.value)
                    }
                    style={{ ...styles.formInput, ...styles.formTextarea }}
                  />
                </FormGroup>
              </div>

              <div style={styles.editModalActions}>
                <button
                  type="submit"
                  style={{
                    ...styles.saveBtn,
                    ...(savingProfile ? styles.disabledBtn : {}),
                  }}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  style={styles.cancelEditBtn}
                  onClick={closeEditModal}
                  disabled={savingProfile}
                >
                  Cancel
                </button>
              </div>
            </form>
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
  };
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

function FormGroup({ styles, label, children, full = false }) {
  return (
    <div style={{ ...styles.formGroup, ...(full ? styles.formGroupFull : {}) }}>
      <label style={styles.formLabel}>{label}</label>
      {children}
    </div>
  );
}
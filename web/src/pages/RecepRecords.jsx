import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { getPatientProfile, listPatients, updateStaffPatientProfile } from '../api/patients';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepRecordsStyles from '../styles/RecepRecords';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

const rowsPerPage = 10;
const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'];
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
const PH_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

export default function RecepRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [editModalReadOnly, setEditModalReadOnly] = useState(true);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [searchText, setSearchText] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [patients, setPatients] = useState([]);

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1000;

  const styles = createRecepRecordsStyles({
    isMobile,
    isVerySmall,
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
    fetchPatients();
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
    if (showLogoutModal || showDetailsModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showDetailsModal, showEditModal]);

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
    setCurrentPage(1);
  }, [searchText, genderFilter]);

  const filteredPatients = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();
    const genderValue = genderFilter.toLowerCase();

    return patients.filter((patient) => {
      const searchData = `${patient.id} ${patient.lastName} ${patient.firstName} ${patient.middleName} ${patient.email} ${patient.contactNumber}`.toLowerCase();
      const matchesSearch = searchData.includes(searchValue);
      const matchesGender =
        genderValue === 'all' ||
        String(patient.gender).toLowerCase() === genderValue;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchText, genderFilter]);

  const totalPages =
    filteredPatients.length === 0
      ? 0
      : Math.ceil(filteredPatients.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage((page) => fixPage(page, totalPages));
  }, [totalPages]);

  const pagedPatients = useMemo(() => {
    const start = currentPage > 0 ? (currentPage - 1) * rowsPerPage : 0;

    return filteredPatients.slice(start, start + rowsPerPage);
  }, [filteredPatients, currentPage]);

  const receptionistName = user?.name || user?.email || 'Receptionist';

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function closeAllModals() {
    setShowLogoutModal(false);
    setShowDetailsModal(false);
    setShowEditModal(false);
  }

  async function fetchPatients() {
    try {
      const data = await listPatients();
      setPatients(normalizePatients(data));
    } catch (err) {
      setPatients([]);
    }
  }

  function handleModalOverlayClick(event, closeHandler) {
    if (event.target === event.currentTarget) {
      closeHandler();
    }
  }

  function openPatientDetails(patient) {
    navigate(`/receptionistPatientProfile?patientId=${patient.infoId}`);
  }

  function openEditPatient(patient, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setEditPatient({
      ...patient,
      fullName: [patient.firstName, patient.middleName, patient.lastName]
        .filter(Boolean)
        .join(' ')
        .trim(),
      address: patient.address || '',
      nationality: '',
      occupation: '',
      civilStatus: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      medicalConditions: '',
      allergies: '',
      medications: '',
      dentalHistory: '',
    });
    setEditModalReadOnly(true);
    setEditErrors({});
    setShowEditModal(true);
    hydrateEditPatientProfile(patient.infoId);
  }

  function closePatientDetails() {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  }

  function closeEditPatient() {
    setShowEditModal(false);
    setEditPatient(null);
    setEditModalReadOnly(true);
    setEditProfileLoading(false);
    setEditErrors({});
  }

  async function hydrateEditPatientProfile(patientId) {
    setEditProfileLoading(true);
    try {
      const profile = await getPatientProfile(patientId);
      if (!profile) return;

      const nameParts = splitFullName(profile.full_name || '');

      setEditPatient((current) => ({
        ...(current || {}),
        infoId: patientId,
        fullName: profile.full_name || current?.fullName || '',
        email: profile.email || current?.email || '',
        contactNumber: profile.contact_number || current?.contactNumber || '',
        address: profile.address || current?.address || '',
        dateOfBirth: profile.birthday || current?.dateOfBirth || '',
        age: profile.age || calculateAge(profile.birthday) || current?.age || '',
        gender: profile.sex || current?.gender || '',
        lastName: current?.lastName || nameParts.lastName || '',
        firstName: current?.firstName || nameParts.firstName || '',
        middleName: current?.middleName || nameParts.middleName || '',
        nationality: profile.nationality || '',
        occupation: profile.occupation || '',
        civilStatus: profile.civil_status || '',
        emergencyContactName: profile.emergency_contact_name || '',
        emergencyContactNumber: profile.emergency_contact_number || '',
        medicalConditions: profile.medical_conditions || '',
        allergies: profile.allergies || '',
        medications: profile.medications || '',
        dentalHistory: profile.dental_history || '',
      }));
    } catch {
      // Keep fallback list data in the edit modal when profile fetch fails.
    } finally {
      setEditProfileLoading(false);
    }
  }

  function handleEditChange(field, value) {
    let sanitized = value;

    if (['firstName', 'middleName', 'lastName'].includes(field)) {
      sanitized = String(value || '').replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '');
    }

    if (['occupation', 'emergencyContactName'].includes(field)) {
      sanitized = String(value || '').replace(/[0-9]/g, '');
    }

    if (field === 'contactNumber' || field === 'emergencyContactNumber') {
      const digitsOnly = String(value || '').replace(/[^0-9]/g, '');
      sanitized = String(value || '').startsWith('+') ? `+${digitsOnly}` : digitsOnly;
      const maxLen = sanitized.startsWith('+') ? 13 : 11;
      sanitized = sanitized.slice(0, maxLen);
    }

    setEditPatient((current) => ({
      ...current,
      [field]: sanitized,
      age: field === 'dateOfBirth' ? calculateAge(sanitized) : current.age,
    }));

    setEditErrors((current) => ({ ...current, [field]: '' }));
  }

  async function savePatientChanges(event) {
    event.preventDefault();

    if (!editPatient || editModalReadOnly) {
      return;
    }

    const requiredFieldChecks = [
      ['firstName', editPatient.firstName],
      ['lastName', editPatient.lastName],
      ['dateOfBirth', editPatient.dateOfBirth],
      ['gender', editPatient.gender],
      ['address', editPatient.address],
      ['nationality', editPatient.nationality],
      ['occupation', editPatient.occupation],
      ['civilStatus', editPatient.civilStatus],
      ['contactNumber', editPatient.contactNumber],
      ['email', editPatient.email],
    ];
    const nextErrors = {};

    requiredFieldChecks.forEach(([key, value]) => {
      if (!String(value || '').trim()) {
        nextErrors[key] = 'This field is required.';
      }
    });

    if (editPatient.dateOfBirth) {
      const dobDate = new Date(editPatient.dateOfBirth);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (Number.isNaN(dobDate.getTime()) || dobDate > todayDate) {
        nextErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    if (editPatient.contactNumber && !PH_PHONE_REGEX.test(String(editPatient.contactNumber).trim())) {
      nextErrors.contactNumber = 'Use 09XXXXXXXXX or +639XXXXXXXXX format.';
    }

    if (editPatient.emergencyContactNumber) {
      const emergencyNumber = String(editPatient.emergencyContactNumber).trim();
      if (!PH_PHONE_REGEX.test(emergencyNumber)) {
        nextErrors.emergencyContactNumber = 'Use 09XXXXXXXXX or +639XXXXXXXXX format.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
      return;
    }

    try {
      const fullName = [editPatient.firstName, editPatient.middleName, editPatient.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const saved = await updateStaffPatientProfile(editPatient.infoId, {
        full_name: fullName,
        email: editPatient.email,
        contact_number: editPatient.contactNumber,
        birthday: editPatient.dateOfBirth,
        age: calculateAge(editPatient.dateOfBirth) || editPatient.age,
        sex: editPatient.gender,
        address: editPatient.address || 'Not provided',
        nationality: editPatient.nationality || '',
        occupation: editPatient.occupation || '',
        civil_status: editPatient.civilStatus || '',
        emergency_contact_name: editPatient.emergencyContactName || '',
        emergency_contact_number: editPatient.emergencyContactNumber || '',
        medical_conditions: editPatient.medicalConditions || '',
        allergies: editPatient.allergies || '',
        medications: editPatient.medications || '',
        dental_history: editPatient.dentalHistory || '',
      });

      const [normalized] = normalizePatients([saved]);

      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          String(patient.infoId) === String(editPatient.infoId)
            ? normalized
            : patient
        )
      );

      if (selectedPatient && String(selectedPatient.infoId) === String(editPatient.infoId)) {
        setSelectedPatient(normalized);
      }

      closeEditPatient();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to save patient record.');
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/receptionist" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/receptionistAppointments" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link
            to="/receptionistRecords"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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

          <Link to="/receptionistPatientAcc" style={styles.menuItem}>
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
          <section style={styles.patientHero}>
            <div>
              <span style={styles.heroBadge}>Patient Records</span>

              <h2 style={styles.heroTitle}>
                View and update patient information records.
              </h2>

              <p style={styles.heroText}>
                Search patient profiles, review personal details, and update
                patient contact information.
              </p>
            </div>

            {!isVerySmall && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-clipboard-user"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.dashboardCard}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Patient List</h3>
              </div>
            </div>

            <div style={styles.filters}>
              <div style={styles.searchBox}>
                <i className="fi fi-rr-search" style={styles.searchIcon}></i>

                <input
                  type="text"
                  placeholder="Search patient name"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <select
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                style={styles.genderFilter}
              >
                <option value="all">All Patients</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.patientTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Patient ID</th>
                    <th style={styles.th}>Last Name</th>
                    <th style={styles.th}>First Name</th>
                    <th style={styles.th}>Middle Name</th>
                    <th style={styles.th}>Age</th>
                    <th style={styles.th}>Gender</th>
                    <th style={{ ...styles.th, ...styles.actionTh }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyCell}>
                        No matching patients found.
                      </td>
                    </tr>
                  ) : (
                    pagedPatients.map((patient) => (
                      <tr key={patient.id} style={styles.tr}>
                        <td style={styles.td}>{patient.id}</td>
                        <td style={styles.td}>{patient.lastName || '-'}</td>
                        <td style={styles.td}>{patient.firstName || '-'}</td>
                        <td style={styles.td}>{patient.middleName || '-'}</td>
                        <td style={styles.td}>{patient.age || '-'}</td>
                        <td style={styles.td}>
                          <span style={styles.genderBadge}>
                            {patient.gender || '-'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, ...styles.actionTd }}>
                          <div style={styles.btnGroup}>
                            <button
                              type="button"
                              style={{ ...styles.actionBtn, ...styles.viewBtn }}
                              onClick={() => openPatientDetails(patient)}
                              title="View Patient"
                            >
                              <i className="fi fi-rr-eye"></i>
                            </button>

                            <button
                              type="button"
                              style={{ ...styles.actionBtn, ...styles.editBtn }}
                              onClick={(event) => openEditPatient(patient, event)}
                              title="Edit Patient"
                            >
                              <i className="fi fi-rr-edit"></i>
                            </button>
                          </div>
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

      {showDetailsModal && selectedPatient && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closePatientDetails)}
        >
          <div style={{ ...styles.modalContent, ...styles.largeModal }}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalHeaderTitle}>Patient Details</h2>
                <p style={styles.modalHeaderText}>
                  Review complete patient profile information.
                </p>
              </div>

              <button
                type="button"
                style={styles.modalX}
                onClick={closePatientDetails}
              >
                ×
              </button>
            </div>

            <div style={styles.detailsGrid}>
              <DetailBox
                styles={styles}
                label="Patient ID"
                value={selectedPatient.id}
              />

              <DetailBox
                styles={styles}
                label="Email"
                value={selectedPatient.email}
              />

              <DetailBox
                styles={styles}
                label="Contact Number"
                value={selectedPatient.contactNumber}
              />

              <DetailBox
                styles={styles}
                label="Last Name"
                value={selectedPatient.lastName}
              />

              <DetailBox
                styles={styles}
                label="First Name"
                value={selectedPatient.firstName}
              />

              <DetailBox
                styles={styles}
                label="Middle Name"
                value={selectedPatient.middleName}
              />

              <DetailBox
                styles={styles}
                label="Date of Birth"
                value={selectedPatient.dateOfBirth}
              />

              <DetailBox
                styles={styles}
                label="Age"
                value={selectedPatient.age}
              />

              <DetailBox
                styles={styles}
                label="Gender"
                value={selectedPatient.gender}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelModalBtn}
                onClick={closePatientDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editPatient && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeEditPatient)}
        >
          <form
            style={{ ...styles.modalContent, ...styles.largeModal }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={savePatientChanges}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalHeaderTitle}>Edit Patient</h2>
                <p style={styles.modalHeaderText}>
                  Review patient profile details, then click Edit to enable fields.
                </p>
              </div>

              <button
                type="button"
                style={styles.modalX}
                onClick={closeEditPatient}
              >
                ×
              </button>
            </div>

            {editProfileLoading && (
              <p style={{ ...styles.modalHeaderText, marginTop: 0, marginBottom: 16 }}>
                Loading patient profile...
              </p>
            )}

            <div style={styles.formGrid}>
              <div style={styles.formSectionTitle}>Personal Information</div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Last Name</label>
                <input
                  type="text"
                  value={editPatient.lastName}
                  onChange={(event) =>
                    handleEditChange('lastName', event.target.value)
                  }
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.lastName ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.lastName && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.lastName}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>First Name</label>
                <input
                  type="text"
                  value={editPatient.firstName}
                  onChange={(event) =>
                    handleEditChange('firstName', event.target.value)
                  }
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.firstName ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.firstName && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.firstName}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Middle Name</label>
                <input
                  type="text"
                  value={editPatient.middleName}
                  onChange={(event) =>
                    handleEditChange('middleName', event.target.value)
                  }
                  readOnly={editModalReadOnly}
                  style={styles.fieldInput}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Date of Birth</label>
                <input
                  type="date"
                  value={editPatient.dateOfBirth}
                  onChange={(event) =>
                    handleEditChange('dateOfBirth', event.target.value)
                  }
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.dateOfBirth ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.dateOfBirth && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.dateOfBirth}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Email</label>
                <input
                  type="email"
                  value={editPatient.email}
                  onChange={(event) =>
                    handleEditChange('email', event.target.value)
                  }
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.email ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.email && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.email}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Contact Number</label>
                <input
                  type="tel"
                  value={editPatient.contactNumber}
                  onChange={(event) =>
                    handleEditChange('contactNumber', event.target.value)
                  }
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.contactNumber ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.contactNumber && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.contactNumber}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Age</label>
                <input
                  type="text"
                  value={editPatient.age}
                  readOnly
                  style={styles.fieldInput}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Gender</label>
                <select
                  value={editPatient.gender}
                  onChange={(event) =>
                    handleEditChange('gender', event.target.value)
                  }
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.gender ? { borderColor: '#dc2626' } : {}),
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {editErrors.gender && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.gender}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Address</label>
                <input
                  type="text"
                  value={editPatient.address || ''}
                  onChange={(event) => handleEditChange('address', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.address ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.address && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.address}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Nationality</label>
                <select
                  value={editPatient.nationality || ''}
                  onChange={(event) => handleEditChange('nationality', event.target.value)}
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.nationality ? { borderColor: '#dc2626' } : {}),
                  }}
                >
                  <option value="">Select Nationality</option>
                  {NATIONALITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {editErrors.nationality && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.nationality}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Occupation</label>
                <input
                  type="text"
                  value={editPatient.occupation || ''}
                  onChange={(event) => handleEditChange('occupation', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.occupation ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.occupation && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.occupation}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Civil Status</label>
                <select
                  value={editPatient.civilStatus || ''}
                  onChange={(event) => handleEditChange('civilStatus', event.target.value)}
                  disabled={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.civilStatus ? { borderColor: '#dc2626' } : {}),
                  }}
                >
                  <option value="">Select Civil Status</option>
                  {CIVIL_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {editErrors.civilStatus && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.civilStatus}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Emergency Contact Name</label>
                <input
                  type="text"
                  value={editPatient.emergencyContactName || ''}
                  onChange={(event) => handleEditChange('emergencyContactName', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={styles.fieldInput}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Emergency Contact Number</label>
                <input
                  type="text"
                  value={editPatient.emergencyContactNumber || ''}
                  onChange={(event) => handleEditChange('emergencyContactNumber', event.target.value)}
                  maxLength={13}
                  readOnly={editModalReadOnly}
                  style={{
                    ...styles.fieldInput,
                    ...(editErrors.emergencyContactNumber ? { borderColor: '#dc2626' } : {}),
                  }}
                />
                {editErrors.emergencyContactNumber && (
                  <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: 12 }}>
                    {editErrors.emergencyContactNumber}
                  </p>
                )}
              </div>

              <div style={styles.formSectionTitle}>Medical Assessment</div>

              <div style={{ ...styles.field, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                <label style={styles.fieldLabel}>Dental History (Medical Assessment)</label>
                <textarea
                  value={editPatient.dentalHistory || ''}
                  onChange={(event) => handleEditChange('dentalHistory', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={{ ...styles.fieldInput, height: 96, padding: '10px 12px' }}
                />
              </div>

              <div style={styles.formSectionTitle}>Health Condition</div>

              <div style={{ ...styles.field, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                <label style={styles.fieldLabel}>Medical Conditions (Health Condition)</label>
                <textarea
                  value={editPatient.medicalConditions || ''}
                  onChange={(event) => handleEditChange('medicalConditions', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={{ ...styles.fieldInput, height: 96, padding: '10px 12px' }}
                />
              </div>

              <div style={{ ...styles.field, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                <label style={styles.fieldLabel}>Allergies</label>
                <textarea
                  value={editPatient.allergies || ''}
                  onChange={(event) => handleEditChange('allergies', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={{ ...styles.fieldInput, height: 96, padding: '10px 12px' }}
                />
              </div>

              <div style={{ ...styles.field, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                <label style={styles.fieldLabel}>Medications</label>
                <textarea
                  value={editPatient.medications || ''}
                  onChange={(event) => handleEditChange('medications', event.target.value)}
                  readOnly={editModalReadOnly}
                  style={{ ...styles.fieldInput, height: 96, padding: '10px 12px' }}
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              {editModalReadOnly ? (
                <>
                  <button
                    type="button"
                    style={styles.cancelModalBtn}
                    onClick={closeEditPatient}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    style={styles.saveBtn}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setEditModalReadOnly(false);
                    }}
                    disabled={editProfileLoading}
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    style={styles.cancelModalBtn}
                    onClick={() => setEditModalReadOnly(true)}
                  >
                    Cancel
                  </button>

                  <button type="submit" style={styles.saveBtn}>
                    Save
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {showLogoutModal && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeLogoutModal)}
        >
          <div style={{ ...styles.modalContent, ...styles.smallModal }}>
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Logout</h2>
            <p style={styles.modalText}>Are you sure you want to log out?</p>

            <div style={{ ...styles.modalActions, ...styles.centerActions }}>
              <button
                type="button"
                style={styles.logoutBtn}
                onClick={handleLogout}
              >
                Logout
              </button>

              <button
                type="button"
                style={styles.cancelModalBtn}
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
        <i className="fi fi-rr-angle-left"></i>
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
        <i className="fi fi-rr-angle-right"></i>
      </button>
    </div>
  );
}

function DetailBox({ styles, label, value }) {
  return (
    <div style={styles.detailBox}>
      <label style={styles.detailLabel}>{label}</label>
      <p style={styles.detailValue}>{value || '-'}</p>
    </div>
  );
}

function normalizePatients(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const dateOfBirth =
      item.dateOfBirth || item.dob || item.birthDate || item.birthday || '';

    const age = item.age || calculateAge(dateOfBirth) || '';
    const fullName = item.full_name || item.name || '';
    const nameParts = splitFullName(fullName);

    return {
      id: item.id || item.user_id ? `P${item.id || item.user_id}` : item.patientId || item.userId || index + 1,
      infoId: item.infoId || item.userInfoId || item.id || item.user_id || index + 1,
      fullName: item.full_name || item.name || '',
      email: item.email || '',
      contactNumber: item.contact_number || item.contactNumber || '',
      address: item.address || '',
      lastName: item.lastName || item.last_name || nameParts.lastName,
      firstName: item.firstName || item.first_name || nameParts.firstName,
      middleName: item.middleName || item.middle_name || nameParts.middleName,
      dateOfBirth,
      age,
      gender: item.gender || item.sex || '',
      nationality: item.nationality || '',
      occupation: item.occupation || '',
      civilStatus: item.civil_status || item.civilStatus || '',
      emergencyContactName:
        item.emergency_contact_name || item.emergencyContactName || '',
      emergencyContactNumber:
        item.emergency_contact_number || item.emergencyContactNumber || '',
      medicalConditions: item.medical_conditions || item.medicalConditions || '',
      allergies: item.allergies || '',
      medications: item.medications || '',
      dentalHistory: item.dental_history || item.dentalHistory || '',
    };
  });
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function calculateAge(dateValue) {
  if (!dateValue) {
    return '';
  }

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : '';
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

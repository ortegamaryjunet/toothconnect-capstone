import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import api from '../api/axios';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createDentistProfileStyles from '../styles/DentistProfile';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';

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

export default function DentistProfile() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState(initialProfile);
  const [profileId, setProfileId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [previousWork, setPreviousWork] = useState([]);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [workForm, setWorkForm] = useState({
    company_name: '',
    position: '',
    start_month: '',
    end_month: '',
    reason_for_leaving: '',
  });
  const [savingWork, setSavingWork] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

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

  const displaySuffix = String(profile.suffix || '').trim() || 'N/A';

  const avatarLetter =
    String(profile.fullName || 'D').trim().charAt(0).toUpperCase() || 'D';

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

  function loadPreviousWork() {
    api
      .get('/auth/staff-profile/me/previous-work')
      .then((res) => setPreviousWork(res.data.previousWork || []))
      .catch(() => {});
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
    if (showLogoutModal || showEditModal || showWorkModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showEditModal, showWorkModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeEditModal();
        closeWorkModal();
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

  function openWorkModal() {
    setWorkForm({
      company_name: '',
      position: '',
      start_month: '',
      end_month: '',
      reason_for_leaving: '',
    });
    setShowWorkModal(true);
  }

  function closeWorkModal() {
    setShowWorkModal(false);
  }

  function handleWorkOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeWorkModal();
    }
  }

  async function handleAddWork(event) {
    event.preventDefault();

    if (!workForm.company_name.trim()) {
      return;
    }

    setSavingWork(true);

    try {
      await api.post('/auth/staff-profile/me/previous-work', {
        company_name: workForm.company_name.trim(),
        position: workForm.position.trim() || null,
        start_month: workForm.start_month || null,
        end_month: workForm.end_month || null,
        reason_for_leaving: workForm.reason_for_leaving.trim() || null,
      });

      loadPreviousWork();
      closeWorkModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save work history.');
    } finally {
      setSavingWork(false);
    }
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
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    const nextProfile = {
      ...editForm,
      suffix: String(editForm.suffix || '').trim(),
    };

    setSavingProfile(true);
    setProfileError('');

    try {
      const res = await api.patch(
        '/auth/staff-profile/me',
        dentistProfileToStaffPayload(nextProfile)
      );

      const mappedProfile = staffProfileToDentistProfile(res.data.profile);

      setProfileId(res.data.profile.profileId || profileId);
      setProfile(mappedProfile);
      setEditForm(mappedProfile);
      setShowEditModal(false);
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Failed to save dentist profile.'
      );
      alert(err.response?.data?.message || 'Failed to save dentist profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  function exportProfileToPDF() {
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

    const previousWorkRows =
      previousWork.length === 0
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
            <div style={styles.doctorProfile}>
              <div style={styles.avatarSmall}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.doctorInfo}>
                <div style={styles.doctorName}>
                  {loadingProfile ? '...' : profile.fullName}
                </div>
                <div style={styles.doctorSpecialization}>
                  {loadingProfile ? '...' : profile.specialization}
                </div>
              </div>
            </div>
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
                    <p style={styles.profileSubtext}>Dentist Profile</p>
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
                    <i className="fi fi-rr-file-pdf" style={styles.pdfBtnIcon}></i>
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

                <div style={{ ...styles.card, ...styles.fullCard }}>
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

                  <div
                    style={{
                      ...styles.subTitle,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    Previous Work

                    <button
                      type="button"
                      onClick={openWorkModal}
                      style={{
                        fontSize: 13,
                        padding: '6px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#b8860b',
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      + Add
                    </button>
                  </div>

                  {previousWork.length === 0 ? (
                    <div style={styles.emptyBox}>No previous work found.</div>
                  ) : (
                    previousWork.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '14px 16px',
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: '#0f172a',
                              fontFamily: 'Arial, sans-serif',
                            }}
                          >
                            {entry.company_name}
                          </div>

                          {entry.position && (
                            <div
                              style={{
                                fontSize: 13,
                                color: '#475569',
                                marginTop: 2,
                                fontFamily: 'Arial, sans-serif',
                              }}
                            >
                              {entry.position}
                            </div>
                          )}

                          {(entry.start_month || entry.end_month) && (
                            <div
                              style={{
                                fontSize: 13,
                                color: '#64748b',
                                marginTop: 2,
                                fontFamily: 'Arial, sans-serif',
                              }}
                            >
                              {formatWorkMonth(entry.start_month)}
                              {entry.end_month
                                ? ` - ${formatWorkMonth(entry.end_month)}`
                                : ' - Present'}
                            </div>
                          )}

                          {entry.reason_for_leaving && (
                            <div
                              style={{
                                fontSize: 12,
                                color: '#94a3b8',
                                marginTop: 4,
                                fontFamily: 'Arial, sans-serif',
                              }}
                            >
                              Reason: {entry.reason_for_leaving}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteWork(entry.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: 16,
                            padding: 4,
                          }}
                          title="Remove"
                        >
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      </div>
                    ))
                  )}
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
              <h2 style={styles.editModalTitle}>Edit Dentist Profile</h2>

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

      {showWorkModal && (
        <div style={styles.editOverlay} onClick={handleWorkOverlayClick}>
          <div style={{ ...styles.editModalBox, maxWidth: 520 }}>
            <div style={styles.editModalHeader}>
              <h2 style={styles.editModalTitle}>Add Work History</h2>

              <button
                type="button"
                style={styles.modalClose}
                onClick={closeWorkModal}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <form style={styles.editForm} onSubmit={handleAddWork}>
              <div style={styles.formGrid}>
                <FormGroup styles={styles} label="Company Name *" full>
                  <input
                    type="text"
                    value={workForm.company_name}
                    onChange={(event) =>
                      setWorkForm((form) => ({
                        ...form,
                        company_name: event.target.value,
                      }))
                    }
                    style={styles.formInput}
                    required
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Position">
                  <input
                    type="text"
                    value={workForm.position}
                    onChange={(event) =>
                      setWorkForm((form) => ({
                        ...form,
                        position: event.target.value,
                      }))
                    }
                    style={styles.formInput}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Start Month">
                  <input
                    type="month"
                    value={workForm.start_month}
                    onChange={(event) =>
                      setWorkForm((form) => ({
                        ...form,
                        start_month: event.target.value,
                      }))
                    }
                    style={styles.formInput}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="End Month">
                  <input
                    type="month"
                    value={workForm.end_month}
                    onChange={(event) =>
                      setWorkForm((form) => ({
                        ...form,
                        end_month: event.target.value,
                      }))
                    }
                    style={styles.formInput}
                  />
                </FormGroup>

                <FormGroup styles={styles} label="Reason for Leaving" full>
                  <input
                    type="text"
                    value={workForm.reason_for_leaving}
                    onChange={(event) =>
                      setWorkForm((form) => ({
                        ...form,
                        reason_for_leaving: event.target.value,
                      }))
                    }
                    style={styles.formInput}
                  />
                </FormGroup>
              </div>

              <div style={styles.editModalActions}>
                <button
                  type="submit"
                  style={{
                    ...styles.saveBtn,
                    ...(savingWork ? styles.disabledBtn : {}),
                  }}
                  disabled={savingWork}
                >
                  {savingWork ? 'Saving...' : 'Save'}
                </button>

                <button
                  type="button"
                  style={styles.cancelEditBtn}
                  onClick={closeWorkModal}
                  disabled={savingWork}
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

    specialization:
      staffProfile.serviceNames ||
      staffProfile.specialization ||
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
  };
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

function FormGroup({ styles, label, children, full = false }) {
  return (
    <div style={{ ...styles.formGroup, ...(full ? styles.formGroupFull : {}) }}>
      <label style={styles.formLabel}>{label}</label>
      {children}
    </div>
  );
}
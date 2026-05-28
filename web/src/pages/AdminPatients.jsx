import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';

import { listPatients } from '../api/patients';
import { useAuth } from '../auth/AuthContext';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createAdminPatientsStyles from '../styles/AdminPatients';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

export default function AdminPatients() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState('');

  const rowsPerPage = 10;

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminPatientsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  useEffect(() => {
    async function loadPatients() {
      setLoadingPatients(true);
      setPatientsError('');

      try {
        const rows = await listPatients();
        setPatients(rows.map(mapPatientRow));
      } catch (err) {
        setPatientsError(
          err.response?.data?.message || 'Failed to load patients.'
        );
      } finally {
        setLoadingPatients(false);
      }
    }

    loadPatients();
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
    document.body.style.overflow =
      showLogoutModal || showExportModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showExportModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        setShowExportModal(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const search = searchValue.toLowerCase().trim();

      const patientId = String(patient.id).toLowerCase();
      const lastName = String(patient.lastName).toLowerCase();
      const firstName = String(patient.firstName).toLowerCase();
      const middleName = String(patient.middleName).toLowerCase();
      const gender = String(patient.gender).toLowerCase();

      const fullName = `${lastName} ${firstName} ${middleName}`;

      const matchesSearch =
        patientId.includes(search) ||
        fullName.includes(search) ||
        firstName.includes(search) ||
        middleName.includes(search) ||
        lastName.includes(search);

      const matchesGender =
        genderFilter === 'all' || gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchValue, genderFilter]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredPatients.slice(start, end);
  }, [filteredPatients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, genderFilter]);

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

  function handleExportModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setShowExportModal(false);
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  function exportPatientsToCSV() {
    if (filteredPatients.length === 0) {
      setShowExportModal(true);
      return;
    }

    const headers = [
      'Patient ID',
      'Last Name',
      'First Name',
      'Middle Name',
      'Age',
      'Gender',
    ];

    const rows = filteredPatients.map((patient) => [
      patient.id,
      patient.lastName,
      patient.firstName,
      patient.middleName,
      patient.age,
      patient.gender,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(formatCSVValue).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'patient_records.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function exportPatientToPDF(patient) {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Smile Empress Dental Hub', 20, 20);

    doc.setFontSize(14);
    doc.text('Patient Record', 20, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 20, 42);

    doc.setLineWidth(0.3);
    doc.line(20, 48, 190, 48);

    const patientDetails = [
      ['Patient ID', patient.id],
      ['Last Name', patient.lastName],
      ['First Name', patient.firstName],
      ['Middle Name', patient.middleName || 'N/A'],
      ['Age', patient.age || 'N/A'],
      ['Gender', patient.gender || 'N/A'],
    ];

    let yPosition = 62;

    patientDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, yPosition);

      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 65, yPosition);

      yPosition += 10;
    });

    doc.save(`${patient.id}_patient_record.pdf`);
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link
            to="/adminPatients"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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

          <Link to="/adminSettings" style={styles.menuItem}>
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
            <div style={styles.adminProfile}>
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.adminInfo}>
                <div style={styles.adminName}>{adminName}</div>
                <div style={styles.adminPosition}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Patient Records</span>

              <h2 style={styles.heroTitle}>
                Organize and manage patient information, appointments, and
                treatment records.
              </h2>

              <p style={styles.heroText}>
                View patient profiles, monitor appointments, update treatment
                history, and manage clinic records.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i
                className="fi fi-rr-clipboard-user"
                style={styles.heroIcon}
              ></i>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search patient name or ID"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.rightActions}>
              <select
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                style={styles.genderFilter}
              >
                <option value="all">All Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Patient List</h3>

              <button
                type="button"
                style={styles.exportBtn}
                onClick={exportPatientsToCSV}
              >
                <i
                  className="fi fi-rr-file-csv"
                  style={styles.exportIcon}
                ></i>
                CSV
              </button>
            </div>

            {patientsError && (
              <div style={styles.errorText}>{patientsError}</div>
            )}

            {loadingPatients && (
              <div style={styles.loadingText}>Loading patients...</div>
            )}

            <div style={styles.tableWrapper}>
              <table style={styles.patientTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Patient ID</th>
                    <th style={styles.tableHead}>Last Name</th>
                    <th style={styles.tableHead}>First Name</th>
                    <th style={styles.tableHead}>Middle Name</th>
                    <th style={styles.tableHead}>Age</th>
                    <th style={styles.tableHead}>Gender</th>
                    <th style={styles.tableHead}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        No patient records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <tr key={patient.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{patient.id}</td>
                        <td style={styles.tableCell}>{patient.lastName}</td>
                        <td style={styles.tableCell}>{patient.firstName}</td>
                        <td style={styles.tableCell}>{patient.middleName}</td>
                        <td style={styles.tableCell}>{patient.age}</td>
                        <td style={styles.tableCell}>{patient.gender}</td>

                        <td style={styles.tableCell}>
                          <div style={styles.actionGroup}>
                            <Link
                              to={`/adminPatients/${patient.userId}`}
                              style={styles.viewBtn}
                              title="View patient profile"
                            >
                              View
                            </Link>

                            <button
                              type="button"
                              style={styles.pdfBtn}
                              title="Export patient as PDF"
                              onClick={() => exportPatientToPDF(patient)}
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
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
                {filteredPatients.length === 0
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
        </main>
      </div>

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

      {showExportModal && (
        <div
          style={styles.exportModalOverlay}
          onClick={handleExportModalOverlayClick}
        >
          <div style={styles.exportModalContent}>
            <h2 style={styles.exportModalTitle}>No Patient Records</h2>

            <div style={styles.exportModalDivider}></div>

            <p style={styles.exportModalText}>
              No patient records available to export.
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
    </div>
  );
}

function formatCSVValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: '', middleName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  }

  return {
    firstName: parts[0],
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts[parts.length - 1],
  };
}

function mapPatientRow(row) {
  const fullName = row.full_name || row.fullName || row.name || '';
  const nameParts = splitName(fullName);

  const firstName = row.first_name || row.firstName || nameParts.firstName;
  const middleName = row.middle_name || row.middleName || nameParts.middleName;
  const lastName = row.last_name || row.lastName || nameParts.lastName;
  const userId = row.user_id || row.userId || row.id;

  return {
    id: `P-${String(row.id).padStart(4, '0')}`,
    userId,
    lastName,
    firstName,
    middleName,
    age: row.age || '',
    gender: row.gender || '',
  };
}
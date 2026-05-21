import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { listPatients } from '../api/patients';
import { useAuth } from '../auth/AuthContext';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createAdminPatientsStyles from '../styles/AdminPatients';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

export default function AdminPatients() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        setPatientsError(err.response?.data?.message || 'Failed to load patients.');
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
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
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

      const matchesGender = genderFilter === 'all' || gender === genderFilter;

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

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i className="fi fi-rr-apps" style={styles.menuItemIcon}></i>
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
            </div>

            {patientsError && (
              <div style={{ color: '#b91c1c', padding: '0 0 12px' }}>
                {patientsError}
              </div>
            )}

            {loadingPatients && (
              <div style={{ color: '#64748b', padding: '0 0 12px' }}>
                Loading patients...
              </div>
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
                          <Link
                            to={`/adminPatients/${patient.userId}`}
                            style={styles.viewBtn}
                            title="View patient profile"
                          >
                            View
                          </Link>
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
    </div>
  );
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
  const nameParts = splitName(row.name);

  return {
    id: `P-${String(row.id).padStart(4, '0')}`,
    userId: row.id,
    lastName: nameParts.lastName,
    firstName: nameParts.firstName,
    middleName: nameParts.middleName,
    age: row.age || '',
    gender: row.gender || '',
  };
}

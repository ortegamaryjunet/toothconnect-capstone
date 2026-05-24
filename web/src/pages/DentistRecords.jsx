import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { listMyPatients } from '../api/patients';
import createDentistRecordsStyles from '../styles/DentistRecords';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';

const rowsPerPage = 10;

export default function DentistRecords() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [serviceNames, setServiceNames] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('most-recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState('');

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistRecordsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  useEffect(() => {
    api.get('/auth/staff-profile/me')
      .then(res => setServiceNames(res.data.profile?.serviceNames || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchPatients() {
      setPatientsLoading(true);
      setPatientsError('');

      try {
        const data = await listMyPatients();
        setPatients(normalizePatients(data));
      } catch (err) {
        setPatientsError(
          err.response?.data?.message || 'Failed to load patients.'
        );
      } finally {
        setPatientsLoading(false);
      }
    }

    fetchPatients();
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
    const search = searchValue.toLowerCase().trim();

    const filtered = patients.filter((patient) => {
      const name = String(patient.name || '').toLowerCase();
      const lastVisit = String(patient.lastVisit || '');

      const matchesSearch = name.includes(search);
      const matchesDate = !dateFilter || lastVisit.startsWith(dateFilter);

      return matchesSearch && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      const aName = String(a.name || '').toLowerCase();
      const bName = String(b.name || '').toLowerCase();

      if (nameFilter === 'a-z') {
        return aName.localeCompare(bName);
      }

      if (nameFilter === 'z-a') {
        return bName.localeCompare(aName);
      }

      const aDate = new Date(a.lastVisit || '1900-01-01').getTime();
      const bDate = new Date(b.lastVisit || '1900-01-01').getTime();

      return bDate - aDate;
    });
  }, [patients, searchValue, dateFilter, nameFilter]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredPatients.slice(start, end);
  }, [filteredPatients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, dateFilter, nameFilter]);

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

  function handleSearchChange(value) {
    const lettersOnly = value.replace(/[^a-zA-ZñÑ\s]/g, '');
    setSearchValue(lettersOnly);
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
          <Link to="/dentist" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/dentistAppointment" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link
            to="/dentistRecords"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/dentistProfile" style={styles.menuItem}>
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
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.doctorInfo}>
                <div style={styles.doctorName}>{user?.name || 'Dentist'}</div>
                <div style={styles.doctorSpecialization}>{serviceNames || 'Dentist'}</div>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Patient Records</span>

              <h2 style={styles.heroTitle}>
                Review your patients and track their treatment progress
              </h2>

              <p style={styles.heroText}>
                Search, filter, and view patient visit details assigned to your
                care.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i
                className="fi fi-rr-clipboard-user"
                style={styles.heroIconText}
              ></i>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search patient name"
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                style={styles.filterInput}
              />

              <select
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
                style={styles.filterSelect}
              >
                <option value="most-recent">Most Recent</option>
                <option value="a-z">Name A-Z</option>
                <option value="z-a">Name Z-A</option>
              </select>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <div>
                <h3 style={styles.tableTitle}>Patient List</h3>
              </div>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.patientTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Patient No</th>
                    <th style={styles.tableHead}>Full Name</th>
                    <th style={styles.tableHead}>Contact</th>
                    <th style={styles.tableHead}>Email</th>
                    <th style={styles.tableHead}>Last Visit</th>
                    <th style={styles.tableHead}>Visits</th>
                    <th style={styles.tableHead}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {patientsLoading ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        Loading patients...
                      </td>
                    </tr>
                  ) : patientsError ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        {patientsError}
                      </td>
                    </tr>
                  ) : paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        No patient found.
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <tr key={patient.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          {formatPatientNo(patient.id)}
                        </td>
                        <td style={styles.tableCell}>{patient.name}</td>
                        <td style={styles.tableCell}>{patient.contactNumber || '—'}</td>
                        <td style={styles.tableCell}>{patient.email || '—'}</td>
                        <td style={styles.tableCell}>
                          {patient.lastVisit
                            ? patient.lastVisit.slice(0, 10)
                            : '—'}
                        </td>
                        <td style={styles.tableCell}>
                          {patient.totalAppointments}
                        </td>
                        <td style={styles.tableCell}>
                          <Link
                            to={`/dentistRecords/${patient.id}`}
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

function normalizePatients(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.id,
    name: item.name || 'Unknown',
    email: item.email || '',
    contactNumber: item.phone || item.contact_number || '',
    lastVisit: item.last_visit || '',
    totalAppointments: item.total_appointments || 0,
  }));
}

function formatPatientNo(id) {
  return `P-${String(id).padStart(4, '0')}`;
}
